'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/submit', label: 'Submit' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0b0f2b]/95 backdrop-blur-xl border-b border-[var(--accent-cyan)]/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Alpha AI Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="https://alphaai.alphabit.club/alpha-ai.svg"
              alt="Alpha AI Logo"
              width={140}
              height={40}
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(0,236,217,0.5)]"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 relative">
            {links.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== '/' && pathname.startsWith(link.href));
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
                      : 'text-white/80 hover:text-[var(--accent-cyan)] hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <a
            href="https://alphaai.alphabit.club/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-[var(--accent-cyan)] to-[#00d9c7] text-[#0b0f2b] hover:shadow-[0_0_25px_rgba(0,236,217,0.5)] hover:scale-105"
          >
            <span>Alpha AI Event</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-white/80 hover:text-[var(--accent-cyan)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
