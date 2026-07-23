from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, deps
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/posts", tags=["likes"])

@router.post("/{post_id}/like")
def toggle_like(post_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.is_archived:
        raise HTTPException(status_code=403, detail="This yearbook is archived and read-only.")
        
    existing_like = db.query(models.Like).filter(models.Like.post_id == post.id, models.Like.user_id == current_user.id).first()
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Like removed", "action": "removed"})
    
    new_like = models.Like(
        post_id=post.id,
        user_id=current_user.id
    )
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    return new_like
