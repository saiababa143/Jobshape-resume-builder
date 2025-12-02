import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Heart, Sun } from 'lucide-react';
import './App.css';

function ChooseTemplate() {
    const navigate = useNavigate();

    const templates = [
        {
            id: 'beam',
            name: 'Beam',
            description: 'Clean and professional for corporate roles.',
            color: '#fca5a5', // Peach/Pink accent
            features: ['Clean Layout', 'Professional', 'ATS Friendly']
        },
        {
            id: 'elegant',
            name: 'Elegant',
            description: 'Stand out with a bold and unique design.',
            color: '#1e293b', // Dark accent
            features: ['Unique Design', 'Bold Colors', 'Portfolio Focus']
        },
        {
            id: 'smart',
            name: 'Smart',
            description: 'Minimalist design that focuses on content.',
            color: '#3b82f6', // Blue accent
            features: ['Minimalist', 'Easy to Read', 'Classic Style']
        }
    ];

    const handleSelectTemplate = (templateId) => {
        navigate('/start-scratch', { state: { template: templateId } });
    };

    return (
        <div className="choose-template-container">
            <div className="choose-header">
                <div className="title-container">
                    <div className="sunburst-wrapper">
                        <Sun className="sunburst-icon" size={64} color="#fbbf24" fill="#fbbf24" />
                    </div>
                    <h1 className="choose-title">
                        Choose a <span className="highlight">template</span>
                    </h1>
                </div>
                <p className="choose-subtitle">Don't worry, you can always change it later.</p>
            </div>

            <div className="templates-showcase">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="template-card-wrapper"
                        onClick={() => handleSelectTemplate(template.id)}
                    >
                        <div className="template-card-preview">
                            <div className={`mini-resume ${template.id}`}>
                                <div className="mini-header">
                                    <div className="mini-name">SWARNA LATHA A</div>
                                    <div className="mini-role">Customer Relation Officer</div>
                                </div>
                                <div className="mini-body">
                                    <div className="mini-col-left">
                                        <div className="mini-section">
                                            <div className="mini-title">CONTACT INFO</div>
                                            <div className="mini-line"></div>
                                            <div className="mini-line"></div>
                                        </div>
                                        <div className="mini-section">
                                            <div className="mini-title">EDUCATION</div>
                                            <div className="mini-line"></div>
                                            <div className="mini-line"></div>
                                        </div>
                                        <div className="mini-section">
                                            <div className="mini-title">SKILLS</div>
                                            <div className="mini-row">
                                                <div className="mini-pill"></div>
                                                <div className="mini-pill"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mini-col-right">
                                        <div className="mini-section">
                                            <div className="mini-title">CAREER OBJECTIVE</div>
                                            <div className="mini-line"></div>
                                            <div className="mini-line"></div>
                                            <div className="mini-line short"></div>
                                        </div>
                                        <div className="mini-section">
                                            <div className="mini-title">WORK EXPERIENCE</div>
                                            <div className="mini-line"></div>
                                            <div className="mini-line"></div>
                                            <div className="mini-line"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="template-badge">
                                <Heart size={16} fill="#ef4444" color="#ef4444" />
                                <span>{template.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChooseTemplate;
