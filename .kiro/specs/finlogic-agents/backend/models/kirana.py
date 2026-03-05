from sqlalchemy import Column, Integer, String, Float
from database import Base


class Kirana(Base):
    __tablename__ = "kirana"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    gst_number = Column(String)
    revenue = Column(Float)
