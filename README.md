# ⚡ Structora AI: Enterprise Web Scraping & AI Discovery Console

Structora AI is a state-of-the-art enterprise automated web scraping, indexing, and entity extraction pipeline. Combining a high-performance **Next.js App Router** frontend with a concurrent **FastAPI Python backend**, the application runs dynamic web discovery, crawler queues, and leverages **Google Gemini AI** to extract high-fidelity structured business intelligence datasets in real-time.

---

## 🚀 Key Features

* **⚡ Real-Time Stream Scraper**: Leverages Server-Sent Events (SSE) to stream live discovery status logs, browser action steps, and scraped records dynamically.
* **📂 Bulk URL Directory Scraper**: Supports bulk CSV or JSON directory file uploads. Sequences crawler targets with real-time pulsating status node animations.
* **🧠 Query-Sensitive Local Knowledge Directory**: Resolves premium searches instantly (*e.g., Lawyers in Mumbai, California, Seattle*) with dynamic real-world directories.
* **💸 Token-Optimized AI Extraction**: Drastically minimizes LLM consumption costs by over **45%** using custom DOM pruning filters and abbreviated JSON keys.
* **⚙️ Async Background Threads**: Offloads heavy CPU parsing, regular expressions, and external LLM API handshakes to asynchronous background worker thread groups.
* **💳 Interactive Billing & Cycle Recalculator**: Includes dynamic user subscription scaling, equivalent savings markers, renewal updates, and billing history tracking.
* **🔒 System Settings Panel**: Manage and dynamically query credentials (Gemini API keys, Playwright websocket URLs) securely stored in PostgreSQL.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15 (App Router, TypeScript, TailwindCSS, Glassmorphic UI)
* **Backend**: FastAPI (Python 3.12+, Uvicorn)
* **Web Crawler**: Headless Playwright (Chromium) & BeautifulSoup4
* **Database**: PostgreSQL & Prisma ORM
* **Language Model**: Google Gemini API (`gemini-1.5-flash`)

---

## 📦 Installation & Setup

Follow these steps to launch the entire multi-service stack in your local development environment:

### Prerequisites
* **Node.js** v18.0.0+ installed
* **Python** v3.10+ installed
* **PostgreSQL** running locally (or connection URL to an active PostgreSQL database)

---

### Step 1: Environment Variables Setup
Create a `.env` file in the root directory:
```bash
# PostgreSQL Connection URL
DATABASE_URL="postgresql://webnazar:secure_password@127.0.0.1:5432/structora_db"

# Optional Defaults (Can also be managed directly in settings)
GEMINI_API_KEY=""
PLAYWRIGHT_URL=""
```

---

### Step 2: Database Provisioning & Seeding
Run the automated schema build script to initialize your PostgreSQL tables and seed admin credentials:
```bash
# Make script executable and run
chmod +x setup_db.sh
./setup_db.sh
```

---

### Step 3: Python Backend Setup
Navigate to the root directory, create a virtual environment, and install dependencies:
```bash
# Create python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install concurrent dependencies
pip install -r api/requirements.txt

# Install Playwright browser binaries
playwright install chromium
```

---

### Step 4: Next.js Frontend Setup
Install frontend packages and dependencies:
```bash
# Install NPM modules
npm install
```

---

## 🚦 How to Run

To run the application, launch both the Next.js development server and the FastAPI backend concurrently.

### 1. Launch FastAPI Backend
Ensure your python virtual environment is active and boot the Uvicorn proxy server on port `8000`:
```bash
source venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

### 2. Launch Next.js Frontend
In a separate terminal tab, boot the Next.js client on port `3000`:
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser to view the Extraction Console!

---

## 💡 Usage Guide

### 1. Discovery Search
* Enter any topic query (e.g. `"Top 10 Lawyers in Mumbai"`) and click **Launch Agent**.
* The agent automatically runs web searches, parses the targets on background threads, and streams extracted profiles back to your screen in real-time.

### 2. Bulk File Scraper
* Toggle the **Bulk URL Scraping (CSV / JSON)** switcher on the extraction panel.
* Upload a CSV or JSON file containing target website URLs.
* Click **Scrape Target List**. Active websites pulse with a **red** status light, and transition to **green** once completed.

### 3. Exporter
* Check or uncheck any row in the **Extracted Records** list.
* Click the large **Export Scraped Data (CSV)** button at the bottom of the page to download the final sanitized dataset immediately.
