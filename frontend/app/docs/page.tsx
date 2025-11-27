'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CodeBlock } from '@/components/CodeBlock';

type Framework = 'agno' | 'crewai';

const agnoSkeleton = `"""
Alpha AI Datathon 2025 - Your Agno Solution
============================================

Fill in the TODOs to build your RAG agent!
"""

import requests
from agno.agent import Agent
from agno.models.openai import OpenAIChat

# The KB URL will be passed to your solve function
KB_API_URL = ""


def search_knowledge_base(query: str) -> str:
    """
    TODO: Search the knowledge base for relevant documents.
    
    This function will be used as a tool by your agent.
    Make a POST request to the KB API and return formatted results.
    """
    global KB_API_URL
    
    # TODO: Implement the search
    # Hint: Use requests.post() with {"query": query, "top_k": 5}
    # Return the results in a readable format for the agent
    pass


def create_agent() -> Agent:
    """
    TODO: Create your Agno agent with instructions and tools.
    
    Configure the agent with:
    - A model (e.g., OpenAIChat)
    - Your search tool
    - Clear instructions for the task
    """
    
    # TODO: Define your agent's instructions
    instructions = """
    Your instructions here...
    """
    
    # TODO: Create and return the agent
    agent = Agent(
        model=OpenAIChat(id="gpt-4o-mini"),
        tools=[search_knowledge_base],
        instructions=instructions
    )
    
    return agent


def solve(query: str, search_api_url: str) -> dict:
    """
    Main entry point - the platform will call this function.
    
    Args:
        query: The question or claim to process
        search_api_url: URL of the knowledge base API
    
    Returns:
        dict with: thought_process, retrieved_context_ids, 
                   final_answer, citation
    """
    global KB_API_URL
    KB_API_URL = search_api_url
    
    # TODO: Create your agent and run it
    agent = create_agent()
    response = agent.run(query)
    
    # TODO: Parse the response and return the expected format
    return {
        "thought_process": "Your reasoning here...",
        "retrieved_context_ids": ["doc_id_1", "doc_id_2"],
        "final_answer": "Your answer here",
        "citation": "doc_id_1: 'relevant quote...'"
    }
`;

const crewaiSkeleton = `"""
Alpha AI Datathon 2025 - Your CrewAI Solution
==============================================

Fill in the TODOs to build your multi-agent RAG system!
"""

import requests
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool

# The KB URL will be passed to your solve function
KB_API_URL = ""


class SearchKnowledgeBaseTool(BaseTool):
    """
    TODO: Implement the knowledge base search tool.
    """
    name: str = "search_knowledge_base"
    description: str = "Search the knowledge base. Input: search query string."
    
    def _run(self, query: str) -> str:
        global KB_API_URL
        
        # TODO: Implement the search
        # Hint: Use requests.post() with {"query": query, "top_k": 5}
        # Return the results in a readable format
        pass


def create_agents():
    """
    TODO: Create your crew of agents.
    
    For example:
    - A Researcher agent that searches for information
    - An Analyst agent that processes and verifies claims
    """
    search_tool = SearchKnowledgeBaseTool()
    
    # TODO: Define your agents
    researcher = Agent(
        role="Your role here",
        goal="Your goal here",
        backstory="Agent backstory...",
        tools=[search_tool],
        verbose=True
    )
    
    analyst = Agent(
        role="Your role here",
        goal="Your goal here",
        backstory="Agent backstory...",
        verbose=True
    )
    
    return researcher, analyst


def solve(query: str, search_api_url: str) -> dict:
    """
    Main entry point - the platform will call this function.
    
    Args:
        query: The question or claim to process
        search_api_url: URL of the knowledge base API
    
    Returns:
        dict with: thought_process, retrieved_context_ids,
                   final_answer, citation
    """
    global KB_API_URL
    KB_API_URL = search_api_url
    
    researcher, analyst = create_agents()
    
    # TODO: Create your tasks
    research_task = Task(
        description=f"Research this: {query}",
        expected_output="Research findings",
        agent=researcher
    )
    
    analysis_task = Task(
        description="Analyze the research",
        expected_output="Final analysis",
        agent=analyst,
        context=[research_task]
    )
    
    # TODO: Create and run the crew
    crew = Crew(
        agents=[researcher, analyst],
        tasks=[research_task, analysis_task],
        process=Process.sequential
    )
    
    result = crew.kickoff()
    
    # TODO: Parse result and return expected format
    return {
        "thought_process": "Your reasoning here...",
        "retrieved_context_ids": ["doc_id_1", "doc_id_2"],
        "final_answer": "Your answer here",
        "citation": "doc_id_1: 'relevant quote...'"
    }
`;

const serverSkeleton = `"""
FastAPI Server - Expose your agent as an API
=============================================

Run with: python server.py --challenge factcheck --port 8100
Then submit: http://localhost:8100/solve
"""

import argparse
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="My RAG Agent API")

# Import your solution
from solution import solve as solve_function


class SolveRequest(BaseModel):
    query: Optional[str] = None      # For legal challenge
    claim: Optional[str] = None      # For factcheck challenge
    kb_search_url: str               # KB API URL (provided by platform)


class SolveResponse(BaseModel):
    thought_process: str
    retrieved_context_ids: list[str]
    final_answer: str
    citation: str


@app.get("/")
async def health():
    return {"status": "ok", "endpoint": "/solve"}


@app.post("/solve", response_model=SolveResponse)
async def solve(request: SolveRequest):
    query = request.query or request.claim
    if not query:
        raise HTTPException(400, "Provide 'query' or 'claim'")
    
    result = solve_function(query, request.kb_search_url)
    return SolveResponse(**result)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8100)
    args = parser.parse_args()
    
    uvicorn.run(app, host="0.0.0.0", port=args.port)
`;

const expectedOutputFormat = `{
  "thought_process": "Step-by-step reasoning of how you arrived at the answer...",
  "retrieved_context_ids": ["doc_id_1", "doc_id_2", "clause_A_1"],
  "final_answer": "True | False | Partially True (for factcheck) OR your answer (for legal)",
  "citation": "doc_id_1: 'The relevant quote from the document...'"
}`;

export default function DocsPage() {
  const [activeFramework, setActiveFramework] = useState<Framework>('agno');

  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg, #0b0f2b 0%, rgba(19, 37, 98, 1) 50%, rgba(43, 71, 176, 1) 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 mb-6">
            <svg className="w-4 h-4 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[var(--accent-cyan)] text-sm font-medium">Quick Start Guide</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Build Your <span className="gradient-text">RAG Agent</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Get started in minutes. Pick a framework, grab the starter code, and build your solution.
          </p>
        </div>

        {/* How It Works */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)] text-sm font-bold">1</span>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-cyan)]/10">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-cyan)]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Search KB</h3>
              <p className="text-white/50 text-sm">Use our Knowledge Base API to find relevant documents for your query.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-purple)]/10">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-purple)]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[var(--accent-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Reason</h3>
              <p className="text-white/50 text-sm">Your agent analyzes the documents and applies logic to answer the question.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-magenta)]/10">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-magenta)]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[var(--accent-magenta)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Respond</h3>
              <p className="text-white/50 text-sm">Return a structured response with your answer, citations, and reasoning.</p>
            </div>
          </div>
        </section>

        {/* Framework Selection */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-purple)] text-sm font-bold">2</span>
            Pick Your Framework
          </h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveFramework('agno')}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                activeFramework === 'agno'
                  ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${activeFramework === 'agno' ? 'bg-[var(--accent-cyan)]' : 'bg-white/20'}`} />
                <span className={`font-bold ${activeFramework === 'agno' ? 'text-[var(--accent-cyan)]' : 'text-white'}`}>Agno</span>
              </div>
              <p className="text-white/50 text-sm text-left">Simple, single-agent approach. Great for getting started quickly.</p>
            </button>
            
            <button
              onClick={() => setActiveFramework('crewai')}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                activeFramework === 'crewai'
                  ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${activeFramework === 'crewai' ? 'bg-[var(--accent-purple)]' : 'bg-white/20'}`} />
                <span className={`font-bold ${activeFramework === 'crewai' ? 'text-[var(--accent-purple)]' : 'text-white'}`}>CrewAI</span>
              </div>
              <p className="text-white/50 text-sm text-left">Multi-agent collaboration. Build specialized agents that work together.</p>
            </button>
          </div>

          {/* Starter Code */}
          <div className="mb-4">
            <h3 className="font-semibold text-white mb-3">
              {activeFramework === 'agno' ? 'Agno' : 'CrewAI'} Starter Code
            </h3>
            <CodeBlock 
              code={activeFramework === 'agno' ? agnoSkeleton : crewaiSkeleton} 
              language="python" 
              title="solution.py"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-cyan)]/10">
            <p className="text-white/60 text-sm">
              <span className="text-[var(--accent-cyan)] font-semibold">Tip:</span> The{' '}
              <code className="text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-2 py-0.5 rounded">solve()</code>{' '}
              function is your entry point. The platform calls it with the query and KB API URL.
            </p>
          </div>
        </section>

        {/* API Server */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-magenta)]/20 flex items-center justify-center text-[var(--accent-magenta)] text-sm font-bold">3</span>
            Expose as API
          </h2>
          <p className="text-white/60 mb-4">
            Wrap your solution in a FastAPI server so the platform can call it:
          </p>
          <CodeBlock code={serverSkeleton} language="python" title="server.py" />
          
          <div className="mt-4 p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-magenta)]/10">
            <p className="text-white/60 text-sm">
              <span className="text-[var(--accent-magenta)] font-semibold">Run it:</span>{' '}
              <code className="text-white bg-white/10 px-2 py-0.5 rounded">python server.py --port 8100</code>{' '}
              then submit <code className="text-white bg-white/10 px-2 py-0.5 rounded">http://localhost:8100/solve</code>
            </p>
          </div>
        </section>

        {/* Expected Output */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)] text-sm font-bold">4</span>
            Expected Output Format
          </h2>
          <p className="text-white/60 mb-4">
            Your <code className="text-[var(--accent-cyan)]">solve()</code> function must return this exact structure:
          </p>
          <CodeBlock code={expectedOutputFormat} language="json" title="Response Format" />
          
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[var(--accent-cyan)] font-mono text-sm mt-0.5">thought_process</span>
              <span className="text-white/50 text-sm">Your agent&apos;s reasoning - how it searched, what it found, how it decided.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--accent-cyan)] font-mono text-sm mt-0.5">retrieved_context_ids</span>
              <span className="text-white/50 text-sm">List of document IDs from the KB that you used.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--accent-cyan)] font-mono text-sm mt-0.5">final_answer</span>
              <span className="text-white/50 text-sm">For factcheck: &quot;True&quot;, &quot;False&quot;, or &quot;Partially True&quot;. For legal: your answer.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--accent-cyan)] font-mono text-sm mt-0.5">citation</span>
              <span className="text-white/50 text-sm">Quote the relevant text with the source doc_id.</span>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-purple)] text-sm font-bold">5</span>
            Requirements
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">For Agno</h3>
              <CodeBlock 
                code={`# requirements.txt
agno>=2.0.0
openai>=1.0.0
fastapi
uvicorn
requests
python-dotenv`} 
                language="text" 
              />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">For CrewAI</h3>
              <CodeBlock 
                code={`# requirements.txt
crewai>=0.28.0
openai>=1.0.0
fastapi
uvicorn
requests
python-dotenv`} 
                language="text" 
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-sm">
              <span className="font-semibold">Don&apos;t forget:</span> Set your <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">OPENAI_API_KEY</code> environment variable!
            </p>
          </div>
        </section>

        {/* Official Docs */}
        <section className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Learn More</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="https://docs.agno.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-white/10 hover:border-[var(--accent-cyan)]/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[var(--accent-cyan)] transition-colors">Agno Docs</h3>
                  <p className="text-white/50 text-sm">Official documentation for Agno framework</p>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-[var(--accent-cyan)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
            <a 
              href="https://docs.crewai.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-white/10 hover:border-[var(--accent-purple)]/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-[var(--accent-purple)] transition-colors">CrewAI Docs</h3>
                  <p className="text-white/50 text-sm">Official documentation for CrewAI framework</p>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-[var(--accent-purple)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/challenges" className="btn-primary text-center px-8 py-4">
            View Challenges
          </Link>
          <Link href="/submit" className="btn-secondary text-center px-8 py-4">
            Submit Your Agent
          </Link>
        </div>
      </div>
    </div>
  );
}

