import { useState, useEffect } from 'react';
import { getWeeklyStatistics } from '../firebase';
import WebApp from '@twa-dev/sdk';
import './Statistics.css';

interface DayData {
    date: string;
    smokedCount: number;
    nicotineAmount: number;
    timestamp: any;
}

interface Statistics {
    totalSmokes: number;
    totalNicotine: number;
    averageSmokesPerDay: number;
    maxSmokesInDay: number;
    daysWithSmoking: number;
    startDate: string;
    endDate: string;
}

export default function Statistics() {
    const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                const user = WebApp.initDataUnsafe.user;
                if (!user?.id) {
                    throw new Error('Telegram user data not available');
                }

                const userId = user.id.toString();
                const { weeklyData, statistics } = await getWeeklyStatistics(userId);
                
                setWeeklyData(weeklyData);
                setStatistics(statistics);
            } catch (error) {
                console.error('Error loading statistics:', error);
                setError(error instanceof Error ? error.message : 'Failed to load statistics');
            } finally {
                setIsLoading(false);
            }
        };

        loadStatistics();
    }, []);

    if (isLoading) {
        return (
            <div className="statistics-container">
                <div className="statistics-card">
                    <div className="statistics-title">Loading Statistics...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="statistics-container">
                <div className="statistics-card">
                    <div className="statistics-title" style={{ color: '#ff4d4f' }}>Error</div>
                    <div className="statistics-error">{error}</div>
                </div>
            </div>
        );
    }

    if (!statistics) {
        return null;
    }

    // Format date to show day name
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div className="statistics-container">
            <div className="statistics-card">
                <div className="statistics-title">Weekly Statistics</div>
                <div className="statistics-period">
                    {new Date(statistics.startDate).toLocaleDateString()} - {new Date(statistics.endDate).toLocaleDateString()}
                </div>

                <div className="statistics-summary">
                    <div className="statistics-summary-item">
                        <div className="statistics-summary-label">Total Smokes</div>
                        <div className="statistics-summary-value">{statistics.totalSmokes}</div>
                    </div>
                    <div className="statistics-summary-item">
                        <div className="statistics-summary-label">Total Nicotine</div>
                        <div className="statistics-summary-value">{statistics.totalNicotine}mg</div>
                    </div>
                    <div className="statistics-summary-item">
                        <div className="statistics-summary-label">Average per Day</div>
                        <div className="statistics-summary-value">{statistics.averageSmokesPerDay.toFixed(1)}</div>
                    </div>
                    <div className="statistics-summary-item">
                        <div className="statistics-summary-label">Max in a Day</div>
                        <div className="statistics-summary-value">{statistics.maxSmokesInDay}</div>
                    </div>
                </div>

                <div className="statistics-chart">
                    {weeklyData.map((day) => (
                        <div key={day.date} className="statistics-bar-container">
                            <div 
                                className="statistics-bar" 
                                style={{ 
                                    height: `${(day.smokedCount / statistics.maxSmokesInDay) * 100}%`,
                                    backgroundColor: day.smokedCount > 0 ? '#4f8cff' : '#e8e8e8'
                                }}
                            />
                            <div className="statistics-bar-label">{formatDate(day.date)}</div>
                            <div className="statistics-bar-value">{day.smokedCount}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 