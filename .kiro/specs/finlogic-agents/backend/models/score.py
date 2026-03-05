from sqlalchemy import Column, Integer, String, Float
from database import Base


class Score(Base):
    __tablename__ = "score"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer)
    score_value = Column(Float)
    score_type = Column(String)
