"""
PDF Scraping Service - Extract questions from PDF papers
Uses pdfplumber for text extraction and pytesseract for OCR
"""
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import re
import pdfplumber
from PIL import Image
import io

logger = logging.getLogger(__name__)


class PDFScraperService:
    """Service for scraping questions from PDF files"""
    
    def __init__(self):
        """Initialize PDF scraper"""
        self.logger = logger
    
    async def scrape_pdf(
        self,
        pdf_path: str,
        exam_type: str,
        year: int,
        session: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Scrape questions from a PDF file
        
        Args:
            pdf_path: Path to the PDF file
            exam_type: Type of exam (JEE, NEET, etc.)
            year: Year of the exam
            session: Session name (January, April, etc.)
            
        Returns:
            List of extracted questions with metadata
        """
        self.logger.info(f"Starting PDF scrape: {pdf_path}")
        
        questions = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                full_text = ""
                
                # Extract text from all pages
                for page_num, page in enumerate(pdf.pages, start=1):
                    self.logger.debug(f"Processing page {page_num}/{len(pdf.pages)}")
                    
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        full_text += f"\n--- Page {page_num} ---\n{page_text}"
                    
                    # Extract images (for diagrams, charts, etc.)
                    images = self._extract_images_from_page(page, page_num)
                    if images:
                        self.logger.debug(f"Found {len(images)} images on page {page_num}")
                
                # Parse questions from extracted text
                questions = self._parse_questions_from_text(
                    full_text,
                    exam_type,
                    year,
                    session
                )
                
                self.logger.info(f"Extracted {len(questions)} questions from PDF")
                
        except Exception as e:
            self.logger.error(f"Error scraping PDF {pdf_path}: {str(e)}")
            raise
        
        return questions
    
    def _extract_images_from_page(
        self,
        page: Any,
        page_num: int
    ) -> List[Dict[str, Any]]:
        """
        Extract images from a PDF page
        
        Args:
            page: pdfplumber page object
            page_num: Page number
            
        Returns:
            List of image metadata
        """
        images = []
        
        try:
            # Get images from page
            page_images = page.images
            
            for img_idx, img in enumerate(page_images):
                images.append({
                    "page": page_num,
                    "index": img_idx,
                    "x0": img.get("x0"),
                    "y0": img.get("y0"),
                    "x1": img.get("x1"),
                    "y1": img.get("y1"),
                    "width": img.get("width"),
                    "height": img.get("height"),
                })
        except Exception as e:
            self.logger.error(f"Error extracting images from page {page_num}: {str(e)}")
        
        return images
    
    def _parse_questions_from_text(
        self,
        text: str,
        exam_type: str,
        year: int,
        session: Optional[str]
    ) -> List[Dict[str, Any]]:
        """
        Parse individual questions from extracted text
        This is a basic implementation - will be enhanced with NLP
        
        Args:
            text: Full extracted text
            exam_type: Exam type
            year: Exam year
            session: Exam session
            
        Returns:
            List of parsed questions
        """
        questions = []
        
        # Pattern for question numbers (Q1, Q2, Question 1, 1., etc.)
        question_pattern = r'(?:Q(?:uestion)?\s*(\d+)|^(\d+)[\.\)])'
        
        # Split text into potential question blocks
        lines = text.split('\n')
        current_question = None
        current_text = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts a new question
            match = re.match(question_pattern, line, re.IGNORECASE | re.MULTILINE)
            
            if match:
                # Save previous question
                if current_question and current_text:
                    current_question["text"] = " ".join(current_text)
                    questions.append(current_question)
                
                # Start new question
                question_number = int(match.group(1) or match.group(2))
                current_question = {
                    "exam_type": exam_type,
                    "year": year,
                    "session": session,
                    "question_number": question_number,
                    "scrape_source": "pdf",
                }
                current_text = [line]
            
            elif current_question:
                # Add to current question text
                current_text.append(line)
        
        # Add last question
        if current_question and current_text:
            current_question["text"] = " ".join(current_text)
            questions.append(current_question)
        
        self.logger.info(f"Parsed {len(questions)} questions from text")
        return questions
    
    async def scrape_from_url(
        self,
        pdf_url: str,
        exam_type: str,
        year: int,
        session: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Download and scrape PDF from URL
        
        Args:
            pdf_url: URL of the PDF file
            exam_type: Exam type
            year: Exam year
            session: Exam session
            
        Returns:
            List of extracted questions
        """
        # TODO: Implement URL download
        # For now, just placeholder
        self.logger.info(f"Scraping from URL: {pdf_url}")
        raise NotImplementedError("URL scraping not yet implemented")
