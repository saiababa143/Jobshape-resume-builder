import { useState, useEffect } from 'react';
import { CloudUpload, Star, LayoutGrid, Target, ArrowRight, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8000/api/content')
            .then(res => res.json())
            .then(data => {
                setContent(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching content:", err);
                setLoading(false);
            });
    }, []);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'upload': return <CloudUpload size={20} />;
            case 'star': return <Star size={20} />;
            case 'grid': return <LayoutGrid size={20} />;
            case 'target': return <Target size={20} />;
            default: return <Star size={20} />;
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!content) return <div className="container">Error loading content. Ensure backend is running.</div>;

    return (
        <div className="container">
            <header className="header">
                <Hexagon className="logo-icon" fill="currentColor" size={24} />
                <span>jobshapes</span>
            </header>

            <main className="hero-section">
                <div className="text-content">
                    <div className="tagline">{content.hero.tagline}</div>
                    <h1 className="headline">
                        {content.hero.headline.split('Strategic Design')[0]}
                        <span>Strategic Design</span>
                    </h1>
                    <p className="description">{content.hero.description}</p>

                    <div className="cards-grid">
                        {content.cards.map(card => (
                            <div
                                key={card.id}
                                className="card"
                                onClick={() => card.link && navigate(card.link)}
                            >
                                <div className="card-header">
                                    <div className="card-icon">
                                        {getIcon(card.icon)}
                                    </div>
                                    <ArrowRight className="arrow-icon" size={16} />
                                </div>
                                <div>
                                    <div className="card-title">{card.title}</div>
                                    <div className="card-desc">{card.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="visual-content">
                    <div className="graphic-container">
                        <div className="frame-1"></div>
                        <div className="frame-2"></div>
                        <div className="sphere"></div>
                        <div className="polyhedron"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;
