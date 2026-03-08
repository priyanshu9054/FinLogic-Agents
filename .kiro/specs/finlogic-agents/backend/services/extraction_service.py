import json
import uuid
import base64
import asyncio
import re
import time
import logging
from decimal import Decimal
from datetime import datetime
from functools import partial
from config import GOOGLE_API_KEY, DYNAMO_STATEMENTS_TABLE, DYNAMO_INVOICES_TABLE
from database import dynamodb

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Free-tier models at 50% of stated RPM to stay safe under TPM too.
#
# Model                  Real RPM  Our cap  Real RPD  Our cap
# gemini-2.5-flash-lite    15        7       1000       500
# gemini-2.0-flash         15        7       1500       750
# gemini-2.5-flash         10        5        250       125
# gemini-2.5-pro            5        2        100        50
# ---------------------------------------------------------------------------
MODELS = [
    {"name": "gemini-2.5-flash-lite", "rpm_cap": 7, "rpd_cap": 500},
    {"name": "gemini-2.0-flash", "rpm_cap": 7, "rpd_cap": 750},
    {"name": "gemini-2.5-flash", "rpm_cap": 5, "rpd_cap": 125},
    {"name": "gemini-2.5-pro", "rpm_cap": 2, "rpd_cap": 50},
]

PDF_RENDER_DPI = 100  # 100 DPI = good OCR quality, ~55% fewer tokens vs 150


# ---------------------------------------------------------------------------
# DynamoDB requires Decimal for all numerics — floats are rejected by boto3.
# Round-tripping through JSON with parse_float=Decimal converts every nested
# float in one shot (transactions list, monthly_summary, match rates, etc.)
# ---------------------------------------------------------------------------


def _floats_to_decimals(obj: dict) -> dict:
    """Recursively convert all floats in a nested structure to Decimal."""
    return json.loads(json.dumps(obj), parse_float=Decimal)


# ---------------------------------------------------------------------------
# PDF text extraction  (no AI, no tokens)
# ---------------------------------------------------------------------------


def _extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Primary extraction path: pull raw text directly from the PDF using pdfplumber.
    Works perfectly for digital/typed bank statements and invoices.
    Returns empty string if the PDF is scanned/image-only.
    Requires: pip install pdfplumber
    """
    try:
        import pdfplumber, io

        text_pages = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                # extract_tables gives structured rows — better than raw text
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            if row:
                                text_pages.append("\t".join(cell or "" for cell in row))
                else:
                    text = page.extract_text()
                    if text:
                        text_pages.append(text)
        result = "\n".join(text_pages).strip()
        logger.info(
            f"pdfplumber extracted {len(result)} chars from {len(pdf.pages)} pages"
            if result
            else "pdfplumber: no text found (likely scanned PDF)"
        )
        return result
    except Exception as exc:
        logger.warning(f"pdfplumber extraction failed: {exc!r}")
        return ""


# ---------------------------------------------------------------------------
# PDF → image parts  (OCR fallback only)
# ---------------------------------------------------------------------------


def _pdf_to_image_parts(pdf_bytes: bytes) -> list:
    """
    Fallback: render pages to PNG for OCR via Gemini.
    Only called when pdfplumber finds no text (scanned/image PDF).
    Requires: pip install pymupdf
    """
    import fitz

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    scale = PDF_RENDER_DPI / 72
    mat = fitz.Matrix(scale, scale)
    parts = []
    for page in doc:
        pix = page.get_pixmap(matrix=mat)
        parts.append(
            types.Part.from_bytes(data=pix.tobytes("png"), mime_type="image/png")
        )
    doc.close()
    logger.info(
        f"Rendered PDF to {len(parts)} image(s) at {PDF_RENDER_DPI} DPI for OCR"
    )
    return parts


# ---------------------------------------------------------------------------
# Robust JSON extraction from model output
# ---------------------------------------------------------------------------


def _extract_json(text: str) -> dict:
    """
    Robustly pull valid JSON out of model output even when the model
    adds prose, truncates, or produces minor syntax errors.

    Strategy:
      1. Strip markdown fences
      2. Find the outermost { ... } or [ ... ] block
      3. Try direct parse
      4. If that fails, use json-repair to fix common issues
         (trailing commas, single quotes, truncated arrays)
      5. If result is a list, wrap it in a dict
      Requires: pip install json-repair
    """
    # Step 1 — strip fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    text = text.replace("```", "").strip()

    # Step 2 — find outermost JSON object or array
    start_obj = text.find("{")
    start_arr = text.find("[")
    end_obj = text.rfind("}")
    end_arr = text.rfind("]")

    # Determine if we have an object or array
    if start_arr != -1 and (start_obj == -1 or start_arr < start_obj):
        # Array comes first
        if end_arr != -1 and end_arr > start_arr:
            text = text[start_arr : end_arr + 1]
    elif start_obj != -1 and end_obj != -1 and end_obj > start_obj:
        # Object
        text = text[start_obj : end_obj + 1]

    # Step 3 — direct parse
    try:
        parsed = json.loads(text)
        # If it's a list, wrap it in a dict
        if isinstance(parsed, list):
            logger.info("Parsed result is a list, wrapping in dict")
            return {"items": parsed}
        return parsed
    except json.JSONDecodeError as e:
        logger.warning(
            f"Direct JSON parse failed at char {e.pos}: {e.msg} — trying repair"
        )

    # Step 4 — json-repair
    try:
        from json_repair import repair_json

        repaired = repair_json(text, return_objects=True)
        if isinstance(repaired, dict):
            logger.info("JSON repaired successfully")
            return repaired
        elif isinstance(repaired, list):
            logger.info("Repaired result is a list, wrapping in dict")
            return {"items": repaired}
        raise ValueError(f"Repaired result is not a dict or list: {type(repaired)}")
    except ImportError:
        logger.warning(
            "json-repair not installed (pip install json-repair) — attempting manual truncation fix"
        )

    # Step 5 — manual last-resort: truncate to last complete top-level value
    # Handles the common case of a truncated transactions array
    for cutpoint in range(len(text) - 1, 0, -1):
        if text[cutpoint] in ("]", "}"):
            candidate = text[: cutpoint + 1]
            # Balance braces
            opens = candidate.count("{") - candidate.count("}")
            if opens > 0:
                candidate += "}" * opens
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

    raise ValueError(f"Could not parse model output as JSON. Raw start: {text[:200]!r}")


# ---------------------------------------------------------------------------
# Model pool with RPM/RPD tracking and 429-aware fallback
# ---------------------------------------------------------------------------


def _parse_retry_delay(exc_repr: str) -> float:
    match = re.search(r"retryDelay['\"]?\s*:\s*['\"]?([\d.]+)s", exc_repr)
    return float(match.group(1)) + 1.0 if match else 60.0


class _ModelPool:
    def __init__(self, client: genai.Client):
        self._client = client
        self._rpm_calls: dict[str, list[float]] = {m["name"]: [] for m in MODELS}
        self._rpd_used: dict[str, int] = {m["name"]: 0 for m in MODELS}
        self._rpd_exhausted: set[str] = set()
        self._cfg = {m["name"]: m for m in MODELS}
        self._names = [m["name"] for m in MODELS]

    def _prune(self, name: str):
        now = time.monotonic()
        self._rpm_calls[name] = [t for t in self._rpm_calls[name] if now - t < 60]

    def _rpm_slots(self, name: str) -> int:
        self._prune(name)
        return max(0, self._cfg[name]["rpm_cap"] - len(self._rpm_calls[name]))

    def _seconds_until_rpm_slot(self, name: str) -> float:
        self._prune(name)
        cap = self._cfg[name]["rpm_cap"]
        window = sorted(self._rpm_calls[name])
        if len(window) < cap:
            return 0.0
        return max(0.0, 60.0 - (time.monotonic() - window[0])) + 0.5

    def _rpd_ok(self, name: str) -> bool:
        return (
            name not in self._rpd_exhausted
            and self._rpd_used[name] < self._cfg[name]["rpd_cap"]
        )

    def _mark_429(self, name: str, exc_repr: str):
        if any(s in exc_repr for s in ("limit: 0", "PerDay", "per_day", "RPD")):
            logger.warning(f"{name}: daily quota exhausted — skipping for session")
            self._rpd_exhausted.add(name)
        else:
            now = time.monotonic()
            self._rpm_calls[name] = [now] * self._cfg[name]["rpm_cap"]

    async def call(self, parts: list) -> str:
        loop = asyncio.get_event_loop()

        for _ in range(len(self._names) * 3):
            chosen = next(
                (n for n in self._names if self._rpd_ok(n) and self._rpm_slots(n) > 0),
                None,
            )

            if chosen is None:
                eligible = [n for n in self._names if self._rpd_ok(n)]
                if not eligible:
                    raise RuntimeError(
                        "All models have exhausted their daily free-tier quota. "
                        "Quota resets at midnight Pacific Time."
                    )
                wait = min(self._seconds_until_rpm_slot(n) for n in eligible)
                logger.info(f"RPM limit on all models — waiting {wait:.1f}s")
                await asyncio.sleep(wait)
                continue

            self._rpm_calls[chosen].append(time.monotonic())
            self._rpd_used[chosen] += 1
            logger.info(
                f"Calling {chosen} "
                f"(rpm {len(self._rpm_calls[chosen])}/{self._cfg[chosen]['rpm_cap']}, "
                f"rpd {self._rpd_used[chosen]}/{self._cfg[chosen]['rpd_cap']})"
            )

            try:
                response = await loop.run_in_executor(
                    None,
                    partial(
                        self._client.models.generate_content,
                        model=chosen,
                        contents=parts,
                    ),
                )
                return response.text

            except Exception as exc:
                exc_repr = repr(exc)
                logger.warning(f"Model {chosen} failed: {exc_repr}")
                if "429" in exc_repr or "RESOURCE_EXHAUSTED" in exc_repr:
                    retry_delay = _parse_retry_delay(exc_repr)
                    self._mark_429(chosen, exc_repr)
                    next_ok = any(self._rpd_ok(n) for n in self._names if n != chosen)
                    if not next_ok:
                        logger.info(f"Waiting {retry_delay:.1f}s as instructed by API")
                        await asyncio.sleep(retry_delay)
                    continue
                raise

        raise RuntimeError("Exhausted all retry attempts across all models")


# ---------------------------------------------------------------------------
# Extraction Service
# ---------------------------------------------------------------------------


class ExtractionService:
    def __init__(self):
        self._client = genai.Client(api_key=GOOGLE_API_KEY)
        self._pool = _ModelPool(self._client)
        self.statements_table = dynamodb.Table(DYNAMO_STATEMENTS_TABLE)
        self.invoices_table = dynamodb.Table(DYNAMO_INVOICES_TABLE)

    # ------------------------------------------------------------------
    # Public entry point — unchanged signature
    # ------------------------------------------------------------------

    async def extract_data(
        self,
        kirana_id: str,
        bank_statement_s3_key: str,
        bank_statement_content: bytes,
        invoice_s3_keys: list,
        invoice_contents: list,
    ):
        try:
            statement_data = await self._extract_bank_statement(bank_statement_content)

            invoices_data = []
            for invoice_content in invoice_contents:
                invoice_data = await self._extract_invoice(invoice_content)
                # Handle case where multiple invoices are in one PDF
                if isinstance(invoice_data, list):
                    # Multiple invoices returned as a list
                    invoices_data.extend(invoice_data)
                elif isinstance(invoice_data, dict) and "items" in invoice_data:
                    # List was wrapped in {"items": [...]} by _extract_json
                    invoices_data.extend(invoice_data["items"])
                else:
                    # Single invoice
                    invoices_data.append(invoice_data)

            verified_data = self._cross_verify(statement_data, invoices_data)

            statement_id = str(uuid.uuid4())
            await self._save_statement(
                statement_id,
                kirana_id,
                bank_statement_s3_key,
                invoice_s3_keys,
                verified_data,
            )
            for idx, invoice_data in enumerate(invoices_data):
                # Use the original s3_key for the first invoice from each file
                # For multiple invoices from same file, reuse the same s3_key
                s3_key_idx = min(idx, len(invoice_s3_keys) - 1)
                await self._save_invoice(
                    statement_id, kirana_id, invoice_s3_keys[s3_key_idx], invoice_data
                )

            return {
                "statement_id": statement_id,
                "extracted_summary": verified_data["monthly_summary"],
                "total_credits": verified_data["total_credits"],
                "total_debits": verified_data["total_debits"],
                "months_analyzed": verified_data["months_analyzed"],
                "invoice_match_rate": verified_data["invoice_match_rate"],
            }
        except Exception as e:
            logger.error(f"Extraction failed: {e!r}")
            raise

    # ------------------------------------------------------------------
    # Core extraction logic:
    #   1. Try pdfplumber text extraction (free, instant, perfect for digital PDFs)
    #   2. If no text found → render pages as images (scanned PDF fallback)
    #   3. Send text OR images to Gemini asking ONLY for JSON structuring
    # ------------------------------------------------------------------

    async def _build_parts_for_pdf(self, pdf_bytes: bytes) -> tuple[list, bool]:
        """
        Returns (parts_for_gemini, is_ocr_mode).
        Text mode: single text string part — much cheaper and more reliable.
        OCR mode: list of image parts — only for scanned PDFs.
        """
        loop = asyncio.get_event_loop()
        raw_text = await loop.run_in_executor(
            None, partial(_extract_text_from_pdf, pdf_bytes)
        )
        if raw_text and len(raw_text) > 100:  # sane minimum to confirm real text
            return [raw_text], False
        # Scanned PDF — fall back to image OCR
        image_parts = await loop.run_in_executor(
            None, partial(_pdf_to_image_parts, pdf_bytes)
        )
        return image_parts, True

    async def _extract_bank_statement(self, file_content: bytes) -> dict:
        parts, is_ocr = await self._build_parts_for_pdf(file_content)
        mode = "OCR (scanned PDF)" if is_ocr else "text extraction"
        logger.info(f"Bank statement extraction mode: {mode}")

        if is_ocr:
            prompt = "These are images of a bank statement. Read every transaction from all pages. "
        else:
            prompt = (
                "Below is the raw extracted text from a bank statement. "
                "Parse every transaction from this text. "
            )

        prompt += (
            "Return ONLY valid JSON with no prose or markdown:\n"
            '{"transactions":[{"date":"string","description":"string",'
            '"debit":number_or_null,"credit":number_or_null,"balance":number}],'
            '"monthly_summary":[{"month":"string","total_credits":number,'
            '"total_debits":number,"closing_balance":number}]}'
        )

        raw = await self._pool.call([prompt] + parts)
        return _extract_json(raw)

    async def _extract_invoice(self, file_content: bytes) -> dict:
        parts, is_ocr = await self._build_parts_for_pdf(file_content)
        mode = "OCR (scanned PDF)" if is_ocr else "text extraction"
        logger.info(f"Invoice extraction mode: {mode}")

        if is_ocr:
            prompt = "These are images of wholesaler invoice(s). Read all details from the images. "
        else:
            prompt = "Below is the raw extracted text from wholesaler invoice(s). Parse all details. "

        prompt += (
            "If there are multiple invoices, return them as an array. "
            "Return ONLY valid JSON with no prose or markdown:\n"
            '{"invoice_date":"string","vendor_name":"string","total_amount":number,'
            '"items":[{"description":"string","amount":number}]} '
            "OR for multiple invoices: "
            '[{"invoice_date":"string","vendor_name":"string","total_amount":number,'
            '"items":[{"description":"string","amount":number}]}, ...]'
        )

        raw = await self._pool.call([prompt] + parts)
        return _extract_json(raw)

    # ------------------------------------------------------------------
    # Cross-verification
    # ------------------------------------------------------------------

    def _cross_verify(self, statement_data: dict, invoices_data: list) -> dict:
        transactions = statement_data.get("transactions", [])
        monthly_summary = statement_data.get("monthly_summary", [])
        invoice_amounts = [inv["total_amount"] for inv in invoices_data]

        matched_count = 0
        for t in transactions:
            if t.get("debit"):
                t["verified_purchase"] = t["debit"] in invoice_amounts
                if t["verified_purchase"]:
                    matched_count += 1
            if t.get("credit"):
                t["assumed_sales"] = True

        total_debits_count = sum(1 for t in transactions if t.get("debit"))
        invoice_match_rate = (
            matched_count / total_debits_count * 100 if total_debits_count else 0
        )
        return {
            "transactions": transactions,
            "monthly_summary": monthly_summary,
            "total_credits": sum(t["credit"] for t in transactions if t.get("credit")),
            "total_debits": sum(t["debit"] for t in transactions if t.get("debit")),
            "months_analyzed": len(monthly_summary),
            "invoice_match_rate": round(invoice_match_rate, 2),
        }

    # ------------------------------------------------------------------
    # DynamoDB (boto3 offloaded to executor)
    # ------------------------------------------------------------------

    async def _save_statement(
        self,
        statement_id,
        kirana_id,
        bank_statement_s3_key,
        invoice_s3_keys,
        verified_data,
    ):
        item = _floats_to_decimals(
            {
                "statement_id": statement_id,
                "kirana_id": kirana_id,
                "bank_statement_s3_key": bank_statement_s3_key,
                "invoice_s3_keys": invoice_s3_keys,
                **{
                    k: verified_data[k]
                    for k in (
                        "transactions",
                        "monthly_summary",
                        "total_credits",
                        "total_debits",
                        "months_analyzed",
                        "invoice_match_rate",
                    )
                },
                "created_at": datetime.utcnow().isoformat(),
            }
        )
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, partial(self.statements_table.put_item, Item=item)
        )

    async def _save_invoice(
        self, statement_id, kirana_id, invoice_s3_key, invoice_data
    ):
        item = _floats_to_decimals(
            {
                "invoice_id": str(uuid.uuid4()),
                "kirana_id": kirana_id,
                "statement_id": statement_id,
                "invoice_s3_key": invoice_s3_key,
                **{
                    k: invoice_data[k]
                    for k in (
                        "invoice_date",
                        "vendor_name",
                        "total_amount",
                        "items",
                    )
                },
                "created_at": datetime.utcnow().isoformat(),
            }
        )
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, partial(self.invoices_table.put_item, Item=item)
        )
