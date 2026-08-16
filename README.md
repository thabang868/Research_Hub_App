# ResearchHub Frontend

Modern single-page application for ResearchHub — an all-in-one research intelligence platform that brings together academic papers, datasets, AI-driven insights, live market data, and trending research.

## Tech Stack

- **Framework:** React 19
- **Routing:** React Router 7
- **Styling:** Tailwind CSS 4
- **Build Tool:** Vite 8
- **Linting:** ESLint 9

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Public landing page |
| `/signup` | Sign Up | User registration |
| `/signin` | Sign In | User login |
| `/forgot-password` | Forgot Password | Password reset request |
| `/reset-password` | Reset Password | Password reset form |
| `/dashboard` | Dashboard | Main workspace — saved papers, deep analysis, latest news, AI & tech news |
| `/search/papers` | Search Papers | Search 250M+ papers from OpenAlex, CrossRef, Semantic Scholar, arXiv, IEEE |
| `/search/datasets` | Search Datasets | Discover datasets from OpenAlex, Harvard Dataverse, Zenodo, UCI |
| `/ai` | AI Assistant | Chat with Cohere AI — summarize papers, suggest methods, generate problem statements |
| `/trending` | Trending | Live news, market data with AI analysis, top companies, trending research |
| `/deep-analysis` | Deep Analysis | Upload PDFs for AI-powered cross-paper synthesis and novelty detection |

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run development server

```bash
npm run dev
```

The production app is hosted at `https://researchhub-sigma.vercel.app`. API requests to `/api/*` are proxied to `https://research-hub-backend-wt4p.onrender.com`.

### 3. Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/            # API service functions (auth, graph)
│   ├── context/        # React Context (AuthContext)
│   ├── pages/          # Page components
│   │   ├── Landing.jsx
│   │   ├── SignUp.jsx
│   │   ├── SignIn.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SearchPapers.jsx
│   │   ├── SearchDatasets.jsx
│   │   ├── AIAssistant.jsx
│   │   ├── Trending.jsx
│   │   └── DeepAnalysis.jsx
│   ├── assets/         # Static assets
│   ├── App.jsx         # Route definitions
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/
├── vite.config.js
├── package.json
└── index.html
```

## Features

- **Paper Search** — Search across 7 academic databases with save-to-graph functionality
- **Dataset Discovery** — Find datasets from major open data repositories
- **AI Assistant** — Cohere-powered chat for research guidance, summaries, and methodology diagrams
- **Live Trending** — Real-time news, stock market data with AI analysis, top AI companies with sentiment
- **Deep Analysis** — Upload PDFs for AI cross-paper synthesis, novelty detection, and knowledge graph connections
- **Knowledge Graph** — Neo4j-backed storage linking papers, authors, keywords, and datasets
