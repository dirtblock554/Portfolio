import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCMP4B0KzHcoPVST2Uk5i0SBXJ8-K0n33U",
  authDomain: "portfolio-7b1e9.firebaseapp.com",
  databaseURL: "https://portfolio-7b1e9-default-rtdb.firebaseio.com",
  projectId: "portfolio-7b1e9",
  storageBucket: "portfolio-7b1e9.firebasestorage.app",
  messagingSenderId: "824407914008",
  appId: "1:824407914008:web:1ff30452726fabb067756d",
  measurementId: "G-GDZ1SG95GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database references
const settingsRef = ref(database, "settings");
const animationsRef = ref(database, "animations");

// Save settings to Firebase
export const saveSettings = async (settings) => {
  try {
    await set(settingsRef, settings);
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
};

// Save animations to Firebase
export const saveAnimations = async (animations) => {
  try {
    await set(animationsRef, animations);
    return true;
  } catch (error) {
    console.error("Error saving animations:", error);
    return false;
  }
};

// Get settings from Firebase (one-time)
export const getSettings = async () => {
  try {
    const snapshot = await get(settingsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error getting settings:", error);
    return null;
  }
};

// Get animations from Firebase (one-time)
export const getAnimations = async () => {
  try {
    const snapshot = await get(animationsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error getting animations:", error);
    return null;
  }
};

// Subscribe to settings changes (real-time)
export const subscribeToSettings = (callback) => {
  return onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};

// Subscribe to animations changes (real-time)
export const subscribeToAnimations = (callback) => {
  return onValue(animationsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};

export { database };
