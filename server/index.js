const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/content', (req, res) => {
    res.json({
        hero: {
            tagline: "#1 CAREER OPTIMIZER 2024",
            headline: "Shape Your Future with Strategic Design",
            description: "Take control of your career trajectory and define your path to success. Jobshapes uses AI-powered tools and expert insights to seamlessly audit, design, and optimize your professional profile and job search strategy for faster results."
        },
        cards: [
            {
                id: 1,
                title: "Upload & Optimise",
                description: "Enhance your existing CV instantly.",
                icon: "upload",
                link: "/upload-optimize"
            },
            {
                id: 2,
                title: "Start from Scratch",
                description: "Build a professional resume in minutes.",
                icon: "star",
                link: "/start-scratch"
            },
            {
                id: 3,
                title: "AI JOB MATCH",
                description: "instantly",
                icon: "grid",
                link: "/job-match"
            },
            {
                id: 4,
                title: "BROWSE SAMPLES",
                description: "minutes",
                icon: "target",
                link: "/browse-samples"
            }
        ]
    });
});

app.get('/api/upload-optimize', (req, res) => {
    res.json({
        title: "Upload & Optimize",
        subtitle: "Enhance your existing CV instantly. Our AI will analyze your resume and provide actionable suggestions to beat the ATS.",
        atsScore: 88,
        suggestions: [
            {
                id: 1,
                type: "success",
                title: "Strong Action Verbs",
                description: "Your resume uses powerful action verbs effectively."
            },
            {
                id: 2,
                type: "warning",
                title: "Quantify Achievements",
                description: "Consider adding more metrics to 3 bullet points to showcase impact."
            },
            {
                id: 3,
                type: "error",
                title: "Keyword Optimization",
                description: "Missing keywords for \"Project Management\" roles. Let's add them!"
            },
            {
                id: 4,
                type: "success",
                title: "Formatting & Readability",
                description: "Clean, professional layout that's easy for recruiters to scan."
            }
        ]
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
