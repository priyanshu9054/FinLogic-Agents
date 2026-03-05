from sqlalchemy.orm import Session


class NBFCService:
    def __init__(self, db: Session):
        self.db = db

    def process(self, data: dict):
        return {"status": "processed", "data": data}
