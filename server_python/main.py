import os
import json
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from pypdf import PdfReader
from docx import Document
import io
from dotenv import load_dotenv
from collections import Counter

load_dotenv()

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
            "summary": "",
            "experience": [],
            "education": []
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

        # Extract Summary (heuristic: text between "Summary" and next section)
        lower_text = text.lower()
        try:
            summary_start = lower_text.find("summary")
            if summary_start != -1:
                # Find next section
                next_indices = [lower_text.find(sec) for sec in self.essential_sections if sec != "summary" and lower_text.find(sec) > summary_start]
                summary_end = min([i for i in next_indices if i != -1]) if next_indices else len(text)
                # Extract text, skipping the word "Summary"
                raw_summary = text[summary_start:summary_end]
                # Clean up "Summary" label
                data["summary"] = re.sub(r'^summary[:\s-]*', '', raw_summary, flags=re.IGNORECASE).strip()
        except:
            pass
            
        return data

local_analyzer = LocalATSAnalyzer()

# --- Endpoints ---

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
async def upload_optimize(file: UploadFile = File(...)):
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
        if model:
            prompt = f"""
            You are an expert ATS (Applicant Tracking System) resume analyzer. 
            Analyze the following resume text and provide a JSON response with:
            1. 'atsScore': a number between 0 and 100.
            2. 'suggestions': a list of objects, each with 'id' (int), 'type' ('success', 'warning', 'error'), 'title' (string), and 'description' (string).
            3. 'parsedData': object containing 'fullName', 'email', 'phone', 'summary' (string), 'experience' (list of objects with title, company, date, description), 'education' (list of objects).

            Resume Text:
            {text[:10000]} 
            
            Return ONLY valid JSON. Do not include markdown formatting.
            """
            try:
                ai_response = model.generate_content(prompt)
                clean_response = ai_response.text.replace("```json", "").replace("```", "").strip()
                analysis_data = json.loads(clean_response)
                parsed_data = analysis_data.get("parsedData", {})
            except Exception as e:
                print(f"Gemini Error, falling back to local: {e}")
                analysis_data = local_analyzer.analyze(text)
                parsed_data = local_analyzer.parse_resume(text)
        else:
            analysis_data = local_analyzer.analyze(text)
            parsed_data = local_analyzer.parse_resume(text)

        return {
            "title": "Upload & Optimize",
            "subtitle": "Analysis Complete. Here is how your resume performs.",
            "atsScore": analysis_data.get("atsScore", 0),
            "suggestions": analysis_data.get("suggestions", []),
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
