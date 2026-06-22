# AI Test Documentation Generator

A professional web application for generating QA documentation including Test Strategy, Test Plan, and Root Cause Analysis (RCA) documents using AI, JIRA integration, and the B.L.A.S.T. methodology framework.

## Features

- **Test Strategy Generation** - Create comprehensive test strategies from JIRA issues
- **Test Plan Generation** - Generate detailed test plans with scenarios and resource allocation
- **Root Cause Analysis** - Perform RCA with 5 Whys and Fishbone analysis support
- **JIRA Integration** - Fetch issue details, comments, attachments, and linked issues
- **AI-Powered** - Uses Groq API for intelligent document generation
- **B.L.A.S.T. Methodology** - Leverages the B.L.A.S.T. knowledge base for context-aware generation
- **Multiple Export Formats** - Export to Markdown, PDF, and DOCX
- **Dark Mode** - Built-in dark/light theme toggle
- **History Management** - View, download, and regenerate past documents

## Technology Stack

### Frontend
- React 18 + TypeScript
- Material UI 5
- React Router v6
- React Markdown + Remark GFM
- Recharts
- Vite

### Backend
- Python FastAPI
- SQLite (local storage)
- Groq API (AI)
- Atlassian JIRA REST API
- WeasyPrint (PDF generation)
- Python-DOCX (DOCX generation)

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Groq API key
- JIRA account (cloud or server)

## Installation

### 1. Clone and Navigate

```bash
cd AI_Test_Doc_Generator
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Copy the example env and configure:
```bash
cp .env.example .env
# Edit .env with your credentials
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

## Configuration

Configure the application via the Settings page in the UI:

### JIRA Settings
- **Base URL** - Your JIRA instance URL (e.g., `https://your-domain.atlassian.net`)
- **Username/Email** - JIRA account email
- **API Token** - JIRA API token (generate from Atlassian account settings)
- **Default Project Key** - Default JIRA project key (e.g., `PROJ`)

### AI Settings
- **Groq API Key** - Your Groq API key
- **Groq Model** - AI model selection (e.g., `mixtral-8x7b-32768`)

### Knowledge Source
- **B.L.A.S.T.md File Path** - Path to the B.L.A.S.T.md knowledge base file

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/settings` | GET/POST | Get/Update settings |
| `/api/settings/test-connection` | POST | Test all connections |
| `/api/jira/issue/{key}` | GET | Get JIRA issue details |
| `/api/test-strategy/generate` | POST | Generate test strategy |
| `/api/test-plan/generate` | POST | Generate test plan |
| `/api/rca/generate` | POST | Generate RCA |
| `/api/history` | GET | Get document history |
| `/api/history/dashboard` | GET | Get dashboard stats |

## Project Structure

```
AI_Test_Doc_Generator/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # App configuration & encryption
│   │   ├── database.py          # SQLite database operations
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── services/
│   │   │   ├── jira_service.py  # JIRA API integration
│   │   │   ├── groq_service.py  # Groq AI integration
│   │   │   ├── blast_parser.py  # B.L.A.S.T.md parser
│   │   │   ├── document_service.py  # Document generation
│   │   │   └── export_service.py    # Export (PDF/DOCX/MD)
│   │   ├── routes/
│   │   │   ├── settings.py      # Settings endpoints
│   │   │   ├── jira.py          # JIRA endpoints
│   │   │   ├── test_strategy.py # Test Strategy endpoints
│   │   │   ├── test_plan.py     # Test Plan endpoints
│   │   │   ├── rca.py           # RCA endpoints
│   │   │   └── history.py       # History endpoints
│   │   └── utils/
│   │       └── encryption.py    # Encryption utilities
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API client
│   │   ├── types/               # TypeScript types
│   │   ├── context/             # React context
│   │   ├── App.tsx              # App with routing
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
├── docs/                        # Documentation
├── uploads/                     # File uploads
├── history/                     # Exported documents
├── settings/                    # Encrypted settings storage
└── README.md
```

## Architecture

### SOLID Principles
- **Single Responsibility** - Each service has one clearly defined purpose
- **Open/Closed** - Services are extendable without modification
- **Liskov Substitution** - Consistent service interfaces
- **Interface Segregation** - Focused, minimal interfaces
- **Dependency Inversion** - Dependencies inject via service instances

### Service Layer Pattern
- `JIRAService` - All JIRA API interactions
- `GroqService` - AI model communication
- `BLASTParser` - Knowledge base parsing
- `DocumentService` - Document generation orchestration
- `ExportService` - Multi-format file export

## Security

- Settings are encrypted at rest using Fernet symmetric encryption
- API tokens are masked in responses
- All configurations stored locally in encrypted format
- CORS protection via FastAPI middleware

## License

MIT
