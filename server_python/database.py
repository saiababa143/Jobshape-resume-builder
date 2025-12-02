from sqlalchemy import create_engine, Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# DATABASE_URL = "sqlite:///./resumes.db"
DATABASE_URL = "mysql+pymysql://root:@localhost/resume_builder"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), index=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Extracted Basic Info
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    
    # Full Parsed Data (stored as JSON)
    parsed_data = Column(JSON, nullable=True)
    
    # Analysis Results
    ats_score = Column(Integer, nullable=True)
    suggestions = Column(JSON, nullable=True)
    
    # Raw Text
    extracted_text = Column(Text, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
