import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import UploadOptimize from './UploadOptimize';
import StartScratch from './StartScratch';
import JobMatch from './JobMatch';
import BrowseSamples from './BrowseSamples';
import ChooseTemplate from './ChooseTemplate';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload-optimize" element={<UploadOptimize />} />
        <Route path="/start-scratch" element={<StartScratch />} />
        <Route path="/job-match" element={<JobMatch />} />
        <Route path="/browse-samples" element={<BrowseSamples />} />
        <Route path="/choose-template" element={<ChooseTemplate />} />
      </Routes>
    </Router>
  );
}

export default App;
