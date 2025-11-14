"""
AI Prompt Builder Service - Build prompts for question generation
Uses PYQ context to generate realistic questions
"""
import logging
from typing import Dict, Any, List, Optional
import json

logger = logging.getLogger(__name__)


class PromptBuilderService:
    """Service for building AI prompts using PYQ context"""
    
    def __init__(self):
        """Initialize prompt builder"""
        self.logger = logger
    
    async def build_question_generation_prompt(
        self,
        target_topic: str,
        target_difficulty: str,
        exam_type: str,
        context_questions: List[Dict[str, Any]],
        pattern_analysis: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Build a prompt for generating a new question
        
        Args:
            target_topic: Topic for the new question
            target_difficulty: Difficulty level
            exam_type: Type of exam (JEE, NEET)
            context_questions: Similar PYQs for context
            pattern_analysis: Pattern analysis data
            
        Returns:
            Formatted prompt for AI model
        """
        # Build context from previous years questions
        context_examples = self._format_context_questions(context_questions[:5])
        
        # Build pattern insights
        pattern_insights = ""
        if pattern_analysis:
            pattern_insights = self._format_pattern_insights(pattern_analysis)
        
        # Build the prompt
        prompt = f"""You are an expert question paper setter for {exam_type} exams in India.

Your task is to generate a NEW {target_difficulty} difficulty question on the topic: {target_topic}

IMPORTANT GUIDELINES:
1. The question MUST be realistic and match the style of actual {exam_type} papers
2. Use the context from previous years questions below to understand:
   - Question phrasing style
   - Difficulty level expectations
   - Common patterns and formats
3. The question should be ORIGINAL - do not copy from the examples
4. Include 4 options (A, B, C, D) with only ONE correct answer
5. Provide a brief explanation for the correct answer
6. Include the concepts being tested

{pattern_insights}

CONTEXT - Previous Years Questions on {target_topic}:
{context_examples}

Now generate a NEW question following the same style and difficulty level.

Return your response in this exact JSON format:
{{
  "question_text": "Your question here...",
  "options": [
    {{"key": "A", "text": "Option A text"}},
    {{"key": "B", "text": "Option B text"}},
    {{"key": "C", "text": "Option C text"}},
    {{"key": "D", "text": "Option D text"}}
  ],
  "correct_answer": "A",
  "explanation": "Brief explanation of why this is correct...",
  "concepts_tested": ["Concept1", "Concept2"],
  "difficulty": "{target_difficulty}",
  "topic": "{target_topic}"
}}
"""
        
        return prompt
    
    def _format_context_questions(
        self,
        questions: List[Dict[str, Any]]
    ) -> str:
        """Format context questions for the prompt"""
        formatted = []
        
        for i, q in enumerate(questions, 1):
            options_text = ""
            if q.get("options"):
                options_text = "\n".join([
                    f"  {opt['key']}. {opt['text']}"
                    for opt in q["options"]
                ])
            
            formatted.append(f"""
Example {i} (Year: {q.get('year', 'N/A')}, Difficulty: {q.get('difficulty', 'N/A')}):
Question: {q.get('text', 'N/A')}
{options_text}
Correct Answer: {q.get('correct_answer', 'N/A')}
Concepts: {', '.join(q.get('concepts_tested', []))}
""")
        
        return "\n".join(formatted)
    
    def _format_pattern_insights(
        self,
        pattern_analysis: Dict[str, Any]
    ) -> str:
        """Format pattern insights for the prompt"""
        insights = []
        
        # Topic trends
        if "topic_patterns" in pattern_analysis:
            trends = pattern_analysis["topic_patterns"].get("trends", {})
            if trends:
                insights.append("PATTERN INSIGHTS:")
                for topic, trend in list(trends.items())[:5]:
                    insights.append(f"- {topic}: {trend} trend in recent years")
        
        # Common concepts
        if "concept_patterns" in pattern_analysis:
            top_concepts = pattern_analysis["concept_patterns"].get("top_concepts", [])
            if top_concepts:
                concepts_list = [concept for concept, _ in top_concepts[:10]]
                insights.append(f"\nFrequently tested concepts: {', '.join(concepts_list)}")
        
        return "\n".join(insights)
    
    async def build_batch_generation_prompt(
        self,
        target_specs: List[Dict[str, Any]],
        exam_type: str,
        context_questions: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Build prompts for batch question generation
        
        Args:
            target_specs: List of specifications for questions to generate
            exam_type: Type of exam
            context_questions: Context from PYQs
            
        Returns:
            List of prompts
        """
        prompts = []
        
        for spec in target_specs:
            # Filter relevant context questions
            relevant_context = [
                q for q in context_questions
                if q.get("topic") == spec.get("topic")
                and q.get("difficulty") == spec.get("difficulty")
            ]
            
            prompt = await self.build_question_generation_prompt(
                target_topic=spec["topic"],
                target_difficulty=spec["difficulty"],
                exam_type=exam_type,
                context_questions=relevant_context[:5]
            )
            
            prompts.append(prompt)
        
        return prompts
    
    async def build_validation_prompt(
        self,
        generated_question: Dict[str, Any],
        exam_type: str
    ) -> str:
        """
        Build a prompt for validating a generated question
        
        Args:
            generated_question: The generated question to validate
            exam_type: Type of exam
            
        Returns:
            Validation prompt
        """
        prompt = f"""You are an expert reviewer for {exam_type} exam questions.

Review the following generated question for quality and accuracy:

Question: {generated_question.get('text', 'N/A')}
Options:
"""
        
        for opt in generated_question.get("options", []):
            prompt += f"  {opt['key']}. {opt['text']}\n"
        
        prompt += f"""
Correct Answer: {generated_question.get('correct_answer', 'N/A')}
Difficulty: {generated_question.get('difficulty', 'N/A')}
Topic: {generated_question.get('topic', 'N/A')}

Evaluate the question on these criteria:
1. Factual Accuracy: Is the question scientifically/mathematically correct?
2. Answer Correctness: Is the marked answer actually correct?
3. Clarity: Is the question clearly worded?
4. Difficulty Match: Does the difficulty match the level?
5. Options Quality: Are all options plausible?

Return your response in JSON format:
{{
  "is_valid": true/false,
  "factual_accuracy": true/false,
  "answer_correctness": true/false,
  "clarity_score": 1-10,
  "difficulty_match": true/false,
  "options_quality": 1-10,
  "issues": ["list of any issues found"],
  "suggestions": ["list of improvement suggestions"]
}}
"""
        
        return prompt
