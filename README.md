# Startup Blueprint Generator

A full-stack AI application that converts a plain-language startup idea into a structured, actionable business blueprint using **IBM Granite** LLM and a **RAG pipeline** built on **FAISS**.

## Features

- **Business Model Canvas** (9-block Osterwalder framework)
- **Budget Estimate** (one-time + monthly, with INR figures)
- **Go-To-Market Strategy** (3-phase phased rollout)
- **Competitor Analysis** (5 matched competitors with positioning gaps)
- **Government Schemes** (Startup India, MSME, AIM, SIDBI, etc.)
- **Investor Matches** (Sequoia Surge, Blume, YC, IAN, Accel, etc.)
- **Legal & Compliance Checklist** (registration steps, IP, risks)
- **Export** to PDF or DOCX
- **Iterative follow-up chat** on any blueprint section

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | IBM Granite 13B Instruct v2 via watsonx.ai |
| Embeddings | IBM Slate 125M via watsonx.ai (fallback: `all-MiniLM-L6-v2`) |
| Vector DB | FAISS (in-memory, `faiss-cpu`) |
| Backend | Python 3.11 + FastAPI |
| Frontend | Next.js 14 + Tailwind CSS |
| PDF Export | WeasyPrint |
| DOCX Export | python-docx |

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An IBM Cloud account with a watsonx.ai project

### 1. Clone and configure

```bash
cp .env.example .env
# Edit .env and fill in:
#   WATSONX_API_KEY=your_ibm_api_key
#   WATSONX_PROJECT_ID=your_project_id
```

> **Demo mode:** If you leave `WATSONX_API_KEY` blank, the app runs with a local `sentence-transformers` embedding model and structured mock responses. All sections are populated — you just won't get Granite-powered generative text until the key is added.

### 2. Start the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy .env from project root
copy ..\.env .env
uvicorn main:app --reload --port 8000
```

The first start pre-warms the FAISS index and downloads the embedding model (~90 MB, one time only).

### 3. Start the frontend

```powershell
cd frontend
npm install
# Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Usage

1. Type your startup idea in plain English in the chat box.
2. Press **Enter** — the blueprint is generated in 15–30 seconds (with Granite) or ~3 seconds (demo mode).
3. Use the **tabs** in the right panel to navigate sections.
4. Ask **follow-up questions** in the chat about any section.
5. Click **Word (.docx)** or **PDF** to download the full blueprint.

---

## IBM Cloud Setup

1. Go to [cloud.ibm.com](https://cloud.ibm.com) → Create account (Lite tier is free)
2. Navigate to **Watson Machine Learning** → Create instance
3. Go to **watsonx.ai** → Create a project
4. Copy your **Project ID** and generate an **API key** from IAM
5. Paste both into your `.env` file

---

## Project Structure

```
startup-blueprint-generator/
├── backend/
│   ├── main.py                   # FastAPI app + endpoints
│   ├── agents/
│   │   ├── blueprint_gen.py      # Core orchestrator (7 sections)
│   │   ├── intent_extractor.py   # Structured intent parsing
│   │   └── llm_client.py         # IBM Granite client + mock
│   ├── rag/
│   │   ├── embedder.py           # IBM Slate / sentence-transformers
│   │   ├── vector_store.py       # FAISS index builder + search
│   │   └── retriever.py          # High-level retrieval helpers
│   ├── exporters/
│   │   ├── pdf_exporter.py       # WeasyPrint PDF
│   │   ├── docx_exporter.py      # python-docx DOCX
│   │   └── shared_template.py    # Jinja2 HTML template
│   └── knowledge_base/
│       ├── schemes.json          # 8 Indian government schemes
│       ├── competitors.json      # 6 competitor profiles
│       ├── market_reports.json   # 8 sector market reports
│       └── investors.json        # 7 investors/incubators
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main layout + state
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatPanel.tsx         # Chat UI with follow-up support
│   │   ├── BlueprintPanel.tsx    # Tabbed blueprint viewer (8 sections)
│   │   └── ExportBar.tsx         # PDF/DOCX download buttons
│   ├── lib/
│   │   ├── api.ts                # Backend API client
│   │   └── utils.ts
│   └── types/blueprint.ts        # Shared TypeScript types
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate` | Generate full blueprint from idea text |
| `POST` | `/api/followup` | Answer follow-up question in session context |
| `POST` | `/api/export` | Export blueprint as PDF or DOCX |
| `GET` | `/api/session/{id}` | Retrieve existing session |
| `GET` | `/health` | Health check |

---

## Knowledge Base

The bundled knowledge base covers:
- **8 government schemes** (Startup India SISFS, MSME TUFS, AIM, SIDBI SMILE, Digital India, National SC-ST Hub, PLI, iCreate)
- **6 competitors** (Bizplan, LivePlan, Ideabuddy, Notion AI, Strategyzer, Upmetrics)
- **8 market reports** (SaaS, Edtech, Fintech, Healthtech, D2C, Agritech, Logistics, Manufacturing)
- **7 investors** (Peak XV/Sequoia, Blume, YC, IAN, Nasscom 10K, Accel India, Founder Institute)

To add your own documents, add entries to the JSON files in `backend/knowledge_base/` and restart the backend (index rebuilds automatically).
