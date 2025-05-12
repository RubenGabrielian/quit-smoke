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
        // Try to get a document to verify connection
        const testRef = doc(db, 'users', 'test');
        await getDoc(testRef);
        console.log('Firebase connection verified successfully');
        return true;
    } catch (error) {
        console.error('Firebase connection verification failed:', error);
        throw error;
    }
};

export { db }; 