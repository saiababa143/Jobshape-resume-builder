try:
    import fastapi
    print("fastapi ok")
    import uvicorn
    print("uvicorn ok")
    import google.generativeai
    print("google.generativeai ok")
    import pypdf
    print("pypdf ok")
    import docx
    print("docx ok")
    import dotenv
    print("dotenv ok")
except Exception as e:
    print(f"Error: {e}")
