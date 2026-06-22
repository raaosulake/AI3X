import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.database import init_db
from app.routes import settings, jira, test_strategy, test_plan, rca, history

app = FastAPI(
    title="AI Test Documentation Generator",
    description="Enterprise QA Documentation Generator using AI, B.L.A.S.T. methodology, and JIRA integration",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router)
app.include_router(jira.router)
app.include_router(test_strategy.router)
app.include_router(test_plan.router)
app.include_router(rca.router)
app.include_router(history.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "application": "AI Test Documentation Generator", "version": "1.0.0"}


handler = Mangum(app, lifespan="off")
