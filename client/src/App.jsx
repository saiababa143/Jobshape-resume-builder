import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import UploadOptimize from './UploadOptimize';
import StartScratch from './StartScratch';
import JobMatch from './JobMatch';
import BrowseSamples from './BrowseSamples';
import ChooseTemplate from './ChooseTemplate';
import ResumeList from './ResumeList';
import './App.css';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload-optimize" element={<UploadOptimize />} />
          <Route path="/start-scratch" element={<StartScratch />} />
          <Route path="/job-match" element={<JobMatch />} />
          <Route path="/browse-samples" element={<BrowseSamples />} />
          <Route path="/choose-template" element={<ChooseTemplate />} />
          <Route path="/resumes" element={<ResumeList />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
