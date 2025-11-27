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

// Collapsible section component
function CollapsibleSection({ 
  id, 
  title, 
  badge, 
  badgeColor = 'cyan',
  isOpen, 
  onToggle, 
  children 
}: { 
  id: string;
  title: string;
  badge?: string;
  badgeColor?: 'cyan' | 'purple' | 'magenta' | 'emerald';
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const colorClasses = {
    cyan: 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]',
    purple: 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]',
    magenta: 'bg-[var(--accent-magenta)]/20 text-[var(--accent-magenta)]',
    emerald: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <section className="card mb-8 overflow-hidden" id={id}>
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          {badge && (
            <span className={`w-8 h-8 rounded-lg ${colorClasses[badgeColor]} flex items-center justify-center text-sm font-bold`}>
              {badge}
            </span>
          )}
          {title}
        </h2>
        <svg 
          className={`w-6 h-6 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function DocsPage() {
  const [activeFramework, setActiveFramework] = useState<Framework>('agno');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    howItWorks: true,
    framework: false,
    exposeApi: false,
    ngrok: false,
    output: false,
    requirements: false,
    learnMore: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-6">
            Get started in minutes. Pick a framework, grab the starter code, and build your solution.
          </p>
          
          {/* Expand/Collapse All Button */}
          <button
            onClick={() => {
              const allOpen = Object.values(expandedSections).every(v => v);
              const newState = Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: !allOpen }), {});
              setExpandedSections(newState);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {Object.values(expandedSections).every(v => v) ? 'Collapse All Sections' : 'Expand All Sections'}
          </button>
        </div>

        {/* How It Works */}
        <CollapsibleSection
          id="how-it-works"
          title="How It Works"
          badge="1"
          badgeColor="cyan"
          isOpen={expandedSections.howItWorks}
          onToggle={() => toggleSection('howItWorks')}
        >
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
        </CollapsibleSection>

        {/* Knowledge Base API URLs - HIGHLIGHTED */}
        <section className="card p-8 mb-8 border-2 border-[var(--accent-cyan)]/40 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-purple)]/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Knowledge Base API URLs</h2>
              <p className="text-[var(--accent-cyan)] text-sm font-medium">Use these endpoints to search for relevant documents</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {/* Factcheck KB */}
            <div className="p-4 rounded-xl bg-[#0b0f2b] border border-[var(--accent-cyan)]/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">FACTCHECK</span>
                <span className="text-white/40 text-sm">The Fact-Check Spider</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="text-[var(--accent-cyan)] font-bold">POST</code>
                <code className="text-white font-mono text-sm md:text-base break-all select-all">https://squid-app-7q77b.ondigitalocean.app/api/api/kb/factcheck/search</code>
              </div>
            </div>

            {/* Legal KB */}
            <div className="p-4 rounded-xl bg-[#0b0f2b] border border-[var(--accent-purple)]/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400">LEGAL</span>
                <span className="text-white/40 text-sm">The Legal Clerk</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="text-[var(--accent-cyan)] font-bold">POST</code>
                <code className="text-white font-mono text-sm md:text-base break-all select-all">https://squid-app-7q77b.ondigitalocean.app/api/api/kb/legal/search</code>
              </div>
            </div>
          </div>

          {/* Request/Response Example */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Request Body</h4>
              <CodeBlock
                code={`{
  "query": "your search query",
  "top_k": 5
}`}
                language="json"
              />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Response</h4>
              <CodeBlock
                code={`{
  "results": [
    { "doc_id": "doc_1", "content": "...", "score": 0.95 }
  ]
}`}
                language="json"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Good news:</strong> During evaluation, the platform automatically passes the correct <code className="bg-emerald-500/20 px-1.5 py-0.5 rounded">kb_search_url</code> to your <code className="bg-emerald-500/20 px-1.5 py-0.5 rounded">/solve</code> endpoint. You don&apos;t need to hardcode these URLs!
              </span>
            </p>
          </div>
        </section>

        {/* Framework Selection */}
        <CollapsibleSection
          id="framework"
          title="Pick Your Framework"
          badge="2"
          badgeColor="purple"
          isOpen={expandedSections.framework}
          onToggle={() => toggleSection('framework')}
        >
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
        </CollapsibleSection>

        {/* API Server */}
        <CollapsibleSection
          id="expose-api"
          title="Expose as API"
          badge="3"
          badgeColor="magenta"
          isOpen={expandedSections.exposeApi}
          onToggle={() => toggleSection('exposeApi')}
        >
          <p className="text-white/60 mb-4">
            Wrap your solution in a FastAPI server so the platform can call it:
          </p>
          <CodeBlock code={serverSkeleton} language="python" title="server.py" />
          
          <div className="mt-4 p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-magenta)]/10">
            <p className="text-white/60 text-sm">
              <span className="text-[var(--accent-magenta)] font-semibold">Run it:</span>{' '}
              <code className="text-white bg-white/10 px-2 py-0.5 rounded">python server.py --port 8100</code>
            </p>
          </div>
        </CollapsibleSection>

        {/* Expose to Internet with ngrok */}
        <CollapsibleSection
          id="ngrok-setup"
          title="Expose Your Local Server to the Internet"
          badge="3.5"
          badgeColor="emerald"
          isOpen={expandedSections.ngrok}
          onToggle={() => toggleSection('ngrok')}
        >
          <p className="text-white/60 mb-4">
            Since your server runs locally, you need to expose it to the internet so our platform can reach it. 
            We recommend using <a href="https://ngrok.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline font-semibold">ngrok</a> (free tier works fine!).
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-emerald-500/20">
              <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">1</span>
                Install ngrok
              </h4>
              <p className="text-white/60 text-sm mb-3">
                Download and install ngrok from the official website. Follow the instructions for your operating system:
              </p>
              <div className="flex flex-wrap gap-2">
                <a 
                  href="https://ngrok.com/download/mac-os" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  macOS
                </a>
                <a 
                  href="https://ngrok.com/download/windows" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91V13.1l10 .15z"/></svg>
                  Windows
                </a>
                <a 
                  href="https://ngrok.com/download/linux" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.002c-.06.194-.24.4-.615.535-.39.135-.84.2-1.29.135-.452-.064-.893-.2-1.26-.47-.36-.267-.707-.669-.869-1.2v-.002c-.655.467-1.29.535-1.785.399-.241-.066-.443-.2-.598-.4-.156-.2-.269-.398-.34-.732-.04-.2-.051-.4-.023-.734.027-.465-.052-.733-.056-.734v-.003c-.013-.065-.02-.135-.027-.2a.56.56 0 00-.02-.132l-.003-.003c-.027-.066-.054-.132-.094-.2a.928.928 0 00-.119-.2l-.003-.003c-.092-.133-.192-.266-.295-.4v-.001c-.204-.266-.42-.4-.636-.535-.22-.135-.465-.266-.62-.535-.065-.133-.089-.266-.088-.4.003-.2.092-.4.207-.534.116-.133.26-.266.382-.4l.003-.003c.167-.167.267-.333.333-.465.057-.135.066-.335.04-.533a1.334 1.334 0 00-.054-.4l-.001-.003c-.027-.066-.04-.132-.067-.2v-.003a.4.4 0 00-.026-.066l-.003-.003c-.027-.066-.04-.2-.027-.266.014-.066.04-.132.067-.2v-.003a.4.4 0 01.094-.133c.04-.028.08-.066.12-.066h.04l.003-.003h.027a.15.15 0 01.053.02l.003-.003c.054.027.08.066.106.132.027.066.04.132.054.2l.003.003c.027.066.027.132.04.2v.003c.013.066.027.133.027.2l.001.003v.001c.013.066.026.2.04.266.013.065.027.065.04.132h.004l.003.003c.027.066.054.132.08.2v.003c.054.132.108.266.188.398.08.135.186.27.32.4.267.267.4.535.467.668.067.132.1.266.1.4v.003c0 .2-.034.335-.067.466-.033.135-.1.266-.2.332-.099.068-.235.067-.368.067h-.003c-.133 0-.266-.033-.4-.067-.133-.03-.266-.1-.4-.132l-.002-.003c-.133-.033-.267-.066-.334-.133h-.003c-.133-.034-.2-.068-.267-.1l-.003-.003a.533.533 0 01-.2-.166.8.8 0 01-.132-.334l-.003-.003c-.013-.066-.013-.132-.013-.2v-.132l-.001-.003v-.134c0-.066-.014-.132-.014-.2h-.003l-.003-.002v-.003c0-.066 0-.133-.013-.2l-.003-.003v-.065h-.004c-.013-.066-.013-.133-.04-.2l-.003-.002c-.013-.066-.04-.132-.066-.2-.027-.066-.054-.132-.094-.198v-.003l-.003-.003c-.027-.066-.067-.133-.094-.2-.026-.066-.066-.132-.092-.198l-.003-.003-.003-.003c-.054-.133-.12-.266-.2-.4-.067-.132-.146-.265-.24-.398v-.003l-.003-.002a3.563 3.563 0 00-.534-.668 1.906 1.906 0 00-.733-.465 2.387 2.387 0 00-.934-.2h-.003c-.267 0-.534.066-.8.135-.267.066-.534.2-.8.333-.267.135-.534.267-.8.465-.267.2-.534.4-.8.667v.003c-.4.4-.734.733-1 1.067-.267.333-.467.666-.6 1-.134.333-.2.666-.2 1 0 .333.066.666.2 1 .133.333.333.666.6 1 .266.333.6.666 1 1 .4.332.866.666 1.4.932.533.267 1.066.467 1.533.6.466.135.866.2 1.133.2h.003c.133 0 .2-.035.266-.068l.003-.002c.067-.033.133-.1.2-.166.066-.068.133-.135.2-.268.066-.133.133-.266.2-.4h.003v-.003c.066-.133.133-.333.2-.533.066-.2.133-.4.2-.666.066-.267.133-.467.133-.734v-.003c0-.066.013-.132.013-.2v-.065l.003-.003v-.133h-.003v-.003c0-.066-.013-.133-.013-.2v-.066l-.003-.003v-.067h.003l.003-.002v-.003c0-.133.013-.266.026-.4.014-.133.027-.266.054-.4.026-.132.053-.266.08-.4.026-.132.066-.265.092-.4l.003-.002v-.003l.003-.003c.054-.133.12-.265.186-.398.067-.135.147-.27.234-.4.086-.133.186-.267.293-.4.106-.132.212-.265.332-.398v-.003l.003-.003c.12-.132.253-.265.386-.4.134-.132.28-.265.427-.397.146-.135.306-.27.466-.4.16-.135.333-.27.506-.4v-.003l.003-.003c.186-.132.36-.265.52-.4.16-.132.306-.265.44-.4l.003-.002c.133-.133.24-.267.32-.4.08-.133.133-.267.146-.4v-.003l.003-.003c.014-.066.014-.133.014-.2v-.066l-.003-.003v-.2h.003v-.132l-.003-.003v-.133c0-.066-.013-.132-.013-.2l-.003-.002v-.003l-.003-.003c0-.066-.013-.133-.04-.2v-.003l-.003-.003a.533.533 0 00-.08-.2l-.003-.003c-.027-.066-.066-.132-.106-.2a.8.8 0 00-.133-.198l-.003-.003c-.04-.066-.093-.133-.146-.2-.054-.066-.12-.132-.187-.2l-.003-.002-.003-.003a1.817 1.817 0 00-.44-.335 1.335 1.335 0 00-.533-.2h-.003a.933.933 0 00-.2-.013h-.133l-.003.003h-.133a.933.933 0 00-.2.013h-.003c-.2.033-.4.1-.533.2-.135.1-.28.2-.44.335l-.003.003-.003.002c-.067.068-.133.134-.187.2-.053.067-.106.134-.146.2l-.003.003a.8.8 0 00-.133.198c-.04.068-.08.134-.106.2l-.003.003v.003a.533.533 0 00-.08.2l-.003.003v.003c-.027.067-.04.134-.04.2l-.003.003v.003l-.003.002v.133h.003v.2l-.003.003v.066c0 .067 0 .134.014.2l.003.003v.003c.013.133.066.267.146.4.08.133.187.267.32.4l.003.002c.134.135.28.268.44.4.16.135.334.268.52.4l.003.003v.003c.173.13.346.265.506.4.16.13.32.265.466.4.147.132.293.265.427.397.133.135.266.268.386.4l.003.003v.003c.12.133.226.266.332.398.107.133.207.267.293.4.087.13.167.265.234.4.066.133.132.265.186.398v.003l.003.003v.003c.026.134.066.267.092.4.027.134.054.267.08.4.027.134.04.267.054.4.013.134.026.267.026.4v.003l.003.002v.067h-.003v.066c0 .067-.013.134-.013.2v.003h-.003v.133l.003.003v.065c0 .068-.013.134-.013.2v.003c0 .267-.067.467-.133.734-.067.266-.134.466-.2.666-.067.2-.134.4-.2.533v.003h-.003c-.067.134-.134.267-.2.4-.067.133-.134.2-.2.268-.067.066-.133.133-.2.166l-.003.002c-.066.033-.133.068-.266.068h-.003c-.267 0-.667-.065-1.133-.2-.467-.133-1-.333-1.534-.6-.533-.266-1-.6-1.4-.932-.4-.334-.733-.667-1-1-.266-.334-.466-.667-.6-1-.133-.334-.2-.667-.2-1 0-.334.067-.667.2-1 .134-.334.334-.667.6-1 .267-.334.6-.667 1-1.067v-.003c.267-.267.534-.467.8-.667.267-.198.534-.332.8-.465.267-.133.534-.267.8-.333.267-.069.534-.135.8-.135h.003c.334 0 .667.067.934.2.266.133.533.266.733.465.2.2.386.402.534.668v.002l.003.003c.08.133.16.266.24.398.08.134.146.267.2.4l.003.003.003.003c.027.066.066.132.094.198.026.067.066.134.092.2l.003.003v.003c.027.066.054.134.067.2.026.067.026.134.04.2h.003v.003l.003.002c0 .067.013.134.013.2v.003h.003v.134l.003.003v.132c0 .068.013.134.013.2v.003l.003.003v.065c0 .068 0 .134.013.2l.003.003.003.003c.013.066.027.132.04.2.014.066.027.132.054.2l.003.002c.026.066.04.132.066.2.027.066.054.132.08.2l.003.002h.003c.054.135.12.27.2.4.08.133.173.268.28.4.106.133.226.267.36.4.132.135.292.268.466.4l.003.002.003.003c.12.135.253.268.386.4.134.135.28.268.44.4.16.135.32.27.48.4.16.135.333.27.506.4v.003l.003.003c.2.135.4.268.6.4.2.135.4.268.6.4.2.135.4.268.6.4.2.135.4.268.6.4v.003l.003.003c.2.132.386.265.56.4.173.132.333.265.48.4.146.132.28.265.4.397.12.135.226.268.32.4l.003.003v.003c.093.133.173.267.24.4.066.135.12.268.16.4.04.135.066.268.08.4.013.135.013.268 0 .4v.003l-.003.003c-.013.133-.04.266-.08.4-.04.132-.093.265-.16.398-.066.135-.146.268-.24.4a3.24 3.24 0 01-.32.4l-.003.003c-.12.133-.253.266-.4.4-.146.132-.306.265-.48.397-.173.135-.36.268-.56.4l-.003.003v.003c-.2.132-.4.265-.6.4-.2.132-.4.265-.6.4-.2.132-.4.265-.6.4-.2.132-.4.265-.6.4v.002l-.003.003c-.173.13-.346.265-.506.4-.16.13-.32.265-.48.4-.16.132-.306.265-.44.4-.133.132-.266.265-.386.4l-.003.002v.003c-.134.133-.254.266-.36.4-.107.132-.2.267-.28.4-.08.132-.146.267-.2.4h-.003l-.003.002c-.027.066-.053.133-.08.2-.026.066-.04.133-.066.2l-.003.002-.003.003c-.027.066-.04.133-.054.2-.013.066-.027.133-.04.2v.002l-.003.003v.003c-.013.066-.013.133-.013.2v.066h-.003v.133l.003.003v.065c0 .067-.013.134-.013.2v.003c0 .267.067.467.2.667.133.2.333.333.6.4.266.066.6.066 1 0 .4-.068.866-.2 1.4-.4.533-.2 1.066-.467 1.6-.8v.003c.533-.333 1-.666 1.4-1 .4-.333.733-.666.933-1 .2-.333.334-.666.4-1 .067-.333.067-.666 0-1a2.94 2.94 0 00-.4-1c-.2-.333-.533-.666-.933-1-.4-.333-.867-.666-1.4-1a13.398 13.398 0 00-1.6-.8v-.003c-.534-.2-.934-.333-1.267-.4a2.71 2.71 0 00-.867-.066c-.267.033-.467.133-.6.266-.134.135-.2.335-.2.535v.003c0 .2.066.4.2.533.133.135.333.2.6.2h.003c.2 0 .466-.065.8-.2.333-.133.733-.333 1.2-.6v.003c.466-.266.866-.533 1.2-.8.333-.266.6-.533.8-.8.2-.266.333-.533.4-.8.066-.266.066-.533 0-.8a1.817 1.817 0 00-.4-.8c-.2-.266-.467-.533-.8-.8-.334-.266-.734-.533-1.2-.8l-.003-.002c-.467-.267-.867-.467-1.2-.6-.334-.135-.6-.2-.8-.2h-.003c-.267 0-.467.065-.6.2-.134.133-.2.333-.2.533v.003c0 .2.066.4.2.533.133.135.333.267.6.4.266.135.6.335 1 .6.4.267.866.6 1.4 1 .533.4 1 .8 1.333 1.2.334.4.534.8.6 1.2.067.4 0 .8-.2 1.2-.2.4-.533.8-1 1.2-.466.4-1.066.8-1.8 1.2-.733.4-1.533.733-2.4 1a7.97 7.97 0 01-2.6.4c-.867 0-1.667-.133-2.4-.4a5.978 5.978 0 01-1.8-1.2c-.467-.4-.8-.8-1-1.2-.2-.4-.267-.8-.2-1.2.066-.4.266-.8.6-1.2.333-.4.8-.8 1.333-1.2.534-.4.934-.733 1.4-1 .467-.267.8-.465 1-.6.2-.133.334-.265.4-.4.067-.133.067-.333 0-.533v-.003c-.066-.2-.2-.333-.4-.4-.2-.065-.466-.065-.8 0-.333.068-.733.2-1.2.4-.466.2-.933.467-1.4.8l-.003.002c-.466.267-.866.533-1.2.8-.333.267-.6.534-.8.8-.2.267-.333.534-.4.8-.066.267-.066.534 0 .8.067.267.2.534.4.8.2.267.467.534.8.8.334.267.734.534 1.2.8v.003c.467.266.934.466 1.267.6.334.133.6.2.8.2.2 0 .4-.067.534-.2.133-.135.2-.335.2-.535v-.003c0-.2-.067-.4-.2-.533-.134-.135-.334-.2-.6-.2h-.004c-.2 0-.466.065-.8.2-.333.133-.733.333-1.2.6v-.003c-.466.267-.866.534-1.2.8-.333.267-.6.534-.8.8-.2.267-.333.534-.4.8-.066.267-.066.534 0 .8.067.267.2.534.4.8.2.267.467.534.8.8.334.267.734.534 1.2.8l.003.003c.467.266.867.466 1.2.6.334.133.6.2.8.2h.004c.266 0 .466-.067.6-.2.133-.135.2-.335.2-.535v-.003c0-.2-.067-.4-.2-.533-.134-.135-.334-.267-.6-.4-.267-.135-.6-.335-1-.6a13.398 13.398 0 01-1.4-1c-.533-.4-1-.8-1.333-1.2-.334-.4-.534-.8-.6-1.2-.067-.4 0-.8.2-1.2.2-.4.533-.8 1-1.2.466-.4 1.066-.8 1.8-1.2.733-.4 1.533-.733 2.4-1 .866-.266 1.733-.4 2.6-.4.866 0 1.666.134 2.4.4.733.267 1.333.667 1.8 1.2.466.4.8.8 1 1.2.2.4.266.8.2 1.2-.067.4-.267.8-.6 1.2-.334.4-.8.8-1.334 1.2-.533.4-1.133.8-1.8 1.2-.666.4-1.4.733-2.2 1-.8.267-1.6.4-2.4.4-.8 0-1.534-.133-2.2-.4a5.465 5.465 0 01-1.8-1.2c-.467-.4-.8-.8-.934-1.2-.133-.4-.133-.8.067-1.2.2-.4.533-.8 1.067-1.2.533-.4 1.2-.8 2-1.2.8-.4 1.6-.733 2.4-1 .8-.266 1.533-.4 2.2-.4.666 0 1.266.134 1.8.4.533.267 1 .667 1.4 1.2.4.534.666 1.134.8 1.8.133.667.133 1.4 0 2.2-.134.8-.4 1.6-.8 2.4-.4.8-.934 1.6-1.6 2.4-.667.8-1.4 1.533-2.2 2.2-.8.666-1.6 1.2-2.4 1.6-.8.4-1.534.666-2.2.8-.667.133-1.267.133-1.8 0a3.312 3.312 0 01-1.4-.8c-.4-.4-.733-.933-1-1.6-.266-.666-.4-1.4-.4-2.2 0-.8.134-1.666.4-2.6.267-.933.667-1.866 1.2-2.8.534-.933 1.2-1.8 2-2.6.8-.8 1.667-1.466 2.6-2 .934-.533 1.867-.866 2.8-1 .934-.133 1.8-.066 2.6.2.8.267 1.467.733 2 1.4.534.666.867 1.533 1 2.6.134 1.066.067 2.266-.2 3.6-.266 1.333-.733 2.733-1.4 4.2-.666 1.466-1.533 2.933-2.6 4.4-1.066 1.466-2.266 2.866-3.6 4.2-1.333 1.333-2.733 2.533-4.2 3.6-1.466 1.066-2.933 1.933-4.4 2.6-1.466.666-2.866 1.133-4.2 1.4-1.333.266-2.533.333-3.6.2-1.066-.134-1.933-.467-2.6-1-.666-.534-1.133-1.2-1.4-2-.266-.8-.333-1.667-.2-2.6.134-.934.467-1.867 1-2.8.534-.934 1.2-1.8 2-2.6.8-.8 1.667-1.467 2.6-2 .934-.534 1.8-.867 2.6-1 .8-.134 1.534-.067 2.2.2.667.266 1.2.733 1.6 1.4.4.666.6 1.533.6 2.6 0 1.066-.2 2.266-.6 3.6-.4 1.333-1 2.733-1.8 4.2-.8 1.466-1.733 2.933-2.8 4.4-1.066 1.466-2.2 2.866-3.4 4.2-1.2 1.333-2.4 2.533-3.6 3.6-1.2 1.066-2.333 1.933-3.4 2.6-1.066.666-2.066 1.133-3 1.4-.933.266-1.733.333-2.4.2-.666-.134-1.2-.467-1.6-1-.4-.534-.6-1.2-.6-2 0-.8.2-1.667.6-2.6.4-.934 1-1.867 1.8-2.8.8-.934 1.733-1.8 2.8-2.6 1.067-.8 2.2-1.467 3.4-2 1.2-.534 2.4-.867 3.6-1 1.2-.134 2.334-.067 3.4.2 1.067.266 2 .733 2.8 1.4.8.666 1.4 1.533 1.8 2.6.4 1.066.6 2.266.6 3.6 0 1.333-.2 2.733-.6 4.2-.4 1.466-1 2.933-1.8 4.4-.8 1.466-1.8 2.866-3 4.2-1.2 1.333-2.534 2.533-4 3.6-1.467 1.066-3 1.933-4.6 2.6-1.6.666-3.2 1.066-4.8 1.2-1.6.133-3.134 0-4.6-.4-1.467-.4-2.8-1.067-4-2-1.2-.934-2.2-2.134-3-3.6-.8-1.467-1.334-3.2-1.6-5.2-.267-2-.267-4.267 0-6.8.266-2.534.8-5.267 1.6-8.2.8-2.934 1.866-6 3.2-9.2 1.333-3.2 2.933-6.467 4.8-9.8z"/></svg>
                  Linux
                </a>
              </div>
              <p className="text-white/50 text-xs mt-3">
                After installing, you may need to add your authtoken. Sign up for a free account at ngrok.com to get one.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-emerald-500/20">
              <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">2</span>
                Run your solution server
              </h4>
              <CodeBlock 
                code={`python server.py --port 8100`} 
                language="bash" 
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-emerald-500/20">
              <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                In a new terminal, expose it with ngrok
              </h4>
              <CodeBlock 
                code={`ngrok http 8100

# You'll see output like:
# Forwarding    https://abc123.ngrok-free.app -> http://localhost:8100`} 
                language="bash" 
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0b0f2b]/50 border border-emerald-500/20">
              <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">4</span>
                Submit your endpoint
              </h4>
              <p className="text-white/60 text-sm mb-2">
                Copy the ngrok URL and append <code className="text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 rounded">/solve</code>:
              </p>
              <CodeBlock 
                code={`https://abc123.ngrok-free.app/solve`} 
                language="text" 
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-amber-400 font-semibold mb-1">⚠️ Important: Keep Your Server Running!</h4>
                <ul className="text-amber-300/80 text-sm space-y-1">
                  <li>• <strong>Do NOT</strong> close your terminal or stop ngrok after submitting</li>
                  <li>• Our platform will call your endpoint multiple times during evaluation</li>
                  <li>• Keep both your server AND ngrok running for at least <strong>5-10 minutes</strong></li>
                  <li>• You can monitor requests in ngrok&apos;s web interface at <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">http://127.0.0.1:4040</code></li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Expected Output */}
        <CollapsibleSection
          id="output"
          title="Expected Output Format"
          badge="4"
          badgeColor="cyan"
          isOpen={expandedSections.output}
          onToggle={() => toggleSection('output')}
        >
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
        </CollapsibleSection>

        {/* Requirements */}
        <CollapsibleSection
          id="requirements"
          title="Requirements"
          badge="5"
          badgeColor="purple"
          isOpen={expandedSections.requirements}
          onToggle={() => toggleSection('requirements')}
        >
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
        </CollapsibleSection>

        {/* Official Docs */}
        <CollapsibleSection
          id="learn-more"
          title="Learn More"
          isOpen={expandedSections.learnMore}
          onToggle={() => toggleSection('learnMore')}
        >
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
        </CollapsibleSection>

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

