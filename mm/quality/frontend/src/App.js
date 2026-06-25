// quality/frontend/src/App.js
// UPDATED - New routes for new pages

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QualitySidebar from './components/Sidebar';

// Pages
import QCDashboardPage from './pages/QCDashboardPage';
import QCLotsPage from './pages/QCLotsPage';
import QCLotDetailPage from './pages/QCLotDetailPage';
import QCResultsPage from './pages/QCResultsPage';
import QCDefectsPage from './pages/QCDefectsPage';
import CAPAPage from './pages/CAPAPage';
import InProcessInspectionsPage from './pages/InProcessInspectionsPage';
import FinalInspectionsPage from './pages/FinalInspectionsPage';
import InspectionPlansViewPage from './pages/InspectionPlansViewPage';

const App = () => {
  const styles = {
    appContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      paddingbottom: '2px',
    },
    mainContent: {
      flex: 1,
      padding: '5px',
      overflow: 'auto'
    }
  };

  return (
    <Router>
      <div style={styles.appContainer}>
        <QualitySidebar />
        <div style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/qc" replace />} />
            <Route path="/qc" element={<QCDashboardPage />} />
            <Route path="/qc/lots" element={<QCLotsPage />} />
            <Route path="/qc/lots/:id" element={<QCLotDetailPage />} />
            <Route path="/qc/in-process" element={<InProcessInspectionsPage />} />
            <Route path="/qc/final" element={<FinalInspectionsPage />} />
            <Route path="/qc/results" element={<QCResultsPage />} />
            <Route path="/qc/defects" element={<QCDefectsPage />} />
            <Route path="/qc/capa" element={<CAPAPage />} />
            <Route path="/qc/inspection-plans" element={<InspectionPlansViewPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;