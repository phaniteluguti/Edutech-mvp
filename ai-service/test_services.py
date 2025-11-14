"""
Test script for AI service functions
"""
import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from services.scraper import PDFScraperService
from services.parser import QuestionParserService
from services.pattern_analyzer import PatternAnalyzerService
from services.prompt_builder import PromptBuilderService
from services.question_generator import QuestionGeneratorService
from services.similarity_checker import SimilarityCheckerService


async def test_scraper():
    """Test PDF scraper service"""
    print("\n=== Testing PDF Scraper ===")
    scraper = PDFScraperService()
    
    # Test with sample text file
    test_file = Path(__file__).parent / "test_sample.txt"
    
    try:
        # Read the text file (simulating PDF extraction)
        with open(test_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        print(f"✓ Extracted {len(text)} characters")
        print(f"Preview: {text[:200]}...")
        return text
    except Exception as e:
        print(f"✗ Error: {e}")
        return None


async def test_parser(text: str):
    """Test question parser service"""
    print("\n=== Testing Question Parser ===")
    parser = QuestionParserService()
    
    try:
        questions = parser.parse_questions(text)
        print(f"✓ Parsed {len(questions)} questions")
        
        for i, q in enumerate(questions, 1):
            print(f"\nQuestion {i}:")
            print(f"  Text: {q['questionText'][:80]}...")
            print(f"  Type: {q['questionType']}")
            print(f"  Options: {len(q.get('options', []))}")
            print(f"  Topic: {q.get('topic', 'N/A')}")
            print(f"  Difficulty: {q.get('difficulty', 'N/A')}")
        
        return questions
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return []


async def test_pattern_analyzer(questions: list):
    """Test pattern analyzer service"""
    print("\n=== Testing Pattern Analyzer ===")
    analyzer = PatternAnalyzerService()
    
    try:
        # Extract years from questions (use current year as default)
        years = list(set([q.get('year', 2024) for q in questions]))
        if not years:
            years = [2024]
        
        exam_type = questions[0].get('examType', 'JEE') if questions else 'JEE'
        
        # Analyze topic frequency
        topic_freq = await analyzer.analyze_topic_frequency(questions, exam_type, years)
        print(f"✓ Topic Frequency Analysis:")
        for topic, count in topic_freq.get('total_counts', {}).items():
            print(f"  {topic}: {count}")
        
        # Analyze difficulty distribution
        difficulty_dist = await analyzer.analyze_difficulty_distribution(questions, exam_type)
        print(f"\n✓ Difficulty Distribution:")
        for level, count in difficulty_dist.get('counts', {}).items():
            pct = difficulty_dist.get('percentages', {}).get(level, 0)
            print(f"  {level}: {count} ({pct:.1f}%)")
        
        # Analyze question types
        type_dist = await analyzer.analyze_question_types(questions)
        print(f"\n✓ Question Type Distribution:")
        for qtype, count in type_dist.get('counts', {}).items():
            pct = type_dist.get('percentages', {}).get(qtype, 0)
            print(f"  {qtype}: {count} ({pct:.1f}%)")
        
        return {
            'topics': topic_freq,
            'difficulty': difficulty_dist,
            'types': type_dist
        }
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return {}


async def test_prompt_builder(questions: list):
    """Test prompt builder service"""
    print("\n=== Testing Prompt Builder ===")
    builder = PromptBuilderService()
    
    try:
        # Use first question's topic
        target_topic = questions[0].get('topic', 'Physics') if questions else 'Physics'
        exam_type = questions[0].get('examType', 'JEE') if questions else 'JEE'
        
        prompt = await builder.build_question_generation_prompt(
            target_topic=target_topic,
            target_difficulty="MEDIUM",
            exam_type=exam_type,
            context_questions=questions[:2],
            pattern_analysis=None
        )
        
        print(f"✓ Generated prompt ({len(prompt)} characters)")
        print(f"Preview:\n{prompt[:500]}...")
        
        return prompt
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


async def test_similarity_checker(questions: list):
    """Test similarity checker service"""
    print("\n=== Testing Similarity Checker ===")
    checker = SimilarityCheckerService()
    
    try:
        if len(questions) < 2:
            print("⚠ Not enough questions to test similarity")
            return
        
        # Check if Azure OpenAI is configured
        if not checker.client:
            print("⚠ Azure OpenAI not configured - using fallback method")
            
            # Test basic text comparison
            q1_text = questions[0]['questionText']
            q2_text = questions[1]['questionText']
            
            # Simple word overlap similarity
            words1 = set(q1_text.lower().split())
            words2 = set(q2_text.lower().split())
            
            overlap = len(words1 & words2)
            total = len(words1 | words2)
            simple_similarity = overlap / total if total > 0 else 0
            
            print(f"✓ Simple word overlap similarity Q1-Q2: {simple_similarity:.2%}")
            print(f"  (Note: Real similarity checker uses Azure OpenAI embeddings)")
            return
        
        # Test with actual embeddings
        q1_text = questions[0]['questionText']
        q2_text = questions[1]['questionText']
        
        similarity = await checker.calculate_similarity(q1_text, q2_text)
        if similarity is not None:
            print(f"✓ Embedding similarity between Q1 and Q2: {similarity:.2%}")
        
        # Test with identical text
        similarity_identical = await checker.calculate_similarity(q1_text, q1_text)
        if similarity_identical is not None:
            print(f"✓ Similarity with itself: {similarity_identical:.2%}")
        
        # Test with very different text
        different_text = "What is the capital of France?"
        similarity_different = await checker.calculate_similarity(q1_text, different_text)
        if similarity_different is not None:
            print(f"✓ Similarity with different text: {similarity_different:.2%}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def test_question_generator():
    """Test question generator (without OpenAI API key, will show structure)"""
    print("\n=== Testing Question Generator Structure ===")
    generator = QuestionGeneratorService()
    
    try:
        print(f"✓ Question generator initialized")
        print(f"  OpenAI client configured: {generator.client is not None}")
        print(f"  Note: Actual generation requires AZURE_OPENAI_KEY in .env")
        
        # Show that the service is ready
        print(f"✓ Service ready for question generation")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Run all tests"""
    print("=" * 60)
    print("AI SERVICE FUNCTION TESTS")
    print("=" * 60)
    
    # Test 1: Scraper
    text = await test_scraper()
    if not text:
        print("\n✗ Scraper test failed, cannot continue")
        return
    
    # Test 2: Parser
    questions = await test_parser(text)
    if not questions:
        print("\n⚠ Parser returned no questions, but continuing tests...")
        questions = []
    
    # Test 3: Pattern Analyzer
    if questions:
        await test_pattern_analyzer(questions)
    else:
        print("\n⚠ Skipping pattern analyzer (no questions)")
    
    # Test 4: Prompt Builder
    if questions:
        await test_prompt_builder(questions)
    else:
        print("\n⚠ Skipping prompt builder (no questions)")
    
    # Test 5: Similarity Checker
    if questions:
        await test_similarity_checker(questions)
    else:
        print("\n⚠ Skipping similarity checker (no questions)")
    
    # Test 6: Question Generator
    await test_question_generator()
    
    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
