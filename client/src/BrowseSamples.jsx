import { useState, useEffect } from 'react';
import { Search, Hexagon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

function BrowseSamples() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(8);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    const filters = ['All', 'Marketing', 'Engineering', 'Design', 'Student', 'Business', 'Creative'];

    const allSamples = [
        { id: 1, title: 'Professional', category: 'Business', desc: 'Clean and standard layout.', color: '#0f172a', layout: 'professional', role: 'Senior Accountant' },
        { id: 2, title: 'Standout', category: 'General', desc: 'Bold name and clear columns.', color: '#3b82f6', layout: 'standout', role: 'Administrative Assistant' },
        { id: 3, title: 'Elegant', category: 'Design', desc: 'Dark sidebar for a modern look.', color: '#1e293b', layout: 'elegant', role: 'Product Manager' },
        { id: 4, title: 'Official', category: 'Business', desc: 'Traditional with a strong header.', color: '#1e40af', layout: 'official', role: 'Front End Developer' },
        { id: 5, title: 'Executive', category: 'Business', desc: 'For senior leaders and managers.', color: '#10b981', layout: 'standout', role: 'Chief Executive Officer' },
        { id: 6, title: 'Entry-Level', category: 'Student', desc: 'Great for students and new grads.', color: '#f59e0b', layout: 'simple', role: 'Marketing Intern' },
        { id: 7, title: 'Infographic', category: 'Creative', desc: 'Visually represent your skills.', color: '#06b6d4', layout: 'creative', role: 'UX/UI Designer' },
        { id: 8, title: 'Technical', category: 'Engineering', desc: 'For developers and engineers.', color: '#14b8a6', layout: 'technical', role: 'Senior Software Engineer' },
        { id: 9, title: 'Minimalist', category: 'Design', desc: 'Less is more. Clean and spacious.', color: '#78716c', layout: 'simple', role: 'Architect' },
        { id: 10, title: 'Corporate Blue', category: 'Business', desc: 'Traditional corporate style.', color: '#1e40af', layout: 'modern', role: 'Financial Analyst' },
        { id: 11, title: 'Startup Ready', category: 'Engineering', desc: 'Modern and agile look.', color: '#f97316', layout: 'column', role: 'Full Stack Developer' },
        { id: 12, title: 'Artistic', category: 'Creative', desc: 'Bold colors and unique layout.', color: '#db2777', layout: 'creative', role: 'Art Director' },
        { id: 13, title: 'Growth Marketer', category: 'Marketing', desc: 'Data-driven template for growth roles.', color: '#ec4899', layout: 'modern', role: 'Growth Marketing Manager' },
    ];

    const filteredSamples = allSamples.filter(sample => {
        const matchesFilter = activeFilter === 'All' || sample.category === activeFilter || (activeFilter === 'General' && sample.category === 'Business');
        const matchesSearch = sample.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sample.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const visibleSamples = filteredSamples.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 4);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1) {
                fetchSuggestions(searchQuery);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchSuggestions = async (query) => {
        setIsLoading(true);
        try {
            console.log("Fetching suggestions for:", query);
            console.log("Fetching suggestions for:", query);
            // Use the new database-backed endpoint
            const response = await fetch(`http://localhost:8000/api/job-titles?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                console.log("API Response:", data);
                // The new API returns a simple list of strings
                setSuggestions(data);
                setShowSuggestions(true);
            } else {
                console.error("API Error:", response.status);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
    };

    console.log("Rendering BrowseSamples v3");

    return (
        <div className="container">
            <header className="header">
                <Link to="/" className="logo-link">
                    <Hexagon className="logo-icon" fill="currentColor" size={24} />
                    <span>JobShapes</span>
                </Link>
            </header>

            <div className="samples-container">
                <div className="samples-header">
                    <h1 className="page-title">Resume Samples</h1>
                    <p className="page-subtitle">
                        Explore professionally designed resumes for inspiration. Find the perfect template for your industry and experience level.
                    </p>
                </div>

                <div className="filter-bar">
                    <div className="search-wrapper" style={{ position: 'relative', zIndex: 1000 }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Type a job title (e.g. 'react')..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        {isLoading && (
                            <div className="suggestions-dropdown" style={{ padding: '10px', color: '#666' }}>
                                Loading suggestions...
                            </div>
                        )}
                        {!isLoading && showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {suggestions.map((s, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(s)}
                                    >
                                        <span className="suggestion-text">{s}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="filter-tags">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                className={`filter-tag ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {visibleSamples.length > 0 ? (
                    <div className="samples-grid">
                        {visibleSamples.map(sample => (
                            <Link
                                to="/start-scratch"
                                key={sample.id}
                                className="sample-card-link"
                                state={{
                                    recommendedTemplate: {
                                        layout: sample.layout,
                                        color: sample.color,
                                        title: sample.title
                                    },
                                    resumeData: location.state?.resumeData // Pass through the resume data
                                }}
                            >
                                <div className="sample-card">
                                    <div className="sample-preview">
                                        <div className={`mock-doc ${sample.layout}`} style={{ '--accent-color': sample.color }}>
                                            <div className="mock-header">
                                                <div className="mock-name">Jordan Alex</div>
                                                <div className="mock-contact">jordan@example.com</div>
                                            </div>
                                            <div className="mock-body">
                                                <div className="mock-main">
                                                    <div className="mock-section-title">Summary</div>
                                                    <div className="mock-text-sm" style={{ marginBottom: '6px', lineHeight: '1.3' }}>
                                                        Results-oriented professional with 10+ years of experience driving product vision and strategy. Proven track record of increasing revenue and user engagement.
                                                    </div>

                                                    <div className="mock-section-title">Experience</div>
                                                    <div className="mock-job-title">{sample.role}</div>
                                                    <div className="mock-company">Tech Solutions • 2020-Present</div>
                                                    <div className="mock-text-sm" style={{ marginBottom: '2px' }}>Spearheaded product development lifecycle from conception to launch.</div>
                                                    <div className="mock-text-sm">• Led cross-functional teams</div>
                                                    <div className="mock-text-sm">• Increased revenue by 20%</div>
                                                    <div className="mock-text-sm">• Improved user satisfaction</div>

                                                    <div className="mock-job-title" style={{ marginTop: '3px' }}>Senior Analyst</div>
                                                    <div className="mock-company">Digital Corp • 2018-2020</div>
                                                    <div className="mock-text-sm" style={{ marginBottom: '2px' }}>Conducted market research to identify key growth opportunities.</div>
                                                    <div className="mock-text-sm">• Data analysis & reporting</div>
                                                    <div className="mock-text-sm">• Strategic planning</div>
                                                    <div className="mock-text-sm">• Market research</div>

                                                    <div className="mock-section-title" style={{ marginTop: '4px' }}>Education</div>
                                                    <div className="mock-text-sm">MBA, Business</div>
                                                    <div className="mock-text-sm">BS, Computer Science</div>
                                                </div>
                                                <div className="mock-sidebar">
                                                    <div className="mock-section-title">Skills</div>
                                                    <div className="mock-text-sm">Strategy</div>
                                                    <div className="mock-text-sm">Leadership</div>
                                                    <div className="mock-text-sm">Analytics</div>
                                                    <div className="mock-text-sm">Product Mgmt</div>
                                                    <div className="mock-text-sm">Agile/Scrum</div>
                                                    <div className="mock-text-sm">Data Analysis</div>
                                                    <div className="mock-text-sm">Roadmapping</div>
                                                    <div className="mock-text-sm">Team Building</div>

                                                    <div className="mock-section-title" style={{ marginTop: '8px' }}>Languages</div>
                                                    <div className="mock-text-sm">English</div>
                                                    <div className="mock-text-sm">Spanish</div>
                                                    <div className="mock-text-sm">French</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sample-info">
                                        <h3 className="sample-title">{sample.title}</h3>
                                        <p className="sample-desc">{sample.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <p>No templates found matching your criteria.</p>
                        <button className="clear-filter-btn" onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}>Clear Filters</button>
                    </div>
                )}

                {visibleCount < filteredSamples.length && (
                    <div className="load-more-container">
                        <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>
                    </div>
                )}
            </div>

            <style>{`
                .suggestions-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0 0 8px 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .suggestion-item {
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    color: #1e293b;
                    font-size: 0.95rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .suggestion-item:last-child {
                    border-bottom: none;
                }
                .suggestion-item:hover {
                    background-color: #f8fafc;
                    color: #4f46e5;
                }
                .suggestion-item strong {
                    font-weight: 700;
                    color: #0f172a;
                }
            `}</style>
        </div>
    );
}

export default BrowseSamples;
