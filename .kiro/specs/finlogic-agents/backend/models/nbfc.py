from sqlalchemy import Column, Integer, String, Float
from database import Base


class NBFC(Base):
    __tablename__ = "nbfc"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    loan_amount = Column(Float)
    interest_rate = Column(Float)
