import { useState } from 'react';
import { Search, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

function BrowseSamples() {
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Marketing', 'Engineering', 'Design', 'Student'];

    const samples = [
        { id: 1, title: 'Modern Professional', category: 'General', desc: 'Ideal for tech and corporate roles.', color: '#d1d5db' },
        { id: 2, title: 'Creative Column', category: 'Design', desc: 'Perfect for designers and artists.', color: '#1e3a8a' },
        { id: 3, title: 'Simple & Clean', category: 'General', desc: 'A classic choice for any industry.', color: '#d4d4d8' },
        { id: 4, title: 'Academic CV', category: 'Student', desc: 'Structured for researchers and scholars.', color: '#fca5a5' },
        { id: 5, title: 'Executive', category: 'Business', desc: 'For senior leaders and managers.', color: '#374151' },
        { id: 6, title: 'Entry-Level', category: 'Student', desc: 'Great for students and new grads.', color: '#f3f4f6' },
        { id: 7, title: 'Infographic', category: 'Creative', desc: 'Visually represent your skills.', color: '#0f766e' },
        { id: 8, title: 'Technical', category: 'Engineering', desc: 'For developers and engineers.', color: '#dcfce7' },
    ];

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
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Search by role or industry..." className="search-input" />
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

                <div className="samples-grid">
                    {samples.map(sample => (
                        <div key={sample.id} className="sample-card">
                            <div className="sample-preview" style={{ backgroundColor: '#f3f4f6' }}>
                                <div className="mock-doc" style={{ borderTop: `4px solid ${sample.color}` }}>
                                    <div className="mock-line title"></div>
                                    <div className="mock-line"></div>
                                    <div className="mock-line"></div>
                                    <div className="mock-line short"></div>
                                    <br />
                                    <div className="mock-line"></div>
                                    <div className="mock-line"></div>
                                </div>
                            </div>
                            <div className="sample-info">
                                <h3 className="sample-title">{sample.title}</h3>
                                <p className="sample-desc">{sample.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="load-more-container">
                    <button className="load-more-btn">Load More</button>
                </div>
            </div>
        </div>
    );
}

export default BrowseSamples;
