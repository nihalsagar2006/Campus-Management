import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, X, CheckCheck, Megaphone, AlertTriangle, AlertCircle, 
  ExternalLink, Inbox, ArrowRight, Check, Volume2, VolumeX,
  Code, Gamepad2, Trophy, Award, MapPin, Calendar, Sparkles, Clock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EventCountdown from './EventCountdown';

const AnnouncementHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeNotices, setActiveNotices] = useState([]);
  const [history, setHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('announcement_sound') !== 'false';
  });

  // Display elements state
  const [banners, setBanners] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [popup, setPopup] = useState(null);

  const drawerRef = useRef(null);
  const wsRef = useRef(null);

  // Play a modern web synthesis chime
  const playChime = () => {
    if (!soundEnabled) return;
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
      playTone(587.33, now, 0.35); // D5
      playTone(880.00, now + 0.1, 0.45, 0.12); // A5
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      localStorage.setItem('announcement_sound', !prev);
      return !prev;
    });
  };

  // Helper: log unique views
  const logView = async (id) => {
    const sessionKey = `viewed_notice_${id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    try {
      await api.post(`/notifications/${id}/view`);
      sessionStorage.setItem(sessionKey, 'true');
    } catch (err) {
      console.error('Failed to log view', err);
    }
  };

  // Fetch initial notifications
  const fetchInitialData = async () => {
    try {
      const res = await api.get('/notifications/active');
      setActiveNotices(res.data);

      // Separate banner and popup display styles
      const activeBanners = res.data.filter(n => n.display_style === 'banner');
      setBanners(activeBanners);
      activeBanners.forEach(b => logView(b.id));

      // Popups: show unread popups immediately on load
      if (user) {
        const historyRes = await api.get('/notifications/history');
        setHistory(historyRes.data);
        const unread = historyRes.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);

        // Find the first unread popup announcement
        const unreadPopup = historyRes.data.find(n => !n.is_read && n.display_style === 'popup');
        if (unreadPopup) {
          setPopup(unreadPopup);
          logView(unreadPopup.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch initial notices', err);
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    fetchInitialData();

    const connectWebSocket = () => {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let wsUrl;
      
      if (apiBase.startsWith('http')) {
        wsUrl = apiBase.replace(/^http/, 'ws');
      } else {
        const host = window.location.host;
        wsUrl = `${wsProto}//${host}${apiBase}`;
      }
      
      const finalWsUrl = `${wsUrl}/notifications/ws` + (token ? `?token=${token}` : '');
      const ws = new WebSocket(finalWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Announcement WS Connected');
        // Start ping interval
        const pinger = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 15000);
        ws.pinger = pinger;
      };

      ws.onmessage = (event) => {
        if (event.data.startsWith('pong')) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_announcement') {
            const notice = payload.notification;
            
            // Add to active notifications
            setActiveNotices(prev => [notice, ...prev]);
            
            // Play sound chime
            playChime();

            // Display style actions
            if (notice.display_style === 'banner') {
              setBanners(prev => [notice, ...prev]);
              logView(notice.id);
            } else if (notice.display_style === 'popup') {
              setPopup(notice);
              logView(notice.id);
            } else if (notice.display_style === 'floating') {
              setToasts(prev => [...prev, notice]);
              logView(notice.id);
              // Auto-dismiss floating alerts after 6 seconds
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== notice.id));
              }, 6000);
            } else {
              // Standard card/widget: send to toasts as well for visibility
              setToasts(prev => [...prev, notice]);
              logView(notice.id);
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== notice.id));
              }, 6000);
            }

            // Refresh unread counter
            if (user) {
              setUnreadCount(prev => prev + 1);
              setHistory(prev => [notice, ...prev]);
            }
          }
        } catch (err) {
          console.error('WS JSON parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('Announcement WS Closed. Retrying in 5s...');
        if (ws.pinger) clearInterval(ws.pinger);
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (err) => {
        console.error('WS connection error:', err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        if (wsRef.current.pinger) clearInterval(wsRef.current.pinger);
        wsRef.current.close();
      }
    };
  }, [user]);

  // Drawer click outside closure
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target) && !e.target.closest('.hub-drawer-toggle')) {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  // Mark notice read
  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      // Update history state
      setHistory(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  // Mark all read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setHistory(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  // Handle clicking announcement details
  const handleNoticeClick = (notice) => {
    if (user) {
      markAsRead(notice.id);
    }
    // Dismiss toast or popup if clicked
    setPopup(null);
    setToasts(prev => prev.filter(t => t.id !== notice.id));

    if (notice.link_url) {
      if (notice.link_url.startsWith('http')) {
        window.open(notice.link_url, '_blank');
      } else {
        navigate(notice.link_url);
      }
    }
  };

  // Get visually distinct styling matching categories
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'registration_opening':
        return {
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
          bgLight: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          icon: <Sparkles size={18} />
        };
      case 'upcoming_event':
        return {
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
          bgLight: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          icon: <Calendar size={18} />
        };
      case 'hackathon_countdown':
        return {
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
          bgLight: 'rgba(139, 92, 246, 0.15)',
          color: '#8b5cf6',
          icon: <Code size={18} />
        };
      case 'esports_schedule':
        return {
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', // Orange
          bgLight: 'rgba(249, 115, 22, 0.15)',
          color: '#f97316',
          icon: <Gamepad2 size={18} />
        };
      case 'sports_fixture':
        return {
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', // Sky Blue
          bgLight: 'rgba(14, 165, 233, 0.15)',
          color: '#0ea5e9',
          icon: <Trophy size={18} />
        };
      case 'winner_announcement':
        return {
          gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)', // Amber/Gold
          bgLight: 'rgba(234, 179, 8, 0.15)',
          color: '#eab308',
          icon: <Trophy size={18} style={{ animation: 'bounce 2s infinite' }} />
        };
      case 'certificate_availability':
        return {
          gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Cyan
          bgLight: 'rgba(6, 182, 212, 0.15)',
          color: '#06b6d4',
          icon: <Award size={18} />
        };
      case 'venue_change':
        return {
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', // Red
          bgLight: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          icon: <MapPin size={18} style={{ animation: 'pulse 1.5s infinite' }} />
        };
      default: // info or generic
        return {
          gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo
          bgLight: 'rgba(99, 102, 241, 0.15)',
          color: '#6366f1',
          icon: <Megaphone size={18} />
        };
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'urgent':
        return { color: 'var(--danger)', icon: <AlertCircle size={16} /> };
      case 'warning':
        return { color: 'var(--warning)', icon: <AlertTriangle size={16} /> };
      case 'success':
        return { color: 'var(--success)', icon: <CheckCheck size={16} /> };
      default:
        return { color: 'var(--primary)', icon: <Megaphone size={16} /> };
    }
  };

  const cssStyles = `
    @keyframes slideInRight {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideDownBanner {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes scaleInModal {
      from { transform: scale(0.9) translate(-50%, -50%); opacity: 0; }
      to { transform: scale(1) translate(-50%, -50%); opacity: 1; }
    }
    .toast-card {
      animation: slideInRight 0.4s var(--transition-bouncy) forwards;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      width: 360px;
      max-width: calc(100vw - 2rem);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .toast-card:hover {
      transform: translateY(-2px);
      background: var(--bg-glass-hover);
      border-color: var(--border-glow);
    }
    .top-banner {
      animation: slideDownBanner 0.4s ease forwards;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 2rem;
      width: 100%;
      position: relative;
      z-index: 999;
    }
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 2000;
    }
    .popup-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: scaleInModal 0.4s var(--transition-bouncy) forwards;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
      border-radius: var(--border-radius-lg);
      padding: 2rem;
      width: 460px;
      max-width: calc(100vw - 2rem);
      z-index: 2001;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .hub-history-drawer {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: 420px;
      background: var(--bg-surface);
      border-left: 1px solid var(--border-color);
      box-shadow: -10px 0 35px rgba(0,0,0,0.15);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hub-history-drawer.open {
      transform: translateX(0);
    }
    .badge-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      color: white;
      flex-shrink: 0;
    }
    @media (max-width: 500px) {
      .hub-history-drawer {
        width: 100%;
      }
    }
  `;

  return (
    <>
      <style>{cssStyles}</style>

      {/* 1. TOP ANNOUNCEMENT BANNERS */}
      {banners.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {banners.map(banner => {
            const theme = getCategoryTheme(banner.category);
            const statusStyle = getAlertStyles(banner.type);
            return (
              <div key={banner.id} className="top-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div className="badge-icon" style={{ background: theme.gradient, width: '28px', height: '28px', borderRadius: '6px' }}>
                    {theme.icon}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: theme.color, letterSpacing: '0.05em' }}>
                    {banner.category.replace('_', ' ')}
                  </span>
                  <div style={{ borderLeft: '1px solid var(--border-color)', height: '16px', margin: '0 0.25rem' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{banner.content}</span>
                  {banner.event_id && banner.start_time && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      - Starts soon
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {banner.link_url && (
                    <button 
                      onClick={() => handleNoticeClick(banner)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.2rem 0.75rem', fontSize: '0.75rem', height: '26px', borderRadius: '6px' }}
                    >
                      Details <ExternalLink size={12} />
                    </button>
                  )}
                  <button 
                    onClick={() => setBanners(prev => prev.filter(b => b.id !== banner.id))}
                    style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 0 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bell / Controls - Always Visible */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}>
        {/* Sound toggle button */}
        <button 
          onClick={toggleSound}
          className="btn btn-secondary"
          style={{ 
            padding: '0.6rem', 
            borderRadius: '50%', 
            width: '42px', 
            height: '42px',
            boxShadow: 'var(--shadow-md)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(8px)'
          }}
          title={soundEnabled ? 'Mute announcement sound' : 'Unmute announcement sound'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Global Announcement drawer toggle */}
        {user && (
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="hub-drawer-toggle btn btn-primary"
            style={{ 
              height: '42px', 
              borderRadius: '999px',
              padding: '0 1.25rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Bell size={18} style={{ animation: unreadCount > 0 ? 'pulse 1.5s infinite' : 'none' }} />
            <span style={{ fontSize: '0.85rem' }}>Announcements</span>
            {unreadCount > 0 && (
              <span style={{ 
                background: 'var(--danger)', 
                color: 'white', 
                fontSize: '0.75rem', 
                fontWeight: 'bold', 
                padding: '0.1rem 0.45rem', 
                borderRadius: '999px',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* 2. FLOATING ALERTS (TOAST STACK) */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 1500,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const theme = getCategoryTheme(toast.category);
          return (
            <div 
              key={toast.id} 
              className="toast-card"
              style={{ pointerEvents: 'auto' }}
              onClick={() => handleNoticeClick(toast)}
            >
              {/* Top gradient highlight strip */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.gradient }} />
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="badge-icon" style={{ background: theme.gradient }}>
                  {theme.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: theme.color, letterSpacing: '0.05em' }}>
                      {toast.category.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Just now</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {toast.content}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 0 }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Event Countdown support in toast */}
              {toast.category.includes('countdown') && toast.start_time && (
                <div style={{ pointerEvents: 'none', marginTop: '0.25rem' }}>
                  <EventCountdown dateTime={toast.start_time} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. POPUP MODAL OVERLAY */}
      {popup && (
        <>
          <div className="modal-overlay" onClick={() => setPopup(null)} />
          <div className="popup-modal">
            {/* Colored top indicator */}
            <div style={{ 
              background: getCategoryTheme(popup.category).gradient, 
              padding: '1.5rem',
              borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0',
              margin: '-2rem -2rem 0 -2rem',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                  {getCategoryTheme(popup.category).icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, opacity: 0.8, letterSpacing: '0.05em' }}>
                    Important Announcement
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>
                    {popup.category.replace('_', ' ').toUpperCase()}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setPopup(null)}
                style={{ 
                  position: 'absolute', top: '1.25rem', right: '1.25rem', 
                  background: 'transparent', color: 'white', padding: 0 
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--text-primary)', 
                lineHeight: 1.6, 
                fontWeight: 600,
                margin: 0
              }}>
                {popup.content}
              </p>

              {/* Render countdown if applicable */}
              {popup.start_time && (popup.category === 'hackathon_countdown' || popup.category === 'esports_schedule' || popup.category === 'sports_fixture') && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                  <EventCountdown dateTime={popup.start_time} title="Starts In" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setPopup(null)} className="btn btn-secondary">
                Dismiss
              </button>
              {popup.link_url && (
                <button onClick={() => handleNoticeClick(popup)} className="btn btn-primary">
                  View Details <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* 4. SIDE DRAWER HISTORY PANEL */}
      <div ref={drawerRef} className={`hub-history-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Campus Announcements</h3>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)} 
            style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {unreadCount > 0 && (
          <div style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'var(--bg-app)', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {unreadCount} unread announcements
            </span>
            <button 
              onClick={markAllAsRead}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: '24px', borderRadius: '6px' }}
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          </div>
        )}

        {/* Drawer list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
              <Inbox size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No announcements found</p>
            </div>
          ) : (
            history.map(notice => {
              const theme = getCategoryTheme(notice.category);
              return (
                <div 
                  key={notice.id} 
                  onClick={() => handleNoticeClick(notice)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    background: notice.is_read ? 'var(--bg-app)' : 'var(--bg-surface)', 
                    border: notice.is_read ? '1px solid var(--border-color)' : `1px solid ${theme.color}`,
                    borderLeft: `5px solid ${theme.color}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: notice.is_read ? 'none' : 'var(--shadow-sm)'
                  }}
                >
                  {!notice.is_read && (
                    <span style={{ 
                      position: 'absolute', top: '12px', right: '12px', 
                      width: '8px', height: '8px', background: 'var(--primary)', 
                      borderRadius: '50%' 
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ background: theme.bgLight, color: theme.color, fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                      {notice.category.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: notice.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', 
                    lineHeight: 1.4,
                    margin: 0,
                    fontWeight: notice.is_read ? '400' : '600'
                  }}>
                    {notice.content}
                  </p>

                  {notice.category.includes('countdown') && notice.start_time && (
                    <div style={{ pointerEvents: 'none', marginTop: '0.5rem' }}>
                      <EventCountdown dateTime={notice.start_time} />
                    </div>
                  )}

                  {notice.link_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: theme.color, marginTop: '0.5rem', fontWeight: 600 }}>
                      View details <ArrowRight size={12} />
                    </div>
                  )}

                  {!notice.is_read && (
                    <button 
                      onClick={(e) => markAsRead(notice.id, e)}
                      style={{ 
                        marginTop: '0.5rem', background: 'transparent', color: 'var(--text-tertiary)', 
                        fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0
                      }}
                    >
                      <Check size={12} /> Mark as read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default AnnouncementHub;
