import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppBarComponent from './components/AppBarComponent';
import LegislationPage from './pages/LegislationPage'; // Only import the single page component

function App() {
  return (
    <Router>
      <AppBarComponent />
      <Routes>
        <Route path="/" element={<LegislationPage statusType="introduced" />} />
        <Route path="/in-discussion" element={<LegislationPage statusType="in_discussion" />} />
        <Route path="/submitted" element={<LegislationPage statusType="submitted" />} />
        <Route path="/passed" element={<LegislationPage statusType="passed" />} />
        <Route path="/failed" element={<LegislationPage statusType="failed" />} />
        <Route path="/vetoed" element={<LegislationPage statusType="vetoed" />} />
      </Routes>
    </Router>
  );
}

export default App;
