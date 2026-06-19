import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CalendarDays, MapPin, Users, Clock, Plus, CheckCircle, Info } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const { user } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', date_time: '', venue: '', capacity: '', deadline: ''
  });

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/');
      setEvents(res.data);
      if (user) {
        const regsRes = await api.get('/registrations/my');
        setMyRegistrations(regsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, capacity: parseInt(formData.capacity, 10) };
      dataToSubmit.date_time = new Date(formData.date_time).toISOString();
      dataToSubmit.deadline = new Date(formData.deadline).toISOString();
      
      await api.post('/events/', dataToSubmit);
      setShowForm(false);
      fetchEventsData();
    } catch (err) {
      console.error(err);
      alert('Error creating event.');
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post('/registrations/', { event_id: eventId });
      alert('Successfully registered! View your QR code in My Tickets.');
      fetchEventsData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to register');
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Campus <span className="gradient-text">Events</span></h2>
          <p style={{ color: 'var(--text-secondary)' }}>Discover and register for the latest happenings.</p>
        </div>
        
        {user?.is_admin && (
          <button className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : <><Plus size={18} /> Create Event</>}
          </button>
        )}
      </div>

      {showForm && user?.is_admin && (
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create New Event</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Category</label>
              <input type="text" name="category" placeholder="Technology, Sports..." value={formData.category} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Venue</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Date & Time</label>
              <input type="datetime-local" name="date_time" value={formData.date_time} onChange={handleChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Deadline</label>
                <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Publish Event</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>Loading events...</div>
      ) : (
        <div className="card-grid">
          {events.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--bg-surface)', borderRadius: '16px' }}>
              No events found. Check back later!
            </div>
          ) : events.map(event => (
            <div key={event.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Event Image Placeholder */}
              <div style={{ height: '160px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={48} color="var(--primary)" opacity={0.5} />
              </div>
              
              <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className="badge badge-primary">{event.category}</span>
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={12} /> Upcoming
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.description}
                </p>
                
                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CalendarDays size={16} color="var(--primary)" /> {new Date(event.date_time).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MapPin size={16} color="var(--primary)" /> {event.venue}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={16} color="var(--primary)" /> {event.capacity} seats limit
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  {(() => {
                    const myReg = myRegistrations.find(reg => reg.event_id === event.id);
                    if (myReg) {
                      return (
                        <Link 
                          to={`/events/${event.id}`} 
                          className="btn btn-secondary" 
                          style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: 'var(--success)', 
                            borderColor: 'var(--success)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                          }}
                        >
                          View Hub (Registered)
                        </Link>
                      );
                    } else {
                      return (
                        <Link 
                          to={`/events/${event.id}`} 
                          className="btn btn-primary" 
                          style={{ 
                            flex: 1, 
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Register / View Hub
                        </Link>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
