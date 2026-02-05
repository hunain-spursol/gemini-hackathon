import re
from fastapi import APIRouter
from google.genai import types
from ...core.exceptions import handle_gemini_error
from ...services.gemini import client
from ...models.schemas import ChatRequest

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Construct tool declarations from integrations
        tools = []
        if request.integrations:
            function_declarations = []
            for integration in request.integrations:
                for endpoint in integration.endpoints:
                    # Sanitize name for tool use
                    safe_int_name = re.sub(r'[^a-zA-Z0-9_]', '_', integration.name.lower())
                    safe_ep_id = re.sub(r'[^a-zA-Z0-9_]', '_', endpoint.id.lower())
                    tool_name = f"{safe_int_name}_{safe_ep_id}"
                    
                    # Ensure parameters structure is valid for Gemini
                    params_schema = endpoint.parameters
                    if not params_schema:
                         params_schema = {
                             "type": "OBJECT",
                             "properties": {
                                 "note": {"type": "STRING", "description": "Any additional details needed for this request"}
                             }
                         }
                    
                    function_declarations.append(types.FunctionDeclaration(
                        name=tool_name,
                        description=f"{endpoint.description} (Integration: {integration.name}, Endpoint: {endpoint.method} {endpoint.path})",
                        parameters=params_schema
                    ))
            
            if function_declarations:
                tools = [types.Tool(function_declarations=function_declarations)]

        # Prepare history
        gemini_history = []
        for msg in request.history:
            role = 'model' if msg.get('role') == 'assistant' else 'user'
            gemini_history.append(types.Content(
                role=role,
                parts=[types.Part(text=msg.get('content'))]
            ))

        # Add current user message to end of contents if using generate_content (stateless)
        # or just pass history if using ChatSession. For generate_content, we pass list including current msg.
        contents = gemini_history + [types.Content(role='user', parts=[types.Part(text=request.message)])]

        config = types.GenerateContentConfig(
            system_instruction=(
                "You are an MCP Forge agent. You help users interact with their connected integrations. "
                "You have access to tools derived from REST APIs. When a user asks to perform an action related to an integration (like Jira, Slack, etc.), "
                "use the appropriate tool. If you use a tool, explain what you are doing. If you don't have a specific tool, inform the user you can only use connected integrations."
            ),
            tools=tools if tools else None
        )

        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=contents,
            config=config
        )
        
        return {"text": response.text}
    except Exception as e:
        handle_gemini_error(e)
