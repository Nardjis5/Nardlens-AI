"use client";

import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirecting home handles token verification via cookies automatically
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative animate-fade-in">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:opacity-90 transition-all">
          <Cpu className="h-5 w-5" />
        </div>
        <span className="font-heading font-extrabold text-lg tracking-wider text-foreground">NardLens <span className="text-primary font-medium">AI</span></span>
      </Link>
      <div className="w-full max-w-md">
        <AuthCard 
          onSuccess={handleSuccess} 
          defaultMode="register"
        />
      </div>
    </div>
  );
}
