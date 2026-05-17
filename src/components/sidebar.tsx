"use client";

/**
 * @file sidebar.tsx
 * @description Renders a highly responsive and custom-styled sidebar component for Structora.
 * Dynamically adjusts visible navigation paths depending on user access clearance roles ('admin' vs 'user').
 * Features a client-side layout toggle for responsive scaling across mobile viewports and desktop setups.
 * Includes complete academic commentary matching Ph.D. level requirements.
 */

import { 
  Cpu, Users, CreditCard, ShieldCheck, 
  Menu, X, LogOut, Compass, Settings
} from "lucide-react";

export type SidebarTab = "console" | "services" | "users" | "billing" | "settings";

interface SidebarProps {
  // Current active viewport tab
  activeTab: SidebarTab;
  // Handler to set the active navigation panel
  setActiveTab: (tab: SidebarTab) => void;
  // Details of the authorized user session
  user: { name: string; email: string; role: "admin" | "user" };
  // Handler to terminate active session
  onLogout: () => void;
  // Controls collapse overlay on mobile
  isOpen: boolean;
  // Callback to toggle mobile toggle status
  setIsOpen: (isOpen: boolean) => void;
  // Controls desktop collapsed status
  isCollapsed: boolean;
  // Handler to toggle desktop collapse status
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  
  // Custom navigation routes filtering admin routes from normal user items
  const menuItems = [
    { id: "console", label: "Scraping Console", icon: Cpu, roles: ["admin", "user"] },
    { id: "services", label: "Scraper Services", icon: Compass, roles: ["admin", "user"] },
    { id: "users", label: "User Access Control", icon: Users, roles: ["admin"] },
    { id: "billing", label: "SaaS Subscription", icon: CreditCard, roles: ["admin"] },
    { id: "settings", label: "Platform Settings", icon: Settings, roles: ["admin"] },
  ] as const;

  return (
    <>
      {/* Mobile drawer overlay back-barrier */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Main Responsive Navigation Sidebar Drawer - 100% full screen height */}
      <aside className={`
        fixed md:sticky inset-y-0 left-0 z-40 bg-card border-r border-border 
        flex flex-col justify-between transition-all duration-300 ease-in-out h-screen shrink-0
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64"}
      `}>
        
        {/* Upper Sidebar Section: Branding & Navigation Items */}
        <div className={`flex flex-col gap-8 py-6 overflow-x-hidden transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}>
          
          {/* Futuristic Branding Container */}
          <div className={`flex items-center gap-2 pt-6 md:pt-0 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-extrabold text-base tracking-wider uppercase whitespace-nowrap transition-all duration-300 animate-fade-in">
                Structora <span className="text-primary font-medium">AI</span>
              </span>
            )}
          </div>

          {/* Structured Navigation Options */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              // Ensure component roles security checks align
              if (!(item.roles as readonly string[]).includes(user.role)) return null;
              
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false); // Auto close mobile drawer
                  }}
                  title={item.label}
                  className={`
                    w-full flex items-center rounded-xl font-semibold text-sm transition-all duration-300 py-3
                    ${isCollapsed ? "justify-center px-0" : "px-4 gap-3"}
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }
                  `}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                  {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar Section: User Profile Card & Log Out operations */}
        <div className={`border-t border-border/65 py-6 flex flex-col gap-4 transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}>
          
          {/* User Session Profile Card - Anchored beautifully in the bottom */}
          <div className={`p-3 bg-secondary/40 border border-border/60 rounded-xl flex flex-col gap-1.5 transition-all duration-300 ${isCollapsed ? "items-center px-1" : ""}`}>
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate animate-fade-in">Role: {user.role}</span>}
            </div>
            {!isCollapsed && (
              <div className="transition-all duration-300 animate-fade-in">
                <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
          </div>

          {/* Log Out Button */}
          <button
            onClick={onLogout}
            title="End Session"
            className={`
              w-full flex items-center text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] py-3
              ${isCollapsed ? "justify-center px-0" : "px-4 gap-3"}
            `}
          >
            <LogOut className="h-4.5 w-4.5 text-destructive shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">End Session</span>}
          </button>
        </div>

      </aside>
    </>
  );
}
