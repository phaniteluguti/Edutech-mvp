"""
Similarity Checker Service - Check similarity between questions using embeddings
Uses Azure OpenAI embeddings to calculate semantic similarity
"""
import logging
from typing import Dict, Any, List, Optional
import numpy as np
from openai import AzureOpenAI

from src.config.settings import settings

logger = logging.getLogger(__name__)


class SimilarityCheckerService:
    """Service for checking question similarity using embeddings"""
    
    def __init__(self):
        """Initialize similarity checker with Azure OpenAI client"""
        self.logger = logger
        self.client = None
        
        # Initialize Azure OpenAI client if credentials available
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
    
    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Get embedding vector for a text
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector or None if failed
        """
        if not self.client:
            self.logger.error("Azure OpenAI client not initialized")
            return None
        
        try:
            response = self.client.embeddings.create(
                input=text,
                model=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
            )
            
            embedding = response.data[0].embedding
            return embedding
            
        except Exception as e:
            self.logger.error(f"Error getting embedding: {str(e)}")
            return None
    
    async def calculate_similarity(
        self,
        text1: str,
        text2: str
    ) -> Optional[float]:
        """
        Calculate cosine similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Similarity score (0-1) or None if failed
        """
        # Get embeddings
        emb1 = await self.get_embedding(text1)
        emb2 = await self.get_embedding(text2)
        
        if emb1 is None or emb2 is None:
            return None
        
        # Calculate cosine similarity
        similarity = self._cosine_similarity(emb1, emb2)
        return similarity
    
    def _cosine_similarity(
        self,
        vec1: List[float],
        vec2: List[float]
    ) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    async def find_similar_questions(
        self,
        question: Dict[str, Any],
        candidate_questions: List[Dict[str, Any]],
        threshold: float = 0.7,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find similar questions from a list of candidates
        
        Args:
            question: The question to compare
            candidate_questions: List of candidate questions
            threshold: Minimum similarity threshold
            max_results: Maximum number of results to return
            
        Returns:
            List of similar questions with similarity scores
        """
        question_text = question.get("text", "")
        if not question_text:
            return []
        
        # Get embedding for target question
        question_embedding = await self.get_embedding(question_text)
        if question_embedding is None:
            return []
        
        # Calculate similarity with each candidate
        similarities = []
        
        for candidate in candidate_questions:
            candidate_text = candidate.get("text", "")
            if not candidate_text:
                continue
            
            candidate_embedding = await self.get_embedding(candidate_text)
            if candidate_embedding is None:
                continue
            
            similarity = self._cosine_similarity(question_embedding, candidate_embedding)
            
            if similarity >= threshold:
                similarities.append({
                    "question": candidate,
                    "similarity": similarity
                })
        
        # Sort by similarity and return top results
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        return similarities[:max_results]
    
    async def check_originality(
        self,
        generated_question: Dict[str, Any],
        existing_questions: List[Dict[str, Any]],
        max_similarity_threshold: float = None
    ) -> Dict[str, Any]:
        """
        Check if a generated question is original enough
        
        Args:
            generated_question: The generated question to check
            existing_questions: List of existing PYQs
            max_similarity_threshold: Maximum allowed similarity (default from settings)
            
        Returns:
            Originality check result
        """
        if max_similarity_threshold is None:
            max_similarity_threshold = settings.MAX_SIMILARITY_THRESHOLD
        
        # Find similar questions
        similar = await self.find_similar_questions(
            generated_question,
            existing_questions,
            threshold=0.3,  # Lower threshold to catch potential issues
            max_results=5
        )
        
        # Calculate maximum similarity
        max_similarity = 0.0
        most_similar_question = None
        
        if similar:
            max_similarity = similar[0]["similarity"]
            most_similar_question = similar[0]["question"]
        
        # Determine if original
        is_original = max_similarity < max_similarity_threshold
        
        return {
            "is_original": is_original,
            "max_similarity": max_similarity,
            "max_similarity_threshold": max_similarity_threshold,
            "similar_questions": similar,
            "most_similar_question": most_similar_question,
            "verdict": "PASS" if is_original else "FAIL - Too similar to existing questions"
        }
    
    async def batch_check_originality(
        self,
        generated_questions: List[Dict[str, Any]],
        existing_questions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Check originality for multiple generated questions
        
        Args:
            generated_questions: List of generated questions
            existing_questions: List of existing PYQs
            
        Returns:
            List of originality check results
        """
        results = []
        
        for i, question in enumerate(generated_questions):
            self.logger.info(f"Checking originality for question {i+1}/{len(generated_questions)}")
            
            result = await self.check_originality(question, existing_questions)
            result["question_index"] = i
            results.append(result)
        
        # Summary
        passed = sum(1 for r in results if r["is_original"])
        self.logger.info(f"Originality check: {passed}/{len(results)} questions passed")
        
        return results
