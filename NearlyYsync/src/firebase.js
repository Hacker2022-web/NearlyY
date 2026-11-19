import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, 
  getDocs, query, orderBy 
} from 'firebase/firestore';
import { CATEGORY_DATA } from './data/mockData';

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

export function getSanitizedCategory(item) {
  if (!item) return 'mess';
  const name = (item.name || '').toLowerCase();
  const rawCat = (item.category || '').toLowerCase().trim();

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

  if (['mess', 'laundry', 'gym', 'flats', 'parties'].includes(rawCat)) return rawCat;
  if (rawCat.includes('mess') || rawCat.includes('tiffin')) return 'mess';
  if (rawCat.includes('laund')) return 'laundry';
  if (rawCat.includes('gym') || rawCat.includes('fit')) return 'gym';
  if (rawCat.includes('flat') || rawCat.includes('pg') || rawCat.includes('room')) return 'flats';
  if (rawCat.includes('part') || rawCat.includes('event')) return 'parties';
  return 'mess';
}

// 1. Subscribe in real time to services catalog (bidirectionally synced with NearlyY)
export function subscribeToServices(onUpdate) {
  try {
    return onSnapshot(collection(db, 'services'), (snapshot) => {
      const remoteMap = new Map();
      snapshot.docs.forEach(docSnap => {
        remoteMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });

      const combined = [];
      const seenIds = new Set();

      // First add all default items (overridden by remote if present, unless marked deleted)
      Object.keys(CATEGORY_DATA).forEach(cat => {
        (CATEGORY_DATA[cat] || []).forEach(defaultItem => {
          seenIds.add(defaultItem.id);
          if (remoteMap.has(defaultItem.id)) {
            const remoteItem = remoteMap.get(defaultItem.id);
            if (!remoteItem._deleted) {
              const properCat = getSanitizedCategory(remoteItem) || cat;
              combined.push({ ...defaultItem, ...remoteItem, category: properCat });
            }
          } else {
            combined.push(defaultItem);
          }
        });
      });

      // Then add any custom vendor items added via NearlyYsync that aren't in defaults
      remoteMap.forEach((item, id) => {
        if (!seenIds.has(id) && !item._deleted) {
          const properCat = getSanitizedCategory(item);
          combined.push({ ...item, category: properCat });
        }
      });

      onUpdate(combined);

      // Auto-seed missing defaults to Firestore so cloud database is always complete
      if (snapshot.size < 15) {
        seedAllDefaultServices().catch(() => {});
      }
    }, (err) => {
      console.warn("Services snapshot error (fallback):", err.message);
      const flatList = [];
      Object.keys(CATEGORY_DATA).forEach(cat => {
        (CATEGORY_DATA[cat] || []).forEach(item => flatList.push(item));
      });
      onUpdate(flatList);
    });
  } catch {
    return () => {};
  }
}

// 1b. Fetch once directly from Firebase
export async function fetchServicesFromFirebase() {
  try {
    const snapshot = await getDocs(collection(db, 'services'));
    const remoteMap = new Map();
    snapshot.docs.forEach(d => remoteMap.set(d.id, { id: d.id, ...d.data() }));

    const combined = [];
    const seenIds = new Set();

    Object.keys(CATEGORY_DATA).forEach(cat => {
      (CATEGORY_DATA[cat] || []).forEach(defaultItem => {
        seenIds.add(defaultItem.id);
        if (remoteMap.has(defaultItem.id)) {
          const remoteItem = remoteMap.get(defaultItem.id);
          if (!remoteItem._deleted) {
            combined.push({ ...defaultItem, ...remoteItem });
          }
        } else {
          combined.push(defaultItem);
        }
      });
    });

    remoteMap.forEach((item, id) => {
      if (!seenIds.has(id) && !item._deleted) {
        combined.push(item);
      }
    });

    return combined;
  } catch (err) {
    console.warn("fetchServicesFromFirebase error:", err.message);
    const flatList = [];
    Object.keys(CATEGORY_DATA).forEach(cat => {
      (CATEGORY_DATA[cat] || []).forEach(item => flatList.push(item));
    });
    return flatList;
  }
}

// 2. Add a new service listing (Mess, Laundry, Gym, Flat)
export async function addServiceListing(item) {
  try {
    const id = item.id || `${item.category}_${Date.now()}`;
    const payload = {
      ...item,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, 'services', id), payload, { merge: true });
    return { success: true, id };
  } catch (err) {
    console.error("Error adding service:", err);
    return { success: false, error: err.message };
  }
}

// 3. Update an existing service listing
export async function updateServiceListing(id, updates) {
  try {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'services', id), payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error("Error updating service:", err);
    return { success: false, error: err.message };
  }
}

// 4. Delete a service listing
export async function deleteServiceListing(id) {
  try {
    // Write tombstone so deleted items (both defaults and custom) disappear immediately from all apps
    await setDoc(doc(db, 'services', id), {
      _deleted: true,
      deletedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error("Error deleting service:", err);
    return { success: false, error: err.message };
  }
}

// 5. Subscribe to incoming bookings made from the main NearlyY app
export function subscribeToIncomingBookings(onUpdate) {
  try {
    return onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (snapshot.empty) return onUpdate([]);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(list);
    }, (err) => {
      console.warn("Bookings snapshot notice:", err.message);
    });
  } catch {
    return () => {};
  }
}

// 6. Update booking status
export async function updateBookingStatus(bookingId, status) {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status,
      statusUpdatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 7. Subscribe to student inquiries & leads
export function subscribeToInquiries(onUpdate) {
  try {
    return onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      if (snapshot.empty) return onUpdate([]);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      onUpdate(list);
    }, () => {});
  } catch {
    return () => {};
  }
}

// 8. Subscribe to registered residents / students from main app
export function subscribeToUsers(onUpdate) {
  try {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
      if (snapshot.empty) return onUpdate([]);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      onUpdate(list);
    }, () => {});
  } catch {
    return () => {};
  }
}

// Seed all initial default services
export async function seedAllDefaultServices() {
  try {
    for (const cat of ['mess', 'laundry', 'gym', 'flats', 'parties']) {
      for (const item of (CATEGORY_DATA[cat] || [])) {
        await setDoc(doc(db, 'services', item.id), item, { merge: true });
      }
    }
    return { success: true };
  } catch (err) {
    console.error("Seed error:", err);
    return { success: false, error: err.message };
  }
}

// 9. App Releases & OTA Updates Management
export const DEFAULT_APP_CONFIG = {
  latestVersion: "1.0.1",
  minVersion: "1.0.0",
  apkUrl: "https://github.com/Hacker2022-web/NearlyY/raw/main/APKs/NearlyY.apk",
  bundleUrl: "",
  bundleVersion: "",
  changelog: "• Live Over-The-Air (OTA) updates enabled\n• Direct in-app APK installer with 1-tap download\n• Fixed Flats & PG image display & category routing\n• Full-screen swipe-to-back & system gesture navigation\n• Lohegaon campus vendor sync with NearlyYsync",
  forceUpdate: false,
  updatedAt: new Date().toISOString()
};

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

