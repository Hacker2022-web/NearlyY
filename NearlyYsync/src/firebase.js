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

// 1. Subscribe in real time to services catalog
export function subscribeToServices(onUpdate) {
  try {
    return onSnapshot(collection(db, 'services'), (snapshot) => {
      if (snapshot.empty) {
        // Auto seed default Lohegaon vendors if empty
        seedAllDefaultServices().catch(() => {});
        const flatList = [];
        Object.keys(CATEGORY_DATA).forEach(cat => {
          CATEGORY_DATA[cat].forEach(item => flatList.push(item));
        });
        return onUpdate(flatList);
      }
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      onUpdate(list);
    }, (err) => {
      console.warn("Services snapshot error (fallback):", err.message);
      const flatList = [];
      Object.keys(CATEGORY_DATA).forEach(cat => {
        CATEGORY_DATA[cat].forEach(item => flatList.push(item));
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
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn("fetchServicesFromFirebase error:", err.message);
  }
  const flatList = [];
  Object.keys(CATEGORY_DATA).forEach(cat => {
    CATEGORY_DATA[cat].forEach(item => flatList.push(item));
  });
  return flatList;
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
    await deleteDoc(doc(db, 'services', id));
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
    for (const cat of ['mess', 'laundry', 'gym', 'flats']) {
      for (const item of CATEGORY_DATA[cat]) {
        await setDoc(doc(db, 'services', item.id), item, { merge: true });
      }
    }
    return { success: true };
  } catch (err) {
    console.error("Seed error:", err);
    return { success: false, error: err.message };
  }
}

