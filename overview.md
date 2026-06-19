# NardLens AI - Project Overview

Welcome to the NardLens AI codebase! This document provides a detailed overview of the project's architecture, technologies, data flow, and underlying algorithms to help new developers quickly onboard.

## 🌟 Project Summary
NardLens AI is an enterprise-grade automated web scraping, indexing, and entity extraction pipeline. It enables real-time web discovery and business intelligence data harvesting by leveraging concurrent background threads, modern headless browser automation, and AI-powered data extraction.

The application allows users to query business topics (e.g., "Lawyers in Seattle") and instantly streams back structured lead generation data via Server-Sent Events (SSE).

---

## 🛠️ Technology Stack

The project operates as a multi-service stack with a decoupled frontend and backend.

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Glassmorphic UI aesthetics
- **Components**: shadcn/ui inspired (Radix UI, Lucide React icons, Recharts for data visualization)
- **State & Data**: React 19 concurrent features

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Server**: Uvicorn (ASGI proxy)
- **Web Scraping**: Headless Playwright (Chromium) for dynamic rendering, BeautifulSoup4 for DOM parsing
- **AI / NLP**: Google Generative AI (`gemini-1.5-flash`)
- **Concurrency**: `asyncio` background thread pools

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma Client (TypeScript) with `@prisma/adapter-pg`
- **Authentication**: JWT & `bcryptjs` for local hashed user credential management

---

## 🧠 Core Architecture & Algorithms

### 1. The Scraping Pipeline (API Layer)
The entire intelligence gathering mechanism operates in `api/main.py` through a streaming HTTP GET endpoint (`/api/scrape/stream`). The pipeline follows this algorithm:

1. **Local Knowledge Interception**: 
   - Checks the query against a localized hard-coded dataset (`resolve_local_knowledge`). If a match is found (e.g., "Lawyers in California"), it bypasses scraping entirely and returns high-fidelity pre-indexed data instantly.
   
2. **Discovery via DuckDuckGo**: 
   - If no local match exists, the backend spins up a Headless Playwright Chromium instance and queries DuckDuckGo.
   - It intercepts search results and resolves real target URLs while avoiding anti-bot honeypots.

3. **Deep Crawling**:
   - Playwright navigates to the resolved target URL.
   - The browser simulates scrolling (to trigger lazy-loaded elements) and captures the complete raw HTML DOM.

4. **DOM Pruning & Token Optimization**:
   - **BeautifulSoup4** decomposes non-essential HTML tags (`<script>`, `<style>`, `<nav>`, `<footer>`, `<svg>`) to reduce noise.
   - A custom Python filter isolates paragraphs that look like they contain emails, phone numbers, or query keywords. This heavily reduces the string size before it hits the LLM, saving upwards of 45% in API costs.

5. **AI Entity Extraction**:
   - The pruned context is sent to the **Google Gemini API** (`gemini-1.5-flash`).
   - *Cost-Saving Strategy*: The AI prompt enforces the return of a raw JSON array using abbreviated single-character keys (e.g., `n` for name, `p` for phone, `e` for email). The backend later maps these back to full keys.

6. **Rule-Based Fallback**:
   - If the Gemini API key is missing or the LLM fails, the system safely degrades to a Python regex-based parser (`rule_based_extract`) that targets standard phone number and email patterns to construct mock/extracted records.

### 2. Server-Sent Events (SSE)
- Throughout the pipeline, the Python backend yields JSON strings via `StreamingResponse`. 
- This powers the real-time "progress log" UI in the Next.js frontend, letting the user watch the AI agent's actions (e.g., "Spawning Chromium...", "Stripping styles...") while waiting for the final dataset.

---

## 🗄️ Database Schema & User Management

The Prisma schema (`prisma/schema.prisma`) maintains essential application state:
- **`User` Model**: Handles authentication. Includes `username`, `email`, hashed `password`, billing plans (`Basic`, `Pro`, `Enterprise`), and roles (`admin`, `user`).
- **`Settings` Model**: Admin workspace settings for the application. Stores the `geminiKey` securely, along with `playwrightUrl` (for remote browser connections via websockets).

*Note: You can seed default admin accounts using `npx tsx prisma/seed.ts`.*

---

## 🚦 Getting Started for Developers

1. **Environment Setup**: Ensure `.env` is configured with `DATABASE_URL`, `GEMINI_API_KEY`, etc.
2. **Database Push**: Run `npx prisma db push` and `npm run dev:seed` (if applicable) to load the schema.
3. **Backend Service**: Activate your Python `venv`, run `pip install -r api/requirements.txt`, and boot with `uvicorn api.main:app --reload --port 8000`. Ensure Playwright binaries are installed (`playwright install chromium`).
4. **Frontend Service**: Run `npm install` and `npm run dev` to start the Next.js client on port 3000.

Happy coding! If you need to debug the scraping engine, start with `api/main.py`. For UI adjustments, dive into `src/app`.
