"use client";

/**
 * @file auth-card.tsx
 * @description Provides a beautifully styled authentication card that toggles between
 * 'login' and 'registration' UI states. It supports interactive validation, error messaging,
 * and passes the mock authenticated user details up to the parent dashboard context upon completion.
 * Designed with academic focus to serve as a high-fidelity prototype in the Ph.D. project scope.
 */

import { useState } from "react";
import { Mail, Lock, User, Shield, AlertCircle, Phone, AtSign } from "lucide-react";
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

interface AuthCardProps {
  /**
   * Callback executed upon successful authentication.
   * Passes the authenticated username, email, and role.
   */
  onSuccess: (user: { email: string; name: string; role: "admin" | "user" }) => void;
  /**
   * The default active view mode for the card.
   */
  defaultMode?: "login" | "register";
}

export function AuthCard({ onSuccess, defaultMode = "login" }: AuthCardProps) {
  // Toggle state between Login ('login') and Register ('register') views
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  
  // Input fields state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Interactive error & loading status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Processes the form validation and manages the real API login/registration lifecycle.
   * Encapsulates validation conditions with precise state updates.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic Input Validations
    if (!email || !password) {
      setError("Please fill out all mandatory fields.");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Authentication failed.");
          setLoading(false);
          return;
        }

        onSuccess({
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        });
      } catch (err: any) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // REGISTER MODE
      if (!name) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      
      if (!username) {
        setError("Please enter a unique username.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match. Please verify.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Security Policy: Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email, mobile, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Registration failed.");
          setLoading(false);
          return;
        }

        onSuccess({
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        });
      } catch (err: any) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-md transition-all duration-300">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-3">
          <Shield className="h-8 w-8 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {mode === "login" ? "NardLens" : "Create NardLens Account"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {mode === "login"
            ? "AI Supplier Intelligence Agent"
            : "Register to manage your scraping pipelines"}
        </p>
      </div>

      {/* Form Submission Block */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error notification banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name field only displayed in Register mode */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Username field only displayed in Register mode */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Email Address Input field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@nardlens.ai"
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Mobile Number field only displayed in Register mode */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+49 1578 1558798"
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Password Input field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Confirmation field only displayed in Register mode */}
        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Interactive Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Verifying Credentials..." : mode === "login" ? "Sign In" : "Register Account"}
        </button>
      </form>

      {/* Mode Switch Controls */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
          <Link
            href={mode === "login" ? "/register" : "/login"}
            className="text-primary font-bold hover:underline transition-all"
          >
            {mode === "login" ? "Sign Up Now" : "Sign In Here"}
          </Link>
        </p>
      </div>
    </div>
  );
}
