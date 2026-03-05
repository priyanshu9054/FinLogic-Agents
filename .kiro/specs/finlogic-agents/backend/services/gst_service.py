from sqlalchemy.orm import Session


class GSTService:
    def __init__(self, db: Session):
        self.db = db

    def process_gst(self, file_data: dict):
        return {"status": "processed", "data": file_data}
