import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  UtensilsCrossed, Shirt, Dumbbell, Home, ArrowRight, Bell, Search, Star, 
  Bookmark, Phone, MessageCircle, Check, CheckCircle2, MapPin, Calendar, 
  ChevronRight, Sparkles, Clock, Flame, Droplets, Wifi, Zap, RotateCw, 
  Snowflake, Users, Activity, ShowerHead, Heart, Settings, HelpCircle, 
  Info, LogOut, Crown, ShoppingBag, Filter, ArrowLeft, Shield, Compass, User,
  Mail, Camera, GraduationCap, Briefcase, Building, X, CheckSquare, Square,
  MessageSquare, Radio, Send, BellRing, ChevronLeft, Image as ImageIcon,
  Instagram, PhoneCall, Music, Ticket, ExternalLink
} from 'lucide-react';
import { 
  LOCALITY, SERVICES_MENU, CATEGORY_DATA, USER_PROFILE 
} from './data/mockData';
import { 
  subscribeToServices, seedFirestore, syncUserProfile, 
  recordBooking, recordInquiry, subscribeToBookings,
  signInWithGoogle, logoutUser, listenToAuthState
} from './firebase';

// Curated Lohegaon Campus & Living Slides for Front Page
const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
    title: 'Flats & Student PGs',
    badge: 'ADYPU & Pune',
    location: 'Lohegaon, Pune',
    tagline: 'Verified spaces with zero brokerage'
  },
  {
    image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
    title: 'Hygienic Mess & Tiffins',
    badge: 'Unlimited Thalis',
    location: 'DY Patil Road, Lohegaon',
    tagline: 'Home-style nutritious daily meals'
  },
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    title: 'Student Gyms & Express Laundry',
    badge: 'Fast Turnaround',
    location: 'Airforce Campus, Lohegaon',
    tagline: 'Stay active with 24-hr laundry pickup'
  }
];

// Helper: Extract all photos for a listing
const getItemImages = (item) => {
  if (!item) return [];
  if (Array.isArray(item.images) && item.images.length > 0) return item.images.filter(Boolean);
  if (Array.isArray(item.gallery) && item.gallery.length > 0) return [item.coverImage, ...item.gallery].filter(Boolean);
  if (item.coverImage) return [item.coverImage];
  if (item.image) return [item.image];
  return ['https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80'];
};

const PUNE_COLLEGES = [
  { id: 'adypu', name: 'ADYPU', full: 'Ajeenkya DY Patil University, Lohegaon', tag: 'Near Campus' },
  { id: 'vit', name: 'VIT', full: 'Vishwakarma Institute of Technology', tag: 'Pune' },
  { id: 'coep', name: 'COEP', full: 'College of Engineering Pune', tag: 'Pune' },
  { id: 'spit', name: 'SPIT', full: 'Sardar Patel Institute of Technology', tag: 'Autonomous' },
  { id: 'mit', name: 'MIT-WPU', full: 'MIT World Peace University', tag: 'Kothrud' },
  { id: 'professional', name: 'Working Professional', full: 'IT & Corporate Resident (Lohegaon/Viman Nagar)', tag: 'Non-Student' },
  { id: 'other', name: 'Other College / Institution', full: 'Resident in Lohegaon, Pune', tag: 'Local' }
];

const LIVING_TYPES = [
  { id: 'Hostel', title: 'Hostel', icon: Building, desc: 'College / private hostel' },
  { id: 'PG', title: 'PG', icon: Home, desc: 'Paying guest accommodation' },
  { id: 'Flat', title: 'Flat / Apartment', icon: Users, desc: '1BHK / 2BHK / shared' },
  { id: 'At Home', title: 'At Home', icon: Shield, desc: 'Living with family' }
];

const LOHEGAON_LOCALITIES = [
  'Porwal Road, Lohegaon',
  'Near Airforce Station, Lohegaon',
  'Lohegaon Chowk / Market',
  'Sant Nagar / Dhanori Road',
  'Dadachi Vasti, Lohegaon'
];

const CORE_SERVICES = [
  { id: 'Mess & Tiffin', name: 'Mess & Tiffin', icon: UtensilsCrossed, desc: 'Daily thalis & meals', sub: 'From ₹90/meal' },
  { id: 'Laundry & Dry Cleaning', name: 'Laundry & Dry Cleaning', icon: Shirt, desc: 'Per-kg wash & iron', sub: 'Doorstep pickup' },
  { id: 'Gym & Fitness', name: 'Gym & Fitness', icon: Dumbbell, desc: 'Daily passes & monthly gym', sub: 'Student discounts' },
  { id: 'Flats & PG', name: 'Flats & PG', icon: Home, desc: 'Zero brokerage rooms & beds', sub: 'Verified owners' },
  { id: 'Parties & Events', name: 'Parties & Events', icon: Sparkles, desc: 'Weekend bashes, DJ nights & gigs', sub: 'Passes from ₹299' }
];

// Respect OS-level reduced motion preference for all GSAP animations
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Safe first-name / locality helpers (profile fields may be empty)
const firstNameOf = (name) => String(name || 'Student').trim().split(/\s+/)[0] || 'Student';
const shortLocalityOf = (loc) => String(loc || 'Lohegaon').split(',')[0];

export default function App() {
  // Onboarding & Auth States
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('nearlyy_onboarded') === 'true';
  });
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Welcome, 2: Auth, 3: Profile, 4: College, 5: Living, 6: Interests, 7: Ready

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('nearlyy_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Sahil Dehadray',
          email: parsed.email || 'sahil.dehadray@adypu.edu.in',
          avatar: parsed.avatar || '',
          bio: parsed.bio || 'SST \'26 • Living in Lohegaon',
          college: parsed.college || 'ADYPU',
          collegeFull: parsed.collegeFull || 'Ajeenkya DY Patil University, Lohegaon',
          livingType: parsed.livingType || 'PG',
          subLocality: parsed.subLocality || 'Porwal Road, Lohegaon',
          interests: Array.isArray(parsed.interests) && parsed.interests.length > 0 
            ? parsed.interests 
            : ['Mess & Tiffin', 'Flats & PG', 'Gym & Fitness', 'Laundry & Dry Cleaning']
        };
      }
    } catch (e) {
      console.warn("Failed to load saved user profile:", e);
    }
    return {
      name: 'Sahil Dehadray',
      email: 'sahil.dehadray@adypu.edu.in',
      avatar: '',
      bio: 'SST \'26 • Living in Lohegaon',
      college: 'ADYPU',
      collegeFull: 'Ajeenkya DY Patil University, Lohegaon',
      livingType: 'PG',
      subLocality: 'Porwal Road, Lohegaon',
      interests: ['Mess & Tiffin', 'Flats & PG', 'Gym & Fitness', 'Laundry & Dry Cleaning']
    };
  });

  // Services Data (Real-time Firestore + local mock)
  const [servicesData, setServicesData] = useState(CATEGORY_DATA);
  const [firebaseStatus, setFirebaseStatus] = useState('Firebase: Synced 🟢');
  const [userBookings, setUserBookings] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'category-list', 'detail', 'confirmed', 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('mess');
  const [selectedItem, setSelectedItem] = useState(CATEGORY_DATA.mess[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Detail & Filter States
  const [filterTag, setFilterTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChatComingSoonModal, setShowChatComingSoonModal] = useState(false);
  const [isNotifiedForChat, setIsNotifiedForChat] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [bookingDetails, setBookingDetails] = useState({
    title: 'Trial Meal at Annapurna Mess',
    service: 'Mess & Tiffin',
    phone: '919876543210'
  });

  // Front page interactive carousel slide state
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Auto-rotate front page images every 3.5 seconds
  useEffect(() => {
    if (onboardingStep !== 1 || isOnboarded) return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [onboardingStep, isOnboarded]);

  // GSAP: Cross-fade hero carousel slides (both incoming and outgoing)
  useEffect(() => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    if (prefersReducedMotion()) return;

    slides.forEach((slide, idx) => {
      if (idx === heroSlideIndex) {
        gsap.fromTo(
          slide,
          { autoAlpha: 0, scale: 1.06 },
          { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out', overwrite: 'auto', clearProps: 'transform' }
        );
      } else {
        gsap.to(slide, { autoAlpha: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  }, [heroSlideIndex]);
  useEffect(() => {
    const unsubServices = subscribeToServices((data) => {
      setServicesData(data);
      setFirebaseStatus('Firebase: Synced 🟢');
      setSelectedItem(prev => {
        if (!prev || !data) return prev;
        const catList = data[prev.category];
        if (Array.isArray(catList)) {
          const fresh = catList.find(i => i.id === prev.id);
          if (fresh) return fresh;
        }
        return prev;
      });
    });

    const unsubBookings = subscribeToBookings(userProfile.email, (bookings) => {
      setUserBookings(bookings);
    });

    const unsubAuth = listenToAuthState((googleUser) => {
      if (googleUser) {
        setUserProfile(prev => ({
          ...prev,
          name: googleUser.name || prev.name,
          email: googleUser.email || prev.email,
          avatar: googleUser.avatar || prev.avatar,
          uid: googleUser.uid,
          interests: Array.isArray(prev?.interests) && prev.interests.length > 0
            ? prev.interests
            : ['Mess & Tiffin', 'Flats & PG', 'Gym & Fitness', 'Laundry & Dry Cleaning']
        }));
      }
    });

    return () => {
      unsubServices && unsubServices();
      unsubBookings && unsubBookings();
      unsubAuth && unsubAuth();
    };
  }, [userProfile.email]);

  // GSAP: Animate onboarding step change
  useEffect(() => {
    if (isOnboarded || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.onboarding-step-content',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    });
    return () => ctx.revert();
  }, [onboardingStep, isOnboarded]);

  // GSAP: Stagger the home dashboard sections into view
  useEffect(() => {
    if (currentScreen !== 'home' || !isOnboarded || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.home-section',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen, isOnboarded]);

  // GSAP: Animate category list cards + tabs once they are painted
  useEffect(() => {
    if (currentScreen !== 'category-list' || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.service-card',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.32, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
      gsap.fromTo('.service-tab',
        { scale: 0.92 },
        { scale: 1, duration: 0.25, stagger: 0.03, ease: 'back.out(2)', clearProps: 'transform' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen, activeCategory]);

  // GSAP: Animate detail view on open
  useEffect(() => {
    if (currentScreen !== 'detail' || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.detail-view-container',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
      gsap.fromTo('.detail-hero-img',
        { scale: 1.08 },
        { scale: 1, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen, selectedItem]);

  // GSAP: Fade in confirmed / profile screens
  useEffect(() => {
    if (!['confirmed', 'profile'].includes(currentScreen) || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.screen-content',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen]);

  // GSAP: Animate chat modal entrance
  useEffect(() => {
    if (!showChatComingSoonModal || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.chat-modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' });
      gsap.fromTo('.chat-modal-panel',
        { y: 28, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)', clearProps: 'transform,opacity' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [showChatComingSoonModal]);

  // GSAP: Animate edit profile modal entrance
  useEffect(() => {
    if (!showEditProfileModal || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.edit-modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' });
      gsap.fromTo('.edit-modal-panel',
        { y: 28, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)', clearProps: 'transform,opacity' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [showEditProfileModal]);

  // GSAP: Animate toast alerts
  useEffect(() => {
    if (!toastMessage || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.toast-notification-pill',
        { y: 16, scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.6)', clearProps: 'transform,opacity' }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [toastMessage]);

  const toastTimerRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  // Clear any pending toast timer on unmount
  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const openCategory = (catId) => {
    setActiveCategory(catId);
    setFilterTag('All');
    setSearchQuery('');
    setCurrentScreen('category-list');
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setActiveImageIndex(0);
    setIsBookmarked(false); // bookmark state must not leak between listings
    // Keep "back" pointing at the list this item actually belongs to
    if (item?.category) setActiveCategory(item.category);
    setCurrentScreen('detail');
  };

  const triggerBooking = async (title, service, phone, amount = 'Standard') => {
    const newBooking = {
      title,
      service,
      phone: phone || '919876543210',
      userEmail: userProfile?.email || '',
      userName: userProfile?.name || '',
      userCollege: userProfile?.college || '',
      locality: userProfile?.subLocality || '',
      amount
    };
    // Confirm instantly — the UX must never depend on the network
    setBookingDetails(newBooking);
    setCurrentScreen('confirmed');

    // Save to Firestore; recordBooking already persists locally first
    try {
      await recordBooking(newBooking);
      showToast('Saved & Synced to Firebase!');
    } catch (err) {
      console.warn('Booking sync failed, saved locally:', err);
      showToast('Booking saved on this device');
    }
  };

  const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/JZdcBHTtdGm3jSxSMyVwUh';

  const openWhatsAppCommunity = () => {
    const url = WHATSAPP_COMMUNITY_URL;
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn("Direct link click fallback to window.open", err);
      window.open(url, '_blank') || (window.location.href = url);
    }
  };

  const handleOpenChat = (source = 'Bottom Navigation') => {
    // Log user chat inquiry to Firestore (fire-and-forget; never blocks the UI)
    try {
      recordInquiry({
        userEmail: userProfile?.email || '',
        userName: userProfile?.name || '',
        source,
        note: 'User clicked chat / WhatsApp group: https://chat.whatsapp.com/JZdcBHTtdGm3jSxSMyVwUh'
      });
    } catch (err) {
      console.warn('Inquiry logging skipped:', err);
    }
    // Open the official WhatsApp Community directly
    openWhatsAppCommunity();
    // Also show modal so user can re-access or see details
    setShowChatComingSoonModal(true);
    showToast('Joining NearlyY Student WhatsApp Community... 🚀');
  };

  const handleNotifyChat = async () => {
    setIsNotifiedForChat(true);
    try {
      await recordInquiry({
        userEmail: userProfile?.email || '',
        userName: userProfile?.name || '',
        source: 'Chat Coming Soon Modal',
        wantsEarlyAccess: true
      });
    } catch (err) {
      console.warn('Inquiry sync failed:', err);
    }
    showToast('Saved! Connecting to WhatsApp Community...');
    openWhatsAppCommunity();
  };

  const handleWhatsAppChat = (shopName, serviceType, phone) => {
    if (!phone || phone === '919876543210' || String(shopName).includes('NearlyY') || String(shopName).includes('Concierge')) {
      openWhatsAppCommunity();
      return;
    }
    const targetPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hi ${shopName}! I found your listing on NearlyY (${LOCALITY}). I want to inquire about ${serviceType}.`);
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
  };

  const finishOnboarding = async () => {
    // Persist locally first so onboarding always completes, even offline
    setIsOnboarded(true);
    localStorage.setItem('nearlyy_onboarded', 'true');
    try {
      await syncUserProfile(userProfile);
      showToast('Profile created & synced to Firebase!');
    } catch (err) {
      console.warn('Profile sync failed, stored locally:', err);
      showToast('Profile saved on this device');
    }
    setCurrentScreen('home');
  };

  const resetOnboarding = async () => {
    await logoutUser();
    localStorage.removeItem('nearlyy_onboarded');
    setIsOnboarded(false);
    setOnboardingStep(1);
    setCurrentScreen('home');
    showToast('Signed out & reset onboarding');
  };

  const toggleInterest = (interestName) => {
    setUserProfile(prev => {
      const currentInterests = Array.isArray(prev?.interests) ? prev.interests : [];
      const exists = currentInterests.includes(interestName);
      const updated = exists 
        ? currentInterests.filter(i => i !== interestName)
        : [...currentInterests, interestName];
      return { ...prev, interests: updated };
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // 45-second safety timeout so user has plenty of time to select Google account in system dialog
      const authPromise = signInWithGoogle();
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ timeout: true }), 45000)
      );
      const res = await Promise.race([authPromise, timeoutPromise]);

      if (res && res.success && res.user) {
        setUserProfile(prev => ({
          ...prev,
          name: res.user.name || prev.name,
          email: res.user.email || prev.email,
          avatar: res.user.avatar || prev.avatar,
          uid: res.user.uid,
          interests: Array.isArray(prev?.interests) && prev.interests.length > 0 
            ? prev.interests 
            : ['Mess & Tiffin', 'Flats & PG', 'Gym & Fitness', 'Laundry & Dry Cleaning']
        }));
        const firstName = (res.user.name || 'Student').split(' ')[0];
        showToast(`Signed in as ${firstName} via Google! 🎉`);
        setOnboardingStep(3);
      } else if (res && res.timeout) {
        showToast('Sign-in took too long. You can tap Quick Student Entry below.');
      } else {
        if (res?.code === 'auth/popup-closed-by-user' || String(res?.message || '').includes('cancel')) {
          showToast('Sign-in cancelled. Tap to try again.');
        } else {
          showToast(res?.message || 'Unable to sign in. Try Quick Entry below.');
        }
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      showToast('Sign in error. You can use Quick Student Entry below.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getFilteredItems = () => {
    const list = Array.isArray(servicesData?.[activeCategory]) ? servicesData[activeCategory] : [];
    return list.filter((item) => {
      if (!item) return false;
      const itemName = String(item.name || '').toLowerCase();
      const itemLocality = String(item.locality || '').toLowerCase();
      const q = String(searchQuery || '').toLowerCase();
      const matchesSearch = itemName.includes(q) || itemLocality.includes(q);
      if (!matchesSearch) return false;

      if (filterTag === 'All') return true;

      const dietType = String(item.dietType || '');
      const badge = String(item.badge || '');
      const sharing = String(item.sharing || '');

      if (activeCategory === 'mess' && filterTag === 'Pure Veg') return dietType === 'Pure Veg';
      if (activeCategory === 'mess' && filterTag === 'Non-Veg') return dietType.includes('Non-Veg');
      if (activeCategory === 'laundry' && filterTag === 'Express 24h') return badge.includes('24h');
      if (activeCategory === 'gym' && filterTag === 'AC') {
        return Array.isArray(item.facilities) && item.facilities.some(f => {
          const fName = typeof f === 'string' ? f : String(f?.name || '');
          return fName.includes('Air') || fName.includes('AC');
        });
      }
      if (activeCategory === 'flats' && filterTag === 'Single') return sharing.includes('Single');
      if (activeCategory === 'flats' && filterTag === 'Double') return sharing.includes('Double');
      if (activeCategory === 'parties') {
        const genre = String(item.genre || '').toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';
        if (filterTag === 'Bollywood') return genre.includes('bollywood') || tags.includes('bollywood');
        if (filterTag === 'Techno') return genre.includes('techno') || tags.includes('techno');
        if (filterTag === 'Under ₹400') return Number(item.startingPrice || 0) <= 400;
      }
      return true;
    });
  };

  const filteredColleges = (Array.isArray(PUNE_COLLEGES) ? PUNE_COLLEGES : []).filter(c => 
    String(c?.name || '').toLowerCase().includes(String(collegeSearch || '').toLowerCase()) ||
    String(c?.full || '').toLowerCase().includes(String(collegeSearch || '').toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#F7F5FF] flex flex-col items-center justify-center p-0 sm:p-2 md:p-4 font-sans antialiased text-slate-800 selection:bg-[#EAE5FF] selection:text-[#5128E8] overflow-hidden">
      {/* App Container: exact device height on phones, centered card on desktop */}
      <div className="app-shell max-w-full sm:max-w-[520px] md:max-w-[600px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-200/80">
        
        {/* Toast Notification — floats above the bottom nav / sticky CTA */}
        {toastMessage && (
          <div className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[999] w-max max-w-[90%] bg-[#5128E8] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xl toast-notification-pill flex items-center space-x-2 border border-white/20">
            <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}
        
        {/* ============================================================ */}
        {/* ONBOARDING FLOW (7 STEPS)                                    */}
        {/* ============================================================ */}
        {!isOnboarded ? (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-4 p-5 pt-[max(env(safe-area-inset-top,0px),1.25rem)] pb-[max(env(safe-area-inset-bottom,0px),1.25rem)] overflow-y-auto no-scrollbar scroll-area bg-[#F7F5FF] onboarding-step-content">
            
            
            {/* STEP 1: WELCOME SCREEN */}
            {onboardingStep === 1 && (
              <div className="flex-1 flex flex-col justify-between py-2 space-y-5 text-center">
                <div className="flex items-center justify-center space-x-2.5 pt-2">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_4px_16px_rgba(81,40,232,0.22)] bg-transparent shrink-0">
                    <img 
                      src="/logo.png" 
                      alt="NearlyY" 
                      className="w-full h-full object-contain" 
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                      }} 
                    />
                    <span className="hidden w-full h-full bg-[#5128E8] text-white font-black text-base items-center justify-center rounded-2xl">NY</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">NearlyY</h1>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    Your campus, <br />all in <span className="text-[#5128E8]">one place.</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Live better. Stay connected in Lohegaon, Pune.
                  </p>
                </div>

                {/* Auto-Rotating Hero Carousel */}
                <div className="relative rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(81,40,232,0.15)] h-[clamp(11rem,32vh,16rem)] w-full border border-white group select-none">
                  {HERO_SLIDES.map((slide, idx) => (
                    <div 
                      key={slide.title}
                      className={`hero-slide absolute inset-0 ${idx === heroSlideIndex ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}
                    >
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="w-full h-full object-cover"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div className="space-y-1 text-left">
                          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-900 shadow-md inline-flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#5128E8]" />
                            <span>{slide.location}</span>
                          </div>
                          <h3 className="text-white text-base font-extrabold leading-tight drop-shadow-md">{slide.title}</h3>
                          <p className="text-white/80 text-[11px] font-medium drop-shadow-sm">{slide.tagline}</p>
                        </div>

                        <div className="bg-[#5128E8] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md shrink-0">
                          {slide.badge}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Left / Right Tap Controls */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeroSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center opacity-70 hover:opacity-100 active:scale-90 transition-all"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-xs flex items-center justify-center opacity-70 hover:opacity-100 active:scale-90 transition-all"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Interactive Carousel Indicator Dots */}
                <div className="flex justify-center items-center space-x-2 py-1">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === heroSlideIndex 
                          ? 'w-7 bg-[#5128E8] shadow-xs' 
                          : 'w-2 bg-[#EAE5FF] hover:bg-[#5128E8]/40 border border-[#5128E8]/20 cursor-pointer'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => setOnboardingStep(2)}
                  className="sticky-cta w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_10px_25px_rgba(81,40,232,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: AUTH SCREEN */}
            {onboardingStep === 2 && (
              <div className="flex-1 flex flex-col justify-between py-4 space-y-6">
                <div className="text-center space-y-2 pt-6">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-[0_8px_24px_rgba(81,40,232,0.26)] mx-auto overflow-hidden bg-transparent shrink-0">
                    <img 
                      src="/logo.png" 
                      alt="NearlyY" 
                      className="w-full h-full object-contain" 
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                      }} 
                    />
                    <span className="hidden w-full h-full bg-[#5128E8] text-white font-black text-xl items-center justify-center rounded-3xl">NY</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">Welcome to NearlyY!</h2>
                  <p className="text-xs text-slate-500 font-medium">Sign up to continue</p>
                </div>

                <div className="space-y-3.5 w-full">
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-4 px-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center space-x-3 shadow-xs hover:border-[#5128E8]/50 hover:bg-[#F7F5FF]/50 active:scale-98 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isGoogleLoading ? (
                      <>
                        <RotateCw className="w-5 h-5 text-[#5128E8] animate-spin" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-2 my-2">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">or</span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>

                  <button 
                    onClick={() => {
                      showToast('Welcome to NearlyY Lohegaon!');
                      setOnboardingStep(3);
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#EAE5FF] text-[#5128E8] font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#5128E8] hover:text-white transition-all active:scale-98"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Quick Student Entry (ADYPU / Pune)</span>
                  </button>
                </div>

                <div className="text-center text-[11px] text-slate-400 space-y-1">
                  <p>By continuing, you agree to our</p>
                  <p><span className="text-[#5128E8] font-semibold underline cursor-pointer">Terms of Service</span> & <span className="text-[#5128E8] font-semibold underline cursor-pointer">Privacy Policy</span>.</p>
                </div>
              </div>
            )}

            {/* STEP 3: PERSONAL PROFILE */}
            {onboardingStep === 3 && (
              <div className="flex-1 flex flex-col justify-between py-2 space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <button onClick={() => setOnboardingStep(2)} className="text-slate-600 hover:text-slate-900">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-6 h-1.5 bg-[#5128E8] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                    </div>
                    <button onClick={() => setOnboardingStep(4)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                      Skip
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Let's create your profile!</h2>
                  <p className="text-xs text-slate-500 mt-1">Tell us a bit about yourself</p>

                  <div className="py-7 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-[#EAE5FF] border-2 border-dashed border-[#5128E8]/40 flex items-center justify-center relative shadow-inner cursor-pointer hover:border-[#5128E8] transition-all overflow-hidden">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-10 h-10 text-[#5128E8]" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-[#5128E8] text-white flex items-center justify-center absolute bottom-0 right-0 shadow-md">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 mt-2.5">
                      {userProfile.avatar ? 'Google Profile Photo' : 'Add Profile Photo (Optional)'}
                    </span>
                  </div>

                  <div className="space-y-4 detail-view-container">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        placeholder="e.g. Sahil Dehadray"
                        className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#5128E8] focus:ring-2 focus:ring-[#EAE5FF] shadow-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Short Bio / Status (Optional)</label>
                      <input 
                        type="text" 
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        placeholder="e.g. SST '26 • Living in Lohegaon"
                        className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#5128E8] focus:ring-2 focus:ring-[#EAE5FF] shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setOnboardingStep(4)}
                  className="sticky-cta w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_10px_25px_rgba(81,40,232,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 4: COLLEGE OR WORKPLACE DETAILS */}
            {onboardingStep === 4 && (
              <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <button onClick={() => setOnboardingStep(3)} className="text-slate-600 hover:text-slate-900">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-6 h-1.5 bg-[#5128E8] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                    </div>
                    <button onClick={() => setOnboardingStep(5)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                      Skip
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Which college are you in?</h2>
                  <p className="text-xs text-slate-500 mt-1">Select your college or profession</p>

                  <div className="relative mt-4 mb-3">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      placeholder="Search college or workplace..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#5128E8] shadow-xs"
                    />
                  </div>

                  <div className="space-y-2 max-h-[min(340px,38vh)] overflow-y-auto no-scrollbar pr-1">
                    {filteredColleges.map((college) => {
                      const isSelected = userProfile.college === college.name;
                      return (
                        <div 
                          key={college.id}
                          onClick={() => setUserProfile({ 
                            ...userProfile, 
                            college: college.name,
                            collegeFull: college.full 
                          })}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#5128E8] bg-[#EAE5FF]/50 shadow-xs' 
                              : 'bg-white border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              isSelected ? 'bg-[#5128E8] text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {college.name.substring(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-xs font-bold text-slate-900">{college.name}</h4>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">{college.tag}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{college.full}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#5128E8] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => setOnboardingStep(5)}
                  className="sticky-cta w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_10px_25px_rgba(81,40,232,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 5: LIVING DETAILS */}
            {onboardingStep === 5 && (
              <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <button onClick={() => setOnboardingStep(4)} className="text-slate-600 hover:text-slate-900">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-6 h-1.5 bg-[#5128E8] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                    </div>
                    <button onClick={() => setOnboardingStep(6)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                      Skip
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Where do you live?</h2>
                  <p className="text-xs text-slate-500 mt-1">Select your accommodation & locality</p>

                  <div className="pt-3 space-y-2">
                    <label className="text-xs font-bold text-slate-700">Living Arrangement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LIVING_TYPES.map((type) => {
                        const isSelected = userProfile.livingType === type.id;
                        return (
                          <div 
                            key={type.id}
                            onClick={() => setUserProfile({ ...userProfile, livingType: type.id })}
                            className={`p-3 rounded-2xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[#5128E8] bg-[#EAE5FF]/60 shadow-xs' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-[#5128E8] text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <type.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{type.title}</h4>
                              <p className="text-[10px] text-slate-500">{type.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <label className="text-xs font-bold text-slate-700">Locality in Lohegaon, Pune</label>
                    <div className="space-y-1.5">
                      {LOHEGAON_LOCALITIES.map((loc) => {
                        const isSelected = userProfile.subLocality === loc;
                        return (
                          <div 
                            key={loc}
                            onClick={() => setUserProfile({ ...userProfile, subLocality: loc })}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[#5128E8] bg-[#EAE5FF]/50 shadow-xs' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#5128E8]' : 'text-slate-400'}`} />
                              <span className="text-xs font-bold text-slate-800">{loc}</span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#5128E8] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setOnboardingStep(6)}
                  className="sticky-cta w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_10px_25px_rgba(81,40,232,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 6: WHAT ARE YOU INTERESTED IN? */}
            {onboardingStep === 6 && (
              <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
                <div className="pb-16">
                  <div className="flex items-center justify-between pb-3">
                    <button onClick={() => setOnboardingStep(5)} className="text-slate-600 hover:text-slate-900" aria-label="Back">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-[#EAE5FF] rounded-full"></span>
                      <span className="w-6 h-1.5 bg-[#5128E8] rounded-full"></span>
                    </div>
                    <button onClick={() => setOnboardingStep(7)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                      Skip
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 leading-tight">What are you interested in?</h2>
                  <p className="text-xs text-slate-500 mt-1">Choose the services you need in Lohegaon</p>

                  <div className="grid grid-cols-2 gap-3 pt-5">
                    {CORE_SERVICES.map((item) => {
                      const selected = Array.isArray(userProfile?.interests) && userProfile.interests.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`p-3 sm:p-4 rounded-3xl border flex flex-col justify-between h-36 sm:h-40 cursor-pointer transition-all ${
                            selected 
                              ? 'border-[#5128E8] bg-[#EAE5FF]/50 shadow-[0_4px_16px_rgba(81,40,232,0.12)] ring-1 ring-[#5128E8]' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                              selected ? 'bg-[#5128E8] text-white shadow-md' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              selected ? 'bg-[#5128E8] text-white' : 'border border-slate-300'
                            }`}>
                              {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{item.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                            <span className="text-[9px] font-bold text-[#5128E8] mt-1 block">{item.sub}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => setOnboardingStep(7)}
                  className="sticky-cta w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_10px_25px_rgba(81,40,232,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 7: YOU'RE ALL SET! */}
            {onboardingStep === 7 && (
              <div className="flex-1 flex flex-col justify-between py-6 text-center">
                <div className="space-y-6 pt-8">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="w-24 h-24 rounded-full bg-[#EAE5FF] border-4 border-[#5128E8]/30 flex items-center justify-center shadow-xl relative animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-[#5128E8] flex items-center justify-center shadow-lg">
                        <Check className="w-9 h-9 text-white stroke-[3.5]" />
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</span>
                    <span className="absolute -bottom-1 -left-2 text-xl">✨</span>
                    <span className="absolute top-1/2 -right-5 text-lg">🎊</span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">You're all set!</h2>
                    <p className="text-sm font-bold text-[#5128E8]">
                      Welcome to NearlyY, {firstNameOf(userProfile.name)}! 🚀
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white border border-[#EAE5FF] p-4 max-w-xs mx-auto shadow-[0_4px_20px_rgba(81,40,232,0.08)] flex items-center space-x-3 text-left">
                    <div className="w-11 h-11 rounded-2xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Start exploring your campus & neighborhood community now!</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{userProfile.college} • {shortLocalityOf(userProfile.subLocality)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 detail-view-container">
                  <div className="h-10 w-full opacity-35 flex items-end justify-center space-x-1.5">
                    <div className="w-4 h-6 bg-[#5128E8] rounded-t-sm"></div>
                    <div className="w-6 h-9 bg-[#5128E8] rounded-t-sm"></div>
                    <div className="w-5 h-5 bg-[#5128E8] rounded-t-sm"></div>
                    <div className="w-7 h-10 bg-[#5128E8] rounded-t-sm"></div>
                    <div className="w-4 h-7 bg-[#5128E8] rounded-t-sm"></div>
                    <div className="w-6 h-4 bg-[#5128E8] rounded-t-sm"></div>
                  </div>

                  <button 
                    onClick={finishOnboarding}
                    className="sticky-cta w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_10px_25px_rgba(81,40,232,0.35)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Go to Home</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ============================================================ */
          /* MAIN APPLICATION DASHBOARD (When User is Logged In)          */
          /* ============================================================ */
          <>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scroll-area bg-[#F7F5FF]">
            
            {/* SCREEN 1: HOME DASHBOARD */}
            {currentScreen === 'home' && (
              <div className="screen-content safe-content-top px-4 sm:px-5 pb-5 space-y-5">
                {/* Header */}
                <div className="home-section flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_4px_12px_rgba(81,40,232,0.2)] bg-transparent shrink-0">
                      <img 
                        src="/logo.png" 
                        alt="NearlyY Logo" 
                        className="w-full h-full object-contain" 
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                        }} 
                      />
                      <span className="hidden w-full h-full bg-[#5128E8] text-white font-black text-sm items-center justify-center rounded-2xl">NY</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">NearlyY</h1>
                        <span className="text-[10px] bg-[#EAE5FF] text-[#5128E8] px-2 py-0.5 rounded-full font-bold">Lohegaon</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Welcome back, {firstNameOf(userProfile.name)}!</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center space-x-1 text-[11px] sm:text-xs text-slate-700 bg-white px-2 sm:px-2.5 py-1.5 rounded-full border border-slate-200/90 shadow-xs font-semibold whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5 text-[#5128E8] shrink-0" />
                      <span className="max-w-[76px] sm:max-w-none truncate">{shortLocalityOf(userProfile.subLocality)}</span>
                    </div>
                    <button onClick={() => showToast('All notifications read')} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs relative shrink-0" aria-label="Notifications">
                      <Bell className="w-4 h-4" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 border-2 border-white"></span>
                    </button>
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="home-section relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-65">
                    <img 
                      src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80" 
                      alt="Lohegaon Pune" 
                      className="w-full h-full object-cover mix-blend-luminosity"
                    />
                  </div>
                  <div className="relative z-10 max-w-[65%] space-y-2">
                    <h2 className="text-xl font-extrabold leading-tight tracking-tight">
                      New City. <br />New Services.
                    </h2>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Everything you need in Lohegaon, right at your fingertips.
                    </p>
                    <button 
                      onClick={() => openCategory('mess')}
                      className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all mt-2 font-bold"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Explore Services 4-Grid */}
                <div className="home-section space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Explore Services</h3>
                      <p className="text-[10px] text-slate-400">Click any service to view multiple options</p>
                    </div>
                    <button onClick={() => openCategory('mess')} className="text-xs font-semibold text-[#5128E8] flex items-center space-x-0.5">
                      <span>See all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                    <button onClick={() => openCategory('mess')} className="flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-[#5128E8]/40 transition-all active:scale-95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 text-center mt-1.5 leading-tight">Mess</span>
                    </button>

                    <button onClick={() => openCategory('laundry')} className="flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-[#5128E8]/40 transition-all active:scale-95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center">
                        <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 text-center mt-1.5 leading-tight">Laundry</span>
                    </button>

                    <button onClick={() => openCategory('gym')} className="flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-[#5128E8]/40 transition-all active:scale-95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 text-center mt-1.5 leading-tight">Gym</span>
                    </button>

                    <button onClick={() => openCategory('flats')} className="flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-[#5128E8]/40 transition-all active:scale-95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 text-center mt-1.5 leading-tight">Flats/PG</span>
                    </button>

                    <button onClick={() => openCategory('parties')} className="flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-purple-50 to-pink-50 border border-pink-200 shadow-xs hover:border-pink-500/40 transition-all active:scale-95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FF007A] to-[#7928CA] text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black text-pink-700 text-center mt-1.5 leading-tight">Parties</span>
                    </button>
                  </div>
                </div>

                {/* Featured Campus Parties Banner */}
                {servicesData.parties && servicesData.parties.length > 0 && (
                  <div className="home-section space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">Parties & Gigs Near Campus</h3>
                      </div>
                      <button onClick={() => openCategory('parties')} className="text-xs font-bold text-pink-600 flex items-center space-x-0.5 hover:underline">
                        <span>See all ({servicesData.parties.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
                      {servicesData.parties.map((party) => (
                        <div 
                          key={party.id}
                          onClick={() => openDetail(party)}
                          className="w-64 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-xs overflow-hidden cursor-pointer hover:border-pink-300 transition-all group"
                        >
                          <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                            <img src={party.coverImage} alt={party.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                            <span className="absolute top-2 left-2 bg-[#FF007A] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                              {party.dateTime?.split('•')[0] || 'Weekend'}
                            </span>
                            <span className="absolute bottom-2 left-2 text-white text-[10px] font-extrabold flex items-center drop-shadow-sm">
                              <MapPin className="w-3 h-3 text-pink-400 mr-1 shrink-0" />
                              <span className="truncate max-w-[150px]">{party.venue || party.locality}</span>
                            </span>
                          </div>
                          <div className="p-2.5 flex items-center justify-between">
                            <div className="truncate mr-2">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{party.name}</h4>
                              <p className="text-[10px] text-slate-500 truncate">{party.genre || 'Live DJ & Music'}</p>
                            </div>
                            <span className="text-xs font-black text-[#5128E8] shrink-0 bg-[#EAE5FF] px-2 py-1 rounded-xl">
                              {party.priceDisplay || `₹${party.startingPrice}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Box with direct Chat Trigger */}
                <div onClick={() => handleOpenChat('Home Promo Box')} className="home-section rounded-2xl bg-[#EAE5FF]/70 border border-[#5128E8]/20 p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#EAE5FF] transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5128E8] text-white flex items-center justify-center shadow-xs">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Need help finding something?</h4>
                      <p className="text-[11px] text-slate-600">Chat with our Lohegaon student desk</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#5128E8] bg-white px-2.5 py-1 rounded-full shadow-xs">Chat →</span>
                </div>

                {/* Popular Right Now */}
                <div className="home-section space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Popular in Lohegaon</h3>
                    <span className="text-[10px] text-slate-400">Updated from cloud</span>
                  </div>

                  {servicesData.mess && servicesData.mess[0] && (() => {
                    const firstMess = servicesData.mess[0];
                    const messImages = getItemImages(firstMess);
                    return (
                      <div 
                        onClick={() => openDetail(firstMess)}
                        className="rounded-2xl bg-white border border-slate-100 shadow-xs overflow-hidden cursor-pointer hover:border-[#5128E8]/40 transition-all p-3 flex space-x-3"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img src={messImages[0] || firstMess.coverImage} alt="Mess" className="w-full h-full object-cover" />
                          {messImages.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-slate-950/75 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center">
                              <ImageIcon className="w-2.5 h-2.5 mr-0.5 text-[#EAE5FF]" />
                              {messImages.length}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Open Now</span>
                              <span className="text-xs font-extrabold text-slate-900">₹2,000/mo</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 mt-1">{firstMess.name}</h4>
                            <p className="text-[11px] text-slate-500">{firstMess.distance}</p>
                            {firstMess.description && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{firstMess.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-amber-500 font-bold flex items-center">
                              <Star className="w-3 h-3 fill-amber-500 mr-1" />
                              {firstMess.rating} ({firstMess.reviewsCount})
                            </span>
                            <span className="text-[#5128E8] font-bold text-xs">View Menu →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* SCREEN 2: CATEGORY LIST (MULTIPLE OPTIONS VIEW) */}
            {currentScreen === 'category-list' && (
              <div className="screen-content safe-content-top px-4 sm:px-5 pb-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => setCurrentScreen('home')} className="w-9 h-9 rounded-full bg-white border flex items-center justify-center shrink-0" aria-label="Back">
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <h2 className="text-base font-extrabold text-slate-900 capitalize truncate text-center">
                    {activeCategory === 'mess' ? 'Mess & Tiffin' : activeCategory === 'laundry' ? 'Laundry Services' : activeCategory === 'gym' ? 'Gyms & Fitness' : activeCategory === 'parties' ? 'Parties & Campus Events' : 'Flats & PGs'}
                  </h2>
                  <div className="w-9 shrink-0"></div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeCategory} in Lohegaon...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#5128E8]"
                  />
                </div>

                {/* Category Switcher Tabs */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'mess', label: '🍲 Mess' },
                    { id: 'laundry', label: '👕 Laundry' },
                    { id: 'gym', label: '🏋️ Gym' },
                    { id: 'flats', label: '🏡 Flats/PG' },
                    { id: 'parties', label: '🎉 Parties' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => openCategory(cat.id)}
                      className={`service-tab px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                        activeCategory === cat.id ? 'bg-[#5128E8] text-white shadow-xs' : 'bg-white border text-slate-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Multiple Options List */}
                <div className="space-y-3">
                  {getFilteredItems().length === 0 && (
                    <div className="py-12 px-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-1">
                      <Search className="w-7 h-7 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">No results found</p>
                      <p className="text-[11px] text-slate-400">Try a different search or switch category.</p>
                    </div>
                  )}
                  {getFilteredItems().map((item) => {
                    const itemImages = getItemImages(item);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => openDetail(item)}
                        className="service-card p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-[#5128E8]/40 transition-all cursor-pointer flex space-x-3"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img src={itemImages[0] || item.coverImage} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          {itemImages.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-slate-950/75 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center">
                              <ImageIcon className="w-2.5 h-2.5 mr-0.5 text-[#EAE5FF]" />
                              {itemImages.length}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.name}</h4>
                              <span className="text-xs font-extrabold text-[#5128E8] whitespace-nowrap shrink-0">
                                {item.priceDisplay || (activeCategory === 'flats' ? `₹${item.price}/mo` : activeCategory === 'mess' ? '₹90/thali' : activeCategory === 'laundry' ? '₹80/kg' : activeCategory === 'parties' ? 'From ₹399' : '₹999/mo')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.venue || item.locality}</p>
                            {item.dateTime && (
                              <p className="text-[10px] text-pink-600 font-bold mt-0.5 flex items-center">
                                <Calendar className="w-2.5 h-2.5 mr-1" />
                                {item.dateTime}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-amber-500 font-bold flex items-center">
                              <Star className="w-3 h-3 fill-amber-500 mr-1" />
                              {item.rating} ({item.reviewsCount})
                            </span>
                            <span className="text-xs font-bold text-[#5128E8]">View Details →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 3: DETAIL VIEW */}
            {currentScreen === 'detail' && selectedItem && (() => {
              const itemImages = getItemImages(selectedItem);
              const activeImg = itemImages[activeImageIndex] || selectedItem.coverImage;

              return (
                <div className="screen-content space-y-4 detail-view-container">
                  {/* Hero Photo Carousel & Controls */}
                  <div className="relative h-[clamp(12rem,34vh,17rem)] w-full bg-slate-950 overflow-hidden">
                    <img 
                      src={activeImg} 
                      alt={selectedItem.name} 
                      className="detail-hero-img w-full h-full object-cover transition-all duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                    
                    <button 
                      onClick={() => setCurrentScreen('category-list')} 
                      className="absolute w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white transition"
                      style={{ top: 'max(env(safe-area-inset-top, 0px) + 0.75rem, 1rem)', left: '1rem' }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div 
                      className="absolute flex items-center space-x-2"
                      style={{ top: 'max(env(safe-area-inset-top, 0px) + 0.75rem, 1rem)', right: '1rem' }}
                    >
                      {/* Photo counter badge */}
                      {itemImages.length > 1 && (
                        <span className="bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {activeImageIndex + 1} / {itemImages.length}
                        </span>
                      )}
                      <button 
                        onClick={() => setIsBookmarked(!isBookmarked)} 
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-md hover:bg-white transition"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#5128E8] text-[#5128E8]' : ''}`} />
                      </button>
                    </div>

                    {/* Next/Prev Navigation overlay arrows if multiple photos */}
                    {itemImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(prev => (prev === 0 ? itemImages.length - 1 : prev - 1));
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-950/90 transition shadow-md"
                          title="Previous Photo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(prev => (prev === itemImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-950/90 transition shadow-md"
                          title="Next Photo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs">Verified</span>
                        <span className="text-xs text-amber-300 font-bold flex items-center">
                          <Star className="w-3 h-3 fill-amber-300 mr-1" />{selectedItem.rating}
                        </span>
                      </div>
                      <h2 className="text-xl font-black mt-1 leading-tight">{selectedItem.name}</h2>
                      <p className="text-xs text-slate-200 mt-0.5">{selectedItem.locality} • {selectedItem.distance}</p>
                    </div>
                  </div>

                  {/* Multiple Images Thumbnail Strip */}
                  {itemImages.length > 1 && (
                    <div className="px-5">
                      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                        {itemImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                              activeImageIndex === idx 
                                ? 'border-[#5128E8] scale-105 shadow-md' 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About / Description Section */}
                  {selectedItem.description && (
                    <div className="px-5">
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1.5">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
                          <Info className="w-3.5 h-3.5 text-[#5128E8] mr-1.5" />
                          About & Highlights
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {selectedItem.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Detail Content by Category */}
                  {selectedItem.category === 'mess' && (
                    <div className="px-5 space-y-4 pb-6">
                      <button 
                        onClick={() => triggerBooking(`Trial Meal at ${selectedItem.name}`, 'Mess & Tiffin', selectedItem.phone, '₹90')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_8px_20px_rgba(81,40,232,0.3)] hover:opacity-95 active:scale-98 transition-all"
                      >
                        Book a Trial Meal →
                      </button>

                      {/* Real-time Today's Menu from NearlyYsync */}
                      {selectedItem.todayMenu && (
                        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-xs">
                              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                              <span>Today's Special Menu</span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Live Synced</span>
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            {selectedItem.todayMenu.lunch && (
                              <div className="bg-white/95 p-2.5 rounded-xl border border-amber-100 shadow-xs flex items-start space-x-2.5">
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 mt-0.5">Lunch</span>
                                <span className="font-semibold text-slate-800 leading-tight">
                                  {typeof selectedItem.todayMenu.lunch === 'object' ? selectedItem.todayMenu.lunch.name : selectedItem.todayMenu.lunch}
                                </span>
                              </div>
                            )}
                            {selectedItem.todayMenu.dinner && (
                              <div className="bg-white/95 p-2.5 rounded-xl border border-amber-100 shadow-xs flex items-start space-x-2.5">
                                <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 mt-0.5">Dinner</span>
                                <span className="font-semibold text-slate-800 leading-tight">
                                  {typeof selectedItem.todayMenu.dinner === 'object' ? selectedItem.todayMenu.dinner.name : selectedItem.todayMenu.dinner}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <h3 className="text-sm font-bold text-slate-900">Pricing Matrix</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItem.pricing?.map((tier, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white border text-center shadow-xs">
                            <span className="text-[10px] text-slate-500 block">{tier.type}</span>
                            <p className="text-base font-extrabold text-slate-900">₹{tier.price}</p>
                            <span className="text-[9px] text-slate-400">{tier.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.category === 'laundry' && (
                    <div className="px-5 space-y-4 pb-6">
                      <button 
                        onClick={() => triggerBooking(`Doorstep Pickup by ${selectedItem.name}`, 'Laundry & Dry Cleaning', selectedItem.phone, '₹80/kg')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_8px_20px_rgba(81,40,232,0.3)] hover:opacity-95 active:scale-98 transition-all"
                      >
                        Book Laundry Pickup →
                      </button>
                      <h3 className="text-sm font-bold text-slate-900">Rates</h3>
                      <div className="p-3.5 rounded-2xl bg-white border space-y-2 text-xs">
                        {selectedItem.perKgRates?.map((p, i) => (
                          <div key={i} className="flex justify-between font-bold"><span>{p.name}</span><span>₹{p.price} / kg</span></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.category === 'gym' && (
                    <div className="px-5 space-y-4 pb-6">
                      <button 
                        onClick={() => triggerBooking(`1-Day Pass at ${selectedItem.name}`, 'Gym & Fitness', selectedItem.phone, 'Free Trial')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_8px_20px_rgba(81,40,232,0.3)] hover:opacity-95 active:scale-98 transition-all"
                      >
                        Claim Free 1-Day Trial Pass →
                      </button>
                      <h3 className="text-sm font-bold text-slate-900">Membership Plans</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItem.plans?.map((plan, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white border text-center shadow-xs">
                            <span className="text-[10px] text-slate-500 block">{plan.title}</span>
                            <p className="text-base font-extrabold text-slate-900">₹{plan.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.category === 'flats' && (
                    <div className="px-5 space-y-4 pb-6">
                      <button 
                        onClick={() => {
                          triggerBooking(`Flat Inquiry: ${selectedItem.name}`, 'Flats & PG', selectedItem.phone, `₹${selectedItem.price}`);
                          handleWhatsAppChat(selectedItem.name, 'Flat Booking Inquiry', selectedItem.phone);
                        }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5128E8] to-[#6C47FF] text-white font-bold text-sm shadow-[0_8px_20px_rgba(81,40,232,0.3)] hover:opacity-95 active:scale-98 transition-all"
                      >
                        Contact Owner Directly →
                      </button>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 rounded-2xl bg-white border"><span className="text-[10px] text-slate-400 block">Rent</span><p className="text-sm font-bold">₹{selectedItem.price}</p></div>
                        <div className="p-3 rounded-2xl bg-white border"><span className="text-[10px] text-slate-400 block">Deposit</span><p className="text-sm font-bold">₹{selectedItem.deposit}</p></div>
                        <div className="p-3 rounded-2xl bg-white border"><span className="text-[10px] text-slate-400 block">Type</span><p className="text-xs font-bold">{selectedItem.sharing}</p></div>
                      </div>
                    </div>
                  )}

                  {selectedItem.category === 'parties' && (
                    <div className="px-5 space-y-4 pb-8">
                      {/* Shaadi Fits & Move-on Tagline Banner */}
                      <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
                        <div className="relative z-10 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30">
                              ✨ (SHAADI FITS ONLY)
                            </span>
                            <span className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded-full">
                              Sunday Sundowner
                            </span>
                          </div>
                          <h3 className="text-base font-black tracking-tight pt-1">
                            CLOSURE LOOKS BETTER ON THE DANCE FLOOR!
                          </h3>
                          <p className="text-[11px] text-white/90 font-medium">
                            The अल्टीमेट Move-On Night • High-Energy Desi & Bollywood
                          </p>
                        </div>
                        <div className="absolute -right-4 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                      </div>

                      {/* Primary WhatsApp Booking CTA */}
                      <button 
                        onClick={() => {
                          const waPhone = selectedItem.phone || '917058547559';
                          const msg = `Hi UV Events! I saw 'Ex Ki Shaadi' on NearlyY. I want to enquire about entry passes and VIP table reservations for Sunday 22nd Nov.`;
                          recordInquiry({
                            service: 'Parties & Events',
                            title: selectedItem.name,
                            phone: waPhone,
                            timestamp: new Date().toISOString()
                          });
                          window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm shadow-[0_8px_24px_rgba(37,211,102,0.35)] active:scale-98 transition-all flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="w-5 h-5 fill-white/20" />
                        <span>Book Passes & Tables on WhatsApp →</span>
                      </button>

                      {/* Direct Infoline & Instagram Contact Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <a 
                          href={`tel:${selectedItem.infoline || '7058547559'}`}
                          className="p-3 rounded-2xl bg-slate-900 text-white flex items-center space-x-2.5 hover:bg-slate-800 transition active:scale-98 shadow-xs"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <PhoneCall className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <span className="text-[10px] text-slate-400 block font-medium">Infoline Desk</span>
                            <span className="text-xs font-black tracking-tight truncate block">
                              {selectedItem.infoline || '7058547559'}
                            </span>
                          </div>
                        </a>

                        <a 
                          href={selectedItem.instagram || 'https://www.instagram.com/uv_events.co/'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center space-x-2.5 hover:opacity-95 transition active:scale-98 shadow-xs"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Instagram className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <span className="text-[10px] text-white/80 block font-medium">Official Insta</span>
                            <span className="text-xs font-black tracking-tight truncate block">
                              {selectedItem.instagramHandle || '@uv_events.co'}
                            </span>
                          </div>
                        </a>
                      </div>

                      {/* Event Key Specs (Artists, Venue, Timing) */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                            <Calendar className="w-3.5 h-3.5 text-pink-600 mr-1.5" />
                            Date & Timing
                          </span>
                          <span className="text-xs font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                            {selectedItem.dateTime || 'Sunday, 22nd Nov • 05:00 PM'}
                          </span>
                        </div>

                        <div className="flex items-start space-x-2 text-xs text-slate-700">
                          <MapPin className="w-4 h-4 text-[#5128E8] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block">The Mills - Raja Bahadur City Centre</span>
                            <span className="text-slate-500 text-[11px] leading-tight">
                              {selectedItem.venue || 'B Wing, 2nd Floor, The Mills, Pune'}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                          <div className="flex items-center space-x-1.5 text-purple-900 font-black text-[11px]">
                            <Music className="w-3.5 h-3.5 text-purple-600" />
                            <span>Headliner DJs & Curation</span>
                          </div>
                          <p className="text-[11px] text-purple-950 font-bold">
                            Feat. DJ Naaïro & DJ Nyx
                          </p>
                          <p className="text-[10px] text-purple-700">
                            Curated by House of Desi, kiki (India's #1 Sundowner), ACE Entertainment & UV Events.
                          </p>
                        </div>
                      </div>

                      {/* Pass Options & Pricing Tiers */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
                            <Ticket className="w-3.5 h-3.5 text-[#5128E8] mr-1.5" />
                            Passes & Table Reservation
                          </h3>
                          <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full">
                            Zero Platform Fee
                          </span>
                        </div>

                        {(selectedItem.pricing || [
                          { type: 'Early Bird Stag Pass', price: 499, note: 'Includes cover beverage', save: 'Fast Filling' },
                          { type: 'Couple Entry Pass', price: 899, note: 'Full cover charge included', save: 'Save ₹100' },
                          { type: 'VIP Table / Bottle Service', price: 3999, note: 'Dedicated table + starters & bottle', save: 'Exclusive' }
                        ]).map((tier, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-pink-300 transition-all">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-slate-900">{tier.type}</span>
                                {tier.save && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                                    {tier.save}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">{tier.note}</span>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-sm font-black text-[#5128E8]">₹{tier.price}</p>
                              <button 
                                onClick={() => {
                                  const waPhone = selectedItem.phone || '917058547559';
                                  const msg = `Hi UV Events! I want to enquire/book "${tier.type}" (₹${tier.price}) for Ex Ki Shaadi on Sunday 22nd Nov.`;
                                  recordInquiry({
                                    service: 'Parties & Events',
                                    title: `${selectedItem.name} - ${tier.type}`,
                                    phone: waPhone,
                                    timestamp: new Date().toISOString()
                                  });
                                  window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="text-[11px] font-black text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg transition mt-0.5 flex items-center space-x-1"
                              >
                                <span>Reserve</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dress Code & Compliance Guidelines */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-900 font-extrabold text-[11px] uppercase tracking-wider">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Entry & Venue Guidelines</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-600 text-[11px]">
                          <li className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-pink-600 shrink-0 mt-0.5" />
                            <span><strong className="text-slate-800">Dress Code:</strong> (SHAADI FITS ONLY) — Kurta, Sherwani, Lehenga, or Wedding Party glam.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong className="text-slate-800">Age & ID Policy:</strong> DigiLocker Government ID mandatory for 21+ entry verification.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span><strong className="text-slate-800">Timings:</strong> Sunday Sundowner gates open at 05:00 PM onwards.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span><strong className="text-slate-800">Direct Connect:</strong> WhatsApp / Call 7058547559 • Instagram @uv_events.co</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* SCREEN 4: BOOKING CONFIRMED */}
            {currentScreen === 'confirmed' && (
              <div className="screen-content safe-content-top p-4 sm:p-6 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 md:min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-[#EAE5FF] border-4 border-[#5128E8]/30 flex items-center justify-center shadow-lg relative animate-bounce">
                  <Check className="w-10 h-10 text-[#5128E8] stroke-[3]" />
                  <span className="absolute -top-1 -right-1 text-xl">🎉</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Booking Confirmed!</h2>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your request for <span className="font-semibold text-slate-800">{bookingDetails.title}</span> has been stored in Firebase & registered in Lohegaon.
                  </p>
                </div>
                <button 
                  onClick={() => handleWhatsAppChat(bookingDetails.title, bookingDetails.service, bookingDetails.phone)}
                  className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Chat Directly on WhatsApp</h4>
                      <p className="text-[10px] text-emerald-700">Instant confirmation & timing</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-700" />
                </button>
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className="w-full py-4 rounded-2xl bg-[#5128E8] text-white font-bold text-sm shadow-md"
                >
                  Back to Home
                </button>
              </div>
            )}

            {/* SCREEN 5: PROFILE (Exact match to Mockup Screen 8 + Real Bookings) */}
            {currentScreen === 'profile' && (
              <div className="screen-content safe-content-top px-4 sm:px-5 pb-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-slate-900">My Profile</h2>
                  <button onClick={() => setShowEditProfileModal(true)} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="flex flex-col items-center p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(81,40,232,0.06)] text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-[#EAE5FF] text-[#5128E8] font-black text-2xl flex items-center justify-center relative shadow-inner overflow-hidden">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      String(userProfile.name || 'S').charAt(0)
                    )}
                    <span className="w-6 h-6 rounded-full bg-[#5128E8] text-white flex items-center justify-center absolute bottom-0 right-0 text-xs shadow-md">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{userProfile.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{userProfile.bio || 'SST \'26'}</p>
                  </div>

                  {/* College & Living Detail Cards */}
                  <div className="w-full pt-3 space-y-2 text-xs text-slate-700 border-t border-slate-100 mt-2">
                    <div 
                      onClick={() => setShowEditProfileModal(true)}
                      className="flex items-center justify-between p-3 bg-[#F7F5FF] rounded-2xl border border-[#5128E8]/10 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <GraduationCap className="w-4 h-4 text-[#5128E8]" />
                        <div className="text-left">
                          <span className="font-bold text-slate-900 block">{userProfile.college}</span>
                          <span className="text-[10px] text-slate-400">{userProfile.collegeFull}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div 
                      onClick={() => setShowEditProfileModal(true)}
                      className="flex items-center justify-between p-3 bg-[#F7F5FF] rounded-2xl border border-[#5128E8]/10 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="w-4 h-4 text-[#5128E8]" />
                        <div className="text-left">
                          <span className="font-bold text-slate-900 block">{userProfile.livingType}</span>
                          <span className="text-[10px] text-slate-400">{userProfile.subLocality}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Real-Time Synced Bookings from Firebase */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">My Bookings ({userBookings.length})</h4>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Firebase Stored</span>
                  </div>

                  {userBookings.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 text-center space-y-1 shadow-xs">
                      <p className="text-xs font-semibold text-slate-600">No active bookings yet</p>
                      <p className="text-[10px] text-slate-400">Book a trial meal, laundry pickup, or gym pass to see it synced here!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                      {userBookings.slice(0, 5).map((b, idx) => (
                        <div key={b.id || idx} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">{b.title}</h5>
                              <p className="text-[10px] text-slate-400">{b.service} • {new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full capitalize">
                            {b.status || 'Confirmed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* My Interests Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">My Interests</h4>
                    <button onClick={() => setShowEditProfileModal(true)} className="text-[11px] font-bold text-[#5128E8]">Edit</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(userProfile?.interests) ? userProfile.interests : []).map((int) => (
                      <span key={int} className="bg-[#EAE5FF] text-[#5128E8] border border-[#5128E8]/20 text-xs font-bold px-3 py-1 rounded-full">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Settings Menu */}
                <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 shadow-xs text-xs font-medium overflow-hidden">
                  <button 
                    onClick={() => setShowEditProfileModal(true)} 
                    className="w-full p-4 flex justify-between items-center text-slate-700 hover:bg-slate-50"
                  >
                    <span>✏️ Edit Profile Information</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => handleOpenChat('Profile Settings Support')} 
                    className="w-full p-4 flex justify-between items-center text-slate-700 hover:bg-slate-50"
                  >
                    <span>💬 In-App Support & Chat</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button 
                    onClick={resetOnboarding} 
                    className="w-full p-4 flex justify-between items-center text-red-600 font-bold hover:bg-red-50"
                  >
                    <span>🚪 Sign Out</span>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* CHAT / WHATSAPP COMMUNITY MODAL                              */}
            {/* ============================================================ */}
            {showChatComingSoonModal && (
              <div className="chat-modal-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="chat-modal-panel bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-[#EAE5FF] text-center relative max-h-[90dvh] overflow-y-auto no-scrollbar">
                  <button 
                    onClick={() => setShowChatComingSoonModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 absolute top-4 right-4"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Icon Graphic */}
                  <div className="w-20 h-20 rounded-full bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center mx-auto shadow-md relative">
                    <MessageCircle className="w-10 h-10" />
                    <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white absolute top-1 right-1 animate-ping"></span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Official Community Active 🟢
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">NearlyY Student Community</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Connect directly with fellow students, flat owners, and verified mess/laundry vendors in Lohegaon on our official WhatsApp community.
                    </p>
                  </div>

                  {/* Features preview */}
                  <div className="bg-[#F7F5FF] rounded-2xl p-3.5 space-y-2 text-left border border-[#5128E8]/10 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <span className="text-sm">🍲</span>
                      <span className="font-medium text-[11px]">Daily live mess menus & meal deals</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <span className="text-sm">🧺</span>
                      <span className="font-medium text-[11px]">Instant laundry pickup scheduling & status</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <span className="text-sm">🏡</span>
                      <span className="font-medium text-[11px]">Direct flat owner chat with zero brokerage</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {/* Primary WhatsApp Community Button */}
                    <button 
                      onClick={() => {
                        openWhatsAppCommunity();
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 hover:opacity-95 cursor-pointer active:scale-98 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Join WhatsApp Community Now</span>
                    </button>

                    {/* Notify me button */}
                    <button 
                      onClick={handleNotifyChat}
                      disabled={isNotifiedForChat}
                      className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                        isNotifiedForChat 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-[#EAE5FF] text-[#5128E8] hover:bg-[#5128E8] hover:text-white'
                      }`}
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{isNotifiedForChat ? '✓ Notified for in-app messaging' : 'Notify Me When In-App Chat Launches'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT PROFILE MODAL */}
            {showEditProfileModal && (
              <div className="edit-modal-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="edit-modal-panel bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 max-h-[90dvh] overflow-y-auto no-scrollbar shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900">Edit Profile</h3>
                    <button onClick={() => setShowEditProfileModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="w-full p-3 rounded-xl border text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Bio</label>
                      <input 
                        type="text" 
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        className="w-full p-3 rounded-xl border text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">College / Profession</label>
                      <select 
                        value={userProfile.college}
                        onChange={(e) => {
                          const item = PUNE_COLLEGES.find(c => c.name === e.target.value);
                          setUserProfile({ ...userProfile, college: e.target.value, collegeFull: item ? item.full : e.target.value });
                        }}
                        className="w-full p-3 rounded-xl border text-xs font-medium bg-white"
                      >
                        {PUNE_COLLEGES.map(c => <option key={c.id} value={c.name}>{c.name} - {c.full}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Living Type</label>
                      <select 
                        value={userProfile.livingType}
                        onChange={(e) => setUserProfile({ ...userProfile, livingType: e.target.value })}
                        className="w-full p-3 rounded-xl border text-xs font-medium bg-white"
                      >
                        {LIVING_TYPES.map(l => <option key={l.id} value={l.id}>{l.title} - {l.desc}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Lohegaon Locality</label>
                      <select 
                        value={userProfile.subLocality}
                        onChange={(e) => setUserProfile({ ...userProfile, subLocality: e.target.value })}
                        className="w-full p-3 rounded-xl border text-xs font-medium bg-white"
                      >
                        {LOHEGAON_LOCALITIES.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      setShowEditProfileModal(false);
                      try {
                        await syncUserProfile(userProfile);
                        showToast('Profile updated & synced to Firebase!');
                      } catch (err) {
                        console.warn('Profile update sync failed:', err);
                        showToast('Profile updated on this device');
                      }
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#5128E8] text-white font-bold text-xs shadow-md"
                  >
                    Save & Sync to Firebase
                  </button>
                </div>
              </div>
            )}

            </div>

            {/* BOTTOM NAVIGATION BAR — flex child, always visible above safe area */}
            <nav className="shrink-0 relative h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-40">
              <button 
                onClick={() => { setCurrentScreen('home'); setActiveTab('home'); }} 
                className={`flex flex-col items-center text-[10px] font-bold h-full justify-center px-2 transition-colors ${currentScreen === 'home' ? 'text-[#5128E8]' : 'text-slate-400'}`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button 
                onClick={() => openCategory('mess')} 
                className={`flex flex-col items-center text-[10px] font-bold h-full justify-center px-2 transition-colors ${currentScreen === 'category-list' ? 'text-[#5128E8]' : 'text-slate-400'}`}
              >
                <Compass className="w-5 h-5" />
                <span>Explore</span>
              </button>
              
              {/* CHAT TAB (TRIGGERS CHAT COMING SOON MODAL) */}
              <button 
                onClick={() => handleOpenChat('Bottom Navigation Tab')} 
                className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-[#5128E8] transition-colors relative h-full px-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat</span>
                <span className="w-2 h-2 rounded-full bg-[#5128E8] absolute top-[calc(50%-16px)] right-1 border border-white"></span>
              </button>

              <button 
                onClick={() => { setCurrentScreen('profile'); setActiveTab('profile'); }} 
                className={`flex flex-col items-center text-[10px] font-bold h-full justify-center px-2 transition-colors ${currentScreen === 'profile' ? 'text-[#5128E8]' : 'text-slate-400'}`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </nav>
          </>
        )}

      </div>
    </div>
  );
}
