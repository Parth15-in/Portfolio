# Parth Patel — Portfolio & AI Portfolio Assistant

Modern, high-performance developer portfolio built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, featuring an integrated **production-quality Retrieval-Augmented Generation (RAG) AI Chatbot** powered by **Groq** and dense semantic vector search.

---

## 🤖 AI Portfolio Assistant Architecture

The AI Portfolio Assistant enables recruiters, hiring managers, and visitors to ask natural-language questions about Parth Patel's background, education, technical skills, internship contributions, projects, achievements, and contact information.

```
                           ┌───────────────────────────────┐
                           │   Knowledge Sources:          │
                           │   1. Portfolio Content/Data   │
                           │   2. Resume PDF (public/)     │
                           └───────────────┬───────────────┘
                                           │
                                           ▼ (npm run ingest)
                           ┌───────────────────────────────┐
                           │   Semantic Extraction &       │
                           │   Section Chunking Pipeline   │
                           └───────────────┬───────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────┐
                           │  Dense Embedding Generation   │
                           │  (all-MiniLM-L6-v2 / OpenAI)  │
                           └───────────────┬───────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────┐
                           │   Vector Store:               │
                           │   • Pinecone (Cloud)          │
                           │   • Local Index (Zero-Config) │
                           └───────────────┬───────────────┘
                                           ▲
                                           │ Vector Similarity Query
                                           │
Visitor Query ──► /api/chat ──► RAG Retriever ──► Groq Inference (120B/20B) ──► Verified Answer + Sources
```

### Key Highlights

- **Dual-Source Ingestion**: Automatically extracts and normalizes knowledge from structured portfolio content (`app/lib/data.ts`, components) and the real resume PDF (`public/Parth_Patel_Resume.pdf`).
- **Idempotent Ingestion**: Computes cryptographic hashes (`SHA-256`) per chunk; running ingestion repeatedly only generates embeddings for new or modified content.
- **Pluggable Vector Store**:
  - **Local Vector Index**: Standalone, zero-external-dependency vector index with cosine similarity (`app/lib/rag/vector-index.json`). Works immediately without external cloud accounts.
  - **Pinecone**: Plug in `PINECONE_API_KEY` and `PINECONE_INDEX` in `.env.local` to enable cloud vector indexing.
- **Groq LLM Generation**: Fast, deterministic inference using official `groq-sdk` with verified models (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, or `qwen/qwen3.8-27b`).
- **Grounded Answers & Honest Fallback**: If information is absent from the knowledge base (e.g. asking about unrelated topics), the assistant politely indicates the information is not in the portfolio rather than hallucinating.
- **Safety & Prompt Injection Defense**: System prompt strictly isolates retrieved text into untrusted reference tags `<evidence>` to prevent jailbreak or persona override attempts.
- **Dynamic Follow-Up Questions**: Assistant suggests context-aware follow-up queries after every response.
- **Direct Source Citations**: Badges link visitors to specific sections, projects, or documents (e.g., Download Resume, QuizLab live link, Shakktii AI).
- **Responsive UI/UX**: Floating "Ask AI" trigger with pulsating status indicator, sleek dialog modal, markdown rendering, keyboard shortcuts (Esc to close, Enter to send), and mobile drawer compatibility.

---

## 🛠️ Project Structure

```
portfolio/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts             # Secure Route Handler (Rate limit, validation, RAG, Groq)
│   ├── components/
│   │   ├── Chatbot/
│   │   │   ├── Chatbot.tsx          # Floating button & chat dialog UI
│   │   │   └── ChatMessageItem.tsx  # Message bubble, Markdown parser, source badges
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── AchievementsSection.tsx
│   │   ├── EducationSection.tsx
│   │   └── ContactSection.tsx
│   ├── lib/
│   │   ├── data.ts                  # Structured portfolio data
│   │   └── rag/
│   │       ├── types.ts             # TypeScript definitions
│   │       ├── extractor.ts         # Dual-source parser (data.ts + PDF)
│   │       ├── embeddings.ts        # Embedding generator (Xenova / OpenAI)
│   │       ├── local-vector-store.ts# Cosine similarity local vector engine
│   │       ├── pinecone-client.ts   # Pinecone v9 client integration
│   │       ├── vector-store.ts      # Unified vector store orchestrator
│   │       ├── retriever.ts         # Hybrid retrieval & query contextualizer
│   │       ├── groq-client.ts       # Groq client with grounding prompt
│   │       ├── ingest.ts            # CLI ingestion pipeline
│   │       └── test-rag.ts          # Comprehensive 10-query test battery
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── Parth_Patel_Resume.pdf       # Source resume PDF
│   ├── resume.pdf
│   └── ...
├── .env.example                     # Documented configuration variables
├── .env.local                       # Private environment variables (git-ignored)
└── package.json
```

---

## ⚙️ Environment Configuration

Create or update `.env.local` in the `portfolio/` root:

```env
# Groq API Configuration (Required)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Embedding Provider ("local" or "openai")
EMBEDDING_PROVIDER=local

# Vector Database (Optional - Pinecone)
# Leave empty to use the built-in local vector store
PINECONE_API_KEY=
PINECONE_INDEX=

# RAG Configuration
RAG_TOP_K=4
RAG_SIMILARITY_THRESHOLD=0.28
```

---

## 🚀 Running the Project

### 1. Run Document Ingestion

Whenever you update your resume PDF or portfolio data, run:

```bash
npm run ingest
```

This extracts all sections, computes content hashes, generates embeddings for changed documents, and updates the vector index.

### 2. Run the Automated RAG Test Suite

Validate retrieval accuracy, grounding, follow-ups, and anti-injection defenses:

```bash
npx tsx app/lib/rag/test-rag.ts
```

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click the **"Ask AI"** button in the bottom-right corner to interact with the assistant!

---

## 🛡️ Security & Privacy

1. **Server-Side Secrets**: All API keys (`GROQ_API_KEY`, `PINECONE_API_KEY`, `OPENAI_API_KEY`) remain strictly on the server and are never bundled into client JavaScript.
2. **Rate Limiting**: In-memory sliding-window limiter prevents automated spamming and controls API quota consumption.
3. **Input Sanitization**: User questions are truncated to a maximum of 500 characters and sanitized before retrieval.
4. **Prompt Injection Mitigation**: System instructions treat all retrieved knowledge as untrusted evidence and explicitly instruct the model to ignore instructions embedded inside retrieved text.
5. **No Hallucinations**: When questions fall outside Parth's documented skills and history, the model provides an honest fallback instead of inventing claims.

---

## 🌐 Deployment to Vercel

1. Push your code to your GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `GROQ_API_KEY`
   - `GROQ_MODEL` (e.g. `openai/gpt-oss-120b`)
   - `EMBEDDING_PROVIDER` (e.g. `local`)
   - Optional: `PINECONE_API_KEY` and `PINECONE_INDEX`
4. Deploy! The pre-indexed vectors in `app/lib/rag/vector-index.json` are deployed alongside the application for immediate, ultra-fast responses without requiring cold-start indexing.
