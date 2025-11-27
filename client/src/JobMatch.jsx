import { useState } from 'react';
import { Sparkles, Hexagon, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

function JobMatch() {
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('job_description', jobDescription);
        // In a real scenario, we'd append the resume file or ID here too.

        try {
            const response = await fetch('http://localhost:8000/api/job-match', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
            alert("Analysis failed. Please try again.");
        }
    };

    return (
        <div className="container">
            <header className="header">
                <Link to="/" className="logo-link">
                    <Hexagon className="logo-icon" fill="currentColor" size={24} />
                    <span>JobShapes</span>
                </Link>
            </header>

            <div className="job-match-container">
                <div className="job-match-header">
                    <div className="icon-circle-purple">
                        <Sparkles size={32} color="#8b5cf6" />
                    </div>
                    <h1 className="page-title">AI Job Match</h1>
                    <p className="page-subtitle">
                        Paste a job description to see how well your resume matches and get AI-powered suggestions to improve it.
                    </p>
                </div>

                <div className="job-input-card">
                    <label className="input-label">Paste Job Description or Keywords</label>
                    <textarea
                        className="job-textarea"
                        placeholder="e.g., Senior Frontend Developer with experience in React, TypeScript, and Tailwind CSS..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    ></textarea>

                    <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                        <Sparkles size={18} /> {loading ? "Analyzing..." : "Analyze Job Match"}
                    </button>
                </div>

                {result ? (
                    <div className="results-card" style={{ textAlign: 'left', background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Match Score</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: result.matchScore > 70 ? '#22c55e' : '#eab308' }}>
                                {result.matchScore}%
                            </div>
                        </div>

                        <p style={{ marginBottom: '1.5rem', color: '#475569' }}>{result.summary}</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Missing Keywords</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {result.missingKeywords.map((kw, i) => (
                                    <span key={i} style={{ background: '#fee2e2', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Recommendations</h4>
                            <ul style={{ paddingLeft: '1.25rem', color: '#475569' }}>
                                {result.recommendations.map((rec, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="results-placeholder">
                        <h3>Your Results Will Appear Here</h3>
                        <p>Once you provide a job description, we'll analyze it against your resume and show you a detailed breakdown of your match score and tailoring suggestions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobMatch;
