import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNavbar from './components/layout/TopNavbar';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientPrediction from './pages/PatientPrediction';
import FLSimulation from './pages/FLSimulation';
import SystemMonitor from './pages/SystemMonitor';
import PatientRecords from './pages/PatientRecords';
import ConsentManagement from './pages/ConsentManagement';
import NodeRegistry from './pages/NodeRegistry';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Login onLogin={() => setIsAuthenticated(true)} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <TopNavbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DoctorDashboard />} />
          <Route path="/prediction" element={<PatientPrediction />} />
          <Route path="/records" element={<PatientRecords />} />
          <Route path="/consent" element={<ConsentManagement />} />
          <Route path="/nodes" element={<NodeRegistry />} />
          <Route path="/fl-simulation" element={<FLSimulation />} />
          <Route path="/monitor" element={<SystemMonitor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
