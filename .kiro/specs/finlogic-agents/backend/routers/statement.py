from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
from services.extraction_service import ExtractionService
from storage import upload_file
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/statement", tags=["Statement"])


@router.post("/upload")
async def upload_statement(
    kirana_id: str = Form(...),
    bank_statement: UploadFile = File(...),
    wholesaler_invoices: List[UploadFile] = File(...),
):
    """
    Upload bank statement and wholesaler invoices for extraction and analysis.
    """
    try:
        # Read bank statement content
        bank_statement_content = await bank_statement.read()

        # Upload bank statement to S3
        bank_statement_s3_key = upload_file(
            bank_statement_content,
            f"kiranas/{kirana_id}/statements",
            bank_statement.filename,
        )

        if not bank_statement_s3_key:
            raise HTTPException(
                status_code=500, detail="Failed to upload bank statement"
            )

        # Upload invoices to S3
        invoice_s3_keys = []
        invoice_contents = []

        for invoice in wholesaler_invoices:
            invoice_content = await invoice.read()
            invoice_contents.append(invoice_content)

            invoice_s3_key = upload_file(
                invoice_content, f"kiranas/{kirana_id}/invoices", invoice.filename
            )

            if not invoice_s3_key:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload invoice: {invoice.filename}",
                )

            invoice_s3_keys.append(invoice_s3_key)

        # Extract data using Gemini
        extraction_service = ExtractionService()
        result = await extraction_service.extract_data(
            kirana_id=kirana_id,
            bank_statement_s3_key=bank_statement_s3_key,
            bank_statement_content=bank_statement_content,
            invoice_s3_keys=invoice_s3_keys,
            invoice_contents=invoice_contents,
        )

        return {**result, "message": "Statement and invoices processed successfully"}

    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
