import os
from app.security import SecurityHeadersMiddleware
from fastapi import FastAPI
from app.routers import auth, protected, admin
from app.routers import realtime
from app.routers import pdf_report
from app.routers import stix
from app.routers import reports
from app.routers import batch_scanner
from app.routers import url_scanner
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ioc_intelligence
from app.routers import file_scanner

from app.database import Base, engine
from app.models.ioc import IOC
from app.routers.iocs import router as ioc_router
from app.routers.sources import router as sources_router
from app.routers.normalize import router as normalize_router
from app.routers.ingestion import router as ingestion_router
from app.routers.threatfox import router as threatfox_router
from app.routers.scoring import router as scoring_router
from app.routers.events import router as events_router
from app.routers.incidents import router as incidents_router
from app.routers.hunting import router as hunting_router
from app.routers.dashboard import router as dashboard_router
from app.routers.alerts import router as alerts_router
from app.routers import threat_sources

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ThreatLens",
    description="Cyber Threat Intelligence Platform",
    version="0.2.0",
)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ioc_router)
app.include_router(sources_router)
app.include_router(normalize_router)
app.include_router(ingestion_router)
app.include_router(threatfox_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ThreatLens API",
        "version": "0.2.0",
    }

app.include_router(scoring_router)

app.include_router(events_router)

app.include_router(alerts_router)

app.include_router(incidents_router)

app.include_router(hunting_router)

app.include_router(dashboard_router)

app.include_router(ioc_intelligence.router)

app.include_router(file_scanner.router)


# ThreatLens frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(url_scanner.router)

app.include_router(threat_sources.router)
app.include_router(batch_scanner.router)
app.include_router(reports.router)
app.include_router(stix.router)
app.include_router(pdf_report.router)
app.include_router(realtime.router)
app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(admin.router)
