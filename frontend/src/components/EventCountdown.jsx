import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const EventCountdown = ({ dateTime, title }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(dateTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(+new Date(dateTime) - +new Date() <= 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      const diff = +new Date(dateTime) - +new Date();
      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dateTime]);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(4px)',
      width: '100%',
      maxWidth: '340px'
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          <Clock size={12} color="var(--primary)" />
          <span>{title}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
        {timeBlocks.map((block, i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: 'var(--bg-app)', 
              padding: '0.4rem 0.25rem', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              minWidth: '50px'
            }}
          >
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: isExpired ? 'var(--text-tertiary)' : 'var(--primary)',
              fontFamily: 'var(--font-heading)',
              textShadow: isExpired ? 'none' : '0 0 10px var(--primary-light)'
            }}>
              {String(block.value).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              {block.label}
            </span>
          </div>
        ))}
      </div>
      
      {isExpired && (
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: 'var(--danger)', 
          textAlign: 'center', 
          textTransform: 'uppercase', 
          marginTop: '0.2rem' 
        }}>
          Event has started
        </div>
      )}
    </div>
  );
};

export default EventCountdown;
