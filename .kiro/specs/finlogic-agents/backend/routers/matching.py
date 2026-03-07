from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.matching_service import MatchingService

router = APIRouter(prefix="/api/matching", tags=["Matching"])


@router.get("/nbfcs/{kirana_id}")
def get_matched_nbfcs(kirana_id: str, db: Session = Depends(get_db)):
    """
    Get matched NBFCs for a Kirana based on their credit score
    """
    service = MatchingService(db)
    result = service.get_matched_nbfcs_for_kirana(kirana_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.get("/kiranas/{nbfc_id}")
def get_matched_kiranas(nbfc_id: str, db: Session = Depends(get_db)):
    """
    Get matched Kiranas for an NBFC based on their loan criteria
    """
    service = MatchingService(db)
    result = service.get_matched_kiranas_for_nbfc(nbfc_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result
