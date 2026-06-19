import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, X, CheckCheck, Megaphone, AlertTriangle, AlertCircle, 
  ExternalLink, Inbox, ArrowRight, Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NotificationTicker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNotices, setActiveNotices] = useState([]);
  const [history, setHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Fetch active alerts for marquee
  const fetchActive = async () => {
    try {
      const res = await api.get('/notifications/active');
      setActiveNotices(res.data);
    } catch (err) {
      console.error('Failed to fetch active notifications', err);
    }
  };

  // Fetch history for read/unread tracking
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/history');
      setHistory(res.data);
      // Count unread
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notification history', err);
    }
  };

  useEffect(() => {
    fetchActive();
    fetchHistory();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchActive();
      fetchHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle drawer click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target) && !e.target.closest('.history-toggle-btn')) {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  // Mark single as read
  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      fetchHistory();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchHistory();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  // Handle click on ticker item
  const handleNoticeClick = (notice) => {
    // Mark read automatically if user logged in
    if (user) {
      markAsRead(notice.id);
    }
    // Redirect if link exists
    if (notice.link_url) {
      if (notice.link_url.startsWith('http')) {
        window.open(notice.link_url, '_blank');
      } else {
        navigate(notice.link_url);
      }
    }
  };

  // Skip rendering if no active notifications
  if (activeNotices.length === 0) return null;

  // Duplicate items list to ensure smooth infinite marquee scroll
  const duplicatedNotices = [...activeNotices, ...activeNotices, ...activeNotices, ...activeNotices];

  // Helper for capsule styling based on alert type
  const getAlertStyles = (type) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          icon: <AlertCircle size={14} style={{ animation: 'pulse 1.5s infinite' }} />
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid var(--warning)',
          color: 'var(--warning)',
          icon: <AlertTriangle size={14} />
        };
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          icon: <CheckCheck size={14} />
        };
      default: // info
        return {
          bg: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid var(--primary)',
          color: 'var(--primary)',
          icon: <Megaphone size={14} />
        };
    }
  };

  // CSS injection for marquee loop and pulse
  const stylesInject = `
    @keyframes marqueeScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    .notice-marquee-track {
      display: flex;
      align-items: center;
      width: max-content;
      animation: marqueeScroll 45s linear infinite;
    }
    .notice-marquee-track:hover {
      animation-play-state: paused;
    }
    .notice-capsule {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-right: 3rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .notice-capsule:hover {
      transform: translateY(-1px) scale(1.02);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .ticker-bar {
      width: 100%;
      height: 40px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
      z-index: 1000;
      padding: 0 1rem;
    }
    .history-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 400px;
      background: var(--bg-surface);
      border-left: 1px solid var(--border-color);
      box-shadow: -10px 0 30px rgba(0,0,0,0.1);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .history-drawer.open {
      transform: translateX(0);
    }
    @media (max-width: 500px) {
      .history-drawer {
        width: 100%;
      }
    }
  `;

  return (
    <>
      <style>{stylesInject}</style>

      {/* Dynamic Scrolling Notification Bar */}
      <div className="ticker-bar">
        
        {/* Left side label */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          padding: '0.2rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          zIndex: 5,
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <Bell size={12} /> Live
        </div>

        {/* Marquee Track container */}
        <div style={{ flex: 1, overflow: 'hidden', margin: '0 1.5rem', display: 'flex', alignItems: 'center' }}>
          <div className="notice-marquee-track">
            {duplicatedNotices.map((notice, index) => {
              const theme = getAlertStyles(notice.type);
              return (
                <div 
                  key={`${notice.id}-${index}`} 
                  className="notice-capsule" 
                  style={{ background: theme.bg, border: theme.border, color: theme.color }}
                  onClick={() => handleNoticeClick(notice)}
                >
                  {theme.icon}
                  <span>{notice.content}</span>
                  {notice.link_url && <ExternalLink size={10} style={{ opacity: 0.6 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side history drawer toggle */}
        {user && (
          <button 
            className="history-toggle-btn btn btn-secondary" 
            onClick={() => setIsDrawerOpen(true)}
            style={{ 
              padding: '0.35rem 0.75rem', 
              fontSize: '0.8rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              height: '28px',
              position: 'relative'
            }}
          >
            <Bell size={14} /> Notices
            {unreadCount > 0 && (
              <span style={{ 
                background: 'var(--danger)', 
                color: 'white', 
                fontSize: '0.7rem', 
                fontWeight: 'bold',
                padding: '0.05rem 0.35rem', 
                borderRadius: '999px',
                marginLeft: '0.1rem'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Slide-out History Drawer */}
      <div ref={drawerRef} className={`history-drawer ${isDrawerOpen ? 'open' : ''}`}>
        
        {/* Drawer Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Notification History</h3>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)} 
            style={{ background: 'transparent', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Actions */}
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
              You have {unreadCount} unread notices
            </span>
            <button 
              onClick={markAllAsRead}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', height: '24px' }}
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          </div>
        )}

        {/* Drawer Body (List of items) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {history.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
              <Inbox size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No notifications found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map(notice => {
                const theme = getAlertStyles(notice.type);
                return (
                  <div 
                    key={notice.id} 
                    onClick={() => handleNoticeClick(notice)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      background: notice.is_read ? 'var(--bg-app)' : 'var(--bg-surface)', 
                      border: notice.is_read ? '1px solid var(--border-color)' : `1px solid ${theme.color}`,
                      borderLeft: `4px solid ${theme.color}`,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: notice.is_read ? 'none' : 'var(--shadow-sm)'
                    }}
                    className="history-card"
                  >
                    {!notice.is_read && (
                      <span style={{ 
                        position: 'absolute', top: '10px', right: '10px', 
                        width: '8px', height: '8px', background: 'var(--primary)', 
                        borderRadius: '50%' 
                      }} />
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ background: theme.bg, color: theme.color, fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                        {notice.type}
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
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default NotificationTicker;
