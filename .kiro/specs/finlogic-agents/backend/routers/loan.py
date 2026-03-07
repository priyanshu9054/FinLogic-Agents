from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/loan", tags=["Loan"])


class LoanRequest(BaseModel):
    kirana_id: str
    nbfc_id: str
    amount: float


class DisburseRequest(BaseModel):
    nbfc_id: str
    kirana_id: str
    amount: float


@router.post("/request")
def request_loan(loan_request: LoanRequest, db: Session = Depends(get_db)):
    """
    Submit a loan request from Kirana to NBFC
    Dummy implementation - just validates and returns success
    """
    # Basic validation
    if not loan_request.kirana_id or not loan_request.nbfc_id:
        raise HTTPException(status_code=400, detail="Missing kirana_id or nbfc_id")

    if loan_request.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid loan amount")

    # Generate a dummy request ID
    request_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"

    # In a real implementation, you would:
    # 1. Store the loan request in database
    # 2. Notify the NBFC
    # 3. Track the request status

    return {
        "success": True,
        "message": "Loan request sent successfully",
        "request_id": request_id,
        "timestamp": datetime.now().isoformat(),
    }


@router.post("/disburse")
def disburse_loan(disburse_request: DisburseRequest, db: Session = Depends(get_db)):
    """
    Disburse loan from NBFC to Kirana
    Dummy implementation - validates and returns success
    """
    # Basic validation
    if not disburse_request.kirana_id or not disburse_request.nbfc_id:
        raise HTTPException(status_code=400, detail="Missing kirana_id or nbfc_id")

    if disburse_request.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid disbursement amount")

    # Generate transaction ID
    transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"

    # In a real implementation, you would:
    # 1. Verify NBFC has sufficient funds
    # 2. Create disbursement record in database
    # 3. Update NBFC and Kirana balances
    # 4. Send notifications

    return {
        "success": True,
        "message": "Loan disbursed successfully",
        "transaction_id": transaction_id,
        "timestamp": datetime.now().isoformat(),
    }
