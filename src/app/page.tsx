"use client";

/**
 * @file page.tsx
 * @description Root page controller for the Structora application. Manages client-side 
 * user authentication states, routes visitors between the public-facing landing and the 
 * secure scraping console, and handles the high-level layout. All methods and structural 
 * layout elements are thoroughly documented to fit high academic standards.
 */

import { useState, useEffect, Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardMock } from "@/components/dashboard-mock";
import { Cpu, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SaaSUser {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  plan: "Basic" | "Pro" | "Enterprise";
  status: "Active" | "Suspended";
  joinedDate: string;
  password?: string;
}

interface UserSession {
  email: string;
  name: string;
  role: "admin" | "user";
  plan: string;
}

export default function Home() {
  // Session state: null indicates a public/anonymous guest, UserSession details indicate active login
  const [session, setSession] = useState<UserSession | null>(null);

  // Safely initialize session from PostgreSQL via secure HTTP-only cookies
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then(data => {
        if (data.authenticated) {
          setSession(data.user);
        }
      })
      .catch(() => {
        setSession(null);
      });
  }, []);

  /**
   * Logouts the active user, clearing local session states.
   */
  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        setSession(null);
      })
      .catch(err => console.error("Logout failed:", err));
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground transition-all duration-300 ${session ? "h-screen overflow-hidden" : ""}`}>
      
      {/* Global Navigation Bar - ONLY displayed to public anonymous guests */}
      {!session && (
        <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
            
            {/* Logo Group */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <span className="font-heading font-extrabold text-lg tracking-wider">Structora <span className="text-primary font-medium">AI</span></span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main content body rendering logic */}
      <main className="flex-1 flex flex-col justify-center">
        {session ? (
          // Secure application workspace console - takes full height and full width!
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Cpu className="h-8 w-8 animate-pulse text-primary" /></div>}>
            <DashboardMock 
              user={session} 
              onLogout={handleLogout} 
            />
          </Suspense>
        ) : (
          // Public landing page and presentation screen
          <div className="flex-1 flex flex-col py-16 px-4 md:py-24 max-w-[1800px] mx-auto w-full gap-16 lg:px-12">
            
            {/* Split hero block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Product value proposition */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Next-Gen Web Crawler & NLP Engine
                </div>
                
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight uppercase">
                  Intelligent <span className="gradient-text">Web Data Extraction</span> Powered by AI Agents
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Structora discover websites, simulates human browsing behavior utilizing Playwright automation, 
                  scrapes HTML structures, and translates raw textual contents into highly structured, exportable JSON 
                  entities via Gemini's large language model capabilities.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
                  >
                    Launch Interactive Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#"
                    className="flex items-center gap-2 px-6 py-3 border border-border text-foreground hover:bg-secondary/40 font-semibold rounded-xl transition-all"
                  >
                    Methodology Docs
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Graphical placeholder representing automated scraping layout */}
              <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-xl flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 bg-primary/10 rounded-bl-2xl text-primary font-bold text-xs uppercase tracking-wider">
                  Live Preview
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground uppercase tracking-wide">Scraping Blueprint Status</h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Category Discovery</p>
                      <p className="text-[11px] text-muted-foreground">Found 18 cement manufacturers in western Mumbai</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Playwright Headless Navigation</p>
                      <p className="text-[11px] text-muted-foreground">Handling AJAX scroll page heights automatically</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl opacity-60">
                    <div className="h-5 w-5 rounded-full border border-border shrink-0 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">NLP Entity Translation</p>
                      <p className="text-[11px] text-muted-foreground">Mapping unstructured contact tables to JSON formats</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-400 font-mono text-[10px] space-y-1 mt-2">
                  <div>&#123;</div>
                  <div className="pl-4">"company_name": "ABC Suppliers Ltd",</div>
                  <div className="pl-4">"location": "Andheri East, Mumbai",</div>
                  <div className="pl-4">"phone": "+91 99123 45678"</div>
                  <div>&#125;</div>
                </div>
              </div>

            </div>

            {/* Core Pillars Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-16">
              
              <div className="space-y-2.5">
                <h4 className="font-bold text-base text-foreground">Playwright Browser nodes</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bypasses static HTML restrictions by running complete browser nodes, letting you scrape heavy 
                  single page applications and JavaScript-rendered layouts.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-base text-foreground">NLP Entity Translation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Utilizes LLM parsing templates so that completely unstructured business websites are easily normalized 
                  into standardized columns, fields, and values.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-base text-foreground">Academic Multi-User Stack</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Next.js frontend coupled with custom FastAPI modules deployed within isolated Docker containers to provide 
                  a unified, lightweight workspace prototype.
                </p>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Persistent Footer */}
      {!session && (
        <footer className="border-t border-border bg-card/30 py-8 text-center text-xs text-muted-foreground mt-auto">
          <p>© {new Date().getFullYear()} Structora AI Scraper • Developed for Ph.D. Research Thesis. All rights reserved.</p>
        </footer>
      )}



    </div>
  );
}
