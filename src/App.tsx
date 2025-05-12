import './index.css';
import './SmokeHome.css';
import { useState } from 'react';

const SMOKE_GOAL = 20;
const NICOTINE_PER_SMOKE = 12; // mg

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
  const nicotine = smokedCount * NICOTINE_PER_SMOKE;

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
        <button className="smoke-big-btn" onClick={() => setSmokedCount(c => c + 1)}>
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
