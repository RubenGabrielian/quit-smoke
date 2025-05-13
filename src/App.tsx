import './index.css';
import './SmokeHome.css';
import { useState, useEffect } from 'react';
import { saveSmokingData, getTodaySmokingData, checkUserExists, createNewUser, updateUserFirstTimeStatus, initializeDatabase, verifyFirebaseConnection } from './firebase';
import WebApp from '@twa-dev/sdk';
import Statistics from './components/Statistics';
import BottomMenu from './components/BottomMenu';
import { isDevelopment, getUserData, mockTelegramUser } from './utils/devMode';
import { initializeApp } from 'firebase/app';

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
  const [activeTab, setActiveTab] = useState<'counter' | 'statistics'>('counter');
  const nicotine = smokedCount * NICOTINE_PER_SMOKE;

  const initializeApp = async (userData: any) => {
    try {
      if (isDevelopment()) {
        // Use mock data for development
        setSmokedCount(5); // Mock count for development
        return;
      }

      // Get today's data for real user
      const userId = userData.id.toString();
      const todayData = await getTodaySmokingData(userId);
      if (todayData) {
        console.log('Found today\'s data:', todayData);
        setSmokedCount(todayData.smokedCount);
      } else {
        console.log('No data for today, starting with 0');
        setSmokedCount(0);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setSmokedCount(0);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Get user data first - in development mode, use mock data
        const userData = isDevelopment() ? mockTelegramUser : await getUserData();
        console.log('User data:', userData);

        if (isDevelopment()) {
          // In development mode, skip Telegram and Firebase initialization
          await initializeApp(userData);
          setIsLoading(false);
          return;
        }

        // Production mode initialization
        try {
          // Initialize Telegram WebApp
          WebApp.ready();
          WebApp.expand();
        } catch (telegramError) {
          console.error('Telegram initialization error:', telegramError);
          throw new Error('Please open this app from Telegram');
        }

        // Initialize Firebase with user ID
        const userId = userData.id.toString();
        await initializeDatabase(userId);
        await verifyFirebaseConnection();

        // Initialize app
        await initializeApp(userData);
      } catch (err) {
        console.error('Initialization error:', err);
        if (isDevelopment()) {
          // In development, just show a warning but continue with mock data
          console.warn('Development mode warning:', err);
          setSmokedCount(5); // Use mock data
        } else {
          // In production, show the error
          setError('Failed to initialize app. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Save smoking data whenever it changes
  const handleSmoke = async () => {
    try {
      if (isDevelopment()) {
        // In development, just increment the counter
        setSmokedCount(prev => prev + 1);
        return;
      }

      const user = getUserData();
      const userId = user.id.toString();
      console.log('Handling smoke for user:', userId);
      
      const newCount = smokedCount + 1;
      setSmokedCount(newCount);
      
      // Show loading state
      WebApp.MainButton.showProgress();
      
      try {
        await saveSmokingData(userId, newCount);
        console.log('Smoke data saved successfully');
        
        // Show success feedback
        WebApp.showPopup({
          title: 'Success',
          message: 'Smoking activity recorded!',
          buttons: [{ type: 'ok' }]
        });
      } catch (saveError) {
        console.error('Error saving smoke data:', saveError);
        // Revert the count
        setSmokedCount(smokedCount);
        
        // Show detailed error feedback
        const errorMessage = saveError instanceof Error 
          ? `Error: ${saveError.message}\n\nPlease try again.`
          : 'Failed to save smoking data. Please try again.';
        
        WebApp.showPopup({
          title: 'Error Saving Data',
          message: errorMessage,
          buttons: [{ type: 'ok' }]
        });
        
        setError(saveError instanceof Error ? saveError.message : 'Failed to save smoking data');
      }
    } catch (error) {
      console.error('Error in handleSmoke:', error);
      setError(error instanceof Error ? error.message : 'Failed to process smoke action');
      
      if (!isDevelopment()) {
        WebApp.showPopup({
          title: 'Error',
          message: error instanceof Error 
            ? `Error: ${error.message}\n\nPlease try again.`
            : 'An error occurred. Please try again.',
          buttons: [{ type: 'ok' }]
        });
      }
    } finally {
      if (!isDevelopment()) {
        WebApp.MainButton.hideProgress();
      }
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

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <Statistics />;
      case 'counter':
      default:
        return (
          <>
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
          </>
        );
    }
  };

  return (
    <div className="smoke-bg">
      {renderContent()}
      <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
