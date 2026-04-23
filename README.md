# FurnishAI — Smart Furniture & Home Products Recommendation System

A dataset-driven product recommendation and search system built on **312 home & furniture products** spanning categories like Home & Kitchen, Patio & Garden, Electronics, Tools & Home Improvement, and more — across **264+ brands**.

**Stack:** FastAPI · Pandas · NumPy · React · Axios · Recharts
## 🧠 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=fastapi,react" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white"/>
  <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"/>
  <img src="https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge"/>
</p>

🌐 **Live App:** [https://furnishai-recommendation-system.vercel.app](https://furnishai-recommendation-system.vercel.app)

⚙️ **API Docs:** [https://furnishai-recommendation-system.onrender.com/docs](https://furnishai-recommendation-system.onrender.com/docs)

📦 **GitHub:** [https://github.com/hemant7199/furnishai-recommendation-system](https://github.com/hemant7199/furnishai-recommendation-system)

---

## ⚠️ Production Note

To ensure smooth deployment on free-tier cloud services (Render):

- **Pinecone, OpenAI, and Transformer-based models are disabled** in the deployed version
- The system uses **dataset-based filtering and keyword search** instead of vector search
- This ensures stability, faster response times, and zero external API dependency failures
- All core recommendation and analytics features remain fully functional

---

## ✨ Features

- 💬 **Chat-based product search** — dataset-driven conversational query interface
- 🔍 **Keyword-based recommendation system** — search by title, brand, category, or description
- 📊 **Analytics dashboard** — product insights and category breakdowns with Recharts
- 🏷️ **Smart filtering** — filter by category, brand, price range, material, and color

---

## 📦 Dataset

| Field | Details |
|-------|---------|
| **File** | `intern_data_ikarus.csv` |
| **Products** | 312 |
| **Brands** | 264+ |
| **Categories** | Home & Kitchen, Patio & Garden, Electronics, Tools & Home Improvement, Baby Products, Beauty & Personal Care, Office Products |
| **Fields** | `title`, `brand`, `description`, `price`, `categories`, `images`, `manufacturer`, `package_dimensions`, `country_of_origin`, `material`, `color`, `uniq_id` |

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
git commit -m "Initial commit — FurnishAI"

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
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Runtime:** Python 3.11

5. Add **Environment Variables** in the Render dashboard:

   | Key | Value |
   |-----|-------|
   | `DATA_PATH` | `data/intern_data_ikarus.csv` |

6. Click **Deploy** — wait ~3 min.
7. Your backend URL: `https://furnishai-recommendation-system.onrender.com`
8. Health check: visit `/health`

> No external API keys required. The backend runs entirely on the CSV dataset.

---

### Step 3 — Deploy Frontend on Vercel

1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo
3. Set **Root Directory** to: `frontend`
4. Framework preset: **Create React App** (auto-detected)
5. Add **Environment Variable** in Vercel:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://furnishai-recommendation-system.onrender.com/api` |

6. Click **Deploy** — done in ~1 min.

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

cp .env.example .env
# DATA_PATH defaults to data/intern_data_ikarus.csv

# Start server
uvicorn main:app --reload --port 8000
# Swagger UI: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm start
# Opens: http://localhost:3000
```

> Local dev uses CRA proxy — no CORS issues. `.env.development` sets `REACT_APP_API_URL` to empty so the proxy kicks in automatically.

---

## 🗂️ Project Structure

```
furnishai_deploy/
├── .gitignore
├── README.md
│
├── backend/                          ← Deploy on Render
│   ├── main.py                       ← FastAPI app (CORS: allow_origins=["*"])
│   ├── config.py                     ← Pydantic v2 settings
│   ├── requirements.txt              ← FastAPI, Pandas, NumPy, Uvicorn
│   ├── runtime.txt                   ← python-3.11.0
│   ├── render.yaml                   ← Render config
│   ├── .env.example                  ← Copy to .env locally
│   ├── data/
│   │   └── intern_data_ikarus.csv    ← 312 products dataset
│   ├── models/
│   │   └── schemas.py                ← Pydantic models
│   ├── routers/
│   │   ├── chat.py                   ← Keyword-based chat search
│   │   ├── recommendations.py        ← Dataset filtering & recommendations
│   │   └── analytics.py              ← Stats & product listing
│   ├── services/
│   │   ├── recommendation_service.py ← Pandas-based filtering logic
│   │   └── nlp_service.py            ← Keyword extraction & matching
│   └── utils/
│       └── data_utils.py             ← CSV cleaning ($price, list strings)
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
│       │   ├── ChatPage.js           ← Conversational search UI
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

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| POST | `/api/chat/message` | Keyword-based product search |
| POST | `/api/recommendations/search` | Dataset-filtered recommendations |
| GET | `/api/analytics/summary` | Dataset statistics |
| GET | `/api/analytics/products` | Paginated product list |

---

## 🔐 Environment Variables Reference

### Backend (`.env`)
```env
DATA_PATH=data/intern_data_ikarus.csv
```

### Frontend (Vercel Environment Variables)
```env
REACT_APP_API_URL=https://furnishai-recommendation-system.onrender.com/api
```

---

## 🐛 Known Fixes Applied

| Issue | Fix |
|-------|-----|
| Pydantic `class Config` | replaced with `model_config = {}` |
| Vercel 404 on page refresh | `vercel.json` SPA rewrites |
| CORS errors in production | `allow_origins=["*"]` in FastAPI |
| Frontend can't reach backend | set `REACT_APP_API_URL` env var in Vercel |
| Price column has `$` prefix | stripped in `data_utils.py` |
| Categories stored as string list | parsed with `ast.literal_eval` |

---

## 👤 Author

**Hemant** — [github.com/hemant7199](https://github.com/hemant7199)
