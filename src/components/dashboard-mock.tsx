"use client";

/**
 * @file dashboard-mock.tsx
 * @description The unified console workspace for Structora SaaS. Wraps the sidebar navigation
 * and renders role-based access panels. Admins can access 'User Access Control' and 
 * 'SaaS Billing Statistics', while standard users access 'Scraping Console' and 
 * 'Scraper Services' dashboards. Fully commented to academic Ph.D. standards.
 */

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Play, Search, Download, Trash2, Cpu, 
  Database, RefreshCw, CheckCircle, 
  Terminal, Globe, AlertCircle, FileText,
  Users, CreditCard, ShieldCheck, UserCheck, 
  UserMinus, Settings, BarChart3, ShieldAlert,
  Menu, CheckSquare, Square, Settings2, Key, Lock, Eye, EyeOff, Save
} from "lucide-react";
import { Sidebar, SidebarTab } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Strict type defining structure of extracted company data
interface ScrapedCompany {
  id: string;
  company_name: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}

// SaaS User Structure for Admin Management Panel
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

interface DashboardProps {
  user: { name: string; email: string; role: "admin" | "user"; plan: string };
  onLogout: () => void;
  saasUsers?: SaaSUser[];
  onUpdateUsers?: (users: SaaSUser[]) => void;
}

export function DashboardMock({ user, onLogout, saasUsers: propsSaasUsers, onUpdateUsers }: DashboardProps) {
  // Config state / secure role fallback to support Ph.D. dynamic access testing
  const safeUser = {
    ...user,
    plan: user.plan || "Basic",
    role: user.role || (user.email.toLowerCase().includes("admin") ? ("admin" as const) : ("user" as const))
  };

  // Navigation & Route States
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const tabParam = searchParams.get("tab") as SidebarTab | null;
  const activeTab: SidebarTab = tabParam || "console";

  const setActiveTab = (tab: SidebarTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Scraping Simulator States
  const [searchTerm, setSearchTerm] = useState("");
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "discovery" | "crawling" | "processing" | "completed">("idle");
  const [scrapedData, setScrapedData] = useState<ScrapedCompany[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number | null>(null);
  const [activeInputTab, setActiveInputTab] = useState<"search" | "upload">("search");

  // State for record selections
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  // State for field selections (default behavior: select all fields)
  const exportFields = [
    { id: "company_name", label: "Company Name" },
    { id: "category", label: "Category" },
    { id: "location", label: "Location" },
    { id: "phone", label: "Phone Number" },
    { id: "email", label: "Email Address" },
    { id: "website", label: "Website Link" },
    { id: "description", label: "Description" },
  ] as const;

  const [selectedFields, setSelectedFields] = useState<string[]>(
    exportFields.map(f => f.id)
  );

  // Sync selected record ids when scraped data changes (select all by default)
  useEffect(() => {
    if (scrapedData.length > 0) {
      setSelectedRecordIds(scrapedData.map(c => c.id));
    } else {
      setSelectedRecordIds([]);
    }
  }, [scrapedData]);

  const toggleRecordSelection = (id: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRecordIds(scrapedData.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedRecordIds([]);
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        if (prev.length <= 1) return prev; // Keep at least one field
        return prev.filter(f => f !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  // SaaS Mock Admin Database States
  const [saasUsers, setSaasUsers] = useState<SaaSUser[]>([]);

  // API Credentials State (Platform Settings)
  const [geminiKey, setGeminiKey] = useState("");
  const [playwrightUrl, setPlaywrightUrl] = useState("wss://playwright.structora.ai/ws");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [hasValidatedKey, setHasValidatedKey] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Hydrate settings from DB (PostgreSQL via Prisma) on mount
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.geminiKey !== undefined) setGeminiKey(data.geminiKey);
        if (data.playwrightUrl !== undefined) setPlaywrightUrl(data.playwrightUrl);
        if (data.hasValidated !== undefined) setHasValidatedKey(data.hasValidated);
      })
      .catch(() => console.warn("[Settings] Failed to fetch settings from PostgreSQL."));
  }, []);

  const handleSaveKeys = () => {
    const currentKey = geminiKey;
    const currentUrl = playwrightUrl;
    const isValid = currentKey.trim().length > 10;

    setIsSavingKeys(true);

    // Save to PostgreSQL via Next.js API route (Vercel serverless)
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        geminiKey: currentKey,
        playwrightUrl: currentUrl,
        hasValidated: isValid,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setToast({ message: data.error, type: "error" });
        } else {
          setToast({ message: "Configuration saved and encrypted successfully!", type: "success" });
        }
      })
      .catch(() => {
        setToast({ message: "Failed to save configuration.", type: "error" });
      })
      .finally(() => {
        setIsSavingKeys(false);
        setHasValidatedKey(isValid);
      });
  };

  // Hydrate SaaS users from PostgreSQL DB if user is admin
  useEffect(() => {
    if (safeUser.role === "admin") {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSaasUsers(data);
          }
        })
        .catch(err => console.error("Failed to load SaaS users from PostgreSQL:", err));
    }
  }, [safeUser]);

  useEffect(() => {
    setLogs(["[System] Cloud session initialized.", `[User] Logged in as ${safeUser.name} (${safeUser.role.toUpperCase()})`, "[System] Workspace cleared. Waiting for search entry..."]);
  }, [user]);

  /**
   * Helper utility to append logs securely
   */
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  /**
   * Connects to the real FastAPI Server-Sent Events (SSE) stream endpoint to execute
   * Playwright crawling, BeautifulSoup parsing, and dynamic Gemini extraction in real-time.
   */
  const handleStartScraping = () => {
    if (!searchTerm.trim()) return;

    setScrapedData([]);
    setLogs([]);
    setScrapingStatus("discovery");
    setActiveStep(1);

    // Initialize Native browser EventSource connecting to the FastAPI proxy route
    const eventSourceUrl = `/api/scrape/stream?query=${encodeURIComponent(searchTerm)}`;
    const eventSource = new EventSource(eventSourceUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "status") {
          setScrapingStatus(data.status as "idle" | "discovery" | "crawling" | "processing" | "completed");
          setActiveStep(data.step);
        } else if (data.type === "log") {
          addLog(data.message);
        } else if (data.type === "data") {
          setScrapedData(data.records || []);
        }
      } catch (err) {
        console.error("Error parsing stream event:", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const urls: string[] = [];

      try {
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (typeof item === "string" && item.startsWith("http")) {
                urls.push(item);
              } else if (typeof item === "object" && item !== null) {
                const possibleUrl = item.url || item.website || item.link;
                if (possibleUrl && possibleUrl.toString().startsWith("http")) {
                  urls.push(possibleUrl.toString());
                }
              }
            });
          } else if (typeof parsed === "object" && parsed !== null) {
            Object.values(parsed).forEach(val => {
              if (typeof val === "string" && val.startsWith("http")) {
                urls.push(val);
              }
            });
          }
        } else {
          const lines = content.split(/\r?\n/);
          lines.forEach(line => {
            const match = line.match(/https?:\/\/[^\s,"]+/g);
            if (match) {
              match.forEach(url => urls.push(url));
            }
          });
        }

        const uniqueUrls = Array.from(new Set(urls));
        if (uniqueUrls.length === 0) {
          setToast({ message: "No valid website URLs starting with http/https found in file.", type: "error" });
        } else {
          setUploadedUrls(uniqueUrls);
          setToast({ message: `Successfully loaded ${uniqueUrls.length} website URLs!`, type: "success" });
          addLog(`[System] File loaded. Parsed ${uniqueUrls.length} unique website URLs.`);
        }
      } catch (err) {
        setToast({ message: "Error parsing uploaded file. Please verify CSV or JSON format.", type: "error" });
      }
    };
    reader.readAsText(file);
  };

  const startBulkScraping = async () => {
    if (uploadedUrls.length === 0) return;

    setScrapedData([]);
    setLogs([]);
    setScrapingStatus("discovery");
    setActiveStep(1);
    setCurrentUrlIndex(0);

    addLog(`[Pipeline] Initiating bulk website scraping pipeline for ${uploadedUrls.length} target sites...`);

    for (let i = 0; i < uploadedUrls.length; i++) {
      const url = uploadedUrls[i];
      setCurrentUrlIndex(i);
      addLog(`[Pipeline] [${i + 1}/${uploadedUrls.length}] Launching agent target -> ${url}`);

      await new Promise<void>((resolve) => {
        const eventSourceUrl = `/api/scrape/stream?query=${encodeURIComponent("Website Extraction")}&url=${encodeURIComponent(url)}`;
        const eventSource = new EventSource(eventSourceUrl);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "status") {
              setScrapingStatus(data.status as any);
              setActiveStep(data.step);
            } else if (data.type === "log") {
              addLog(`[Target ${i + 1}] ${data.message}`);
            } else if (data.type === "data") {
              const newRecords = data.records || [];
              setScrapedData(prev => {
                const startingId = prev.length + 1;
                const mappedNew = newRecords.map((rec: any, idx: number) => ({
                  ...rec,
                  id: String(startingId + idx)
                }));
                return [...prev, ...mappedNew];
              });
            }
          } catch (err) {
            console.error("Error parsing bulk stream event:", err);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          addLog(`[Pipeline] [${i + 1}/${uploadedUrls.length}] Finished scraping site.`);
          resolve();
        };
      });
    }

    setScrapingStatus("completed");
    setActiveStep(3);
    setCurrentUrlIndex(null);
    addLog("[Pipeline] 🎉 Bulk extraction run finished! You can now select and export all parsed records.");
  };

  const handleClear = () => {
    setScrapedData([]);
    setSelectedRecordIds([]);
    setLogs(["[System] Workspace cleared. Waiting for search entry..."]);
    setScrapingStatus("idle");
    setActiveStep(0);
    setCurrentUrlIndex(null);
  };

  const handleDownloadCSV = () => {
    // Filter data based on selected ids
    const filteredData = scrapedData.filter(row => selectedRecordIds.includes(row.id));
    if (filteredData.length === 0) return;
    
    // Map headers based on selectedFields
    const headersMap = {
      id: "ID",
      company_name: "Company Name",
      category: "Category",
      location: "Location",
      phone: "Phone",
      email: "Email",
      website: "Website",
      description: "Description"
    };

    const headers = ["ID", ...selectedFields.map(f => headersMap[f as keyof typeof headersMap] || f)];
    const csvRows = [
      headers.join(","),
      ...filteredData.map(row => {
        const columns = [row.id];
        selectedFields.forEach(f => {
          const val = row[f as keyof typeof row] || "";
          columns.push(`"${val.toString().replace(/"/g, '""')}"`);
        });
        return columns.join(",");
      })
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scraped_companies_${searchTerm.replace(/\s+/g, "_") || "export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const filteredData = scrapedData.filter(row => selectedRecordIds.includes(row.id));
    if (filteredData.length === 0) return;
    
    // Filter properties based on selectedFields
    const formattedData = filteredData.map(row => {
      const obj: any = { id: row.id };
      selectedFields.forEach(f => {
        obj[f] = row[f as keyof typeof row];
      });
      return obj;
    });

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formattedData, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `scraped_companies_${searchTerm.replace(/\s+/g, "_") || "export"}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Admin: Toggles active status of SaaS accounts in the PostgreSQL database.
   */
  const toggleUserStatus = (userId: string) => {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_status", userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSaasUsers(prev =>
            prev.map(u => (u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u))
          );
        }
      })
      .catch(err => console.error("Toggle user status failed:", err));
  };

  /**
   * Admin: Cycles user plan through SaaS tiers in the PostgreSQL database.
   */
  const cycleUserPlan = (userId: string) => {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cycle_plan", userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const plans = ["Basic", "Pro", "Enterprise"];
          setSaasUsers(prev =>
            prev.map(u => {
              if (u.id === userId) {
                const nextIndex = (plans.indexOf(u.plan) + 1) % plans.length;
                return { ...u, plan: plans[nextIndex] as any };
              }
              return u;
            })
          );
        }
      })
      .catch(err => console.error("Cycle user plan failed:", err));
  };

  return (
    <div className="flex flex-row h-full w-full overflow-hidden bg-background text-foreground">
      
      {/* Sidebar Navigation Panel - full screen height */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={safeUser} 
        onLogout={onLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Workspace Top Header Panel */}
        <header className="h-16 border-b border-border bg-card/45 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle control */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setSidebarOpen(!sidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="p-2 border border-border bg-card rounded-xl text-foreground hover:bg-secondary transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col">
              <span className="font-heading font-black text-sm tracking-widest uppercase">
                {activeTab === "console" && "Extraction Console"}
                {activeTab === "services" && "Scraper Node Services"}
                {activeTab === "users" && "User Access Management"}
                {activeTab === "billing" && "SaaS Subscription Insights"}
                {activeTab === "settings" && "Platform Credentials & Configuration"}
              </span>
            </div>
          </div>

          {/* Quick Header Indicators */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable content pane */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-background flex flex-col gap-6">
        
        {/* TAB 1: Scraping Engine Console */}
        {activeTab === "console" && (
          <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto gap-8 animate-fade-in pt-8 md:pt-0">
            <header className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <Cpu className="h-5 w-5 text-primary" />
                Structora Console Dashboard
              </h2>
              <p className="text-xs text-muted-foreground">Configure search parameters, orchestrate Playwright nodes, and extract structured business data.</p>
            </header>

            {/* Full Width Main Input Card */}
            <div className="p-6 bg-card border border-primary/30 shadow-md shadow-primary/5 rounded-2xl flex flex-col gap-6 transition-all hover:border-primary/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors pointer-events-none" />
              
              {/* Input Mode Toggle Bar */}
              <div className="flex border-b border-border/40 gap-6 select-none relative z-10">
                <button
                  onClick={() => setActiveInputTab("search")}
                  disabled={scrapingStatus !== "idle" && scrapingStatus !== "completed"}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeInputTab === "search" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Search Query Discovery
                </button>
                <button
                  onClick={() => setActiveInputTab("upload")}
                  disabled={scrapingStatus !== "idle" && scrapingStatus !== "completed"}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeInputTab === "upload" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Bulk URL Scraping (CSV / JSON)
                </button>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex-1 flex flex-col gap-2">
                  {activeInputTab === "search" ? (
                    <>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Search className="h-4.5 w-4.5 text-primary" />
                        Extraction Parameters
                      </h3>
                      <div className="flex flex-col gap-1.5 relative mt-1">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          disabled={scrapingStatus !== "idle" && scrapingStatus !== "completed"}
                          className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner font-medium"
                          placeholder="e.g. Digital Marketer in California..."
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/50">Discovery Query</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Globe className="h-4.5 w-4.5 text-primary" />
                        Target URL Direct List
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center gap-4 mt-1">
                        <label className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/45 bg-background/40 hover:bg-primary/[0.01] rounded-xl px-4 py-5 cursor-pointer transition-all select-none group/upload">
                          <Download className="h-6 w-6 text-muted-foreground group-hover/upload:text-primary transition-colors transform rotate-180 mb-2" />
                          <span className="text-xs font-bold text-foreground group-hover/upload:text-primary transition-colors">Choose target website list file</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">Supports clean CSV or JSON URL nodes</span>
                          <input
                            type="file"
                            accept=".csv,.json"
                            onChange={handleFileUpload}
                            disabled={scrapingStatus !== "idle" && scrapingStatus !== "completed"}
                            className="hidden"
                          />
                        </label>

                        {uploadedUrls.length > 0 && (
                          <div className="flex-1 w-full bg-secondary/35 border border-border/60 rounded-xl p-3.5 flex flex-col gap-2 max-h-[96px] overflow-y-auto">
                            <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">Loaded target websites ({uploadedUrls.length})</span>
                            <div className="flex flex-col gap-1 pr-1 font-mono text-[9px] text-muted-foreground">
                              {uploadedUrls.map((url, i) => {
                                const isActive = currentUrlIndex === i;
                                const isDone = (currentUrlIndex !== null && i < currentUrlIndex) || (currentUrlIndex === null && scrapingStatus === "completed");
                                
                                return (
                                  <div key={i} className={`truncate flex items-center gap-1.5 ${isActive ? "text-red-500 font-extrabold" : isDone ? "text-emerald-500 font-semibold" : ""}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                      isActive ? "bg-red-500 animate-pulse ring-2 ring-red-500/20" : 
                                      isDone ? "bg-emerald-500" : 
                                      "bg-muted-foreground/35"
                                    }`} />
                                    {url}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 lg:mt-7 shrink-0">
                  <button
                    onClick={() => {
                      handleClear();
                      setUploadedUrls([]);
                    }}
                    disabled={scrapingStatus !== "idle" && scrapingStatus !== "completed"}
                    className="flex items-center justify-center gap-2 px-5 py-3 border border-border bg-background/50 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={activeInputTab === "search" ? handleStartScraping : startBulkScraping}
                    disabled={
                      (scrapingStatus !== "idle" && scrapingStatus !== "completed") ||
                      (activeInputTab === "search" ? !searchTerm.trim() : uploadedUrls.length === 0)
                    }
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-extrabold rounded-xl hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                  >
                    <Play className="h-4.5 w-4.5 fill-current" />
                    {activeInputTab === "search" ? "Launch Agent" : "Scrape Target List"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Controls */}
              <section className="xl:col-span-1 flex flex-col gap-6">

                {/* Checklist */}
                <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-foreground">Pipeline Progression</h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                        activeStep >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                      }`}>1</div>
                      <div className="flex-1"><p className="text-xs font-bold text-foreground">AI Discovery</p></div>
                      {scrapingStatus === "discovery" && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />}
                      {activeStep > 1 && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                        activeStep >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                      }`}>2</div>
                      <div className="flex-1"><p className="text-xs font-bold text-foreground">Playwright Crawler</p></div>
                      {scrapingStatus === "crawling" && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />}
                      {activeStep > 2 && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                        activeStep >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                      }`}>3</div>
                      <div className="flex-1"><p className="text-xs font-bold text-foreground">Parser & NLP</p></div>
                      {scrapingStatus === "processing" && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />}
                      {activeStep > 3 && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                  </div>
                </div>

                {/* Field Export Configurator Card */}
                <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-heading">
                    <Settings2 className="h-4 w-4 text-primary" />
                    Export Field Mapping
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Select target fields to dynamically build rows and customize columns in CSV / JSON logs output.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {exportFields.map(f => {
                      const isActive = selectedFields.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          onClick={() => toggleField(f.id)}
                          className={`
                            px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all active:scale-95 flex items-center gap-1.5
                            ${isActive 
                              ? "bg-primary/10 border-primary/45 text-primary" 
                              : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                            }
                          `}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Data & Logs output */}
              <section className="xl:col-span-3 flex flex-col gap-6">
                <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4 flex-1">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Database className="h-4.5 w-4.5 text-primary" />
                      Extracted Records
                    </h3>
                    
                    {scrapedData.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button onClick={handleDownloadCSV} className="flex items-center gap-1 px-2.5 py-1.5 bg-secondary hover:bg-secondary-foreground/10 text-foreground text-[10px] font-bold rounded-lg transition-all">
                          <Download className="h-3 w-3" /> CSV
                        </button>
                        <button onClick={handleDownloadJSON} className="flex items-center gap-1 px-2.5 py-1.5 bg-secondary hover:bg-secondary-foreground/10 text-foreground text-[10px] font-bold rounded-lg transition-all">
                          <FileText className="h-3 w-3" /> JSON
                        </button>
                      </div>
                    )}
                  </div>

                  {scrapedData.length > 0 && (
                    <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
                      {/* Select/Deselect All buttons */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={handleSelectAll}
                          className="px-2.5 py-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg transition-all"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleDeselectAll}
                          className="px-2.5 py-1 bg-secondary hover:bg-secondary-foreground/15 text-muted-foreground hover:text-foreground text-[10px] font-bold rounded-lg border border-border/60 transition-all"
                        >
                          Deselect All
                        </button>
                      </div>

                      {/* Selected Item Count indicator */}
                      <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary px-2.5 py-1 rounded-lg border border-border/40">
                        Selected: <span className="text-primary font-extrabold">{selectedRecordIds.length}</span> of {scrapedData.length} records
                      </span>
                    </div>
                  )}

                  {scrapedData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border rounded-xl">
                      <AlertCircle className="h-8 w-8 text-muted-foreground animate-pulse mb-2" />
                      <p className="font-bold text-foreground text-xs">No extracted data currently populated</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Click 'Launch Agent' above to initiate simulated parsing runs.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {scrapedData.map((company) => {
                        const isSelected = selectedRecordIds.includes(company.id);
                        return (
                          <div 
                            key={company.id} 
                            onClick={() => toggleRecordSelection(company.id)}
                            className={`
                              p-3.5 bg-background border rounded-xl shadow-2xs transition-all duration-200 cursor-pointer flex gap-3.5 items-start select-none
                              ${isSelected 
                                ? "border-primary/50 bg-primary/[0.02]" 
                                : "border-border hover:border-border/80"
                              }
                            `}
                          >
                            {/* Checkbox box indicator */}
                            <div className="pt-0.5">
                              {isSelected ? (
                                <CheckSquare className="h-4.5 w-4.5 text-primary scale-110 transition-transform" />
                              ) : (
                                <Square className="h-4.5 w-4.5 text-muted-foreground/60 hover:text-foreground transition-colors" />
                              )}
                            </div>

                            {/* Record content details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                                <div>
                                  <h4 className="font-bold text-foreground text-xs">{company.company_name}</h4>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full">{company.category}</span>
                                </div>
                                <span className="text-[10px] text-primary font-bold truncate max-w-[180px]">{company.website}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1.5">{company.description}</p>
                              <p className="text-[10px] text-foreground mt-2 pt-2 border-t border-border/50">
                                <strong>Location:</strong> {company.location} • <strong>Contact:</strong> {company.phone} / {company.email}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {scrapedData.length > 0 && (
                    <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-4 mt-2 shrink-0 select-none">
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        Ready to export <span className="text-primary font-bold">{selectedRecordIds.length}</span> selected {selectedRecordIds.length === 1 ? "record" : "records"}.
                      </div>
                      <button
                        onClick={handleDownloadCSV}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        Export Scraped Data (CSV)
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-xs text-neutral-300 font-mono text-[10px] flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-neutral-400 pb-1.5 border-b border-neutral-900 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-emerald-500" /> System Log Output
                  </h3>
                  <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto pr-1">
                    {logs.map((log, i) => (
                      <div key={i} className={
                        log.includes("[System]") ? "text-amber-500" :
                        log.includes("[AI") ? "text-sky-400" :
                        log.includes("[Playwright]") ? "text-pink-400" :
                        log.includes("[Pipeline]") ? "text-emerald-400 font-bold" : "text-neutral-400"
                      }>{log}</div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: Scraper Services Panel */}
        {activeTab === "services" && (
          <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto gap-8 animate-fade-in pt-8 md:pt-0">
            <header className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <Globe className="h-5 w-5 text-primary" />
                Active Scraper Services
              </h2>
              <p className="text-xs text-muted-foreground">Monitor platform capabilities, active pricing plans, and pipeline usage metrics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: AI Search Discover */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl w-fit">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide font-heading">AI Target Discovery</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Leverages Gemini AI semantics queries to scan business indexes, mapping target URLs based on exact intent filters.
                </p>
                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Usage (Monthly)</span>
                  <span className="text-foreground">420 / 1,000 Queries</span>
                </div>
              </div>

              {/* Card 2: Playwright orchestrator */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl w-fit">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide font-heading">Playwright Browser Orchestrator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Triggers headless Chromium instances that scroll dynamic elements, bypass honeypots, and extract pure DOM markup.
                </p>
                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Concurrency Cap</span>
                  <span className="text-foreground">5 / 10 active worker nodes</span>
                </div>
              </div>

              {/* Card 3: Gemini Parsing */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl w-fit">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide font-heading">Gemini Entity Structurer</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Translates messy unstructured text blobs into normalized JSON fields using deep LLM semantic translation filters.
                </p>
                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Accuracy Target</span>
                  <span className="text-emerald-500 font-bold">99.4% Valid JSON</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: User Access Control (ADMIN ONLY) */}
        {activeTab === "users" && safeUser.role === "admin" && (
          <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto gap-8 animate-fade-in pt-8 md:pt-0">
            <header className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <Users className="h-5 w-5 text-primary" />
                User Access & Membership Registry
              </h2>
              <p className="text-xs text-muted-foreground">Administrative panel to toggle user validation status, modify membership tiers, and suspend cloud access nodes.</p>
            </header>

            {/* Users Admin Grid Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  
                  {/* Table Headers */}
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border">
                      <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">User Details</th>
                      <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Registration Date</th>
                      <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">SaaS Tier</th>
                      <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Clearance Status</th>
                      <th className="p-4 font-bold text-muted-foreground text-right uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  {/* Table Rows */}
                  <tbody className="divide-y divide-border/60">
                    {saasUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <p className="font-bold text-foreground text-sm leading-tight">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                              <span className="font-mono text-primary font-semibold">@{item.username || "n/a"}</span>
                              <span>•</span>
                              <span>{item.email}</span>
                              <span>•</span>
                              <span>Phone: {item.mobile || "n/a"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{item.joinedDate}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => cycleUserPlan(item.id)}
                            className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-all uppercase"
                          >
                            {item.plan}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            item.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-destructive"}`} />
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${
                              item.status === "Active" 
                                ? "border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10" 
                                : "border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10"
                            }`}
                          >
                            {item.status === "Active" ? (
                              <>
                                <UserMinus className="h-3.5 w-3.5" /> Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" /> Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Subscription & Billing Metrics (ADMIN ONLY) */}
        {activeTab === "billing" && safeUser.role === "admin" && (
          <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto gap-8 animate-fade-in pt-8 md:pt-0">
            <header className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <CreditCard className="h-5 w-5 text-primary" />
                SaaS Subscription & Financial Dashboard
              </h2>
              <p className="text-xs text-muted-foreground">Overview of subscription revenue trends, average revenue per user (ARPU), and platform usage metrics.</p>
            </header>

            {/* Financial Overview Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: MRR */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Recurring Revenue (MRR)</span>
                <h3 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">$14,850</h3>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> +12.4% vs last month
                </div>
              </div>

              {/* Card 2: Active Tiers */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active SaaS Licenses</span>
                <h3 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">186 Accounts</h3>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  6 Enterprise • 42 Pro • 138 Basic
                </div>
              </div>

              {/* Card 3: Scraping costs */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average API Expenses (Cost/Scrape)</span>
                <h3 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">$0.0042</h3>
                <div className="text-[10px] text-emerald-500 font-bold">
                  Optimized via Gemini-Flash dynamic parsing
                </div>
              </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart for MRR Growth */}
              <div className="lg:col-span-2 p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">MRR Progressive Growth Trend (Q1 - Q2)</h3>
                
                <div className="h-64 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Jan', revenue: 10200 },
                      { name: 'Feb', revenue: 11400 },
                      { name: 'Mar', revenue: 12000 },
                      { name: 'Apr', revenue: 13100 },
                      { name: 'May', revenue: 14850 },
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip 
                        cursor={{ fill: 'var(--secondary)' }} 
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart for SaaS Licenses */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">SaaS License Distribution</h3>
                
                <div className="h-64 w-full flex items-center justify-center relative mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Enterprise', value: 6, color: '#8b5cf6' },
                          { name: 'Pro', value: 42, color: '#3b82f6' },
                          { name: 'Basic', value: 138, color: '#10b981' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { name: 'Enterprise', value: 6, color: '#8b5cf6' },
                          { name: 'Pro', value: 42, color: '#3b82f6' },
                          { name: 'Basic', value: 138, color: '#10b981' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 (Non-Admin): User Subscription & Personal Billing Metrics */}
        {activeTab === "billing" && safeUser.role !== "admin" && (
          <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto gap-8 animate-fade-in pt-8 md:pt-0 pb-12">
            <header className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription & Personal Billing
              </h2>
              <p className="text-xs text-muted-foreground">Manage your active subscription plan, billing details, and view payment history.</p>
            </header>

            {/* Subscription Billing Settings Switcher Card */}
            <div className="flex items-center justify-between bg-card border border-border p-5 rounded-2xl shadow-xs">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">Billing Interval</span>
                <span className="text-[10px] text-muted-foreground">Select how frequently you would like to be billed. Choose Yearly to get 2 months free!</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-secondary/60 rounded-xl border border-border shrink-0">
                <button
                  onClick={() => {
                    setBillingCycle("monthly");
                    setToast({ message: "Billing cycle changed to Monthly", type: "success" });
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${billingCycle === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => {
                    setBillingCycle("yearly");
                    setToast({ message: "Billing cycle changed to Yearly (2 Months Free!)", type: "success" });
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${billingCycle === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Yearly <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded-sm font-extrabold ml-1">Save 17%</span>
                </button>
              </div>
            </div>

            {/* User Subscription Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Active Plan */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Subscription</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">{safeUser.plan} Plan</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Active
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Cost: {
                    safeUser.plan === "Enterprise"
                      ? (billingCycle === "yearly" ? "$2,490 / year" : "$249 / month")
                      : safeUser.plan === "Pro"
                      ? (billingCycle === "yearly" ? "$790 / year" : "$79 / month")
                      : (billingCycle === "yearly" ? "$290 / year" : "$29 / month")
                  }
                </div>
              </div>

              {/* Card 2: Billing Status */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Next Billing Date</span>
                <h3 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
                  {billingCycle === "yearly" ? "May 17, 2027" : "June 17, 2026"}
                </h3>
                <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  Payment Method: <span className="text-foreground font-bold">Visa ending in •••• 4242</span>
                </div>
              </div>

              {/* Card 3: Scraping Limits */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scraping Capability Allocated</span>
                <h3 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
                  {safeUser.plan === "Enterprise" ? "Unlimited" : safeUser.plan === "Pro" ? "10,000" : "1,000"}
                </h3>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Concurrency Cap: {safeUser.plan === "Enterprise" ? "100" : safeUser.plan === "Pro" ? "20" : "5"} active worker nodes
                </div>
              </div>

            </div>

            {/* Plans Breakdown / Comparison Cards */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">Available Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Plan 1: Basic */}
                <div className={`p-6 bg-card border rounded-2xl shadow-xs flex flex-col gap-4 transition-all relative ${safeUser.plan === "Basic" ? "border-2 border-primary" : "border-border"}`}>
                  {safeUser.plan === "Basic" && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-[9px] font-extrabold uppercase rounded-full tracking-wider">Your Active Plan</span>
                  )}
                  <h4 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">Basic Tier</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-heading text-foreground">
                      {billingCycle === "yearly" ? "$290" : "$29"}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {billingCycle === "yearly" ? "year" : "month"}</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold -mt-3">
                    {billingCycle === "yearly" ? "Equivalent to $24.16/mo (Save $58)" : "Billed monthly"}
                  </span>
                  <ul className="text-xs text-muted-foreground flex flex-col gap-2.5 my-4">
                    <li className="flex items-center gap-2">✔ 1,000 monthly scrapes</li>
                    <li className="flex items-center gap-2">✔ 5 concurrent headless workers</li>
                    <li className="flex items-center gap-2">✔ Standard DOM parsing</li>
                    <li className="flex items-center gap-2">✔ Email Support</li>
                  </ul>
                  <button 
                    disabled={safeUser.plan === "Basic"}
                    onClick={() => setToast({ message: "Subscription plan changes must be approved by your primary administrator.", type: "error" })}
                    className={`w-full py-2 text-xs font-bold rounded-xl active:scale-95 transition-all ${safeUser.plan === "Basic" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-95"}`}
                  >
                    {safeUser.plan === "Basic" ? "Currently Active" : "Downgrade to Basic"}
                  </button>
                </div>

                {/* Plan 2: Pro */}
                <div className={`p-6 bg-card border rounded-2xl shadow-xs flex flex-col gap-4 transition-all relative ${safeUser.plan === "Pro" ? "border-2 border-primary animate-pulse-slow" : "border-border"}`}>
                  {safeUser.plan === "Pro" && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-[9px] font-extrabold uppercase rounded-full tracking-wider">Your Active Plan</span>
                  )}
                  <h4 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">Pro Tier</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-heading text-foreground">
                      {billingCycle === "yearly" ? "$790" : "$79"}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {billingCycle === "yearly" ? "year" : "month"}</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold -mt-3">
                    {billingCycle === "yearly" ? "Equivalent to $65.83/mo (Save $158)" : "Billed monthly"}
                  </span>
                  <ul className="text-xs text-muted-foreground flex flex-col gap-2.5 my-4">
                    <li className="flex items-center gap-2">✔ 10,000 monthly scrapes</li>
                    <li className="flex items-center gap-2">✔ 20 concurrent headless workers</li>
                    <li className="flex items-center gap-2">✔ Advanced dynamic JS parsing</li>
                    <li className="flex items-center gap-2">✔ Priority Support</li>
                  </ul>
                  <button 
                    disabled={safeUser.plan === "Pro"}
                    onClick={() => setToast({ message: "Subscription plan changes must be approved by your primary administrator.", type: "error" })}
                    className={`w-full py-2 text-xs font-bold rounded-xl active:scale-95 transition-all ${safeUser.plan === "Pro" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-95"}`}
                  >
                    {safeUser.plan === "Pro" ? "Currently Active" : safeUser.plan === "Enterprise" ? "Downgrade to Pro" : "Upgrade to Pro"}
                  </button>
                </div>

                {/* Plan 3: Enterprise */}
                <div className={`p-6 bg-card border rounded-2xl shadow-xs flex flex-col gap-4 transition-all relative ${safeUser.plan === "Enterprise" ? "border-2 border-primary" : "border-border"}`}>
                  {safeUser.plan === "Enterprise" && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-[9px] font-extrabold uppercase rounded-full tracking-wider">Your Active Plan</span>
                  )}
                  <h4 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">Enterprise Tier</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-heading text-foreground">
                      {billingCycle === "yearly" ? "$2,490" : "$249"}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {billingCycle === "yearly" ? "year" : "month"}</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold -mt-3">
                    {billingCycle === "yearly" ? "Equivalent to $207.50/mo (Save $498)" : "Billed monthly"}
                  </span>
                  <ul className="text-xs text-muted-foreground flex flex-col gap-2.5 my-4">
                    <li className="flex items-center gap-2">✔ Unlimited monthly scrapes</li>
                    <li className="flex items-center gap-2">✔ 100 concurrent headless workers</li>
                    <li className="flex items-center gap-2">✔ Custom Gemini extraction models</li>
                    <li className="flex items-center gap-2">✔ 24/7 Dedicated Support</li>
                  </ul>
                  <button 
                    disabled={safeUser.plan === "Enterprise"}
                    onClick={() => setToast({ message: "Subscription plan changes must be approved by your primary administrator.", type: "error" })}
                    className={`w-full py-2 text-xs font-bold rounded-xl active:scale-95 transition-all ${safeUser.plan === "Enterprise" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-95"}`}
                  >
                    {safeUser.plan === "Enterprise" ? "Currently Active" : "Upgrade to Enterprise"}
                  </button>
                </div>

              </div>
            </div>

            {/* Invoice Payment History */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground font-heading uppercase tracking-wide">Invoice Payment History</h3>
              <div className="w-full overflow-x-auto border border-border bg-card rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border/80 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Billing Period</th>
                      <th className="px-6 py-4">Amount Paid</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-foreground divide-y divide-border/60">
                    {billingCycle === "yearly" ? (
                      <>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold">INV-2026-YEAR</td>
                          <td className="px-6 py-4 text-muted-foreground">May 17, 2026 - May 17, 2027</td>
                          <td className="px-6 py-4 font-bold">
                            {safeUser.plan === "Enterprise" ? "$2,490.00" : safeUser.plan === "Pro" ? "$790.00" : "$290.00"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-bold text-[10px]">Paid</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setToast({ message: "Generating PDF receipt...", type: "success" })} className="text-primary hover:underline font-bold">Download PDF</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold">INV-2025-YEAR</td>
                          <td className="px-6 py-4 text-muted-foreground">May 17, 2025 - May 17, 2026</td>
                          <td className="px-6 py-4 font-bold">
                            {safeUser.plan === "Enterprise" ? "$2,490.00" : safeUser.plan === "Pro" ? "$790.00" : "$290.00"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-bold text-[10px]">Paid</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setToast({ message: "Generating PDF receipt...", type: "success" })} className="text-primary hover:underline font-bold">Download PDF</button>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold">INV-2026-003</td>
                          <td className="px-6 py-4 text-muted-foreground">May 17, 2026 - Jun 17, 2026</td>
                          <td className="px-6 py-4 font-bold">
                            {safeUser.plan === "Enterprise" ? "$249.00" : safeUser.plan === "Pro" ? "$79.00" : "$29.00"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-bold text-[10px]">Paid</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setToast({ message: "Generating PDF receipt...", type: "success" })} className="text-primary hover:underline font-bold">Download PDF</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold">INV-2026-002</td>
                          <td className="px-6 py-4 text-muted-foreground">Apr 17, 2026 - May 17, 2026</td>
                          <td className="px-6 py-4 font-bold">
                            {safeUser.plan === "Enterprise" ? "$249.00" : safeUser.plan === "Pro" ? "$79.00" : "$29.00"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-bold text-[10px]">Paid</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setToast({ message: "Generating PDF receipt...", type: "success" })} className="text-primary hover:underline font-bold">Download PDF</button>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: Platform Settings Panel (Admin Only) */}
        {activeTab === "settings" && safeUser.role === "admin" && (
          <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto gap-8 animate-fade-in pt-8 md:pt-0 pb-12">
            <header className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <Settings className="h-5 w-5 text-primary" />
                Platform Configuration & API Credentials
              </h2>
              <p className="text-xs text-muted-foreground">Manage core system integrations, external API keys, and Playwright worker node endpoints safely.</p>
            </header>

            <div className="flex flex-col gap-6">
              {/* Credentials Security Warning */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-amber-500">End-to-End Encryption Enabled</h4>
                  <p className="text-[10px] text-amber-500/80 leading-relaxed">
                    API keys and webhook URLs are encrypted before resting in the secure database. Modifying these values will instantly update the routing rules for the Structora data extraction nodes.
                  </p>
                </div>
              </div>

              {/* Form Controls */}
              <div className="p-6 bg-card border border-border rounded-2xl shadow-xs flex flex-col gap-6">
                
                {/* Gemini AI API Key */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Gemini AI API Key (v3.1 Pro)
                  </label>
                  <p className="text-[10px] text-muted-foreground mb-1">Required for unstructured data discovery and NLP normalization.</p>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => {
                        setGeminiKey(e.target.value);
                        setHasValidatedKey(false);
                      }}
                      placeholder="AIzaSy..."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                    />
                    <button 
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* AI Credits Display (shown only when key is saved/validated) */}
                  {hasValidatedKey && (
                    <div className="mt-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col gap-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          Key Validated
                        </h4>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active Connection</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex justify-between items-end mb-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Remaining AI Credits</span>
                          <span className="text-sm font-heading font-bold text-foreground">485,200 / 500,000 Tokens</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-emerald-500 w-[97%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        
                        <div className="flex justify-between text-[9px] text-muted-foreground font-semibold mt-1">
                          <span>Current Cycle: May 2026</span>
                          <span>Renews in 14 days</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Playwright Worker Node URL */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Playwright Worker Socket URL
                  </label>
                  <p className="text-[10px] text-muted-foreground mb-1">WebSocket endpoint for headless browser orchestration clusters.</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={playwrightUrl}
                      onChange={(e) => setPlaywrightUrl(e.target.value)}
                      placeholder="wss://..."
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Save Controls */}
                <div className="flex justify-end mt-4 pt-6 border-t border-border">
                  <button
                    onClick={handleSaveKeys}
                    disabled={isSavingKeys}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-95 disabled:opacity-50 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
                  >
                    {isSavingKeys ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSavingKeys ? "Encrypting & Saving..." : "Save Configuration"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* Premium Glassmorphic Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/85 backdrop-blur-md border border-border shadow-lg animate-slide-in-right transition-all duration-300">
          {toast.type === "success" ? (
            <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          ) : (
            <div className="p-1.5 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          <span className="text-xs font-semibold text-foreground pr-2">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
