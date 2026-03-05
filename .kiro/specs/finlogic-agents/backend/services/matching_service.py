from sqlalchemy.orm import Session


class MatchingService:
    def __init__(self, db: Session):
        self.db = db

    def match(self, data: dict):
        return {"status": "matched", "matches": []}
