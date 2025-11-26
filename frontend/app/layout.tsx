import type { Metadata } from "next";
import { Poppins, Inter, Inria_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

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
        className={`${poppins.variable} ${inter.variable} ${inriaSans.variable} antialiased min-h-screen`}
        style={{ background: "linear-gradient(180deg, #0b0f2b 0%, #132562 100%)" }}
      >
        <Navigation />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
