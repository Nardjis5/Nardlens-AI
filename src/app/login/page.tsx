"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import Link from "next/link";
import { Cpu } from "lucide-react";

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

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<SaaSUser[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("structora_users");
      if (stored) {
        setUsers(JSON.parse(stored));
      }
    }
  }, []);

  const handleSuccess = (userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("structora_session", JSON.stringify(userData));
    }
    router.push("/");
  };

  const handleRegister = (newUser: SaaSUser) => {
    const newUsers = [...users, newUser];
    if (typeof window !== "undefined") {
      localStorage.setItem("structora_users", JSON.stringify(newUsers));
    }
    setUsers(newUsers);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:opacity-90 transition-all">
          <Cpu className="h-5 w-5" />
        </div>
        <span className="font-heading font-extrabold text-lg tracking-wider text-foreground">Structora <span className="text-primary font-medium">AI</span></span>
      </Link>
      <div className="w-full max-w-md">
        <AuthCard 
          users={users} 
          onSuccess={handleSuccess} 
          onRegister={handleRegister} 
          defaultMode="login"
        />
      </div>
    </div>
  );
}
