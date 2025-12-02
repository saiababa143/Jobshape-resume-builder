try:
    import fastapi
    print("fastapi ok")
    import uvicorn
    print("uvicorn ok")
    import sqlalchemy
    print("sqlalchemy ok")
    import google.generativeai
    print("genai ok")
    import pypdf
    print("pypdf ok")
    import docx
    print("docx ok")
except Exception as e:
    print(f"Error: {e}")
