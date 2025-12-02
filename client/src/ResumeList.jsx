import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, FileText, Calendar, Star, Trash2, Eye } from 'lucide-react';
import './App.css';

function ResumeList() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/resumes')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch resumes');
                }
                return res.json();
            })
            .then(data => {
                setResumes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching resumes:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="page-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <Link to="/" className="logo-link">
                        <Hexagon className="logo-icon" fill="currentColor" size={24} />
                        <span>JobShapes</span>
                    </Link>
                </div>
            </header>

            <main className="main-content">
                <div className="content-wrapper">
                    <h1 className="page-title">Saved Resumes</h1>
                    <p className="page-subtitle">View and manage all resumes stored in the database.</p>

                    {loading && <div className="loading-state">Loading resumes...</div>}
                    {error && <div className="error-state">Error: {error}</div>}

                    {!loading && !error && resumes.length === 0 && (
                        <div className="empty-state">
                            <p>No resumes found in the database.</p>
                            <Link to="/upload-optimize" className="primary-btn">Upload a Resume</Link>
                        </div>
                    )}

                    <div className="resume-grid">
                        {resumes.map(resume => (
                            <div key={resume.id} className="resume-card">
                                <div className="card-header">
                                    <div className="icon-wrapper">
                                        <FileText size={24} />
                                    </div>
                                    <div className="resume-info">
                                        <h3>{resume.full_name || "Unknown Candidate"}</h3>
                                        <span className="resume-email">{resume.email || "No Email"}</span>
                                    </div>
                                </div>

                                <div className="card-stats">
                                    <div className="stat-item">
                                        <Star size={16} className="stat-icon" />
                                        <span>ATS Score: <strong>{resume.ats_score || 0}</strong></span>
                                    </div>
                                    <div className="stat-item">
                                        <Calendar size={16} className="stat-icon" />
                                        <span>{new Date(resume.upload_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {/* In a real app, we would have a view page. For now, just showing data. */}
                                    <button className="action-btn view-btn" onClick={() => alert(JSON.stringify(resume.parsed_data, null, 2))}>
                                        <Eye size={16} /> View Data
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`
                .page-container {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }
                .app-header {
                    background: white;
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                }
                .logo-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: #0f172a;
                    font-weight: 700;
                    font-size: 1.25rem;
                }
                .logo-icon {
                    color: #4f46e5;
                }
                .main-content {
                    padding: 3rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }
                .page-subtitle {
                    color: #64748b;
                    margin-bottom: 2rem;
                }
                .resume-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .resume-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .resume-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .card-header {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .icon-wrapper {
                    background: #e0e7ff;
                    color: #4f46e5;
                    padding: 0.75rem;
                    border-radius: 8px;
                    height: fit-content;
                }
                .resume-info h3 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1.1rem;
                    color: #1e293b;
                }
                .resume-email {
                    font-size: 0.875rem;
                    color: #64748b;
                }
                .card-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #475569;
                }
                .stat-icon {
                    color: #94a3b8;
                }
                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: background 0.2s;
                }
                .view-btn {
                    background: #f1f5f9;
                    color: #334155;
                }
                .view-btn:hover {
                    background: #e2e8f0;
                }
                .primary-btn {
                    display: inline-block;
                    background: #4f46e5;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

export default ResumeList;
