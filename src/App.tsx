import './index.css';
import './SmokeHome.css';
import { useState, useEffect } from 'react';
import { saveSmokingData, getTodaySmokingData, checkUserExists, createNewUser, updateUserFirstTimeStatus, getUserData } from './firebase';
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
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const nicotine = smokedCount * NICOTINE_PER_SMOKE;

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Check if we're running in Telegram WebApp
        if (!window.Telegram?.WebApp) {
          throw new Error('Not running in Telegram WebApp');
        }

        // Initialize the Telegram WebApp
        WebApp.ready();
        
        // Expand the WebApp to full height
        WebApp.expand();
        
        // Set the main button color
        WebApp.MainButton.setParams({
          text: 'SMOKE TRACKER',
          color: '#4f8cff',
        });

        // Verify that we have user data
        const user = WebApp.initDataUnsafe.user;
        if (!user?.id) {
          throw new Error('Telegram user data not available');
        }

        setIsTelegramReady(true);
      } catch (err) {
        console.error('Error initializing Telegram WebApp:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Telegram WebApp');
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  // Check user status and load data
  useEffect(() => {
    const initializeUser = async () => {
      if (!isTelegramReady) return;

      try {
        const user = WebApp.initDataUnsafe.user;
        if (!user?.id) {
          throw new Error('Telegram user data not available');
        }

        const userId = user.id.toString();
        const username = user.username || user.first_name || 'Anonymous';
        
        console.log('Initializing user:', { userId, username }); // Debug log

        const userExists = await checkUserExists(userId);
        console.log('User exists:', userExists); // Debug log
        
        if (!userExists) {
          // Create new user
          await createNewUser(userId, username);
          setIsFirstTime(true);
          setShowWelcome(true);
        } else {
          // Get user data
          const userData = await getUserData(userId);
          console.log('User data:', userData); // Debug log
          
          if (userData?.isFirstTime) {
            setIsFirstTime(true);
            setShowWelcome(true);
          } else {
            // Load smoking data for existing user
            const data = await getTodaySmokingData(userId);
            if (data) {
              setSmokedCount(data.smokedCount);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize user data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isTelegramReady) {
      initializeUser();
    }
  }, [isTelegramReady]);

  // Handle first smoke for new users
  const handleFirstSmoke = async () => {
    try {
      const user = WebApp.initDataUnsafe.user;
      if (!user?.id) {
        throw new Error('Telegram user data not available');
      }

      const userId = user.id.toString();
      
      // Update user's first-time status
      await updateUserFirstTimeStatus(userId);
      setIsFirstTime(false);
      setShowWelcome(false);

      // Save first smoke
      await saveSmokingData(userId, 1);
      setSmokedCount(1);

      // Show welcome message
      WebApp.showPopup({
        title: 'Welcome to Smoke Tracker!',
        message: 'Your first smoke has been recorded. Keep tracking to achieve your goals!',
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.error('Error handling first smoke:', error);
      setError(error instanceof Error ? error.message : 'Failed to record first smoke');
    }
  };

  // Save smoking data whenever it changes
  const handleSmoke = async () => {
    try {
      const user = WebApp.initDataUnsafe.user;
      if (!user?.id) {
        throw new Error('Telegram user data not available');
      }

      const userId = user.id.toString();
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
      setError(error instanceof Error ? error.message : 'Failed to save smoking data');
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
          <div style={{ color: '#7b8ca6', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>
            Please make sure you're opening this app from Telegram.
          </div>
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

  if (showWelcome) {
    return (
      <div className="smoke-bg">
        <div className="smoke-card">
          <div className="smoke-card-title">Welcome to Smoke Tracker!</div>
          <div style={{ color: '#7b8ca6', fontSize: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Track your smoking habits and work towards your goals.
            <br /><br />
            Click the button below to record your first smoke and get started!
          </div>
          <button 
            className="smoke-big-btn" 
            onClick={handleFirstSmoke}
            style={{ 
              width: 'auto', 
              padding: '0.75rem 2rem',
              borderRadius: '1rem',
              marginTop: '1rem'
            }}
          >
            Start Tracking
          </button>
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
