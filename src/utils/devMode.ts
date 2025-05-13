// Check if we're in development mode
export const isDevelopment = () => {
    return import.meta.env.DEV || window.location.hostname === 'localhost';
};

// Mock Telegram user data for development
export const mockTelegramUser = {
    id: 123456789,
    username: 'dev_user',
    first_name: 'Development',
    last_name: 'User',
    language_code: 'en'
};

// Mock weekly data for development
export const mockWeeklyData = [
    { date: '2024-03-17', smokedCount: 5, nicotineAmount: 60, timestamp: new Date('2024-03-17') },
    { date: '2024-03-18', smokedCount: 8, nicotineAmount: 96, timestamp: new Date('2024-03-18') },
    { date: '2024-03-19', smokedCount: 12, nicotineAmount: 144, timestamp: new Date('2024-03-19') },
    { date: '2024-03-20', smokedCount: 6, nicotineAmount: 72, timestamp: new Date('2024-03-20') },
    { date: '2024-03-21', smokedCount: 9, nicotineAmount: 108, timestamp: new Date('2024-03-21') },
    { date: '2024-03-22', smokedCount: 7, nicotineAmount: 84, timestamp: new Date('2024-03-22') },
    { date: '2024-03-23', smokedCount: 10, nicotineAmount: 120, timestamp: new Date('2024-03-23') }
];

// Mock statistics for development
export const mockStatistics = {
    totalSmokes: 57,
    totalNicotine: 684,
    averageSmokesPerDay: 8.1,
    maxSmokesInDay: 12,
    daysWithSmoking: 7,
    startDate: '2024-03-17',
    endDate: '2024-03-23'
};

// Get user data based on environment
export const getUserData = () => {
    if (isDevelopment()) {
        console.log('Running in development mode with mock data');
        return mockTelegramUser;
    }

    // In production, use real Telegram data
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user?.id) {
        throw new Error('Telegram user data not available');
    }
    return user;
}; 