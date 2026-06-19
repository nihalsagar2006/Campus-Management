import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, fullName, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left side - Branding & Visuals */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>

        <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '24px', display: 'inline-block', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
            <Calendar size={64} color="white" />
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Campus Events</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6 }}>
            Discover, register, and experience the best moments happening around your campus.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{ 
        flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', 
        background: 'var(--bg-app)', padding: '2rem' 
      }}>
        <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {isRegister ? 'Join your campus community today.' : 'Please enter your details to sign in.'}
          </p>
          
          {error && (
            <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    placeholder="John Doe"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="student@campus.edu"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button 
              style={{ background: 'transparent', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', padding: 0 }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
