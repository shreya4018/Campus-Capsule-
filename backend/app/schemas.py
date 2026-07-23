from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from .models import RoleEnum

class UserBase(BaseModel):
    full_name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    role: RoleEnum
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AcademicYearBase(BaseModel):
    label: str

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearResponse(AcademicYearBase):
    id: UUID
    is_archived: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CommentBase(BaseModel):
    body: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: UUID
    post_id: UUID
    author_id: UUID
    created_at: datetime
    author: UserResponse
    model_config = ConfigDict(from_attributes=True)

class LikeResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PostBase(BaseModel):
    caption: Optional[str] = None

class PostResponse(PostBase):
    id: UUID
    author_id: UUID
    academic_year_id: UUID
    image_url: str
    created_at: datetime
    is_archived: bool
    author: UserResponse
    comments: List[CommentResponse] = []
    likes: List[LikeResponse] = []
    model_config = ConfigDict(from_attributes=True)
