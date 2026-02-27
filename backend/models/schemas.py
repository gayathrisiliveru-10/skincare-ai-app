# backend/models/schemas.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime


# ======================
# Product Models
# ======================

class IngredientAnalysis(BaseModel):
    ingredient_name: str
    risk_level: str
    benefits: List[str]
    warnings: List[str]


class Product(BaseModel):
    id: Optional[str] = None
    name: str
    brand: str
    ingredients: List[str]
    category: Optional[str] = None


class ProductAnalysisResult(BaseModel):
    product: Product
    overall_score: int   # 0–100
    recommendation: str  # recommended / caution / not_recommended
    ingredient_analyses: List[IngredientAnalysis]
    warnings: List[str]
    benefits: List[str]
    interactions: List[str]
    alternatives: List[Dict]
    breakout_risk: float


# ======================
# User Models
# ======================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    skin_type: Optional[str] = None
    concerns: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    skin_type: Optional[str] = None
    concerns: Optional[List[str]] = None


# ✅ ADD THIS CLASS (FIXES YOUR ERROR)

class UserProfileCreate(BaseModel):
    name: str
    age: int
    email: Optional[EmailStr] = None
    skin_type: str
    concerns: List[str]
    allergies: List[str]
    climate: str
    lifestyle: Optional[List[str]] = []
    medical_conditions: Optional[List[str]] = []


# ======================
# Chat Models
# ======================

class ChatMessage(BaseModel):
    user_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    agent_used: str
    confidence: float
    suggestions: Optional[List[str]] = None


# ======================
# Feedback Models
# ======================

class FeedbackCreate(BaseModel):
    user_id: str
    product_id: str
    rating: int
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
# ======================
# Product Scan Model
# ======================

class ProductScan(BaseModel):
    barcode: Optional[str] = None
    product_name: Optional[str] = None
    brand: Optional[str] = None
    ingredients: Optional[List[str]] = []
    image_url: Optional[str] = None
# ======================
# User Feedback Model
# ======================

class UserFeedback(BaseModel):
    user_id: str
    product_id: str
    rating: int
    outcome: Optional[str] = None
    notes: Optional[str] = None