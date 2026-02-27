from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid

# Import models and agents
from models.schemas import *
from database.connection import get_db, engine, Base
from database.models import User, ProductDB, FeedbackDB, ConversationHistory
from agents.orchestrator import OrchestratorAgent
from agents.profile_agent import ProfileIntelligenceAgent
from agents.analysis_agent import AnalysisAgent
from agents.recommendation_agent import RecommendationAgent

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title="🤖 Agentic Skincare Intelligence API",
    description="AI-powered personalized skincare analysis",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Agents
orchestrator = OrchestratorAgent()
profile_agent = ProfileIntelligenceAgent()
analysis_agent = AnalysisAgent()
recommendation_agent = RecommendationAgent()

# ==================== ROUTES ====================

@app.get("/")
def root():
    return {
        "message": "🌸 Skincare Intelligence API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ==================== USER MANAGEMENT ====================

@app.post("/api/users/create-from-description")
async def create_user_from_description(data: UserProfileCreate, db: Session = Depends(get_db)):
    """
    User describes their skin in natural language
    AI extracts structured profile
    """
    try:
        # AI analyzes description
        analysis = await profile_agent.analyze_description(data.description)
        
        # Generate user ID
        user_id = str(uuid.uuid4())
        
        # Create user in database
        user = User(
            user_id=user_id,
            name=data.name,
            age=data.age,
            skin_type=analysis.get("skin_type", "normal"),
            concerns=analysis.get("concerns", []),
            allergies=analysis.get("allergies", []),
            climate="temperate",  # Default
            lifestyle={},
            medical_conditions=[]
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {
            "user_id": user_id,
            "profile": analysis,
            "message": "Profile created successfully!",
            "follow_up_questions": analysis.get("follow_up_questions", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get user profile
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.user_id,
        "name": user.name,
        "age": user.age,
        "skin_type": user.skin_type,
        "concerns": user.concerns,
        "allergies": user.allergies,
        "climate": user.climate
    }

# ==================== CHAT INTERFACE ====================

@app.post("/api/chat")
async def chat(message: ChatMessage, db: Session = Depends(get_db)):
    """
    Natural language chat interface
    """
    try:
        # Get user profile
        user = db.query(User).filter(User.user_id == message.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_profile = {
            "user_id": user.user_id,
            "skin_type": user.skin_type,
            "concerns": user.concerns,
            "allergies": user.allergies
        }
        
        # Get conversation history
        history = db.query(ConversationHistory)\
            .filter(ConversationHistory.user_id == message.user_id)\
            .order_by(ConversationHistory.timestamp.desc())\
            .limit(10)\
            .all()
        
        conversation_context = [
            {"role": h.role, "content": h.message}
            for h in reversed(history)
        ]
        
        # Route to appropriate agent
        result = await orchestrator.route_request(
            message.message,
            user_profile,
            conversation_context
        )
        
        # Save conversation
        user_msg = ConversationHistory(
            user_id=message.user_id,
            role="user",
            message=message.message
        )
        ai_msg = ConversationHistory(
            user_id=message.user_id,
            role="assistant",
            message=result["response"],
            agent_used=result["agent_used"]
        )
        
        db.add(user_msg)
        db.add(ai_msg)
        db.commit()
        
        return {
            "response": result["response"],
            "agent_used": result["agent_used"],
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PRODUCT SCANNING ====================

@app.post("/api/products/scan")
async def scan_product(scan: ProductScan, db: Session = Depends(get_db)):
    """
    Scan product barcode and analyze
    """
    try:
        # Get user
        user = db.query(User).filter(User.user_id == scan.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if product exists in DB
        product = db.query(ProductDB).filter(ProductDB.barcode == scan.barcode).first()
        
        if not product:
            # Mock product for demo (in production, fetch from API/database)
            product_data = {
                "product_id": str(uuid.uuid4()),
                "barcode": scan.barcode,
                "name": "Hydrating Face Moisturizer",
                "brand": "DemoLab",
                "category": "moisturizer",
                "ingredients": [
                    "Water", "Glycerin", "Hyaluronic Acid",
                    "Niacinamide", "Ceramides", "Fragrance"
                ],
                "description": "Daily hydrating moisturizer",
                "price": 24.99
            }
        else:
            product_data = {
                "product_id": product.product_id,
                "barcode": product.barcode,
                "name": product.name,
                "brand": product.brand,
                "category": product.category,
                "ingredients": product.ingredients,
                "description": product.description,
                "price": product.price
            }
        
        # Get user profile
        user_profile = {
            "skin_type": user.skin_type,
            "concerns": user.concerns,
            "allergies": user.allergies,
            "age": user.age
        }
        
        # AI analyzes product
        analysis = await analysis_agent.analyze_product(product_data, user_profile)
        
        # Check interactions
        interactions = await analysis_agent.check_ingredient_interactions(
            product_data["ingredients"]
        )
        
        # Find alternatives if not recommended
        alternatives = []
        if analysis["recommendation"] != "recommended":
            alternatives = await recommendation_agent.find_alternatives(
                product_data,
                user_profile,
                reason="better_match"
            )
        
        return {
            "product": product_data,
            "analysis": analysis,
            "interactions": interactions,
            "alternatives": alternatives[:3] if alternatives else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== RECOMMENDATIONS ====================

@app.post("/api/routine/generate")
async def generate_routine(user_id: str, budget: str = "mid-range", db: Session = Depends(get_db)):
    """
    Generate personalized skincare routine
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_profile = {
            "skin_type": user.skin_type,
            "concerns": user.concerns,
            "allergies": user.allergies,
            "age": user.age
        }
        
        routine = await recommendation_agent.build_routine(user_profile, budget)
        
        return routine
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FEEDBACK ====================

@app.post("/api/feedback")
async def submit_feedback(feedback: UserFeedback, db: Session = Depends(get_db)):
    """
    User provides feedback on product
    """
    try:
        feedback_entry = FeedbackDB(
            user_id=feedback.user_id,
            product_id=feedback.product_id,
            outcome=feedback.outcome,
            rating=feedback.rating,
            notes=feedback.notes
        )
        
        db.add(feedback_entry)
        db.commit()
        
        return {
            "message": "Thank you for your feedback! AI is learning from your experience.",
            "points_earned": 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== RUN SERVER ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
