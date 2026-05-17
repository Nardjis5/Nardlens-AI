import type { Metadata } from "next";
import { Roboto_Mono, Orbitron } from "next/font/google";
import "./globals.css";

// Roboto Mono for digital values, console logs, and standard UI components
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

// Orbitron for futuristic headers, branding, and status badges (Browse.ai look)
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Structora AI - Automated Data Extraction Console",
  description: "AI-Agent powered crawling, Playwright orchestration, and LLM text normalization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoMono.variable} ${orbitron.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-mono" suppressHydrationWarning>{children}</body>
    </html>
  );
}
