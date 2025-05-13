import './BottomMenu.css';

interface BottomMenuProps {
    activeTab: 'counter' | 'statistics';
    onTabChange: (tab: 'counter' | 'statistics') => void;
}

export default function BottomMenu({ activeTab, onTabChange }: BottomMenuProps) {
    return (
        <div className="bottom-menu">
            <button 
                className={`bottom-menu-item ${activeTab === 'counter' ? 'active' : ''}`}
                onClick={() => onTabChange('counter')}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span>Counter</span>
            </button>
            
            <button 
                className={`bottom-menu-item ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => onTabChange('statistics')}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
                <span>Statistics</span>
            </button>
        </div>
    );
} 