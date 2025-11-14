"""
Health check endpoint for the AI service
"""
from fastapi import APIRouter
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    Returns service status and timestamp
    """
    return {
        "status": "ok",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat()
    }
