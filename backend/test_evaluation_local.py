"""
Local evaluation test script.

This script allows you to test the evaluation system locally without needing:
- The full database setup
- External API endpoints
- Background tasks

Usage:
    # Test against a local API endpoint
    python test_evaluation_local.py --api-url http://localhost:8100/solve --challenge factcheck

    # Test against a Python file
    python test_evaluation_local.py --python-file ../participant_solution/factcheck/solution.py --challenge factcheck

    # Test against a local API endpoint (legal challenge)
    python test_evaluation_local.py --api-url http://localhost:8100/solve --challenge legal
"""
import argparse
import asyncio
import httpx
import json
import os
import sys
import subprocess
import tempfile
from typing import Dict, Any, List

# Add backend to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from submissions.router import (
    FACTCHECK_TEST_QUESTIONS,
    LEGAL_TEST_QUESTIONS
)
from evaluation.judge import (
    evaluate_factcheck_response,
    evaluate_legal_response,
    calculate_aggregate_scores,
    FACTCHECK_GOLDEN_ANSWERS,
    LEGAL_GOLDEN_ANSWERS
)


async def test_api_endpoint(api_url: str, challenge_id: str, kb_base_url: str = "http://localhost:8006") -> List[Dict[str, Any]]:
    """Test an API endpoint with all test questions."""
    questions = FACTCHECK_TEST_QUESTIONS if challenge_id == "factcheck" else LEGAL_TEST_QUESTIONS
    golden_answers = FACTCHECK_GOLDEN_ANSWERS if challenge_id == "factcheck" else LEGAL_GOLDEN_ANSWERS
    
    question_results = []
    
    print(f"\n{'='*70}")
    print(f"  Testing API: {api_url}")
    print(f"  Challenge: {challenge_id}")
    print(f"  KB Base URL: {kb_base_url}")
    print(f"  Questions: {len(questions)}")
    print(f"{'='*70}\n")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for i, question in enumerate(questions, 1):
            qid = question["id"]
            print(f"[{i}/{len(questions)}] Testing {qid}...")
            
            try:
                # Prepare payload
                payload = {
                    "query" if challenge_id == "legal" else "claim": 
                        question.get("query", question.get("claim")),
                    "kb_search_url": f"{kb_base_url}/api/kb/{challenge_id}/search"
                }
                
                print(f"  📤 Sending request: {payload.get('query') or payload.get('claim')[:60]}...")
                print(f"  📤 Payload: {json.dumps(payload, indent=2)}")
                
                # Send request
                response = await client.post(api_url, json=payload)
                
                print(f"  📥 Status Code: {response.status_code}")
                print(f"  📥 Response Headers: {dict(response.headers)}")
                print(f"  📥 Raw Response Text:\n{response.text}")
                print()
                
                if response.status_code != 200:
                    error_msg = f"API returned status {response.status_code}: {response.text[:200]}"
                    print(f"  ❌ {error_msg}")
                    question_results.append({
                        "question_id": qid,
                        "error": error_msg,
                        "overall_score": 0.0,
                        "retrieval_score": 0.0,
                        "faithfulness_score": 0.0,
                        "reasoning_score": 0.0
                    })
                    continue
                
                try:
                    agent_response = response.json()
                    print(f"  ✅ Parsed JSON Response:\n{json.dumps(agent_response, indent=2)}")
                    print(f"  ✅ Verdict: {agent_response.get('final_answer', 'N/A')}")
                except Exception as json_error:
                    print(f"  ❌ Failed to parse JSON: {json_error}")
                    print(f"  📥 Response was: {response.text}")
                    question_results.append({
                        "question_id": qid,
                        "error": f"JSON parse error: {json_error}",
                        "overall_score": 0.0,
                        "retrieval_score": 0.0,
                        "faithfulness_score": 0.0,
                        "reasoning_score": 0.0
                    })
                    continue
                
                # Evaluate the response
                if challenge_id == "factcheck":
                    result = evaluate_factcheck_response(
                        qid,
                        agent_response,
                        golden_answers[qid]
                    )
                else:
                    result = evaluate_legal_response(
                        qid,
                        agent_response,
                        golden_answers[qid]
                    )
                
                score = result.get('overall_score', 0)
                print(f"  📊 Score: {score:.2f}/10.0")
                print(f"     - Retrieval: {result.get('retrieval_score', 0):.2f}")
                print(f"     - {'Verdict' if challenge_id == 'factcheck' else 'Correctness'}: {result.get('verdict_score' if challenge_id == 'factcheck' else 'correctness_score', 0):.2f}")
                print(f"     - Faithfulness: {result.get('faithfulness_score', 0):.2f}")
                print(f"     - {'Reasoning' if challenge_id == 'factcheck' else 'Conflict'}: {result.get('reasoning_score' if challenge_id == 'factcheck' else 'conflict_score', 0):.2f}")
                
                if result.get('feedback'):
                    print(f"     💡 Feedback: {result['feedback'][:100]}...")
                
                question_results.append(result)
                
            except Exception as e:
                error_msg = str(e)
                print(f"  ❌ Error: {error_msg}")
                question_results.append({
                    "question_id": qid,
                    "error": error_msg,
                    "overall_score": 0.0,
                    "retrieval_score": 0.0,
                    "faithfulness_score": 0.0,
                    "reasoning_score": 0.0
                })
            
            print()
    
    return question_results


def test_python_file(file_path: str, challenge_id: str, kb_base_url: str = "http://localhost:8006") -> List[Dict[str, Any]]:
    """Test a Python file with all test questions."""
    questions = FACTCHECK_TEST_QUESTIONS if challenge_id == "factcheck" else LEGAL_TEST_QUESTIONS
    golden_answers = FACTCHECK_GOLDEN_ANSWERS if challenge_id == "factcheck" else LEGAL_GOLDEN_ANSWERS
    
    question_results = []
    
    print(f"\n{'='*70}")
    print(f"  Testing Python File: {file_path}")
    print(f"  Challenge: {challenge_id}")
    print(f"  KB Base URL: {kb_base_url}")
    print(f"  Questions: {len(questions)}")
    print(f"{'='*70}\n")
    
    # Create a runner script
    runner_script = f'''
import sys
import json
sys.path.insert(0, "{os.path.dirname(os.path.abspath(file_path))}")
from {os.path.splitext(os.path.basename(file_path))[0]} import solve

query = sys.argv[1]
search_api_url = sys.argv[2]

result = solve(query, search_api_url)
print(json.dumps(result))
'''
    
    runner_path = os.path.join(tempfile.gettempdir(), "_eval_runner.py")
    with open(runner_path, "w") as f:
        f.write(runner_script)
    
    try:
        for i, question in enumerate(questions, 1):
            qid = question["id"]
            print(f"[{i}/{len(questions)}] Testing {qid}...")
            
            try:
                query = question.get("query", question.get("claim"))
                search_url = f"{kb_base_url}/api/kb/{challenge_id}/search"
                
                print(f"  📤 Running solve('{query[:60]}...', '{search_url}')")
                
                # Run the participant's code
                result = subprocess.run(
                    ["python", runner_path, query, search_url],
                    capture_output=True,
                    text=True,
                    timeout=60,
                    cwd=os.path.dirname(os.path.abspath(file_path))
                )
                
                if result.returncode != 0:
                    error_msg = f"Code execution failed: {result.stderr}"
                    print(f"  ❌ {error_msg}")
                    question_results.append({
                        "question_id": qid,
                        "error": error_msg,
                        "overall_score": 0.0
                    })
                    continue
                
                agent_response = json.loads(result.stdout)
                print(f"  ✅ Got response: verdict={agent_response.get('final_answer', 'N/A')}")
                
                # Evaluate the response
                if challenge_id == "factcheck":
                    eval_result = evaluate_factcheck_response(
                        question["id"],
                        agent_response,
                        golden_answers[question["id"]]
                    )
                else:
                    eval_result = evaluate_legal_response(
                        question["id"],
                        agent_response,
                        golden_answers[question["id"]]
                    )
                
                score = eval_result.get('overall_score', 0)
                print(f"  📊 Score: {score:.2f}/10.0")
                print(f"     - Retrieval: {eval_result.get('retrieval_score', 0):.2f}")
                print(f"     - {'Verdict' if challenge_id == 'factcheck' else 'Correctness'}: {eval_result.get('verdict_score' if challenge_id == 'factcheck' else 'correctness_score', 0):.2f}")
                print(f"     - Faithfulness: {eval_result.get('faithfulness_score', 0):.2f}")
                print(f"     - {'Reasoning' if challenge_id == 'factcheck' else 'Conflict'}: {eval_result.get('reasoning_score' if challenge_id == 'factcheck' else 'conflict_score', 0):.2f}")
                
                if eval_result.get('feedback'):
                    print(f"     💡 Feedback: {eval_result['feedback'][:100]}...")
                
                question_results.append(eval_result)
                
            except Exception as e:
                error_msg = str(e)
                print(f"  ❌ Error: {error_msg}")
                question_results.append({
                    "question_id": qid,
                    "error": error_msg,
                    "overall_score": 0.0
                })
            
            print()
    
    finally:
        # Clean up runner script
        if os.path.exists(runner_path):
            os.remove(runner_path)
    
    return question_results


def print_summary(question_results: List[Dict[str, Any]], challenge_id: str):
    """Print evaluation summary."""
    scores = calculate_aggregate_scores(question_results, challenge_id)
    
    print(f"\n{'='*70}")
    print("  📊 EVALUATION SUMMARY")
    print(f"{'='*70}\n")
    
    print(f"Overall Score:     {scores['overall_score']:.2f}/10.0")
    print(f"Public Score:      {scores['public_score']:.2f}/10.0")
    print(f"Private Score:     {scores['private_score']:.2f}/10.0")
    print(f"\nComponent Scores:")
    print(f"  Retrieval:       {scores['retrieval_score']:.2f}/10.0")
    print(f"  Faithfulness:    {scores['faithfulness_score']:.2f}/10.0")
    if challenge_id == "factcheck":
        print(f"  Reasoning:       {scores['reasoning_score']:.2f}/10.0")
    else:
        print(f"  Correctness:     {scores['reasoning_score']:.2f}/10.0")
    
    print(f"\n{'='*70}")
    print("  📋 PER-QUESTION BREAKDOWN")
    print(f"{'='*70}\n")
    
    for result in question_results:
        qid = result.get("question_id", "unknown")
        score = result.get("overall_score", 0)
        error = result.get("error")
        
        status = "✅" if score >= 8 else "⚠️" if score >= 5 else "❌"
        
        if error:
            print(f"{status} {qid}: ERROR - {error[:60]}...")
        else:
            print(f"{status} {qid}: {score:.2f}/10.0")
            if result.get('feedback'):
                print(f"     {result['feedback'][:80]}...")
    
    print(f"\n{'='*70}")
    if scores['overall_score'] >= 8:
        print("  🎉 Excellent! Your solution is performing very well!")
    elif scores['overall_score'] >= 6:
        print("  👍 Good job! Some improvements needed.")
    elif scores['overall_score'] >= 4:
        print("  💪 Keep working! Focus on retrieval and reasoning.")
    else:
        print("  🔧 Needs improvement. Check your API/function implementation.")
    print(f"{'='*70}\n")


async def main():
    parser = argparse.ArgumentParser(
        description="Test evaluation locally",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test API endpoint
  python test_evaluation_local.py --api-url http://localhost:8100/solve --challenge factcheck
  
  # Test Python file
  python test_evaluation_local.py --python-file ../participant_solution/factcheck/solution.py --challenge factcheck
  
  # Test legal challenge
  python test_evaluation_local.py --api-url http://localhost:8100/solve --challenge legal
        """
    )
    
    parser.add_argument(
        "--api-url",
        type=str,
        help="API endpoint URL to test (e.g., http://localhost:8100/solve)"
    )
    parser.add_argument(
        "--python-file",
        type=str,
        help="Path to Python file with solve() function"
    )
    parser.add_argument(
        "--challenge",
        type=str,
        choices=["factcheck", "legal"],
        default="factcheck",
        help="Challenge type (default: factcheck)"
    )
    parser.add_argument(
        "--kb-base-url",
        type=str,
        default="http://localhost:8006",
        help="Base URL for the knowledge base API (default: http://localhost:8006)"
    )
    
    args = parser.parse_args()
    
    if not args.api_url and not args.python_file:
        parser.error("Must provide either --api-url or --python-file")
    
    if args.api_url and args.python_file:
        parser.error("Cannot provide both --api-url and --python-file")
    
    # Check if backend KB is running
    kb_base_url = args.kb_base_url.rstrip('/')
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{kb_base_url}/")
            if response.status_code != 200:
                print(f"⚠️  Warning: Backend server at {kb_base_url} may not be running correctly")
    except Exception:
        print(f"⚠️  Warning: Cannot connect to backend server at {kb_base_url}")
        print("   Make sure the backend is running or use --kb-base-url to specify a remote server")
        print()
    
    # Run evaluation
    if args.api_url:
        question_results = await test_api_endpoint(args.api_url, args.challenge, kb_base_url)
    else:
        if not os.path.exists(args.python_file):
            print(f"❌ Error: File not found: {args.python_file}")
            sys.exit(1)
        question_results = test_python_file(args.python_file, args.challenge, kb_base_url)
    
    # Print summary
    print_summary(question_results, args.challenge)


if __name__ == "__main__":
    asyncio.run(main())

