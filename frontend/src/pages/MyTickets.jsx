import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket as TicketIcon, Download, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTickets = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await api.get('/registrations/my');
        setRegistrations(res.data);
      } catch (err) {
        console.error('Failed to fetch registrations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading your tickets...</div>;

  return (
    <div className="animate-slide-up" style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1rem', background: 'var(--secondary-light)', borderRadius: '16px', color: 'var(--secondary)' }}>
          <TicketIcon size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>My <span className="gradient-text">Tickets</span></h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your registrations and download certificates.</p>
        </div>
      </div>
      
      {registrations.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '1.5rem', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            <TicketIcon size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Tickets Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You haven't registered for any upcoming events.</p>
          <Link to="/events" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Discover Events</Link>
        </div>
      ) : (
        <div className="card-grid">
          {registrations.map(reg => (
            <div key={reg.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              
              {/* Top Banner Status */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, padding: '0.5rem', textAlign: 'center',
                background: reg.status === 'attended' || reg.status === 'approved' ? 'var(--success)' : (reg.status === 'pending_members' ? '#f97316' : 'var(--primary)'),
                color: 'white', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em'
              }}>
                {reg.status === 'pending_members' ? 'Awaiting Teammates' : reg.status}
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '0.25rem', textAlign: 'center', fontSize: '1.4rem', fontWeight: '800' }}>
                {reg.event?.title || `Event #${reg.event_id}`}
              </h3>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
                {reg.event?.category}
              </p>

              {reg.is_team && reg.team_name && (
                <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                  👥 Team: {reg.team_name}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '1.5rem' }}>
                {reg.event?.date_time && (
                  <div>📅 {new Date(reg.event.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                )}
                {reg.event?.venue && (
                  <div>📍 {reg.event.venue}</div>
                )}
              </div>
              
              <div style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                marginBottom: '2rem', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {reg.status === 'pending_members' ? (
                  <>
                    <div style={{ filter: 'blur(6px)', opacity: 0.15 }}>
                      <QRCodeSVG value={reg.qr_code_data} size={180} />
                    </div>
                    <div style={{ 
                      position: 'absolute', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: '#f97316',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🔒</span>
                      <span>Ticket Locked</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Awaiting Teammates
                      </span>
                    </div>
                  </>
                ) : (
                  <QRCodeSVG value={reg.qr_code_data} size={180} />
                )}
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {reg.status === 'attended' 
                  ? 'Your attendance has been recorded successfully.' 
                  : (reg.status === 'pending_members' 
                    ? 'All teammates must register via the invite link to unlock entry ticket.' 
                    : 'Please present this QR code at the event entrance for scanning.')}
              </p>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link 
                  to={`/events/${reg.event_id}`} 
                  className="btn btn-secondary"
                  style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                >
                  Manage Team & View Event Hub
                </Link>

                {reg.status === 'attended' && (
                  <a 
                    href={`http://localhost:8000/api/v1/certificates/download/${reg.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--success)', background: 'var(--success)' }}
                  >
                    <Download size={18} /> Download Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
