# RAG Challenge Arena

A platform for testing and evaluating RAG (Retrieval-Augmented Generation) agents through real-world challenges.

## Overview

RAG Arena provides structured challenges where participants build agents that:
1. **Retrieve** relevant information from a knowledge base
2. **Reason** through the retrieved context
3. **Respond** with accurate, well-cited answers

## Challenges

### 1. The Fact-Check Spider (Beginner)
Verify claims against a Wikipedia-style knowledge base. Your agent must search for evidence and determine if claims are True, False, or Partially True.

### 2. The Legal Clerk (Medium)
Answer zoning law questions using the Alphaville Zoning Code. The code contains intentionally conflicting rules that require careful analysis and synthesis.

## Project Structure

```
alpha-ai-challenges/
├── frontend/                 # Next.js web application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   └── lib/                  # Utilities and API client
├── backend/                  # FastAPI server
│   ├── main.py              # API entry point
│   ├── knowledge_base/      # Vector store and search
│   ├── evaluation/          # LLM-as-Judge scoring
│   ├── submissions/         # Submission handlers
│   └── db/                  # Database models
└── data/                    # Challenge datasets
    ├── wikipedia_articles/  # Fact-check KB
    └── zoning_laws/         # Legal KB
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key (for evaluation)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn main:app --reload --port 8006
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000` to access the web interface.

## Submission Methods

### Method 1: API Endpoint

Host your agent as an API endpoint that accepts POST requests:

```json
// Request
{
  "claim": "The Eiffel Tower was built in 1889",
  "kb_search_url": "http://localhost:8006/api/kb/factcheck/search"
}

// Response
{
  "thought_process": "I searched for information about the Eiffel Tower...",
  "retrieved_context_ids": ["wiki_eiffel_tower"],
  "final_answer": "True",
  "citation": "wiki_eiffel_tower: 'constructed from 1887 to 1889'"
}
```

### Method 2: Python File

Upload a Python file with a `solve` function:

```python
def solve(query: str, search_api_url: str) -> dict:
    # Your implementation
    return {
        "thought_process": "...",
        "retrieved_context_ids": ["..."],
        "final_answer": "...",
        "citation": "..."
    }
```

## Knowledge Base API

Search the knowledge base using:

```bash
# Fact-check KB
curl -X POST http://localhost:8006/api/kb/factcheck/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Eiffel Tower construction", "top_k": 5}'

# Legal KB
curl -X POST http://localhost:8006/api/kb/legal/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Zone B height limits", "top_k": 5}'
```

## Evaluation Metrics

Submissions are evaluated using LLM-as-Judge with the following metrics:

| Metric | Weight | Description |
|--------|--------|-------------|
| Retrieval Score | 20% | Did the agent find the correct documents? |
| Answer Correctness | 30% | Is the final answer correct? |
| Faithfulness | 25% | Is the answer grounded in retrieved text? |
| Reasoning Quality | 25% | Is the thought process logical? |

## Anti-Cheating Measures

1. **Dev/Test Split**: Sample questions for development; hidden questions for final evaluation
2. **Dynamic KB**: Final evaluation may use modified facts
3. **Trajectory Analysis**: Thought process is required and evaluated

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **Backend**: FastAPI, Python
- **Vector DB**: ChromaDB with sentence-transformers
- **Database**: SQLite
- **Evaluation**: OpenAI GPT-4 as Judge

## License

MIT

