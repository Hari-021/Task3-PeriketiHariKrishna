import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Workspace panel */}
        <main className="flex-1 ml-64 p-8 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
