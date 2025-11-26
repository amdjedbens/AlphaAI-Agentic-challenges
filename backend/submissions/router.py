"""
API routes for submission handling.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import httpx
import os
import tempfile
import subprocess
import json
import traceback
import logging
from typing import Optional

from db.database import get_db, Submission, EvaluationResult, LeaderboardEntry
from db.models import SubmissionRequest, SubmissionResponse, AgentResponse
from evaluation.judge import (
    evaluate_factcheck_response,
    evaluate_legal_response,
    calculate_aggregate_scores,
    FACTCHECK_GOLDEN_ANSWERS,
    LEGAL_GOLDEN_ANSWERS
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Test questions for evaluation
FACTCHECK_TEST_QUESTIONS = [
    {"id": "fc_test_1", "claim": "The Eiffel Tower was completed in 1889 for the World's Fair."},
    {"id": "fc_test_2", "claim": "Albert Einstein was born in Germany in 1879."},
    {"id": "fc_test_3", "claim": "The Great Wall of China is visible from the Moon with the naked eye."},
    {"id": "fc_test_4", "claim": "Water boils at 100 degrees Celsius at sea level."},
    {"id": "fc_test_5", "claim": "The Amazon River is the longest river in the world."},
]

LEGAL_TEST_QUESTIONS = [
    {"id": "legal_test_1", "query": "Can I build a 3-story residential building in Zone B?"},
    {"id": "legal_test_2", "query": "What is the maximum lot coverage allowed in Zone A-Commercial?"},
    {"id": "legal_test_3", "query": "Can I operate a home-based bakery in Zone R-1?"},
]


@router.post("/api-endpoint", response_model=SubmissionResponse)
async def submit_api_endpoint(
    team_name: str = Form(...),
    challenge_id: str = Form(...),
    api_url: str = Form(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Submit an API endpoint for evaluation.
    The endpoint should accept POST requests with query/claim and return AgentResponse format.
    """
    if challenge_id not in ["factcheck", "legal"]:
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    # Validate URL format
    if not api_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid API URL format")
    
    # Create submission record
    submission = Submission(
        team_name=team_name,
        challenge_id=challenge_id,
        submission_type="api",
        submission_url=api_url,
        status="pending"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Run evaluation in background
    if background_tasks:
        background_tasks.add_task(
            evaluate_api_submission,
            submission.id,
            api_url,
            challenge_id,
            team_name
        )
    
    return SubmissionResponse(
        submission_id=submission.id,
        status="pending",
        message="Submission received. Evaluation will begin shortly."
    )


@router.post("/python-file", response_model=SubmissionResponse)
async def submit_python_file(
    team_name: str = Form(...),
    challenge_id: str = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Submit a Python file for evaluation.
    The file should contain a `solve(query: str, search_api_url: str) -> dict` function.
    """
    if challenge_id not in ["factcheck", "legal"]:
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    if not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="File must be a Python file (.py)")
    
    # Save the file
    content = await file.read()
    
    # Basic security check - reject obvious malicious code
    content_str = content.decode("utf-8")
    dangerous_patterns = ["os.system", "subprocess", "eval(", "exec(", "__import__"]
    for pattern in dangerous_patterns:
        if pattern in content_str:
            raise HTTPException(
                status_code=400, 
                detail=f"Potentially dangerous code detected: {pattern}"
            )
    
    # Save to temp file
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create submission record
    submission = Submission(
        team_name=team_name,
        challenge_id=challenge_id,
        submission_type="python",
        submission_file=file_path,
        status="pending"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Run evaluation in background
    if background_tasks:
        background_tasks.add_task(
            evaluate_python_submission,
            submission.id,
            file_path,
            challenge_id,
            team_name
        )
    
    return SubmissionResponse(
        submission_id=submission.id,
        status="pending",
        message="Submission received. Evaluation will begin shortly."
    )


@router.get("/status/{submission_id}")
async def get_submission_status(submission_id: int, db: Session = Depends(get_db)):
    """Get the status of a submission."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    result = {
        "submission_id": submission.id,
        "team_name": submission.team_name,
        "challenge_id": submission.challenge_id,
        "submission_type": submission.submission_type,
        "status": submission.status,
        "created_at": submission.created_at.isoformat(),
        "feedback": submission.feedback,
        "error_message": submission.error_message
    }
    
    if submission.completed_at:
        result["completed_at"] = submission.completed_at.isoformat()
    
    # If completed, include evaluation results
    if submission.status == "completed":
        eval_result = db.query(EvaluationResult).filter(
            EvaluationResult.submission_id == submission_id
        ).first()
        if eval_result:
            result["evaluation"] = {
                "overall_score": eval_result.overall_score,
                "retrieval_score": eval_result.retrieval_score,
                "faithfulness_score": eval_result.faithfulness_score,
                "reasoning_score": eval_result.reasoning_score
            }
    
    return result


@router.get("/details/{submission_id}")
async def get_submission_details(submission_id: int, db: Session = Depends(get_db)):
    """Get detailed submission results including per-question feedback."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    result = {
        "submission_id": submission.id,
        "team_name": submission.team_name,
        "challenge_id": submission.challenge_id,
        "status": submission.status,
        "feedback": submission.feedback,
        "error_message": submission.error_message,
        "created_at": submission.created_at.isoformat()
    }
    
    # Get evaluation result with per-question breakdown
    eval_result = db.query(EvaluationResult).filter(
        EvaluationResult.submission_id == submission_id
    ).first()
    
    if eval_result:
        result["evaluation"] = {
            "overall_score": eval_result.overall_score,
            "retrieval_score": eval_result.retrieval_score,
            "faithfulness_score": eval_result.faithfulness_score,
            "reasoning_score": eval_result.reasoning_score,
            "question_results": eval_result.question_results or []
        }
        
        # Add hints for each question without revealing answers
        hints = []
        for qr in (eval_result.question_results or []):
            qid = qr.get("question_id", "")
            score = qr.get("overall_score", 0)
            error = qr.get("error")
            
            hint = {"question_id": qid, "score": score}
            
            if error:
                hint["status"] = "error"
                hint["hint"] = "Check your API connection and response format"
            elif score >= 8:
                hint["status"] = "excellent"
                hint["hint"] = "Great job! Your agent handled this well."
            elif score >= 5:
                hint["status"] = "good"
                hint["hint"] = "Good attempt. Consider improving citations or reasoning clarity."
            elif score >= 3:
                hint["status"] = "needs_improvement"
                hint["hint"] = "Review your retrieval strategy. Are you finding the right documents?"
            else:
                hint["status"] = "poor"
                if submission.challenge_id == "factcheck":
                    hint["hint"] = "Check for negations in the KB (NOT, myth, debunked). Verify exact facts."
                else:
                    hint["hint"] = "Look for exception clauses and amendments. Explain conflicts."
            
            hints.append(hint)
        
        result["hints"] = hints
    
    return result


@router.get("/team/{team_name}")
async def get_team_submissions(team_name: str, db: Session = Depends(get_db)):
    """Get all submissions for a team with feedback."""
    submissions = db.query(Submission).filter(
        Submission.team_name == team_name
    ).order_by(Submission.created_at.desc()).all()
    
    results = []
    for sub in submissions:
        item = {
            "submission_id": sub.id,
            "challenge_id": sub.challenge_id,
            "status": sub.status,
            "feedback": sub.feedback,
            "created_at": sub.created_at.isoformat()
        }
        
        # Get score if available
        eval_result = db.query(EvaluationResult).filter(
            EvaluationResult.submission_id == sub.id
        ).first()
        
        if eval_result:
            item["overall_score"] = eval_result.overall_score
        
        results.append(item)
    
    return {"team_name": team_name, "submissions": results}


def generate_feedback(question_results: list, challenge_id: str) -> str:
    """Generate helpful hints without revealing solutions."""
    feedback_lines = []
    
    for result in question_results:
        qid = result.get("question_id", "unknown")
        error = result.get("error")
        score = result.get("overall_score", 0)
        
        if error:
            if "Connection" in error or "connect" in error.lower():
                feedback_lines.append(f"❌ {qid}: Could not connect to your API. Make sure it's running.")
            elif "timeout" in error.lower():
                feedback_lines.append(f"⏱️ {qid}: Request timed out. Your solution may be too slow.")
            elif "json" in error.lower():
                feedback_lines.append(f"📝 {qid}: Response format error. Ensure you return valid JSON with required fields.")
            else:
                feedback_lines.append(f"❌ {qid}: Error - {error[:100]}")
        elif score < 3:
            # Give hints based on challenge type
            if challenge_id == "factcheck":
                if "retrieval_score" in result and result.get("retrieval_score", 0) < 5:
                    feedback_lines.append(f"🔍 {qid}: Try improving your search queries to find more relevant documents.")
                else:
                    feedback_lines.append(f"💡 {qid}: Check for negations ('NOT', 'myth') and verify exact facts.")
            else:
                if "retrieval_score" in result and result.get("retrieval_score", 0) < 5:
                    feedback_lines.append(f"🔍 {qid}: Search for exception and amendment clauses too.")
                else:
                    feedback_lines.append(f"⚖️ {qid}: Look for conflicting clauses and explain when each applies.")
        elif score < 7:
            feedback_lines.append(f"⚠️ {qid}: Partial score. Improve reasoning clarity or citations.")
        else:
            feedback_lines.append(f"✅ {qid}: Good job!")
    
    if not feedback_lines:
        return "No detailed feedback available."
    
    return "\n".join(feedback_lines)


async def evaluate_api_submission(
    submission_id: int,
    api_url: str,
    challenge_id: str,
    team_name: str
):
    """Evaluate an API endpoint submission."""
    from db.database import SessionLocal
    db = SessionLocal()
    
    try:
        # Update status to running
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        submission.status = "running"
        db.commit()
        
        logger.info(f"Starting evaluation for submission {submission_id} ({team_name})")
        
        # Get test questions
        questions = FACTCHECK_TEST_QUESTIONS if challenge_id == "factcheck" else LEGAL_TEST_QUESTIONS
        golden_answers = FACTCHECK_GOLDEN_ANSWERS if challenge_id == "factcheck" else LEGAL_GOLDEN_ANSWERS
        
        question_results = []
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            for question in questions:
                qid = question["id"]
                try:
                    logger.info(f"Testing question {qid}")
                    
                    # Send request to participant's API
                    payload = {
                        "query" if challenge_id == "legal" else "claim": 
                            question.get("query", question.get("claim")),
                        "kb_search_url": f"http://localhost:8006/api/kb/{challenge_id}/search"
                    }
                    
                    response = await client.post(api_url, json=payload)
                    
                    if response.status_code != 200:
                        raise Exception(f"API returned status {response.status_code}: {response.text[:200]}")
                    
                    agent_response = response.json()
                    logger.info(f"Got response for {qid}: verdict={agent_response.get('final_answer', 'N/A')}")
                    
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
                    
                    logger.info(f"Evaluation for {qid}: score={result.get('overall_score', 0)}")
                    question_results.append(result)
                    
                except Exception as e:
                    logger.error(f"Error evaluating {qid}: {str(e)}")
                    question_results.append({
                        "question_id": qid,
                        "error": str(e),
                        "overall_score": 0.0,
                        "retrieval_score": 0.0,
                        "faithfulness_score": 0.0,
                        "reasoning_score": 0.0
                    })
        
        # Calculate aggregate scores
        scores = calculate_aggregate_scores(question_results)
        logger.info(f"Final scores for {team_name}: {scores}")
        
        # Generate feedback
        feedback = generate_feedback(question_results, challenge_id)
        
        # Save evaluation result
        eval_result = EvaluationResult(
            submission_id=submission_id,
            team_name=team_name,
            challenge_id=challenge_id,
            overall_score=scores["overall_score"],
            retrieval_score=scores["retrieval_score"],
            faithfulness_score=scores["faithfulness_score"],
            reasoning_score=scores["reasoning_score"],
            question_results=question_results
        )
        db.add(eval_result)
        
        # Update leaderboard
        update_leaderboard(db, team_name, challenge_id, scores["overall_score"])
        
        # Update submission status with feedback
        submission.status = "completed"
        submission.completed_at = datetime.utcnow()
        submission.feedback = feedback
        db.commit()
        
        logger.info(f"Evaluation completed for submission {submission_id}")
        
    except Exception as e:
        logger.error(f"Evaluation failed for submission {submission_id}: {str(e)}")
        logger.error(traceback.format_exc())
        
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        submission.status = "failed"
        submission.error_message = str(e)
        submission.feedback = f"❌ Evaluation failed: {str(e)[:200]}\n\nPlease check:\n- Is your API endpoint running?\n- Does it return the correct JSON format?\n- Are all required fields present?"
        db.commit()
    finally:
        db.close()


async def evaluate_python_submission(
    submission_id: int,
    file_path: str,
    challenge_id: str,
    team_name: str
):
    """Evaluate a Python file submission."""
    from db.database import SessionLocal
    db = SessionLocal()
    
    try:
        # Update status to running
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        submission.status = "running"
        db.commit()
        
        # Get test questions
        questions = FACTCHECK_TEST_QUESTIONS if challenge_id == "factcheck" else LEGAL_TEST_QUESTIONS
        golden_answers = FACTCHECK_GOLDEN_ANSWERS if challenge_id == "factcheck" else LEGAL_GOLDEN_ANSWERS
        
        question_results = []
        
        # Create a runner script
        runner_script = f'''
import sys
import json
sys.path.insert(0, "{os.path.dirname(file_path)}")
from {os.path.splitext(os.path.basename(file_path))[0]} import solve

query = sys.argv[1]
search_api_url = sys.argv[2]

result = solve(query, search_api_url)
print(json.dumps(result))
'''
        
        runner_path = os.path.join(os.path.dirname(file_path), "_runner.py")
        with open(runner_path, "w") as f:
            f.write(runner_script)
        
        for question in questions:
            try:
                query = question.get("query", question.get("claim"))
                search_url = f"http://localhost:8006/api/kb/{challenge_id}/search"
                
                # Run the participant's code
                result = subprocess.run(
                    ["python", runner_path, query, search_url],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode != 0:
                    raise Exception(f"Code execution failed: {result.stderr}")
                
                agent_response = json.loads(result.stdout)
                
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
                
                question_results.append(eval_result)
                
            except Exception as e:
                question_results.append({
                    "question_id": question["id"],
                    "error": str(e),
                    "overall_score": 0.0
                })
        
        # Calculate aggregate scores
        scores = calculate_aggregate_scores(question_results)
        
        # Save evaluation result
        eval_result = EvaluationResult(
            submission_id=submission_id,
            team_name=team_name,
            challenge_id=challenge_id,
            overall_score=scores["overall_score"],
            retrieval_score=scores["retrieval_score"],
            faithfulness_score=scores["faithfulness_score"],
            reasoning_score=scores["reasoning_score"],
            question_results=question_results
        )
        db.add(eval_result)
        
        # Update leaderboard
        update_leaderboard(db, team_name, challenge_id, scores["overall_score"])
        
        # Update submission status
        submission.status = "completed"
        submission.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        submission.status = "failed"
        db.commit()
        raise e
    finally:
        db.close()


def update_leaderboard(db: Session, team_name: str, challenge_id: str, score: float):
    """Update the leaderboard with new submission."""
    entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.team_name == team_name,
        LeaderboardEntry.challenge_id == challenge_id
    ).first()
    
    if entry:
        if score > entry.best_score:
            entry.best_score = score
        entry.submission_count += 1
        entry.last_submission = datetime.utcnow()
    else:
        entry = LeaderboardEntry(
            team_name=team_name,
            challenge_id=challenge_id,
            best_score=score,
            submission_count=1
        )
        db.add(entry)
    
    db.commit()

