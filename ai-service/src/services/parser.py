"""
Question Parser Service - Parse and structure questions from text
Uses NLP to identify question components, options, answers
"""
import logging
from typing import Dict, Any, List, Optional
import re

logger = logging.getLogger(__name__)


class QuestionParserService:
    """Service for parsing questions from text into structured format"""
    
    def __init__(self):
        """Initialize question parser"""
        self.logger = logger
    
    def parse_questions(self, text: str, exam_type: str = "JEE") -> List[Dict[str, Any]]:
        """
        Parse all questions from a text block
        
        Args:
            text: Full text containing multiple questions
            exam_type: Type of exam (default: JEE)
            
        Returns:
            List of parsed questions
        """
        questions = []
        
        # Split text into individual questions using "Question X:" pattern
        question_blocks = re.split(r'Question\s+\d+:', text, flags=re.IGNORECASE)
        
        # Remove empty first element if text starts with "Question 1:"
        question_blocks = [block.strip() for block in question_blocks if block.strip()]
        
        for i, block in enumerate(question_blocks, 1):
            try:
                # Extract question text (everything before options)
                question_match = re.search(r'^(.*?)(?=\n\s*\(?[A-D]\)|\nAnswer:)', block, re.DOTALL)
                question_text = question_match.group(1).strip() if question_match else block.split('\n')[0]
                
                # Extract options
                options = []
                option_pattern = r'\(([A-D])\)\s*([^\n]+)'
                for match in re.finditer(option_pattern, block):
                    options.append({
                        "key": match.group(1),
                        "text": match.group(2).strip()
                    })
                
                # Extract answer
                answer_match = re.search(r'Answer:\s*([A-D])', block, re.IGNORECASE)
                correct_answer = answer_match.group(1) if answer_match else "A"
                
                # Extract difficulty
                difficulty_match = re.search(r'Difficulty:\s*(EASY|MEDIUM|HARD)', block, re.IGNORECASE)
                difficulty = difficulty_match.group(1).upper() if difficulty_match else "MEDIUM"
                
                # Extract topic
                topic_match = re.search(r'Topic:\s*([^\n]+)', block, re.IGNORECASE)
                topic = topic_match.group(1).strip() if topic_match else "General"
                
                # Determine question type
                question_type = "SINGLE_CHOICE" if options else "NUMERICAL"
                
                questions.append({
                    "questionText": question_text,
                    "options": options,
                    "correctAnswer": correct_answer,
                    "questionType": question_type,
                    "topic": topic,
                    "difficulty": difficulty,
                    "examType": exam_type
                })
                
            except Exception as e:
                self.logger.error(f"Error parsing question block {i}: {str(e)}")
                continue
        
        return questions
    
    async def parse_question(
        self,
        raw_text: str,
        exam_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Parse a single question from raw text
        
        Args:
            raw_text: Raw question text
            exam_type: Type of exam (JEE, NEET, etc.)
            
        Returns:
            Parsed question structure or None if parsing fails
        """
        try:
            # Extract question components
            question_text = self._extract_question_text(raw_text)
            options = self._extract_options(raw_text)
            answer = self._extract_answer(raw_text, options)
            
            # Determine question type
            question_type = self._determine_question_type(options)
            
            # Extract topic and difficulty (basic heuristics)
            topic = self._extract_topic(question_text, exam_type)
            difficulty = self._estimate_difficulty(question_text)
            
            # Extract concepts tested
            concepts = self._extract_concepts(question_text, exam_type)
            
            parsed = {
                "text": question_text,
                "options": options,
                "correct_answer": answer,
                "question_type": question_type,
                "topic": topic,
                "difficulty": difficulty,
                "concepts_tested": concepts,
            }
            
            return parsed
            
        except Exception as e:
            self.logger.error(f"Error parsing question: {str(e)}")
            return None
    
    def _extract_question_text(self, raw_text: str) -> str:
        """Extract the main question text, removing metadata"""
        # Remove question numbers
        text = re.sub(r'^Q(?:uestion)?\s*\d+[\.\)]\s*', '', raw_text, flags=re.IGNORECASE)
        text = re.sub(r'^\d+[\.\)]\s*', '', text)
        
        # Extract text up to options (A), (B), etc.
        match = re.search(r'^(.*?)(?:\n\s*\(?[A-D]\))', text, re.DOTALL)
        if match:
            text = match.group(1)
        
        return text.strip()
    
    def _extract_options(self, raw_text: str) -> Optional[List[Dict[str, str]]]:
        """
        Extract multiple choice options
        
        Returns:
            List of options or None for numerical/subjective questions
        """
        options = []
        
        # Pattern for options: (A), (B), A., B., etc.
        option_pattern = r'\(?([A-D])\)?\.\s*([^\n]+)'
        
        matches = re.finditer(option_pattern, raw_text, re.MULTILINE)
        
        for match in matches:
            option_key = match.group(1)
            option_text = match.group(2).strip()
            
            options.append({
                "key": option_key,
                "text": option_text
            })
        
        return options if options else None
    
    def _extract_answer(
        self,
        raw_text: str,
        options: Optional[List[Dict[str, str]]]
    ) -> str:
        """Extract the correct answer"""
        # Look for "Answer:" or "Ans:" markers
        answer_patterns = [
            r'Answer:\s*([A-D]|\d+(?:\.\d+)?)',
            r'Ans:\s*([A-D]|\d+(?:\.\d+)?)',
            r'Correct\s+(?:Answer|Option):\s*([A-D])',
        ]
        
        for pattern in answer_patterns:
            match = re.search(pattern, raw_text, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        
        # If options exist, default to first option (will need manual verification)
        if options:
            return options[0]["key"]
        
        return "UNKNOWN"
    
    def _determine_question_type(
        self,
        options: Optional[List[Dict[str, str]]]
    ) -> str:
        """Determine question type based on options"""
        if not options:
            return "NUMERICAL"
        
        if len(options) == 4:
            return "SINGLE_CHOICE"
        
        # Check for assertion-reason pattern
        if any("assertion" in opt["text"].lower() for opt in options):
            return "ASSERTION_REASON"
        
        return "SINGLE_CHOICE"
    
    def _extract_topic(self, question_text: str, exam_type: str) -> str:
        """
        Extract topic from question text
        Basic keyword matching - will be enhanced with NLP
        """
        # JEE topics
        jee_topics = {
            "Physics": ["force", "motion", "energy", "electric", "magnetic", "optics", "wave"],
            "Chemistry": ["reaction", "compound", "element", "acid", "base", "organic", "inorganic"],
            "Mathematics": ["equation", "integral", "derivative", "matrix", "vector", "probability"],
        }
        
        # NEET topics
        neet_topics = {
            "Physics": ["force", "motion", "energy", "electric", "magnetic", "optics", "wave"],
            "Chemistry": ["reaction", "compound", "element", "acid", "base", "organic", "inorganic"],
            "Biology": ["cell", "tissue", "organ", "genetics", "evolution", "ecology", "plant", "animal"],
        }
        
        topics = jee_topics if exam_type == "JEE" else neet_topics
        
        text_lower = question_text.lower()
        
        for topic, keywords in topics.items():
            if any(keyword in text_lower for keyword in keywords):
                return topic
        
        return "General"
    
    def _estimate_difficulty(self, question_text: str) -> str:
        """
        Estimate difficulty based on text complexity
        Basic heuristic - will be enhanced
        """
        # Simple heuristic: longer questions with complex terms = harder
        word_count = len(question_text.split())
        
        if word_count < 30:
            return "EASY"
        elif word_count < 60:
            return "MEDIUM"
        else:
            return "HARD"
    
    def _extract_concepts(self, question_text: str, exam_type: str) -> List[str]:
        """
        Extract key concepts from question text
        Basic keyword extraction - will use NLP later
        """
        concepts = []
        
        # Common physics concepts
        physics_concepts = [
            "Newton's Laws", "Kinematics", "Work-Energy", "Momentum",
            "Gravitation", "Electrostatics", "Magnetism", "Optics"
        ]
        
        # Common chemistry concepts
        chemistry_concepts = [
            "Stoichiometry", "Chemical Bonding", "Thermodynamics",
            "Equilibrium", "Redox", "Organic Reactions"
        ]
        
        # Common math concepts
        math_concepts = [
            "Algebra", "Calculus", "Trigonometry", "Coordinate Geometry",
            "Probability", "Statistics", "Vectors", "Matrices"
        ]
        
        all_concepts = physics_concepts + chemistry_concepts + math_concepts
        
        text_lower = question_text.lower()
        
        for concept in all_concepts:
            if concept.lower() in text_lower:
                concepts.append(concept)
        
        return concepts if concepts else ["General"]
    
    async def batch_parse_questions(
        self,
        raw_questions: List[Dict[str, Any]],
        exam_type: str
    ) -> List[Dict[str, Any]]:
        """
        Parse multiple questions in batch
        
        Args:
            raw_questions: List of raw question data
            exam_type: Type of exam
            
        Returns:
            List of parsed questions
        """
        parsed_questions = []
        
        for raw_q in raw_questions:
            parsed = await self.parse_question(raw_q.get("text", ""), exam_type)
            
            if parsed:
                # Merge with original metadata
                parsed.update({
                    "exam_type": raw_q.get("exam_type"),
                    "year": raw_q.get("year"),
                    "session": raw_q.get("session"),
                    "question_number": raw_q.get("question_number"),
                    "scrape_source": raw_q.get("scrape_source"),
                })
                parsed_questions.append(parsed)
        
        self.logger.info(f"Successfully parsed {len(parsed_questions)}/{len(raw_questions)} questions")
        
        return parsed_questions
