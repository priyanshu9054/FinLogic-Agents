from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.extraction_service import ExtractionService

router = APIRouter(prefix="/statement", tags=["Statement"])


@router.post("/extract")
def extract_statement(file_data: dict, db: Session = Depends(get_db)):
    service = ExtractionService(db)
    return service.extract(file_data)
