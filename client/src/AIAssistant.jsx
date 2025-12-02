import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function AIAssistant({ resumeData }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);

        // Construct a text representation of the resume for analysis
        const resumeText = `
            Name: ${resumeData.fullName}
            Summary: ${resumeData.summary}
            Experience:
            ${resumeData.experience.map(exp => `${exp.title} at ${exp.company}: ${exp.description}`).join('\n')}
            Education:
            ${resumeData.education.map(edu => `${edu.degree} at ${edu.school}`).join('\n')}
            Skills: ${resumeData.skills.join(', ')}
        `;

        try {
            const response = await fetch('http://localhost:8000/api/analyze-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: resumeText }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze content');
            }

            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (err) {
            console.error("Analysis error:", err);
            setError("Could not generate suggestions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-assistant-container">
            <div className="ai-header">
                <Sparkles className="ai-icon" size={20} />
                <h3>AI Resume Assistant</h3>
            </div>

            <p className="ai-description">
                Get personalized suggestions to improve your resume's impact and ATS compatibility.
            </p>

            <button
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="spin" size={16} /> Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} /> Analyze My Resume
                    </>
                )}
            </button>

            {error && (
                <div className="ai-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                        <CheckCircle2 className="suggestion-icon" size={16} />
                        <p>{suggestion}</p>
                    </div>
                ))}
            </div>

            {suggestions.length === 0 && !loading && !error && (
                <div className="empty-suggestions">
                    <p>Click "Analyze" to get started.</p>
                </div>
            )}

            <style>{`
                .ai-assistant-container {
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .ai-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    color: #4f46e5;
                }
                .ai-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }
                .ai-description {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                .analyze-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    margin-bottom: 1.5rem;
                }
                .analyze-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .ai-error {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: #fef2f2;
                    color: #ef4444;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }
                .suggestions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .suggestion-item {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .suggestion-icon {
                    color: #10b981;
                    flex-shrink: 0;
                    margin-top: 0.1rem;
                }
                .suggestion-item p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #334155;
                    line-height: 1.5;
                }
                .empty-suggestions {
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    padding: 2rem 0;
                }
            `}</style>
        </div>
    );
}

export default AIAssistant;
