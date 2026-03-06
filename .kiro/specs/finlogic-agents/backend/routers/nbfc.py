from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import List
from services.nbfc_service import NBFCService

router = APIRouter(prefix="/nbfc", tags=["NBFC"])


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
def verify_nbfc(request: NBFCVerifyRequest):
    service = NBFCService()
    return service.verify_nbfc(request.dict())
