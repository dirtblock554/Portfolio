import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// NOTE: these values are not secrets. A Firebase web config is meant to ship in
// the client bundle; access is controlled by the database rules in
// database.rules.json, not by hiding this object.
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
const auth = getAuth(app);
const storage = getStorage(app);

// Database references
const settingsRef = ref(database, "settings");
const animationsRef = ref(database, "animations");
const achievementsRef = ref(database, "achievements");
const galleriesRef = ref(database, "galleries");

// ============================================
// AUTH
// ============================================

// Turn a Firebase error into something worth showing a human.
const friendlyAuthError = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/user-disabled":
      return "That account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled for this project.";
    default:
      return "Sign-in failed. Please try again.";
  }
};

// Is this signed-in user flagged as an admin in the database?
// Rules let a user read only their own /admins/<uid> node.
const checkAdminClaim = async (uid) => {
  const snapshot = await get(ref(database, `admins/${uid}`));
  return snapshot.val() === true;
};

// Sign in, then confirm the account is actually an admin. A valid account that
// isn't an admin gets signed straight back out — the database rules would
// reject its writes anyway, so there's no reason to show it the admin UI.
export const signInAdmin = async (email, password) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const isAdmin = await checkAdminClaim(credential.user.uid);

    if (!isAdmin) {
      await signOut(auth);
      return { ok: false, message: "That account doesn't have admin access." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Sign-in failed:", error);
    return { ok: false, message: friendlyAuthError(error.code) };
  }
};

export const signOutAdmin = async () => {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    console.error("Sign-out failed:", error);
    return { ok: false, message: "Could not sign out." };
  }
};

// Fires whenever auth state changes, with the admin check already resolved.
// Returns an unsubscribe function.
export const subscribeToAdminState = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(false);
      return;
    }

    try {
      callback(await checkAdminClaim(user.uid));
    } catch (error) {
      console.error("Admin check failed:", error);
      callback(false);
    }
  });
};

// ============================================
// STORAGE (uploaded entry photos)
// ============================================

// Uploads one image file under entry-media/<collection>/<entryId>/, returning
// its public download URL. Storage rules cap files at 10MB and require an
// image content type.
export const uploadEntryImage = async (collection, entryId, file) => {
  try {
    const path = `entry-media/${collection}/${entryId}/${Date.now()}-${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { ok: true, url, path };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { ok: false, message: error?.message || "Upload failed." };
  }
};

// Best-effort cleanup when a photo is removed from an entry. Failures are
// swallowed -- an orphaned file in Storage costs nothing the visitor sees,
// unlike a failed data save.
export const deleteEntryImage = async (path) => {
  if (!path) return;
  try {
    await deleteObject(storageRef(storage, path));
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// ============================================
// DATA
// ============================================

// Writes are rejected by the database rules unless an admin is signed in, so
// these report failure to the caller instead of swallowing it — a silently
// dropped write looks exactly like a successful edit until the page reloads.
const writeFailure = (error) => {
  if (error?.code === "PERMISSION_DENIED") {
    return {
      ok: false,
      message: "Permission denied — your admin session may have expired. Sign in again.",
    };
  }
  return { ok: false, message: error?.message || "Unknown error." };
};

// Save settings to Firebase
export const saveSettings = async (settings) => {
  try {
    await set(settingsRef, settings);
    return { ok: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return writeFailure(error);
  }
};

// Save animations to Firebase
export const saveAnimations = async (animations) => {
  try {
    await set(animationsRef, animations);
    return { ok: true };
  } catch (error) {
    console.error("Error saving animations:", error);
    return writeFailure(error);
  }
};

// Save achievements to Firebase
export const saveAchievements = async (achievements) => {
  try {
    await set(achievementsRef, achievements);
    return { ok: true };
  } catch (error) {
    console.error("Error saving achievements:", error);
    return writeFailure(error);
  }
};

// Save one gallery category (storyboarding, concepts, graphic design, ...)
export const saveGallery = async (category, entries) => {
  try {
    await set(ref(database, `galleries/${category}`), entries);
    return { ok: true };
  } catch (error) {
    console.error(`Error saving ${category} gallery:`, error);
    return writeFailure(error);
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

// Subscribe to achievements changes (real-time)
export const subscribeToAchievements = (callback) => {
  return onValue(achievementsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};

// Subscribe to all gallery categories at once (real-time). The value is an
// object keyed by category name, each holding an array of entries.
export const subscribeToGalleries = (callback) => {
  return onValue(galleriesRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};

export { database, auth };
