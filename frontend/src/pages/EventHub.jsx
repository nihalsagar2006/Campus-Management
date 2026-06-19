import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, Award, Users, Shield, Calendar, MapPin, Play, Plus, Trash, 
  Star, Code, Lightbulb, Vote, RefreshCw, Activity, ArrowLeft, Image as ImageIcon, 
  Megaphone, CheckCircle, Clock, FileText, BarChart3, ChevronRight, Download, Send, Eye,
  Copy, Edit3
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import EventCountdown from '../components/EventCountdown';

// Event-specific modular forms
const EsportsRegistrationForm = ({ extraDetails, setExtraDetails, onSubmit, isEditing, onCancel }) => {
  const details = extraDetails || {};
  const isTeam = details.selectedCategory && details.selectedCategory !== 'FIFA';
  
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #f97316' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎮 Esports Championship Registration
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Game Selection</label>
            <select 
              required
              value={details.selectedCategory || ''}
              onChange={(e) => {
                const game = e.target.value;
                let size = '1';
                if (game === 'Valorant') size = '5';
                else if (game && game !== 'FIFA') size = '4';
                setExtraDetails(prev => ({
                  ...(prev || {}),
                  selectedCategory: game,
                  teamSize: size
                }));
              }}
            >
              <option value="">Select Game</option>
              <option value="BGMI">BGMI</option>
              <option value="Free Fire">Free Fire</option>
              <option value="COD Mobile">COD Mobile</option>
              <option value="Valorant">Valorant</option>
              <option value="FIFA">FIFA</option>
            </select>
          </div>

          {isTeam && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter team name"
                  value={details.teamName || ''} 
                  onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamName: e.target.value }))} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Logo URL</label>
                <input 
                  type="text" 
                  required
                  placeholder="https://imgur.com/logo..."
                  value={details.teamLogo || ''} 
                  onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamLogo: e.target.value }))} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Size</label>
                <input 
                  type="number" 
                  min="2"
                  max="10"
                  required 
                  value={details.teamSize || ''} 
                  onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamSize: e.target.value }))} 
                />
              </div>
            </div>
          )}

          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: '#f97316' }}>
              {details.selectedCategory === 'FIFA' ? 'Player Profile Info' : 'IGL (Leader) Profile Info'}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{details.selectedCategory === 'FIFA' ? 'Player Name' : 'IGL Name'}</label>
                <input type="text" required value={details.iglName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglName: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{details.selectedCategory === 'FIFA' ? 'Player SRN' : 'IGL SRN'}</label>
                <input type="text" required value={details.iglSrn || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglSrn: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>In-Game Character UID</label>
                <input type="text" required placeholder="e.g. 518382902" value={details.inGameUid || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), inGameUid: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>In-Game Character Name (IGN)</label>
                <input type="text" required placeholder="e.g. Fatalist_GG" value={details.inGameName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), inGameName: e.target.value }))} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>In-Game Profile Picture URL</label>
              <input type="text" required placeholder="https://imgur.com/..." value={details.inGamePfp || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), inGamePfp: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch</label>
                <input type="text" required placeholder="e.g. CSE" value={details.branch || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), branch: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
                <input type="tel" required placeholder="e.g. 9876543210" value={details.phone || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), phone: e.target.value }))} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
              <input type="email" required placeholder="e.g. leader@example.com" value={details.email || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), email: e.target.value }))} />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#f97316', borderColor: '#f97316' }}>
            {isEditing ? 'Save Esports Changes' : 'Confirm Esports Registration'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const HackathonRegistrationForm = ({ extraDetails, setExtraDetails, onSubmit, isEditing, onCancel }) => {
  const details = extraDetails || {};

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #8b5cf6' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          💻 CodeSprint Hackathon Registration
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
              <input type="text" required placeholder="Enter team name" value={details.teamName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Size (1-4)</label>
              <select value={details.teamSize || '4'} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamSize: e.target.value }))}>
                <option value="1">1 Player (Solo)</option>
                <option value="2">2 Players</option>
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Leader Name</label>
              <input type="text" required value={details.iglName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Leader SRN</label>
              <input type="text" required value={details.iglSrn || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglSrn: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>College / Institution Name</label>
              <input type="text" required placeholder="e.g. PES University" value={details.collegeName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), collegeName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Idea Title</label>
              <input type="text" required placeholder="e.g. Smart Campus Map" value={details.projectTitle || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), projectTitle: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch / Dept</label>
              <input type="text" required placeholder="e.g. CSE" value={details.branch || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), branch: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input type="tel" required placeholder="e.g. 9876543210" value={details.phone || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
            <input type="email" required placeholder="e.g. email@example.com" value={details.email || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), email: e.target.value }))} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#8b5cf6', borderColor: '#8b5cf6' }}>
            {isEditing ? 'Save Hackathon Changes' : 'Confirm Hackathon Registration'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const ExhibitionRegistrationForm = ({ extraDetails, setExtraDetails, regType, setRegType, onSubmit, isEditing, onCancel }) => {
  const details = extraDetails || {};

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #8b5cf6' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🚀 TechNova Exhibition Registration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Registration Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                className={`btn ${regType === 'solo' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, background: regType === 'solo' ? '#8b5cf6' : 'transparent', color: regType === 'solo' ? 'white' : 'var(--text-primary)' }}
                onClick={() => setRegType('solo')}
              >
                Solo Registration
              </button>
              <button 
                type="button" 
                className={`btn ${regType === 'team' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, background: regType === 'team' ? '#8b5cf6' : 'transparent', color: regType === 'team' ? 'white' : 'var(--text-primary)' }}
                onClick={() => setRegType('team')}
              >
                Team Registration
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Category</label>
              <select required value={details.selectedCategory || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), selectedCategory: e.target.value }))}>
                <option value="">Select Category</option>
                <option value="Hardware">Hardware Project</option>
                <option value="Software">Software Project</option>
              </select>
            </div>
            {regType === 'team' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Size (2-4)</label>
                <select value={details.teamSize || '3'} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamSize: e.target.value }))}>
                  <option value="2">2 Players</option>
                  <option value="3">3 Players</option>
                  <option value="4">4 Players</option>
                </select>
              </div>
            )}
          </div>

          {regType === 'team' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
              <input type="text" required placeholder="Enter team name" value={details.teamName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamName: e.target.value }))} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Participant/Leader Name</label>
              <input type="text" required value={details.iglName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>SRN</label>
              <input type="text" required value={details.iglSrn || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglSrn: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Class Section</label>
              <input type="text" required placeholder="e.g. Sec C" value={details.section || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), section: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Faculty Mentor Name</label>
              <input type="text" required placeholder="e.g. Prof. R. Sharma" value={details.facultyMentor || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), facultyMentor: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Topic Title</label>
              <input type="text" required placeholder="e.g. IoT Smart Home" value={details.topicName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), topicName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Brief Description</label>
              <input type="text" required placeholder="Brief summary of prototype..." value={details.projectDescription || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), projectDescription: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch / Dept</label>
              <input type="text" required placeholder="e.g. CSE" value={details.branch || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), branch: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input type="tel" required placeholder="e.g. 9876543210" value={details.phone || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
            <input type="email" required placeholder="e.g. email@example.com" value={details.email || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), email: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#8b5cf6', borderColor: '#8b5cf6' }}>
            {isEditing ? 'Save Exhibition Changes' : 'Confirm Exhibition Registration'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const PitchRegistrationForm = ({ extraDetails, setExtraDetails, onSubmit, isEditing, onCancel }) => {
  const details = extraDetails || {};

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #eab308' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: '#eab308', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          💡 Entrepreneurship Pitch & Vibe Registration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
              <input type="text" required placeholder="Enter team name" value={details.teamName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Size (1-5)</label>
              <select value={details.teamSize || '3'} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamSize: e.target.value }))}>
                <option value="1">1 Founder (Solo)</option>
                <option value="2">2 Players</option>
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
                <option value="5">5 Players</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Leader/Founder Name</label>
              <input type="text" required value={details.iglName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Leader SRN</label>
              <input type="text" required value={details.iglSrn || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglSrn: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Startup Idea Name</label>
              <input type="text" required placeholder="e.g. AgriTech AI" value={details.startupIdeaName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), startupIdeaName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Startup Category</label>
              <select value={details.startupCategory || 'Tech'} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), startupCategory: e.target.value }))}>
                <option value="Tech">Technology / AI</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Sustainability">Sustainability / Green</option>
                <option value="Biotech">Biotech / Health</option>
                <option value="Social">Social Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Brief Description of the Startup Idea</label>
            <textarea rows="3" required placeholder="Explain your business model and target audience..." value={details.startupDescription || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), startupDescription: e.target.value }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch / Dept</label>
              <input type="text" required placeholder="e.g. CSE" value={details.branch || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), branch: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input type="tel" required placeholder="e.g. 9876543210" value={details.phone || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
            <input type="email" required placeholder="e.g. email@example.com" value={details.email || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), email: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#eab308', borderColor: '#eab308' }}>
            {isEditing ? 'Save Pitch Changes' : 'Confirm Pitch Registration'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const SportsRegistrationForm = ({ extraDetails, setExtraDetails, onSubmit, isEditing, onCancel }) => {
  const details = extraDetails || {};

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #0ea5e9' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚽ Sports Arena Registration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Choose Sport</label>
              <select 
                required
                value={details.selectedCategory || ''}
                onChange={(e) => {
                  const sport = e.target.value;
                  const size = sport === 'Cricket' ? 11 : 7;
                  setExtraDetails(prev => ({ ...(prev || {}), selectedCategory: sport, teamSize: size }));
                }}
              >
                <option value="">Select Sport</option>
                <option value="Cricket">Cricket (11 Players)</option>
                <option value="Football">Football (7 Players)</option>
                <option value="Kabaddi">Kabaddi (7 Players)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Team Logo URL (Optional)</label>
              <input type="text" placeholder="https://imgur.com/logo..." value={details.teamLogo || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamLogo: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
            <input type="text" required placeholder="Enter team name" value={details.teamName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), teamName: e.target.value }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Captain Name</label>
              <input type="text" required value={details.iglName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Captain SRN</label>
              <input type="text" required value={details.iglSrn || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglSrn: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch / Dept</label>
              <input type="text" required placeholder="e.g. CSE" value={details.branch || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), branch: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input type="tel" required placeholder="e.g. 9876543210" value={details.phone || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
            <input type="email" required placeholder="e.g. email@example.com" value={details.email || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), email: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#0ea5e9', borderColor: '#0ea5e9' }}>
            {isEditing ? 'Save Sports Changes' : 'Confirm Sports Registration'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const GeneralRegistrationForm = ({ extraDetails, setExtraDetails, onSubmit, isEditing, onCancel }) => {
  const details = extraDetails || {};

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✨ Event Registration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name</label>
              <input type="text" required value={details.name || details.iglName || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), name: e.target.value, iglName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>SRN</label>
              <input type="text" required value={details.iglSrn || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), iglSrn: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Branch / Dept</label>
              <input type="text" required placeholder="e.g. CSE" value={details.branch || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), branch: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
              <input type="tel" required placeholder="e.g. 9876543210" value={details.phone || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
            <input type="email" required placeholder="e.g. email@example.com" value={details.email || ''} onChange={(e) => setExtraDetails(prev => ({ ...(prev || {}), email: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
            {isEditing ? 'Save Changes' : 'Confirm Registration'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const EventHub = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [teamStatus, setTeamStatus] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [allRegistrations, setAllRegistrations] = useState([]); // for admin panel

  // Loading, tab, and edit states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [modifyForm, setModifyForm] = useState(null); // admin modification popup

  // Custom Form state for Registration
  const [regType, setRegType] = useState('solo'); // 'solo' or 'team'
  const [extraDetails, setExtraDetails] = useState({
    selectedCategory: '', // game or sport
    teamName: '',
    teamLogo: '',
    teamSize: '4',
    // Esports Character IGL
    iglName: '',
    iglSrn: '',
    inGameUid: '',
    inGameName: '',
    inGamePfp: '',
    // Hackathon
    projectTitle: '',
    collegeName: '',
    // Exhibition
    section: '',
    topicName: '',
    projectDescription: '',
    facultyMentor: '',
    // Pitch & Vibe
    startupIdeaName: '',
    startupCategory: 'Tech',
    startupDescription: '',
    // General
    department: '',
    branch: '',
    phone: '',
    email: '',
    name: ''
  });

  useEffect(() => {
    if (user) {
      setExtraDetails(prev => ({
        ...prev,
        iglName: prev.iglName || user.full_name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // CodeSprint Project Submission state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [techStack, setTechStack] = useState('');
  const [extraSubmissionFields, setExtraSubmissionFields] = useState({
    projectType: 'Software',
    workingPrototype: 'No'
  });

  // Admin Actions form states
  const [annForm, setAnnForm] = useState({ title: '', content: '', is_pinned: false });
  const [galForm, setGalForm] = useState({ image_url: '', caption: '' });
  const [fixtureForm, setFixtureForm] = useState({
    stage: '', team_a: '', team_b: '', score_a: 0, score_b: 0, winner: '', status: 'scheduled', round_num: 1, match_time: ''
  });
  const [leaderboardForm, setLeaderboardForm] = useState({
    category: '', team_name: '', played: 0, won: 0, lost: 0, drawn: 0, points: 0, extra_stats: ''
  });
  const [gradingForm, setGradingForm] = useState({
    submissionId: null, score_innovation: 0, score_technical: 0, score_impact: 0,
    score_business_model: 0, score_market_strategy: 0, score_feasibility: 0, feedback: ''
  });

  // Fetch all data for the event
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data);

      // Check current user's registration
      const regsRes = await api.get('/registrations/my');
      const currentReg = regsRes.data.find(r => r.event_id === parseInt(eventId, 10));
      setRegistration(currentReg || null);

      // If registered, fetch team status progress
      if (currentReg && currentReg.is_team) {
        try {
          const teamRes = await api.get(`/registrations/team-status/${currentReg.id}`);
          setTeamStatus(teamRes.data);
        } catch (err) {
          console.error("Failed to fetch team status", err);
        }
      } else {
        setTeamStatus(null);
      }

      const annRes = await api.get(`/event_features/${eventId}/announcements`);
      setAnnouncements(annRes.data);

      const galRes = await api.get(`/event_features/${eventId}/gallery`);
      setGallery(galRes.data);

      const subRes = await api.get(`/event_features/${eventId}/projects`);
      setSubmissions(subRes.data);

      const fixRes = await api.get(`/event_features/${eventId}/fixtures`);
      setFixtures(fixRes.data);

      const leadRes = await api.get(`/event_features/${eventId}/leaderboard`);
      setLeaderboard(leadRes.data);

      const analyticRes = await api.get(`/event_features/${eventId}/analytics`);
      setAnalytics(analyticRes.data);

      if (user?.is_admin) {
        try {
          const allRegsRes = await api.get(`/event_features/${eventId}/registrations`);
          setAllRegistrations(allRegsRes.data);
        } catch (err) {
          console.error("Failed to fetch all registrations", err);
        }
      }
    } catch (error) {
      console.error("Error loading Event Hub data", error);
      alert("Error loading event. It might not exist.");
      navigate('/events');
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.is_admin, navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Event Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      let isTeamVal = false;
      let teamNameVal = null;
      let teamLogoVal = null;
      let teamSizeVal = 1;

      // Map event specific rules
      if (event.category === 'Esports') {
        const game = extraDetails.selectedCategory;
        if (game && game !== 'FIFA') {
          isTeamVal = true;
          teamNameVal = extraDetails.teamName;
          teamLogoVal = extraDetails.teamLogo;
          teamSizeVal = parseInt(extraDetails.teamSize, 10) || (game === 'Valorant' ? 5 : 4);
        }
      } else if (event.category === 'Technology' && event.title.includes('Hackathon')) {
        isTeamVal = true;
        teamNameVal = extraDetails.teamName;
        teamSizeVal = parseInt(extraDetails.teamSize, 10) || 4;
      } else if (event.category === 'Technology' && event.title.includes('Exhibition')) {
        isTeamVal = regType === 'team';
        teamNameVal = regType === 'team' ? extraDetails.teamName : null;
        teamSizeVal = regType === 'team' ? (parseInt(extraDetails.teamSize, 10) || 3) : 1;
      } else if (event.category === 'Business') {
        isTeamVal = true;
        teamNameVal = extraDetails.teamName;
        teamSizeVal = parseInt(extraDetails.teamSize, 10) || 3;
      } else if (event.category === 'Sports') {
        isTeamVal = true;
        teamNameVal = extraDetails.teamName;
        teamLogoVal = extraDetails.teamLogo;
        const sport = extraDetails.selectedCategory;
        teamSizeVal = sport === 'Cricket' ? 11 : 7;
      }

      const payload = {
        event_id: parseInt(eventId, 10),
        extra_details: JSON.stringify(extraDetails),
        is_team: isTeamVal,
        team_name: teamNameVal,
        team_logo: teamLogoVal,
        team_size: teamSizeVal
      };

      if (isEditing) {
        await api.put(`/registrations/${registration.id}`, payload);
        alert('Registration details updated!');
        setIsEditing(false);
      } else {
        const res = await api.post('/registrations/', payload);
        alert('Registration successful! Team initialized and invite code generated.');
        setRegistration(res.data);
      }
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Registration failed');
    }
  };

  // Download PDF Confirmation
  const downloadConfirmationPdf = async (regId, eventTitle) => {
    try {
      const response = await api.get(`/registrations/${regId}/confirmation-pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `registration_confirmation_${eventTitle.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to download registration confirmation receipt.');
    }
  };

  // Download PDF Certificate
  const downloadCertificate = async (regId, eventTitle) => {
    try {
      const response = await api.get(`/certificates/download/${regId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `certificate_${eventTitle.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to download certificate. Verify you have been marked attended!');
    }
  };

  // Project Submission (Hackathon / Exhibition / Pitch)
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const fields = { ...extraSubmissionFields };
      if (event.category === 'Business') {
        fields.startupStage = extraDetails.startupStage;
        fields.pitchDeckUrl = extraDetails.pitchDeckUrl;
        fields.mentorNeeded = extraDetails.mentorNeeded;
      } else if (event.category === 'Technology' && event.title.includes('Exhibition')) {
        fields.projectType = extraDetails.selectedCategory || 'Software';
      }

      await api.post(`/event_features/${eventId}/submit_project`, {
        title: projectTitle,
        description: projectDesc,
        github_link: githubLink,
        tech_stack: techStack,
        extra_fields: JSON.stringify(fields)
      });
      alert('Project submitted successfully!');
      setProjectTitle('');
      setProjectDesc('');
      setGithubLink('');
      setTechStack('');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Project submission failed');
    }
  };

  // Visitor Project Voting (TechNova)
  const handleProjectVote = async (projId) => {
    try {
      const res = await api.post(`/event_features/projects/${projId}/vote`);
      alert(res.data.message);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Voting failed');
    }
  };

  // ADMIN ACTION: Publish Announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/event_features/${eventId}/announcements`, annForm);
      alert('Announcement published!');
      setAnnForm({ title: '', content: '', is_pinned: false });
      fetchAllData();
    } catch (err) {
      alert('Failed to publish announcement');
    }
  };

  // ADMIN ACTION: Delete Announcement
  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/event_features/announcements/${annId}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  // ADMIN ACTION: Add Gallery Image
  const handleAddGallery = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/event_features/${eventId}/gallery`, galForm);
      alert('Image added to gallery!');
      setGalForm({ image_url: '', caption: '' });
      fetchAllData();
    } catch (err) {
      alert('Failed to add gallery image');
    }
  };

  // ADMIN ACTION: Delete Gallery Image
  const handleDeleteGallery = async (galId) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await api.delete(`/event_features/gallery/${galId}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete gallery image');
    }
  };

  // ADMIN ACTION: Mark Attendance manually
  const handleMarkAttendanceAdmin = async (qrCodeData) => {
    try {
      await api.post(`/registrations/mark_attendance?qr_code_data=${qrCodeData}`);
      alert('Attendance verified successfully!');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to verify attendance');
    }
  };

  // ADMIN ACTION: Award Custom Certificate (Winner, MVP, etc.)
  const handleIssueCertificateAdmin = async (userId, role) => {
    try {
      await api.post(`/event_features/${eventId}/issue_custom_certificate`, {
        user_id: userId,
        certificate_role: role
      });
      alert(`Custom certificate (${role}) issued!`);
      fetchAllData();
    } catch (err) {
      alert('Failed to issue certificate');
    }
  };

  // ADMIN ACTION: Add Fixture
  const handleAddFixture = async (e) => {
    e.preventDefault();
    try {
      const data = { ...fixtureForm };
      if (data.match_time) {
        data.match_time = new Date(data.match_time).toISOString();
      } else {
        data.match_time = null;
      }
      await api.post(`/event_features/${eventId}/fixtures`, data);
      alert('Fixture created!');
      setFixtureForm({
        stage: '', team_a: '', team_b: '', score_a: 0, score_b: 0, winner: '', status: 'scheduled', round_num: 1, match_time: ''
      });
      fetchAllData();
    } catch (err) {
      alert('Failed to create fixture');
    }
  };

  // ADMIN ACTION: Update Fixture Score / Winner
  const handleUpdateFixture = async (fixtureId, updatedData) => {
    try {
      await api.put(`/event_features/fixtures/${fixtureId}`, updatedData);
      alert('Fixture updated successfully!');
      fetchAllData();
    } catch (err) {
      alert('Failed to update fixture');
    }
  };

  // ADMIN ACTION: Delete Fixture
  const handleDeleteFixture = async (fixtureId) => {
    if (!window.confirm('Delete this fixture?')) return;
    try {
      await api.delete(`/event_features/fixtures/${fixtureId}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete fixture');
    }
  };

  // ADMIN ACTION: Add/Update Leaderboard Standing
  const handleUpsertLeaderboard = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/event_features/${eventId}/leaderboard`, leaderboardForm);
      alert('Leaderboard updated!');
      setLeaderboardForm({
        category: '', team_name: '', played: 0, won: 0, lost: 0, drawn: 0, points: 0, extra_stats: ''
      });
      fetchAllData();
    } catch (err) {
      alert('Failed to update leaderboard');
    }
  };

  // ADMIN ACTION: Delete Leaderboard Row
  const handleDeleteLeaderboardRow = async (rowId) => {
    if (!window.confirm('Remove this standing?')) return;
    try {
      await api.delete(`/event_features/leaderboard/${rowId}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete standing row');
    }
  };

  // ADMIN ACTION: Grade Project Submission
  const handleGradeProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/event_features/projects/${gradingForm.submissionId}/grade`, {
        score_innovation: parseInt(gradingForm.score_innovation, 10),
        score_technical: parseInt(gradingForm.score_technical, 10),
        score_impact: parseInt(gradingForm.score_impact, 10),
        score_business_model: parseInt(gradingForm.score_business_model, 10),
        score_market_strategy: parseInt(gradingForm.score_market_strategy, 10),
        score_feasibility: parseInt(gradingForm.score_feasibility, 10),
        feedback: gradingForm.feedback
      });
      alert('Grades submitted successfully!');
      setGradingForm({
        submissionId: null, score_innovation: 0, score_technical: 0, score_impact: 0,
        score_business_model: 0, score_market_strategy: 0, score_feasibility: 0, feedback: ''
      });
      fetchAllData();
    } catch (err) {
      alert('Failed to submit grades');
    }
  };

  // ADMIN ACTION: Approve/Reject Team
  const handleApproveTeam = async (regId) => {
    try {
      await api.post(`/registrations/${regId}/approve`);
      alert('Team registration approved successfully!');
      fetchAllData();
    } catch (err) {
      alert('Failed to approve registration');
    }
  };

  const handleRejectTeam = async (regId) => {
    try {
      await api.post(`/registrations/${regId}/reject`);
      alert('Team registration rejected successfully!');
      fetchAllData();
    } catch (err) {
      alert('Failed to reject registration');
    }
  };

  const startModifyAdmin = (reg) => {
    setModifyForm({
      id: reg.id,
      team_name: reg.team_name || '',
      team_logo: reg.team_logo || '',
      team_size: reg.team_size || 1,
      extra_details: reg.extra_details || '{}'
    });
  };

  const handleModifyAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/registrations/${modifyForm.id}/modify`, {
        event_id: parseInt(eventId, 10),
        team_name: modifyForm.team_name,
        team_logo: modifyForm.team_logo,
        team_size: parseInt(modifyForm.team_size, 10),
        extra_details: modifyForm.extra_details
      });
      alert('Registration details modified successfully!');
      setModifyForm(null);
      fetchAllData();
    } catch (err) {
      alert('Failed to modify registration');
    }
  };

  // Group registrations by team
  const groupRegistrations = () => {
    const groups = {};
    allRegistrations.forEach(reg => {
      const groupId = reg.team_id ? reg.team_id : reg.id;
      if (!groups[groupId]) {
        groups[groupId] = {
          leader: null,
          members: [],
          is_team: reg.is_team,
          team_name: reg.team_name,
          team_logo: reg.team_logo,
          team_size: reg.team_size,
          status: reg.status,
          groupId: groupId
        };
      }
      if (reg.team_id === null) {
        groups[groupId].leader = reg;
      } else {
        groups[groupId].members.push(reg);
      }
    });
    return Object.values(groups);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>Loading Event Hub...</div>;
  }

  // Get Custom Icon based on category
  const getEventIcon = () => {
    switch(event.category) {
      case 'Esports': return <Trophy size={48} color="white" />;
      case 'Sports': return <Activity size={48} color="white" />;
      case 'Business': return <Lightbulb size={48} color="white" />;
      default: return <Code size={48} color="white" />;
    }
  };

  // Copy invitation link to clipboard
  const copyInviteLink = (code) => {
    const inviteUrl = `${window.location.origin}/register/join/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invitation link copied to clipboard!');
  };

  return (
    <div className="animate-slide-up" style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back to Events Link */}
      <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={18} /> Back to Events
      </Link>

      {/* Hero Header Area */}
      <div className="glass-panel" style={{ 
        padding: '3rem', 
        marginBottom: '2.5rem', 
        background: 'linear-gradient(135deg, var(--primary-light), var(--bg-glass))',
        borderLeft: '5px solid var(--primary)',
        borderRadius: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-primary">{event.category}</span>
            <span className="badge badge-success">{event.status}</span>
            {registration && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={12} /> Registered
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>{event.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem', maxWidth: '750px', lineHeight: 1.6 }}>
            {event.description}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" /> {new Date(event.date_time).toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" /> {event.venue}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--primary)" /> {event.capacity} Max Seats ({analytics?.total_registrations || 0} Registered)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '100px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}>
          {getEventIcon()}
        </div>
      </div>

      {/* Dynamic Tab Navigation */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        padding: '0.5rem', 
        borderRadius: '16px', 
        marginBottom: '2.5rem', 
        overflowX: 'auto',
        gap: '0.5rem'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
          { id: 'register', label: registration ? 'Team & Ticket' : 'Register', icon: <Users size={16} /> },
          { id: 'announcements', label: `Announcements (${announcements.length})`, icon: <Megaphone size={16} /> },
          { id: 'gallery', label: `Gallery (${gallery.length})`, icon: <ImageIcon size={16} /> },
          { id: 'results', label: 'Results & Standings', icon: <Trophy size={16} /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
          ...(user?.is_admin ? [{ id: 'admin', label: 'Admin Controls', icon: <Shield size={16} /> }] : [])
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`btn`} 
            style={{ 
              flex: '1 0 auto',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
              borderRadius: '12px',
              padding: '0.6rem 1.2rem',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="tab-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Event Details</h2>
              <p style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {event.description}
              </p>
              
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Rules & Guidelines</h3>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 2, marginBottom: '2rem' }}>
                {event.category === 'Esports' && (
                  <>
                    <li>Squad Games require full teammate registration through the invite code to complete team signups.</li>
                    <li>BGMI/FF/CODM Squads consist of 4 players; Valorant Squad consists of 5 players. FIFA is Solo.</li>
                    <li>Modifying hack tools or third-party script overrides will result in immediate disqualification.</li>
                    <li>All character profiles and Character UIDs must be verified before match check-in.</li>
                  </>
                )}
                {event.category === 'Technology' && event.title.includes('Hackathon') && (
                  <>
                    <li>CodeSprint Innovation Challenge: Total duration is 6 continuous hours.</li>
                    <li>Teams must have 1-4 players. Invites are shared from the Leader's dashboard.</li>
                    <li>Prototyping must happen during the live hackathon. Pre-built codes will be flagged.</li>
                    <li>Project submissions must point to working code links and active Github repos.</li>
                  </>
                )}
                {event.category === 'Technology' && event.title.includes('Exhibition') && (
                  <>
                    <li>Both Individual and Team registrations are supported (Team size up to 4).</li>
                    <li>Exhibits fit in categories: IoT, Robotics, AI, Websites, Mobile Apps, Research.</li>
                    <li>Visitors can cast one vote. Cash prizes awarded for visitor-choice and professional awards.</li>
                    <li>Judges evaluate on Tech Design, Novelty, Feasibility, and Faculty Mentorship.</li>
                  </>
                )}
                {event.category === 'Business' && (
                  <>
                    <li>Pitch Model: Present business model, pitch decks, and mockups in 5 minutes + 3 min Q&A.</li>
                    <li>Incubation, funding networks, and expert mentorship awards will be announced.</li>
                    <li>Pitch decks must be uploaded before deadlines via the Event Hub results tab.</li>
                  </>
                )}
                {event.category === 'Sports' && (
                  <>
                    <li>Inter-department league: Cricket (11 players), Football (7 players), Kabaddi (7 players).</li>
                    <li>Team lists are locked only after all players join via the captain's invitation link.</li>
                    <li>Official university player IDs are required for check-in on game day.</li>
                  </>
                )}
              </ul>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Event Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>09:00 AM</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Inauguration & Welcoming</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Main Seminar Hall</p>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>10:30 AM</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Rounds / Pitches / Matches Start</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Respective Venues</p>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>04:00 PM</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Award Ceremony & Valedictory</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Main Arena</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--secondary-light), transparent)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Prizes & Certs</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Top teams receive exclusive trophies, cash rewards, and official Digital Certificates signed by the organizing committee.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--secondary)', fontWeight: 700 }}>
                  <Award size={24} />
                  <span>Digital Certificates Issued Instantly!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER / TICKET TAB */}
        {activeTab === 'register' && (
          <div className="animate-slide-up" style={{ maxWidth: '750px', margin: '0 auto' }}>
            
            {/* 1. EDIT MODE OR NOT REGISTERED YET */}
            {(!registration || isEditing) ? (
              <div>
                {(() => {
                  if (event.category === 'Esports') {
                    return (
                      <EsportsRegistrationForm 
                        extraDetails={extraDetails} 
                        setExtraDetails={setExtraDetails} 
                        onSubmit={handleRegister} 
                        isEditing={isEditing} 
                        onCancel={() => setIsEditing(false)} 
                      />
                    );
                  } else if (event.category === 'Technology' && event.title.includes('Hackathon')) {
                    return (
                      <HackathonRegistrationForm 
                        extraDetails={extraDetails} 
                        setExtraDetails={setExtraDetails} 
                        onSubmit={handleRegister} 
                        isEditing={isEditing} 
                        onCancel={() => setIsEditing(false)} 
                      />
                    );
                  } else if (event.category === 'Technology' && event.title.includes('Exhibition')) {
                    return (
                      <ExhibitionRegistrationForm 
                        extraDetails={extraDetails} 
                        setExtraDetails={setExtraDetails} 
                        regType={regType}
                        setRegType={setRegType}
                        onSubmit={handleRegister} 
                        isEditing={isEditing} 
                        onCancel={() => setIsEditing(false)} 
                      />
                    );
                  } else if (event.category === 'Business') {
                    return (
                      <PitchRegistrationForm 
                        extraDetails={extraDetails} 
                        setExtraDetails={setExtraDetails} 
                        onSubmit={handleRegister} 
                        isEditing={isEditing} 
                        onCancel={() => setIsEditing(false)} 
                      />
                    );
                  } else if (event.category === 'Sports') {
                    return (
                      <SportsRegistrationForm 
                        extraDetails={extraDetails} 
                        setExtraDetails={setExtraDetails} 
                        onSubmit={handleRegister} 
                        isEditing={isEditing} 
                        onCancel={() => setIsEditing(false)} 
                      />
                    );
                  } else {
                    return (
                      <GeneralRegistrationForm 
                        extraDetails={extraDetails} 
                        setExtraDetails={setExtraDetails} 
                        onSubmit={handleRegister} 
                        isEditing={isEditing} 
                        onCancel={() => setIsEditing(false)} 
                      />
                    );
                  }
                })()}
              </div>
            ) : (
              
              /* 2. USER IS REGISTERED: Show Dashboard or Ticket QR */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* 🔮 TEAM MANAGEMENT DASHBOARD */}
                {registration.is_team && teamStatus && (
                  <div className="glass-panel" style={{ padding: '2.5rem', borderTop: `5px solid var(--primary)` }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                          Team Roster Dashboard
                        </span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0' }}>{teamStatus.team_name}</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Registration Status: <strong style={{ color: teamStatus.status === 'approved' ? 'var(--success)' : 'var(--primary)' }}>{teamStatus.status.toUpperCase()}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => downloadConfirmationPdf(registration.id, event.title)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Download size={14} /> PDF Confirmation
                        </button>
                        {new Date() < new Date(event.deadline) && (
                          <button 
                            onClick={() => {
                              try {
                                setExtraDetails(JSON.parse(registration.extra_details || '{}') || {});
                              } catch {}
                              setIsEditing(true);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Edit3 size={14} /> Edit Details
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        <span>Teammates Enrollment Progress</span>
                        <span style={{ color: 'var(--primary)' }}>
                          {teamStatus.joined_count} / {teamStatus.team_size} joined
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${(teamStatus.joined_count / teamStatus.team_size) * 100}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>

                      {/* Invitation Link copy box */}
                      {teamStatus.invite_code && (
                        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Teammate Invitation Link</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              readOnly 
                              style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'var(--bg-surface)', flex: 1 }}
                              value={`${window.location.origin}/register/join/${teamStatus.invite_code}`} 
                            />
                            <button 
                              onClick={() => copyInviteLink(teamStatus.invite_code)} 
                              className="btn btn-primary"
                              style={{ padding: '0 1rem', fontSize: '0.8rem', height: '34px', borderRadius: '8px' }}
                            >
                              <Copy size={14} /> Copy Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirmed and Pending slots list */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Joined Team Roster</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                      {/* Joined members */}
                      {teamStatus.members.map((m, idx) => (
                        <div 
                          key={m.registration_id} 
                          style={{ 
                            padding: '1.25rem', 
                            background: 'var(--bg-app)', 
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                              {m.is_leader ? 'Leader (IGL)' : `Teammate ${idx + 1}`}
                            </span>
                            <span className="badge badge-success" style={{ fontSize: '0.55rem', padding: '0.05rem 0.35rem' }}>Joined</span>
                          </div>
                          <strong style={{ fontSize: '0.95rem' }}>{m.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.email}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>SRN: {m.extra_details.srn || m.extra_details.iglSrn || 'N/A'}</span>
                          {m.extra_details.inGameName && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>IGN: {m.extra_details.inGameName}</span>
                          )}
                        </div>
                      ))}

                      {/* Pending slots placeholder cards */}
                      {Array.from({ length: teamStatus.slots_left }).map((_, idx) => (
                        <div 
                          key={`pending-${idx}`} 
                          style={{ 
                            padding: '1.25rem', 
                            background: 'transparent', 
                            borderRadius: '12px',
                            border: '2px dashed var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '110px',
                            color: 'var(--text-tertiary)'
                          }}
                        >
                          <Clock size={20} style={{ animation: 'spin 4s linear infinite', marginBottom: '0.4rem' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Awaiting Teammate</span>
                          <span style={{ fontSize: '0.65rem' }}>Share invite link to join</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket Entry Card */}
                <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, padding: '0.5rem', textAlign: 'center',
                    background: registration.status === 'approved' ? 'var(--success)' : (registration.status === 'attended' ? 'var(--success)' : 'var(--warning)'),
                    color: 'white', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}>
                    {registration.status === 'pending' ? 'Pending Approval' : (registration.status === 'pending_members' ? 'Awaiting Teammates' : registration.status)}
                  </div>

                  <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.6rem' }}>{event.title} Entry Ticket</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {registration.status === 'attended' ? <CheckCircle size={18} color="var(--success)" /> : <Clock size={18} />}
                    {registration.status === 'attended' ? 'Check-in Verified' : 'Awaiting Check-in at Venue'}
                  </p>

                  <div style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '24px', 
                    marginBottom: '2rem', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {registration.status === 'pending_members' ? (
                      <>
                        <div style={{ filter: 'blur(6px)', opacity: 0.15 }}>
                          <QRCodeSVG value={registration.qr_code_data} size={200} />
                        </div>
                        <div style={{ 
                          position: 'absolute', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: 'var(--warning)',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '1rem'
                        }}>
                          <Shield size={48} style={{ strokeWidth: 2 }} />
                          <span style={{ fontSize: '0.9rem' }}>Ticket Locked</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Awaiting teammates ({teamStatus?.joined_count || 1}/{teamStatus?.team_size || 4})
                          </span>
                        </div>
                      </>
                    ) : (
                      <QRCodeSVG value={registration.qr_code_data} size={200} />
                    )}
                  </div>

                  <div style={{ width: '100%', background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Ticket ID:</strong> #{registration.id}</div>
                    <div><strong>Student Name:</strong> {user.full_name}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    {registration.extra_details && (
                      <>
                        {(() => {
                          try {
                            const details = JSON.parse(registration.extra_details);
                            return (
                              <>
                                {details.selectedCategory && <div><strong>Selected Category:</strong> {details.selectedCategory}</div>}
                                {details.teamName && <div><strong>Team Name:</strong> {details.teamName}</div>}
                                {details.branch && <div><strong>Branch:</strong> {details.branch}</div>}
                                {details.inGameName && <div><strong>In-Game character (IGN):</strong> {details.inGameName}</div>}
                              </>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </>
                    )}
                  </div>

                  {registration.status === 'attended' ? (
                    <button 
                      onClick={() => downloadCertificate(registration.id, event.title)}
                      className="btn btn-primary"
                      style={{ width: '100%', gap: '0.5rem' }}
                    >
                      <Download size={20} /> Download Digital Certificate
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                      {!registration.is_team && (
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                          <button 
                            onClick={() => downloadConfirmationPdf(registration.id, event.title)}
                            className="btn btn-primary"
                            style={{ flex: 1, gap: '0.4rem', fontSize: '0.85rem' }}
                          >
                            <Download size={16} /> PDF Confirmation
                          </button>
                          {new Date() < new Date(event.deadline) && (
                            <button 
                              onClick={() => {
                                try {
                                  setExtraDetails(JSON.parse(registration.extra_details || '{}') || {});
                                } catch {}
                                setIsEditing(true);
                              }}
                              className="btn btn-secondary"
                              style={{ flex: 1, gap: '0.4rem', fontSize: '0.85rem' }}
                            >
                              <Edit3 size={16} /> Edit Details
                            </button>
                          )}
                        </div>
                      )}
                      {registration.status === 'pending_members' ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--warning)', textAlign: 'center', margin: 0, fontWeight: 600 }}>
                          ⚠️ Your check-in ticket is locked because your team is not fully registered. Teammates must join via the invite link to unlock.
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: 0 }}>
                          Show this QR ticket at the registration desk on event day to verify attendance and check-in.
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Official Event Announcements</h2>
            
            {announcements.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '4rem' }}>No announcements published for this event yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {announcements.map(ann => (
                  <div key={ann.id} className="glass-panel" style={{ padding: '2rem', position: 'relative', borderLeft: ann.is_pinned ? '4px solid var(--secondary)' : '1px solid var(--border-color)' }}>
                    {ann.is_pinned && (
                      <span className="badge badge-secondary" style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.65rem' }}>Pinned</span>
                    )}
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: 700 }}>{ann.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{ann.content}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1.25rem' }}>
                      Published: {new Date(ann.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Event Photos & Captures</h2>
            {gallery.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '4rem' }}>Exhibition images will be uploaded during/after the event.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {gallery.map(img => (
                  <div key={img.id} className="glass-panel animate-slide-up" style={{ padding: '0.5rem', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {img.caption && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0 0.5rem 0.5rem' }}>{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESULTS & STANDINGS TAB */}
        {activeTab === 'results' && (
          <div className="animate-slide-up">
            
            {/* CODESPRINT HACKATHON HUB */}
            {event.category === 'Technology' && event.title.includes('Hackathon') && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code size={22} color="var(--primary)" /> Projects Submitted for Evaluation
                  </h3>

                  {/* Form to submit project if registered */}
                  {registration && registration.status === 'approved' && (
                    <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                      <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Submit Hackathon Prototype</h4>
                      <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Title</label>
                          <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Smart Transport App" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Github Repository Link</label>
                          <input type="url" required value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/username/repo" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Technology Stack (Comma separated)</label>
                          <input type="text" required value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="e.g. React, Python FastAPI, PostgreSQL" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Idea Description & Prototype Flow</label>
                          <textarea rows="3" required value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Briefly describe what your prototype builds and how to review it..." />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', width: '100%' }}>Submit Hackathon Project</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {submissions.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '3rem' }}>No submissions yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {submissions.map(sub => (
                        <div key={sub.id} style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{sub.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Submitted by: {sub.user_name}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>{sub.description}</p>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                            {sub.tech_stack && <div><strong>Tech:</strong> {sub.tech_stack}</div>}
                            {sub.github_link && <div><strong>Github:</strong> <a href={sub.github_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>View Repo</a></div>}
                          </div>

                          {/* Scoring info */}
                          {(sub.score_innovation > 0 || sub.score_technical > 0) && (
                            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--success)', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <div>Innovation: <span style={{ color: 'var(--primary)' }}>{sub.score_innovation}/10</span></div>
                                <div>Technical: <span style={{ color: 'var(--primary)' }}>{sub.score_technical}/10</span></div>
                                <div>Impact: <span style={{ color: 'var(--primary)' }}>{sub.score_impact}/10</span></div>
                              </div>
                              {sub.feedback && <div style={{ color: 'var(--text-secondary)' }}><strong>Feedback:</strong> {sub.feedback}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Hackathon Tracks</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Track 1: Campus Utility</strong>
                      Create software to improve college campus logistics, mapping, or student services.
                    </div>
                    <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Track 2: AI Automation</strong>
                      Apply machine learning models or Large Language Models to solve real-world study aids.
                    </div>
                    <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Track 3: Social & Sustainability</strong>
                      Solve local waste, carbon foot printing, or social outreach problems in universities.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TECHNOVA EXHIBITION HUB */}
            {event.category === 'Technology' && event.title.includes('Exhibition') && (
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={24} color="var(--primary)" /> Showcase Prototypes & Projects
                </h3>
                
                {/* Form to submit project if registered */}
                {registration && registration.status === 'approved' && (
                  <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Submit Your Exhibition Project Details</h4>
                    <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Name</label>
                        <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. IoT Smart Irrigation" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project Category</label>
                        <select 
                          required
                          value={extraDetails.selectedCategory}
                          onChange={(e) => setExtraDetails({ ...extraDetails, selectedCategory: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          <option value="IoT">IoT & Hardware</option>
                          <option value="Robotics">Robotics</option>
                          <option value="AI Applications">AI & Machine Learning</option>
                          <option value="Websites">Websites / Web Apps</option>
                          <option value="Mobile Applications">Mobile Applications</option>
                          <option value="Research Projects">Research Project</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Working Description</label>
                        <textarea rows="3" required value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Explain the hardware/software prototype and how it works..." />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', width: '100%' }}>Submit to Exhibition Deck</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Submissions with visitor voting */}
                {submissions.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '4rem' }}>No exhibition submissions yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {submissions.map(sub => {
                      let pType = "Software";
                      try {
                        const parsed = JSON.parse(sub.extra_fields);
                        pType = parsed.projectType || "Software";
                      } catch {}
                      return (
                        <div key={sub.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <span className="badge badge-primary">{pType}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)' }}>
                                <Star size={16} fill="var(--warning)" />
                                <span style={{ fontWeight: 800 }}>{sub.visitor_votes} Votes</span>
                              </div>
                            </div>
                            
                            <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{sub.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>Developed by: {sub.user_name}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{sub.description}</p>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleProjectVote(sub.id)} 
                              className="btn btn-secondary" 
                              style={{ flex: 1, gap: '0.4rem', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.5rem 1rem' }}
                            >
                              <Vote size={18} /> Vote Project
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ENTREPRENEURSHIP PITCH & VIBE HUB */}
            {event.category === 'Business' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Registered Startup Pitches</h3>
                  {submissions.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '3rem' }}>Startup submissions are loading or none submitted yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {submissions.map(sub => {
                        let fields = {};
                        try {
                          fields = JSON.parse(sub.extra_fields || '{}');
                        } catch {}
                        return (
                          <div key={sub.id} style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{sub.title}</h4>
                              <span className="badge badge-secondary">{fields.startupStage || 'Idea'}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>{sub.description}</p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                              {fields.pitchDeckUrl && (
                                <div><strong>Deck:</strong> <a href={fields.pitchDeckUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--primary)' }}>View Pitch Deck</a></div>
                              )}
                              <div><strong>Founder:</strong> {sub.user_name}</div>
                              <div><strong>Mentorship Required:</strong> {fields.mentorNeeded || 'No'}</div>
                            </div>

                            {/* Ratings */}
                            {(sub.score_business_model > 0 || sub.score_market_strategy > 0) && (
                              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--secondary)', fontSize: '0.85rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                  <div>Business Model: <span style={{ color: 'var(--secondary)' }}>{sub.score_business_model}/10</span></div>
                                  <div>Market Strategy: <span style={{ color: 'var(--secondary)' }}>{sub.score_market_strategy}/10</span></div>
                                  <div>Feasibility: <span style={{ color: 'var(--secondary)' }}>{sub.score_feasibility}/10</span></div>
                                </div>
                                {sub.feedback && <div style={{ color: 'var(--text-secondary)' }}><strong>Investor Feedback:</strong> {sub.feedback}</div>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Mentor Panelists</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Connect with angel investors, campus incubators, and startup mentors at the Networking arena after presentations.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontWeight: 700 }}>JD</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Dr. John Davis</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Venture Partner, Ignite Labs</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontWeight: 700 }}>AM</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Alisha Mehta</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Managing Director, Campus Capital</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SPORTS ARENA HUB */}
            {event.category === 'Sports' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={22} color="var(--primary)" /> Match Fixtures & Scores
                  </h3>
                  
                  {fixtures.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '3rem' }}>Fixtures schedules are being processed.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {fixtures.map(f => (
                        <div key={f.id} style={{ 
                          background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>{f.stage}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: f.winner === f.team_a ? 800 : 500, color: f.winner === f.team_a ? 'var(--primary)' : 'inherit' }}>
                              <span>{f.team_a}</span>
                              <span>{f.score_a}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: f.winner === f.team_b ? 800 : 500, color: f.winner === f.team_b ? 'var(--primary)' : 'inherit', marginTop: '0.4rem' }}>
                              <span>{f.team_b}</span>
                              <span>{f.score_b}</span>
                            </div>
                          </div>
                          <div style={{ marginLeft: '2rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', textAlign: 'center', minWidth: '80px' }}>
                            <span className={`badge ${f.status === 'completed' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>{f.status}</span>
                            {f.match_time && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                                {new Date(f.match_time).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={20} color="var(--secondary)" /> Points Table Standings
                  </h3>
                  {leaderboard.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>Points tables are loading.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                          <th style={{ paddingBottom: '0.5rem' }}>Team</th>
                          <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>P</th>
                          <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>W</th>
                          <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((row) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{row.team_name}</td>
                            <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>{row.played}</td>
                            <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>{row.won}</td>
                            <td style={{ padding: '0.75rem 0', textAlign: 'center', color: 'var(--secondary)', fontWeight: 700 }}>{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && analytics && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Live Event Analytics</h2>
            
            {/* Quick Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Registered</p>
                <h3 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontWeight: 800, margin: '0.25rem 0' }}>{analytics.total_registrations}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Capacity: {analytics.capacity} seats</p>
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Attendance Verified</p>
                <h3 style={{ fontSize: '2.2rem', color: 'var(--success)', fontWeight: 800, margin: '0.25rem 0' }}>{analytics.attendance_count}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  Rate: {analytics.total_registrations > 0 ? ((analytics.attendance_count / analytics.total_registrations) * 100).toFixed(1) : 0}%
                </p>
              </div>
              {['Technology', 'Business'].includes(event.category) && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Project Submissions</p>
                  <h3 style={{ fontSize: '2.2rem', color: 'var(--secondary)', fontWeight: 800, margin: '0.25rem 0' }}>{analytics.submissions_count}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Innovative models shown</p>
                </div>
              )}
              {event.category === 'Technology' && event.title.includes('Exhibition') && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Visitor Votes Cast</p>
                  <h3 style={{ fontSize: '2.2rem', color: 'var(--warning)', fontWeight: 800, margin: '0.25rem 0' }}>{analytics.total_votes_cast}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Active campus engagement</p>
                </div>
              )}
            </div>

            {/* Custom SVG Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
              
              {/* Registration Capacity Progress Chart */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Capacity vs Registrations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <svg width="200" height="200" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Circle */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border-color)"
                      strokeWidth="3"
                    />
                    {/* Foreground progress */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3.2"
                      strokeDasharray={`${(analytics.total_registrations / analytics.capacity) * 100}, 100`}
                    />
                  </svg>
                  <div style={{ textAlign: 'center', marginTop: '-120px', height: '120px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                      {((analytics.total_registrations / analytics.capacity) * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Capacity Filled</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }} />
                      <span>{analytics.total_registrations} Registered</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: '12px', height: '12px', background: 'var(--border-color)', borderRadius: '3px' }} />
                      <span>{analytics.capacity - analytics.total_registrations} Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solo vs Team registrations Chart */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Registration Demographics</h3>
                
                {analytics.total_registrations === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '3rem' }}>Register to view metrics.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', height: '80%' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span>Solo Registrations ({analytics.solo_registrations})</span>
                        <span>{((analytics.solo_registrations / analytics.total_registrations) * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '16px', background: 'var(--bg-app)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${(analytics.solo_registrations / analytics.total_registrations) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span>Team Members/Registrations ({analytics.team_registrations})</span>
                        <span>{((analytics.team_registrations / analytics.total_registrations) * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '16px', background: 'var(--bg-app)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${(analytics.team_registrations / analytics.total_registrations) * 100}%`, height: '100%', background: 'var(--secondary)', borderRadius: '999px' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '1rem' }}>
                      Total teams created: {analytics.unique_teams}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ADMIN CONTROLS TAB */}
        {activeTab === 'admin' && user?.is_admin && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Top Row: Group Team Approvals Workflow */}
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={22} color="var(--primary)" /> Team & Roster Approvals Workflow
              </h3>

              {groupRegistrations().length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>No registrations submitted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {groupRegistrations().map(group => (
                    <div 
                      key={group.groupId} 
                      style={{ 
                        padding: '1.5rem', 
                        background: 'var(--bg-app)', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                              {group.is_team ? `Team: ${group.team_name}` : `Individual: ${group.leader?.user_name}`}
                            </h4>
                            <span className="badge" style={{ 
                              background: group.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: group.status === 'approved' ? 'var(--success)' : 'var(--warning)',
                              fontSize: '0.65rem'
                            }}>
                              {group.status}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Roster Size: {group.is_team ? `${group.members.length + 1} / ${group.team_size}` : '1 (Solo)'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleApproveTeam(group.groupId)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid var(--success)', color: 'var(--success)' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectTeam(group.groupId)}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => startModifyAdmin(group.leader || group.members[0])}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          >
                            Modify
                          </button>
                        </div>
                      </div>

                      {/* Group members list */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                        {/* Leader */}
                        {group.leader && (
                          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{group.leader.user_name} (Leader)</div>
                            <div>Status: <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{group.leader.status}</span></div>
                            {group.leader.status !== 'attended' && (
                              <button 
                                onClick={() => handleMarkAttendanceAdmin(group.leader.qr_code_data)}
                                className="btn btn-primary"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', marginTop: '0.5rem', width: '100%' }}
                              >
                                Mark Check-in
                              </button>
                            )}
                          </div>
                        )}
                        {/* Teammates */}
                        {group.members.map((m, idx) => (
                          <div key={m.id} style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: 700 }}>{m.user_name} (Member {idx + 1})</div>
                            <div>Status: <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{m.status}</span></div>
                            {m.status !== 'attended' && (
                              <button 
                                onClick={() => handleMarkAttendanceAdmin(m.qr_code_data)}
                                className="btn btn-primary"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', marginTop: '0.5rem', width: '100%' }}
                              >
                                Mark Check-in
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcement publisher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              
              {/* Manual Attendance Certificate Issue list (for direct search & Cert Awards) */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={22} color="var(--primary)" /> Issue Custom Certificate Awards
                </h3>
                
                {allRegistrations.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>No registrants found.</p>
                ) : (
                  <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {allRegistrations.map(reg => (
                      <div key={reg.id} style={{ 
                        padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{reg.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: {reg.status}</div>
                          {reg.certificate_role && <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Role: {reg.certificate_role}</div>}
                        </div>

                        <div>
                          <select 
                            style={{ padding: '0.25rem', fontSize: '0.75rem', width: '110px' }}
                            onChange={(e) => handleIssueCertificateAdmin(reg.user_id, e.target.value)}
                            defaultValue={reg.certificate_role || ""}
                          >
                            <option value="" disabled>Issue Cert</option>
                            <option value="Winner">Winner</option>
                            <option value="Runner-up">Runner-up</option>
                            <option value="MVP">MVP</option>
                            <option value="Participant">Participant</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Announcement publisher */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={22} color="var(--secondary)" /> Publish Event Announcement
                </h3>
                <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Title</label>
                    <input 
                      type="text" 
                      required 
                      value={annForm.title}
                      onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                      placeholder="e.g. Schedule Change, Final fixtures"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Content</label>
                    <textarea 
                      rows="4" 
                      required 
                      value={annForm.content}
                      onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                      placeholder="Write announcement details..."
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="is_pinned"
                      checked={annForm.is_pinned}
                      onChange={(e) => setAnnForm({ ...annForm, is_pinned: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="is_pinned" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pin to top</label>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }}>Publish Announcement</button>
                </form>
              </div>

            </div>

            {/* Results Editor depending on event category */}
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Manage Results & Records</h3>
              
              {/* 1. ESPORTS & SPORTS: Fixture Creator / Standings */}
              {['Esports', 'Sports'].includes(event.category) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  
                  {/* Create Match Fixture */}
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create Match Fixture</h4>
                    <form onSubmit={handleAddFixture} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Stage / Bracket Category</label>
                        <input type="text" required value={fixtureForm.stage} onChange={(e) => setFixtureForm({ ...fixtureForm, stage: e.target.value })} placeholder="e.g. Valorant Semifinal 1, Cricket Round 2" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team A</label>
                          <input type="text" required value={fixtureForm.team_a} onChange={(e) => setFixtureForm({ ...fixtureForm, team_a: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team B</label>
                          <input type="text" required value={fixtureForm.team_b} onChange={(e) => setFixtureForm({ ...fixtureForm, team_b: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Score A</label>
                          <input type="number" value={fixtureForm.score_a} onChange={(e) => setFixtureForm({ ...fixtureForm, score_a: parseInt(e.target.value, 10) })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Score B</label>
                          <input type="number" value={fixtureForm.score_b} onChange={(e) => setFixtureForm({ ...fixtureForm, score_b: parseInt(e.target.value, 10) })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Round #</label>
                          <input type="number" value={fixtureForm.round_num} onChange={(e) => setFixtureForm({ ...fixtureForm, round_num: parseInt(e.target.value, 10) })} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Match Status</label>
                        <select value={fixtureForm.status} onChange={(e) => setFixtureForm({ ...fixtureForm, status: e.target.value })}>
                          <option value="scheduled">Scheduled</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Winner (Name of winning team if completed)</label>
                        <input type="text" value={fixtureForm.winner} onChange={(e) => setFixtureForm({ ...fixtureForm, winner: e.target.value })} placeholder="Winner Team" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Scheduled Time</label>
                        <input type="datetime-local" value={fixtureForm.match_time} onChange={(e) => setFixtureForm({ ...fixtureForm, match_time: e.target.value })} />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Save Fixture</button>
                    </form>
                  </div>

                  {/* Create Leaderboard entries */}
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Add/Update Leaderboard Standing</h4>
                    <form onSubmit={handleUpsertLeaderboard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category / Standings Group</label>
                        <input type="text" required value={leaderboardForm.category} onChange={(e) => setLeaderboardForm({ ...leaderboardForm, category: e.target.value })} placeholder="e.g. BGMI Group A, Football Standings" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
                        <input type="text" required value={leaderboardForm.team_name} onChange={(e) => setLeaderboardForm({ ...leaderboardForm, team_name: e.target.value })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Played</label>
                          <input type="number" value={leaderboardForm.played} onChange={(e) => setLeaderboardForm({ ...leaderboardForm, played: parseInt(e.target.value, 10) })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Won</label>
                          <input type="number" value={leaderboardForm.won} onChange={(e) => setLeaderboardForm({ ...leaderboardForm, won: parseInt(e.target.value, 10) })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Points</label>
                          <input type="number" value={leaderboardForm.points} onChange={(e) => setLeaderboardForm({ ...leaderboardForm, points: parseInt(e.target.value, 10) })} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Extra Stats (NRR / Kills / MVPs)</label>
                        <input type="text" value={leaderboardForm.extra_stats} onChange={(e) => setLeaderboardForm({ ...leaderboardForm, extra_stats: e.target.value })} placeholder="e.g. NRR: +1.5, Kills: 20" />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Save Standings Row</button>
                    </form>

                    {/* Quick list of fixtures and delete */}
                    <div style={{ marginTop: '2rem' }}>
                      <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Existing Fixtures</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                        {fixtures.map(f => (
                          <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <span>{f.team_a} vs {f.team_b} ({f.stage})</span>
                            <button onClick={() => handleDeleteFixture(f.id)} style={{ color: 'var(--danger)', background: 'transparent' }}><Trash size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 2. PROJECT SUBMISSION EVALUATOR (HACKATHON / EXHIBITION / PITCH) */}
              {['Technology', 'Business'].includes(event.category) && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Grade Submissions</h4>
                  {submissions.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>No submissions to evaluate.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {submissions.map(sub => (
                        <div key={sub.id} style={{ padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <h5 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{sub.title}</h5>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>By: {sub.user_name}</p>
                            </div>
                            {gradingForm.submissionId === sub.id ? (
                              <button onClick={() => setGradingForm({ ...gradingForm, submissionId: null })} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                            ) : (
                              <button onClick={() => setGradingForm({
                                submissionId: sub.id,
                                score_innovation: sub.score_innovation || 0,
                                score_technical: sub.score_technical || 0,
                                score_impact: sub.score_impact || 0,
                                score_business_model: sub.score_business_model || 0,
                                score_market_strategy: sub.score_market_strategy || 0,
                                score_feasibility: sub.score_feasibility || 0,
                                feedback: sub.feedback || ''
                              })} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Evaluate</button>
                            )}
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{sub.description}</p>
                          
                          {/* If grading this project */}
                          {gradingForm.submissionId === sub.id && (
                            <form onSubmit={handleGradeProjectSubmit} style={{ marginTop: '1.5rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <h6 style={{ fontWeight: 700 }}>Evaluation Grades (Scores out of 10)</h6>
                              
                              {event.category === 'Technology' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Innovation</label>
                                    <input type="number" min="0" max="10" value={gradingForm.score_innovation} onChange={(e) => setGradingForm({ ...gradingForm, score_innovation: parseInt(e.target.value, 10) })} />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Technical Excellence</label>
                                    <input type="number" min="0" max="10" value={gradingForm.score_technical} onChange={(e) => setGradingForm({ ...gradingForm, score_technical: parseInt(e.target.value, 10) })} />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Impact</label>
                                    <input type="number" min="0" max="10" value={gradingForm.score_impact} onChange={(e) => setGradingForm({ ...gradingForm, score_impact: parseInt(e.target.value, 10) })} />
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Business Model</label>
                                    <input type="number" min="0" max="10" value={gradingForm.score_business_model} onChange={(e) => setGradingForm({ ...gradingForm, score_business_model: parseInt(e.target.value, 10) })} />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Market Strategy</label>
                                    <input type="number" min="0" max="10" value={gradingForm.score_market_strategy} onChange={(e) => setGradingForm({ ...gradingForm, score_market_strategy: parseInt(e.target.value, 10) })} />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Feasibility</label>
                                    <input type="number" min="0" max="10" value={gradingForm.score_feasibility} onChange={(e) => setGradingForm({ ...gradingForm, score_feasibility: parseInt(e.target.value, 10) })} />
                                  </div>
                                </div>
                              )}

                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Feedback remarks</label>
                                <textarea rows="2" value={gradingForm.feedback} onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })} placeholder="Add mentor/judge remarks..." />
                              </div>

                              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', alignSelf: 'flex-start' }}>Submit Evaluation</button>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Gallery manager */}
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={22} color="var(--primary)" /> Manage Event Gallery
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
                <form onSubmit={handleAddGallery} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Image URL</label>
                    <input 
                      type="url" 
                      required 
                      value={galForm.image_url}
                      onChange={(e) => setGalForm({ ...galForm, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Caption (Optional)</label>
                    <input 
                      type="text" 
                      value={galForm.caption}
                      onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })}
                      placeholder="e.g. Prize distribution ceremony"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }}>Add Image</button>
                </form>

                {/* List images */}
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Uploaded Photos</h4>
                  {gallery.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No photos in the gallery.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {gallery.map(img => (
                        <div key={img.id} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            onClick={() => handleDeleteGallery(img.id)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.85)', color: 'white', borderRadius: '50%', padding: '0.25rem', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 🔮 ADMIN CONTROLS MODIFICATION POPUP MODAL */}
      {modifyForm && (
        <>
          <div 
            onClick={() => setModifyForm(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', zIndex: 3000 }} 
          />
          <div style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px',
            padding: '2.5rem', width: '480px', maxWidth: 'calc(100vw - 2rem)', zIndex: 3001,
            display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Modify Registration (Admin)</h3>
            
            <form onSubmit={handleModifyAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Name</label>
                <input 
                  type="text" 
                  value={modifyForm.team_name} 
                  onChange={(e) => setModifyForm({ ...modifyForm, team_name: e.target.value })} 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Size</label>
                  <input 
                    type="number" 
                    value={modifyForm.team_size} 
                    onChange={(e) => setModifyForm({ ...modifyForm, team_size: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team Logo URL</label>
                  <input 
                    type="text" 
                    value={modifyForm.team_logo} 
                    onChange={(e) => setModifyForm({ ...modifyForm, team_logo: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Extra Details (JSON String)</label>
                <textarea 
                  rows="4" 
                  value={modifyForm.extra_details} 
                  onChange={(e) => setModifyForm({ ...modifyForm, extra_details: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModifyForm(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Modifications</button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default EventHub;
