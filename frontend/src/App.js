import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppBarComponent from './components/AppBarComponent';
import IntroducedPage from './pages/IntroducedPage';
import InDiscussionPage from './pages/InDiscussionPage';
import SubmittedPage from './pages/SubmittedPage';
import PassedPage from './pages/PassedPage';
import FailedPage from './pages/FailedPage';
import VetoedPage from './pages/VetoedPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <AppBarComponent />
      <Routes>
        <Route path="/" element={<IntroducedPage />} />
        <Route path="/in-discussion" element={<InDiscussionPage />} />
        <Route path="/submitted" element={<SubmittedPage />} />
        <Route path="/passed" element={<PassedPage />} />
        <Route path="/failed" element={<FailedPage />} />
        <Route path="/vetoed" element={<VetoedPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
