from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, deps

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_active_admin)):
    return db.query(models.User).all()

@router.patch("/{id}/role", response_model=schemas.UserResponse)
def change_role(id: str, role: models.RoleEnum, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_active_admin)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{id}/status", response_model=schemas.UserResponse)
def change_status(id: str, is_active: bool, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_active_admin)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user
