from anthropic import Anthropic
import json
from typing import Dict, List
import os

class RecommendationAgent:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    async def find_alternatives(self, product: Dict, user_profile: Dict, reason: str = "better_match") -> List[Dict]:
        """
        Find alternative products
        """
        
        system_prompt = """You are a skincare product expert. Find 3 alternative products.

Consider:
- User's skin type and concerns
- Budget range (budget/mid-range/premium)
- Better ingredient profile
- Popular, widely available brands

Return ONLY valid JSON:
[
    {
        "name": "CeraVe Hydrating Cleanser",
        "brand": "CeraVe",
        "why_better": "Ceramides repair skin barrier, fragrance-free",
        "price_range": "$12-15",
        "match_score": 95,
        "where_to_buy": "Target, Amazon, Ulta"
    }
]
"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                temperature=0.5,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"""Current product: {json.dumps(product)}

User profile: {json.dumps(user_profile)}

Reason for alternatives: {reason}

Find 3 better alternatives."""
                }]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            alternatives = json.loads(response_text)
            return alternatives
            
        except Exception as e:
            print(f"Recommendation error: {e}")
            return []
    
    async def build_routine(self, user_profile: Dict, budget: str = "mid-range") -> Dict:
        """
        Generate complete skincare routine
        """
        
        system_prompt = """Create a personalized skincare routine with specific product recommendations.

Include:
- Morning routine (4-6 steps)
- Night routine (5-7 steps)
- 2-3x per week treatments
- Product order matters!

Return ONLY valid JSON:
{
    "morning": [
        {
            "step": 1,
            "product_type": "Cleanser",
            "recommendation": "CeraVe Hydrating Cleanser",
            "why": "Gentle, maintains skin barrier",
            "price": "$12-15"
        }
    ],
    "night": [...],
    "weekly": [...],
    "total_monthly_cost": "$80-120",
    "expected_results": "Visible improvement in 4-6 weeks",
    "tips": ["Always apply on damp skin", "Wait 1 min between steps"]
}
"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=3000,
                temperature=0.4,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"""User profile: {json.dumps(user_profile)}

Budget: {budget}

Create a complete routine."""
                }]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            routine = json.loads(response_text)
            return routine
            
        except Exception as e:
            print(f"Routine generation error: {e}")
            return {"error": str(e)}
