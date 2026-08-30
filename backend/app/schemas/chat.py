from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.scheme import SchemeOut

class ChatMessageSchema(BaseModel):
    id: Optional[int] = None
    sender: str
    content: str
    sources: Optional[str] = None
    created_at: Optional[str] = None

class ChatQuery(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_uuid: Optional[str] = None
    user_context: Optional[dict] = None

class ChatResponse(BaseModel):
    session_uuid: str
    message: str
    relevant_schemes: List[SchemeOut] = []
    suggested_followups: List[str] = []
    disclaimer: str = "This assistant provides informational guidance regarding Indian public healthcare schemes only. It does NOT offer medical diagnosis, clinical advice, or legal guarantees of government scheme approval."

# Aliases
ChatMessageRequest = ChatQuery
ChatSessionResponse = ChatResponse
