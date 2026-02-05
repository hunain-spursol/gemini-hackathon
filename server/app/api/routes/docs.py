import json
from fastapi import APIRouter
from google.genai import types
from ...core.exceptions import handle_gemini_error
from ...core.utils import clean_json_response
from ...services.gemini import client
from ...models.schemas import DocSearchRequest, AnalyzeRequest

router = APIRouter()

@router.post("/search")
async def search_docs(request: DocSearchRequest):
    try:
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=f"""Find the official API documentation URL for: {request.name}. 
            Use the googleSearch tool to find the official documentation.
            If you find a high-confidence official URL, return a JSON object with "url" and "description".
            If you cannot find the official documentation or are unsure, return null.
            Return ONLY the raw JSON string in your response, no markdown formatting.""",
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        text = response.text
        if not text:
             return None
             
        clean_text = clean_json_response(text)
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            return None
    except Exception as e:
        handle_gemini_error(e)

@router.post("/analyze")
async def analyze_docs(request: AnalyzeRequest):
    try:
        content_snippet = request.fileContent[:50000] if request.fileContent else ""
        prompt_content = f"Content: {content_snippet}" if request.fileContent else f"URL: {request.docsUrl}"
        
        prompt = f"""Based on the following API documentation {prompt_content}, identify 3-6 high-level user capabilities.
        Do not list raw endpoints directly as capabilities. Instead, group related endpoints into user-friendly "Capabilities" (e.g. "Manage Issues", "User Administration").
        For each capability, provide a user-friendly name, a description, and the list of specific endpoints required to fulfill it.
        Return a JSON array of Capability objects."""

        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "id": {"type": "STRING"},
                            "name": {"type": "STRING", "description": "Friendly name"},
                            "description": {"type": "STRING"},
                            "endpoints": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "id": {"type": "STRING"},
                                        "method": {"type": "STRING", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"]},
                                        "path": {"type": "STRING"},
                                        "description": {"type": "STRING"},
                                        "parameterList": {
                                            "type": "ARRAY",
                                            "items": {
                                                "type": "OBJECT", 
                                                "properties": {
                                                    "name": {"type": "STRING"},
                                                    "type": {"type": "STRING"},
                                                    "description": {"type": "STRING"}
                                                }
                                            }
                                        }
                                    },
                                    "required": ["id", "method", "path", "description"]
                                }
                            }
                        },
                        "required": ["id", "name", "description", "endpoints"]
                    }
                }
            )
        )
        
        data = json.loads(response.text or '[]')
        
        for cap in data:
            if 'endpoints' in cap:
                for ep in cap['endpoints']:
                    if 'parameterList' in ep:
                        params_dict = {}
                        for p in ep['parameterList']:
                            if 'name' in p:
                                params_dict[p['name']] = {
                                    "type": p.get('type', 'string'),
                                    "description": p.get('description', '')
                                }
                        ep['parameters'] = params_dict
                        del ep['parameterList']
        
        return data

    except Exception as e:
        handle_gemini_error(e)

@router.post("/analyze-auth")
async def analyze_auth(request: AnalyzeRequest):
    try:
        content_snippet = request.fileContent[:50000] if request.fileContent else ""
        prompt_content = f"Content: {content_snippet}" if request.fileContent else f"URL: {request.docsUrl}"
        
        prompt = f"""Based on the API documentation {prompt_content}, identify the authentication requirements.
        Determine the authentication method (API Key, OAuth2, Basic Auth, or Custom) and the specific fields required.
        Return a JSON object conforming to the AuthConfig structure."""

        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                 response_mime_type="application/json",
                 response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "type": {"type": "STRING", "enum": ["apiKey", "oauth2", "basic", "custom"]},
                        "fields": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "key": {"type": "STRING"},
                                    "label": {"type": "STRING"},
                                    "type": {"type": "STRING", "enum": ["text", "password", "url"]},
                                    "required": {"type": "BOOLEAN"},
                                    "description": {"type": "STRING"},
                                    "placeholder": {"type": "STRING"}
                                },
                                "required": ["key", "label", "type", "required"]
                            }
                        }
                    },
                    "required": ["type", "fields"]
                 }
            )
        )
        
        return json.loads(response.text or '{"type": "custom", "fields": []}')

    except Exception as e:
        handle_gemini_error(e)
