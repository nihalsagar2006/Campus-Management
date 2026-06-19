import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, Calendar, Clock, MapPin, Sparkles, Code, Gamepad2, 
  Trophy, Award, ArrowRight, ShieldCheck, Mail, Phone, User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JoinTeam = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [inviteDetails, setInviteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinedReg, setJoinedReg] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    srn: '',
    branch: '',
    collegeName: '',
    section: '',
    inGameUid: '',
    inGameName: '',
    inGamePfp: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/registrations/by-invite/${inviteCode}`);
        setInviteDetails(res.data);
      } catch (err) {
        alert(err.response?.data?.detail || 'Invalid or expired invitation link');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInviteDetails();
  }, [inviteCode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const playSuccessChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, time, duration, vol = 0.15) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.25); // C5
      playTone(659.25, now + 0.08, 0.25); // E5
      playTone(783.99, now + 0.16, 0.4); // G5
    } catch (e) {
      console.warn("Chime failed", e);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in or register an account before joining the team.');
      navigate('/login');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Filter out empty strings to send clean extra_details
      const details = {};
      Object.keys(formData).forEach(key => {
        if (formData[key]) details[key] = formData[key];
      });
      
      const res = await api.post(`/registrations/join/${inviteCode}`, {
        extra_details: JSON.stringify(details)
      });
      
      playSuccessChime();
      setJoinedReg(res.data);
      setJoined(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to join the team');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        Loading invitation details...
      </div>
    );
  }

  // Get Custom Icon based on category
  const getEventIcon = () => {
    switch (inviteDetails.event_category) {
      case 'Esports': return <Gamepad2 size={36} color="white" />;
      case 'Sports': return <Trophy size={36} color="white" />;
      case 'Business': return <Sparkles size={36} color="white" />;
      default: return <Code size={36} color="white" />;
    }
  };

  const categoryColor = () => {
    switch (inviteDetails.event_category) {
      case 'Esports': return '#f97316'; // orange
      case 'Sports': return '#0ea5e9'; // sky
      case 'Business': return '#eab308'; // gold
      default: return '#8b5cf6'; // purple
    }
  };

  if (joined) {
    return (
      <div className="animate-slide-up" style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderTop: `6px solid ${categoryColor()}` }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--success)',
            borderRadius: '50%',
            marginBottom: '1.5rem'
          }}>
            <ShieldCheck size={48} />
          </div>
          
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Successfully Joined!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            You have successfully joined the team <strong style={{ color: 'var(--text-primary)' }}>{inviteDetails.team_name}</strong> for the event <strong style={{ color: 'var(--text-primary)' }}>{inviteDetails.event_title}</strong>.
          </p>
          
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px dashed var(--border-color)', textAlign: 'left' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Verification Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Player: <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name}</strong></div>
              <div>Verification ID: <code style={{ color: 'var(--primary)', fontWeight: 700 }}>{joinedReg?.qr_code_data}</code></div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                * Team registration will be finalized once all {inviteDetails.team_size} players join. Check progress in your dashboard.
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to={`/events/${inviteDetails.event_id}`} className="btn btn-primary" style={{ flex: 1 }}>
              Go to Event Hub <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      {/* Invite Info Card */}
      <div className="glass-panel" style={{ 
        padding: '2rem', 
        marginBottom: '2rem', 
        borderLeft: `5px solid ${categoryColor()}`,
        background: `linear-gradient(135deg, ${categoryColor()}15, var(--bg-glass))`
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{
            background: `linear-gradient(135deg, ${categoryColor()}, var(--primary))`,
            padding: '0.75rem',
            borderRadius: '16px',
            display: 'flex'
          }}>
            {getEventIcon()}
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: categoryColor(), letterSpacing: '0.05em' }}>
              Invitation to Join
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.1rem 0' }}>{inviteDetails.team_name}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Event: <strong>{inviteDetails.event_title}</strong> (Leader: {inviteDetails.leader_name})
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: '1.25rem', 
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Team Size: {inviteDetails.team_size} players</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{inviteDetails.slots_left} slots remaining</span>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', fontWeight: 700 }}>Complete Your Profile Details</h3>
        
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>University SRN</label>
              <input 
                type="text" 
                name="srn" 
                required 
                placeholder="e.g. PES1UG20CS000"
                value={formData.srn} 
                onChange={handleInputChange} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch / Department</label>
              <input 
                type="text" 
                name="branch" 
                required 
                placeholder="e.g. CSE, ECE, ISE"
                value={formData.branch} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          {/* Hackathon/Exhibition specific college/section */}
          {inviteDetails.event_category === 'Technology' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>College / Institution Name</label>
              <input 
                type="text" 
                name="collegeName" 
                required 
                placeholder="e.g. PES University"
                value={formData.collegeName} 
                onChange={handleInputChange} 
              />
            </div>
          )}

          {inviteDetails.event_title.includes('Exhibition') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Class Section</label>
              <input 
                type="text" 
                name="section" 
                required 
                placeholder="e.g. Section C"
                value={formData.section} 
                onChange={handleInputChange} 
              />
            </div>
          )}

          {/* Esports Specific Fields */}
          {inviteDetails.event_category === 'Esports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: categoryColor() }}>Esports Profile Info</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>In-Game UID (Character ID)</label>
                  <input 
                    type="text" 
                    name="inGameUid" 
                    required 
                    placeholder="e.g. 518382902"
                    value={formData.inGameUid} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>In-Game Name (IGN)</label>
                  <input 
                    type="text" 
                    name="inGameName" 
                    required 
                    placeholder="e.g. Fatalist_GG"
                    value={formData.inGameName} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>In-Game Profile Picture URL</label>
                <input 
                  type="text" 
                  name="inGamePfp" 
                  required
                  placeholder="https://imgur.com/..."
                  value={formData.inGamePfp} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          )}

          {/* Non-esports Phone Number */}
          {inviteDetails.event_category !== 'Esports' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="e.g. +91 9876543210"
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, height: '44px' }}
              disabled={submitting}
            >
              {submitting ? 'Enrolling...' : `Join ${inviteDetails.team_name}`}
            </button>
            <Link to="/dashboard" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center' }}>
              Cancel
            </Link>
          </div>

        </form>
      </div>

    </div>
  );
};

export default JoinTeam;
