import { useState, useEffect, useRef } from 'react';
import {
    User, Briefcase, GraduationCap, Wrench, Folder, Plus, FileText,
    Download, Share2, Undo, Redo, ChevronDown, Hexagon, Trash2, Save, Eye
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { seniorProductManagerData } from './mockData';
import AIAssistant from './AIAssistant';
import AuthModal from './AuthModal';

function StartScratch() {
    const [activeSection, setActiveSection] = useState('contact');
    const [activeTab, setActiveTab] = useState('design');
    const location = useLocation();
    const resumeRef = useRef(null);

    // --- Auth State ---
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [pendingAction, setPendingAction] = useState(null); // 'download' or 'save'
    const [isSaving, setIsSaving] = useState(false);

    // --- State for Resume Content ---
    const [resumeData, setResumeData] = useState({
        fullName: "John Doe",
        email: "john.doe@email.com",
        phone: "(123) 456-7890",
        location: "New York, NY",
        linkedin: "linkedin.com/in/johndoe",
        summary: "A highly motivated and creative Senior Product Designer with over 8 years of experience in creating user-centered digital products. Proven track record of leading design teams, conducting user research, and delivering innovative solutions that drive business growth and enhance user satisfaction.",
        experience: [
            {
                id: 1,
                title: "Senior Product Designer",
                date: "Jan 2020 - Present",
                company: "TechSolutions Inc.",
                location: "San Francisco, CA",
                description: "Led the redesign of the company's flagship product, increasing user engagement by 40%.\nCollaborated with cross-functional teams to define product vision and strategy.\nConducted user research and usability testing to inform design decisions.\nMentored junior designers and established design system best practices."
            },
            {
                id: 2,
                title: "Product Designer",
                date: "Jun 2016 - Dec 2019",
                company: "Creative Digital Agency",
                location: "New York, NY",
                description: "Designed and launched mobile applications for Fortune 500 clients.\nCreated wireframes, prototypes, and high-fidelity mockups using Figma and Adobe XD.\nImproved user satisfaction scores by 35% through iterative design improvements.\nCollaborated with developers to ensure design implementation quality."
            }
        ],
        education: [
            {
                id: 1,
                degree: "Bachelor of Science in Graphic Design",
                date: "May 2016",
                school: "University of Design",
                location: "Artsfield"
            },
            {
                id: 2,
                degree: "Certificate in UX Design",
                date: "Dec 2018",
                school: "Design Institute",
                location: "Online"
            }
        ],
        skills: ["Figma", "Adobe XD", "React", "HTML/CSS", "User Research", "Prototyping", "Sketch", "InVision", "Agile Methodology", "Design Systems", "Wireframing", "A/B Testing"],
        projects: []
    });

    // --- State for Design Configuration ---
    const [designConfig, setDesignConfig] = useState({
        template: 'modern', // modern, classic, creative
        color: '#4f46e5',
        font: 'Inter',
        spacing: 1.5,
        fontSize: 14
    });

    // --- Load Data from Optimize Page or Recommended Template ---
    useEffect(() => {
        if (location.state && location.state.resumeData) {
            const parsed = location.state.resumeData;
            // Strictly use parsed data, falling back to empty strings if fields are missing
            // This ensures no "John Doe" mock data leaks in if the user uploaded a file
            setResumeData({
                fullName: parsed.fullName || "",
                email: parsed.email || "",
                phone: parsed.phone || "",
                location: parsed.location || "",
                linkedin: parsed.linkedin || "",
                summary: parsed.summary || "",
                experience: parsed.experience && parsed.experience.length > 0 ? parsed.experience.map((e, i) => ({ ...e, id: i })) : [],
                education: parsed.education && parsed.education.length > 0 ? parsed.education.map((e, i) => ({ ...e, id: i })) : [],
                skills: parsed.skills || [],
                projects: parsed.projects || []
            });
        }


        // Apply recommended template if coming from Browse Samples
        if (location.state && location.state.recommendedTemplate) {
            const { layout, color } = location.state.recommendedTemplate;
            setDesignConfig(prev => ({
                ...prev,
                template: layout,
                color: color
            }));
        }
    }, [location.state]);

    // --- Handlers ---

    const handleInputChange = (field, value) => {
        setResumeData(prev => ({ ...prev, [field]: value }));
    };

    const handleExperienceChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now(), title: "Job Title", company: "Company", date: "Date", description: "Description" }]
        }));
    };

    const removeExperience = (id) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    // Similar handlers for Education...
    const handleEducationChange = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now(), degree: "Degree", school: "School", date: "Date" }]
        }));
    };

    const removeEducation = (id) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    const handleSkillChange = (index, value) => {
        const newSkills = [...resumeData.skills];
        newSkills[index] = value;
        setResumeData(prev => ({ ...prev, skills: newSkills }));
    };

    const addSkill = () => {
        setResumeData(prev => ({ ...prev, skills: [...prev.skills, "New Skill"] }));
    };

    const removeSkill = (index) => {
        setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    };

    const handleDownloadClick = () => {
        if (!isLoggedIn) {
            setPendingAction('download');
            setIsAuthModalOpen(true);
        } else {
            performDownload();
        }
    };

    const handleSaveClick = () => {
        if (!isLoggedIn) {
            setPendingAction('save');
            setIsAuthModalOpen(true);
        } else {
            performSave();
        }
    };

    const handleLoginSuccess = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
        setIsAuthModalOpen(false); // Close modal explicitly

        // Execute pending action
        setTimeout(() => {
            if (pendingAction === 'download') {
                performDownload();
            } else if (pendingAction === 'save') {
                performSave();
            }
            setPendingAction(null);
        }, 500);
    };

    const performSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:8000/api/resumes/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    ...resumeData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save');
            }

            alert('Resume saved successfully!');
        } catch (error) {
            console.error("Save error:", error);
            alert(`Failed to save resume: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const performDownload = () => {
        const element = resumeRef.current;
        const opt = {
            margin: 0,
            filename: `${resumeData.fullName.replace(' ', '_')}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // --- Render Helpers ---

    const renderEditorContent = () => {
        switch (activeSection) {
            case 'contact':
                return (
                    <div className="editor-form-container">
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Let's start with your header</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Include your full name and multiple ways for employers to reach you.</p>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={resumeData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="form-input" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={resumeData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" value={resumeData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="form-input" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Location (City, Country)</label>
                            <input type="text" value={resumeData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="form-input" />
                        </div>

                        <div className="form-group">
                            <label>LinkedIn / Website</label>
                            <input type="text" value={resumeData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} className="form-input" />
                        </div>
                    </div>
                );
            case 'summary':
                return (
                    <div className="editor-form-container">
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Professional Summary</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Write a short summary of your experience and skills.</p>
                        <div className="form-group">
                            <textarea
                                rows={8}
                                value={resumeData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                className="form-input"
                                placeholder="e.g. A highly motivated..."
                            />
                        </div>
                    </div>
                );
            case 'experience':
                return (
                    <div className="editor-form-container">
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Work Experience</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Add your previous job positions.</p>
                        {resumeData.experience.map(exp => (
                            <div key={exp.id} className="form-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                                <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0 }}>{exp.title || 'New Position'}</h4>
                                    <button onClick={() => removeExperience(exp.id)} className="delete-btn" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input type="text" value={exp.title} onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Company</label>
                                    <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Date Range</label>
                                    <input type="text" value={exp.date} onChange={(e) => handleExperienceChange(exp.id, 'date', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows={4} value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button className="add-btn" onClick={addExperience} style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', color: '#6366f1', background: 'white', cursor: 'pointer' }}>
                            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Add Position
                        </button>
                    </div>
                );
            case 'education':
                return (
                    <div className="editor-form-container">
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Education</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Add your educational background.</p>
                        {resumeData.education.map(edu => (
                            <div key={edu.id} className="form-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                                <div className="form-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0 }}>{edu.degree || 'New Education'}</h4>
                                    <button onClick={() => removeEducation(edu.id)} className="delete-btn" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                                <div className="form-group">
                                    <label>Degree</label>
                                    <input type="text" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>School</label>
                                    <input type="text" value={edu.school} onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Graduation Date</label>
                                    <input type="text" value={edu.date} onChange={(e) => handleEducationChange(edu.id, 'date', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button className="add-btn" onClick={addEducation} style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', color: '#6366f1', background: 'white', cursor: 'pointer' }}>
                            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Add Education
                        </button>
                    </div>
                );
            case 'skills':
                return (
                    <div className="editor-form-container">
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Skills</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>List your technical and soft skills.</p>
                        <div className="skills-input-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            {resumeData.skills.map((skill, index) => (
                                <div key={index} className="skill-input-row" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" value={skill} onChange={(e) => handleSkillChange(index, e.target.value)} style={{ flex: 1 }} />
                                    <button onClick={() => removeSkill(index)} className="delete-btn" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button className="add-btn" onClick={addSkill} style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', color: '#6366f1', background: 'white', cursor: 'pointer' }}>
                            <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Add Skill
                        </button>
                    </div>
                );
            default:
                return <div>Select a section to edit</div>;
        }
    };

    return (
        <div className="builder-container" >
            {/* Header */}
            < header className="builder-header" >
                <div className="header-left">
                    <Link to="/" className="logo-link">
                        <Hexagon className="logo-icon" fill="currentColor" size={24} />
                        <span>JobShapes</span>
                    </Link>
                </div>
                <div className="header-center">
                    <span className="save-status">Auto-saving...</span>
                </div>
                <div className="header-right">
                    {isLoggedIn && (
                        <div className="user-greeting" style={{ marginRight: '1rem', fontSize: '0.9rem', color: '#475569' }}>
                            Hi, {user.full_name}
                        </div>
                    )}
                    <button className="download-btn" onClick={handleSaveClick} style={{ marginRight: '0.5rem', backgroundColor: '#10b981' }} disabled={isSaving}>
                        <Save size={16} style={{ marginRight: '0.5rem' }} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="download-btn" onClick={() => window.print()} style={{ marginRight: '0.5rem', backgroundColor: '#3b82f6' }}>
                        <Eye size={16} style={{ marginRight: '0.5rem' }} /> Preview
                    </button>
                    <button className="download-btn" onClick={handleDownloadClick}>
                        <Download size={16} style={{ marginRight: '0.5rem' }} /> Download PDF
                    </button>
                    <button className="icon-btn" onClick={() => setResumeData(seniorProductManagerData)} title="Load Mock Data">
                        <Folder size={18} />
                    </button>
                    <button className="icon-btn"><Share2 size={18} /></button>
                </div>
            </header >

            <div className="builder-body">
                {/* Left Sidebar (Navigation & Design) */}
                <aside className="left-sidebar">
                    <div className="user-profile-summary">
                        <div className="user-avatar" style={{ backgroundColor: designConfig.color }}>
                            {resumeData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{resumeData.fullName}</div>
                            <div className="user-status">Editing Resume</div>
                        </div>
                    </div>

                    <nav className="builder-nav">
                        <button className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setActiveSection('contact')}>
                            <User size={18} /> Contact
                        </button>
                        <button className={`nav-item ${activeSection === 'experience' ? 'active' : ''}`} onClick={() => setActiveSection('experience')}>
                            <Briefcase size={18} /> Work Experience
                        </button>
                        <button className={`nav-item ${activeSection === 'education' ? 'active' : ''}`} onClick={() => setActiveSection('education')}>
                            <GraduationCap size={18} /> Education
                        </button>
                        <button className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`} onClick={() => setActiveSection('skills')}>
                            <Wrench size={18} /> Skills
                        </button>
                        <button className={`nav-item ${activeSection === 'summary' ? 'active' : ''}`} onClick={() => setActiveSection('summary')}>
                            <FileText size={18} /> Summary
                        </button>
                    </nav>

                    <div className="sidebar-divider" style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>

                    {/* Design Controls */}
                    <div className="design-controls">
                        <div className="control-group">
                            <div className="sidebar-section-title">Color Palette</div>
                            <div className="color-palette">
                                {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#1f2937'].map(color => (
                                    <button
                                        key={color}
                                        className={`color-circle ${designConfig.color === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setDesignConfig({ ...designConfig, color })}
                                    ></button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <div className="sidebar-section-title">Font Style</div>
                            <select
                                className="font-select"
                                value={designConfig.font}
                                onChange={(e) => setDesignConfig({ ...designConfig, font: e.target.value })}
                            >
                                {[
                                    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway", "Poppins", "Merriweather", "Playfair Display"
                                ].map(font => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <div className="sidebar-section-title">Spacing</div>
                            <input
                                type="range"
                                min="1"
                                max="2"
                                step="0.1"
                                value={designConfig.spacing}
                                onChange={(e) => setDesignConfig({ ...designConfig, spacing: e.target.value })}
                                className="spacing-slider"
                            />
                        </div>
                    </div>
                </aside>

                {/* Middle Editor Area */}
                <main className="middle-editor">
                    {renderEditorContent()}
                </main>

                {/* Right Preview Area */}
                <aside className="right-preview">
                    <div
                        className={`resume-paper ${designConfig.template}`}
                        ref={resumeRef}
                        style={{
                            fontFamily: designConfig.font,
                            lineHeight: designConfig.spacing,
                            fontSize: `${designConfig.fontSize}px`,
                            color: '#1e293b',
                            '--template-color': designConfig.color,
                            transform: 'scale(0.85)',
                            transformOrigin: 'top center'
                        }}
                    >
                        {/* Resume Header */}
                        <div className="resume-header" style={{ borderBottom: designConfig.template === 'modern' ? `2px solid ${designConfig.color}` : 'none', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            <h1 className="resume-name" style={{ color: designConfig.color }}>{resumeData.fullName}</h1>
                            <div className="resume-contact-line">
                                {resumeData.email} | {resumeData.phone} | {resumeData.location}
                            </div>
                            {resumeData.linkedin && <div className="resume-contact-line">{resumeData.linkedin}</div>}
                        </div>

                        {/* Summary */}
                        {resumeData.summary && (
                            <div className="resume-section section-summary">
                                <h2 className="resume-section-title" style={{ color: designConfig.color, borderBottomColor: designConfig.color }}>Professional Summary</h2>
                                <p className="resume-text">{resumeData.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        <div className="resume-section section-experience">
                            <h2 className="resume-section-title" style={{ color: designConfig.color, borderBottomColor: designConfig.color }}>Work Experience</h2>
                            {resumeData.experience.map((exp) => (
                                <div key={exp.id} className="resume-item">
                                    <div className="item-header">
                                        <h3 className="item-title">{exp.title}</h3>
                                        <span className="item-date">{exp.date}</span>
                                    </div>
                                    <div className="item-subtitle" style={{ fontWeight: 600 }}>{exp.company}</div>
                                    <p className="resume-text" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Education */}
                        <div className="resume-section section-education">
                            <h2 className="resume-section-title" style={{ color: designConfig.color, borderBottomColor: designConfig.color }}>Education</h2>
                            {resumeData.education.map((edu) => (
                                <div key={edu.id} className="resume-item">
                                    <div className="item-header">
                                        <h3 className="item-title">{edu.degree}</h3>
                                        <span className="item-date">{edu.date}</span>
                                    </div>
                                    <div className="item-subtitle">{edu.school}</div>
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div className="resume-section section-skills">
                            <h2 className="resume-section-title" style={{ color: designConfig.color, borderBottomColor: designConfig.color }}>Skills</h2>
                            <div className="skills-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {resumeData.skills.map((skill, i) => (
                                    <span key={i} style={{
                                        background: '#f1f5f9',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontSize: '0.9em',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div >
    );
}

export default StartScratch;
