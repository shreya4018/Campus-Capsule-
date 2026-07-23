from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, deps

router = APIRouter(prefix="/years", tags=["years"])

@router.get("/", response_model=List[schemas.AcademicYearResponse])
def get_years(db: Session = Depends(deps.get_db)):
    return db.query(models.AcademicYear).order_by(models.AcademicYear.created_at.desc()).all()

@router.post("/", response_model=schemas.AcademicYearResponse, status_code=status.HTTP_201_CREATED)
def create_year(year: schemas.AcademicYearCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_active_admin)):
    new_year = models.AcademicYear(label=year.label)
    db.add(new_year)
    db.commit()
    db.refresh(new_year)
    return new_year

@router.post("/{id}/archive", response_model=schemas.AcademicYearResponse)
def archive_year(id: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_active_admin)):
    year = db.query(models.AcademicYear).filter(models.AcademicYear.id == id).first()
    if not year:
        raise HTTPException(status_code=404, detail="Academic year not found")
    
    if year.is_archived:
        return year
    
    year.is_archived = True
    # Archive all posts in this year
    posts = db.query(models.Post).filter(models.Post.academic_year_id == id).all()
    for post in posts:
        post.is_archived = True
        
    db.commit()
    db.refresh(year)
    return year
