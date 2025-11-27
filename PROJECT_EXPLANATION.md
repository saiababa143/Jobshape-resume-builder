# JobShapes Project Guide for Beginners

Welcome to the **JobShapes** project! This guide is designed to help you understand how this website works, what technologies are used, and how the different parts interact.

## 1. High-Level Architecture
This project follows a **Client-Server Architecture**. Think of it like a restaurant:
*   **The Client (Frontend)** is the dining area where customers (users) sit, look at the menu, and place orders.
*   **The Server (Backend)** is the kitchen where the chefs (code) prepare the food (data) based on the orders.

In this project:
*   **Frontend**: Built with **React** (runs in the browser).
*   **Backend**: Built with **Python FastAPI** (runs on your computer/server).

---

## 2. The Frontend (Client)
Located in the `client/` folder. This is what the user sees and interacts with.

### **Key Technologies:**
*   **React**: A JavaScript library for building user interfaces. It lets us build reusable "components" (like Lego blocks).
*   **Vite**: A tool that helps run and build the React app very quickly.
*   **CSS**: Used for styling (colors, fonts, layout). We use a single `App.css` file for simplicity.
*   **React Router**: Handles navigation between pages (e.g., going from Home to "Upload & Optimize") without reloading the page.

### **Important Files:**
*   `client/src/main.jsx`: The entry point. It tells React to take over the `root` element in the HTML file.
*   `client/src/App.jsx`: The main component that defines the **Routes** (which page to show for which URL).
*   `client/src/Home.jsx`: The Landing Page. It fetches data from the backend to display the hero section and cards.
*   `client/src/UploadOptimize.jsx`: The page where users upload resumes. It handles file selection and sending the file to the backend.
*   `client/src/StartScratch.jsx`: The Resume Builder. It allows users to edit forms and see a live preview of their resume.
*   `client/src/JobMatch.jsx`: The AI Job Match page.
*   `client/src/App.css`: Contains all the styles for the website.

---

## 3. The Backend (Server)
Located in the `server_python/` folder. This handles the logic and data processing.

### **Key Technologies:**
*   **Python**: The programming language used.
*   **FastAPI**: A modern web framework for building APIs with Python. It's fast and easy to use.
*   **Uvicorn**: A server implementation that runs the FastAPI app.
*   **Google Gemini (AI)**: Used to analyze resumes and generate suggestions.
*   **PyPDF & Python-Docx**: Libraries to read text from PDF and Word documents.

### **Important Files:**
*   `server_python/main.py`: The heart of the backend. It defines the **API Endpoints** (URLs that the frontend can talk to).
    *   `GET /api/content`: Returns the text for the landing page.
    *   `POST /api/upload-optimize`: Receives a resume file, extracts text, analyzes it (using AI or local logic), and returns a score and suggestions.
    *   `POST /api/job-match`: Compares a resume against a job description.

---

## 4. How They Talk to Each Other (The Flow)

1.  **User Action**: You click "Upload Resume" on the frontend (`UploadOptimize.jsx`).
2.  **Request**: The frontend sends a `POST` request to `http://localhost:8000/api/upload-optimize` with the file data.
3.  **Processing**:
    *   The Python backend (`main.py`) receives the file.
    *   It reads the text from the PDF/DOCX.
    *   It sends the text to the AI (or uses local logic) to calculate a score.
4.  **Response**: The backend sends a JSON response back (e.g., `{ "atsScore": 85, "suggestions": [...] }`).
5.  **Update UI**: The frontend receives this data and updates the screen to show the score and suggestions.

---

## 5. Key Features Explained

### **A. Resume Builder (`StartScratch.jsx`)**
*   **State Management**: We use `useState` to keep track of the resume data (Name, Experience, etc.). When you type in a box, it updates this "State".
*   **Live Preview**: The right side of the screen reads from this "State" to display the resume. Since React updates automatically when State changes, you see your typing appear instantly.
*   **PDF Download**: We use a library called `html2pdf.js`. It takes a "screenshot" of the resume preview HTML and converts it into a PDF file.

### **B. AI Integration**
*   The backend tries to use **Google Gemini** (a powerful AI model).
*   If you don't have an API Key set up, it falls back to a **"Local Heuristic"** mode. This is a smart piece of code I wrote that manually checks for things like:
    *   Is the resume too short?
    *   Does it have an email address?
    *   Does it use strong action verbs (like "Led", "Created")?

---

## 6. How to Run the Project

You need **two** terminals open (like having two command prompts).

**Terminal 1 (Backend):**
```bash
cd "c:/Users/saiba/OneDrive/Desktop/resume builder webpage/server_python"
python main.py
```
*This starts the server on port 8000.*

**Terminal 2 (Frontend):**
```bash
cd "c:/Users/saiba/OneDrive/Desktop/resume builder webpage/client"
npm run dev
```
*This starts the React app on port 5174 (usually).*

---

## 7. Glossary for Freshers
*   **API (Application Programming Interface)**: A set of rules that allows the frontend to talk to the backend.
*   **Endpoint**: A specific URL on the server (like `/api/content`) that performs a specific function.
*   **JSON (JavaScript Object Notation)**: A format for sending data. It looks like this: `{"name": "John", "age": 25}`.
*   **Component**: A reusable piece of UI in React (e.g., a Button, a Card, a Header).
*   **State**: Data that changes over time in your app (like the text in a form input).

---

I hope this helps you understand the codebase! Feel free to ask if you have questions about specific files.
