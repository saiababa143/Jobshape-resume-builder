# How to Restart the Application

When you come back to this project, follow these steps to get everything running again.

### 1. Open Your Code Editor (VS Code)
Open the folder: `c:\Users\saiba\OneDrive\Desktop\resume builder webpage`

### 2. Start the Backend (Server)
1. Open a new terminal.
2. Run these commands:
   ```bash
   cd server_python
   python main.py
   ```
   *You should see "Uvicorn running on http://0.0.0.0:8000"*

### 3. Start the Frontend (Website)
1. Open a **second** terminal (click the `+` icon in VS Code terminal).
2. Run these commands:
   ```bash
   cd client
   npm run dev
   ```
   *You should see "Local: http://localhost:5174"*

### 4. Open in Browser
Go to [http://localhost:5174](http://localhost:5174) in your web browser.

---
**Note:** You do NOT need to run `npm install` or `pip install` again unless you delete the project folders.
