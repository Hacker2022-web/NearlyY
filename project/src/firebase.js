import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, doc, setDoc, getDoc, 
  query, where, orderBy, getDocs 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { CATEGORY_DATA } from './data/mockData';

// ponytail: single env-backed config with robust fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD2r48eYtWthHtE5SUIXtoWL9GGfz-fpLs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nearlyy225.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nearlyy225",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nearlyy225.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1095901729333",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1095901729333:android:e784989f1917f2044f977c"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Category normalizer to prevent misclassified vendor listings
export function getSanitizedCategory(item) {
  if (!item) return 'mess';
  const name = (item.name || '').toLowerCase();
  const rawCat = (item.category || '').toLowerCase().trim();

  // If item name clearly denotes category, prioritize that to catch misclassifications
  if (name.includes('thali') || name.includes('tiffin') || name.includes('mess') || name.includes('bhojan') || name.includes('pakpalak') || name.includes('food') || name.includes('meal')) {
    return 'mess';
  }
  if (name.includes('laundry') || name.includes('dry clean') || name.includes('wash') || name.includes('ironing')) {
    return 'laundry';
  }
  if (name.includes('gym') || name.includes('fitness') || name.includes('crossfit') || name.includes('workout')) {
    return 'gym';
  }
  if (name.includes('pg') || name.includes('flat') || name.includes('bhk') || name.includes('hostel') || name.includes('stay') || name.includes('coliving') || name.includes('nest') || name.includes('residency')) {
    return 'flats';
  }
  if (name.includes('event') || name.includes('party') || name.includes('dj') || name.includes('night') || name.includes('fest')) {
    return 'parties';
  }

  // Fallback to normalized rawCat
  if (['mess', 'laundry', 'gym', 'flats', 'parties'].includes(rawCat)) return rawCat;
  if (rawCat.includes('mess') || rawCat.includes('tiffin')) return 'mess';
  if (rawCat.includes('laund')) return 'laundry';
  if (rawCat.includes('gym') || rawCat.includes('fit')) return 'gym';
  if (rawCat.includes('flat') || rawCat.includes('pg') || rawCat.includes('room')) return 'flats';
  if (rawCat.includes('part') || rawCat.includes('event')) return 'parties';
  return 'mess';
}

// Real-time listener for services catalog (bidirectionally synced with NearlyYsync)
export function subscribeToServices(onUpdate) {
  try {
    return onSnapshot(collection(db, 'services'), (snapshot) => {
      // Build map of remote items from Firestore
      const remoteMap = new Map();
      snapshot.docs.forEach(docSnap => {
        remoteMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });

      const categorized = { mess: [], laundry: [], gym: [], flats: [], parties: [] };
      const seenIds = new Set();

      // 1. Fill base categories from CATEGORY_DATA merged with remote Firestore overrides
      Object.keys(CATEGORY_DATA).forEach(cat => {
        if (!categorized[cat]) categorized[cat] = [];
        (CATEGORY_DATA[cat] || []).forEach(defaultItem => {
          seenIds.add(defaultItem.id);
          if (remoteMap.has(defaultItem.id)) {
            const remoteItem = remoteMap.get(defaultItem.id);
            if (!remoteItem._deleted) {
              const properCat = getSanitizedCategory(remoteItem) || cat;
              if (categorized[properCat]) {
                categorized[properCat].push({ ...defaultItem, ...remoteItem, category: properCat });
              }
            }
          } else {
            categorized[cat].push(defaultItem);
          }
        });
      });

      // 2. Add any custom items added in NearlyYsync
      remoteMap.forEach((item, id) => {
        if (!seenIds.has(id) && !item._deleted) {
          const cat = getSanitizedCategory(item);
          if (categorized[cat]) {
            // New user listings placed at top of category feed
            categorized[cat].unshift({ ...item, category: cat });
          }
        }
      });

      // If remote collection has few/no documents, auto-seed all default services to Firestore
      if (snapshot.size < 15) {
        seedFirestore().catch(() => {});
      }

      onUpdate(categorized);
    }, (err) => {
      console.warn("Firestore services snapshot notice (using local data):", err.message);
      onUpdate(CATEGORY_DATA);
    });
  } catch {
    onUpdate(CATEGORY_DATA);
    return () => {};
  }
}

// Seed firestore with initial Lohegaon vendors
export async function seedFirestore() {
  try {
    for (const cat of ['mess', 'laundry', 'gym', 'flats', 'parties']) {
      for (const item of (CATEGORY_DATA[cat] || [])) {
        await setDoc(doc(db, 'services', item.id), item, { merge: true });
      }
    }
    return { success: true };
  } catch (err) {
    console.error("Firestore seed error:", err);
    return { success: false, error: err.message };
  }
}

// Real-time user profile sync to Firestore
export async function syncUserProfile(profile) {
  try {
    const existingStr = localStorage.getItem('nearlyy_user');
    let merged = { ...profile };
    if (existingStr) {
      try {
        const existing = JSON.parse(existingStr);
        merged = {
          interests: ['Mess & Tiffin', 'Flats & PG', 'Gym & Fitness', 'Laundry & Dry Cleaning'],
          ...existing,
          ...profile
        };
      } catch (e) {}
    }
    if (!Array.isArray(merged.interests) || merged.interests.length === 0) {
      merged.interests = ['Mess & Tiffin', 'Flats & PG', 'Gym & Fitness', 'Laundry & Dry Cleaning'];
    }
    localStorage.setItem('nearlyy_user', JSON.stringify(merged));
    const userId = merged.email ? merged.email.replace(/[^a-zA-Z0-9_]/g, '_') : 'current_user';
    await setDoc(doc(db, 'users', userId), {
      ...merged,
      syncedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore user sync notice (persisted to localStorage):", err.message);
    return { success: false, error: err.message };
  }
}

// Fetch a user profile from Firestore by email
export async function fetchUserProfile(email) {
  if (!email) return null;
  try {
    const userId = email.replace(/[^a-zA-Z0-9_]/g, '_');
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {
    console.warn("[Auth] fetchUserProfile notice:", err.message);
  }
  return null;
}

// Real-time Google Authentication via Firebase Auth
// Strictly platform-split: Native Google Sign-In on APK/iOS, Popup on Web
export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  console.log(`[Auth] platform=${platform}, path=${isNative ? 'native' : 'web'}, isNative=${isNative}`);

  try {
    let user;

    if (isNative) {
      // ── STRICT NATIVE PATH ──
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      console.log("[Auth] Triggering native Google Sign-In...");

      let result;
      try {
        // Try modern Credential Manager first
        result = await FirebaseAuthentication.signInWithGoogle({ 
          skipNativeAuth: true, 
          useCredentialManager: true 
        });
      } catch (credErr) {
        console.warn("[Auth] Credential Manager returned error, falling back to GoogleSignInClient:", credErr?.message);
        // Fallback to traditional Google Play Services Account Picker
        result = await FirebaseAuthentication.signInWithGoogle({ 
          skipNativeAuth: true, 
          useCredentialManager: false 
        });
      }

      const idToken = result?.credential?.idToken || result?.idToken;
      if (!idToken) {
        throw new Error('Native Google Sign-In returned no ID token. Please verify Google Play Services.');
      }

      console.log("[Auth] Native ID token received, signing into Firebase JS SDK with credential...");
      const credential = GoogleAuthProvider.credential(idToken, result?.credential?.accessToken || result?.accessToken);
      const fbResult = await signInWithCredential(auth, credential);
      user = fbResult.user;
    } else {
      // ── STRICT WEB PATH: Desktop / mobile browser ──
      console.log("[Auth] Triggering standard Web signInWithPopup...");
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }

    const baseProfile = {
      uid: user?.uid || `user_${Date.now()}`,
      name: user?.displayName || 'Student',
      email: user?.email || '',
      avatar: user?.photoURL || user?.photoUrl || '',
      provider: 'google',
      lastLogin: new Date().toISOString()
    };

    // Check if user already exists in Firestore
    const existingCloudProfile = await fetchUserProfile(baseProfile.email);
    const isExisting = Boolean(existingCloudProfile && (existingCloudProfile.onboarded || existingCloudProfile.college));

    const finalProfile = {
      ...baseProfile,
      ...(existingCloudProfile || {})
    };

    await syncUserProfile(finalProfile);
    console.log("[Auth] User profile synchronized successfully for:", finalProfile.email);
    return { 
      success: true, 
      user: finalProfile, 
      isExistingUser: isExisting 
    };
  } catch (error) {
    console.error(`[Auth] Sign-in error on platform=${platform}:`, error?.code, error?.message);
    const msg = String(error?.message || '').toLowerCase();
    const isCancelled = msg.includes('cancel') || msg.includes('16') || error?.code === 'auth/popup-closed-by-user';

    return { 
      success: false, 
      cancelled: isCancelled,
      code: error?.code || 'auth/unknown', 
      message: isCancelled 
        ? 'Sign in was cancelled.' 
        : (error?.message || 'Google sign-in failed. Try Quick Student Entry.') 
    };
  }
}

// Real-time Auth State Observer
export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = {
        uid: user.uid,
        name: user.displayName || 'Student',
        email: user.email || '',
        avatar: user.photoURL || '',
        provider: 'google',
        lastLogin: new Date().toISOString()
      };
      await syncUserProfile(profile);
      callback(profile);
    }
  });
}

// Sign out from Firebase Auth (and native layer if on Capacitor)
export async function logoutUser() {
  try {
    if (Capacitor.isNativePlatform()) {
      try {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        await FirebaseAuthentication.signOut();
      } catch (e) {
        // fallthrough to signOut below
      }
    }
    await signOut(auth);
    localStorage.removeItem('nearlyy_user');
    localStorage.removeItem('nearlyy_onboarded');
    return { success: true };
  } catch (error) {
    console.warn("Firebase sign out warning:", error.message);
    return { success: false, error: error.message };
  }
}

// Store every booking/trial request in Firestore collection 'bookings'
export async function recordBooking(booking) {
  const bookingId = `booking_${Date.now()}`;
  const record = {
    ...booking,
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  // 1. Local storage instant persistence
  try {
    const existing = JSON.parse(localStorage.getItem('nearlyy_bookings') || '[]');
    existing.unshift(record);
    localStorage.setItem('nearlyy_bookings', JSON.stringify(existing));
  } catch (e) {
    console.warn("Local storage booking error:", e);
  }

  // 2. Real-time Firestore persistence
  try {
    await setDoc(doc(db, 'bookings', bookingId), record, { merge: true });
    
    // Also attach to user document sub-collection if user email exists
    if (booking.userEmail) {
      const userId = booking.userEmail.replace(/[^a-zA-Z0-9_]/g, '_');
      await setDoc(doc(db, 'users', userId, 'user_bookings', bookingId), record, { merge: true });
    }
    return { success: true, bookingId };
  } catch (err) {
    console.warn("Firestore booking sync error (saved locally):", err.message);
    return { success: false, bookingId, error: err.message };
  }
}

// Store every chat click or user inquiry in Firestore collection 'inquiries'
export async function recordInquiry(inquiry) {
  const inqId = `inq_${Date.now()}`;
  const record = {
    ...inquiry,
    id: inqId,
    timestamp: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('nearlyy_inquiries') || '[]');
    existing.unshift(record);
    localStorage.setItem('nearlyy_inquiries', JSON.stringify(existing));
  } catch (e) {}

  try {
    await setDoc(doc(db, 'inquiries', inqId), record, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore inquiry sync error:", err.message);
    return { success: false };
  }
}

// Real-time listener for user bookings
export function subscribeToBookings(userEmail, onUpdate) {
  try {
    const local = JSON.parse(localStorage.getItem('nearlyy_bookings') || '[]');
    onUpdate(local);

    return onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const userList = userEmail 
          ? list.filter(b => b.userEmail === userEmail || !b.userEmail) 
          : list;
        if (userList.length > 0) {
          onUpdate(userList);
        }
      }
    }, () => {});
  } catch {
    return () => {};
  }
}

// ============================================================
// App Version & Remote Update Management (OTA + APK)
// ============================================================

export const DEFAULT_APP_CONFIG = {
  latestVersion: "1.0.1",
  minVersion: "1.0.0",
  apkUrl: "https://github.com/Hacker2022-web/NearlyY/raw/main/APKs/NearlyY.apk",
  bundleUrl: "",
  bundleVersion: "",
  changelog: "• Capgo Live Over-The-Air (OTA) updates\n• Direct in-app APK installer with 1-tap download\n• Fixed Flats & PG image display & category routing\n• Full-screen swipe-to-back & system gesture navigation\n• Lohegaon campus vendor sync with NearlyYsync",
  forceUpdate: false,
  updatedAt: new Date().toISOString()
};

export async function fetchAppConfig() {
  try {
    const docRef = doc(db, 'app_config', 'version');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    await setDoc(docRef, DEFAULT_APP_CONFIG, { merge: true });
    return DEFAULT_APP_CONFIG;
  } catch (err) {
    console.warn("fetchAppConfig notice (using default):", err.message);
    return DEFAULT_APP_CONFIG;
  }
}

export function subscribeToAppConfig(onUpdate) {
  try {
    const docRef = doc(db, 'app_config', 'version');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      } else {
        setDoc(docRef, DEFAULT_APP_CONFIG, { merge: true }).catch(() => {});
        onUpdate(DEFAULT_APP_CONFIG);
      }
    }, (err) => {
      console.warn("subscribeToAppConfig notice:", err.message);
      onUpdate(DEFAULT_APP_CONFIG);
    });
  } catch {
    onUpdate(DEFAULT_APP_CONFIG);
    return () => {};
  }
}

export async function updateAppConfig(configUpdates) {
  try {
    const docRef = doc(db, 'app_config', 'version');
    await setDoc(docRef, {
      ...configUpdates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error("updateAppConfig error:", err);
    return { success: false, error: err.message };
  }
}
