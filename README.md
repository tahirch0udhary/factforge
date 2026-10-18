# FactForge

**GitHub description:** FactForge is a full-stack claim verification platform that combines React, FastAPI, PostgreSQL, and multi-model inference to analyze claims, show evidence traces, and surface review-ready insights.

FactForge is a production-oriented misinformation and claim-analysis app. It lets visitors browse the product publicly, sign in to submit claims, inspect verification history, view confidence and analytics dashboards, and review trusted source evidence returned by the inference pipeline.

## What it does

- Verifies a claim with a multi-stage inference pipeline.
- Combines baseline, BERT, and Groq-backed reasoning.
- Stores claim history and prediction results per user.
- Shows trusted source evidence and explanation traces.
- Provides analytics for confidence, decision mix, and recent activity.
- Supports a review queue experience for uncertain claims.
- Lets guests browse the site, while protected actions require sign-in.

## Tech Stack

- Frontend: React 18, Vite, React Router, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Uvicorn
- Database: PostgreSQL
- AI / inference: baseline model, BERT model, Groq fallback / validation
- Styling / UI: custom component system with responsive layouts

## Project Structure

```text
truthlens/
  client/
    src/
    public/
    package.json
  server/
    app/
    models/
    requirements.txt
    main.py
```

## Key Pages

- Home: public landing page and product overview
- Verify: submit a claim and view detailed results below the form
- Review: priority queue for uncertain claims
- History: claim history and prediction traces
- Stats: confidence and activity analytics
- About: project overview and purpose
- Sign in / Sign up: authentication pages

## Setup Requirements

### Frontend

- Node.js 18.18+ or 20.x LTS
- npm 9+

### Backend

- Python 3.10+
- PostgreSQL 14+
- A valid `GROQ_API_KEY` in `server/.env`

## Environment Variables

### `server/.env`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/factforge
SECRET_KEY=change-this-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
HIGH_CONFIDENCE_THRESHOLD=0.85
BASELINE_MODEL_DIR=models/baseline
BERT_MODEL_DIR=models/bert_isot
```

### Optional `client/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Run Locally

### 1. Start the backend

From `server`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend docs:

```text
http://localhost:8000/docs
```

### 2. Start the frontend

From `client`:

```powershell
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Useful Commands

### Frontend

```powershell
cd client
npm install
npm run dev
npm run build
npm run preview
```

### Backend

```powershell
cd server
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

## API Overview

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Verification

- `POST /api/verify`

### History and stats

- `GET /api/history`
- `GET /api/stats`

### Health

- `GET /`
- `GET /health`

## Notes on Access

- Public pages can be viewed without logging in.
- Claim submission and private history remain protected.
- The app is designed so users can browse first and authenticate when they need to act.

## Development Notes

- The backend loads model assets at startup.
- Verification results persist claim, prediction, and trusted source data.
- The frontend uses a shared layout and reusable cards for a consistent dashboard-style UI.

## Troubleshooting

### Backend will not start

- Check that your virtual environment is activated.
- Confirm `DATABASE_URL` is valid and PostgreSQL is running.
- Confirm `GROQ_API_KEY` is set if you want Groq-assisted inference.

### Frontend cannot reach backend

- Make sure the backend is running on `http://localhost:8000`.
- Set `VITE_API_BASE_URL` if your backend is on a different port or host.

### Models are missing

- Verify the files exist under `server/models/baseline` and `server/models/bert_isot`.

## Suggested GitHub Repository Short Description

FactForge is a full-stack claim verification platform with React, FastAPI, PostgreSQL, and multi-model AI inference for evidence-backed fact checking.
