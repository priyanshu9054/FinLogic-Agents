from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import gst, statement, score, nbfc, matching, loan
from config import settings
from database import engine, Base
from models import score as score_model

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinLogic Agents API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gst.router)
app.include_router(statement.router)
app.include_router(score.router)
app.include_router(nbfc.router)
app.include_router(matching.router)
app.include_router(loan.router)


@app.get("/")
def root():
    return {"message": "FinLogic Agents API"}
