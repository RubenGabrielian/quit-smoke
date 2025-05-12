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

export { db }; 