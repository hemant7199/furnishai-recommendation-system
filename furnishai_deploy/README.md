# FurnishAI — Ikarus Furniture Recommendation App

ML-powered furniture recommendation system built on `intern_data_ikarus.csv` (312 products).

**Stack:** FastAPI · Pinecone · SentenceTransformers · LangChain · OpenAI GPT-3.5 · ResNet18 · React · Recharts

---

## 🚀 Deploy to GitHub → Render → Vercel

### Step 1 — Push to GitHub

```bash
# Unzip the project
unzip furnishai_deploy.zip
cd furnishai_deploy

# Initialize git
git init
git add .
git commit -m "Initial commit — FurnishAI ikarus"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/furnishai.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Deploy Backend on Render

1. Go to **https://render.com** → New → **Web Service**
2. Connect your GitHub repo
3. Set the **Root Directory** to: `backend`
4. Render auto-detects Python. Set:
   - **Build Command:**
     ```
     pip install -r requirements.txt && python -m spacy download en_core_web_sm
     ```
   - **Start Command:**
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Runtime:** Python 3.11

5. Add **Environment Variables** in Render dashboard:

   | Key | Value |
   |-----|-------|
   | `PINECONE_API_KEY` | your Pinecone key |
   | `OPENAI_API_KEY` | your OpenAI key |
   | `PINECONE_INDEX_NAME` | `ikarus-furniture` |
   | `PINECONE_ENV` | `us-east-1` |
   | `HF_MODEL_NAME` | `sentence-transformers/all-MiniLM-L6-v2` |
   | `DATA_PATH` | `data/intern_data_ikarus.csv` |

6. Click **Deploy** — wait ~3 min.
7. Your backend URL will be: `https://furnishai-backend.onrender.com`
8. Test it: visit `https://furnishai-backend.onrender.com/health`

> **After deploy**, run the ingest script **once** locally pointing to your Render backend, or use the Render **Shell** tab:
> ```bash
> python utils/ingest_data.py
> ```

---

### Step 3 — Deploy Frontend on Vercel

1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo
3. Set **Root Directory** to: `frontend`
4. Framework preset: **Create React App** (auto-detected)
5. Add **Environment Variables** in Vercel:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://furnishai-backend.onrender.com/api` |

6. Click **Deploy** — done in ~1 min.
7. Your app URL: `https://furnishai-xxx.vercel.app`

---

## 💻 Local Development

### Backend
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm

cp .env.example .env
# Edit .env with your Pinecone + OpenAI keys

# Upload products to Pinecone (run once)
python utils/ingest_data.py

# Start server
uvicorn main:app --reload --port 8000
# Swagger: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm start
# Opens: http://localhost:3000
```

> Local dev uses CRA proxy — no CORS issues. The `.env.development` file sets `REACT_APP_API_URL` to empty so the proxy is used.

---

## Project Structure

```
furnishai_deploy/
├── .gitignore
├── README.md
│
├── backend/                          ← Deploy on Render
│   ├── main.py                       ← FastAPI app (CORS: allow_origins=["*"])
│   ├── config.py                     ← Pydantic v2 settings
│   ├── requirements.txt              ← CPU torch, pinecone==3.2.2
│   ├── runtime.txt                   ← python-3.11.0
│   ├── render.yaml                   ← Render config
│   ├── .env.example                  ← Copy to .env locally
│   ├── data/
│   │   └── intern_data_ikarus.csv    ← 312 products dataset
│   ├── models/
│   │   └── schemas.py                ← Pydantic models
│   ├── routers/
│   │   ├── chat.py
│   │   ├── recommendations.py
│   │   └── analytics.py
│   ├── services/
│   │   ├── vector_db.py              ← Pinecone v3 API
│   │   ├── genai_service.py          ← LangChain 0.2.x + GPT-3.5
│   │   ├── cv_service.py             ← ResNet18 (torchvision weights API)
│   │   └── nlp_service.py            ← TF-IDF + KMeans + spaCy
│   └── utils/
│       ├── data_utils.py             ← CSV cleaning ($price, list strings)
│       └── ingest_data.py            ← Pinecone upload script
│
├── frontend/                         ← Deploy on Vercel
│   ├── vercel.json                   ← SPA routing rewrites
│   ├── package.json                  ← proxy: http://localhost:8000
│   ├── .env                          ← REACT_APP_API_URL for production
│   ├── .env.development              ← empty URL → uses CRA proxy
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js / index.css
│       ├── pages/
│       │   ├── ChatPage.js           ← Conversational UI
│       │   └── AnalyticsPage.js      ← Charts + product table
│       ├── components/
│       │   ├── Navbar.js
│       │   └── ProductCard.js
│       └── services/
│           └── api.js                ← Uses REACT_APP_API_URL
│
└── notebooks/
    ├── model_training.ipynb
    └── data_analytics.ipynb
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| POST | `/api/chat/message` | Conversational recommendations |
| POST | `/api/recommendations/search` | Semantic search |
| GET | `/api/analytics/summary` | Dataset statistics |
| GET | `/api/analytics/products` | Paginated product list |

---

## Environment Variables Reference

### Backend (.env)
```
PINECONE_API_KEY=pc-xxxxxxxxxxxx
PINECONE_ENV=us-east-1
PINECONE_INDEX_NAME=ikarus-furniture
OPENAI_API_KEY=sk-xxxxxxxxxxxx
HF_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
DATA_PATH=data/intern_data_ikarus.csv
IMAGE_MODEL_PATH=models/image_classifier.pth
```

### Frontend (Vercel Environment Variables)
```
REACT_APP_API_URL=https://furnishai-backend.onrender.com/api
```

---

## Fixes Applied (vs previous versions)

| Issue | Fix |
|-------|-----|
| `pinecone-client` not found | `pinecone==3.2.2` |
| LangChain import errors | `langchain==0.2.16` + `langchain-core==0.2.38` |
| `openai_api_key` param error | `api_key=` |
| `pretrained=True` deprecated | `weights=ResNet18_Weights.IMAGENET1K_V1` |
| Pydantic `class Config` | `model_config = {}` |
| torch too heavy for Render | `torch==2.3.1+cpu` from PyTorch CDN |
| Vercel 404 on refresh | `vercel.json` rewrites |
| CORS error prod | `allow_origins=["*"]` |
| Frontend can't reach backend | `REACT_APP_API_URL` env var |
