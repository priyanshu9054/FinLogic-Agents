from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.matching_service import MatchingService

router = APIRouter(prefix="/matching", tags=["Matching"])


@router.post("/match")
def match_records(data: dict, db: Session = Depends(get_db)):
    service = MatchingService(db)
    return service.match(data)
