"""
Vector store setup using ChromaDB for the knowledge bases.
"""
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import os
from typing import List, Dict, Any

# Use sentence-transformers for embeddings
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# ChromaDB client (persistent storage, telemetry disabled)
chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(anonymized_telemetry=False)
)

# Embedding function
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=EMBEDDING_MODEL
)


def get_or_create_collection(name: str):
    """Get or create a ChromaDB collection."""
    return chroma_client.get_or_create_collection(
        name=name,
        embedding_function=sentence_transformer_ef,
        metadata={"hnsw:space": "cosine"}
    )


class KnowledgeBase:
    """Base class for knowledge bases."""
    
    def __init__(self, collection_name: str):
        self.collection = get_or_create_collection(collection_name)
        self.collection_name = collection_name
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to the collection."""
        ids = [doc["id"] for doc in documents]
        contents = [doc["content"] for doc in documents]
        metadatas = [doc.get("metadata", {}) for doc in documents]
        
        self.collection.add(
            ids=ids,
            documents=contents,
            metadatas=metadatas
        )
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search the knowledge base."""
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        formatted_results = []
        for i in range(len(results["ids"][0])):
            formatted_results.append({
                "doc_id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "score": 1 - results["distances"][0][i],  # Convert distance to similarity
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {}
            })
        
        return formatted_results
    
    def get_document(self, doc_id: str) -> Dict[str, Any]:
        """Get a specific document by ID."""
        result = self.collection.get(ids=[doc_id], include=["documents", "metadatas"])
        if result["ids"]:
            return {
                "doc_id": result["ids"][0],
                "content": result["documents"][0],
                "metadata": result["metadatas"][0] if result["metadatas"] else {}
            }
        return None
    
    def count(self) -> int:
        """Get the number of documents in the collection."""
        return self.collection.count()


# Global instances
factcheck_kb = None
legal_kb = None


def init_factcheck_kb() -> KnowledgeBase:
    """Initialize the fact-checking knowledge base."""
    global factcheck_kb
    if factcheck_kb is None:
        factcheck_kb = KnowledgeBase("factcheck")
        
        # Load documents if collection is empty
        if factcheck_kb.count() == 0:
            from knowledge_base.data_loader import load_wikipedia_articles
            documents = load_wikipedia_articles()
            if documents:
                factcheck_kb.add_documents(documents)
                print(f"Loaded {len(documents)} Wikipedia articles into fact-check KB")
    
    return factcheck_kb


def init_legal_kb() -> KnowledgeBase:
    """Initialize the legal/zoning knowledge base."""
    global legal_kb
    if legal_kb is None:
        legal_kb = KnowledgeBase("legal")
        
        # Load documents if collection is empty
        if legal_kb.count() == 0:
            from knowledge_base.data_loader import load_zoning_laws
            documents = load_zoning_laws()
            if documents:
                legal_kb.add_documents(documents)
                print(f"Loaded {len(documents)} zoning law clauses into legal KB")
    
    return legal_kb
