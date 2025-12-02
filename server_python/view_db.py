from database import SessionLocal, Resume
import json

def view_resumes():
    db = SessionLocal()
    try:
        resumes = db.query(Resume).all()
        print(f"Found {len(resumes)} resumes in database:")
        print("-" * 50)
        for r in resumes:
            print(f"ID: {r.id}")
            print(f"Name: {r.full_name}")
            print(f"Email: {r.email}")
            print(f"Filename: {r.filename}")
            print(f"ATS Score: {r.ats_score}")
            print(f"Upload Date: {r.upload_date}")
            print("-" * 50)
    finally:
        db.close()

if __name__ == "__main__":
    view_resumes()
