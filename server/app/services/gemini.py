from google import genai
from ..core.config import settings

class GeminiService:
    def __init__(self):
        if not settings.API_KEY:
            print("Warning: API_KEY not found in environment variables")
        self.client = genai.Client(api_key=settings.API_KEY)

gemini_service = GeminiService()
client = gemini_service.client
