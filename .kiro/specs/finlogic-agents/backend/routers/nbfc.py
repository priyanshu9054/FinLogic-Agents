from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.nbfc_service import NBFCService

router = APIRouter(prefix="/nbfc", tags=["NBFC"])


@router.post("/process")
def process_nbfc(data: dict, db: Session = Depends(get_db)):
    service = NBFCService(db)
    return service.process(data)
