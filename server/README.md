# FactForge Backend (FastAPI)

This backend provides authentication, claim verification, history tracking, and stats APIs.

## 1. Required Versions

- Python: 3.10
- pip: 23+ recommended
- FastAPI: 0.115.0 (pinned in requirements.txt)
- Uvicorn: 0.30.0 (pinned in requirements.txt)
- PostgreSQL: 14+ recommended

Current pinned versions are defined in `requirements.txt`.

## 2. Install Python and pip

If Python is not installed:

1. Download Python from https://www.python.org/downloads/
2. During install on Windows, enable "Add Python to PATH"

macOS options:

1. Install from https://www.python.org/downloads/macos/
2. Or install with Homebrew:

```bash
brew install python@3.10
```

Verify installation:

```powershell
python --version
python -m pip --version
```

macOS / Linux:

```bash
python3 --version
python3 -m pip --version
```

Upgrade pip:

```powershell
python -m pip install --upgrade pip
```

macOS / Linux:

```bash
python3 -m pip install --upgrade pip
```

## 3. Create and Activate Virtual Environment

From the `server` folder:

```powershell
python -m venv .venv
```

macOS / Linux:

```bash
python3 -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

If execution policy blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

## 4. Install Backend Dependencies

```powershell
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

macOS / Linux:

```bash
pip install -r requirements.txt
python3 -m spacy download en_core_web_sm
```

## 5. Add Model Files

Place model artifacts in:

```text
models/
  baseline/
    best_model.pkl
    tfidf_vectorizer.pkl
    feature_scaler.pkl
    feature_columns.pkl
    model_metadata.pkl
  bert_isot/
    model.safetensors
    config.json
    tokenizer.json
    tokenizer_config.json
    model_metadata.json
```

## 6. Configure Environment Variables

Create a `.env` file in the `server` folder with at least:

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

## 7. Create Database

In PostgreSQL:

```sql
CREATE DATABASE factforge;
```

If PostgreSQL is not installed on macOS:

```bash
brew install postgresql@14
brew services start postgresql@14
psql postgres -c "CREATE DATABASE factforge;"
```

## 8. Run Backend API

From `server` folder (with venv activated):

```powershell
uvicorn main:app --reload --port 8000
```

macOS / Linux:

```bash
uvicorn main:app --reload --port 8000
```

Open API docs:

```text
http://localhost:8000/docs
```

## 9. Quick Health Check

```powershell
curl http://localhost:8000/health
```

macOS / Linux:

```bash
curl http://localhost:8000/health
```

## 10. Main API Routes

Auth:

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

Verification:

- POST /api/verify

History and stats:

- GET /api/history
- GET /api/stats

Health:

- GET /
- GET /health
