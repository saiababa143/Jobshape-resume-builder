import { useState, useEffect } from 'react';
import { CloudUpload, CheckCircle, AlertTriangle, XCircle, ArrowRight, Hexagon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function UploadOptimize() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (selectedFile) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/api/upload-optimize', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            setData(result);
            setUploading(false);
        } catch (error) {
            console.error("Error:", error);
            setUploading(false);
            alert("Failed to analyze resume. Please try again.");
        }
    };

    const handleOptimizeClick = () => {
        if (data && data.parsedData) {
            navigate('/start-scratch', { state: { resumeData: data.parsedData } });
        } else {
            navigate('/start-scratch');
        }
    };

    return (
        <div className="container">
            <header className="header">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                    <Hexagon className="logo-icon" fill="currentColor" size={24} />
                    <span>jobshapes</span>
                </Link>
            </header>

            <div className="upload-page-header">
                <h1 className="page-title">{data ? data.title : "Upload & Optimize"}</h1>
                <p className="page-subtitle">{data ? data.subtitle : "Enhance your existing CV instantly. Our AI will analyze your resume and provide actionable suggestions to beat the ATS."}</p>
            </div>

            <div className="upload-grid">
                {/* Left Column: Upload Area */}
                <div className="upload-section">
                    <div className="upload-area">
                        <div className="upload-icon-circle">
                            <CloudUpload size={32} color="#6366f1" />
                        </div>
                        <h3>Drag & drop your resume here</h3>
                        <span className="or-divider">or</span>
                        <input
                            type="file"
                            id="resume-upload"
                            hidden
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="resume-upload" className="browse-btn">Browse Files</label>
                        <p className="upload-support-text">Supports: DOC, DOCX, PDF (max 5MB)</p>
                    </div>

                    {uploading && (
                        <div className="progress-card">
                            <div className="progress-header">
                                <h3>Analysis Progress</h3>
                            </div>
                            <div className="progress-status">
                                <span>Uploading & Analyzing...</span>
                                <span>Please wait</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: '50%', animation: 'pulse 2s infinite' }}></div>
                            </div>
                            <p className="progress-note">Hang tight! Our AI is working its magic.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Suggestions */}
                <div className="suggestions-section">
                    {data ? (
                        <div className="suggestions-card">
                            <div className="suggestions-header">
                                <h3>Analysis Results</h3>
                                <div className="ats-score-badge">ATS Score: {data.atsScore}%</div>
                            </div>

                            <div className="suggestions-list">
                                {data.suggestions.map(item => (
                                    <div key={item.id} className="suggestion-item">
                                        <div className="suggestion-icon">
                                            {item.type === 'success' && <CheckCircle size={20} className="text-green-500" color="#22c55e" />}
                                            {item.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" color="#eab308" />}
                                            {item.type === 'error' && <XCircle size={20} className="text-red-500" color="#ef4444" />}
                                        </div>
                                        <div className="suggestion-content">
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="optimize-btn" onClick={handleOptimizeClick}>
                                Optimize My Resume Now <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="suggestions-card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#94a3b8' }}>
                            <p>Upload a resume to see AI suggestions here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UploadOptimize;
