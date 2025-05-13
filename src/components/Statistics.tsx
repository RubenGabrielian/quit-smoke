import { useState, useEffect } from 'react';
import { getWeeklyStatistics } from '../firebase';
import { isDevelopment, mockWeeklyData, mockStatistics, getUserData } from '../utils/devMode';
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
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                if (isDevelopment()) {
                    setWeeklyData(mockWeeklyData);
                    setStatistics(mockStatistics);
                    setIsLoading(false);
                    return;
                }
                const user = getUserData();
                const userId = user.id.toString();
                const { weeklyData, statistics } = await getWeeklyStatistics(userId);
                setWeeklyData(weeklyData);
                setStatistics(statistics);
            } catch (error) {
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
                    <div className="statistics-loading" />
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="statistics-container">
                <div className="statistics-card">
                    <div className="statistics-title">Error</div>
                    <div className="statistics-error">{error}</div>
                </div>
            </div>
        );
    }
    if (!statistics) return null;

    // Format date to show day name
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Get color based on smoke count
    const getBarColor = (count: number, maxCount: number) => {
        if (count === 0) return '#f1f4f8';
        const percentage = count / maxCount;
        if (percentage <= 0.3) return '#4f8cff';
        if (percentage <= 0.6) return '#6aa1ff';
        return '#8bb5ff';
    };

    return (
        <div className="statistics-container">
            <div className="statistics-card">
                <div className="statistics-title">Weekly Overview</div>
                <div className="statistics-period">
                    {new Date(statistics.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(statistics.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                        <div className="statistics-summary-label">Daily Average</div>
                        <div className="statistics-summary-value">{statistics.averageSmokesPerDay.toFixed(1)}</div>
                    </div>
                    <div className="statistics-summary-item">
                        <div className="statistics-summary-label">Peak Day</div>
                        <div className="statistics-summary-value">{statistics.maxSmokesInDay}</div>
                    </div>
                </div>
                <div className="statistics-chart">
                    {weeklyData.map((day) => (
                        <div 
                            key={day.date} 
                            className="statistics-bar-container"
                            onMouseEnter={() => setHoveredBar(day.date)}
                            onMouseLeave={() => setHoveredBar(null)}
                        >
                            <div 
                                className={`statistics-bar ${day.smokedCount === 0 ? 'empty' : ''}`}
                                style={{ 
                                    height: `${(day.smokedCount / statistics.maxSmokesInDay) * 100}%`,
                                    background: day.smokedCount === 0 ? undefined : 
                                        `linear-gradient(180deg, ${getBarColor(day.smokedCount, statistics.maxSmokesInDay)} 0%, ${getBarColor(day.smokedCount, statistics.maxSmokesInDay)}dd 100%)`,
                                    transform: hoveredBar === day.date ? 'scaleY(1.05)' : 'scaleY(1)',
                                    transformOrigin: 'bottom'
                                }}
                            />
                            <div className="statistics-bar-label">{formatDate(day.date)}</div>
                            <div 
                                className="statistics-bar-value"
                                style={{
                                    opacity: hoveredBar === day.date ? 1 : 0.7,
                                    transform: hoveredBar === day.date ? 'translateY(-2px)' : 'translateY(0)'
                                }}
                            >
                                {day.smokedCount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 