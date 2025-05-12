import './index.css';
import './SmokeHome.css';
import { useState, useEffect } from 'react';
import { saveSmokingData, getTodaySmokingData } from './firebase';
import WebApp from '@twa-dev/sdk';

const SMOKE_GOAL = Number(import.meta.env.VITE_SMOKE_GOAL) || 20;
const NICOTINE_PER_SMOKE = Number(import.meta.env.VITE_NICOTINE_PER_SMOKE) || 12; // mg

function getTickClass(i: number, smokedCount: number) {
  if (i < smokedCount) {
    if (i < 10) return 'smoke-progress-tick active smoke-progress-tick-green';
    if (i < 15) return 'smoke-progress-tick active smoke-progress-tick-red';
    return 'smoke-progress-tick active smoke-progress-tick-darkred';
  }
  return 'smoke-progress-tick';
}

export default function App() {
  const [smokedCount, setSmokedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nicotine = smokedCount * NICOTINE_PER_SMOKE;

  // Initialize Telegram WebApp
  useEffect(() => {
    try {
      // Initialize the Telegram WebApp
      WebApp.ready();
      
      // Expand the WebApp to full height
      WebApp.expand();
      
      // Set the main button color
      WebApp.MainButton.setParams({
        text: 'SMOKE TRACKER',
        color: '#4f8cff',
      });
    } catch (err) {
      console.error('Error initializing Telegram WebApp:', err);
      setError('Failed to initialize Telegram WebApp');
    }
  }, []);

  // Load today's smoking data when the component mounts
  useEffect(() => {
    const loadTodayData = async () => {
      try {
        const userId = WebApp.initDataUnsafe.user?.id.toString();
        if (!userId) {
          throw new Error('Telegram user ID not available');
        }

        const data = await getTodaySmokingData(userId);
        if (data) {
          setSmokedCount(data.smokedCount);
        }
      } catch (error) {
        console.error('Error loading smoking data:', error);
        setError('Failed to load smoking data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayData();
  }, []);

  // Save smoking data whenever it changes
  const handleSmoke = async () => {
    try {
      const userId = WebApp.initDataUnsafe.user?.id.toString();
      if (!userId) {
        throw new Error('Telegram user ID not available');
      }

      const newCount = smokedCount + 1;
      setSmokedCount(newCount);
      
      // Show loading state
      WebApp.MainButton.showProgress();
      
      await saveSmokingData(userId, newCount);
      
      // Show success feedback
      WebApp.showPopup({
        title: 'Success',
        message: 'Smoking activity recorded!',
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.error('Error saving smoking data:', error);
      setError('Failed to save smoking data');
      // Revert the count if save fails
      setSmokedCount(smokedCount);
      
      // Show error feedback
      WebApp.showPopup({
        title: 'Error',
        message: 'Failed to save smoking data. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      WebApp.MainButton.hideProgress();
    }
  };

  if (error) {
    return (
      <div className="smoke-bg">
        <div className="smoke-card">
          <div className="smoke-card-title" style={{ color: '#ff4d4f' }}>Error</div>
          <div style={{ color: '#7b8ca6', fontSize: '1rem' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="smoke-bg">
        <div className="smoke-card">
          <div className="smoke-card-title">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="smoke-bg">
      {/* Card */}
      <div className="smoke-card">
        <div className="smoke-card-title">Smoked today:</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 8 }}>
          <span className="smoke-card-count">{smokedCount}</span>
          <span className="smoke-card-goal">/{SMOKE_GOAL}</span>
        </div>
        <div className="smoke-card-motivation">You're doing great!</div>
        <div className="smoke-progress">
          {Array.from({ length: SMOKE_GOAL }).map((_, i) => (
            <div
              key={i}
              className={getTickClass(i, smokedCount)}
            />
          ))}
        </div>
        <div style={{ color: '#7b8ca6', fontSize: '1rem', marginBottom: 8 }}>
          You've consumed approximately nicotine.
        </div>
        <div className="smoke-nicotine">
          <svg width="20" height="20" fill="none" stroke="#7b8ca6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2C12 2 4 10.36 4 15.5A8 8 0 0 0 20 15.5C20 10.36 12 2 12 2Z"/><circle cx="12" cy="17" r="1.5"/></svg>
          <span className="smoke-nicotine-value">{nicotine}</span>
          <span className="smoke-nicotine-unit">mg</span>
        </div>
      </div>

      {/* Big Smoke Button */}
      <div className="smoke-big-btn-wrap">
        <div className="smoke-big-btn-ripple"></div>
        <div className="smoke-big-btn-ripple2"></div>
        <button className="smoke-big-btn" onClick={handleSmoke}>
          Smoke
        </button>
      </div>

      <div className="smoke-instruction">
        Tap the button above to log your smoking activity.<br />
        Stay committed to your goal!
      </div>
    </div>
  );
}
