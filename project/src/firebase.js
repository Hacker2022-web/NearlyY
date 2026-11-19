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

// Real-time listener for services catalog
export function subscribeToServices(onUpdate) {
  try {
    return onSnapshot(collection(db, 'services'), (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed if remote Firestore collection is empty
        seedFirestore().catch(() => {});
        return onUpdate(CATEGORY_DATA);
      }
      const remote = { mess: [], laundry: [], gym: [], flats: [], parties: [] };
      snapshot.docs.forEach(d => {
        const item = { id: d.id, ...d.data() };
        if (remote[item.category]) {
          remote[item.category].push(item);
        }
      });
      // Ensure all categories have at least mock data if remote category was empty
      for (const cat of ['mess', 'laundry', 'gym', 'flats', 'parties']) {
        if (!remote[cat] || remote[cat].length === 0) {
          remote[cat] = CATEGORY_DATA[cat] || [];
        }
      }
      onUpdate(remote);
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

// Real-time Google Authentication via Firebase Auth
// Strictly platform-split: Native Credential Manager on APK/iOS, Popup only on Web
export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  console.log(`[Auth] platform=${platform}, path=${isNative ? 'native' : 'web'}, isNative=${isNative}`);

  try {
    let user;

    if (isNative) {
      // ── STRICT NATIVE PATH: NEVER calls popup or redirect ──
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      console.log("[Auth] Triggering native Google Sign-In via Credential Manager...");
      const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });

      const idToken = result.credential?.idToken;
      if (!idToken) {
        throw new Error('Native Google Sign-In returned no ID token. Please verify Google Play Services.');
      }

      console.log("[Auth] Native ID token received, signing into Firebase JS SDK with credential...");
      const credential = GoogleAuthProvider.credential(idToken, result.credential.accessToken);
      const fbResult = await signInWithCredential(auth, credential);
      user = fbResult.user;
    } else {
      // ── STRICT WEB PATH: Desktop / mobile browser only ──
      console.log("[Auth] Triggering standard Web signInWithPopup...");
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }

    const profile = {
      uid: user?.uid || `user_${Date.now()}`,
      name: user?.displayName || 'Student',
      email: user?.email || '',
      avatar: user?.photoURL || user?.photoUrl || '',
      provider: 'google',
      lastLogin: new Date().toISOString()
    };
    await syncUserProfile(profile);
    console.log("[Auth] User profile synchronized successfully for:", profile.email);
    return { success: true, user: profile };
  } catch (error) {
    console.error(`[Auth] Sign-in error on platform=${platform}:`, error?.code, error?.message);
    return { 
      success: false, 
      code: error?.code || 'auth/unknown', 
      message: error?.message || 'Google sign-in failed' 
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
