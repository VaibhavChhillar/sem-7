from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
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

# Initialize sample data
async def init_sample_data():
    # Check if data already exists
    existing_items = await db.detected_items.count_documents({})
    if existing_items > 0:
        return
    
    # Sample detected items
    sample_items = [
        {
            "id": str(uuid.uuid4()),
            "type": "valuable",
            "category": "Jewelry",
            "confidence": 0.95,
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat(),
            "description": "Gold ring detected",
            "location": "Bedroom",
            "imageUrl": "https://images.unsplash.com/photo-1684616290826-1e2988a9500f?w=400",
            "userFeedback": "correct",
            "chamber": "valuables"
        },
        {
            "id": str(uuid.uuid4()),
            "type": "valuable",
            "category": "Electronics",
            "confidence": 0.88,
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=25)).isoformat(),
            "description": "Wireless earbud detected",
            "location": "Living Room",
            "imageUrl": "https://images.unsplash.com/photo-1639660680515-7c76c86b559b?w=400",
            "chamber": "valuables"
        },
        {
            "id": str(uuid.uuid4()),
            "type": "trash",
            "category": "Paper",
            "confidence": 0.92,
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat(),
            "description": "Paper wrapper",
            "location": "Kitchen",
            "chamber": "trash"
        },
        {
            "id": str(uuid.uuid4()),
            "type": "valuable",
            "category": "Accessories",
            "confidence": 0.79,
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            "description": "Watch strap detected",
            "location": "Bedroom",
            "chamber": "valuables"
        },
        {
            "id": str(uuid.uuid4()),
            "type": "unknown",
            "category": "Small Object",
            "confidence": 0.45,
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
            "description": "Unidentified small metallic object",
            "location": "Office",
            "chamber": "pending"
        },
        {
            "id": str(uuid.uuid4()),
            "type": "trash",
            "category": "Food",
            "confidence": 0.98,
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat(),
            "description": "Food crumbs",
            "location": "Dining Room",
            "chamber": "trash"
        }
    ]
    
    await db.detected_items.insert_many(sample_items)
    
    # Sample cleaning sessions
    sample_sessions = [
        {
            "id": str(uuid.uuid4()),
            "startTime": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            "endTime": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat(),
            "itemsDetected": 8,
            "valuablesSaved": 2,
            "trashCollected": 6,
            "areaCleanedSqFt": 450.0,
            "duration": 45,
            "status": "completed"
        },
        {
            "id": str(uuid.uuid4()),
            "startTime": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            "endTime": (datetime.now(timezone.utc) - timedelta(days=1, hours=-1)).isoformat(),
            "itemsDetected": 12,
            "valuablesSaved": 1,
            "trashCollected": 11,
            "areaCleanedSqFt": 800.0,
            "duration": 62,
            "status": "completed"
        }
    ]
    
    await db.cleaning_sessions.insert_many(sample_sessions)
    
    # Sample notifications
    sample_notifications = [
        {
            "id": str(uuid.uuid4()),
            "message": "Valuable item detected: Gold ring safely stored in valuables bin",
            "type": "valuable",
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat(),
            "itemId": sample_items[0]["id"],
            "isRead": False
        },
        {
            "id": str(uuid.uuid4()),
            "message": "Unknown item detected in Office - requires your review",
            "type": "warning",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
            "itemId": sample_items[4]["id"],
            "isRead": False
        }
    ]
    
    await db.notifications.insert_many(sample_notifications)

@app.on_event("startup")
async def startup_event():
    await init_sample_data()

# Routes
@api_router.get("/")
async def root():
    return {"message": "TreasureSense API"}

@api_router.get("/vacuum/status", response_model=VacuumStatus)
async def get_vacuum_status():
    status = await db.vacuum_status.find_one({}, {"_id": 0})
    if not status:
        # Create default status
        default_status = VacuumStatus().model_dump()
        await db.vacuum_status.insert_one(default_status)
        return VacuumStatus(**default_status)
    return VacuumStatus(**status)

@api_router.post("/vacuum/control")
async def control_vacuum(control: VacuumControl):
    status = await db.vacuum_status.find_one({}, {"_id": 0})
    if not status:
        status = VacuumStatus().model_dump()
    
    if control.action == "start":
        status["isActive"] = True
        status["mode"] = "cleaning"
        # Create new session
        new_session = CleaningSession(
            startTime=datetime.now(timezone.utc).isoformat(),
            status="active"
        ).model_dump()
        await db.cleaning_sessions.insert_one(new_session)
    elif control.action == "stop":
        status["isActive"] = False
        status["mode"] = "idle"
        # Complete active session
        await db.cleaning_sessions.update_one(
            {"status": "active"},
            {"$set": {"endTime": datetime.now(timezone.utc).isoformat(), "status": "completed"}}
        )
    elif control.action == "pause":
        status["isActive"] = False
        status["mode"] = "idle"
    elif control.action == "return":
        status["mode"] = "returning"
    
    await db.vacuum_status.delete_many({})
    await db.vacuum_status.insert_one(status)
    
    return {"success": True, "status": status}

@api_router.get("/items/detected", response_model=List[DetectedItem])
async def get_detected_items(type: Optional[str] = None, limit: int = 50):
    query = {}
    if type:
        query["type"] = type
    
    items = await db.detected_items.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return items

@api_router.get("/items/valuables", response_model=List[DetectedItem])
async def get_valuables():
    items = await db.detected_items.find({"type": "valuable"}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return items

@api_router.post("/items/feedback")
async def submit_feedback(feedback: ItemFeedback):
    update_data = {
        "userFeedback": feedback.feedback,
        "feedbackNote": feedback.note
    }
    
    if feedback.correctedType:
        update_data["type"] = feedback.correctedType
    
    result = await db.detected_items.update_one(
        {"id": feedback.itemId},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"success": True, "message": "Feedback recorded successfully"}

@api_router.get("/sessions", response_model=List[CleaningSession])
async def get_sessions(limit: int = 10):
    sessions = await db.cleaning_sessions.find({}, {"_id": 0}).sort("startTime", -1).limit(limit).to_list(limit)
    return sessions

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(unread_only: bool = False):
    query = {"isRead": False} if unread_only else {}
    notifications = await db.notifications.find(query, {"_id": 0}).sort("timestamp", -1).to_list(50)
    return notifications

@api_router.post("/notifications/mark-read")
async def mark_notification_read(notification_id: str):
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"isRead": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}

@api_router.get("/stats", response_model=Stats)
async def get_stats():
    total_items = await db.detected_items.count_documents({})
    valuables = await db.detected_items.count_documents({"type": "valuable"})
    total_sessions = await db.cleaning_sessions.count_documents({})
    
    # Calculate accuracy from feedback
    items_with_feedback = await db.detected_items.find({"userFeedback": {"$exists": True}}, {"_id": 0}).to_list(1000)
    correct_feedback = len([item for item in items_with_feedback if item.get("userFeedback") == "correct"])
    accuracy = (correct_feedback / len(items_with_feedback) * 100) if items_with_feedback else 95.0
    
    # Calculate average confidence
    all_items = await db.detected_items.find({}, {"_id": 0, "confidence": 1}).to_list(1000)
    avg_confidence = sum([item["confidence"] for item in all_items]) / len(all_items) if all_items else 0.85
    
    # Top categories
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_categories = await db.detected_items.aggregate(pipeline).to_list(5)
    top_categories_formatted = [{"category": cat["_id"], "count": cat["count"]} for cat in top_categories]
    
    return Stats(
        totalItemsDetected=total_items,
        valuablesSaved=valuables,
        totalSessions=total_sessions,
        accuracyRate=round(accuracy, 1),
        avgConfidence=round(avg_confidence, 2),
        topCategories=top_categories_formatted
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()