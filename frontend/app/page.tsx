import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={{ background: 'linear-gradient(180deg, #0b0f2b 0%, #0b0f2b 40%, rgba(19, 37, 98, 1) 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--accent-purple)]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[var(--accent-cyan)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[var(--accent-magenta)]/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        
        {/* Star Decorations */}
        <div className="absolute top-32 right-20 animate-sparkle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </div>
        <div className="absolute bottom-40 left-20 animate-sparkle" style={{ animationDelay: '1.5s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-cyan)">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Alpha AI Logo */}
              <div className="mb-8 animate-fade-in-up">
                <Image
                  src="https://alphaai.alphabit.club/alpha-ai.svg"
                  alt="Alpha AI"
                  width={400}
                  height={100}
                  className="mx-auto lg:mx-0 drop-shadow-[0_0_30px_rgba(0,236,217,0.3)]"
                  priority
                />
              </div>
              
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--accent-cyan)]/30 mb-6 animate-fade-in-up animation-delay-100">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] pulse-glow" />
                <span className="text-sm text-white/80">RAG Challenge Arena • 2 Active Challenges</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 animate-fade-in-up animation-delay-200">
                <span className="text-white">Build Smarter</span>
                <br />
                <span className="gradient-text">RAG Agents</span>
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-300">
                Test your RAG agents against real-world AI challenges at the <span className="text-[var(--accent-cyan)] font-semibold">Alpha AI Datathon 2025</span>. Retrieve information, reason through complexity, and compete on the leaderboard.
              </p>
              
              {/* Event Info */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--accent-cyan)]/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white/50 text-sm">Date</p>
                    <p className="text-white font-medium">27-29 November 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--accent-cyan)]/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white/50 text-sm">Location</p>
                    <p className="text-white font-medium">ESI-SBA, Algeria</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-400">
                <Link href="/challenges" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto text-center">
                  Explore Challenges
                </Link>
                <Link href="/submit" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto text-center">
                  Submit Your Agent
                </Link>
              </div>
            </div>
            
            {/* Right - Decorative Circle */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="relative">
                {/* Outer Circle */}
                <div className="circle-decoration w-72 h-72 flex items-center justify-center animate-float">
                  <div className="text-center">
                    <p className="text-5xl font-light text-white" style={{ fontFamily: 'serif' }}>RAG</p>
                    <p className="text-5xl font-light text-white" style={{ fontFamily: 'serif' }}>Arena</p>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 circle-decoration flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 circle-decoration flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-xl">🎯</span>
                </div>
                <div className="absolute top-1/2 -right-8 w-12 h-12 circle-decoration flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                  <span className="text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(19, 37, 98, 1) 0%, rgba(43, 71, 176, 1) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
              <h2 className="text-3xl md:text-5xl font-black text-white">How It Works</h2>
            </div>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Build agents that retrieve, reason, and respond. Our evaluation system tests real RAG capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: 'Access Knowledge Base',
                description: 'Use our hosted vector search API to retrieve relevant documents. No setup required.',
                color: 'from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20',
                iconColor: 'text-[var(--accent-cyan)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'Build Your Agent',
                description: 'Write a Python function or host an API endpoint that processes queries and returns structured answers.',
                color: 'from-[var(--accent-purple)]/20 to-[var(--accent-magenta)]/20',
                iconColor: 'text-[var(--accent-purple)]',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Get Scored',
                description: 'Our LLM-as-Judge evaluates retrieval accuracy, faithfulness, and reasoning quality.',
                color: 'from-[var(--accent-magenta)]/20 to-[var(--accent-cyan)]/20',
                iconColor: 'text-[var(--accent-magenta)]',
              },
            ].map((feature, index) => (
              <div key={index} className="card card-hover p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center ${feature.iconColor} mx-auto mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges Preview */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(43, 71, 176, 1) 0%, rgba(19, 37, 98, 1) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white">Active Challenges</h2>
                <p className="text-white/60">Test your RAG skills with these challenges</p>
              </div>
            </div>
            <Link href="/challenges" className="btn-secondary">
              View All Challenges
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Fact-Check Spider */}
            <Link href="/challenges/factcheck" className="card card-hover p-8 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-emerald-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="badge badge-beginner">Beginner</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[var(--accent-cyan)] transition-colors">
                The Fact-Check Spider
              </h3>
              <p className="text-white/60 mb-6">
                Verify claims against a Wikipedia-style knowledge base. Search for evidence and determine truth values.
              </p>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  20 Documents
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  50 Questions
                </span>
              </div>
            </Link>

            {/* Legal Clerk */}
            <Link href="/challenges/legal" className="card card-hover p-8 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span className="badge badge-medium">Medium</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[var(--accent-cyan)] transition-colors">
                The Legal Clerk
              </h3>
              <p className="text-white/60 mb-6">
                Navigate zoning laws with conflicting rules. Synthesize information and provide legally-grounded answers.
              </p>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  30 Clauses
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  50 Questions
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(19, 37, 98, 1) 0%, #0b0f2b 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gradient-border p-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
              <h2 className="text-3xl md:text-4xl font-black text-white">Ready to Compete?</h2>
            </div>
            <p className="text-white/60 mb-8 max-w-xl mx-auto text-lg">
              Join the <span className="text-[var(--accent-cyan)] font-semibold">Alpha AI Datathon 2025</span>. Test your RAG skills, compete with others, and win prizes!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/challenges" className="btn-primary px-8 py-4">
                Start Building
              </Link>
              <a 
                href="https://alphaai.alphabit.club/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary px-8 py-4 flex items-center gap-2"
              >
                Learn About Alpha AI
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ background: '#173274' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Divider Line */}
          <div className="section-divider mb-10" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logos */}
            <div className="flex items-center gap-6">
              <Image
                src="https://alphaai.alphabit.club/alpha-ai.svg"
                alt="Alpha AI"
                width={120}
                height={35}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              <div className="w-px h-12 bg-white/20" />
              <div className="text-white/60 text-sm">
                <p className="font-semibold text-white">RAG Challenge Arena</p>
                <p>Part of Alpha AI 2025</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/profile.php?id=100089682379294" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-[var(--accent-cyan)] hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/alphabitclub/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-[var(--accent-cyan)] hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/alphabit-club/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-[var(--accent-cyan)] hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://www.alphabit.club/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-[var(--accent-cyan)] hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
                  <path d="M2 12h20" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-white/40 text-sm">
              © 2025 All rights reserved - <a href="https://www.alphabit.club/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">ALPHABIT CLUB</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
