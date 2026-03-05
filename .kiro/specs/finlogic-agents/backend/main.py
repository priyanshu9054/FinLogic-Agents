from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import gst, statement, score, nbfc, matching
from config import settings

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


@app.get("/")
def root():
    return {"message": "FinLogic Agents API"}
