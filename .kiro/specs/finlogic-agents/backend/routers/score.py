from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.scoring_service import ScoringService
from schemas.score import GenerateScoreRequest, GenerateScoreResponse

router = APIRouter(prefix="/api/score", tags=["Score"])


@router.post("/generate", response_model=GenerateScoreResponse)
def generate_score(request: GenerateScoreRequest, db: Session = Depends(get_db)):
    """
    Generate credit score for a kirana store

    Args:
        request: Contains kirana_id

    Returns:
        GenerateScoreResponse with credit score, breakdown, risk level, and recommendations
    """
    try:
        service = ScoringService(db)
        return service.generate_score(request.kirana_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating score: {str(e)}")
