import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { 
  UtensilsCrossed, Shirt, Dumbbell, Home, ArrowRight, Bell, Search, Star, 
  Bookmark, Phone, MessageCircle, Check, CheckCircle2, MapPin, Calendar, 
  ChevronRight, Sparkles, Clock, Flame, Droplets, Wifi, Zap, RotateCw, 
  Snowflake, Users, Activity, ShowerHead, Heart, Settings, HelpCircle, 
  Info, LogOut, Crown, ShoppingBag, Filter, ArrowLeft, Shield, Compass, User,
  Mail, Camera, GraduationCap, Briefcase, Building, X, CheckSquare, Square,
  MessageSquare, Radio, Send, BellRing, ChevronLeft, Image as ImageIcon,
  Instagram, PhoneCall, Music, Ticket, ExternalLink, Plus, Minus, Menu, MoreHorizontal,
  Download, RefreshCw, AlertCircle, Maximize2
} from 'lucide-react';
import { 
  LOCALITY, SERVICES_MENU, CATEGORY_DATA, USER_PROFILE, AVATAR_PRESETS 
} from './data/mockData';
import { 
  subscribeToServices, seedFirestore, syncUserProfile, 
  recordBooking, recordInquiry, subscribeToBookings,
  signInWithGoogle, logoutUser, listenToAuthState,
  subscribeToAppConfig, fetchAppConfig
} from './firebase';
import { 
  isVersionNewer, downloadAndApplyBundle, reloadApp, notifyAppReady 
} from './updater';

export const APP_VERSION = '1.0.2';

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

const getItemImages = (item) => {
  if (!item) return [];
  const list = [];
  
  // 1. Photos array (primary for multiple photos in mockData/Firestore)
  if (Array.isArray(item.photos)) {
    item.photos.forEach(p => {
      if (p && typeof p === 'string' && !list.includes(p)) list.push(p);
    });
  }

  // 2. Images array (user uploads)
  if (Array.isArray(item.images)) {
    item.images.forEach(p => {
      if (p && typeof p === 'string' && !list.includes(p)) list.push(p);
    });
  }

  // 3. Gallery array
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach(p => {
      if (p && typeof p === 'string' && !list.includes(p)) list.push(p);
    });
  }

  // 4. Cover image
  if (item.coverImage && typeof item.coverImage === 'string' && !list.includes(item.coverImage)) {
    list.unshift(item.coverImage);
  }
  if (item.image && typeof item.image === 'string' && !list.includes(item.image)) {
    list.push(item.image);
  }

  if (list.length > 0) return list;
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
  { id: 'Mess & Tiffin', catKey: 'mess', name: 'Mess & Tiffin', icon: UtensilsCrossed, desc: 'Daily thalis & meals', sub: 'From ₹90/meal' },
  { id: 'Laundry & Dry Cleaning', catKey: 'laundry', name: 'Laundry & Dry Cleaning', icon: Shirt, desc: 'Per-kg wash & iron', sub: 'Doorstep pickup' },
  { id: 'Gym & Fitness', catKey: 'gym', name: 'Gym & Fitness', icon: Dumbbell, desc: 'Daily passes & monthly gym', sub: 'Student discounts' },
  { id: 'Flats & PG', catKey: 'flats', name: 'Flats & PG', icon: Home, desc: 'Zero brokerage rooms & beds', sub: 'Verified owners' },
  { id: 'Parties & Events', catKey: 'parties', name: 'Parties & Events', icon: Sparkles, desc: 'Weekend bashes, DJ nights & gigs', sub: 'Passes from ₹299' }
];

const getCategoryKey = (idOrName) => {
  const str = String(idOrName || '').toLowerCase();
  if (str.includes('mess')) return 'mess';
  if (str.includes('laundry')) return 'laundry';
  if (str.includes('gym')) return 'gym';
  if (str.includes('flat') || str.includes('pg')) return 'flats';
  if (str.includes('part') || str.includes('event')) return 'parties';
  return 'mess';
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const firstNameOf = (name) => String(name || 'Student').trim().split(/\s+/)[0] || 'Student';
const shortLocalityOf = (loc) => String(loc || 'Lohegaon').split(',')[0];

// ============================================================
// Reusable UI Components
// ============================================================

const IconButton = ({ children, onClick, variant = 'default', size = 'md', className = '', 'aria-label': ariaLabel, disabled }) => {
  const variants = {
    default: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100',
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-brand',
    ghost: 'text-slate-500 hover:bg-slate-100 active:bg-slate-200',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:bg-red-200 text-red-700',
  };
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-xl transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={ariaLabel}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', padded = true, hover = false, border = true }) => (
  <div className={`
    bg-white rounded-2xl ${border ? 'border border-slate-200' : ''} 
    ${padded ? 'p-4' : ''} 
    ${hover ? 'transition-all hover:shadow-md hover:border-brand-200 active:scale-[0.99]' : ''}
    ${className}
  `}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-brand-100 text-brand-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    outline: 'bg-transparent border border-slate-200 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Input = ({ label, error, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>}
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl bg-white border transition-colors
        placeholder:text-slate-400
        focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
        ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'}
        ${props.disabled ? 'bg-slate-50 text-slate-400' : ''}
      `}
    />
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-[calc(5.25rem+var(--app-safe-bottom))] left-1/2 -translate-x-1/2 z-[999] w-max max-w-[90%] toast-notification-pill">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-white/10">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors -mr-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, className = '', showClose = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[90dvh] overflow-hidden modal-panel" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {showClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors -mr-1 -mt-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className={`p-4 max-h-[60dvh] overflow-y-auto no-scrollbar ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const BottomSheet = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-t-2xl shadow-xl w-full max-h-[85dvh] modal-panel" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors -mr-1 -mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`p-4 max-h-[75dvh] overflow-y-auto no-scrollbar ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>
    {action}
  </div>
);

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg className={`animate-spin text-brand-600 ${sizes[size]} ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// ============================================================
// Main App Component
// ============================================================

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('nearlyy_onboarded') === 'true');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [servicesData, setServicesData] = useState(CATEGORY_DATA);
  const [firebaseStatus, setFirebaseStatus] = useState('Checking…');
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('nearlyy_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...USER_PROFILE,
          ...parsed,
          avatar: parsed.avatar || USER_PROFILE.avatar
        };
      }
      return USER_PROFILE;
    } catch (e) {
      return USER_PROFILE;
    }
  });
  const [userBookings, setUserBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nearlyy_bookings') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenHistory, setScreenHistory] = useState(['home']);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState('mess');
  const [activeTab, setActiveTab] = useState('home');
  const [filterTag, setFilterTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(CATEGORY_DATA.mess[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [showChatComingSoonModal, setShowChatComingSoonModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isNotifiedForChat, setIsNotifiedForChat] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [interests, setInterests] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedLivingType, setSelectedLivingType] = useState('');
  const [bio, setBio] = useState('');
  const [hasMoreContent, setHasMoreContent] = useState(false);

  const toastTimerRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const touchCarouselRef = useRef(null);
  const touchHeroRef = useRef(null);

  // App Update (OTA + APK) State
  const [currentAppVersion, setCurrentAppVersion] = useState(APP_VERSION);
  const [appConfig, setAppConfig] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdatingOta, setIsUpdatingOta] = useState(false);
  const [otaStatusMessage, setOtaStatusMessage] = useState('');
  const [manualCheckLoading, setManualCheckLoading] = useState(false);
  const [manualCheckFeedback, setManualCheckFeedback] = useState(null);

  // Sync native app version from Capacitor package manager if available
  useEffect(() => {
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.getInfo().then(info => {
        if (info && info.version) {
          setCurrentAppVersion(info.version);
        }
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  // Real-time app config & version listener (for both OTA live bundles and APK updates)
  useEffect(() => {
    notifyAppReady();

    const unsubConfig = subscribeToAppConfig((config) => {
      setAppConfig(config);
      if (!config) return;

      const isOutdated = isVersionNewer(config.latestVersion, currentAppVersion);
      if (isOutdated) {
        // Only display if not snoozed within 24h, or if forced update
        const snoozedUntil = parseInt(localStorage.getItem('nearlyy_snooze_' + config.latestVersion) || '0', 10);
        if (config.forceUpdate || Date.now() > snoozedUntil) {
          setShowUpdateModal(true);
        } else {
          setShowUpdateModal(false);
        }
      } else {
        // App is fully updated: MUST NOT display update modal!
        setShowUpdateModal(false);
      }

      // Background Capgo Live Bundle download if available
      if (config?.bundleUrl && config?.bundleVersion) {
        downloadAndApplyBundle(config.bundleUrl, config.bundleVersion).then(res => {
          if (res?.success) {
            console.log('[Updater] Live bundle downloaded & primed for restart.');
          }
        }).catch(() => {});
      }
    });
    return () => unsubConfig();
  }, [currentAppVersion]);

  const handleSnoozeUpdate = () => {
    if (appConfig?.latestVersion) {
      localStorage.setItem('nearlyy_snooze_' + appConfig.latestVersion, String(Date.now() + 24 * 60 * 60 * 1000));
    }
    setShowUpdateModal(false);
  };

  const handleTriggerAppUpdate = async () => {
    if (!appConfig) return;
    
    // 1. If OTA live bundle is provided, download and prime
    if (appConfig.bundleUrl) {
      setIsUpdatingOta(true);
      setOtaStatusMessage('Downloading live web update...');
      try {
        const res = await downloadAndApplyBundle(appConfig.bundleUrl, appConfig.bundleVersion);
        if (res.success) {
          setOtaStatusMessage('Live update installed! Reloading...');
          setTimeout(() => {
            reloadApp();
          }, 1200);
          return;
        }
      } catch (err) {
        console.warn('OTA bundle apply error:', err);
      } finally {
        setIsUpdatingOta(false);
      }
    }

    // 2. Direct APK download / package installer trigger
    const targetApk = appConfig.apkUrl || 'https://github.com/Hacker2022-web/NearlyY/raw/main/APKs/NearlyY.apk';
    try {
      window.open(targetApk, '_system');
    } catch {
      window.location.href = targetApk;
    }
  };

  const handleManualCheckUpdates = async () => {
    setManualCheckLoading(true);
    setManualCheckFeedback(null);
    try {
      const config = await fetchAppConfig();
      setAppConfig(config);
      const isOutdated = isVersionNewer(config.latestVersion, currentAppVersion);
      if (isOutdated) {
        setShowUpdateModal(true);
        setManualCheckFeedback({ type: 'update', message: `v${config.latestVersion} available!` });
      } else {
        setShowUpdateModal(false);
        setManualCheckFeedback({ type: 'success', message: 'You are on the latest version!' });
        setTimeout(() => setManualCheckFeedback(null), 3500);
      }
    } catch {
      setManualCheckFeedback({ type: 'error', message: 'Could not connect to update server' });
      setTimeout(() => setManualCheckFeedback(null), 3000);
    } finally {
      setManualCheckLoading(false);
    }
  };

  // ============================================================
  // GSAP Animations
  // ============================================================
  
  // Hero carousel cross-fade
  useEffect(() => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0 || prefersReducedMotion()) return;
    slides.forEach((slide, idx) => {
      if (idx === heroSlideIndex) {
        gsap.fromTo(slide, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto', clearProps: 'transform' });
      } else {
        gsap.to(slide, { autoAlpha: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  }, [heroSlideIndex]);

  // Auto-rotate home hero slides
  useEffect(() => {
    if (currentScreen !== 'home') return;
    const interval = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentScreen]);

  // Onboarding step transition
  useEffect(() => {
    if (isOnboarded || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.onboarding-step-content', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', clearProps: 'transform,opacity' });
    });
    return () => ctx.revert();
  }, [onboardingStep, isOnboarded]);

  // Home sections stagger
  useEffect(() => {
    if (currentScreen !== 'home' || !isOnboarded || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.home-section', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power3.out', clearProps: 'transform,opacity' });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen, isOnboarded]);

  // Category list cards + tabs
  useEffect(() => {
    if (currentScreen !== 'category-list' || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.service-card', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' });
      gsap.fromTo('.service-tab', { scale: 0.94 }, { scale: 1, duration: 0.2, stagger: 0.02, ease: 'back.out(1.8)', clearProps: 'transform' });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen, activeCategory]);

  // Detail view
  useEffect(() => {
    if (currentScreen !== 'detail' || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.detail-view-container', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', clearProps: 'transform,opacity' });
      gsap.fromTo('.detail-hero-img', { scale: 1.06 }, { scale: 1, duration: 0.6, ease: 'power3.out', clearProps: 'transform' });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen, selectedItem]);

  // Modals
  useEffect(() => {
    if (!showChatComingSoonModal || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power1.out' });
      gsap.fromTo('.modal-panel', { y: 24, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.6)', clearProps: 'transform,opacity' });
    });
    return () => cancelAnimationFrame(raf);
  }, [showChatComingSoonModal]);

  useEffect(() => {
    if (!showEditProfileModal || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power1.out' });
      gsap.fromTo('.modal-panel', { y: 24, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.6)', clearProps: 'transform,opacity' });
    });
    return () => cancelAnimationFrame(raf);
  }, [showEditProfileModal]);

  // Toast
  useEffect(() => {
    if (!toastMessage || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.toast-notification-pill', { y: 12, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.6)', clearProps: 'transform,opacity' });
    });
    return () => cancelAnimationFrame(raf);
  }, [toastMessage]);

  // Confirmed/Profile screens
  useEffect(() => {
    if (!['confirmed', 'profile'].includes(currentScreen) || prefersReducedMotion()) return;
    const raf = requestAnimationFrame(() => {
      gsap.fromTo('.screen-content', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', clearProps: 'transform,opacity' });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentScreen]);

  // Toast timer management
  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ============================================================
  // Business Logic
  // ============================================================

  const getCategoryId = (val) => {
    const str = String(val || '').toLowerCase();
    if (str.includes('mess') || str.includes('tiffin')) return 'mess';
    if (str.includes('laundry')) return 'laundry';
    if (str.includes('gym') || str.includes('fitness')) return 'gym';
    if (str.includes('flat') || str.includes('pg') || str.includes('room')) return 'flats';
    if (str.includes('part') || str.includes('event') || str.includes('gig')) return 'parties';
    return 'mess';
  };

  const navigateToScreen = (screen) => {
    if (screen === currentScreen) return;
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const navigateBack = useCallback(() => {
    // 1. Close open modals first
    if (showImageLightbox) {
      setShowImageLightbox(false);
      return true;
    }
    if (showUpdateModal && !appConfig?.forceUpdate) {
      setShowUpdateModal(false);
      return true;
    }
    if (showChatComingSoonModal) {
      setShowChatComingSoonModal(false);
      return true;
    }
    if (showEditProfileModal) {
      setShowEditProfileModal(false);
      return true;
    }

    // 2. Onboarding flow navigation
    if (!isOnboarded) {
      if (onboardingStep > 1) {
        setOnboardingStep(prev => prev - 1);
        return true;
      }
      return false;
    }

    // 3. Screen history stack pop
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1] || 'home';
      setScreenHistory(nextHistory);
      setCurrentScreen(prevScreen);
      if (prevScreen === 'home') setActiveTab('home');
      if (prevScreen === 'profile') setActiveTab('profile');
      return true;
    }

    // Fallback if history is single entry but user is not on home
    if (currentScreen !== 'home') {
      setCurrentScreen('home');
      setActiveTab('home');
      setScreenHistory(['home']);
      return true;
    }

    return false;
  }, [
    showImageLightbox,
    showChatComingSoonModal,
    showEditProfileModal,
    showUpdateModal,
    appConfig?.forceUpdate,
    isOnboarded,
    onboardingStep,
    screenHistory,
    currentScreen
  ]);

  const lastBackPressRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Android Hardware / System Back Button Listener (Capacitor)
  useEffect(() => {
    let backListener = null;

    const setupListener = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        backListener = await CapApp.addListener('backButton', () => {
          const handled = navigateBack();
          if (!handled) {
            const now = Date.now();
            if (now - lastBackPressRef.current < 2000) {
              CapApp.exitApp();
            } else {
              lastBackPressRef.current = now;
              showToast('Press back again to exit NearlyY');
            }
          }
        });
      } catch (err) {
        console.warn('Capacitor App backButton listener notice:', err);
      }
    };

    setupListener();

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, [navigateBack]);

  // Full-screen / Edge Swipe Gesture to go back
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const canGoBack = Boolean(
        showImageLightbox ||
        showChatComingSoonModal ||
        showEditProfileModal ||
        (!isOnboarded && onboardingStep > 1) ||
        (isOnboarded && currentScreen !== 'home')
      );

      // Show indicator when swiping right from left edge area
      if (canGoBack && deltaX > 15 && deltaX > Math.abs(deltaY) * 1.3 && touchStartRef.current.x <= 50) {
        const progress = Math.min(Math.max((deltaX - 15) / 90, 0), 1);
        setSwipeProgress(progress);
      }
    };

    const handleTouchEnd = (e) => {
      setSwipeProgress(0);
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const duration = Date.now() - touchStartRef.current.time;

      const isHorizontalSwipe = deltaX > 55 && Math.abs(deltaY) < 90 && deltaX > Math.abs(deltaY) * 1.2;
      const isFastFlick = deltaX > 35 && duration < 240 && Math.abs(deltaY) < 40;
      // Edge swipe: must start near left bezel (<= 50px) so in-screen carousels & sliders can swipe freely
      const isValidOrigin = touchStartRef.current.x <= 50;

      if ((isHorizontalSwipe || isFastFlick) && isValidOrigin) {
        const target = document.elementFromPoint(touchStartRef.current.x, touchStartRef.current.y);
        if (target && target.closest('input, textarea, select, .image-carousel, .no-swipe-back')) return;

        const handled = navigateBack();
        if (handled && typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(15); } catch (err) {}
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', () => setSwipeProgress(0), { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigateBack, showImageLightbox, showChatComingSoonModal, showEditProfileModal, isOnboarded, onboardingStep, currentScreen]);

  const openCategory = (catId) => {
    const normalized = getCategoryId(catId);
    setActiveCategory(normalized);
    setFilterTag('All');
    setSearchQuery('');
    navigateToScreen('category-list');
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setActiveImageIndex(0);
    setIsBookmarked(false);
    if (item?.category) setActiveCategory(item.category);
    navigateToScreen('detail');
  };

  const triggerBooking = async (title, service, phone, amount = 'Standard') => {
    setIsBooking(true);
    const newBooking = {
      title, service,
      phone: phone || '919876543210',
      userEmail: userProfile?.email || '',
      userName: userProfile?.name || '',
      userCollege: userProfile?.college || '',
      locality: userProfile?.subLocality || '',
      amount
    };
    setBookingDetails(newBooking);
    navigateToScreen('confirmed');
    try {
      await recordBooking(newBooking);
      showToast('Booking confirmed & synced');
    } catch (err) {
      console.warn('Booking sync failed:', err);
      showToast('Booking saved locally');
    } finally {
      setIsBooking(false);
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
      window.open(url, '_blank') || (window.location.href = url);
    }
  };

  const handleOpenChat = (source = 'Bottom Navigation') => {
    try {
      recordInquiry({
        userEmail: userProfile?.email || '',
        userName: userProfile?.name || '',
        source,
        note: 'User clicked chat / WhatsApp group'
      });
    } catch (err) { console.warn('Inquiry logging skipped:', err); }
    openWhatsAppCommunity();
    setShowChatComingSoonModal(true);
    showToast('Opening WhatsApp Community…');
  };

  const handleNotifyChat = async () => {
    setIsNotifiedForChat(true);
    try {
      await recordInquiry({
        userEmail: userProfile?.email || '',
        userName: userProfile?.name || '',
        source: 'Chat Modal',
        wantsEarlyAccess: true
      });
    } catch (err) { console.warn('Inquiry sync failed:', err); }
    showToast('Saved! Opening WhatsApp…');
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

  const finishOnboarding = async (profileOverride) => {
    setIsOnboarded(true);
    localStorage.setItem('nearlyy_onboarded', 'true');
    const toSave = {
      ...(profileOverride || userProfile),
      onboarded: true,
      avatar: (profileOverride && profileOverride.avatar) || userProfile?.avatar || USER_PROFILE.avatar
    };
    setUserProfile(toSave);
    try {
      await syncUserProfile(toSave);
      showToast('Profile saved & synced 🎉');
    } catch (err) {
      console.warn('Profile sync failed:', err);
      showToast('Profile saved locally');
    }
    setCurrentScreen('home');
  };

  const resetOnboarding = async () => {
    await logoutUser();
    localStorage.removeItem('nearlyy_onboarded');
    setIsOnboarded(false);
    setOnboardingStep(1);
    setCurrentScreen('home');
    showToast('Signed out & reset');
  };

  const toggleInterest = (interestName) => {
    setInterests(prev => {
      const exists = prev.includes(interestName);
      const updated = exists ? prev.filter(i => i !== interestName) : [...prev, interestName];
      return updated;
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const authPromise = signInWithGoogle();
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 45000));
      const res = await Promise.race([authPromise, timeoutPromise]);

      if (res && res.success && res.user) {
        const authedUser = res.user;
        setUserProfile(authedUser);

        if (res.isExistingUser) {
          // Returning user who already completed campus onboarding
          setIsOnboarded(true);
          localStorage.setItem('nearlyy_onboarded', 'true');
          setCurrentScreen('home');
          showToast(`Welcome back, ${firstNameOf(authedUser.name)}! 🎉`);
        } else {
          // Brand new user: smoothly advance to Step 3 (Which college?)
          setOnboardingStep(3);
          showToast(`Welcome, ${firstNameOf(authedUser.name)}! Select your college 🎓`);
        }
      } else if (res?.timeout) {
        showToast('Sign in took too long. Try Student Entry below.');
      } else if (res?.cancelled) {
        showToast('Google Sign-in cancelled.');
      } else {
        showToast(res?.message || 'Sign in failed. Try Student Entry below.');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      showToast('Sign in failed. Try Student Entry below.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ============================================================
  // Firebase Listeners
  // ============================================================

  // Auth observer
  useEffect(() => {
    const unsubAuth = listenToAuthState((profile) => {
      if (profile && profile.email) {
        setUserProfile(prev => ({ ...prev, ...profile }));
      }
    });
    return () => unsubAuth && unsubAuth();
  }, []);

  useEffect(() => {
    const unsubServices = subscribeToServices((data) => {
      setServicesData(data);
      setFirebaseStatus('Firebase: Synced');
    });
    return () => unsubServices();
  }, []);

  useEffect(() => {
    if (!isOnboarded || !userProfile?.email) return;
    const unsubBookings = subscribeToBookings(userProfile.email, (bookings) => {
      setUserBookings(bookings);
    });
    return () => unsubBookings();
  }, [isOnboarded, userProfile?.email]);

  // ============================================================
  // Helpers
  // ============================================================

  const getFilteredItems = () => {
    if (!servicesData || !servicesData[activeCategory]) return [];
    let items = servicesData[activeCategory];
    if (filterTag !== 'All') items = items.filter(i => i.tags?.includes(filterTag));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(i => 
        i.name?.toLowerCase().includes(q) || 
        i.locality?.toLowerCase().includes(q) ||
        i.venue?.toLowerCase().includes(q)
      );
    }
    return items;
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="w-full h-full bg-background flex flex-col items-center justify-center p-0 sm:p-2 md:p-4 font-sans antialiased selection:bg-brand-200 selection:text-brand-900 overflow-hidden">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      {/* Visual Floating Edge Swipe-to-Back Indicator */}
      {swipeProgress > 0 && (
        <div 
          className="fixed left-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/85 backdrop-blur-md text-white shadow-2xl border border-white/20 transition-all duration-75"
          style={{
            opacity: Math.min(swipeProgress * 1.2, 1),
            transform: `translateY(-50%) translateX(${swipeProgress * 14}px) scale(${0.75 + swipeProgress * 0.35})`
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white animate-pulse" />
        </div>
      )}

      <div className="app-shell max-w-full sm:max-w-[520px] md:max-w-[600px] bg-white sm:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border-0 sm:border sm:border-slate-200/50">
        
        {!isOnboarded ? (
          /* ============================================================ */
          /* ONBOARDING FLOW */
          /* ============================================================ */
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-4 p-4 sm:p-5 pt-[calc(var(--app-safe-top)+1rem)] pb-[calc(var(--app-safe-bottom)+1rem)] overflow-y-auto no-scrollbar scroll-area bg-background onboarding-step-content">
            {onboardingStep === 1 && (
              <OnboardingWelcome 
                onStart={() => setOnboardingStep(2)}
                onGoogleSignIn={handleGoogleSignIn}
                isGoogleLoading={isGoogleLoading}
              />
            )}
            {onboardingStep === 2 && (
              <OnboardingGoogleSignIn 
                onGoogleSignIn={handleGoogleSignIn} 
                isLoading={isGoogleLoading}
                onBack={() => setOnboardingStep(1)}
                onNext={() => setOnboardingStep(3)}
                userProfile={userProfile}
                onUpdateProfile={(updates) => setUserProfile(p => ({ ...p, ...updates }))}
              />
            )}
            {onboardingStep === 3 && (
              <OnboardingCollege 
                colleges={PUNE_COLLEGES}
                selectedCollege={selectedCollege}
                onSelect={setSelectedCollege}
                onNext={() => { setUserProfile(p => ({ ...p, college: selectedCollege })); setOnboardingStep(4); }}
                onBack={() => setOnboardingStep(2)}
              />
            )}
            {onboardingStep === 4 && (
              <OnboardingLivingType 
                types={LIVING_TYPES}
                selectedType={selectedLivingType}
                onSelect={setSelectedLivingType}
                onNext={() => { setUserProfile(p => ({ ...p, livingType: selectedLivingType })); setOnboardingStep(5); }}
                onBack={() => setOnboardingStep(3)}
              />
            )}
            {onboardingStep === 5 && (
              <OnboardingLocality 
                localities={LOHEGAON_LOCALITIES}
                selectedLocality={userProfile.subLocality || 'Porwal Road, Lohegaon'}
                onSelect={(loc) => setUserProfile(p => ({ ...p, subLocality: loc }))}
                onNext={() => setOnboardingStep(6)}
                onBack={() => setOnboardingStep(4)}
              />
            )}
            {onboardingStep === 6 && (
              <OnboardingInterests 
                services={CORE_SERVICES}
                interests={interests}
                onToggle={toggleInterest}
                onNext={() => { setUserProfile(p => ({ ...p, interests })); setOnboardingStep(7); }}
                onBack={() => setOnboardingStep(5)}
                onSkip={() => { setUserProfile(p => ({ ...p, interests })); setOnboardingStep(7); }}
              />
            )}
            {onboardingStep === 7 && (
              <OnboardingBio 
                bio={bio}
                onChange={setBio}
                onFinish={() => { 
                  const updated = { ...userProfile, bio, onboarded: true };
                  setUserProfile(updated); 
                  finishOnboarding(updated); 
                }}
                onBack={() => setOnboardingStep(6)}
              />
            )}

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i < onboardingStep ? 'bg-brand-600' : 'bg-slate-200'
                  } ${i === onboardingStep - 1 ? 'w-6' : ''}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* MAIN APP DASHBOARD */
          /* ============================================================ */
          <>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scroll-area bg-background" ref={scrollAreaRef}>
              
              {/* SCREEN 1: HOME DASHBOARD */}
              {currentScreen === 'home' && (
                <div className="screen-content safe-content-top px-4 pb-5 space-y-6">
                  {/* Header */}
                  <div className="home-section flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { setCurrentScreen('profile'); setActiveTab('profile'); }}
                        className="relative group shrink-0 active:scale-95 transition-transform cursor-pointer"
                        aria-label="View Profile"
                      >
                        <UserAvatar user={userProfile} size="md" className="ring-2 ring-brand-500/20" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                      </button>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Lohegaon, Pune</p>
                        <p className="text-base font-semibold text-slate-900">Welcome back, {firstNameOf(userProfile.name)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 font-medium shadow-sm shrink-0">
                        <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="max-w-[80px] truncate">{shortLocalityOf(userProfile.subLocality)}</span>
                      </div>
                      <IconButton onClick={() => showToast('Notifications cleared')} aria-label="Notifications" size="md">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
                      </IconButton>
                    </div>
                  </div>

                  {/* Hero Interactive Carousel */}
                  <div 
                    className="home-section image-carousel relative rounded-3xl overflow-hidden bg-slate-950 p-5 text-white shadow-xl min-h-[12.5rem] flex flex-col justify-between select-none"
                    onTouchStart={(e) => {
                      const t = e.touches[0];
                      touchHeroRef.current = { x: t.clientX, y: t.clientY };
                    }}
                    onTouchEnd={(e) => {
                      if (!touchHeroRef.current) return;
                      const t = e.changedTouches[0];
                      const dx = t.clientX - touchHeroRef.current.x;
                      const dy = t.clientY - touchHeroRef.current.y;
                      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                        if (dx < 0) {
                          setHeroSlideIndex(prev => (prev + 1) % HERO_SLIDES.length);
                        } else {
                          setHeroSlideIndex(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
                        }
                      }
                      touchHeroRef.current = null;
                    }}
                  >
                    {/* Background Slide with Overlay */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                      <img 
                        src={HERO_SLIDES[heroSlideIndex]?.image} 
                        alt="" 
                        className="w-full h-full object-cover transition-all duration-700 scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 border border-brand-400/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                          {HERO_SLIDES[heroSlideIndex]?.badge}
                        </span>
                        <span className="text-[11px] text-white/60 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {HERO_SLIDES[heroSlideIndex]?.location}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold leading-tight text-white drop-shadow-sm">
                        {HERO_SLIDES[heroSlideIndex]?.title}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-2">
                        {HERO_SLIDES[heroSlideIndex]?.tagline}
                      </p>
                    </div>

                    {/* Footer Controls & CTA */}
                    <div className="relative z-10 pt-4 flex items-center justify-between gap-3">
                      <button 
                        onClick={() => {
                          const catMap = ['flats', 'mess', 'gym'];
                          openCategory(catMap[heroSlideIndex] || 'mess');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        Explore Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Dot Indicators */}
                      <div className="flex items-center gap-1.5">
                        {HERO_SLIDES.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setHeroSlideIndex(idx)}
                            className="p-1 -m-1 focus:outline-none"
                            aria-label={`Go to slide ${idx + 1}`}
                          >
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                idx === heroSlideIndex ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/40'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Previous / Next Arrow buttons on Hero Banner */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlideIndex(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
                      }}
                      className="absolute right-12 top-4 w-7 h-7 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all z-20"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlideIndex(prev => (prev + 1) % HERO_SLIDES.length);
                      }}
                      className="absolute right-3 top-4 w-7 h-7 rounded-full bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all z-20"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Services Grid */}
                  <div className="home-section">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-slate-900">Quick Services</h3>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {CORE_SERVICES.map((svc, idx) => (
                        <button
                          key={svc.id}
                          onClick={() => openCategory(svc.catKey || svc.id)}
                          className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-100 hover:border-brand-200 hover:shadow-sm active:scale-[0.98] transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-2">
                            <svc.icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium text-slate-800 text-center leading-tight">{svc.name.split(' & ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular / Featured */}
                  {servicesData && servicesData.parties && servicesData.parties.length > 0 && (
                    <div className="home-section space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-900">Popular This Week</h3>
                      </div>
                      <div className="space-y-2">
                        {servicesData.parties.slice(0, 3).map((item) => (
                          <PopularItemCard key={item.id} item={item} onPress={() => openDetail(item)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Promo */}
                  <div className="home-section">
                    <button 
                      onClick={() => handleOpenChat('Home Promo')}
                      className="w-full rounded-xl bg-brand-50 border border-brand-100 p-4 flex items-center justify-between hover:bg-brand-100 active:bg-brand-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Need Help?</p>
                          <p className="text-xs text-slate-500">Chat with our Lohegaon student desk</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Interests Quick Access */}
                  {userProfile.interests && userProfile.interests.length > 0 && (
                    <div className="home-section">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-slate-900">Your Interests</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {CORE_SERVICES.filter(s => userProfile.interests.includes(s.id)).slice(0, 4).map((svc) => (
                          <button
                            key={svc.id}
                            onClick={() => openCategory(svc.catKey || svc.id)}
                            className="p-3 rounded-xl bg-white border border-slate-100 hover:border-brand-200 hover:shadow-sm active:scale-[0.98] transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                                <svc.icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-slate-800 truncate">{svc.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN 2: CATEGORY LIST */}
              {currentScreen === 'category-list' && (
                <div className="screen-content safe-content-top px-4 pb-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <IconButton onClick={navigateBack} aria-label="Back" variant="ghost" size="md">
                      <ArrowLeft className="w-5 h-5" />
                    </IconButton>
                    <h2 className="text-base font-semibold text-slate-900 truncate text-center flex-1 capitalize">
                      {activeCategory === 'mess' ? 'Mess & Tiffin' : 
                       activeCategory === 'laundry' ? 'Laundry' : 
                       activeCategory === 'gym' ? 'Gym & Fitness' : 
                       activeCategory === 'parties' ? 'Parties & Events' : 'Flats & PG'}
                    </h2>
                    <div className="w-10" />
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Search ${activeCategory} in Lohegaon…`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  {/* Category Tabs */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: 'mess', label: 'Mess' },
                      { id: 'laundry', label: 'Laundry' },
                      { id: 'gym', label: 'Gym' },
                      { id: 'flats', label: 'Flats/PG' },
                      { id: 'parties', label: 'Events' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => openCategory(cat.id)}
                        className={`service-tab px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                          activeCategory === cat.id 
                            ? 'bg-brand-600 text-white shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Results */}
                  <div className="space-y-2">
                    {getFilteredItems().length === 0 ? (
                      <EmptyState 
                        icon={Search} 
                        title="No results found" 
                        description="Try a different search or switch categories." 
                      />
                    ) : (
                      getFilteredItems().map((item) => (
                        <ServiceCard key={item.id} item={item} onPress={() => openDetail(item)} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN 3: DETAIL VIEW */}
              {currentScreen === 'detail' && selectedItem && (() => {
                const itemImages = getItemImages(selectedItem);
                const safeImageIndex = itemImages.length > 0 
                  ? ((activeImageIndex % itemImages.length) + itemImages.length) % itemImages.length 
                  : 0;
                const activeImg = itemImages[safeImageIndex] || selectedItem.coverImage;

                const handlePrevImage = (e) => {
                  if (e) e.stopPropagation();
                  if (itemImages.length <= 1) return;
                  setActiveImageIndex(prev => (prev - 1 + itemImages.length) % itemImages.length);
                };

                const handleNextImage = (e) => {
                  if (e) e.stopPropagation();
                  if (itemImages.length <= 1) return;
                  setActiveImageIndex(prev => (prev + 1) % itemImages.length);
                };

                return (
                  <div className="screen-content space-y-4 detail-view-container pb-8">
                    {/* Hero Carousel with Touch Swipe, Tap Regions, and Nav Controls */}
                    <div 
                      className="image-carousel relative h-[clamp(14rem,38vh,20rem)] w-full bg-slate-950 overflow-hidden select-none"
                      style={{ touchAction: 'pan-y' }}
                      onTouchStart={(e) => {
                        const t = e.touches[0];
                        touchCarouselRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
                      }}
                      onTouchEnd={(e) => {
                        if (!touchCarouselRef.current || itemImages.length <= 1) return;
                        const t = e.changedTouches[0];
                        const dx = t.clientX - touchCarouselRef.current.x;
                        const dy = t.clientY - touchCarouselRef.current.y;
                        const dt = Date.now() - touchCarouselRef.current.time;
                        if ((Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.05) || (Math.abs(dx) > 20 && dt < 240)) {
                          if (dx < 0) {
                            handleNextImage();
                          } else {
                            handlePrevImage();
                          }
                        }
                        touchCarouselRef.current = null;
                      }}
                    >
                      <img 
                        src={activeImg} 
                        alt={selectedItem.name} 
                        className="detail-hero-img w-full h-full object-cover transition-opacity duration-300" 
                        loading="eager"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                      {/* Quick tap regions on photo: Tap left side for previous, tap right side for next, tap center for lightbox */}
                      {itemImages.length > 1 && (
                        <>
                          <button 
                            type="button"
                            onClick={handlePrevImage}
                            className="absolute left-0 top-16 bottom-12 w-1/4 z-10 cursor-pointer focus:outline-none"
                            aria-label="Previous photo"
                          />
                          <button 
                            type="button"
                            onClick={handleNextImage}
                            className="absolute right-0 top-16 bottom-12 w-1/4 z-10 cursor-pointer focus:outline-none"
                            aria-label="Next photo"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowImageLightbox(true)}
                            className="absolute left-1/4 right-1/4 top-16 bottom-12 z-10 cursor-pointer focus:outline-none"
                            aria-label="View fullscreen photo"
                          />
                        </>
                      )}
                      
                      {/* Top Header Buttons: Back, Bookmark, WhatsApp */}
                      <IconButton 
                        onClick={navigateBack} 
                        variant="default" 
                        size="md"
                        aria-label="Back"
                        style={{ position: 'absolute', top: 'max(var(--app-safe-top), 0.75rem)', left: '1rem', zIndex: 25 }}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </IconButton>

                      <div style={{ position: 'absolute', top: 'max(var(--app-safe-top), 0.75rem)', right: '1rem', zIndex: 25, display: 'flex', gap: '0.5rem' }}>
                        <IconButton 
                          onClick={() => setIsBookmarked(!isBookmarked)} 
                          variant="default" 
                          size="md"
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-brand-600 text-brand-600' : ''}`} />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleWhatsAppChat(selectedItem.name, activeCategory, selectedItem.phone)} 
                          variant="default" 
                          size="md"
                          aria-label="Contact on WhatsApp"
                        >
                          <PhoneCall className="w-5 h-5" />
                        </IconButton>
                      </div>

                      {/* Left & Right Chevron Arrows (When Multiple Images) */}
                      {itemImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={handlePrevImage}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/80 active:scale-90 backdrop-blur-md text-white flex items-center justify-center transition-all z-20 border border-white/20 shadow-md"
                            aria-label="Previous photo"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextImage}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/80 active:scale-90 backdrop-blur-md text-white flex items-center justify-center transition-all z-20 border border-white/20 shadow-md"
                            aria-label="Next photo"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Photo Counter Pill Badge (Tap opens Fullscreen Lightbox) */}
                      {itemImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowImageLightbox(true)}
                          className="absolute bottom-3 right-3 bg-slate-950/70 hover:bg-slate-900 active:scale-95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10 z-20 transition-all cursor-pointer"
                          aria-label="View photo gallery in fullscreen"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-brand-300" />
                          <span>{safeImageIndex + 1} / {itemImages.length}</span>
                          <Maximize2 className="w-2.5 h-2.5 text-slate-300 ml-0.5" />
                        </button>
                      )}

                      {/* Dot Indicators */}
                      {itemImages.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                          {itemImages.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex(idx);
                              }}
                              className="p-1 -m-1 focus:outline-none"
                              aria-label={`Go to photo ${idx + 1}`}
                            >
                              <div 
                                className={`h-1.5 rounded-full transition-all ${
                                  idx === safeImageIndex ? 'bg-white w-5 shadow-sm' : 'bg-white/45 w-1.5 hover:bg-white/80'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="px-4 pb-6 space-y-4">
                      {/* Photo Thumbnails Strip (Tap to Switch Image or Fullscreen) */}
                      {itemImages.length > 1 && (
                        <div className="photo-gallery space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                              Photos ({itemImages.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowImageLightbox(true)}
                              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                              View all ({itemImages.length})
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                            {itemImages.map((imgUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 transition-all ${
                                  idx === safeImageIndex 
                                    ? 'ring-2 ring-brand-600 scale-102 shadow-md' 
                                    : 'opacity-70 hover:opacity-100 border border-slate-200'
                                }`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                {idx === safeImageIndex && (
                                  <div className="absolute inset-0 bg-brand-600/20 border-2 border-brand-600 rounded-2xl flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-md ring-2 ring-brand-600" />
                                  </div>
                                )}
                                <span className="absolute bottom-1 right-1 bg-slate-950/70 text-white text-[9px] font-bold px-1 rounded">
                                  {idx + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Title & Price Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="primary">{selectedItem.categoryName || activeCategory}</Badge>
                            {selectedItem.verified && <Badge variant="success">Verified</Badge>}
                          </div>
                          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{selectedItem.name}</h1>
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {selectedItem.venue || selectedItem.locality || LOCALITY}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-brand-600">{selectedItem.priceDisplay || 'Contact for price'}</p>
                          <p className="text-xs text-slate-400">{selectedItem.priceSubtext || ''}</p>
                        </div>
                      </div>

                      {/* Primary Actions: WhatsApp & Book */}
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleWhatsAppChat(selectedItem.name, activeCategory, selectedItem.phone)}
                          className="flex-1 py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm shadow-md hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2"
                          disabled={isBooking}
                        >
                          <PhoneCall className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => triggerBooking(selectedItem.name, activeCategory, selectedItem.phone, selectedItem.priceDisplay)}
                          className="flex-1 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2"
                          disabled={isBooking}
                        >
                          <Check className="w-4 h-4" />
                          Book Now
                        </button>
                      </div>

                      {/* About Description */}
                      <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">About</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {selectedItem.description || 'Quality verified service for students and residents in Lohegaon, Pune. Trusted by the NearlyY community.'}
                        </p>
                        {selectedItem.highlights && selectedItem.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {selectedItem.highlights.map((h, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CATEGORY SPECIFIC: Flats & PG Details */}
                      {selectedItem.category === 'flats' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs">
                              <span className="text-[10px] text-slate-400 block font-semibold">Sharing</span>
                              <span className="font-bold text-slate-900 text-xs truncate block">{selectedItem.sharing || 'Single / Double'}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs">
                              <span className="text-[10px] text-slate-400 block font-semibold">Deposit</span>
                              <span className="font-bold text-slate-900 text-xs block">₹{selectedItem.deposit || 5000}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs">
                              <span className="text-[10px] text-slate-400 block font-semibold">Brokerage</span>
                              <span className="font-bold text-emerald-600 text-xs block">{selectedItem.brokerage || 'Zero Brokerage'}</span>
                            </div>
                          </div>

                          {selectedItem.rules && selectedItem.rules.length > 0 && (
                            <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100">
                              <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">PG Rules & Timings</h3>
                              <ul className="space-y-1.5 text-xs text-slate-600">
                                {selectedItem.rules.map((rule, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-brand-600 font-bold">•</span>
                                    <span>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CATEGORY SPECIFIC: Gym & Fitness Plans & Facilities */}
                      {selectedItem.category === 'gym' && (
                        <div className="space-y-3">
                          {selectedItem.plans && selectedItem.plans.length > 0 && (
                            <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2.5 shadow-xs">
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Dumbbell className="w-4 h-4 text-brand-600" />
                                <span>Membership Plans</span>
                              </h3>
                              <div className="space-y-2">
                                {selectedItem.plans.map((plan, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs">{plan.title}</p>
                                      <p className="text-[11px] text-slate-500">{plan.sub || 'Per Person'}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-extrabold text-brand-600 text-sm">₹{plan.price}</span>
                                      {plan.save && <span className="block text-[10px] text-emerald-600 font-bold uppercase">{plan.save}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedItem.facilities && selectedItem.facilities.length > 0 && (
                            <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2.5 shadow-xs">
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-brand-600" />
                                <span>Gym Facilities</span>
                              </h3>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {selectedItem.facilities.map((fac, idx) => {
                                  const name = typeof fac === 'string' ? fac : (fac.name || 'Facility');
                                  return (
                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span className="font-medium text-slate-700 truncate">{name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {selectedItem.timings && (
                            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-3.5 text-xs space-y-1.5">
                              <p className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Gym Operating Timings</span>
                              </p>
                              {selectedItem.timings.general && <p className="text-slate-700"><span className="font-semibold">General:</span> {selectedItem.timings.general}</p>}
                              {selectedItem.timings.ladiesOnly && <p className="text-slate-700"><span className="font-semibold">Ladies Only:</span> {selectedItem.timings.ladiesOnly}</p>}
                              {selectedItem.timings.sunday && <p className="text-slate-700"><span className="font-semibold">Sunday:</span> {selectedItem.timings.sunday}</p>}
                            </div>
                          )}
                        </div>
                      )}

                      {/* CATEGORY SPECIFIC: Mess & Tiffin Menus */}
                      {selectedItem.category === 'mess' && (
                        <div className="space-y-3">
                          {(selectedItem.lunchMenu || selectedItem.dinnerMenu || selectedItem.todayMenu) && (
                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 p-4 space-y-2.5 shadow-xs">
                              <h3 className="text-sm font-bold text-orange-950 flex items-center gap-1.5">
                                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                                <span>Today's Fresh Menu</span>
                              </h3>
                              <div className="space-y-2 text-xs">
                                {(selectedItem.lunchMenu || selectedItem.todayMenu?.lunch) && (
                                  <div className="bg-white/80 p-2.5 rounded-xl border border-orange-200/50">
                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">☀️ Lunch</span>
                                    <span className="text-slate-800 font-medium">{selectedItem.lunchMenu || selectedItem.todayMenu?.lunch}</span>
                                  </div>
                                )}
                                {(selectedItem.dinnerMenu || selectedItem.todayMenu?.dinner) && (
                                  <div className="bg-white/80 p-2.5 rounded-xl border border-orange-200/50">
                                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">🌙 Dinner</span>
                                    <span className="text-slate-800 font-medium">{selectedItem.dinnerMenu || selectedItem.todayMenu?.dinner}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-2xl bg-white border border-slate-100 text-center shadow-xs">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Single Thali</span>
                              <span className="text-base font-extrabold text-brand-600">₹{selectedItem.singleThaliPrice || 90}</span>
                              <span className="text-[10px] text-slate-500 block">Pay as you eat</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white border border-slate-100 text-center shadow-xs">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Monthly Pass</span>
                              <span className="text-base font-extrabold text-brand-600">{selectedItem.priceDisplay || `₹${selectedItem.monthlyPrice || 2000}/mo`}</span>
                              <span className="text-[10px] text-slate-500 block">2 meals / day</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CATEGORY SPECIFIC: Parties & Events */}
                      {selectedItem.category === 'parties' && (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-4 space-y-2">
                            {selectedItem.dateTime && (
                              <div className="flex items-center gap-2 text-pink-700 font-bold text-sm">
                                <Calendar className="w-4 h-4 text-pink-600 shrink-0" />
                                <span>{selectedItem.dateTime}</span>
                              </div>
                            )}
                            {selectedItem.genre && (
                              <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>Genre: {selectedItem.genre}</span>
                              </p>
                            )}
                            {selectedItem.organizer && (
                              <p className="text-xs text-slate-500">
                                Curated by <span className="font-semibold text-slate-800">{selectedItem.organizer}</span>
                              </p>
                            )}
                          </div>

                          {selectedItem.pricing && selectedItem.pricing.length > 0 && (
                            <div className="rounded-xl bg-white border border-slate-100 p-4 space-y-2.5">
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Ticket className="w-4 h-4 text-brand-600" />
                                Entry Passes & Tiers
                              </h3>
                              <div className="space-y-2">
                                {selectedItem.pricing.map((tier, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                    <div>
                                      <p className="font-bold text-slate-800">{tier.type}</p>
                                      {tier.note && <p className="text-[11px] text-slate-500">{tier.note}</p>}
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-brand-600 text-sm">₹{tier.price}</span>
                                      {tier.save && <span className="block text-[10px] text-emerald-600 font-semibold">{tier.save}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedItem.rules && selectedItem.rules.length > 0 && (
                            <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Event Guidelines</h3>
                              <ul className="space-y-1.5 text-xs text-slate-600">
                                {selectedItem.rules.map((rule, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-pink-500 font-bold">•</span>
                                    <span>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedItem.instagram && (
                            <a
                              href={selectedItem.instagram}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition"
                            >
                              <Instagram className="w-4 h-4" />
                              <span>Follow {selectedItem.instagramHandle || '@uv_events.co'} on Instagram</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Amenities & Inclusions (Safe Object/String Handling) */}
                      {selectedItem.amenities && selectedItem.amenities.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h3 className="text-sm font-semibold text-slate-900">Amenities & Inclusions</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {selectedItem.amenities.map((amenity, i) => {
                              const label = typeof amenity === 'string' ? amenity : (amenity.name || 'Amenity');
                              return (
                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="text-xs font-medium text-slate-700 truncate">{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Map Location Card */}
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-center">
                        <MapPin className="w-7 h-7 mx-auto text-brand-600 mb-1" />
                        <h4 className="text-xs font-bold text-slate-900">Location & Area</h4>
                        <p className="text-xs text-slate-500">{selectedItem.venue || selectedItem.locality || 'Lohegaon, Pune'}</p>
                        <p className="text-[11px] text-slate-400">{selectedItem.distance || 'Near DY Patil / Airforce Campus'}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SCREEN 4: BOOKING CONFIRMED */}
              {currentScreen === 'confirmed' && (
                <div className="screen-content safe-content-top px-4 py-8 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center shadow-lg relative">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                      Your request for <span className="font-semibold text-slate-800">{bookingDetails?.title}</span> has been stored locally & synced to Firebase.
                    </p>
                    <p className="text-xs text-slate-400">Reference: {bookingDetails?.id || 'NY-' + Date.now().toString(36).toUpperCase()}</p>
                  </div>
                  <div className="w-full space-y-2 pt-2">
                    <button onClick={navigateBack} className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors">
                      Back to Home
                    </button>
                    <button onClick={() => openWhatsAppCommunity()} className="w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm shadow-md hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Join WhatsApp Community
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 5: PROFILE */}
              {currentScreen === 'profile' && (
                <div className="screen-content safe-content-top px-4 pb-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Profile</h2>
                    <IconButton onClick={() => setShowEditProfileModal(true)} aria-label="Edit Profile" variant="ghost" size="md">
                      <Settings className="w-5 h-5" />
                    </IconButton>
                  </div>

                  {/* Profile Card */}
                  <Card className="flex flex-col items-center text-center space-y-3">
                    <div className="relative group cursor-pointer" onClick={() => setShowEditProfileModal(true)}>
                      <UserAvatar user={userProfile} size="xl" className="border-4 border-white shadow-lg ring-2 ring-brand-500/20" />
                      {userProfile.isVerified && (
                        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">✓</span>
                      )}
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowEditProfileModal(true); }}
                        className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white text-slate-700 hover:text-brand-600 shadow-md border border-slate-200 flex items-center justify-center transition-all active:scale-90"
                        aria-label="Change profile photo"
                        title="Change photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{userProfile.name || 'Student'}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{userProfile.college} • {shortLocalityOf(userProfile.subLocality)}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                      <Badge variant="outline">{userProfile.livingType || 'Not set'}</Badge>
                    </div>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Bookings" value={String(userBookings.length)} icon={ShoppingBag} />
                    <StatCard label="Interests" value={String(userProfile.interests?.length || 0)} icon={Bookmark} />
                    <StatCard label="Community" value="Active" icon={MessageSquare} />
                  </div>

                  {/* Interests */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-slate-900">Your Interests</h3>
                      <IconButton onClick={() => setShowEditProfileModal(true)} aria-label="Edit interests" variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </IconButton>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.interests && userProfile.interests.length > 0 ? (
                        userProfile.interests.map((interest) => (
                          <Badge key={interest} variant="primary">{interest}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">No interests set</span>
                      )}
                    </div>
                  </Card>

                  {/* My Bookings */}
                  <Card>
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Recent Bookings</h3>
                    <div className="space-y-2">
                      {userBookings && userBookings.length > 0 ? (
                        userBookings.map((booking, i) => (
                          <div key={booking.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-brand-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{booking.title}</p>
                                <p className="text-xs text-slate-500">{booking.service || 'Service Booking'} • {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Recent'}</p>
                              </div>
                            </div>
                            <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'} className="text-xs capitalize">
                              {booking.status || 'Confirmed'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          <ShoppingBag className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                          <p>No active bookings yet.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Book a trial meal, laundry, or event pass to see it here.</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* App Releases & OTA Card */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">App Releases & OTA</h3>
                        <p className="text-xs text-slate-500">Live Over-The-Air & APK updates</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        isVersionNewer(appConfig?.latestVersion, currentAppVersion)
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        v{currentAppVersion} {isVersionNewer(appConfig?.latestVersion, currentAppVersion) ? '• Update Available' : '• Up to Date ✓'}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isVersionNewer(appConfig?.latestVersion, currentAppVersion)
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {isVersionNewer(appConfig?.latestVersion, currentAppVersion) 
                              ? `New Release: v${appConfig.latestVersion}` 
                              : `NearlyY is Up to Date`}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {isVersionNewer(appConfig?.latestVersion, currentAppVersion)
                              ? 'Tap update to install latest build'
                              : 'You are on the latest version'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleManualCheckUpdates}
                        disabled={manualCheckLoading}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-xs transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {manualCheckLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{manualCheckLoading ? 'Checking...' : isVersionNewer(appConfig?.latestVersion, currentAppVersion) ? 'Update' : 'Check'}</span>
                      </button>
                    </div>

                    {manualCheckFeedback && (
                      <p className={`text-xs mt-2 text-center font-medium ${
                        manualCheckFeedback.type === 'success' ? 'text-emerald-600' :
                        manualCheckFeedback.type === 'update' ? 'text-brand-600' : 'text-red-500'
                      }`}>
                        {manualCheckFeedback.message}
                      </p>
                    )}
                  </Card>

                  {/* Settings */}
                  <Card>
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Settings</h3>
                    <div className="space-y-2">
                      <SettingsRow icon={Shield} title="Privacy & Security" subtitle="Manage your data" onPress={() => {}} />
                      <SettingsRow icon={HelpCircle} title="Help & Support" subtitle="FAQs, contact us" onPress={() => {}} />
                      <SettingsRow icon={Info} title="About NearlyY" subtitle={`Version ${currentAppVersion} (Lohegaon Edition)`} onPress={handleManualCheckUpdates} />
                      <SettingsRow icon={LogOut} title="Sign Out" subtitle="Log out of your account" variant="danger" onPress={resetOnboarding} />
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* BOTTOM NAVIGATION */}
            <nav className="app-bottom-nav bg-white/95 backdrop-blur-md border-t border-slate-200/50 px-3 sm:px-5 flex items-center justify-between z-40">
              <button onClick={() => { setCurrentScreen('home'); setActiveTab('home'); setScreenHistory(['home']); }} className={`flex flex-col items-center text-[10px] font-medium h-full justify-center px-2 transition-colors ${currentScreen === 'home' ? 'text-brand-600' : 'text-slate-400'}`}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button onClick={() => openCategory('mess')} className={`flex flex-col items-center text-[10px] font-medium h-full justify-center px-2 transition-colors ${currentScreen === 'category-list' ? 'text-brand-600' : 'text-slate-400'}`}>
                <Compass className="w-5 h-5" />
                <span>Explore</span>
              </button>
              <button onClick={() => handleOpenChat('Bottom Navigation')} className="flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-brand-600 transition-colors relative h-full px-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-600 border-2 border-white" />
              </button>
              <button onClick={() => { navigateToScreen('profile'); setActiveTab('profile'); }} className={`flex flex-col items-center text-[10px] font-medium h-full justify-center px-2 transition-colors ${currentScreen === 'profile' ? 'text-brand-600' : 'text-slate-400'}`}>
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </nav>
          </>
        )}

        {/* CHAT COMING SOON MODAL */}
        <Modal 
          isOpen={showChatComingSoonModal} 
          onClose={() => setShowChatComingSoonModal(false)} 
          title="In-App Chat Coming Soon"
        >
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">We're Building Something Great</h3>
            <p className="text-sm text-slate-500">
              Real-time in-app chat with vendors and the NearlyY community is coming soon.
            </p>
            <div className="space-y-2 pt-2">
              <button onClick={handleNotifyChat} disabled={isNotifiedForChat} className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isNotifiedForChat ? '✓ You\'ll be notified' : 'Notify Me When Live'}
              </button>
              <button onClick={openWhatsAppCommunity} className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm shadow-md hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Join WhatsApp Community Now
              </button>
            </div>
          </div>
        </Modal>

        {/* EDIT PROFILE MODAL */}
        <Modal 
          isOpen={showEditProfileModal} 
          onClose={() => setShowEditProfileModal(false)} 
          title="Edit Profile"
        >
          <div className="space-y-4">
            {/* Avatar Selector & Upload */}
            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="relative group">
                <UserAvatar user={userProfile} size="lg" className="border-2 border-white shadow-md ring-2 ring-brand-500/30" />
                <label 
                  htmlFor="avatar-file-input" 
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-brand-700 active:scale-95 transition"
                  title="Upload custom photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </label>
                <input 
                  id="avatar-file-input" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      showToast('Please select an image smaller than 5MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setUserProfile(p => ({ ...p, avatar: ev.target.result }));
                        showToast('Photo selected! Tap Save to apply.');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              {/* Avatar Preset Chips */}
              <div className="w-full space-y-1.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500">Pick an avatar style or upload your own:</span>
                <div className="flex items-center justify-center gap-2 py-1 overflow-x-auto no-scrollbar">
                  {AVATAR_PRESETS.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserProfile(p => ({ ...p, avatar: presetUrl }))}
                      className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 transition-transform ${
                        userProfile.avatar === presetUrl 
                          ? 'ring-2 ring-brand-600 scale-110 shadow-xs' 
                          : 'opacity-70 hover:opacity-100 border border-slate-200'
                      }`}
                    >
                      <img src={presetUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {userProfile.avatar && (
                    <button
                      type="button"
                      onClick={() => setUserProfile(p => ({ ...p, avatar: '' }))}
                      className="px-2 py-1 rounded-full text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                      title="Clear photo"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Input 
              label="Full Name" 
              value={userProfile.name || ''} 
              onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} 
              placeholder="Your name" 
            />
            <Input 
              label="Email" 
              value={userProfile.email || ''} 
              onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} 
              placeholder="your@email.com" 
              type="email" 
            />
            <Input 
              label="Phone" 
              value={userProfile.phone || ''} 
              onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })} 
              placeholder="+91 98765 43210" 
              type="tel" 
            />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">College / Institution</label>
              <select
                value={userProfile.college || ''}
                onChange={(e) => setUserProfile({ ...userProfile, college: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none"
              >
                <option value="">Select your college</option>
                {PUNE_COLLEGES.map((c) => (
                  <option key={c.id} value={c.full}>{c.name} — {c.full}</option>
                ))}
                <option value="other">Other / Not listed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Locality in Lohegaon, Pune</label>
              <select
                value={userProfile.subLocality || ''}
                onChange={(e) => setUserProfile({ ...userProfile, subLocality: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none"
              >
                <option value="">Select your area</option>
                {LOHEGAON_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Living Type</label>
              <select
                value={userProfile.livingType || ''}
                onChange={(e) => setUserProfile({ ...userProfile, livingType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none"
              >
                <option value="">Select living type</option>
                {LIVING_TYPES.map((t) => (
                  <option key={t.id} value={t.title}>{t.title}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Bio (Optional)" 
              value={userProfile.bio || ''} 
              onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })} 
              placeholder="SST '26 • Living in Lohegaon" 
            />

            <button 
              onClick={async () => {
                setShowEditProfileModal(false);
                try {
                  await syncUserProfile(userProfile);
                  showToast('Profile updated & synced');
                } catch (err) {
                  console.warn('Profile update sync failed:', err);
                  showToast('Profile updated locally');
                }
              }}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors"
            >
              Save & Sync
            </button>
          </div>
        </Modal>

        {/* UPDATE AVAILABLE MODAL (OTA Live Bundle & Direct APK Auto-Updater) */}
        <Modal 
          isOpen={showUpdateModal} 
          onClose={() => {
            if (!appConfig?.forceUpdate) setShowUpdateModal(false);
          }} 
          showClose={!appConfig?.forceUpdate}
          title=""
          className="p-5 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-200/60">
              <span>Update Ready • v{appConfig?.latestVersion || '1.0.1'}</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">New NearlyY Release Ready</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              A newer, faster version of NearlyY is available. Installed version: <span className="font-semibold text-slate-700">v{currentAppVersion}</span>
            </p>

            {/* What's New Box */}
            <div className="w-full text-left my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-600 inline-block"></span>
                What's New in this update:
              </div>
              <div className="text-slate-600 whitespace-pre-line leading-relaxed font-normal">
                {appConfig?.changelog || "• Performance enhancements & faster loading\n• Over-the-air updates support\n• Campus vendor live sync"}
              </div>
            </div>

            {/* Status indicator if OTA downloading */}
            {isUpdatingOta && (
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 py-2">
                <LoadingSpinner size="sm" />
                <span>{otaStatusMessage || 'Downloading live update...'}</span>
              </div>
            )}

            {/* Update Actions */}
            <div className="w-full space-y-2 mt-2">
              <button 
                onClick={handleTriggerAppUpdate}
                disabled={isUpdatingOta}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{appConfig?.bundleUrl ? 'Install Instant Update' : 'Update Now (Direct APK)'}</span>
              </button>

              {!appConfig?.forceUpdate && (
                <button 
                  onClick={handleSnoozeUpdate}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Remind Me Later
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-3">
              Your student profile, bookings, and bookmarks will be kept intact.
            </p>
          </div>
        </Modal>

        {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
        {showImageLightbox && selectedItem && (() => {
          const itemImages = getItemImages(selectedItem);
          const safeImageIndex = itemImages.length > 0 
            ? ((activeImageIndex % itemImages.length) + itemImages.length) % itemImages.length 
            : 0;
          const currentPhoto = itemImages[safeImageIndex] || selectedItem.coverImage;

          const handleLightboxPrev = (e) => {
            if (e) e.stopPropagation();
            if (itemImages.length <= 1) return;
            setActiveImageIndex(prev => (prev - 1 + itemImages.length) % itemImages.length);
          };

          const handleLightboxNext = (e) => {
            if (e) e.stopPropagation();
            if (itemImages.length <= 1) return;
            setActiveImageIndex(prev => (prev + 1) % itemImages.length);
          };

          return (
            <div 
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 select-none"
              style={{ touchAction: 'pan-y' }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                touchCarouselRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
              }}
              onTouchEnd={(e) => {
                if (!touchCarouselRef.current || itemImages.length <= 1) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - touchCarouselRef.current.x;
                const dy = t.clientY - touchCarouselRef.current.y;
                const dt = Date.now() - touchCarouselRef.current.time;
                if ((Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.05) || (Math.abs(dx) > 20 && dt < 240)) {
                  if (dx < 0) {
                    handleLightboxNext();
                  } else {
                    handleLightboxPrev();
                  }
                }
                touchCarouselRef.current = null;
              }}
            >
              {/* Lightbox Header */}
              <div className="flex items-center justify-between text-white safe-top pt-2 px-1">
                <div className="min-w-0 pr-4">
                  <h3 className="text-sm font-bold text-white truncate">{selectedItem.name}</h3>
                  <p className="text-xs text-white/60">Photo {safeImageIndex + 1} of {itemImages.length}</p>
                </div>
                <button 
                  onClick={() => setShowImageLightbox(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors border border-white/10 shrink-0"
                  aria-label="Close photo viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Fullscreen Photo with Chevron Controls & Tap zones */}
              <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">
                <img 
                  src={currentPhoto} 
                  alt={selectedItem.name} 
                  className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {itemImages.length > 1 && (
                  <>
                    {/* Left Tap Zone */}
                    <div 
                      onClick={handleLightboxPrev}
                      className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
                      aria-label="Previous photo tap zone"
                    />
                    {/* Right Tap Zone */}
                    <div 
                      onClick={handleLightboxNext}
                      className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
                      aria-label="Next photo tap zone"
                    />

                    {/* Left Arrow Button */}
                    <button
                      onClick={handleLightboxPrev}
                      className="absolute left-3 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 active:scale-90 text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md z-20 transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow Button */}
                    <button
                      onClick={handleLightboxNext}
                      className="absolute right-3 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 active:scale-90 text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md z-20 transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Lightbox Bottom Thumbnails Strip */}
              {itemImages.length > 1 && (
                <div className="safe-bottom pb-2">
                  <div className="flex gap-2.5 justify-center overflow-x-auto no-scrollbar py-2 px-1">
                    {itemImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 transition-all ${
                          idx === safeImageIndex 
                            ? 'ring-2 ring-brand-500 scale-105 shadow-lg border border-transparent' 
                            : 'opacity-50 hover:opacity-100 border border-white/20'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ============================================================
// Onboarding Step Components
// ============================================================

function OnboardingWelcome({ onStart, onGoogleSignIn, isGoogleLoading }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto shadow-xs">
        <img src="/logo.png" alt="NearlyY" className="w-12 h-12 object-contain" onError={e => e.target.style.display = 'none'} />
        <span className="text-brand-700 font-bold text-4xl" style={{ display: 'none' }}>N</span>
      </div>
      <div className="space-y-2 w-full max-w-xs">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome to NearlyY</h1>
        <p className="text-base text-slate-500">Your campus life companion for Lohegaon, Pune. Mess, laundry, gym, flats & events — all in one place.</p>
      </div>
      <div className="space-y-3 w-full max-w-md pt-4">
        <button 
          onClick={onGoogleSignIn} 
          disabled={isGoogleLoading}
          className="w-full py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-3 shadow-xs disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span className="font-semibold text-slate-800 text-sm">
            {isGoogleLoading ? 'Connecting to Google…' : 'Continue with Google'}
          </span>
          {isGoogleLoading && <LoadingSpinner size="sm" />}
        </button>

        <button onClick={onStart} className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          Get Started
        </button>
      </div>
      <p className="text-xs text-slate-400 max-w-xs mx-auto">By continuing, you agree to our Terms of Service & Privacy Policy</p>
    </div>
  );
}

function OnboardingGoogleSignIn({ onGoogleSignIn, isLoading, onBack, onNext, userProfile, onUpdateProfile }) {
  const [manualName, setManualName] = useState(userProfile?.name && userProfile.name !== 'Student' ? userProfile.name : '');
  const isAlreadySignedIn = Boolean(userProfile?.email);

  return (
    <div className="flex-1 flex flex-col justify-between px-4 space-y-5 pb-6">
      <div className="pt-2">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Sign in to NearlyY</h2>
          <p className="text-xs text-slate-500">Sync your campus orders, flats & preferences</p>
        </div>
      </div>

      <div className="space-y-4">
        {isAlreadySignedIn ? (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={userProfile} size="md" className="border border-emerald-200 shadow-xs" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Account Linked</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{userProfile.name || 'Student'}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
              </div>
            </div>

            <button 
              onClick={onNext} 
              className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Campus Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onGoogleSignIn} 
              disabled={isLoading}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-1 font-medium"
            >
              Switch to a different Google account
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={onGoogleSignIn} 
              disabled={isLoading} 
              className="w-full py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-3 shadow-xs disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="font-semibold text-slate-800 text-sm">{isLoading ? 'Opening Google Sign-In…' : 'Continue with Google'}</span>
              {isLoading && <LoadingSpinner size="sm" />}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-slate-400 font-medium">or continue with name</span>
              </div>
            </div>

            <div className="space-y-2">
              <input 
                type="text" 
                value={manualName} 
                onChange={(e) => setManualName(e.target.value)} 
                placeholder="Enter your name (e.g. Rahul / Aditi)" 
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-slate-400"
              />
              <button 
                onClick={() => {
                  const finalName = manualName.trim() || 'Student';
                  onUpdateProfile({ name: finalName });
                  onNext();
                }} 
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Continue as Student</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="text-center pt-2">
        <button onClick={onNext} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
          Skip for now →
        </button>
      </div>
    </div>
  );
}

function OnboardingCollege({ colleges, selectedCollege, onSelect, onNext, onBack }) {
  return (
    <div className="flex-1 flex flex-col justify-between px-4 space-y-6">
      <div className="pt-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Which college?</h2>
          <p className="text-sm text-slate-500">Helps us show the right services near you</p>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[50vh]">
        {colleges.map((college) => (
          <button
            key={college.id}
            onClick={() => onSelect(college.full)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${selectedCollege === college.full ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{college.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{college.full}</p>
              </div>
              <Badge variant={selectedCollege === college.full ? 'primary' : 'outline'} className="text-xs">{college.tag}</Badge>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button onClick={onNext} disabled={!selectedCollege} className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Continue
        </button>
      </div>
    </div>
  );
}

function OnboardingLivingType({ types, selectedType, onSelect, onNext, onBack }) {
  return (
    <div className="flex-1 flex flex-col justify-between px-4 space-y-6">
      <div className="pt-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Where do you stay?</h2>
          <p className="text-sm text-slate-500">Pick the type that matches your living situation</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-4 rounded-xl border text-center transition-all ${selectedType === type.id ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <type.icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-slate-900">{type.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{type.desc}</p>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button onClick={onNext} disabled={!selectedType} className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Continue
        </button>
      </div>
    </div>
  );
}

function OnboardingLocality({ localities, selectedLocality, onSelect, onNext, onBack }) {
  return (
    <div className="flex-1 flex flex-col justify-between px-4 space-y-6">
      <div className="pt-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Your area in Lohegaon</h2>
          <p className="text-sm text-slate-500">Helps nearby vendors find you faster</p>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[50vh]">
        {localities.map((loc) => (
          <button
            key={loc}
            onClick={() => onSelect(loc)}
            className={`w-full p-4 rounded-xl border text-left transition-all ${selectedLocality === loc ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-900">{loc}</span>
              </div>
              {selectedLocality === loc && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button onClick={onNext} disabled={!selectedLocality} className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Continue
        </button>
      </div>
    </div>
  );
}

function OnboardingInterests({ services, interests, onToggle, onNext, onBack, onSkip }) {
  return (
    <div className="flex-1 flex flex-col justify-between px-4 space-y-6 pb-16">
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-6 h-1.5 rounded-full bg-brand-600" />
          </div>
          <button onClick={onSkip} className="text-xs font-medium text-slate-400 hover:text-slate-600">Skip</button>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">What are you interested in?</h2>
          <p className="text-sm text-slate-500">Choose the services you need in Lohegaon</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar max-h-[50vh] pt-2">
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => onToggle(svc.id)}
            className={`p-4 rounded-xl border flex flex-col justify-between h-32 cursor-pointer transition-all ${interests.includes(svc.id) ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <svc.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900 text-sm">{svc.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{svc.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button onClick={onNext} className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}

function OnboardingBio({ bio, onChange, onFinish, onBack }) {
  return (
    <div className="flex-1 flex flex-col justify-between px-4 space-y-6 pb-16">
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="w-6 h-1.5 rounded-full bg-brand-600" />
          </div>
          <div className="w-20" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">Tell us about yourself</h2>
          <p className="text-sm text-slate-500">Optional — helps personalize your experience</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <textarea
          value={bio}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. SST '26 • Living in Lohegaon • Love cricket & coffee"
          className="w-full min-h-[100px] px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-slate-400 text-center">This will be visible on your public profile</p>
      </div>

      <div className="pt-4">
        <button onClick={onFinish} className="sticky-cta w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-brand hover:bg-brand-700 active:bg-brand-800 transition-colors">
          Finish & Start Exploring
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Dashboard Components
// ============================================================

function UserAvatar({ user, size = 'md', className = '', onClick }) {
  const [imgError, setImgError] = useState(false);
  const name = user?.name || 'Student';
  const initial = (name.charAt(0) || 'S').toUpperCase();
  const avatarUrl = !imgError ? (user?.avatar || user?.photoURL || user?.photoUrl) : null;

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px] rounded-lg',
    sm: 'w-9 h-9 text-xs rounded-xl',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-16 h-16 text-xl rounded-2xl',
    xl: 'w-24 h-24 text-3xl rounded-3xl'
  }[size] || 'w-10 h-10 text-sm rounded-xl';

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden shrink-0 flex items-center justify-center font-bold select-none ${sizeClasses} ${
        avatarUrl ? 'bg-slate-100' : 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xs'
      } ${className}`}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

function PopularItemCard({ item, onPress }) {
  const itemImages = item.images || (item.coverImage ? [item.coverImage] : []);
  const isParty = item.category === 'parties';

  return (
    <button onClick={onPress} className="w-full rounded-2xl bg-white border border-slate-100 shadow-xs overflow-hidden hover:shadow-md hover:border-brand-200 active:scale-[0.99] transition-all flex flex-col text-left">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img src={itemImages[0] || 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=400&auto=format&fit=crop&q=60'} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
        
        {isParty && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {item.timeLeft || 'Featured Event'}
          </span>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
          <span className="bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-1" />
            {item.rating} ({item.reviewsCount})
          </span>
          {itemImages.length > 1 && (
            <span className="bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ImageIcon className="w-2.5 h-2.5" />
              {itemImages.length}
            </span>
          )}
        </div>
      </div>
      <div className="p-3.5 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 leading-snug flex-1">{item.name}</h4>
          <span className="text-xs font-black text-brand-600 whitespace-nowrap shrink-0 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
            {item.priceDisplay || 'From ₹399'}
          </span>
        </div>
        {item.dateTime && (
          <p className="text-xs font-semibold text-pink-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {item.dateTime}
          </p>
        )}
        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {item.venue || item.locality || LOCALITY}
        </p>
      </div>
    </button>
  );
}

function CardThumbnail({ item }) {
  const [hasError, setHasError] = useState(false);
  const images = getItemImages(item);
  const initialUrl = images[0];

  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'flats':
        return { icon: Home, bg: 'from-blue-50 to-indigo-100 text-blue-600 border-blue-200/50', label: 'Flats & PG' };
      case 'mess':
        return { icon: UtensilsCrossed, bg: 'from-amber-50 to-orange-100 text-orange-600 border-amber-200/50', label: 'Mess' };
      case 'laundry':
        return { icon: Shirt, bg: 'from-cyan-50 to-sky-100 text-cyan-600 border-cyan-200/50', label: 'Laundry' };
      case 'gym':
        return { icon: Dumbbell, bg: 'from-emerald-50 to-teal-100 text-emerald-600 border-emerald-200/50', label: 'Gym' };
      case 'parties':
        return { icon: Sparkles, bg: 'from-pink-50 to-purple-100 text-pink-600 border-pink-200/50', label: 'Events' };
      default:
        return { icon: MapPin, bg: 'from-purple-50 to-indigo-100 text-brand-600 border-purple-200/50', label: 'Local' };
    }
  };

  const theme = getCategoryTheme(item.category);
  const IconComp = theme.icon;

  if (hasError || !initialUrl) {
    return (
      <div className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${theme.bg} border flex flex-col items-center justify-center p-2 text-center shadow-xs`}>
        <IconComp className="w-6 h-6 mb-1 opacity-90" />
        <span className="text-[9px] font-bold tracking-tight uppercase leading-tight">{theme.label}</span>
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100/90 shadow-xs">
      <img 
        src={initialUrl} 
        alt="" 
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
        loading="lazy" 
        onError={() => setHasError(true)}
      />
      {images.length > 1 && (
        <span className="absolute bottom-1 right-1 bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <ImageIcon className="w-2.5 h-2.5" />
          {images.length}
        </span>
      )}
    </div>
  );
}

function ServiceCard({ item, onPress }) {
  return (
    <button onClick={onPress} className="service-card w-full text-left p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-xs hover:border-brand-200 hover:shadow-md active:scale-[0.99] transition-all flex items-center gap-3.5">
      <CardThumbnail item={item} />
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{item.name}</h4>
            <span className="text-sm font-black text-brand-600 whitespace-nowrap shrink-0">
              {item.priceDisplay || (item.category === 'flats' ? `₹${item.price || 6500}/mo` : item.category === 'mess' ? '₹90/thali' : item.category === 'laundry' ? '₹80/kg' : item.category === 'gym' ? '₹999/mo' : 'Contact')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            {item.venue || item.locality || 'Lohegaon, Pune'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 pt-2 flex-wrap">
          {item.verified !== false && <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Verified</Badge>}
          {item.tags && item.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0.5 text-slate-600 border-slate-200">{tag}</Badge>
          ))}
          {(!item.tags || item.tags.length === 0) && item.sharing && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-slate-600 border-slate-200">{item.sharing}</Badge>
          )}
        </div>
      </div>
    </button>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="text-center py-3">
      <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  );
}

function SettingsRow({ icon: Icon, title, subtitle, variant = 'default', onPress }) {
  return (
    <button onClick={onPress} className={`w-full flex items-center gap-3 p-3 rounded-xl ${variant === 'danger' ? 'hover:bg-red-50' : 'hover:bg-slate-50'} active:bg-slate-100 transition-colors text-left`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${variant === 'danger' ? 'text-red-600' : 'text-slate-900'}`}>{title}</p>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}