"""
Scraping API endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from src.services.scraper import PDFScraperService
from src.services.parser import QuestionParserService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
scraper = PDFScraperService()
parser = QuestionParserService()


class ScrapeRequest(BaseModel):
    """Request model for PDF scraping"""
    pdf_url: Optional[str] = None
    exam_type: str
    year: int
    session: Optional[str] = None


class ScrapeResponse(BaseModel):
    """Response model for scraping"""
    success: bool
    total_questions: int
    questions: List[dict]
    message: str


@router.post("/upload", response_model=ScrapeResponse)
async def scrape_uploaded_pdf(
    file: UploadFile = File(...),
    exam_type: str = "JEE",
    year: int = 2024,
    session: Optional[str] = None
):
    """
    Upload and scrape a PDF file
    
    Args:
        file: PDF file upload
        exam_type: Type of exam
        year: Year of exam
        session: Session name
        
    Returns:
        Scraped questions
    """
    try:
        # Save uploaded file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Scrape PDF
            raw_questions = await scraper.scrape_pdf(
                pdf_path=tmp_path,
                exam_type=exam_type,
                year=year,
                session=session
            )
            
            # Parse questions
            parsed_questions = await parser.batch_parse_questions(
                raw_questions,
                exam_type
            )
            
            return ScrapeResponse(
                success=True,
                total_questions=len(parsed_questions),
                questions=parsed_questions,
                message=f"Successfully scraped {len(parsed_questions)} questions"
            )
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Error scraping PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/url", response_model=ScrapeResponse)
async def scrape_pdf_from_url(request: ScrapeRequest):
    """
    Scrape PDF from URL
    
    Args:
        request: Scraping request with URL
        
    Returns:
        Scraped questions
    """
    if not request.pdf_url:
        raise HTTPException(status_code=400, detail="pdf_url is required")
    
    try:
        # This will be implemented later
        raise HTTPException(
            status_code=501,
            detail="URL scraping not yet implemented"
        )
        
    except Exception as e:
        logger.error(f"Error scraping from URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
