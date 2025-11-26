"""
RAG Challenge Platform - Backend API
"""
from dotenv import load_dotenv
load_dotenv()  # Load .env file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import init_db
from knowledge_base.router import router as kb_router
from submissions.router import router as submissions_router
from evaluation.router import router as evaluation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and vector stores on startup."""
    await init_db()
    yield


app = FastAPI(
    title="RAG Challenge Platform",
    description="API for RAG-based Agent Challenges",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://whale-app-x8ze8.ondigitalocean.app",  # Production frontend
        "https://squid-app-7q77b.ondigitalocean.app",  # Production backend
        "*"  # Allow all origins for the hackathon
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(kb_router, prefix="/api/kb", tags=["Knowledge Base"])
app.include_router(submissions_router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(evaluation_router, prefix="/api/evaluation", tags=["Evaluation"])


@app.get("/")
async def root():
    return {"message": "RAG Challenge Platform API", "version": "1.0.0"}


@app.get("/api/challenges")
async def get_challenges():
    """Return list of available challenges."""
    return {
        "challenges": [
            {
                "id": "factcheck",
                "name": "The Fact-Check Spider",
                "difficulty": "Beginner",
                "description": "Verify claims against a Wikipedia-style knowledge base. Search for evidence, retrieve relevant documents, and determine if claims are True, False, or Partially True.",
                "theme": "Research",
                "kb_endpoint": "/api/kb/factcheck/search",
                "sample_questions": 10,
                "total_questions": 50,
                "metrics": ["Retrieval Recall", "Verdict Accuracy", "Hallucination Detection"],
                "expected_output": {
                    "thought_process": "Your reasoning steps...",
                    "retrieved_context_ids": ["doc_1", "doc_2"],
                    "final_answer": "True/False/Partially True",
                    "citation": "doc_id, relevant quote"
                }
            },
            {
                "id": "legal",
                "name": "The Legal Clerk",
                "difficulty": "Medium",
                "description": "Answer zoning law questions by synthesizing potentially conflicting rules. Must identify contradictions and provide clause-based citations.",
                "theme": "Law / Compliance",
                "kb_endpoint": "/api/kb/legal/search",
                "sample_questions": 10,
                "total_questions": 50,
                "metrics": ["Answer Faithfulness", "Conflict Detection", "Citation Accuracy"],
                "expected_output": {
                    "thought_process": "Your reasoning steps...",
                    "retrieved_context_ids": ["clause_1", "clause_2"],
                    "final_answer": "Yes/No with explanation",
                    "citation": "Clause X.Y.Z"
                }
            }
        ]
    }


@app.get("/api/challenges/{challenge_id}/sample-questions")
async def get_sample_questions(challenge_id: str):
    """Return sample questions for development (dev set)."""
    if challenge_id == "factcheck":
        return {
            "challenge_id": "factcheck",
            "questions": [
                {"id": "fc_dev_1", "claim": "The Eiffel Tower was completed in 1889 for the World's Fair."},
                {"id": "fc_dev_2", "claim": "Albert Einstein was born in Germany in 1879."},
                {"id": "fc_dev_3", "claim": "The Great Wall of China is visible from the Moon with the naked eye."},
                {"id": "fc_dev_4", "claim": "Water boils at 100 degrees Celsius at sea level."},
                {"id": "fc_dev_5", "claim": "The Amazon River is the longest river in the world."},
                {"id": "fc_dev_6", "claim": "Shakespeare wrote exactly 37 plays during his lifetime."},
                {"id": "fc_dev_7", "claim": "The human body has 206 bones."},
                {"id": "fc_dev_8", "claim": "Mount Everest is located in Nepal and Tibet."},
                {"id": "fc_dev_9", "claim": "The speed of light is approximately 300,000 kilometers per second."},
                {"id": "fc_dev_10", "claim": "Vincent van Gogh sold only one painting during his lifetime."},
            ]
        }
    elif challenge_id == "legal":
        return {
            "challenge_id": "legal",
            "questions": [
                {"id": "legal_dev_1", "query": "Can I build a 3-story residential building in Zone B?"},
                {"id": "legal_dev_2", "query": "What is the maximum lot coverage allowed in Zone A-Commercial?"},
                {"id": "legal_dev_3", "query": "Can I operate a home-based bakery in Zone R-1?"},
                {"id": "legal_dev_4", "query": "What setback requirements apply to corner lots in Zone B?"},
                {"id": "legal_dev_5", "query": "Can I build a detached garage exceeding 400 square feet in Zone R-2?"},
                {"id": "legal_dev_6", "query": "Are solar panels allowed on historic buildings in the Heritage District?"},
                {"id": "legal_dev_7", "query": "What parking requirements apply to a restaurant in Zone C-1?"},
                {"id": "legal_dev_8", "query": "Can I subdivide my 1-acre lot into two parcels in Zone R-1?"},
                {"id": "legal_dev_9", "query": "What height restrictions apply to fences in front yards?"},
                {"id": "legal_dev_10", "query": "Can I convert my single-family home to a duplex in Zone R-2?"},
            ]
        }
    return {"error": "Challenge not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)

