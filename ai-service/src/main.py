"""
EduTech AI Service - FastAPI Application
Handles PDF scraping, question parsing, pattern analysis, and AI question generation
"""
import sys
from pathlib import Path

# Add parent directory to path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

from src.config.settings import settings
from src.config.logging_config import setup_logging
from src.api import health, scrape, generate

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting EduTech AI Service...")
    # Startup logic here
    yield
    # Shutdown logic here
    logger.info("Shutting down EduTech AI Service...")


# Create FastAPI app
app = FastAPI(
    title="EduTech AI Service",
    description="AI-powered question generation from previous years papers",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["health"])
app.include_router(scrape.router, prefix="/api/scrape", tags=["scraping"])
app.include_router(generate.router, prefix="/api/generate", tags=["generation"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "EduTech AI Service",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
