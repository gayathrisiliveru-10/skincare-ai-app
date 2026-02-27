from anthropic import Anthropic
import json
from typing import Dict, List
import os

class ProfileIntelligenceAgent:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
    async def analyze_description(self, description: str) -> Dict:
        """
        Extract structured profile from natural language
        """
        
        system_prompt = """You are a dermatology expert analyzing a user's skin description.

Extract structured information and return ONLY valid JSON (no markdown, no backticks):

{
    "skin_type": "oily|dry|combination|sensitive|normal",
    "concerns": ["acne", "wrinkles", "dark_spots", "redness", "etc"],
    "severity": {
        "acne": "mild|moderate|severe",
        "other_concern": "mild|moderate|severe"
    },
    "triggers": ["stress", "diet", "weather", "hormones"],
    "current_routine": ["cleanser", "moisturizer", "etc"],
    "goals": ["clear_skin", "anti_aging", "hydration"],
    "confidence": 0.85,
    "follow_up_questions": ["Do you break out more during your cycle?", "How often do you exfoliate?"]
}

Be thorough but only extract what's mentioned or clearly implied."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                temperature=0.3,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"User describes their skin: {description}"
                }]
            )
            
            response_text = message.content[0].text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            analysis = json.loads(response_text)
            return analysis
            
        except Exception as e:
            print(f"Profile analysis error: {e}")
            return {
                "error": str(e),
                "skin_type": "normal",
                "concerns": [],
                "confidence": 0.0
            }
    
    async def generate_questions(self, current_profile: Dict) -> List[str]:
        """
        Generate contextual follow-up questions
        """
        
        system_prompt = """Generate 3 conversational follow-up questions to better understand the user's skin.

Be empathetic and specific. Return ONLY a JSON array of strings:
["Question 1?", "Question 2?", "Question 3?"]
"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.7,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"Current profile: {json.dumps(current_profile)}"
                }]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            questions = json.loads(response_text)
            return questions
            
        except Exception as e:
            print(f"Question generation error: {e}")
            return [
                "How does your skin feel by midday?",
                "Do you have any specific product preferences?",
                "What's your main skin goal right now?"
            ]

