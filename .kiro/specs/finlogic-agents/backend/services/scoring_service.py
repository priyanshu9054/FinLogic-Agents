from sqlalchemy.orm import Session


class ScoringService:
    def __init__(self, db: Session):
        self.db = db

    def calculate(self, data: dict):
        return {"status": "calculated", "score": 0}
