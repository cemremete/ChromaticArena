from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# DB setup
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017').strip('"')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'chromatic_arena').strip('"')]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'chromatic-arena-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Google OAuth stuff
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/auth/google/callback')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

app = FastAPI(title="Chromatic Arena API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    level: int = 1
    experience: int = 0
    coins: int = 100
    avatar: Optional[str] = None
    created_at: datetime

class ArtMovement(BaseModel):
    movement_id: str
    name: str
    era: str
    description: str
    difficulty: str
    unlock_level: int = 1
    color_palette: List[str]
    rules: List[str]
    tools: List[str]
    scoring_rules: Dict[str, Any]

class ArtworkCreate(BaseModel):
    movement_id: str
    canvas_data: Dict[str, Any]
    title: Optional[str] = "Untitled"


class ScoreRequest(BaseModel):
    canvas_data: Dict[str, Any]
    movement_id: str

class ScoreResponse(BaseModel):
    total_score: float
    breakdown: Dict[str, float]
    feedback: List[str]
    bonus: float = 0


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    avatar: Optional[str]
    total_score: float
    level: int
    artworks_count: int


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def get_current_user(request: Request) -> Optional[dict]:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one(
                    {"user_id": session["user_id"]},
                    {"_id": 0, "password": 0}
                )
                return user
    
    # Try JWT header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user_id = verify_jwt_token(token)
        if user_id:
            user = await db.users.find_one(
                {"user_id": user_id},
                {"_id": 0, "password": 0}
            )
            return user
    
    return None

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


# Initialize default data
async def initialize_art_movements():
    movements = [
        {
            "movement_id": "minimalism",
            "name": "Minimalism",
            "era": "1960s-Present",
            "description": "Less is more. Create with maximum simplicity using minimal colors and geometric shapes.",
            "difficulty": "Easy",
            "unlock_level": 1,
            "color_palette": ["#FFFFFF", "#000000", "#808080", "#E0E0E0"],
            "rules": ["Use ≤3 colors", "Use ≤5 elements", "Maintain ≥40% negative space", "Use geometric shapes only"],
            "tools": ["rectangle", "circle", "line", "fill"],
            "scoring_rules": {
                "max_colors": 3,
                "max_elements": 5,
                "min_negative_space": 0.4,
                "geometric_bonus": True
            }
        },
        {
            "movement_id": "pop_art",
            "name": "Pop Art",
            "era": "1950s-1970s",
            "description": "Bold, vibrant, and commercial. Embrace bright colors, repetition, and high contrast.",
            "difficulty": "Easy",
            "unlock_level": 1,
            "color_palette": ["#FF6347", "#FFD700", "#00CED1", "#FF1493", "#32CD32"],
            "rules": ["Use bold primary colors", "Include repetition patterns", "Create high contrast", "Use outline effects"],
            "tools": ["bold-brush", "halftone", "duplicate", "outline", "fill"],
            "scoring_rules": {
                "min_colors": 3,
                "repetition_bonus": True,
                "contrast_required": True,
                "outline_bonus": True
            }
        },
        {
            "movement_id": "cubism",
            "name": "Cubism",
            "era": "1907-1920s",
            "description": "Fragment reality into geometric forms. Show multiple perspectives simultaneously.",
            "difficulty": "Medium",
            "unlock_level": 3,
            "color_palette": ["#8B4513", "#2F4F4F", "#DAA520", "#696969", "#A0522D"],
            "rules": ["Use geometric fragmentation", "Show multiple angles", "Use muted earth tones", "Overlap shapes"],
            "tools": ["polygon", "triangle", "fragment", "rotate", "overlap"],
            "scoring_rules": {
                "min_polygons": 5,
                "overlap_required": True,
                "earth_tones_bonus": True,
                "fragmentation_score": True
            }
        },
        {
            "movement_id": "surrealism",
            "name": "Surrealism",
            "era": "1920s-1950s",
            "description": "Unlock your subconscious. Create dreamlike, unexpected combinations that defy logic.",
            "difficulty": "Hard",
            "unlock_level": 5,
            "color_palette": ["#9370DB", "#20B2AA", "#FF69B4", "#4169E1", "#FFD700"],
            "rules": ["Create unexpected juxtapositions", "Use dreamlike imagery", "Distort proportions", "Include symbolic elements"],
            "tools": ["freehand", "warp", "blend", "mirror", "gradient"],
            "scoring_rules": {
                "creativity_score": True,
                "juxtaposition_bonus": True,
                "distortion_required": True,
                "symbolism_bonus": True
            }
        },
        {
            "movement_id": "impressionism",
            "name": "Impressionism",
            "era": "1860s-1880s",
            "description": "Capture light and movement. Use visible brushstrokes and vibrant colors to convey atmosphere.",
            "difficulty": "Medium",
            "unlock_level": 2,
            "color_palette": ["#87CEEB", "#98FB98", "#FFB6C1", "#DDA0DD", "#F0E68C"],
            "rules": ["Use visible brushstrokes", "Focus on light effects", "Use soft pastel colors", "Capture movement"],
            "tools": ["soft-brush", "stipple", "blend", "light-effect", "texture"],
            "scoring_rules": {
                "brushstroke_visibility": True,
                "light_focus_bonus": True,
                "pastel_colors_required": True,
                "movement_capture": True
            }
        }
    ]
    
    for mov in movements:
        existing = await db.art_movements.find_one({"movement_id": mov["movement_id"]})
        if not existing:
            await db.art_movements.insert_one(mov)


async def initialize_tools():
    tools = [
        # Free tools
        {"tool_id": "brush-basic", "name": "Basic Brush", "type": "brush", "icon": "brush", "price": 0, "rarity": "Common", "movement_id": None},
        {"tool_id": "eraser-basic", "name": "Basic Eraser", "type": "eraser", "icon": "eraser", "price": 0, "rarity": "Common", "movement_id": None},
        {"tool_id": "rectangle", "name": "Rectangle", "type": "shape", "icon": "square", "price": 0, "rarity": "Common", "movement_id": None},
        {"tool_id": "circle", "name": "Circle", "type": "shape", "icon": "circle", "price": 0, "rarity": "Common", "movement_id": None},
        {"tool_id": "line", "name": "Line", "type": "shape", "icon": "minus", "price": 0, "rarity": "Common", "movement_id": None},
        {"tool_id": "fill", "name": "Paint Bucket", "type": "fill", "icon": "paint-bucket", "price": 0, "rarity": "Common", "movement_id": None},
        
        # Premium tools
        {"tool_id": "brush-soft", "name": "Soft Brush", "type": "brush", "icon": "paintbrush", "price": 50, "rarity": "Rare", "movement_id": None},
        {"tool_id": "brush-texture", "name": "Texture Brush", "type": "brush", "icon": "paintbrush-2", "price": 100, "rarity": "Rare", "movement_id": None},
        {"tool_id": "polygon", "name": "Polygon Tool", "type": "shape", "icon": "hexagon", "price": 75, "rarity": "Rare", "movement_id": None},
        {"tool_id": "triangle", "name": "Triangle", "type": "shape", "icon": "triangle", "price": 50, "rarity": "Common", "movement_id": None},
        {"tool_id": "gradient", "name": "Gradient Fill", "type": "fill", "icon": "rainbow", "price": 150, "rarity": "Epic", "movement_id": None},
        {"tool_id": "blur", "name": "Blur Effect", "type": "effect", "icon": "cloud", "price": 200, "rarity": "Epic", "movement_id": None},
        
        # Movement-specific
        {"tool_id": "halftone", "name": "Halftone Pattern", "type": "effect", "icon": "grid-3x3", "price": 100, "rarity": "Rare", "movement_id": "pop_art"},
        {"tool_id": "stipple", "name": "Stipple Brush", "type": "brush", "icon": "sparkles", "price": 150, "rarity": "Epic", "movement_id": "impressionism"},
        {"tool_id": "fragment", "name": "Fragment Tool", "type": "effect", "icon": "layers", "price": 200, "rarity": "Epic", "movement_id": "cubism"},
        {"tool_id": "warp", "name": "Warp Tool", "type": "effect", "icon": "waves", "price": 250, "rarity": "Legendary", "movement_id": "surrealism"},
    ]
    
    for t in tools:
        existing = await db.tools.find_one({"tool_id": t["tool_id"]})
        if not existing:
            await db.tools.insert_one(t)

async def initialize_achievements():
    achievements = [
        {"achievement_id": "first-artwork", "name": "First Stroke", "description": "Create your first artwork", "icon": "palette", "reward": 50, "requirement": {"artworks_created": 1}},
        {"achievement_id": "five-artworks", "name": "Creative Soul", "description": "Create 5 artworks", "icon": "image", "reward": 100, "requirement": {"artworks_created": 5}},
        {"achievement_id": "ten-artworks", "name": "Prolific Artist", "description": "Create 10 artworks", "icon": "images", "reward": 200, "requirement": {"artworks_created": 10}},
        {"achievement_id": "perfect-score", "name": "Perfection", "description": "Get a perfect score (100+)", "icon": "star", "reward": 150, "requirement": {"min_score": 100}},
        {"achievement_id": "all-movements", "name": "Renaissance Artist", "description": "Create an artwork in every movement", "icon": "crown", "reward": 300, "requirement": {"all_movements": True}},
        {"achievement_id": "level-5", "name": "Rising Star", "description": "Reach level 5", "icon": "trending-up", "reward": 100, "requirement": {"level": 5}},
        {"achievement_id": "level-10", "name": "Master Artist", "description": "Reach level 10", "icon": "award", "reward": 250, "requirement": {"level": 10}},
        {"achievement_id": "first-like", "name": "Appreciated", "description": "Receive your first like", "icon": "heart", "reward": 25, "requirement": {"likes_received": 1}},
        {"achievement_id": "collector", "name": "Tool Collector", "description": "Purchase 5 tools", "icon": "shopping-bag", "reward": 100, "requirement": {"tools_purchased": 5}},
    ]
    
    for achievement in achievements:
        existing = await db.achievements.find_one({"achievement_id": achievement["achievement_id"]})
        if not existing:
            await db.achievements.insert_one(achievement)


# Scoring logic - this is where the magic happens
def calculate_score(canvas_data: Dict[str, Any], movement_id: str, movement_rules: Dict[str, Any]) -> ScoreResponse:
    total_score = 0.0
    breakdown = {}
    feedback = []
    bonus = 0.0
    
    objects = canvas_data.get("objects", [])
    num_objects = len(objects)
    
    # Get colors from canvas
    colors_used = set()
    for obj in objects:
        if "fill" in obj and obj["fill"]:
            colors_used.add(obj["fill"])
        if "stroke" in obj and obj["stroke"]:
            colors_used.add(obj["stroke"])
    
    num_colors = len(colors_used)
    
    # Calculate negative space
    canvas_width = canvas_data.get("width", 800)
    canvas_height = canvas_data.get("height", 600)
    total_area = canvas_width * canvas_height
    
    covered_area = 0
    for obj in objects:
        obj_width = obj.get("width", obj.get("radius", 50) * 2)
        obj_height = obj.get("height", obj.get("radius", 50) * 2)
        covered_area += obj_width * obj_height * obj.get("scaleX", 1) * obj.get("scaleY", 1)
    
    negative_space = max(0, 1 - (covered_area / total_area))
    
    # Movement-specific scoring
    if movement_id == "minimalism":
        max_colors = movement_rules.get("max_colors", 3)
        if num_colors <= max_colors:
            color_score = 30
            feedback.append("Great color restraint!")
        else:
            color_score = max(0, 30 - (num_colors - max_colors) * 10)
            feedback.append(f"Too many colors ({num_colors}). Try using {max_colors} or fewer.")
        breakdown["colors"] = color_score
        total_score += color_score
        
        max_elements = movement_rules.get("max_elements", 5)
        if num_objects <= max_elements:
            element_score = 30
            feedback.append("Perfect element count!")
        else:
            element_score = max(0, 30 - (num_objects - max_elements) * 6)
            feedback.append(f"Too many elements ({num_objects}). Keep it simple with {max_elements} or fewer.")
        breakdown["elements"] = element_score
        total_score += element_score
        
        min_negative = movement_rules.get("min_negative_space", 0.4)
        if negative_space >= min_negative:
            space_score = 25
            feedback.append("Excellent use of negative space!")
        else:
            space_score = max(0, 25 * (negative_space / min_negative))
            feedback.append(f"More negative space needed ({int(negative_space*100)}% vs {int(min_negative*100)}% required)")
        breakdown["negative_space"] = space_score
        total_score += space_score
        
        geometric_types = ["rect", "circle", "triangle", "polygon", "line"]
        geometric_count = sum(1 for obj in objects if obj.get("type") in geometric_types)
        if num_objects > 0 and geometric_count == num_objects:
            bonus = 15
            feedback.append("Bonus: All geometric shapes!")
        breakdown["geometric_bonus"] = bonus
        
    elif movement_id == "pop_art":
        if num_colors >= 3:
            color_score = min(30, num_colors * 8)
            feedback.append("Great use of bold colors!")
        else:
            color_score = num_colors * 10
            feedback.append("Add more vibrant colors!")
        breakdown["colors"] = color_score
        total_score += color_score
        
        # Check for repetition
        type_counts = {}
        for obj in objects:
            t = obj.get("type", "unknown")
            type_counts[t] = type_counts.get(t, 0) + 1
        
        has_repetition = any(count >= 3 for count in type_counts.values())
        if has_repetition:
            repetition_score = 25
            feedback.append("Great repetition pattern!")
        else:
            repetition_score = 10
            feedback.append("Try adding more repetition of elements")
        breakdown["repetition"] = repetition_score
        total_score += repetition_score
        
        contrast_score = min(25, num_objects * 3)
        breakdown["contrast"] = contrast_score
        total_score += contrast_score
        feedback.append("Good visual impact!")
        
        outlined_count = sum(1 for obj in objects if obj.get("stroke") and obj.get("strokeWidth", 0) > 0)
        if outlined_count > 0:
            bonus = min(20, outlined_count * 5)
            feedback.append("Bonus: Nice use of outlines!")
        breakdown["outline_bonus"] = bonus
        
    elif movement_id == "cubism":
        polygon_types = ["polygon", "triangle", "rect"]
        polygon_count = sum(1 for obj in objects if obj.get("type") in polygon_types)
        polygon_score = min(30, polygon_count * 6)
        breakdown["polygons"] = polygon_score
        total_score += polygon_score
        
        if polygon_count >= 5:
            feedback.append("Excellent geometric fragmentation!")
        else:
            feedback.append("Add more geometric shapes for fragmentation")
        
        if num_objects >= 4:
            overlap_score = 25
            feedback.append("Good layering of elements!")
        else:
            overlap_score = num_objects * 6
            feedback.append("Try overlapping more shapes")
        breakdown["overlap"] = overlap_score
        total_score += overlap_score
        
        earth_tones = ["#8B4513", "#2F4F4F", "#DAA520", "#696969", "#A0522D", "#CD853F", "#D2691E"]
        earth_count = sum(1 for c in colors_used if c.upper() in [e.upper() for e in earth_tones])
        earth_score = min(25, earth_count * 8)
        breakdown["earth_tones"] = earth_score
        total_score += earth_score
        
        if earth_count >= 2:
            feedback.append("Nice use of earth tones!")
            bonus = 10
    
    elif movement_id == "impressionism":
        if num_colors >= 3:
            color_score = min(30, num_colors * 7)
            feedback.append("Beautiful color palette!")
        else:
            color_score = num_colors * 10
            feedback.append("Try adding more soft pastel colors")
        breakdown["colors"] = color_score
        total_score += color_score
        
        if num_objects >= 10:
            stroke_score = 30
            feedback.append("Wonderful brushwork effect!")
        elif num_objects >= 5:
            stroke_score = 20
            feedback.append("Add more brush strokes for texture")
        else:
            stroke_score = num_objects * 4
            feedback.append("Layer more strokes to capture light")
        breakdown["brushstrokes"] = stroke_score
        total_score += stroke_score
        
        if covered_area / total_area > 0.3:
            atmosphere_score = 20
            bonus = 10
            feedback.append("Bonus: Great atmospheric effect!")
        else:
            atmosphere_score = 10
        breakdown["atmosphere"] = atmosphere_score
        total_score += atmosphere_score
        
    elif movement_id == "surrealism":
        unique_types = len(set(obj.get("type") for obj in objects))
        creativity_score = min(30, unique_types * 10)
        breakdown["creativity"] = creativity_score
        total_score += creativity_score
        
        if unique_types >= 3:
            feedback.append("Great variety of elements!")
        else:
            feedback.append("Try using different element types")
        
        if num_objects >= 2:
            scales = [obj.get("scaleX", 1) * obj.get("scaleY", 1) for obj in objects]
            scale_variety = max(scales) / max(min(scales), 0.1)
            if scale_variety > 2:
                juxtaposition_score = 30
                feedback.append("Surreal scale distortions!")
                bonus = 15
            else:
                juxtaposition_score = 15
                feedback.append("Try varying sizes more dramatically")
        else:
            juxtaposition_score = 10
        breakdown["juxtaposition"] = juxtaposition_score
        total_score += juxtaposition_score
        
        color_score = min(20, num_colors * 5)
        breakdown["dreamlike_colors"] = color_score
        total_score += color_score
    
    else:
        total_score = min(70, num_objects * 5 + num_colors * 10)
        breakdown["base"] = total_score
        feedback.append("Keep creating!")
    
    total_score += bonus
    
    return ScoreResponse(
        total_score=round(min(total_score, 150), 1),
        breakdown={k: round(v, 1) for k, v in breakdown.items()},
        feedback=feedback,
        bonus=round(bonus, 1)
    )


# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"$or": [
        {"email": user_data.email},
        {"username": user_data.username}
    ]})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password": hashed_pw,
        "level": 1,
        "experience": 0,
        "coins": 100,
        "avatar": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Give them basic tools
    basic_tools = await db.tools.find({"price": 0}, {"_id": 0}).to_list(100)
    for tool in basic_tools:
        await db.inventory.insert_one({
            "user_id": user_id,
            "tool_id": tool["tool_id"],
            "acquired": datetime.now(timezone.utc).isoformat()
        })
    
    token = create_jwt_token(user_id)
    
    return {
        "user_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"])
    
    # Create session for cookie auth
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
        "level": user.get("level", 1),
        "coins": user.get("coins", 100),
        "token": token
    }


# Google OAuth
@api_router.get("/auth/google")
async def google_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + "&".join(
        f"{k}={v}" for k, v in params.items()
    )
    
    return {"url": auth_url}

@api_router.get("/auth/google/callback")
async def google_callback(code: str, response: Response):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
        except httpx.HTTPError as e:
            logger.error(f"Token exchange failed: {e}")
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
    
    # Verify ID token
    try:
        id_info = id_token.verify_oauth2_token(
            tokens["id_token"],
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid token")
    
    email = id_info.get("email")
    name = id_info.get("name", "")
    picture = id_info.get("picture")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user:
        # Update existing
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "avatar": picture}}
        )
        user_id = user["user_id"]
    else:
        # Create new
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        username = email.split("@")[0] + "_" + uuid.uuid4().hex[:4]
        
        user_doc = {
            "user_id": user_id,
            "username": username,
            "email": email,
            "name": name,
            "password": None,
            "level": 1,
            "experience": 0,
            "coins": 100,
            "avatar": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Initial inventory
        basic_tools = await db.tools.find({"price": 0}, {"_id": 0}).to_list(100)
        for tool in basic_tools:
            await db.inventory.insert_one({
                "user_id": user_id,
                "tool_id": tool["tool_id"],
                "acquired": datetime.now(timezone.utc).isoformat()
            })
        
        user = user_doc
    
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    redirect_url = f"{FRONTEND_URL}/#session_id={session_token}"
    return RedirectResponse(url=redirect_url)

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "user_id": user["user_id"],
        "username": user.get("username"),
        "email": user["email"],
        "name": user.get("name"),
        "level": user.get("level", 1),
        "experience": user.get("experience", 0),
        "coins": user.get("coins", 100),
        "avatar": user.get("avatar")
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out successfully"}

@api_router.get("/movements")
async def get_movements():
    try:
        movements = await db.art_movements.find({}).to_list(length=None)
        # Convert ObjectId to string for JSON serialization
        for movement in movements:
            if "_id" in movement:
                movement["_id"] = str(movement["_id"])
        return movements
    except Exception as e:
        logger.error(f"Error fetching movements: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch movements")

@api_router.get("/shop/tools")
async def get_shop_tools():
    try:
        tools = await db.tools.find({}).to_list(length=None)
        # Convert ObjectId to string for JSON serialization
        for tool in tools:
            if "_id" in tool:
                tool["_id"] = str(tool["_id"])
        return tools
    except Exception as e:
        logger.error(f"Error fetching tools: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tools")

@api_router.get("/leaderboard/global")
async def get_global_leaderboard():
    try:
        # Get top users by experience/level
        pipeline = [
            {
                "$addFields": {
                    "total_score": {
                        "$add": ["$experience", {"$multiply": ["$level", 100]}]
                    }
                }
            },
            {"$sort": {"total_score": -1}},
            {"$limit": 50}
        ]
        
        users = await db.users.aggregate(pipeline).to_list(50)
        
        # Add rank
        leaderboard = []
        for i, user in enumerate(users):
            if "_id" in user:
                user["_id"] = str(user["_id"])
            entry = {
                "rank": i + 1,
                "user_id": user.get("user_id"),
                "username": user.get("username"),
                "level": user.get("level", 1),
                "experience": user.get("experience", 0),
                "total_score": user.get("total_score", 0),
                "avatar": user.get("avatar"),
                "artworks_count": 0  # TODO: Count actual artworks
            }
            leaderboard.append(entry)
        
        return leaderboard
    except Exception as e:
        logger.error(f"Error fetching global leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")

@api_router.get("/leaderboard/movement/{movement_id}")
async def get_movement_leaderboard(movement_id: str):
    try:
        # Get top scores for specific movement
        pipeline = [
            {"$match": {"movement_id": movement_id}},
            {"$sort": {"score": -1}},
            {"$limit": 20}
        ]
        
        # For now, return empty since we don't have artworks collection implemented
        # TODO: Implement when artworks collection is ready
        return []
    except Exception as e:
        logger.error(f"Error fetching movement leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch movement leaderboard")


# Diğer endpointler devam ediyor...
# (Karakter sınırı nedeniyle kesildi)

@app.on_event("startup")
async def startup_event():
    await initialize_art_movements()
    await initialize_tools()
    await initialize_achievements()
    logger.info("Chromatic Arena API initialized!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Chromatic Arena API!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}