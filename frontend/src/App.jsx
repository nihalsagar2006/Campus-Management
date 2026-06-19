import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Calendar, LayoutDashboard, Ticket, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import MyTickets from './pages/MyTickets';
import EventHub from './pages/EventHub';
import JoinTeam from './pages/JoinTeam';
import AnnouncementHub from './components/AnnouncementHub';
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Navbar = ({ toggleTheme, isDark }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null; // Don't show navbar on login page

  return (
    <nav className="glass-panel" style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 2rem', margin: '1rem auto', maxWidth: '1200px', 
      position: 'sticky', top: '1rem', zIndex: 100
    }}>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '12px', color: 'white', display: 'flex' }}>
          <Calendar size={24} />
        </div>
        <h1 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>CampusEvents</h1>
      </Link>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontWeight: '500' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <Calendar size={18} /> Events
        </Link>
        <Link to="/tickets" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <Ticket size={18} /> My Tickets
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'var(--bg-app)', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
          <UserIcon size={16} className="gradient-text" />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.full_name.split(' ')[0]}</span>
        </div>

        <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)', borderColor: 'transparent' }} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <AnnouncementHub />
      <Navbar toggleTheme={toggleTheme} isDark={isDark} />
      <div style={{ paddingBottom: '4rem' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events/:id" 
            element={
              <ProtectedRoute>
                <EventHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register/join/:inviteCode" 
            element={
              <ProtectedRoute>
                <JoinTeam />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
      <Chatbot />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
