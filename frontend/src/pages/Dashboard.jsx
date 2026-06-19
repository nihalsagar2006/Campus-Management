import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, Calendar as CalendarIcon, Bell, ShieldCheck, User as UserIcon, 
  Trash2, Edit3, PlusCircle, AlertCircle, CheckCircle, Clock,
  Award, Trophy, Gamepad2, MapPin, Megaphone, ChevronLeft, ChevronRight,
  ExternalLink, Eye, Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCountdown from '../components/EventCountdown';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard states
  const [activeNotices, setActiveNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [noticeStats, setNoticeStats] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [myRegistrations, setMyRegistrations] = useState([]);

  // Admin Notification Form State
  const [notifications, setNotifications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    type: 'info',
    link_url: '',
    priority: 0,
    is_pinned: false,
    is_active: true,
    start_time: '',
    end_time: '',
    category: 'info',
    display_style: 'card',
    event_id: '',
    target_type: 'all',
    target_user_id: '',
    target_event_id: ''
  });

  // Fetch student active announcements
  const fetchActiveAnnouncements = async () => {
    try {
      const res = await api.get('/notifications/active');
      setActiveNotices(res.data);
      
      // Auto log views for all loaded notices
      res.data.forEach(n => {
        const sessionKey = `viewed_notice_${n.id}`;
        if (!sessionStorage.getItem(sessionKey)) {
          api.post(`/notifications/${n.id}/view`)
            .then(() => sessionStorage.setItem(sessionKey, 'true'))
            .catch(err => console.error(err));
        }
      });
    } catch (err) {
      console.error('Failed to fetch active announcements', err);
    }
  };

  // Fetch admin panel notices list + view stats
  const fetchAdminAnnouncements = async () => {
    if (!user?.is_admin) return;
    try {
      const res = await api.get('/notifications/all');
      setNotifications(res.data);
      
      // Fetch stats for each notice
      const statsObj = {};
      await Promise.all(res.data.map(async (n) => {
        try {
          const statsRes = await api.get(`/notifications/${n.id}/stats`);
          statsObj[n.id] = statsRes.data;
        } catch (err) {
          statsObj[n.id] = { total_views: 0, unique_views: 0 };
        }
      }));
      setNoticeStats(statsObj);
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    }
  };

  // Fetch helper lists: events and users
  const fetchHelpers = async () => {
    try {
      // Fetch active events
      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data);
      
      // Fetch users list (admin only)
      if (user?.is_admin) {
        const usersRes = await api.get('/auth/users');
        setUsersList(usersRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch helper lists', err);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get('/registrations/my');
      setMyRegistrations(res.data);
    } catch (err) {
      console.error('Failed to fetch my registrations', err);
    }
  };

  useEffect(() => {
    fetchActiveAnnouncements();
    fetchHelpers();
    fetchMyRegistrations();
    if (user?.is_admin) {
      fetchAdminAnnouncements();
    }
  }, [user]);

  // Carousel auto-slide effect
  const carouselNotices = activeNotices.filter(n => n.is_pinned || n.type === 'urgent');
  const finalCarouselNotices = carouselNotices.length > 0 ? carouselNotices : activeNotices.slice(0, 4);

  useEffect(() => {
    if (finalCarouselNotices.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % finalCarouselNotices.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [finalCarouselNotices.length]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData,
        priority: parseInt(formData.priority, 10) || 0,
        event_id: formData.event_id ? parseInt(formData.event_id, 10) : null,
        target_user_id: formData.target_user_id ? parseInt(formData.target_user_id, 10) : null,
        target_event_id: formData.target_event_id ? parseInt(formData.target_event_id, 10) : null
      };
      
      payload.start_time = formData.start_time ? new Date(formData.start_time).toISOString() : null;
      payload.end_time = formData.end_time ? new Date(formData.end_time).toISOString() : null;

      if (editingId) {
        await api.put(`/notifications/${editingId}`, payload);
        alert('Announcement updated successfully!');
      } else {
        await api.post('/notifications/', payload);
        alert('Announcement published and broadcasted!');
      }

      // Reset Form
      setFormData({
        content: '',
        type: 'info',
        link_url: '',
        priority: 0,
        is_pinned: false,
        is_active: true,
        start_time: '',
        end_time: '',
        category: 'info',
        display_style: 'card',
        event_id: '',
        target_type: 'all',
        target_user_id: '',
        target_event_id: ''
      });
      setEditingId(null);
      fetchActiveAnnouncements();
      fetchAdminAnnouncements();
    } catch (err) {
      alert('Failed to save announcement');
    }
  };

  const startEdit = (notice) => {
    setEditingId(notice.id);
    
    const localStart = notice.start_time ? new Date(notice.start_time).toISOString().substring(0, 16) : '';
    const localEnd = notice.end_time ? new Date(notice.end_time).toISOString().substring(0, 16) : '';

    setFormData({
      content: notice.content,
      type: notice.type,
      link_url: notice.link_url || '',
      priority: notice.priority,
      is_pinned: notice.is_pinned,
      is_active: notice.is_active,
      start_time: localStart,
      end_time: localEnd,
      category: notice.category || 'info',
      display_style: notice.display_style || 'card',
      event_id: notice.event_id || '',
      target_type: notice.target_type || 'all',
      target_user_id: notice.target_user_id || '',
      target_event_id: notice.target_event_id || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      content: '',
      type: 'info',
      link_url: '',
      priority: 0,
      is_pinned: false,
      is_active: true,
      start_time: '',
      end_time: '',
      category: 'info',
      display_style: 'card',
      event_id: '',
      target_type: 'all',
      target_user_id: '',
      target_event_id: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      fetchActiveAnnouncements();
      fetchAdminAnnouncements();
    } catch (err) {
      alert('Failed to delete notification');
    }
  };

  const getNoticeStatus = (notice) => {
    if (!notice.is_active) return <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Inactive</span>;
    const now = new Date();
    if (notice.start_time && new Date(notice.start_time) > now) {
      return <span className="badge badge-primary" style={{ fontSize: '0.65rem', background: 'var(--primary-light)', color: 'var(--primary)' }}>Scheduled</span>;
    }
    if (notice.end_time && new Date(notice.end_time) < now) {
      return <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Expired</span>;
    }
    return <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>;
  };

  // Helper for category themes
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'registration_opening':
        return {
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          bgLight: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          icon: <Sparkles size={20} />
        };
      case 'upcoming_event':
        return {
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bgLight: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          icon: <CalendarIcon size={20} />
        };
      case 'hackathon_countdown':
        return {
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bgLight: 'rgba(139, 92, 246, 0.15)',
          color: '#8b5cf6',
          icon: <Clock size={20} />
        };
      case 'esports_schedule':
        return {
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          bgLight: 'rgba(249, 115, 22, 0.15)',
          color: '#f97316',
          icon: <Gamepad2 size={20} />
        };
      case 'sports_fixture':
        return {
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
          bgLight: 'rgba(14, 165, 233, 0.15)',
          color: '#0ea5e9',
          icon: <Trophy size={20} />
        };
      case 'winner_announcement':
        return {
          gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
          bgLight: 'rgba(234, 179, 8, 0.15)',
          color: '#eab308',
          icon: <Trophy size={20} />
        };
      case 'certificate_availability':
        return {
          gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          bgLight: 'rgba(6, 182, 212, 0.15)',
          color: '#06b6d4',
          icon: <Award size={20} />
        };
      case 'venue_change':
        return {
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          bgLight: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          icon: <MapPin size={20} />
        };
      default:
        return {
          gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          bgLight: 'rgba(99, 102, 241, 0.15)',
          color: '#6366f1',
          icon: <Megaphone size={20} />
        };
    }
  };

  const handleNoticeClick = (notice) => {
    if (notice.link_url) {
      if (notice.link_url.startsWith('http')) {
        window.open(notice.link_url, '_blank');
      } else {
        navigate(notice.link_url);
      }
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Welcome Section */}
      <div className="glass-panel" style={{ 
        padding: '2.5rem 3rem', 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, var(--primary-light), var(--bg-glass))',
        borderLeft: '4px solid var(--primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Welcome back, <span className="gradient-text">{user?.full_name}</span>! 👋
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '1.25rem' }}>
            Ready to explore what's happening around campus? Check out your live updates, countdowns, and sports matches below.
          </p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-surface)', borderRadius: '999px', boxShadow: 'var(--shadow-sm)' }}>
            {user?.is_admin ? <ShieldCheck size={18} color="var(--secondary)" /> : <UserIcon size={18} color="var(--primary)" />}
            <span style={{ fontWeight: 600, color: user?.is_admin ? 'var(--secondary)' : 'var(--primary)', fontSize: '0.85rem' }}>
              {user?.is_admin ? 'Administrator Account' : 'Student Account'}
            </span>
          </div>
        </div>
        <Sparkles size={150} style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.04, color: 'var(--primary)' }} />
      </div>

      {/* 🔮 HOMEPAGE ANNOUNCEMENT CAROUSEL */}
      {finalCarouselNotices.length > 0 && (
        <div className="glass-panel" style={{
          position: 'relative',
          padding: '2rem',
          marginBottom: '2.5rem',
          background: 'var(--bg-glass)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '180px'
        }}>
          {/* Active slide layout */}
          {finalCarouselNotices.map((notice, index) => {
            if (index !== currentSlide) return null;
            const theme = getCategoryTheme(notice.category);
            return (
              <div 
                key={notice.id} 
                className="animate-slide-up"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: notice.start_time && notice.category.includes('countdown') ? '2fr 1fr' : '1fr', 
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      background: theme.gradient,
                      color: 'white',
                      padding: '0.35rem',
                      borderRadius: '8px',
                      display: 'flex'
                    }}>
                      {theme.icon}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.color, letterSpacing: '0.05em' }}>
                      {notice.category.replace('_', ' ')}
                    </span>
                    {notice.is_pinned && (
                      <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Pinned Notice</span>
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                    {notice.content}
                  </h3>
                  
                  {notice.link_url && (
                    <button 
                      onClick={() => handleNoticeClick(notice)}
                      className="btn btn-primary"
                      style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.25rem' }}
                    >
                      View Details <ExternalLink size={14} />
                    </button>
                  )}
                </div>

                {/* Countdown display in Carousel */}
                {notice.start_time && notice.category.includes('countdown') && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <EventCountdown dateTime={notice.start_time} title="Hackathon Countdown" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Carousel controls */}
          {finalCarouselNotices.length > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Announcement {currentSlide + 1} of {finalCarouselNotices.length}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev - 1 + finalCarouselNotices.length) % finalCarouselNotices.length)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem', borderRadius: '50%' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev + 1) % finalCarouselNotices.length)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem', borderRadius: '50%' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Left Column: Events & Live Countdown Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Static Action Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '14px', color: 'var(--primary)', display: 'flex' }}>
                <CalendarIcon size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Events Navigation</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Browse sports, technical hackathons, esports matches, and manage your tickets.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/events" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}>Browse Events Hub</Link>
              <Link to="/tickets" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}>View My Tickets</Link>
            </div>
          </div>

          {/* Active Registrations / Teams Quick View */}
          {myRegistrations.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--secondary-light)', borderRadius: '14px', color: 'var(--secondary)', display: 'flex' }}>
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>My Registrations</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myRegistrations.map(reg => (
                  <div key={reg.id} style={{
                    background: 'var(--bg-app)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {reg.event?.title || `Event #${reg.event_id}`}
                      </span>
                      <span className="badge" style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.1rem 0.4rem',
                        background: reg.status === 'attended' || reg.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: reg.status === 'attended' || reg.status === 'approved' ? 'var(--success)' : 'var(--warning)',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap'
                      }}>
                        {reg.status === 'pending_members' ? 'Awaiting Teammates' : reg.status}
                      </span>
                    </div>

                    {reg.is_team && reg.team_name && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        👥 Team: <strong>{reg.team_name}</strong>
                      </div>
                    )}

                    <Link 
                      to={`/events/${reg.event_id}`} 
                      style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--secondary)', 
                        fontWeight: 700, 
                        textDecoration: 'underline',
                        alignSelf: 'flex-start',
                        marginTop: '0.25rem'
                      }}
                    >
                      Manage / View Hub &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Live Countdown Widgets (Hackathons, Esports Match Schedules, Sports Fixtures) */}
          {activeNotices.filter(n => n.category === 'hackathon_countdown' || n.category === 'esports_schedule' || n.category === 'sports_fixture').length > 0 && (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Clock size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Live Match & Event Timers</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeNotices
                  .filter(n => (n.category === 'hackathon_countdown' || n.category === 'esports_schedule' || n.category === 'sports_fixture') && n.start_time)
                  .slice(0, 3)
                  .map(notice => {
                    const theme = getCategoryTheme(notice.category);
                    return (
                      <div 
                        key={notice.id} 
                        style={{ 
                          padding: '1rem', 
                          background: 'var(--bg-app)', 
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: theme.color }}>{theme.icon}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: theme.color, letterSpacing: '0.05em' }}>
                            {notice.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {notice.content}
                        </p>
                        <EventCountdown dateTime={notice.start_time} />
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Targeted Announcements Stack (Animated Cards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="var(--secondary)" /> Announcements Center
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {activeNotices.length} active announcements
            </span>
          </div>

          {activeNotices.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No active announcements at the moment. Check back later!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeNotices.map(notice => {
                const theme = getCategoryTheme(notice.category);
                return (
                  <div 
                    key={notice.id}
                    className="glass-panel" 
                    onClick={() => handleNoticeClick(notice)}
                    style={{ 
                      padding: '1.25rem 1.5rem', 
                      background: 'var(--bg-glass)',
                      borderLeft: `5px solid ${theme.color}`,
                      cursor: notice.link_url ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: theme.color, display: 'flex' }}>{theme.icon}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: theme.color, letterSpacing: '0.05em' }}>
                          {notice.category.replace('_', ' ')}
                        </span>
                        {notice.is_pinned && (
                          <span className="badge badge-secondary" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>Pinned</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      color: 'var(--text-primary)', 
                      margin: 0,
                      lineHeight: 1.45
                    }}>
                      {notice.content}
                    </p>

                    {notice.category.includes('countdown') && notice.start_time && (
                      <div style={{ pointerEvents: 'none', margin: '0.25rem 0' }}>
                        <EventCountdown dateTime={notice.start_time} />
                      </div>
                    )}

                    {notice.link_url && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem', 
                        fontSize: '0.8rem', 
                        color: theme.color, 
                        fontWeight: 700,
                        marginTop: '0.25rem'
                      }}>
                        More details <ExternalLink size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 🛠️ CENTRALIZED ADMIN OPERATIONS ANNOUNCEMENTS MANAGER */}
      {user?.is_admin && (
        <div className="glass-panel animate-slide-up" style={{ padding: '2.5rem', marginBottom: '3rem', borderTop: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Bell size={24} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Centralized Announcements Manager</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2.5rem' }}>
            
            {/* Left Column: Form */}
            <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlusCircle size={18} /> {editingId ? 'Edit Announcement' : 'Publish New Announcement'}
              </h4>
              
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Content */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Content Message</label>
                  <textarea 
                    name="content"
                    required
                    rows="3"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter short text message to broadcast..."
                  />
                </div>

                {/* Category & Display Style */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category Type</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="info">Info / Generic</option>
                      <option value="registration_opening">Registration Opening</option>
                      <option value="upcoming_event">Upcoming Event</option>
                      <option value="hackathon_countdown">Hackathon Countdown</option>
                      <option value="esports_schedule">Esports Match Schedule</option>
                      <option value="sports_fixture">Sports Fixture</option>
                      <option value="winner_announcement">Winner Announcement</option>
                      <option value="certificate_availability">Certificate Availability</option>
                      <option value="venue_change">Venue Change</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Display Layout</label>
                    <select name="display_style" value={formData.display_style} onChange={handleInputChange}>
                      <option value="card">Standard Card</option>
                      <option value="banner">Top Persistent Banner</option>
                      <option value="popup">Popup Modal Alert</option>
                      <option value="floating">Floating Alert (Toast)</option>
                      <option value="widget">Dashboard Widget only</option>
                    </select>
                  </div>
                </div>

                {/* Alert Level & Priority Weight */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Severity Level</label>
                    <select name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="info">Information (Blue)</option>
                      <option value="success">Success (Green)</option>
                      <option value="warning">Warning (Orange)</option>
                      <option value="urgent">Urgent Alert (Red)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Priority Weight</label>
                    <input 
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                {/* Link URL & Linked Event */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Redirect Link (Optional)</label>
                    <input 
                      type="text"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleInputChange}
                      placeholder="e.g. /events/2"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Link Event ID (Optional)</label>
                    <select name="event_id" value={formData.event_id} onChange={handleInputChange}>
                      <option value="">-- No Linked Event --</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.title} (ID: {ev.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Scope */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Target Audience</label>
                  <select name="target_type" value={formData.target_type} onChange={handleInputChange}>
                    <option value="all">Everyone (Global)</option>
                    <option value="user">Specific Registered User</option>
                    <option value="event">Registered Event Participants</option>
                  </select>
                </div>

                {/* Target Conditionals */}
                {formData.target_type === 'user' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Select Target Student</label>
                    <select name="target_user_id" value={formData.target_user_id} onChange={handleInputChange} required>
                      <option value="">-- Select Student User --</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.target_type === 'event' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Select Target Event Participants</label>
                    <select name="target_event_id" value={formData.target_event_id} onChange={handleInputChange} required>
                      <option value="">-- Select Registered Event --</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.title} (ID: {ev.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Scheduling */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Start Scheduling (Optional)</label>
                    <input 
                      type="datetime-local"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>End Scheduling (Optional)</label>
                    <input 
                      type="datetime-local"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Pinned / Active Status */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input 
                      type="checkbox"
                      id="is_pinned"
                      name="is_pinned"
                      checked={formData.is_pinned}
                      onChange={handleInputChange}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="is_pinned" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pin to Carousel / Front</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input 
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="is_active" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Status</label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                    {editingId ? 'Save Changes' : 'Publish Announcement'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="btn btn-secondary" style={{ padding: '0.8rem' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Notices List & Analytics */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Announcements & View Analytics</h4>
              
              {notifications.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No notifications defined.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {notifications.map(notice => {
                    const stats = noticeStats[notice.id] || { total_views: 0, unique_views: 0 };
                    return (
                      <div 
                        key={notice.id} 
                        style={{ 
                          padding: '1.25rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}
                      >
                        <div style={{ flex: 1, marginRight: '1.5rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {getNoticeStatus(notice)}
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{notice.category.replace('_', ' ')}</span>
                            <span className={`badge badge-${notice.type === 'urgent' ? 'danger' : notice.type}`} style={{ fontSize: '0.65rem' }}>{notice.type}</span>
                            {notice.is_pinned && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Pinned</span>}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Display: {notice.display_style}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Target: {notice.target_type}</span>
                          </div>
                          
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>{notice.content}</p>
                          
                          {/* Targeting Context info */}
                          {notice.target_type === 'user' && notice.target_user_id && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                              Targeted Student ID: {notice.target_user_id}
                            </div>
                          )}
                          {notice.target_type === 'event' && notice.target_event_id && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                              Targeted Event ID: {notice.target_event_id}
                            </div>
                          )}
                          {notice.event_id && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                              Linked Event ID: {notice.event_id}
                            </div>
                          )}
                          
                          {/* Scheduling dates */}
                          {(notice.start_time || notice.end_time) && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {notice.start_time && <span>Start: {new Date(notice.start_time).toLocaleString()}</span>}
                              {notice.end_time && <span>End: {new Date(notice.end_time).toLocaleString()}</span>}
                            </div>
                          )}

                          {/* 📊 View Tracking Indicators */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '1.25rem', 
                            marginTop: '0.75rem', 
                            paddingTop: '0.6rem',
                            borderTop: '1px dashed var(--border-color)',
                            fontSize: '0.8rem', 
                            fontWeight: 700,
                            color: 'var(--text-secondary)'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Eye size={14} color="var(--primary)" /> {stats.total_views} Total Views
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <UserIcon size={14} color="var(--secondary)" /> {stats.unique_views} Unique Views
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            onClick={() => startEdit(notice)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(notice.id)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
