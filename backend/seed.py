import os
import uuid
from app.database import SessionLocal, engine, Base
from app import models, auth
from dotenv import load_dotenv

load_dotenv()

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Checking if admin user exists...")
    admin = db.query(models.User).filter(models.User.email == "admin@campuscapsule.com").first()
    
    if not admin:
        print("Creating admin user...")
        admin = models.User(
            full_name="Admin User",
            email="admin@campuscapsule.com",
            hashed_password=auth.get_password_hash("admin123"),
            role=models.RoleEnum.admin
        )
        db.add(admin)
        
        print("Creating teacher user...")
        teacher = models.User(
            full_name="Teacher User",
            email="teacher@campuscapsule.com",
            hashed_password=auth.get_password_hash("teacher123"),
            role=models.RoleEnum.teacher
        )
        db.add(teacher)
        
        print("Creating student users...")
        student1 = models.User(
            full_name="Student One",
            email="student1@campuscapsule.com",
            hashed_password=auth.get_password_hash("student123"),
            role=models.RoleEnum.student
        )
        student2 = models.User(
            full_name="Student Two",
            email="student2@campuscapsule.com",
            hashed_password=auth.get_password_hash("student123"),
            role=models.RoleEnum.student
        )
        db.add_all([student1, student2])
        
        print("Creating academic year...")
        year = models.AcademicYear(label="2024-2025")
        db.add(year)
        
        db.commit()
        
        print("Database seeded successfully with users and academic year.")
        print("Admin: admin@campuscapsule.com / admin123")
        print("Teacher: teacher@campuscapsule.com / teacher123")
        print("Student: student1@campuscapsule.com / student123")
    else:
        print("Database already seeded.")
        
    db.close()

if __name__ == "__main__":
    seed_db()
