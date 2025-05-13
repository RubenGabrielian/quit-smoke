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

    // Capsule bar chart logic
    const maxCount = statistics.maxSmokesInDay || 1;
    const nowIndex = weeklyData.findIndex(day => day.smokedCount === maxCount) !== -1
        ? weeklyData.findIndex(day => day.smokedCount === maxCount)
        : weeklyData.length - 1;
    const predictionStart = Math.max(weeklyData.length - 3, 0); // last 3 bars as prediction

    // Format for x-axis label
    const formatLabel = (dateStr: string, idx: number) => {
        if (idx === nowIndex) return <b>now</b>;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
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
                <div className="statistics-capsule-chart">
                    {weeklyData.map((day, idx) => {
                        const isPrediction = idx >= predictionStart;
                        const isNow = idx === nowIndex;
                        const percent = Math.round((day.smokedCount / maxCount) * 100);
                        return (
                            <div className="capsule-bar-container" key={day.date}>
                                <div className={`capsule-bar-outer${isNow ? ' now' : ''}${isPrediction ? ' prediction' : ''}`}> 
                                    <div
                                        className={`capsule-bar-inner${isPrediction ? ' prediction' : ''}`}
                                        style={{
                                            height: `${percent}%`,
                                            background: isPrediction
                                                ? 'linear-gradient(180deg, #7fd7ff 0%, #4f8cff 100%)'
                                                : 'linear-gradient(180deg, #ff7e9b 0%, #ffb6b9 100%)',
                                        }}
                                    />
                                    {isNow && (
                                        <div className="capsule-bar-value">{percent}%</div>
                                    )}
                                </div>
                                <div className={`capsule-bar-label${isNow ? ' now' : ''}`}>{formatLabel(day.date, idx)}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="statistics-capsule-legend">
                    <span className="legend-color prediction" /> Prediction
                </div>
            </div>
        </div>
    );
} 