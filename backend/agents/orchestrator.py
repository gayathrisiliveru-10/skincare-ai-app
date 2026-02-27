from anthropic import Anthropic
import json
from typing import Dict
import os
from .profile_agent import ProfileIntelligenceAgent
from .analysis_agent import AnalysisAgent
from .recommendation_agent import RecommendationAgent

class OrchestratorAgent:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.profile_agent = ProfileIntelligenceAgent()
        self.analysis_agent = AnalysisAgent()
        self.recommendation_agent = RecommendationAgent()
        
    async def route_request(self, user_message: str, user_profile: Dict, conversation_history: list = []) -> Dict:
        """
        Intelligently route user requests to appropriate agents
        """
        
        system_prompt = """You are an intelligent orchestrator for a skincare AI system.

Available agents:
1. PROFILE - Handle profile questions, skin analysis, update preferences
2. ANALYSIS - Analyze products, ingredients, safety checks
3. RECOMMENDATION - Suggest products, routines, alternatives
4. CHAT - General conversation, education, tips

Decide which agent to use and return ONLY valid JSON:
{
    "agent": "PROFILE|ANALYSIS|RECOMMENDATION|CHAT",
    "action": "specific_action_name",
    "parameters": {},
    "confidence": 0.95,
    "reasoning": "Why this agent"
}
"""

        try:
            # Build conversation context
            context = "\n".join([
                f"{msg['role']}: {msg['content']}" 
                for msg in conversation_history[-5:]  # Last 5 messages
            ])
            
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.1,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"""User profile: {json.dumps(user_profile)}

Conversation context:
{context}

New message: {user_message}

Route this request."""
                }]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            routing = json.loads(response_text)
            
            # Execute the routed action
            result = await self._execute_agent_action(routing, user_message, user_profile)
            
            return {
                "agent_used": routing["agent"],
                "response": result,
                "confidence": routing.get("confidence", 0.8)
            }
            
        except Exception as e:
            print(f"Orchestrator error: {e}")
            return {
                "agent_used": "CHAT",
                "response": "I'm here to help! Could you rephrase that?",
                "confidence": 0.5
            }
    
    async def _execute_agent_action(self, routing: Dict, message: str, profile: Dict) -> str:
        """
        Execute the appropriate agent action
        """
        agent = routing["agent"]
        
        if agent == "PROFILE":
            # Handle profile-related tasks
            if "analyze" in routing.get("action", "").lower():
                result = await self.profile_agent.analyze_description(message)
                return self._format_profile_response(result)
            else:
                questions = await self.profile_agent.generate_questions(profile)
                return f"I'd love to know more! {questions[0]}"
        
        elif agent == "CHAT":
            # General conversation
            return await self._general_chat(message, profile)
        
        else:
            return "I can help with that! Could you provide more details?"
    
    async def _general_chat(self, message: str, profile: Dict) -> str:
        """
        General conversational AI
        """
        system_prompt = """You are a friendly skincare advisor AI. 

Provide helpful, accurate information about skincare.
Be conversational and empathetic.
Keep responses concise (2-3 paragraphs max).
"""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.7,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": f"User profile: {json.dumps(profile)}\n\nMessage: {message}"
                }]
            )
            
            return response.content[0].text
            
        except Exception as e:
            return "I'm here to help with your skincare questions!"
    
    def _format_profile_response(self, analysis: Dict) -> str:
        """
        Format profile analysis into friendly message
        """
        skin_type = analysis.get("skin_type", "normal")
        concerns = ", ".join(analysis.get("concerns", []))
        
        response = f"Got it! I see you have {skin_type} skin"
        if concerns:
            response += f" with concerns about {concerns}"
        response += ". "
        
        questions = analysis.get("follow_up_questions", [])
        if questions:
            response += f"\n\n{questions[0]}"
        
        return response

