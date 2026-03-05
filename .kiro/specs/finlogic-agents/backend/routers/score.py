from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.scoring_service import ScoringService

router = APIRouter(prefix="/score", tags=["Score"])


@router.post("/calculate")
def calculate_score(data: dict, db: Session = Depends(get_db)):
    service = ScoringService(db)
    return service.calculate(data)
