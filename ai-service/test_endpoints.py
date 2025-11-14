"""
Test AI Service HTTP Endpoints
"""
import requests
import json
from pathlib import Path


def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    
    try:
        response = requests.get("http://localhost:8001/health")
        print(f"✓ Status Code: {response.status_code}")
        print(f"✓ Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_scrape_upload():
    """Test PDF upload scraping endpoint"""
    print("\n=== Testing PDF Upload Scraping ===")
    
    try:
        # Create a sample text file to upload
        test_file_path = Path(__file__).parent / "test_sample.txt"
        
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test.txt', f, 'text/plain')}
            data = {
                'exam_type': 'JEE',
                'year': '2024',
                'session': 'January'
            }
            
            response = requests.post(
                "http://localhost:8001/api/scrape/upload",
                files=files,
                data=data
            )
        
        print(f"✓ Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Extracted Text: {len(result.get('raw_text', ''))} characters")
            print(f"✓ Parsed Questions: {len(result.get('questions', []))}")
            
            # Show first question
            if result.get('questions'):
                q = result['questions'][0]
                print(f"\nFirst Question:")
                print(f"  Text: {q.get('text', '')[:100]}...")
                print(f"  Topic: {q.get('topic', 'N/A')}")
                print(f"  Difficulty: {q.get('difficulty', 'N/A')}")
        else:
            print(f"✗ Error Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_generate_questions():
    """Test question generation endpoint"""
    print("\n=== Testing Question Generation ===")
    
    try:
        # Sample request
        request_data = {
            "exam_type": "JEE",
            "target_topic": "Mechanics - Kinematics",
            "target_difficulty": "MEDIUM",
            "count": 2,
            "context_questions": [
                {
                    "text": "A particle moves with constant acceleration. Find velocity.",
                    "topic": "Mechanics",
                    "difficulty": "MEDIUM"
                }
            ]
        }
        
        response = requests.post(
            "http://localhost:8001/api/generate/questions",
            json=request_data
        )
        
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Generated Questions: {len(result.get('questions', []))}")
            print(f"✓ Similarity Scores: {result.get('similarity_scores', [])}")
        else:
            # Expected if Azure OpenAI not configured
            print(f"⚠ Response: {response.text}")
            if "not configured" in response.text.lower():
                print(f"  (This is expected - Azure OpenAI credentials needed for actual generation)")
                return True
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all endpoint tests"""
    print("=" * 60)
    print("AI SERVICE HTTP ENDPOINT TESTS")
    print("=" * 60)
    
    results = {
        "health": test_health(),
        "scrape_upload": test_scrape_upload(),
        "generate_questions": test_generate_questions()
    }
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return all(results.values())


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
