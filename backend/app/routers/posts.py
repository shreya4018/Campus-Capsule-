from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, deps
from ..services.cloudinary_service import upload_image, delete_image
import uuid

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(
    year_id: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    query = db.query(models.Post)
    if year_id:
        query = query.filter(models.Post.academic_year_id == year_id)
    else:
        # Default to the most recent unarchived year
        active_year = db.query(models.AcademicYear).filter(models.AcademicYear.is_archived == False).order_by(models.AcademicYear.created_at.desc()).first()
        if active_year:
            query = query.filter(models.Post.academic_year_id == active_year.id)
    return query.order_by(models.Post.created_at.desc()).all()

@router.post("/", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    academic_year_id: str = Form(...),
    caption: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    year = db.query(models.AcademicYear).filter(models.AcademicYear.id == academic_year_id).first()
    if not year:
        raise HTTPException(status_code=404, detail="Academic year not found")
    if year.is_archived:
        raise HTTPException(status_code=403, detail="This yearbook is archived and read-only.")
    
    # Upload to Cloudinary
    try:
        contents = image.file.read()
        upload_result = upload_image(contents, image.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
        
    new_post = models.Post(
        author_id=current_user.id,
        academic_year_id=year.id,
        caption=caption,
        image_url=upload_result["url"],
        image_public_id=upload_result["public_id"],
        is_archived=False
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.is_archived:
        raise HTTPException(status_code=403, detail="This yearbook is archived and read-only.")
        
    # Check permissions (author, teacher, admin)
    if post.author_id != current_user.id and current_user.role not in [models.RoleEnum.teacher, models.RoleEnum.admin]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    # Delete image from cloudinary
    try:
        delete_image(post.image_public_id)
    except Exception as e:
        print(f"Failed to delete image from cloudinary: {e}")
        
    db.delete(post)
    db.commit()
    return None
