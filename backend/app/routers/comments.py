from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, deps

router = APIRouter(tags=["comments"])

@router.get("/posts/{post_id}/comments", response_model=List[schemas.CommentResponse])
def get_comments(post_id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()

@router.post("/posts/{post_id}/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(post_id: str, comment: schemas.CommentCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.is_archived:
        raise HTTPException(status_code=403, detail="This yearbook is archived and read-only.")
        
    new_comment = models.Comment(
        post_id=post.id,
        author_id=current_user.id,
        body=comment.body
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.delete("/comments/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    comment = db.query(models.Comment).filter(models.Comment.id == id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    post = comment.post
    if post.is_archived:
        raise HTTPException(status_code=403, detail="This yearbook is archived and read-only.")
        
    if comment.author_id != current_user.id and current_user.role not in [models.RoleEnum.teacher, models.RoleEnum.admin]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db.delete(comment)
    db.commit()
    return None
