import { useState, useEffect, useRef } from 'react';
import {
    User, Briefcase, GraduationCap, Wrench, Folder, Plus,
    Download, Share2, Undo, Redo, ChevronDown, Hexagon, Trash2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { seniorProductManagerData } from './mockData';

function StartScratch() {
    const [activeSection, setActiveSection] = useState('contact');
    const [activeTab, setActiveTab] = useState('design');
    const location = useLocation();
    const resumeRef = useRef(null);

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
            setResumeData(prev => ({
                ...prev,
                fullName: parsed.fullName || prev.fullName,
                email: parsed.email || prev.email,
                phone: parsed.phone || prev.phone,
                summary: parsed.summary || prev.summary,
                experience: parsed.experience && parsed.experience.length > 0 ? parsed.experience.map((e, i) => ({ ...e, id: i })) : prev.experience,
                education: parsed.education && parsed.education.length > 0 ? parsed.education.map((e, i) => ({ ...e, id: i })) : prev.education
            }));
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

    const handleDownload = () => {
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

    const renderLeftSidebarContent = () => {
        switch (activeSection) {
            case 'contact':
                return (
                    <div className="form-section">
                        <h3>Contact Information</h3>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={resumeData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={resumeData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input type="text" value={resumeData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" value={resumeData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>LinkedIn / Website</label>
                            <input type="text" value={resumeData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Professional Summary</label>
                            <textarea rows={5} value={resumeData.summary} onChange={(e) => handleInputChange('summary', e.target.value)} />
                        </div>
                    </div>
                );
            case 'experience':
                return (
                    <div className="form-section">
                        <h3>Work Experience</h3>
                        {resumeData.experience.map(exp => (
                            <div key={exp.id} className="form-card">
                                <div className="form-card-header">
                                    <input type="text" className="title-input" value={exp.title} onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)} placeholder="Job Title" />
                                    <button onClick={() => removeExperience(exp.id)} className="delete-btn"><Trash2 size={16} /></button>
                                </div>
                                <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} placeholder="Company" />
                                <input type="text" value={exp.date} onChange={(e) => handleExperienceChange(exp.id, 'date', e.target.value)} placeholder="Date Range" />
                                <textarea rows={3} value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} placeholder="Description" />
                            </div>
                        ))}
                        <button className="add-btn" onClick={addExperience}><Plus size={16} /> Add Position</button>
                    </div>
                );
            case 'education':
                return (
                    <div className="form-section">
                        <h3>Education</h3>
                        {resumeData.education.map(edu => (
                            <div key={edu.id} className="form-card">
                                <div className="form-card-header">
                                    <input type="text" className="title-input" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)} placeholder="Degree" />
                                    <button onClick={() => removeEducation(edu.id)} className="delete-btn"><Trash2 size={16} /></button>
                                </div>
                                <input type="text" value={edu.school} onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)} placeholder="School" />
                                <input type="text" value={edu.date} onChange={(e) => handleEducationChange(edu.id, 'date', e.target.value)} placeholder="Graduation Date" />
                            </div>
                        ))}
                        <button className="add-btn" onClick={addEducation}><Plus size={16} /> Add Education</button>
                    </div>
                );
            case 'skills':
                return (
                    <div className="form-section">
                        <h3>Skills</h3>
                        <div className="skills-input-list">
                            {resumeData.skills.map((skill, index) => (
                                <div key={index} className="skill-input-row">
                                    <input type="text" value={skill} onChange={(e) => handleSkillChange(index, e.target.value)} />
                                    <button onClick={() => removeSkill(index)} className="delete-btn"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                        <button className="add-btn" onClick={addSkill}><Plus size={16} /> Add Skill</button>
                    </div>
                );
            default:
                return <div>Select a section to edit</div>;
        }
    };

    return (
        <div className="builder-container">
            {/* Header */}
            <header className="builder-header">
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
                    <button className="download-btn" onClick={handleDownload}>
                        <Download size={16} style={{ marginRight: '0.5rem' }} /> Download PDF
                    </button>
                    <button className="icon-btn" onClick={() => setResumeData(seniorProductManagerData)} title="Load Mock Data">
                        <Folder size={18} />
                    </button>
                    <button className="icon-btn"><Share2 size={18} /></button>
                </div>
            </header>

            <div className="builder-body">
                {/* Left Sidebar (Editor) */}
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
                            <User size={18} /> Contact & Summary
                        </button>
                        <button className={`nav-item ${activeSection === 'experience' ? 'active' : ''}`} onClick={() => setActiveSection('experience')}>
                            <Briefcase size={18} /> Experience
                        </button>
                        <button className={`nav-item ${activeSection === 'education' ? 'active' : ''}`} onClick={() => setActiveSection('education')}>
                            <GraduationCap size={18} /> Education
                        </button>
                        <button className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`} onClick={() => setActiveSection('skills')}>
                            <Wrench size={18} /> Skills
                        </button>
                    </nav>

                    <div className="editor-content">
                        {renderLeftSidebarContent()}
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="resume-preview-area">
                    <div
                        className={`resume-paper ${designConfig.template}`}
                        ref={resumeRef}
                        style={{
                            fontFamily: designConfig.font,
                            lineHeight: designConfig.spacing,
                            fontSize: `${designConfig.fontSize}px`,
                            color: '#1e293b',
                            '--template-color': designConfig.color
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
                </main>

                {/* Right Sidebar (Design) */}
                <aside className="right-sidebar">
                    <div className="sidebar-tabs">
                        <button className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>Design</button>
                        <button className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>AI Assistant</button>
                    </div>

                    <div className="sidebar-content">
                        {activeTab === 'design' && (
                            <>
                                <div className="control-group">
                                    <label>Color Palette</label>
                                    <div className="color-options">
                                        {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#1f2937'].map(color => (
                                            <button
                                                key={color}
                                                className={`color-btn ${designConfig.color === color ? 'selected' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setDesignConfig({ ...designConfig, color })}
                                            ></button>
                                        ))}
                                    </div>
                                </div>

                                <div className="control-group">
                                    <label>Font Style</label>
                                    <div className="font-inputs">
                                        <div className="input-wrapper">
                                            <div className="custom-select">
                                                <select
                                                    value={designConfig.font}
                                                    onChange={(e) => setDesignConfig({ ...designConfig, font: e.target.value })}
                                                    style={{ width: '100%', border: 'none', background: 'transparent' }}
                                                >
                                                    <option value="Inter">Inter</option>
                                                    <option value="Arial">Arial</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Courier New">Courier</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="control-group">
                                    <label>Spacing</label>
                                    <div className="spacing-control">
                                        <input
                                            type="range"
                                            min="1"
                                            max="2"
                                            step="0.1"
                                            value={designConfig.spacing}
                                            onChange={(e) => setDesignConfig({ ...designConfig, spacing: e.target.value })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'ai' && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>
                                <p>AI suggestions coming soon!</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default StartScratch;
