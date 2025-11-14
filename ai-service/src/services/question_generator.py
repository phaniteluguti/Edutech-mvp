"""
Question Generator Service - Orchestrates AI question generation
Combines prompt building, AI generation, similarity checking, and validation
"""
import logging
from typing import Dict, Any, List, Optional
import json
from openai import AzureOpenAI

from src.config.settings import settings
from src.services.prompt_builder import PromptBuilderService
from src.services.similarity_checker import SimilarityCheckerService

logger = logging.getLogger(__name__)


class QuestionGeneratorService:
    """Service for AI-powered question generation"""
    
    def __init__(self):
        """Initialize question generator"""
        self.logger = logger
        self.client = None
        
        # Initialize services
        self.prompt_builder = PromptBuilderService()
        self.similarity_checker = SimilarityCheckerService()
        
        # Initialize Azure OpenAI client
        if settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT:
            try:
                self.client = AzureOpenAI(
                    api_key=settings.AZURE_OPENAI_API_KEY,
                    api_version=settings.AZURE_OPENAI_API_VERSION,
                    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
                )
                self.logger.info("Azure OpenAI client initialized successfully")
            except Exception as e:
                self.logger.error(f"Failed to initialize Azure OpenAI client: {str(e)}")
        else:
            self.logger.warning("Azure OpenAI credentials not configured")
    
    async def generate_question(
        self,
        topic: str,
        difficulty: str,
        exam_type: str,
        context_questions: List[Dict[str, Any]],
        existing_questions: List[Dict[str, Any]],
        pattern_analysis: Optional[Dict[str, Any]] = None,
        max_retries: int = None
    ) -> Optional[Dict[str, Any]]:
        """
        Generate a single question using AI
        
        Args:
            topic: Topic for the question
            difficulty: Difficulty level
            exam_type: Type of exam
            context_questions: Similar PYQs for context
            existing_questions: All existing questions for similarity check
            pattern_analysis: Pattern analysis data
            max_retries: Maximum generation retries
            
        Returns:
            Generated question or None if failed
        """
        if not self.client:
            self.logger.error("Azure OpenAI client not initialized")
            return None
        
        if max_retries is None:
            max_retries = settings.MAX_GENERATION_RETRIES
        
        for attempt in range(max_retries):
            self.logger.info(f"Generation attempt {attempt + 1}/{max_retries}")
            
            try:
                # Build prompt
                prompt = await self.prompt_builder.build_question_generation_prompt(
                    target_topic=topic,
                    target_difficulty=difficulty,
                    exam_type=exam_type,
                    context_questions=context_questions,
                    pattern_analysis=pattern_analysis
                )
                
                # Generate using Azure OpenAI
                response = self.client.chat.completions.create(
                    model=settings.AZURE_OPENAI_DEPLOYMENT,
                    messages=[
                        {"role": "system", "content": "You are an expert question paper setter."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.8,  # Higher temperature for creativity
                    max_tokens=1000,
                    response_format={"type": "json_object"}
                )
                
                # Parse response
                generated_text = response.choices[0].message.content
                generated_question = json.loads(generated_text)
                
                # Check originality
                originality_check = await self.similarity_checker.check_originality(
                    generated_question,
                    existing_questions
                )
                
                if originality_check["is_original"]:
                    self.logger.info(f"Generated original question (similarity: {originality_check['max_similarity']:.2f})")
                    
                    # Add metadata
                    generated_question["originality_check"] = originality_check
                    generated_question["generation_attempt"] = attempt + 1
                    
                    return generated_question
                else:
                    self.logger.warning(
                        f"Generated question too similar to existing "
                        f"(similarity: {originality_check['max_similarity']:.2f})"
                    )
                    # Retry with different temperature or prompt
                    continue
                    
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse generated question: {str(e)}")
                continue
            except Exception as e:
                self.logger.error(f"Error generating question: {str(e)}")
                continue
        
        self.logger.error(f"Failed to generate original question after {max_retries} attempts")
        return None
    
    async def generate_batch(
        self,
        specifications: List[Dict[str, Any]],
        exam_type: str,
        context_questions: List[Dict[str, Any]],
        existing_questions: List[Dict[str, Any]],
        pattern_analysis: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate multiple questions in batch
        
        Args:
            specifications: List of question specifications
            exam_type: Type of exam
            context_questions: Context from PYQs
            existing_questions: All existing questions
            pattern_analysis: Pattern analysis data
            
        Returns:
            Batch generation results
        """
        self.logger.info(f"Starting batch generation of {len(specifications)} questions")
        
        results = {
            "total_requested": len(specifications),
            "successful": 0,
            "failed": 0,
            "questions": []
        }
        
        for i, spec in enumerate(specifications):
            self.logger.info(f"Generating question {i+1}/{len(specifications)}")
            
            # Filter relevant context
            relevant_context = [
                q for q in context_questions
                if q.get("topic") == spec.get("topic")
                and q.get("difficulty") == spec.get("difficulty")
            ]
            
            # Generate question
            question = await self.generate_question(
                topic=spec["topic"],
                difficulty=spec["difficulty"],
                exam_type=exam_type,
                context_questions=relevant_context[:10],
                existing_questions=existing_questions,
                pattern_analysis=pattern_analysis
            )
            
            if question:
                results["successful"] += 1
                results["questions"].append(question)
            else:
                results["failed"] += 1
        
        self.logger.info(
            f"Batch generation complete: {results['successful']} successful, "
            f"{results['failed']} failed"
        )
        
        return results
    
    async def validate_generated_question(
        self,
        question: Dict[str, Any],
        exam_type: str
    ) -> Dict[str, Any]:
        """
        Validate a generated question using AI
        
        Args:
            question: Generated question to validate
            exam_type: Type of exam
            
        Returns:
            Validation result
        """
        if not self.client:
            self.logger.error("Azure OpenAI client not initialized")
            return {"is_valid": False, "error": "Client not initialized"}
        
        try:
            # Build validation prompt
            prompt = await self.prompt_builder.build_validation_prompt(question, exam_type)
            
            # Get validation from AI
            response = self.client.chat.completions.create(
                model=settings.AZURE_OPENAI_DEPLOYMENT,
                messages=[
                    {"role": "system", "content": "You are an expert question reviewer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for consistency
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            
            # Parse validation result
            validation_text = response.choices[0].message.content
            validation_result = json.loads(validation_text)
            
            return validation_result
            
        except Exception as e:
            self.logger.error(f"Error validating question: {str(e)}")
            return {"is_valid": False, "error": str(e)}
