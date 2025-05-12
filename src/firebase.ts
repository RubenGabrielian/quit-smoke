import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to get today's date string in YYYY-MM-DD format
const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
};

// Function to check if user exists
export const checkUserExists = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
};

// Function to create new user
export const createNewUser = async (userId: string, username: string) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
        username,
        createdAt: Timestamp.now(),
        isFirstTime: true,
        lastActive: Timestamp.now()
    });
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
    const today = getTodayString();
    const docRef = doc(db, 'users', userId, 'smoking_records', today);

    await setDoc(docRef, {
        smokedCount,
        nicotineAmount: smokedCount * 12, // 12mg per smoke
        timestamp: Timestamp.now(),
        date: today
    });
};

// Function to get today's smoking data
export const getTodaySmokingData = async (userId: string) => {
    const today = getTodayString();
    const docRef = doc(db, 'users', userId, 'smoking_records', today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};

// Function to get user data
export const getUserData = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    }
    return null;
};

export { db }; 