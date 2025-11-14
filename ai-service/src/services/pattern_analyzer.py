"""
Pattern Analysis Service - Analyze patterns in previous year questions
Identifies frequently asked topics, difficulty trends, common question types
"""
import logging
from typing import Dict, Any, List
from collections import Counter, defaultdict
from datetime import datetime

logger = logging.getLogger(__name__)


class PatternAnalyzerService:
    """Service for analyzing patterns in PYQ database"""
    
    def __init__(self):
        """Initialize pattern analyzer"""
        self.logger = logger
    
    async def analyze_topic_frequency(
        self,
        questions: List[Dict[str, Any]],
        exam_type: str,
        years: List[int]
    ) -> Dict[str, Any]:
        """
        Analyze topic frequency across years
        
        Args:
            questions: List of questions to analyze
            exam_type: Type of exam
            years: Years to analyze
            
        Returns:
            Topic frequency analysis
        """
        topic_counts = Counter()
        topic_by_year = defaultdict(Counter)
        
        for q in questions:
            topic = q.get("topic", "Unknown")
            year = q.get("year")
            
            topic_counts[topic] += 1
            if year in years:
                topic_by_year[year][topic] += 1
        
        # Calculate trends
        trends = {}
        for topic in topic_counts:
            yearly_counts = [topic_by_year[year][topic] for year in sorted(years)]
            
            # Simple trend calculation: comparing recent vs older years
            if len(yearly_counts) >= 2:
                recent_avg = sum(yearly_counts[-2:]) / 2
                older_avg = sum(yearly_counts[:-2]) / max(1, len(yearly_counts) - 2)
                
                if recent_avg > older_avg * 1.2:
                    trends[topic] = "increasing"
                elif recent_avg < older_avg * 0.8:
                    trends[topic] = "decreasing"
                else:
                    trends[topic] = "stable"
        
        return {
            "total_counts": dict(topic_counts.most_common()),
            "by_year": {year: dict(counts) for year, counts in topic_by_year.items()},
            "trends": trends,
            "most_frequent": topic_counts.most_common(10),
        }
    
    async def analyze_difficulty_distribution(
        self,
        questions: List[Dict[str, Any]],
        exam_type: str
    ) -> Dict[str, Any]:
        """
        Analyze difficulty distribution
        
        Args:
            questions: List of questions
            exam_type: Type of exam
            
        Returns:
            Difficulty distribution analysis
        """
        difficulty_counts = Counter()
        difficulty_by_topic = defaultdict(Counter)
        
        for q in questions:
            difficulty = q.get("difficulty", "MEDIUM")
            topic = q.get("topic", "Unknown")
            
            difficulty_counts[difficulty] += 1
            difficulty_by_topic[topic][difficulty] += 1
        
        total = sum(difficulty_counts.values())
        
        return {
            "counts": dict(difficulty_counts),
            "percentages": {
                diff: (count / total * 100) if total > 0 else 0
                for diff, count in difficulty_counts.items()
            },
            "by_topic": {topic: dict(counts) for topic, counts in difficulty_by_topic.items()},
        }
    
    async def analyze_question_types(
        self,
        questions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze question type distribution
        
        Args:
            questions: List of questions
            
        Returns:
            Question type analysis
        """
        type_counts = Counter()
        type_by_year = defaultdict(Counter)
        
        for q in questions:
            qtype = q.get("question_type", "SINGLE_CHOICE")
            year = q.get("year")
            
            type_counts[qtype] += 1
            if year:
                type_by_year[year][qtype] += 1
        
        total = sum(type_counts.values())
        
        return {
            "counts": dict(type_counts),
            "percentages": {
                qtype: (count / total * 100) if total > 0 else 0
                for qtype, count in type_counts.items()
            },
            "by_year": {year: dict(counts) for year, counts in type_by_year.items()},
        }
    
    async def analyze_concept_patterns(
        self,
        questions: List[Dict[str, Any]],
        exam_type: str
    ) -> Dict[str, Any]:
        """
        Analyze which concepts are frequently tested together
        
        Args:
            questions: List of questions
            exam_type: Type of exam
            
        Returns:
            Concept pattern analysis
        """
        concept_counts = Counter()
        concept_combinations = Counter()
        
        for q in questions:
            concepts = q.get("concepts_tested", [])
            
            # Count individual concepts
            for concept in concepts:
                concept_counts[concept] += 1
            
            # Count concept combinations
            if len(concepts) > 1:
                combo = tuple(sorted(concepts))
                concept_combinations[combo] += 1
        
        return {
            "top_concepts": concept_counts.most_common(20),
            "common_combinations": [
                {"concepts": list(combo), "count": count}
                for combo, count in concept_combinations.most_common(10)
            ],
        }
    
    async def calculate_question_frequency(
        self,
        question: Dict[str, Any],
        all_questions: List[Dict[str, Any]],
        similarity_threshold: float = 0.7
    ) -> int:
        """
        Calculate how many similar questions appeared in past papers
        
        Args:
            question: The question to check
            all_questions: All questions in database
            similarity_threshold: Threshold for considering questions similar
            
        Returns:
            Frequency count
        """
        # Simplified similarity check using topic and concepts
        # Will be enhanced with embeddings later
        
        topic = question.get("topic")
        concepts = set(question.get("concepts_tested", []))
        
        similar_count = 0
        
        for q in all_questions:
            if q.get("id") == question.get("id"):
                continue
            
            # Check topic match
            if q.get("topic") != topic:
                continue
            
            # Check concept overlap
            q_concepts = set(q.get("concepts_tested", []))
            if not concepts or not q_concepts:
                continue
            
            overlap = len(concepts & q_concepts) / len(concepts | q_concepts)
            
            if overlap >= similarity_threshold:
                similar_count += 1
        
        return similar_count
    
    async def generate_pattern_report(
        self,
        questions: List[Dict[str, Any]],
        exam_type: str,
        years: List[int]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive pattern analysis report
        
        Args:
            questions: List of questions
            exam_type: Type of exam
            years: Years to analyze
            
        Returns:
            Complete pattern report
        """
        self.logger.info(f"Generating pattern report for {exam_type} ({len(questions)} questions)")
        
        topic_analysis = await self.analyze_topic_frequency(questions, exam_type, years)
        difficulty_analysis = await self.analyze_difficulty_distribution(questions, exam_type)
        type_analysis = await self.analyze_question_types(questions)
        concept_analysis = await self.analyze_concept_patterns(questions, exam_type)
        
        report = {
            "exam_type": exam_type,
            "years_analyzed": years,
            "total_questions": len(questions),
            "generated_at": datetime.utcnow().isoformat(),
            "topic_patterns": topic_analysis,
            "difficulty_patterns": difficulty_analysis,
            "question_type_patterns": type_analysis,
            "concept_patterns": concept_analysis,
        }
        
        self.logger.info("Pattern report generated successfully")
        
        return report
