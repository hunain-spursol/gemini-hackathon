from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel

class Endpoint(BaseModel):
    id: str
    method: Literal['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    path: str
    description: str
    parameters: Optional[Dict[str, Any]] = None

class AuthField(BaseModel):
    key: str
    label: str
    type: Literal['text', 'password', 'url']
    required: bool
    description: Optional[str] = None
    placeholder: Optional[str] = None

class AuthConfig(BaseModel):
    type: Literal['apiKey', 'oauth2', 'basic', 'custom']
    fields: List[AuthField]

class Integration(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    docsUrl: str
    endpoints: List[Endpoint]
    status: Literal['connected', 'error', 'pending']
    authConfig: Optional[AuthConfig] = None
    config: Dict[str, str]
    createdAt: int

class MessagePart(BaseModel):
    text: str

class Message(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str
    
class ChatRequest(BaseModel):
    message: str
    integrations: List[Integration]
    history: List[Dict[str, Any]]

class DocSearchRequest(BaseModel):
    name: str

class AnalyzeRequest(BaseModel):
    name: str
    docsUrl: Optional[str] = None
    fileContent: Optional[str] = None

class AuthAnalyzeRequest(BaseModel):
    name: str
    docsUrl: Optional[str] = None
    fileContent: Optional[str] = None
