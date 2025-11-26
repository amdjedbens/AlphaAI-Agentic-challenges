"""
API routes for knowledge base search endpoints.
"""
from fastapi import APIRouter, HTTPException
from db.models import SearchRequest, SearchResponse, SearchResult
from knowledge_base.vector_store import init_factcheck_kb, init_legal_kb

router = APIRouter()


@router.post("/factcheck/search", response_model=SearchResponse)
async def search_factcheck(request: SearchRequest):
    """
    Search the fact-checking knowledge base (Wikipedia articles).
    
    This endpoint is used by participants to retrieve relevant documents
    for verifying claims.
    """
    try:
        kb = init_factcheck_kb()
        results = kb.search(request.query, request.top_k)
        
        return SearchResponse(
            results=[
                SearchResult(
                    doc_id=r["doc_id"],
                    content=r["content"],
                    score=r["score"],
                    metadata=r["metadata"]
                )
                for r in results
            ],
            query=request.query,
            total_results=len(results)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.post("/legal/search", response_model=SearchResponse)
async def search_legal(request: SearchRequest):
    """
    Search the legal knowledge base (Alphaville Zoning Code).
    
    This endpoint is used by participants to retrieve relevant clauses
    for answering zoning law questions.
    """
    try:
        kb = init_legal_kb()
        results = kb.search(request.query, request.top_k)
        
        return SearchResponse(
            results=[
                SearchResult(
                    doc_id=r["doc_id"],
                    content=r["content"],
                    score=r["score"],
                    metadata=r["metadata"]
                )
                for r in results
            ],
            query=request.query,
            total_results=len(results)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.get("/factcheck/document/{doc_id}")
async def get_factcheck_document(doc_id: str):
    """Get a specific document from the fact-checking KB."""
    kb = init_factcheck_kb()
    doc = kb.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/legal/document/{doc_id}")
async def get_legal_document(doc_id: str):
    """Get a specific clause from the legal KB."""
    kb = init_legal_kb()
    doc = kb.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/factcheck/stats")
async def get_factcheck_stats():
    """Get statistics about the fact-checking knowledge base."""
    kb = init_factcheck_kb()
    return {
        "collection": "factcheck",
        "document_count": kb.count(),
        "description": "Wikipedia-style articles for fact verification"
    }


@router.get("/legal/stats")
async def get_legal_stats():
    """Get statistics about the legal knowledge base."""
    kb = init_legal_kb()
    return {
        "collection": "legal",
        "document_count": kb.count(),
        "description": "Alphaville Zoning Code clauses for legal queries"
    }

