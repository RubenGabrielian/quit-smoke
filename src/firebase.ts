import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyCujEvfCNEQ_8oks8ufFTHGCiRbiKqpauw",
    authDomain: "smoke-3afe1.firebaseapp.com",
    projectId: "smoke-3afe1",
    storageBucket: "smoke-3afe1.firebasestorage.app",
    messagingSenderId: "455536299518",
    appId: "1:455536299518:web:8e000b3b93bdec70f044af",
    measurementId: "G-86YK7JLJ61"
};

// Initialize Firebase with error handling
let app: FirebaseApp;
let db: Firestore;

try {
    console.log('Initializing Firebase with config:', {
        ...firebaseConfig,
        apiKey: '***' // Hide the actual API key in logs
    });

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

// Function to get today's date string in YYYY-MM-DD format
const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
};

// Function to get date string in YYYY-MM-DD format
const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Function to get start and end dates for the current week
const getWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
};

// Function to check if user exists
export const checkUserExists = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
    } catch (error) {
        console.error('Error checking user exists:', error);
        throw error;
    }
};

// Function to create new user
export const createNewUser = async (userId: string, username: string) => {
    try {
        console.log('Creating new user:', { userId, username });
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            username,
            createdAt: Timestamp.now(),
            isFirstTime: true,
            lastActive: Timestamp.now()
        });
        console.log('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Function to update user's first-time status
export const updateUserFirstTimeStatus = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
        isFirstTime: false,
        lastActive: Timestamp.now()
    }, { merge: true });
};

// Function to save smoking data
export const saveSmokingData = async (userId: string, smokedCount: number) => {
    try {
        console.log('Saving smoking data:', { userId, smokedCount });

        // First ensure user exists
        const userExists = await checkUserExists(userId);
        if (!userExists) {
            console.log('User does not exist, creating new user');
            await createNewUser(userId, 'Anonymous'); // We'll update username later if needed
        }

        const today = getTodayString();
        console.log('Today\'s date:', today);

        const docRef = doc(db, 'users', userId, 'smoking_records', today);
        console.log('Document reference created');

        const data = {
            smokedCount,
            nicotineAmount: smokedCount * 12, // 12mg per smoke
            timestamp: Timestamp.now(),
            date: today
        };
        console.log('Data to save:', data);

        await setDoc(docRef, data);
        console.log('Data saved successfully');

        return true;
    } catch (error) {
        console.error('Error in saveSmokingData:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
        }
        throw error;
    }
};

// Function to get today's smoking data
export const getTodaySmokingData = async (userId: string) => {
    try {
        const today = getTodayString();
        const docRef = doc(db, 'users', userId, 'smoking_records', today);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting today\'s smoking data:', error);
        throw error;
    }
};

// Function to get user data
export const getUserData = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
};

// Function to initialize database structure
export const initializeDatabase = async (userId: string) => {
    try {
        console.log('Initializing database structure for user:', userId);

        // Create users collection and user document if they don't exist
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log('Creating initial user document');
            await setDoc(userRef, {
                username: 'Anonymous',
                createdAt: Timestamp.now(),
                lastActive: Timestamp.now(),
                isFirstTime: true
            });
        }

        // Create a test document in smoking_records to ensure the subcollection exists
        const today = getTodayString();
        const recordRef = doc(db, 'users', userId, 'smoking_records', today);
        const recordSnap = await getDoc(recordRef);

        if (!recordSnap.exists()) {
            console.log('Creating initial smoking record');
            await setDoc(recordRef, {
                smokedCount: 0,
                nicotineAmount: 0,
                timestamp: Timestamp.now(),
                date: today
            });
        }

        console.log('Database structure initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// Function to verify Firebase connection
export const verifyFirebaseConnection = async () => {
    try {
        console.log('Verifying Firebase connection...');

        // Log current Firebase config (without sensitive data)
        console.log('Firebase project:', firebaseConfig.projectId);

        // Try to get a document to verify connection
        const testRef = doc(db, 'users', 'test');
        console.log('Attempting to read test document...');

        try {
            const docSnap = await getDoc(testRef);
            console.log('Test document read result:', {
                exists: docSnap.exists(),
                error: null
            });
        } catch (readError: any) {
            console.error('Error reading test document:', {
                name: readError?.name,
                message: readError?.message,
                code: readError?.code,
                stack: readError?.stack
            });

            // Check if it's a permissions error
            if (readError?.code === 'permission-denied') {
                console.error('Firebase permissions error. Current rules:', {
                    projectId: firebaseConfig.projectId,
                    database: '(default)'
                });
                throw new Error('Firebase permissions error. Please check security rules.');
            }
            throw readError;
        }

        console.log('Firebase connection verified successfully');
        return true;
    } catch (error: any) {
        console.error('Firebase connection verification failed:', {
            error,
            name: error?.name,
            message: error?.message,
            code: error?.code,
            stack: error?.stack
        });
        throw error;
    }
};

// Function to get weekly statistics
export const getWeeklyStatistics = async (userId: string) => {
    try {
        console.log('Fetching weekly statistics for user:', userId);
        const { startOfWeek, endOfWeek } = getWeekDates();

        // Get all dates in the week
        const dates: string[] = [];
        const currentDate = new Date(startOfWeek);
        while (currentDate <= endOfWeek) {
            dates.push(getDateString(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Fetch data for each day
        const weeklyData = await Promise.all(
            dates.map(async (date) => {
                const docRef = doc(db, 'users', userId, 'smoking_records', date);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    return {
                        date,
                        smokedCount: data.smokedCount || 0,
                        nicotineAmount: data.nicotineAmount || 0,
                        timestamp: data.timestamp
                    };
                }

                return {
                    date,
                    smokedCount: 0,
                    nicotineAmount: 0,
                    timestamp: null
                };
            })
        );

        // Calculate statistics
        const totalSmokes = weeklyData.reduce((sum, day) => sum + day.smokedCount, 0);
        const totalNicotine = weeklyData.reduce((sum, day) => sum + day.nicotineAmount, 0);
        const averageSmokesPerDay = totalSmokes / 7;
        const maxSmokesInDay = Math.max(...weeklyData.map(day => day.smokedCount));
        const daysWithSmoking = weeklyData.filter(day => day.smokedCount > 0).length;

        return {
            weeklyData,
            statistics: {
                totalSmokes,
                totalNicotine,
                averageSmokesPerDay,
                maxSmokesInDay,
                daysWithSmoking,
                startDate: getDateString(startOfWeek),
                endDate: getDateString(endOfWeek)
            }
        };
    } catch (error) {
        console.error('Error fetching weekly statistics:', error);
        throw error;
    }
};

export { db }; 