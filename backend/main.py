from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import revenue, voice, orders, marketing

app = FastAPI(title="AI-Powered Revenue & Voice Copilot API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(revenue.router)
app.include_router(voice.router)
app.include_router(orders.router)
app.include_router(marketing.router)

@app.get("/")
def root():
    return {"message": "Welcome to the SpicePilot AI API!"}
