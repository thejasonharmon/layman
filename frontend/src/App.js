import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppBarComponent from './components/AppBarComponent';
import Footer from './components/Footer'; // Make sure to import the Footer component
import HomePage from './pages/HomePage';
import LegislationPage from './pages/LegislationPage';

function App() {
  return (
    <Router>
      <AppBarComponent />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/introduced" element={<LegislationPage statusType="introduced" />} />
        <Route path="/in-discussion" element={<LegislationPage statusType="in_discussion" />} />
        <Route path="/submitted" element={<LegislationPage statusType="submitted" />} />
        <Route path="/passed" element={<LegislationPage statusType="passed" />} />
        <Route path="/failed" element={<LegislationPage statusType="failed" />} />
        <Route path="/vetoed" element={<LegislationPage statusType="vetoed" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
