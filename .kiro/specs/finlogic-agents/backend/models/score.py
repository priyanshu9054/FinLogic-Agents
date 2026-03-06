from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from database import Base
from datetime import datetime


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    kirana_id = Column(String, nullable=False, index=True)
    credit_score = Column(Integer, nullable=False)
    score_breakdown = Column(JSON, nullable=False)
    risk_level = Column(String, nullable=False)
    loan_eligible_amount = Column(Float, nullable=False)
    recommendations = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
