from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import recommendations, analytics, chat

app = FastAPI(
    title="FurnishAI API",
    description="ML-powered furniture recommendations on intern_data_ikarus.csv",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(analytics.router,       prefix="/api/analytics",       tags=["Analytics"])
app.include_router(chat.router,            prefix="/api/chat",            tags=["Chat"])

@app.get("/")
def root():
    return {"message": "FurnishAI API running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
