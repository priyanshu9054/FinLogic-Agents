from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.gst_service import GSTService

router = APIRouter(prefix="/gst", tags=["GST"])


@router.post("/upload")
def upload_gst(file_data: dict, db: Session = Depends(get_db)):
    service = GSTService(db)
    return service.process_gst(file_data)
