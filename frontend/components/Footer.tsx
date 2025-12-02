import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-[#0b0f2b] border-t border-[var(--accent-cyan)]/10 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">Alpha AI Datathon</h3>
                        <p className="text-white/40 text-sm">
                            Build, test, and compete with your RAG agents.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <p className="text-white/60 text-sm font-medium">
                            Created by <span className="text-[var(--accent-cyan)]">Amdjed Bensalah</span>
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.linkedin.com/in/amdj3dax/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/40 hover:text-[var(--accent-cyan)] transition-colors text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href="http://amdjed.me/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/40 hover:text-[var(--accent-cyan)] transition-colors text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                Website
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
                    © 2025 Alpha AI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
