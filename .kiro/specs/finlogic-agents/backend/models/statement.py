from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class Statement(Base):
    __tablename__ = "statement"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String)
    transaction_date = Column(Date)
    amount = Column(Float)
    description = Column(String)
