import os
import json
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from pypdf import PdfReader
from docx import Document
import io
from dotenv import load_dotenv
from collections import Counter
from sqlalchemy.orm import Session
from database import SessionLocal, Resume, User, JobTitle, init_db
from passlib.context import CryptContext

load_dotenv()

# Initialize Database
init_db()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("Warning: GOOGLE_API_KEY not found. Using Local Heuristic Mode.")
    model = None

# --- Auth Configuration ---
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str

    class Config:
        orm_mode = True

class ResumeSave(BaseModel):
    user_id: int
    fullName: str
    email: str
    phone: str
    location: str = ""
    linkedin: str = ""
    summary: str
    experience: list
    education: list
    skills: list
    projects: list = []
    # Optional: store design config too if needed, but for now just content

# --- Helper Functions ---
def extract_text_from_pdf(file_bytes):
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"PDF Error: {e}")
        return ""

def extract_text_from_docx(file_bytes):
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"DOCX Error: {e}")
        return ""

# --- Local Heuristic Analyzer (Fallback) ---
class LocalATSAnalyzer:
    def __init__(self):
        self.action_verbs = {
            "led", "developed", "managed", "created", "designed", "implemented", 
            "optimized", "achieved", "improved", "launched", "orchestrated", 
            "spearheaded", "engineered", "built", "resolved"
        }
        self.essential_sections = ["experience", "education", "skills", "projects", "summary"]

    def analyze(self, text):
        text_lower = text.lower()
        score = 50  # Base score
        suggestions = []
        
        # 1. Word Count Check
        word_count = len(text.split())
        if word_count < 200:
            score -= 15
            suggestions.append({
                "id": 1, "type": "error", "title": "Resume Too Short", 
                "description": f"Your resume is only {word_count} words. Aim for at least 400 words to cover your experience."
            })
        elif word_count > 1500:
            score -= 5
            suggestions.append({
                "id": 2, "type": "warning", "title": "Resume Too Long", 
                "description": "Your resume is quite long. Recruiters prefer concise 1-2 page documents."
            })
        else:
            score += 10
            suggestions.append({
                "id": 3, "type": "success", "title": "Optimal Length", 
                "description": "Your resume length is within the recommended range."
            })

        # 2. Contact Info Check
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        has_email = re.search(email_pattern, text)
        has_phone = re.search(phone_pattern, text)
        
        if has_email:
            score += 10
        else:
            score -= 20
            suggestions.append({
                "id": 4, "type": "error", "title": "Missing Email", 
                "description": "We couldn't find an email address. This is critical for recruiters."
            })
            
        if has_phone:
            score += 5
        else:
            suggestions.append({
                "id": 5, "type": "warning", "title": "Missing Phone Number", 
                "description": "Consider adding a phone number for easier contact."
            })

        # 3. Section Headers Check
        found_sections = [sec for sec in self.essential_sections if sec in text_lower]
        missing_sections = [sec for sec in self.essential_sections if sec not in found_sections]
        
        if len(missing_sections) == 0:
            score += 15
            suggestions.append({
                "id": 6, "type": "success", "title": "Comprehensive Structure", 
                "description": "You have all the essential sections (Experience, Education, Skills, etc.)."
            })
        else:
            score -= (len(missing_sections) * 5)
            suggestions.append({
                "id": 7, "type": "warning", "title": "Missing Sections", 
                "description": f"Consider adding these sections: {', '.join([s.capitalize() for s in missing_sections])}."
            })

        # 4. Action Verbs Check
        words = re.findall(r'\w+', text_lower)
        found_verbs = set(words) & self.action_verbs
        if len(found_verbs) > 5:
            score += 10
            suggestions.append({
                "id": 8, "type": "success", "title": "Strong Action Verbs", 
                "description": f"Great use of power words like '{', '.join(list(found_verbs)[:3])}'."
            })
        else:
            suggestions.append({
                "id": 9, "type": "warning", "title": "Weak Action Verbs", 
                "description": "Use more strong action verbs (e.g., Led, Developed, Managed) to describe your achievements."
            })

        return {
            "atsScore": min(100, max(0, score)),
            "suggestions": suggestions
        }

    def match_job(self, resume_text, job_desc):
        resume_words = set(re.findall(r'\w+', resume_text.lower()))
        job_words = re.findall(r'\w+', job_desc.lower())
        
        # Filter out common stop words (simplified list)
        stop_words = {"and", "the", "to", "of", "in", "a", "for", "with", "on", "is", "an", "or", "be", "as"}
        keywords = [w for w in job_words if w not in stop_words and len(w) > 3]
        
        keyword_counts = Counter(keywords)
        top_keywords = [k for k, v in keyword_counts.most_common(15)]
        
        matched = [k for k in top_keywords if k in resume_words]
        missing = [k for k in top_keywords if k not in resume_words]
        
        match_percentage = int((len(matched) / len(top_keywords)) * 100) if top_keywords else 0
        
        recommendations = []
        if match_percentage < 50:
            recommendations.append("Your resume is missing many key terms from the job description.")
        if missing:
            recommendations.append(f"Try to weave in keywords like: {', '.join(missing[:3])}.")
        
        return {
            "matchScore": match_percentage,
            "summary": f"Your resume matches {match_percentage}% of the top keywords found in the job description.",
            "missingKeywords": missing,
            "recommendations": recommendations
        }

    def parse_resume(self, text):
        # Basic Heuristic Parsing
        data = {
            "fullName": "Your Name",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [],
            "projects": []
        }
        
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if lines:
            data["fullName"] = lines[0]  # Assume first line is name

        # Extract Email
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if email_match:
            data["email"] = email_match.group(0)

        # Extract Phone
        phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        if phone_match:
            data["phone"] = phone_match.group(0)
            
        # Extract LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/[a-zA-Z0-9-]+', text)
        if linkedin_match:
            data["linkedin"] = linkedin_match.group(0)

        # Helper to find section content
        lower_text = text.lower()
        def get_section_content(section_name, next_sections):
            start_idx = lower_text.find(section_name)
            if start_idx == -1: return ""
            
            content_start = start_idx + len(section_name)
            content_end = len(text)
            
            for next_sec in next_sections:
                idx = lower_text.find(next_sec, content_start)
                if idx != -1 and idx < content_end:
                    content_end = idx
            
            return text[content_start:content_end].strip()

        # Extract Summary
        data["summary"] = get_section_content("summary", ["experience", "education", "skills", "projects"])
        if not data["summary"]:
             # Fallback: take text after contact info until next section
             pass 

        # Extract Skills
        skills_text = get_section_content("skills", ["experience", "education", "projects", "summary"])
        if skills_text:
            # Split by common delimiters
            data["skills"] = [s.strip() for s in re.split(r'[,•\n]', skills_text) if s.strip() and len(s.strip()) > 2]

        # Extract Experience (Very basic)
        exp_text = get_section_content("experience", ["education", "skills", "projects", "summary"])
        if exp_text:
            # Create a single dummy entry with the raw text if we can't parse structure
            # In a real local parser, we'd need complex logic to identify dates/companies
            data["experience"] = [{
                "id": 1,
                "title": "Experience Details",
                "company": "See Description",
                "date": "",
                "location": "",
                "description": exp_text[:500] # Limit length
            }]

        # Extract Education (Very basic)
        edu_text = get_section_content("education", ["experience", "skills", "projects", "summary"])
        if edu_text:
             data["education"] = [{
                "id": 1,
                "degree": "Education Details",
                "school": "See Details",
                "date": "",
                "location": ""
            }]

        return data

local_analyzer = LocalATSAnalyzer()

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints ---

@app.post("/api/auth/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user.password)
        new_user = User(email=user.email, password_hash=hashed_password, full_name=user.full_name)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        print(f"Signup Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

@app.post("/api/auth/login", response_model=UserResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return db_user

@app.get("/api/content")
async def get_content():
    return {
        "hero": {
            "tagline": "#1 CAREER OPTIMIZER 2024",
            "headline": "Shape Your Future with Strategic Design",
            "description": "Take control of your career trajectory and define your path to success. Jobshapes uses AI-powered tools and expert insights to seamlessly audit, design, and optimize your professional profile and job search strategy for faster results."
        },
        "cards": [
            {
                "id": 1,
                "title": "Upload & Optimise",
                "description": "Enhance your existing CV instantly.",
                "icon": "upload",
                "link": "/upload-optimize"
            },
            {
                "id": 2,
                "title": "Start from Scratch",
                "description": "Build a professional resume in minutes.",
                "icon": "star",
                "link": "/start-scratch"
            },
            {
                "id": 3,
                "title": "AI JOB MATCH",
                "description": "instantly",
                "icon": "grid",
                "link": "/job-match"
            },
            {
                "id": 4,
                "title": "BROWSE SAMPLES",
                "description": "minutes",
                "icon": "target",
                "link": "/browse-samples"
            }
        ]
    }

@app.post("/api/upload-optimize")
async def upload_optimize(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        filename = file.filename.lower()
        text = ""

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(contents)
        else:
            return JSONResponse(status_code=400, content={"message": "Unsupported file type"})

        if not text.strip():
             return JSONResponse(status_code=400, content={"message": "Could not extract text from file. Please try another file."})

        # Use Gemini if available, else Local
        parsed_data = {}
        ats_score = 0
        suggestions = []
        
        if model:
            prompt = f"""
            You are an expert ATS (Applicant Tracking System) resume analyzer. 
            Analyze the following resume text and provide a JSON response with:
            1. 'atsScore': a number between 0 and 100.
            2. 'suggestions': a list of objects, each with 'id' (int), 'type' ('success', 'warning', 'error'), 'title' (string), and 'description' (string).
            3. 'parsedData': object containing:
               - 'fullName' (string)
               - 'email' (string)
               - 'phone' (string)
               - 'location' (string)
               - 'linkedin' (string)
               - 'summary' (string)
               - 'skills' (list of strings)
               - 'experience' (list of objects with title, company, date, location, description)
               - 'education' (list of objects with degree, school, date, location)
               - 'projects' (list of objects with title, description, link)

            Resume Text:
            {text[:10000]} 
            
            Return ONLY valid JSON. Do not include markdown formatting.
            """
            try:
                ai_response = model.generate_content(prompt)
                clean_response = ai_response.text.replace("```json", "").replace("```", "").strip()
                analysis_data = json.loads(clean_response)
                parsed_data = analysis_data.get("parsedData", {})
                ats_score = analysis_data.get("atsScore", 0)
                suggestions = analysis_data.get("suggestions", [])
            except Exception as e:
                print(f"Gemini Error, falling back to local: {e}")
                analysis_data = local_analyzer.analyze(text)
                parsed_data = local_analyzer.parse_resume(text)
                ats_score = analysis_data.get("atsScore", 0)
                suggestions = analysis_data.get("suggestions", [])
        else:
            analysis_data = local_analyzer.analyze(text)
            parsed_data = local_analyzer.parse_resume(text)
            ats_score = analysis_data.get("atsScore", 0)
            suggestions = analysis_data.get("suggestions", [])

        # Save to Database
        try:
            db_resume = Resume(
                filename=file.filename,
                full_name=parsed_data.get("fullName"),
                email=parsed_data.get("email"),
                phone=parsed_data.get("phone"),
                parsed_data=parsed_data,
                ats_score=ats_score,
                suggestions=suggestions,
                extracted_text=text
            )
            db.add(db_resume)
            db.commit()
            db.refresh(db_resume)
            print(f"Saved resume to DB with ID: {db_resume.id}")
        except Exception as db_e:
            print(f"Database Error: {db_e}")
            # Continue even if DB save fails, but log it

        return {
            "title": "Upload & Optimize",
            "subtitle": "Analysis Complete. Here is how your resume performs.",
            "atsScore": ats_score,
            "suggestions": suggestions,
            "parsedData": parsed_data
        }

    except Exception as e:
        print(f"Error: {e}")
        return JSONResponse(status_code=500, content={"message": f"Internal Server Error: {str(e)}"})

@app.post("/api/job-match")
async def job_match(job_description: str = Form(...), resume_text: str = Form(None)):
    # Note: In a real app, we would handle file upload here too or use session state.
    # For now, we will use the text if provided, or a generic placeholder if not, 
    # BUT since the user might not have uploaded a resume in this session context,
    # we will just analyze the JD keywords as a "Self-Check" if no resume is present.
    
    current_resume = resume_text if resume_text else ""
    
    if model:
        prompt = f"""
        Compare the following resume against the job description.
        Provide a JSON response with:
        1. 'matchScore': number 0-100.
        2. 'summary': string explaining the match.
        3. 'missingKeywords': list of strings.
        4. 'recommendations': list of strings.

        Job Description:
        {job_description[:5000]}

        Resume:
        {current_resume[:5000]}

        Return ONLY valid JSON.
        """
        try:
            ai_response = model.generate_content(prompt)
            clean_response = ai_response.text.replace("```json", "").replace("```", "").strip()
            match_data = json.loads(clean_response)
        except Exception:
            match_data = local_analyzer.match_job(current_resume, job_description)
    else:
        match_data = local_analyzer.match_job(current_resume, job_description)
    
    return match_data

class ContentAnalysisRequest(BaseModel):
    text: str

@app.post("/api/analyze-content")
async def analyze_content(request: ContentAnalysisRequest):
    text = request.text
    
    if not text.strip():
        return {"suggestions": []}

    if model:
        prompt = f"""
        You are an expert resume consultant. Analyze the following resume content and provide 3-5 specific, actionable suggestions to improve it.
        Focus on impact, clarity, and strong action verbs.
        
        Resume Content:
        {text[:5000]}
        
        Return a JSON object with a key 'suggestions', which is a list of strings.
        Example: {{ "suggestions": ["Use 'Orchestrated' instead of 'Led' in the first bullet point.", "Quantify your sales achievement by adding the percentage increase."] }}
        """
        try:
            ai_response = model.generate_content(prompt)
            clean_response = ai_response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_response)
            return data
        except Exception as e:
            print(f"AI Error: {e}")
            return {"suggestions": ["Could not generate AI suggestions at this time."]}
    else:
        # Simple heuristic fallback
        suggestions = []
        if len(text.split()) < 100:
            suggestions.append("Your resume seems a bit short. Try adding more details about your experience.")
        if "responsible for" in text.lower():
            suggestions.append("Avoid 'Responsible for'. Use strong action verbs like 'Managed', 'Developed', or 'Executed'.")
        return {"suggestions": suggestions}

class JobTitleQuery(BaseModel):
    query: str

@app.post("/api/classify-job-title")
async def classify_job_title(request: JobTitleQuery):
    query = request.query
    if not query:
        return {}
    
    if model:
        prompt = f"""
        You are a professional Job Title Normalization and Prediction Engine for a resume builder.

        Your responsibility:
        - Convert partial, shorthand, or informal job input into REAL, INDUSTRY-VALID_JOB_TITLES.
        - NEVER invent fake job titles.
        - NEVER create roles by blindly appending suffixes.
        - ONLY return job titles that exist in real-world hiring markets.

        You must support:
        - IT roles
        - Non-IT roles
        - Intern, Fresher, Junior, Senior roles

        Return ONLY valid JSON with this structure:
        {{
          "matched_titles": [],
          "best_job_title": "",
          "job_category": "",
          "confidence_score": 0.0
        }}

        Do NOT return explanations.
        
        Input: "{query}"
        """
        try:
            ai_response = model.generate_content(prompt)
            clean_response = ai_response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_response)
            return data
        except Exception as e:
            print(f"AI Error: {e}")
            return {"error": str(e)}
    else:
        # Fallback for local testing if no API key
        return {
            "matched_titles": [f"{query} Specialist", f"{query} Manager"],
            "best_job_title": query,
            "job_category": "General",
            "confidence_score": 0.5
        }

@app.get("/api/job-titles")
async def get_job_titles(query: str = "", db: Session = Depends(get_db)):
    if query:
        # Case-insensitive partial match
        titles = db.query(JobTitle).filter(JobTitle.title.ilike(f"%{query}%")).limit(20).all()
    else:
        # Return generic list if no query
        titles = db.query(JobTitle).limit(50).all()
    
    return [t.title for t in titles]

@app.get("/api/resumes")
async def get_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).all()
    return resumes

@app.post("/api/resumes/save")
async def save_resume(resume_data: ResumeSave, db: Session = Depends(get_db)):
    print(f"Received save request for user_id: {resume_data.user_id}")
    print(f"Data: {resume_data.dict()}")
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == resume_data.user_id).first()
        if not user:
            print(f"User {resume_data.user_id} not found in DB")
            raise HTTPException(status_code=404, detail="User not found")

        # Create new resume entry
        new_resume = Resume(
            user_id=resume_data.user_id,
            full_name=resume_data.fullName,
            email=resume_data.email,
            phone=resume_data.phone,
            parsed_data=resume_data.dict(), # Store the whole blob
            ats_score=0, # Recalculate if needed, or pass from frontend
            suggestions=[],
            extracted_text="" # No raw text for manually created/edited resumes
        )
        
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        print(f"Successfully saved resume ID: {new_resume.id}")
        
        return {"message": "Resume saved successfully", "id": new_resume.id}
    except Exception as e:
        print(f"Save Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
