from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatQuery, ChatResponse
from app.services.chat_service import ChatService
from app.api.deps import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["AI Healthcare Scheme Assistant"])

@router.post("", response_model=ChatResponse)
def ask_chat_assistant(
    payload: ChatQuery,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return ChatService.process_query(db=db, query=payload, user_id=user_id)
