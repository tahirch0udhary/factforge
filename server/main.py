import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.pipeline import get_pipeline
from app.routers import auth, verify, history

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("factforge")


# ─── Lifespan: load models once at startup ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FactForge API...")
    create_tables()
    get_pipeline()  # Load all models into memory
    logger.info("All models loaded. API ready.")
    yield
    logger.info("Shutting down FactForge API.")


# ─── App ───
app = FastAPI(
    title="FactForge API",
    description="Multi-model fake news detection: Baseline + BERT + LLM fallback",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS (adjust origins for your React frontend) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───
app.include_router(auth.router)
app.include_router(verify.router)
app.include_router(history.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "FactForge API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    pipeline = get_pipeline()
    return {
        "status": "healthy",
        "models": {
            "baseline": pipeline.baseline.metadata["model_name"],
            "bert": pipeline.bert.metadata["model_name"],
            "groq": "connected" if pipeline.groq.client else "not configured",
        },
        "threshold": pipeline.threshold,
    }
