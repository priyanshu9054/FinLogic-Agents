from sqlalchemy.orm import Session


class ExtractionService:
    def __init__(self, db: Session):
        self.db = db

    def extract(self, file_data: dict):
        return {"status": "extracted", "data": file_data}
