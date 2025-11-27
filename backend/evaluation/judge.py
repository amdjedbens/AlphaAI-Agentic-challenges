"""
LLM-as-a-Judge evaluation for RAG challenges.
Uses GPT-4o-mini to evaluate agent responses.
Falls back to simple rule-based evaluation if LLM is unavailable.
"""
import os
from typing import Dict, List, Any, Optional
from openai import OpenAI
import json

# Initialize OpenAI client
client = None


def get_openai_client():
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        client = OpenAI(api_key=api_key)
    return client


# Golden answers for evaluation - SPLIT INTO PUBLIC AND PRIVATE TEST SETS
# Public: Visible during competition (~30-40% of questions)
# Private: Hidden until competition ends (~60-70% of questions)

# ==================== FACTCHECK CHALLENGE ====================
# ==================== FACTCHECK CHALLENGE ====================
FACTCHECK_PUBLIC_ANSWERS = {
    # PUBLIC TEST SET - scores visible during competition
    "fc_test_1": {
        "claim": "The Eiffel Tower was completed in 1889 for the World's Fair.",
        "expected_verdict": "True",
        "expected_doc_ids": ["wiki_eiffel_tower"],
        "key_facts": ["completed 1889", "World's Fair", "centennial French Revolution"],
        "is_public": True
    },
    "fc_test_2": {
        "claim": "Albert Einstein was born in Germany in 1879.",
        "expected_verdict": "True",
        "expected_doc_ids": ["wiki_einstein"],
        "key_facts": ["born 1879", "German-born", "Ulm"],
        "is_public": True
    },
    "fc_test_3": {
        "claim": "The Great Wall of China is visible from the Moon with the naked eye.",
        "expected_verdict": "False",
        "expected_doc_ids": ["wiki_great_wall"],
        "key_facts": ["NOT visible", "myth debunked", "too narrow"],
        "is_public": True
    },
}

FACTCHECK_PRIVATE_ANSWERS = {
    # PRIVATE TEST SET - scores revealed only at end
    "fc_test_4": {
        "claim": "Water boils at 100 degrees Celsius at sea level.",
        "expected_verdict": "True",
        "expected_doc_ids": ["wiki_water_properties"],
        "key_facts": ["100 degrees Celsius", "sea level", "standard atmospheric pressure"],
        "is_public": False
    },
    "fc_test_5": {
        "claim": "The Amazon River is the longest river in the world.",
        "expected_verdict": "False",
        "expected_doc_ids": ["wiki_amazon_river", "wiki_nile_river"],
        "key_facts": ["second-longest", "Nile is longest"],
        "is_public": False
    },
}

# Combined for backward compatibility
FACTCHECK_GOLDEN_ANSWERS = {**FACTCHECK_PUBLIC_ANSWERS, **FACTCHECK_PRIVATE_ANSWERS}


# ==================== LEGAL CHALLENGE ====================
LEGAL_PUBLIC_ANSWERS = {
    # PUBLIC TEST SET - scores visible during competition
    "legal_test_1": {
        "query": "Can I build a 3-story residential building in Zone B?",
        "expected_answer": "It depends on location",
        "expected_clause_ids": ["clause_B_2", "clause_B_2_conflict"],
        "key_reasoning": ["conflict between clauses", "near R-1 boundary limits to 2 stories", "otherwise 4 stories allowed"],
        "is_public": True
    },
    "legal_test_2": {
        "query": "What is the maximum lot coverage allowed in Zone A-Commercial?",
        "expected_answer": "80%",
        "expected_clause_ids": ["clause_A_3"],
        "key_reasoning": ["80% maximum", "10% must be green space"],
        "is_public": True
    },
}

LEGAL_PRIVATE_ANSWERS = {
    # PRIVATE TEST SET - scores revealed only at end
    "legal_test_3": {
        "query": "Can I operate a home-based bakery in Zone R-1?",
        "expected_answer": "Conditionally yes",
        "expected_clause_ids": ["clause_R1_3", "clause_R1_3_exception"],
        "key_reasoning": ["generally prohibited", "exception with Special Use Permit", "cottage food operations", "health department approval"],
        "is_public": False
    },
}

# Combined for backward compatibility
LEGAL_GOLDEN_ANSWERS = {**LEGAL_PUBLIC_ANSWERS, **LEGAL_PRIVATE_ANSWERS}


def simple_factcheck_evaluation(
    agent_response: Dict[str, Any],
    golden_answer: Dict[str, Any]
) -> Dict[str, float]:
    """Simple rule-based evaluation as fallback when LLM judge unavailable. STRICT MODE."""
    scores = {"verdict_score": 0, "faithfulness_score": 4, "reasoning_score": 4}
    
    # Check verdict - strict
    agent_verdict = agent_response.get("final_answer", "").lower().strip()
    expected_verdict = golden_answer["expected_verdict"].lower().strip()
    
    if agent_verdict == expected_verdict:
        scores["verdict_score"] = 10
    elif "partial" in agent_verdict and expected_verdict in ["true", "false"]:
        scores["verdict_score"] = 4  # Reduced from 5
    
    # Check if citation exists and is specific
    citation = agent_response.get("citation", "")
    if citation and len(citation) > 100 and ":" in citation:  # Must have doc_id: quote format
        scores["faithfulness_score"] = 7
    elif citation and len(citation) > 50:
        scores["faithfulness_score"] = 5
    
    # Check if thought process is detailed
    thought = agent_response.get("thought_process", "")
    key_facts = golden_answer.get("key_facts", [])
    
    if thought and len(thought) > 100:
        # Check if key facts are mentioned
        facts_found = sum(1 for fact in key_facts if fact.lower() in thought.lower())
        if facts_found >= len(key_facts) * 0.6:
            scores["reasoning_score"] = 7
        elif facts_found >= len(key_facts) * 0.3:
            scores["reasoning_score"] = 5
    
    return scores


def evaluate_factcheck_response(
    question_id: str,
    agent_response: Dict[str, Any],
    golden_answer: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate a fact-check response using LLM-as-Judge.
    Falls back to simple evaluation if LLM unavailable.
    """
    # Check retrieval first (doesn't need LLM)
    retrieved_ids = agent_response.get("retrieved_context_ids", [])
    expected_ids = golden_answer["expected_doc_ids"]
    retrieval_hit = any(eid in retrieved_ids for eid in expected_ids)
    
    # Try to get OpenAI client
    try:
        client = get_openai_client()
    except ValueError as e:
        # No API key - use simple evaluation
        print(f"Warning: {e}. Using simple evaluation.")
        scores = simple_factcheck_evaluation(agent_response, golden_answer)
        return {
            "question_id": question_id,
            "retrieval_score": 10.0 if retrieval_hit else 0.0,
            "verdict_score": scores["verdict_score"],
            "faithfulness_score": scores["faithfulness_score"],
            "reasoning_score": scores["reasoning_score"],
            "feedback": "Evaluated using simple rules (LLM judge unavailable)",
            "overall_score": (
                (10.0 if retrieval_hit else 0.0) * 0.2 +
                scores["verdict_score"] * 0.4 +
                scores["faithfulness_score"] * 0.3 +
                scores["reasoning_score"] * 0.1
            )
        }
    
    # Use GPT-4 to evaluate the response - STRICT MODE
    judge_prompt = f"""You are a STRICT and DEMANDING judge evaluating a fact-checking AI agent.
Be rigorous - only give high scores (8+) for exceptional work.

CLAIM: {golden_answer['claim']}
EXPECTED VERDICT: {golden_answer['expected_verdict']}
KEY FACTS TO IDENTIFY: {', '.join(golden_answer['key_facts'])}

AGENT'S RESPONSE:
- Thought Process: {agent_response.get('thought_process', 'Not provided')}
- Retrieved Documents: {retrieved_ids}
- Final Answer: {agent_response.get('final_answer', 'Not provided')}
- Citation: {agent_response.get('citation', 'Not provided')}

STRICT EVALUATION CRITERIA:

1. VERDICT ACCURACY (0-10):
   - 10: Exactly correct verdict
   - 7: Correct but imprecise (e.g., "True" when "Partially True" is better)
   - 0: Wrong verdict

2. FAITHFULNESS (0-10) - BE STRICT:
   - 10: Exact quotes from documents, no added information
   - 7-8: Uses document info but paraphrases loosely
   - 5-6: Some claims not directly from documents
   - 0-4: Hallucinations or unsupported claims
   - DEDUCT 2 points if citation is vague or missing specific quotes
   - DEDUCT 3 points if thought process mentions facts not in retrieved docs

3. REASONING QUALITY (0-10) - BE STRICT:
   - 10: Step-by-step analysis, addresses ALL key facts, explains WHY
   - 7-8: Good reasoning but misses 1-2 key facts
   - 5-6: Basic reasoning, misses important nuances
   - 0-4: Superficial or illogical reasoning
   - DEDUCT 2 points if no clear methodology explained
   - DEDUCT 2 points if key facts are not explicitly compared

IMPORTANT: Average scores should be around 6-7. Only truly exceptional responses get 9+.

Respond in JSON format:
{{"verdict_score": X, "faithfulness_score": Y, "reasoning_score": Z, "feedback": "specific critique"}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use gpt-4o-mini which supports JSON mode
            messages=[
                {"role": "system", "content": "You are an evaluation judge. Always respond with valid JSON only."},
                {"role": "user", "content": judge_prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        scores = json.loads(response.choices[0].message.content)
        
        return {
            "question_id": question_id,
            "retrieval_score": 10.0 if retrieval_hit else 0.0,
            "verdict_score": scores.get("verdict_score", 0),
            "faithfulness_score": scores.get("faithfulness_score", 0),
            "reasoning_score": scores.get("reasoning_score", 0),
            "feedback": scores.get("feedback", ""),
            "overall_score": (
                (10.0 if retrieval_hit else 0.0) * 0.2 +
                scores.get("verdict_score", 0) * 0.4 +
                scores.get("faithfulness_score", 0) * 0.3 +
                scores.get("reasoning_score", 0) * 0.1
            )
        }
    except Exception as e:
        # Fall back to simple evaluation on LLM error
        print(f"LLM evaluation error: {e}. Using simple evaluation.")
        scores = simple_factcheck_evaluation(agent_response, golden_answer)
        return {
            "question_id": question_id,
            "retrieval_score": 10.0 if retrieval_hit else 0.0,
            "verdict_score": scores["verdict_score"],
            "faithfulness_score": scores["faithfulness_score"],
            "reasoning_score": scores["reasoning_score"],
            "feedback": f"Evaluated using simple rules (LLM error: {str(e)[:50]})",
            "overall_score": (
                (10.0 if retrieval_hit else 0.0) * 0.2 +
                scores["verdict_score"] * 0.4 +
                scores["faithfulness_score"] * 0.3 +
                scores["reasoning_score"] * 0.1
            )
        }


def simple_legal_evaluation(
    agent_response: Dict[str, Any],
    golden_answer: Dict[str, Any]
) -> Dict[str, float]:
    """Simple rule-based evaluation for legal responses. STRICT MODE."""
    scores = {
        "correctness_score": 3,  # Start low
        "faithfulness_score": 4,
        "conflict_score": 3,  # Start very low - conflicts are important
        "citation_score": 3
    }
    
    answer = agent_response.get("final_answer", "").lower()
    expected = golden_answer.get("expected_answer", "").lower()
    key_reasoning = golden_answer.get("key_reasoning", [])
    expected_clauses = golden_answer.get("expected_clause_ids", [])
    
    # Check if key reasoning points are mentioned - stricter
    matches = sum(1 for point in key_reasoning if any(
        word in answer for word in point.lower().split() if len(word) > 3
    ))
    if matches >= len(key_reasoning) * 0.8:
        scores["correctness_score"] = 7
    elif matches >= len(key_reasoning) * 0.5:
        scores["correctness_score"] = 5
    elif matches >= len(key_reasoning) * 0.3:
        scores["correctness_score"] = 4
    
    # Check for conflict detection - VERY strict
    conflict_words = ["however", "exception", "conflict", "depends", "but", "unless", "notwithstanding"]
    has_conflict_clauses = len(expected_clauses) > 1 and any("conflict" in c or "exception" in c for c in expected_clauses)
    
    if has_conflict_clauses:
        # Must detect conflict
        if any(word in answer for word in conflict_words):
            # Must also mention both clauses
            clauses_mentioned = sum(1 for c in expected_clauses if c.lower().replace("_", " ") in answer.lower().replace("_", " "))
            if clauses_mentioned >= 2:
                scores["conflict_score"] = 7
            else:
                scores["conflict_score"] = 5
        else:
            scores["conflict_score"] = 2  # Missed conflict - very bad
    else:
        scores["conflict_score"] = 6  # No conflict expected
    
    # Check citations - stricter
    citation = agent_response.get("citation", "")
    retrieved_ids = agent_response.get("retrieved_context_ids", [])
    
    # Must cite the right clauses
    correct_citations = sum(1 for c in expected_clauses if c in retrieved_ids)
    if correct_citations == len(expected_clauses) and "clause" in citation.lower():
        scores["citation_score"] = 7
    elif correct_citations >= 1:
        scores["citation_score"] = 5
    
    return scores


def evaluate_legal_response(
    question_id: str,
    agent_response: Dict[str, Any],
    golden_answer: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate a legal clerk response using LLM-as-Judge.
    Falls back to simple evaluation if LLM unavailable.
    """
    # Check retrieval first
    retrieved_ids = agent_response.get("retrieved_context_ids", [])
    expected_ids = golden_answer["expected_clause_ids"]
    retrieval_hits = sum(1 for eid in expected_ids if eid in retrieved_ids)
    retrieval_score = (retrieval_hits / len(expected_ids)) * 10 if expected_ids else 0
    
    # Try to get OpenAI client
    try:
        client = get_openai_client()
    except ValueError as e:
        # No API key - use simple evaluation
        print(f"Warning: {e}. Using simple evaluation.")
        scores = simple_legal_evaluation(agent_response, golden_answer)
        return {
            "question_id": question_id,
            "retrieval_score": retrieval_score,
            "correctness_score": scores["correctness_score"],
            "faithfulness_score": scores["faithfulness_score"],
            "conflict_score": scores["conflict_score"],
            "citation_score": scores["citation_score"],
            "feedback": "Evaluated using simple rules (LLM judge unavailable)",
            "overall_score": (
                retrieval_score * 0.2 +
                scores["correctness_score"] * 0.3 +
                scores["faithfulness_score"] * 0.25 +
                scores["conflict_score"] * 0.15 +
                scores["citation_score"] * 0.1
            )
        }
    
    # Use GPT-4 to evaluate - STRICT MODE
    judge_prompt = f"""You are a STRICT and DEMANDING judge evaluating a legal AI agent.
Be rigorous - only give high scores (8+) for exceptional work.

QUERY: {golden_answer['query']}
EXPECTED ANSWER: {golden_answer['expected_answer']}
KEY REASONING POINTS: {', '.join(golden_answer['key_reasoning'])}
RELEVANT CLAUSES: {expected_ids}

AGENT'S RESPONSE:
- Thought Process: {agent_response.get('thought_process', 'Not provided')}
- Retrieved Clauses: {retrieved_ids}
- Final Answer: {agent_response.get('final_answer', 'Not provided')}
- Citation: {agent_response.get('citation', 'Not provided')}

STRICT EVALUATION CRITERIA:

1. ANSWER CORRECTNESS (0-10) - BE STRICT:
   - 10: Covers ALL key reasoning points with specifics
   - 7-8: Correct but missing 1-2 key points
   - 5-6: Partially correct, missing important nuances
   - 0-4: Incorrect or misleading answer
   - DEDUCT 3 points if answer doesn't mention specific numbers/limits from clauses

2. FAITHFULNESS (0-10) - BE STRICT:
   - 10: Only states facts directly from retrieved clauses
   - 7-8: Mostly faithful with minor inferences
   - 5-6: Some claims not supported by clauses
   - 0-4: Makes up laws or requirements
   - DEDUCT 3 points for any made-up legal requirements

3. CONFLICT DETECTION (0-10) - BE VERY STRICT:
   - 10: Explicitly identifies conflicting clauses AND explains resolution
   - 7-8: Identifies conflict but weak explanation
   - 5-6: Mentions "it depends" without specifics
   - 0-4: Misses obvious conflicts between clauses
   - If clauses {expected_ids} contain conflicts and agent misses them: MAX 3 points
   - MUST explain WHEN each conflicting rule applies

4. CITATION ACCURACY (0-10) - BE STRICT:
   - 10: Cites specific clause IDs with relevant quotes
   - 7-8: Cites clause IDs but no quotes
   - 5-6: Vague references to "the code"
   - 0-4: No citations or wrong clause IDs
   - DEDUCT 2 points for each relevant clause NOT cited

IMPORTANT: Average scores should be around 5-6. Only truly exceptional responses get 8+.

Respond in JSON format:
{{"correctness_score": X, "faithfulness_score": Y, "conflict_score": Z, "citation_score": W, "feedback": "specific critique"}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use gpt-4o-mini which supports JSON mode
            messages=[
                {"role": "system", "content": "You are an evaluation judge. Always respond with valid JSON only."},
                {"role": "user", "content": judge_prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        scores = json.loads(response.choices[0].message.content)
        
        return {
            "question_id": question_id,
            "retrieval_score": retrieval_score,
            "correctness_score": scores.get("correctness_score", 0),
            "faithfulness_score": scores.get("faithfulness_score", 0),
            "conflict_score": scores.get("conflict_score", 0),
            "citation_score": scores.get("citation_score", 0),
            "feedback": scores.get("feedback", ""),
            "overall_score": (
                retrieval_score * 0.2 +
                scores.get("correctness_score", 0) * 0.3 +
                scores.get("faithfulness_score", 0) * 0.25 +
                scores.get("conflict_score", 0) * 0.15 +
                scores.get("citation_score", 0) * 0.1
            )
        }
    except Exception as e:
        # Fall back to simple evaluation on LLM error
        print(f"LLM evaluation error: {e}. Using simple evaluation.")
        scores = simple_legal_evaluation(agent_response, golden_answer)
        return {
            "question_id": question_id,
            "retrieval_score": retrieval_score,
            "correctness_score": scores["correctness_score"],
            "faithfulness_score": scores["faithfulness_score"],
            "conflict_score": scores["conflict_score"],
            "citation_score": scores["citation_score"],
            "feedback": f"Evaluated using simple rules (LLM error: {str(e)[:50]})",
            "overall_score": (
                retrieval_score * 0.2 +
                scores["correctness_score"] * 0.3 +
                scores["faithfulness_score"] * 0.25 +
                scores["conflict_score"] * 0.15 +
                scores["citation_score"] * 0.1
            )
        }


def calculate_aggregate_scores(question_results: List[Dict[str, Any]], challenge_type: str = "factcheck") -> Dict[str, float]:
    """Calculate aggregate scores from individual question results.
    
    Returns:
        - overall_score: Combined score across all questions
        - public_score: Score on public test set only (visible during competition)
        - private_score: Score on private test set only (revealed at end)
        - retrieval_score, faithfulness_score, reasoning_score: Component scores
    """
    if not question_results:
        return {
            "overall_score": 0.0,
            "public_score": 0.0,
            "private_score": 0.0,
            "retrieval_score": 0.0,
            "faithfulness_score": 0.0,
            "reasoning_score": 0.0
        }
    
    # Get the appropriate public/private answer sets
    if challenge_type == "factcheck":
        public_ids = set(FACTCHECK_PUBLIC_ANSWERS.keys())
        private_ids = set(FACTCHECK_PRIVATE_ANSWERS.keys())
    else:  # legal
        public_ids = set(LEGAL_PUBLIC_ANSWERS.keys())
        private_ids = set(LEGAL_PRIVATE_ANSWERS.keys())
    
    # Separate results into public and private
    public_results = [r for r in question_results if r.get("question_id") in public_ids]
    private_results = [r for r in question_results if r.get("question_id") in private_ids]
    
    n = len(question_results)
    n_public = len(public_results) if public_results else 1
    n_private = len(private_results) if private_results else 1
    
    # Calculate public score (average of public test questions)
    public_score = sum(r.get("overall_score", 0) for r in public_results) / n_public if public_results else 0.0
    
    # Calculate private score (average of private test questions)
    private_score = sum(r.get("overall_score", 0) for r in private_results) / n_private if private_results else 0.0
    
    return {
        "overall_score": sum(r.get("overall_score", 0) for r in question_results) / n,
        "public_score": public_score,
        "private_score": private_score,
        "retrieval_score": sum(r.get("retrieval_score", 0) for r in question_results) / n,
        "faithfulness_score": sum(r.get("faithfulness_score", 0) for r in question_results) / n,
        "reasoning_score": sum(r.get("reasoning_score", r.get("correctness_score", 0)) for r in question_results) / n
    }

