from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EduTech AI Service",
    description="AI service for question generation from previous years papers",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:4000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class PreviousYearContext(BaseModel):
    questionText: str
    topic: str
    difficulty: str
    year: int

class GenerateQuestionRequest(BaseModel):
    examType: str
    subject: str
    topic: str
    difficulty: str
    count: int = 1
    previousYearExamples: List[PreviousYearContext] = []

class GeneratedQuestion(BaseModel):
    questionText: str
    options: List[str]
    correctAnswer: str
    explanation: str
    topic: str
    difficulty: str
    similarityScore: Optional[float] = None

class GenerateQuestionResponse(BaseModel):
    questions: List[GeneratedQuestion]
    usedPreviousYears: int

# Routes
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "azure_openai_configured": bool(os.getenv("AZURE_OPENAI_ENDPOINT"))
    }

@app.post("/api/v1/generate-questions", response_model=GenerateQuestionResponse)
async def generate_questions(request: GenerateQuestionRequest):
    """
    Generate realistic exam questions using AI with previous years papers as context.
    This is the core innovation of the platform.
    """
    
    # TODO: Implement actual Azure OpenAI integration
    # For now, return a stub response
    
    if not os.getenv("AZURE_OPENAI_ENDPOINT"):
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT in environment."
        )
    
    # Placeholder response
    return GenerateQuestionResponse(
        questions=[
            GeneratedQuestion(
                questionText=f"Sample {request.difficulty} question for {request.topic}",
                options=["Option A", "Option B", "Option C", "Option D"],
                correctAnswer="Option A",
                explanation="This is a placeholder explanation.",
                topic=request.topic,
                difficulty=request.difficulty,
                similarityScore=0.75
            )
        ],
        usedPreviousYears=len(request.previousYearExamples)
    )

@app.post("/api/v1/scrape-paper")
async def scrape_paper(pdf_url: str):
    """
    Scrape questions from a previous year exam paper PDF.
    """
    # TODO: Implement PDF scraping with pdfplumber
    raise HTTPException(status_code=501, detail="Scraping not yet implemented")

@app.post("/api/v1/analyze-patterns")
async def analyze_patterns(exam_type: str, years: int = 10):
    """
    Analyze patterns from previous years papers:
    - Topic frequency
    - Difficulty distribution
    - Question styles
    - Trending concepts
    """
    # TODO: Implement pattern analysis
    raise HTTPException(status_code=501, detail="Pattern analysis not yet implemented")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
