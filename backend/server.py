from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# --- Validate required env vars early (helps debug) ---
if "MONGO_URL" not in os.environ or "DB_NAME" not in os.environ:
    raise RuntimeError("MONGO_URL and DB_NAME must be set in environment (.env for local or Render env vars).")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app once
app = FastAPI()

# Create a router with the /api prefix once
api_router = APIRouter(prefix="/api")

# ---------------------- Models (unchanged) ----------------------
class VacuumStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    battery: int = 85
    location: str = "Living Room"
    mode: Literal["cleaning", "idle", "charging", "returning"] = "idle"
    isActive: bool = False
    lastCleaned: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    dustBinLevel: int = 35
    valuablesBinCount: int = 3
    totalAreaCleaned: float = 1250.5

class VacuumControl(BaseModel):
    action: Literal["start", "stop", "pause", "return"]
    mode: Optional[str] = "auto"

class DetectedItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["valuable", "trash", "unknown"]
    category: str
    confidence: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    description: str
    location: str
    imageUrl: Optional[str] = None
    userFeedback: Optional[Literal["correct", "incorrect"]] = None
    feedbackNote: Optional[str] = None
    chamber: Literal["valuables", "trash", "pending"]

class ItemFeedback(BaseModel):
    itemId: str
    feedback: Literal["correct", "incorrect"]
    correctedType: Optional[Literal["valuable", "trash", "unknown"]] = None
    note: Optional[str] = None

class CleaningSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    startTime: str
    endTime: Optional[str] = None
    itemsDetected: int = 0
    valuablesSaved: int = 0
    trashCollected: int = 0
    areaCleanedSqFt: float = 0
    duration: Optional[int] = 0  # in minutes
    status: Literal["active", "completed", "interrupted"] = "active"

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message: str
    type: Literal["valuable", "warning", "info", "success"]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    itemId: Optional[str] = None
    isRead: bool = False

class Stats(BaseModel):
    totalItemsDetected: int
    valuablesSaved: int
    totalSessions: int
    accuracyRate: float
    avgConfidence: float
    topCategories: List[dict]
# ----------------------------------------------------------------

# Initialize sample data
async def init_sample_data():
    existing_items = await db.detected_items.count_documents({})
    if existing_items > 0:
        return
    # ... (insert sample_items, sessions, notifications exactly as before) ...
    # For brevity, copy your existing sample insertion logic here.

@app.on_event("startup")
async def startup_event():
    await init_sample_data()

# ------------------ API routes registered to api_router ------------------
@api_router.get("/")
async def root():
    return {"message": "TreasureSense API"}

@api_router.get("/vacuum/status", response_model=VacuumStatus)
async def get_vacuum_status():
    status = await db.vacuum_status.find_one({}, {"_id": 0})
    if not status:
        default_status = VacuumStatus().model_dump()
        await db.vacuum_status.insert_one(default_status)
        return VacuumStatus(**default_status)
    return VacuumStatus(**status)

# (Keep all your other @api_router routes here unchanged: /vacuum/control, /items/*, /sessions, /notifications, /stats)
# ------------------------------------------------------------------------

# Include the router in the main app (do this once)
app.include_router(api_router)

# Simple home route for health checks
@app.get("/")
def home():
    return {"message": "API working!"}

# ---------- Optional: 404 handler that redirects to frontend ----------
# WARNING: This will redirect any 404 (including wrong API paths). Use if you want browser visitors redirected.
# Set FRONTEND_URL env var to your frontend URL (e.g. https://your-frontend-app.vercel.app)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "").strip()  # leave blank to disable redirect behavior

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Only redirect for 404 and if FRONTEND_URL provided and request is a browser GET
    if exc.status_code == 404 and FRONTEND_URL and request.method.upper() == "GET":
        # You can refine condition: check Accept header to ensure it's HTML request
        accept = request.headers.get("accept", "")
        if "text/html" in accept or "application/xhtml+xml" in accept or "*" in accept:
            return RedirectResponse(FRONTEND_URL)
    # Default JSON response for other errors or if redirect disabled
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
