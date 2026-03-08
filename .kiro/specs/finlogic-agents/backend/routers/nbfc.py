from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from services.nbfc_service import NBFCService
import json

router = APIRouter(prefix="/api/nbfc", tags=["NBFC"])


class LoanCriteria(BaseModel):
    min_credit_score: int
    max_loan_amount: int
    min_loan_amount: int
    preferred_regions: List[str]
    loan_tenure_months: int
    interest_rate: float


class NBFCVerifyRequest(BaseModel):
    nbfc_name: str
    rbi_license_number: str
    contact_email: EmailStr
    contact_phone: str
    loan_criteria: LoanCriteria


class NBFCVerifyResponse(BaseModel):
    nbfc_id: str
    verified: bool
    message: str


@router.post("/verify", response_model=NBFCVerifyResponse)
async def verify_nbfc(
    nbfc_name: str = Form(...),
    rbi_license_number: str = Form(...),
    contact_email: str = Form(...),
    contact_phone: str = Form(...),
    loan_criteria: str = Form(...),
    registration_certificate: UploadFile = File(...),
):
    """
    Verify NBFC with registration certificate upload
    """
    try:
        # Parse loan_criteria JSON string
        loan_criteria_dict = json.loads(loan_criteria)

        # Read certificate file
        certificate_content = await registration_certificate.read()

        # Prepare data
        data = {
            "nbfc_name": nbfc_name,
            "rbi_license_number": rbi_license_number,
            "contact_email": contact_email,
            "contact_phone": contact_phone,
            "loan_criteria": loan_criteria_dict,
        }

        # Verify NBFC with certificate
        service = NBFCService()
        result = await service.verify_nbfc(
            data=data,
            certificate_content=certificate_content,
            certificate_filename=registration_certificate.filename,
        )

        return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid loan_criteria format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
