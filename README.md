# Avish Jhalani — Software Engineering Portfolio

A high-performance, cyber-minimalist portfolio website showcasing full-stack engineering, real-time distributed systems, and agentic AI pipelines.

🚀 **Live Deployment URL**: [https://avishportfolio00.netlify.app/](https://avishportfolio00.netlify.app/)  
🤖 **AI Chatbot Backend**: Powered by FastAPI & Groq LLM (`gpt-oss-120b`) with zero-shot resume understanding.

---

## 🌟 Featured Projects

### 1. [PowerPilot AI](https://powerpilot-ai-y758.onrender.com/) — Autonomous Agentic Power BI Dashboard Compiler
- **Live Demo**: [https://powerpilot-ai-y758.onrender.com/](https://powerpilot-ai-y758.onrender.com/)
- **Repository**: [github.com/avishjhalani/PowerPilot-AI](https://github.com/avishjhalani/PowerPilot-AI)
- **Tech Stack**: Python, FastAPI, DuckDB, Polars, Groq LLM, Docker
- **Architecture & Highlights**:
  - Architected an autonomous, agentic pipeline that ingests raw CSV/Parquet, cleans, models, and compiles Power BI dashboards end-to-end.
  - Ingests and processes **500,000+ records in 8.6s** at **<35MB peak RAM** via zero-copy DuckDB profiling and out-of-core Polars streaming.
  - Built an LLM-driven semantic modeling agent (`Groq gpt-oss-120b`) that autonomously synthesizes 6–8 production-grade DAX measures from natural-language business goals within a strict 4,000-character context budget.
  - Designed a sandboxed, self-healing execution layer using **AST-based static analysis** to block unsafe system calls, with a 3-attempt autonomous error-recovery loop (zero unsafe executions).

### 2. [Collab-Docs](https://collabdocs-ten.vercel.app/) — Real-Time Collaborative Document Workspace
- **Live Demo**: [https://collabdocs-ten.vercel.app/](https://collabdocs-ten.vercel.app/)
- **Repository**: [github.com/avishjhalani/Collab-Docs](https://github.com/avishjhalani/Collab-Docs)
- **Tech Stack**: React, NestJS, Yjs, Socket.io, PostgreSQL, Redis, Prisma, Docker
- **Architecture & Highlights**:
  - Engineered real-time collaborative document editing using **Yjs CRDTs** and WebSockets, deployed across Vercel, Render, and Supabase.
  - Achieved an average round-trip sync latency of **~327ms** on cross-continent connections.
  - Reduced PostgreSQL write overhead by **98%** by replacing per-keystroke writes with a custom 5-second debounced state-save buffer.
  - Cut network payload size by **90%+** by transmitting edits as compressed binary Yjs deltas (30–60 bytes/frame) over a Redis Pub/Sub adapter.

### 3. [BloodLink](https://bloodlink1.vercel.app/) — Geospatial Blood Donor Matching Platform
- **Live Demo**: [https://bloodlink1.vercel.app/](https://bloodlink1.vercel.app/)
- **Repository**: [github.com/avishjhalani/BloodLink](https://github.com/avishjhalani/BloodLink)
- **Tech Stack**: Next.js, NestJS, PostgreSQL, Redis, Prisma, JWT, Nodemailer
- **Architecture & Highlights**:
  - Full-stack donor-matching platform geolocating and matching blood requests to eligible donors within a 10km radius using **PostGIS spatial queries** (`ST_DWithin`, `ST_Distance`).
  - Verified reliability of the core donor-matching flow via an **11-case E2E test suite** (Jest/Supertest) passing against seeded PostgreSQL.
  - Secured sessions using JWT stored in **httpOnly, sameSite cookies** to prevent XSS-based token theft.

---

## ⚡ Portfolio Features & Highlights

- **Cyber-Minimalist Design**: Fluid responsive layouts, dark space aesthetic, frosted glassmorphism, and hardware-accelerated animations.
- **Physics Canvas Particles**: Floating background particles that dynamically repulse from the cursor.
- **Dynamic Glow Borders**: Mouse-tracking coordinates (`--mouse-x`, `--mouse-y`) paint interactive radial borders on glass cards.
- **Hacker Scramble Typography**: Decodes section titles on scroll and mouseenter.
- **AI Virtual Recruiter Chatbot**: Integrated conversational AI assistant capable of answering questions about Avish's projects, technical skills, and experience with live demo links.
- **Google Sheets Form Integration**: Contact form submissions post directly to Google Sheets in real-time via Google Apps Script.

---

## 🛠️ Technical Arsenal

| Category | Technologies |
| :--- | :--- |
| **Programming Languages** | C++, JavaScript, Python, SQL |
| **Web & Cloud** | FastAPI, Node.js, Express.js, Next.js, React, NestJS, RESTful APIs, Socket.io |
| **Databases & Tools** | PostgreSQL, DuckDB, Polars, Redis, Prisma, Docker, Git/GitHub, Postman |

---

## ⚙️ Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/avishjhalani/PORTFOLIO.git
   cd PORTFOLIO
   ```

2. **Frontend Preview (Native Node Server)**:
   ```bash
   node server.js
   ```
   Open `http://localhost:8000` in your web browser.

3. **AI Chatbot Backend (FastAPI)**:
   ```bash
   pip install -r pyproject.toml  # or uv sync
   uvicorn main:app --reload --port 8000
   ```
