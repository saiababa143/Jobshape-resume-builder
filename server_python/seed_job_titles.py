import json
from sqlalchemy.orm import Session
from database import SessionLocal, JobTitle, init_db

# Comprehensive Job Titles Data
job_titles_data = {
    "IT/Software": [
        "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "DevOps Engineer", "Data Scientist", "Product Manager", "UI/UX Designer",
        "QA Engineer", "Tester", "Cloud Architect", "Mobile App Developer",
        "iOS Developer", "Android Developer", "System Administrator", "Database Administrator",
        "DBA", "Cybersecurity Analyst", "Machine Learning Engineer", "Site Reliability Engineer",
        "SRE", "Technical Lead", "Scrum Master", "Network Engineer", "Solutions Architect",
        "Business Analyst (IT)", "Game Developer", "Embedded Systems Engineer",
        "Blockchain Developer", "IT Support Specialist", "CTO", "Chief Technology Officer",
        "Engineering Manager", "Java Developer", "Python Developer"
    ],
    "Engineering (Non-Software)": [
        "Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Chemical Engineer",
        "Industrial Engineer", "Project Engineer", "Design Engineer", "Process Engineer",
        "Structural Engineer", "Manufacturing Engineer", "Quality Engineer", "Automation Engineer",
        "Environmental Engineer", "Aerospace Engineer", "Biomedical Engineer", "Construction Manager",
        "HVAC Engineer", "Piping Engineer", "Safety Engineer", "HSE Engineer",
        "Materials Engineer", "R&D Engineer", "Field Service Engineer", "Maintenance Engineer",
        "Petroleum Engineer", "Site Engineer", "Estimator", "CAD Technician"
    ],
    "Finance & Banking": [
        "Bank Clerk", "Relationship Manager", "Financial Analyst", "Loan Officer",
        "Insurance Advisor", "Investment Analyst", "Accountant", "Auditor"
    ],
    "Healthcare": [
        "Doctor", "Nurse", "Pharmacist", "Lab Technician", "Radiologist",
        "Medical Coder", "Hospital Administrator", "Physiotherapist", "Clinical Research Associate"
    ],
    "Education": [
        "School Teacher", "Lecturer", "Professor", "Tutor", "Academic Counselor",
        "Curriculum Developer", "Principal", "Teaching Assistant", "Online Course Instructor"
    ],
    "Government Jobs": [
        "Group A Officer", "Group B Officer", "Group C Officer", "SSC Officer",
        "Railway Staff", "Defense Officer", "Police Officer", "PSU Employee"
    ],
    "Manufacturing & Factory": [
        "Production Engineer", "Quality Control Inspector", "Machine Operator",
        "Plant Supervisor", "Maintenance Technician", "Safety Officer", "Industrial Technician"
    ],
    "Media & Entertainment": [
        "Anchor", "Journalist", "Video Editor", "Graphic Designer", "Content Writer",
        "Actor", "Director", "Photographer", "Sound Engineer"
    ],
    "Hospitality": [
        "Hotel Manager", "Front Office Executive", "Chef", "Housekeeping Staff",
        "Event Manager", "Travel Consultant", "Guest Relations Officer"
    ],
    "Construction & Real Estate": [
        "Architect", "Quantity Surveyor", "Property Dealer", "Real Estate Consultant"
    ],
    "Sales (Field Level)": [
        "Sales Executive", "Marketing Executive", "Business Development Executive",
        "Field Sales Officer", "Area Sales Manager", "Channel Partner Manager"
    ],
    "E-Commerce & Retail": [
        "Store Manager", "Inventory Manager", "Delivery Executive", "Customer Support Executive",
        "Operations Manager", "Digital Marketing Executive", "Retail Sales Associate"
    ],
    "Aviation & Marine": [
        "Pilot", "Cabin Crew", "Aircraft Maintenance Engineer", "Airport Ground Staff",
        "Marine Engineer", "Deck Officer", "Port Operations Manager"
    ],
    "Agriculture": [
        "Agriculture Officer", "Farm Manager", "Soil Scientist", "Horticulturist",
        "Fisheries Officer", "Dairy Technologist", "Agri Business Manager"
    ],
    "Legal": [
        "Advocate", "Lawyer", "Legal Advisor", "Legal Assistant", "Public Prosecutor",
        "Corporate Lawyer", "Legal Analyst", "Notary"
    ],
    "Non-IT General Jobs": [
        "Marketing Manager", "Sales Representative", "Human Resources Manager", "HR Manager",
        "Project Manager", "Copywriter", "Social Media Manager", "Business Development Manager",
        "Recruiter", "Talent Acquisition Specialist", "Office Manager", "Executive Assistant",
        "Digital Marketing Specialist", "Supply Chain Manager", "Logistics Coordinator",
        "Procurement Specialist", "Educator", "Healthcare Professional", "Legal Counsel",
        "Attorney", "Real Estate Agent", "Public Relations Specialist", "Data Entry Clerk"
    ]
}

def seed_job_titles():
    db = SessionLocal()
    try:
        # Ensure tables exist
        init_db()
        
        added_count = 0
        skipped_count = 0
        
        print(f"Starting seed process for {len(job_titles_data)} categories...")
        
        for category, titles in job_titles_data.items():
            for title in titles:
                # Case-insensitive check to avoid duplicates like "Software Engineer" vs "software engineer"
                existing = db.query(JobTitle).filter(JobTitle.title.ilike(title)).first()
                
                if not existing:
                    new_job = JobTitle(title=title, category=category)
                    db.add(new_job)
                    added_count += 1
                else:
                    skipped_count += 1
        
        db.commit()
        print(f"Seeding Complete.")
        print(f"Added: {added_count} new titles.")
        print(f"Skipped: {skipped_count} duplicates.")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_job_titles()
