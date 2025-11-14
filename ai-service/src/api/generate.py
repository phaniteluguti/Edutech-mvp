"""
Question generation API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from src.services.question_generator import QuestionGeneratorService
from src.services.pattern_analyzer import PatternAnalyzerService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
generator = QuestionGeneratorService()
pattern_analyzer = PatternAnalyzerService()


class GenerationRequest(BaseModel):
    """Request model for question generation"""
    topic: str
    difficulty: str
    exam_type: str
    context_question_ids: Optional[List[str]] = None
    use_pattern_analysis: bool = True


class BatchGenerationRequest(BaseModel):
    """Request model for batch generation"""
    specifications: List[dict]
    exam_type: str
    use_pattern_analysis: bool = True


class GenerationResponse(BaseModel):
    """Response model for generation"""
    success: bool
    question: Optional[dict] = None
    message: str


class BatchGenerationResponse(BaseModel):
    """Response model for batch generation"""
    success: bool
    total_requested: int
    successful: int
    failed: int
    questions: List[dict]
    message: str


@router.post("/single", response_model=GenerationResponse)
async def generate_single_question(request: GenerationRequest):
    """
    Generate a single question using AI
    
    Args:
        request: Generation request
        
    Returns:
        Generated question
    """
    try:
        # TODO: Fetch context questions and existing questions from database
        # For now, using placeholder
        context_questions = []
        existing_questions = []
        pattern_analysis = None
        
        # Generate question
        question = await generator.generate_question(
            topic=request.topic,
            difficulty=request.difficulty,
            exam_type=request.exam_type,
            context_questions=context_questions,
            existing_questions=existing_questions,
            pattern_analysis=pattern_analysis
        )
        
        if question:
            return GenerationResponse(
                success=True,
                question=question,
                message="Question generated successfully"
            )
        else:
            return GenerationResponse(
                success=False,
                message="Failed to generate question"
            )
            
    except Exception as e:
        logger.error(f"Error generating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchGenerationResponse)
async def generate_batch_questions(request: BatchGenerationRequest):
    """
    Generate multiple questions in batch
    
    Args:
        request: Batch generation request
        
    Returns:
        Batch generation results
    """
    try:
        # TODO: Fetch context questions and existing questions from database
        context_questions = []
        existing_questions = []
        pattern_analysis = None
        
        # Generate questions
        results = await generator.generate_batch(
            specifications=request.specifications,
            exam_type=request.exam_type,
            context_questions=context_questions,
            existing_questions=existing_questions,
            pattern_analysis=pattern_analysis
        )
        
        return BatchGenerationResponse(
            success=True,
            total_requested=results["total_requested"],
            successful=results["successful"],
            failed=results["failed"],
            questions=results["questions"],
            message=f"Batch generation complete: {results['successful']} successful"
        )
        
    except Exception as e:
        logger.error(f"Error in batch generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate")
async def validate_question(question: dict, exam_type: str = "JEE"):
    """
    Validate a generated question
    
    Args:
        question: Question to validate
        exam_type: Type of exam
        
    Returns:
        Validation result
    """
    try:
        validation = await generator.validate_generated_question(question, exam_type)
        
        return {
            "success": True,
            "validation": validation
        }
        
    except Exception as e:
        logger.error(f"Error validating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
