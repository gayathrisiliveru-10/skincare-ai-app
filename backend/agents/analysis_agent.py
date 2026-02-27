from anthropic import Anthropic
import json
from typing import Dict, List
import os

class AnalysisAgent:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
    async def analyze_product(self, product: Dict, user_profile: Dict) -> Dict:
        """
        Deep product analysis for specific user
        """
        
        system_prompt = """You are a cosmetic chemist analyzing a product for a specific user.

Analyze each ingredient and provide a comprehensive assessment. Return ONLY valid JSON:

{
    "overall_score": 75,
    "recommendation": "recommended|caution|not_recommended",
    "summary": "Brief overall assessment",
    "ingredient_analyses": [
        {
            "ingredient": "Hyaluronic Acid",
            "category": "humectant",
            "benefits": ["Deep hydration", "Plumping effect"],
            "risks": ["None for this user"],
            "suitability_score": 95,
            "evidence_level": "strong",
            "explanation": "Excellent for dry skin, backed by clinical studies"
        }
    ],
    "warnings": ["Contains fragrance - may irritate sensitive skin"],
    "benefits": ["Excellent hydration", "Anti-aging properties"],
    "interactions": ["Don't use with Vitamin C (in morning routine)"],
    "usage_tips": ["Apply on damp skin", "Use twice daily"]
}

Consider:
- User's skin type, concerns, allergies
- Ingredient interactions
- Scientific evidence
- Practical usage advice
"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=3000,
                temperature=0.2,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"""Product: {json.dumps(product)}

User Profile: {json.dumps(user_profile)}

Analyze this product for THIS specific user."""
                }]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            analysis = json.loads(response_text)
            return analysis
            
        except Exception as e:
            print(f"Analysis error: {e}")
            return self._fallback_analysis(product, user_profile)
    
    def _fallback_analysis(self, product: Dict, user_profile: Dict) -> Dict:
        """
        Rule-based fallback if AI fails
        """
        score = 70
        warnings = []
        benefits = []
        
        ingredients = [i.lower() for i in product.get("ingredients", [])]
        allergies = [a.lower() for a in user_profile.get("allergies", [])]
        skin_type = user_profile.get("skin_type", "normal")
        
        # Check allergies
        for allergy in allergies:
            if allergy in ingredients:
                warnings.append(f"⚠️ Contains {allergy} - you're allergic!")
                score -= 30
        
        # Skin type matching
        if skin_type == "dry":
            if any(a in ingredients for a in ["alcohol", "alcohol denat"]):
                warnings.append("❌ Contains alcohol - drying for your skin")
                score -= 20
            if "hyaluronic acid" in ingredients:
                benefits.append("✅ Hyaluronic acid - great for hydration")
                score += 10
        
        if skin_type == "sensitive":
            if "fragrance" in ingredients or "parfum" in ingredients:
                warnings.append("⚠️ Contains fragrance - may irritate")
                score -= 15
        
        return {
            "overall_score": max(0, min(100, score)),
            "recommendation": "recommended" if score >= 70 else "caution" if score >= 50 else "not_recommended",
            "summary": f"Score: {score}/100",
            "ingredient_analyses": [],
            "warnings": warnings,
            "benefits": benefits,
            "interactions": [],
            "usage_tips": []
        }
    
    async def check_ingredient_interactions(self, ingredients: List[str]) -> List[str]:
        """
        Check for dangerous ingredient combinations
        """
        
        system_prompt = """Check for known ingredient interactions in skincare.

Known problematic combinations:
- Retinol + AHA/BHA (over-exfoliation)
- Vitamin C + Niacinamide (reduced efficacy at wrong pH)
- Retinol + Benzoyl Peroxide (deactivation)
- AHA/BHA + Vitamin C (over-exfoliation)

Return ONLY a JSON array of warnings:
["Warning 1", "Warning 2"]

If no interactions, return empty array: []
"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.1,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"Ingredients: {json.dumps(ingredients)}"
                }]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            interactions = json.loads(response_text)
            return interactions
            
        except Exception as e:
            print(f"Interaction check error: {e}")
            return []
