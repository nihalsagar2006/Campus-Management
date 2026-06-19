import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hi! I am your Event Assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const { user } = useAuth();

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    try {
      const res = await api.post('/chatbot/', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting right now.' }]);
    }
  };

  if (!user) return null;

  return (
    <>
      <button 
        onClick={toggleChat}
        className="btn-primary"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', 
          width: '64px', height: '64px', borderRadius: '50%',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={28} color="white" />
      </button>

      {isOpen && (
        <div className="glass-panel animate-slide-up" style={{
          position: 'fixed', bottom: '7rem', right: '2rem',
          width: '380px', height: '550px',
          display: 'flex', flexDirection: 'column',
          zIndex: 1000, overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }}>
          <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Event Assistant</span>
            </div>
            <button onClick={toggleChat} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              <X size={18} />
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-app)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-surface)',
                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                padding: '1rem', borderRadius: '18px',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '18px',
                maxWidth: '85%', boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.5, fontSize: '0.95rem'
              }}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '1rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', gap: '0.75rem' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
              <Send size={18} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
