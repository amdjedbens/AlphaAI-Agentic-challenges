import type { Metadata } from "next";
import { Poppins, Inter, Inria_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { WelcomePopup } from "@/components/WelcomePopup";
import { Footer } from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inriaSans = Inria_Sans({
  variable: "--font-inria",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Alpha AI 2025 | RAG Challenge Arena",
  description: "Alpha AI Datathon 2025 - Test your RAG agents against real-world AI challenges. Build, submit, and compete at the Alpha AI event.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${inriaSans.variable} antialiased min-h-screen flex flex-col`}
        style={{ background: "linear-gradient(180deg, #0b0f2b 0%, #132562 100%)" }}
      >
        <Navigation />
        <main className="pt-20 flex-grow">
          {children}
        </main>
        <Footer />

        {/* Challenge Ended Banner */}
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-slow">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-500/20 border border-red-400/50 backdrop-blur-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Challenge Ended
          </div>
        </div>

        <WelcomePopup />
      </body>
    </html>
  );
}
