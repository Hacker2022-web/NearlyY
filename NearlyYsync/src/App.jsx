import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { 
  UtensilsCrossed, Shirt, Dumbbell, Home, Plus, Search, Filter, 
  Trash2, Edit3, CheckCircle2, AlertCircle, Clock, MapPin, Phone, 
  MessageCircle, ExternalLink, RefreshCw, Zap, Shield, Users, 
  Calendar, Star, ChevronRight, X, ArrowUpRight, Check, Eye,
  SlidersHorizontal, Smartphone, Monitor, UploadCloud, Image as ImageIcon,
  Info, ChevronLeft, Sparkles
} from 'lucide-react';
import { 
  subscribeToServices, fetchServicesFromFirebase, addServiceListing, updateServiceListing, 
  deleteServiceListing, subscribeToIncomingBookings, updateBookingStatus, 
  subscribeToInquiries, subscribeToUsers, seedAllDefaultServices 
} from './firebase';

const LOHEGAON_AREAS = [
  'Porwal Road, Lohegaon',
  'Near Airforce Station, Lohegaon',
  'Lohegaon Chowk / Market',
  'Sant Nagar / Dhanori Road',
  'Dadachi Vasti, Lohegaon'
];

const getMenuText = (val) => {
  if (!val) return 'Daily Special';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.name) return val.name;
  return String(val);
};

// Helper: Safely resolve all images as an array
const getItemImages = (item) => {
  if (!item) return [];
  if (Array.isArray(item.images) && item.images.length > 0) return item.images.filter(Boolean);
  if (Array.isArray(item.gallery) && item.gallery.length > 0) return [item.coverImage, ...item.gallery].filter(Boolean);
  if (item.coverImage) return [item.coverImage];
  if (item.image) return [item.image];
  return ['https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80'];
};

// Helper: Compress images on client canvas to stay well within Firestore doc size limit (~40KB each)
const compressImageFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = () => resolve('');
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'bookings', 'inquiries', 'users'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' or 'desktop'
  
  // Real-time Firestore states
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('Live Synced 🟢');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(null); // specific mess item

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'mess',
    locality: 'Porwal Road, Lohegaon',
    distance: '0.5 km away',
    phone: '919876543210',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
    images: [],
    rating: 4.8,
    reviewsCount: '240',
    priceDisplay: '₹2,000 / mo',
    dietType: 'Pure Veg',
    lunchMenu: 'Paneer Butter Masala + Roti + Rice',
    dinnerMenu: 'Veg Dum Biryani + Raita',
    singleThaliPrice: 90,
    monthlyPrice: 2000,
    laundryPerKg: 80,
    laundryExpress: true,
    gymMonthly: 999,
    gymAC: true,
    flatRent: 6500,
    flatDeposit: 5000,
    flatSharing: 'Double Sharing',
    eventVenue: '',
    eventDateTime: 'Saturday • 8:00 PM',
    eventGenre: 'Bollywood Commercial + EDM',
    eventOrganizer: 'Campus Events',
    eventStartingPrice: 399
  });

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Today's Menu Edit State
  const [menuForm, setMenuForm] = useState({ lunch: '', dinner: '' });

  // Subscriptions to Firebase collections
  useEffect(() => {
    const unsubServices = subscribeToServices((data) => {
      setServices(data);
      setSyncStatus('Live Synced 🟢');
    });

    const unsubBookings = subscribeToIncomingBookings((data) => {
      setBookings(data);
    });

    const unsubInquiries = subscribeToInquiries((data) => {
      setInquiries(data);
    });

    const unsubUsers = subscribeToUsers((data) => {
      setUsers(data);
    });

    return () => {
      unsubServices && unsubServices();
      unsubBookings && unsubBookings();
      unsubInquiries && unsubInquiries();
      unsubUsers && unsubUsers();
    };
  }, []);

  // GSAP: Animate listing cards on tab or category switch
  useEffect(() => {
    gsap.fromTo('.sync-listing-card',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32, stagger: 0.03, ease: 'power2.out' }
    );
  }, [activeTab, categoryFilter, services.length]);

  // GSAP: Animate sync toast notifications
  useEffect(() => {
    if (toastMessage) {
      gsap.fromTo('.sync-toast-pill',
        { y: -20, scale: 0.9, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.28, ease: 'back.out(1.6)' }
      );
    }
  }, [toastMessage]);

  // GSAP: Animate modal slide-up
  useEffect(() => {
    if (showAddModal) {
      gsap.fromTo('.sync-modal-sheet',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [showAddModal]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTempImageUrl('');
    setFormData({
      name: '',
      category: 'mess',
      locality: 'Porwal Road, Lohegaon',
      distance: '0.4 km away',
      phone: '919876543210',
      description: 'Hygienic, homestyle daily services for students & bachelors in Lohegaon. Located within walking distance of college campuses with verified quality standards.',
      coverImage: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
      ],
      rating: 4.8,
      reviewsCount: '150',
      priceDisplay: '₹2,000 / mo',
      dietType: 'Pure Veg',
      lunchMenu: 'Paneer Butter Masala + Phulkas + Jeera Rice',
      dinnerMenu: 'Veg Pulao + Dal Tadka + Sweet',
      singleThaliPrice: 90,
      monthlyPrice: 2000,
      laundryPerKg: 80,
      laundryExpress: true,
      gymMonthly: 999,
      gymAC: true,
      flatRent: 6500,
      flatDeposit: 5000,
      flatSharing: 'Double Sharing'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTempImageUrl('');
    const existingImages = getItemImages(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'mess',
      locality: item.locality || 'Porwal Road, Lohegaon',
      distance: item.distance || '0.5 km away',
      phone: item.phone || '919876543210',
      description: item.description || '',
      coverImage: existingImages[0] || item.coverImage || item.image || '',
      images: existingImages,
      rating: item.rating || 4.7,
      reviewsCount: item.reviewsCount || '100',
      priceDisplay: item.priceDisplay || '',
      dietType: item.dietType || 'Pure Veg',
      lunchMenu: getMenuText(item.todayMenu?.lunch),
      dinnerMenu: getMenuText(item.todayMenu?.dinner),
      singleThaliPrice: item.pricing?.[0]?.price || 90,
      monthlyPrice: item.pricing?.[2]?.price || 2000,
      laundryPerKg: item.perKgRates?.[0]?.price || 80,
      laundryExpress: !!item.badge?.includes('24h'),
      gymMonthly: item.plans?.[0]?.price || 999,
      gymAC: true,
      flatRent: item.price || 6500,
      flatDeposit: item.deposit || 5000,
      flatSharing: item.sharing || 'Double Sharing',
      eventVenue: item.venue || '',
      eventDateTime: item.dateTime || 'Saturday • 8:00 PM',
      eventGenre: item.genre || 'Bollywood + EDM',
      eventOrganizer: item.organizer || '',
      eventStartingPrice: item.startingPrice || 399
    });
    setShowAddModal(true);
  };

  // Multiple File Upload Handler (with canvas-based client compression)
  const handleImageFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImages(true);
    showToast(`Processing ${files.length} photo(s)...`);

    try {
      const compressedList = [];
      for (const file of files) {
        const compressed = await compressImageFile(file);
        if (compressed) compressedList.push(compressed);
      }
      const updatedList = [...formData.images, ...compressedList];
      setFormData(prev => ({
        ...prev,
        images: updatedList,
        coverImage: updatedList[0] || prev.coverImage
      }));
      showToast(`Added ${compressedList.length} photo(s)!`);
    } catch (err) {
      console.error('Image compression error:', err);
      showToast('Could not process images');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  // Add Image via URL
  const handleAddUrlImage = () => {
    const url = tempImageUrl.trim();
    if (!url) return;
    const updatedList = [...formData.images, url];
    setFormData(prev => ({
      ...prev,
      images: updatedList,
      coverImage: updatedList[0] || prev.coverImage
    }));
    setTempImageUrl('');
    showToast('Photo URL added!');
  };

  // Remove individual photo
  const handleRemoveImage = (indexToRemove) => {
    const updated = formData.images.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({
      ...prev,
      images: updated,
      coverImage: updated[0] || ''
    }));
    showToast('Photo removed');
  };

  // Set selected photo as primary cover
  const handleSetPrimaryImage = (indexToPrimary) => {
    if (indexToPrimary === 0) return;
    const item = formData.images[indexToPrimary];
    const remaining = formData.images.filter((_, idx) => idx !== indexToPrimary);
    const updated = [item, ...remaining];
    setFormData(prev => ({
      ...prev,
      images: updated,
      coverImage: item
    }));
    showToast('Set as cover photo! ⭐');
  };

  const handleSaveListing = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter vendor name');

    const finalImages = formData.images && formData.images.length > 0 
      ? formData.images 
      : (formData.coverImage ? [formData.coverImage] : ['https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80']);
    const primaryCover = finalImages[0];

    let payload = {
      name: formData.name,
      category: formData.category,
      locality: formData.locality,
      distance: formData.distance,
      phone: formData.phone,
      description: formData.description || '',
      coverImage: primaryCover,
      image: primaryCover,
      images: finalImages,
      rating: Number(formData.rating) || 4.7,
      reviewsCount: formData.reviewsCount,
      priceDisplay: formData.priceDisplay
    };

    if (formData.category === 'mess') {
      payload = {
        ...payload,
        dietType: formData.dietType,
        pricing: [
          { type: 'Single Thali', price: Number(formData.singleThaliPrice), note: '/per meal' },
          { type: '15-Day Pass', price: Number(formData.singleThaliPrice) * 14, note: 'save ₹100' },
          { type: '30-Day Pass', price: Number(formData.monthlyPrice), note: 'save ₹400' }
        ],
        todayMenu: {
          lunch: formData.lunchMenu,
          dinner: formData.dinnerMenu
        }
      };
    } else if (formData.category === 'laundry') {
      payload = {
        ...payload,
        badge: formData.laundryExpress ? '⚡ 24h Express' : 'Standard Pickup',
        perKgRates: [
          { name: 'Wash & Fold', price: Number(formData.laundryPerKg) },
          { name: 'Wash & Steam Iron', price: Number(formData.laundryPerKg) + 20 }
        ]
      };
    } else if (formData.category === 'gym') {
      payload = {
        ...payload,
        plans: [
          { title: 'Monthly', price: Number(formData.gymMonthly) },
          { title: '3 Months', price: Math.round(Number(formData.gymMonthly) * 2.6) }
        ],
        facilities: [
          { name: formData.gymAC ? 'Air Conditioned' : 'Standard Gym' },
          { name: 'Certified Trainers' },
          { name: 'Cardio & Strength' }
        ]
      };
    } else if (formData.category === 'flats') {
      payload = {
        ...payload,
        price: Number(formData.flatRent),
        deposit: Number(formData.flatDeposit),
        sharing: formData.flatSharing
      };
    } else if (formData.category === 'parties') {
      payload = {
        ...payload,
        venue: formData.eventVenue || formData.locality,
        dateTime: formData.eventDateTime || 'Saturday • 8:00 PM',
        genre: formData.eventGenre || 'Bollywood + EDM',
        organizer: formData.eventOrganizer || 'Campus Events Partner',
        startingPrice: Number(formData.eventStartingPrice) || 399,
        priceDisplay: formData.priceDisplay || `Passes from ₹${formData.eventStartingPrice || 399}`,
        tags: [formData.eventGenre || 'Party', 'College ID Mandatory', 'Student Passes'],
        pricing: [
          { type: 'Early Bird Stag', price: Number(formData.eventStartingPrice) || 399, note: 'Entry pass', save: 'Selling Fast' },
          { type: 'Couple Entry', price: Math.round(Number(formData.eventStartingPrice || 399) * 1.75), note: 'Couple access', save: 'Save ₹100' }
        ],
        rules: [
          'College ID mandatory at gate',
          'Strictly 18+ only'
        ]
      };
    }

    if (editingItem) {
      await updateServiceListing(editingItem.id, payload);
      showToast(`Updated "${formData.name}" in real-time!`);
    } else {
      await addServiceListing(payload);
      showToast(`Published "${formData.name}" to NearlyY!`);
    }

    setShowAddModal(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from NearlyY?`)) {
      await deleteServiceListing(item.id);
      showToast(`Removed "${item.name}" from cloud catalog.`);
    }
  };

  const handleOpenMenuQuickEdit = (item) => {
    setShowMenuModal(item);
    setMenuForm({
      lunch: getMenuText(item.todayMenu?.lunch) || 'Paneer Butter Masala + Phulkas + Rice',
      dinner: getMenuText(item.todayMenu?.dinner) || 'Veg Dum Biryani + Raita'
    });
  };

  const handleSaveMenu = async () => {
    if (!showMenuModal) return;
    await updateServiceListing(showMenuModal.id, {
      todayMenu: {
        lunch: menuForm.lunch,
        dinner: menuForm.dinner
      }
    });
    showToast(`Today's menu updated for ${showMenuModal.name}! ⚡`);
    setShowMenuModal(null);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    await updateBookingStatus(bookingId, newStatus);
    showToast(`Order status updated to: ${newStatus}`);
  };

  const handleReseed = async () => {
    if (window.confirm('Reset/Re-seed all 13 standard Lohegaon vendor listings into Firebase?')) {
      await seedAllDefaultServices();
      showToast('Successfully re-seeded all listings in Firebase!');
    }
  };

  // Filter listings
  const filteredServices = services.filter((item) => {
    if (!item) return false;
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const name = String(item.name || '').toLowerCase();
    const loc = String(item.locality || '').toLowerCase();
    const q = String(searchQuery || '').toLowerCase();
    const matchesSearch = name.includes(q) || loc.includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F0EEFA] text-slate-800 antialiased flex flex-col items-center justify-center p-0 sm:p-4 font-sans selection:bg-[#EAE5FF] selection:text-[#5128E8]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-[999] bg-[#5128E8] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center space-x-2 sync-toast-pill border border-white/20">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Container: Auto-adapts to phones, foldables, tablets, and desktop displays */}
      <div className="w-full h-[100dvh] md:h-[94vh] md:max-h-[940px] max-w-full md:max-w-4xl lg:max-w-5xl bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 md:border md:border-slate-200/80">
        
        {/* Header */}
        <div className="bg-white px-5 py-3 sync-header border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_4px_12px_rgba(81,40,232,0.22)] bg-transparent shrink-0">
              <img 
                src="/logo-sync.png" 
                alt="NearlyYsync Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                }} 
              />
              <span className="hidden w-full h-full bg-[#5128E8] text-white font-black text-xs items-center justify-center rounded-2xl">NYS</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">NearlyY<span className="text-[#5128E8]">sync</span></h1>
                <span className="text-[9px] bg-[#EAE5FF] text-[#5128E8] font-extrabold px-1.5 py-0.2 rounded-full uppercase">Vendor</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Control Hub • Lohegaon</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleOpenAdd}
              className="flex items-center space-x-1 bg-[#5128E8] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md shadow-[#5128E8]/20 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Live Cloud Connection Status Bar */}
        <div className="bg-[#F8FAFC] px-4 py-1.5 border-b border-slate-200/80 flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center space-x-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Cloud Database Active</span>
          </div>
          <button 
            onClick={async () => {
              try {
                await seedAllDefaultServices();
                const fresh = await fetchServicesFromFirebase();
                if (fresh && fresh.length > 0) setServices(fresh);
                showToast('Synced all listings with NearlyY Cloud! ⚡');
              } catch (e) {
                showToast('Sync completed');
              }
            }} 
            className="text-[10px] text-[#5128E8] hover:text-[#421DC7] flex items-center space-x-1 font-bold active:scale-95 transition-transform"
            title="Sync and refresh all listings with Cloud"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Cloud</span>
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-4 gap-1 p-3 bg-white border-b border-slate-100 text-center">
          <div onClick={() => setActiveTab('listings')} className={`p-1.5 rounded-xl cursor-pointer ${activeTab === 'listings' ? 'bg-[#EAE5FF]' : 'hover:bg-slate-50'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">Listings</span>
            <span className="text-sm font-black text-slate-900">{services.length}</span>
          </div>
          <div onClick={() => setActiveTab('bookings')} className={`p-1.5 rounded-xl cursor-pointer ${activeTab === 'bookings' ? 'bg-[#EAE5FF]' : 'hover:bg-slate-50'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">Orders</span>
            <span className="text-sm font-black text-[#5128E8]">{bookings.length}</span>
          </div>
          <div onClick={() => setActiveTab('inquiries')} className={`p-1.5 rounded-xl cursor-pointer ${activeTab === 'inquiries' ? 'bg-[#EAE5FF]' : 'hover:bg-slate-50'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">Leads</span>
            <span className="text-sm font-black text-slate-900">{inquiries.length}</span>
          </div>
          <div onClick={() => setActiveTab('users')} className={`p-1.5 rounded-xl cursor-pointer ${activeTab === 'users' ? 'bg-[#EAE5FF]' : 'hover:bg-slate-50'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">Users</span>
            <span className="text-sm font-black text-slate-900">{users.length}</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN SCROLLABLE APP BODY                                     */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-20 bg-[#F7F5FF]">
          
          {/* TAB 1: LISTINGS CATALOG */}
          {activeTab === 'listings' && (
            <div className="space-y-3">
              {/* Search & Category Pills */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your listings in Lohegaon..."
                    className="w-full pl-8 pr-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#5128E8] shadow-xs"
                  />
                </div>

                <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'mess', label: '🍲 Mess' },
                    { id: 'laundry', label: '👕 Laundry' },
                    { id: 'gym', label: '🏋️ Gym' },
                    { id: 'flats', label: '🏡 Flats/PG' },
                    { id: 'parties', label: '🎉 Parties' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCategoryFilter(c.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                        categoryFilter === c.id 
                          ? 'bg-[#5128E8] text-white shadow-xs' 
                          : 'bg-white border text-slate-600'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Cards List */}
              <div className="space-y-3">
                {filteredServices.map((item) => {
                  const itemImages = getItemImages(item);
                  return (
                    <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between sync-listing-card">
                      <div>
                        <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                          <img src={itemImages[0] || item.coverImage} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-[#5128E8] shadow-xs">
                            {item.category}
                          </span>

                          {/* Multi-photo indicator badge */}
                          {itemImages.length > 1 && (
                            <span className="absolute top-2.5 right-2.5 bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-xs">
                              <ImageIcon className="w-2.5 h-2.5 mr-1 text-[#EAE5FF]" />
                              {itemImages.length} photos
                            </span>
                          )}

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                            <span className="bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-1" />
                              {item.rating} ({item.reviewsCount})
                            </span>
                            <span className="bg-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              ● Live in App
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-black text-slate-900 leading-tight">{item.name}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center">
                                <MapPin className="w-3 h-3 text-[#5128E8] mr-0.5" />
                                {item.locality}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-[#5128E8]">
                              {item.priceDisplay || (item.category === 'flats' ? `₹${item.price}/mo` : item.category === 'mess' ? '₹90/thali' : item.category === 'laundry' ? '₹80/kg' : item.category === 'parties' ? 'From ₹399' : '₹999/mo')}
                            </span>
                          </div>

                          {/* Party & Gig Details Highlight */}
                          {item.category === 'parties' && (
                            <div className="bg-pink-50/80 p-2.5 rounded-xl border border-pink-100 text-[10px] space-y-1">
                              {item.dateTime && (
                                <p className="font-bold text-pink-900 flex items-center">
                                  <Calendar className="w-3 h-3 text-pink-600 mr-1" />
                                  {item.dateTime}
                                </p>
                              )}
                              {item.venue && (
                                <p className="text-slate-600 font-medium truncate">Venue: <strong className="text-slate-800">{item.venue}</strong></p>
                              )}
                              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-pink-100 text-[9px]">
                                {item.infoline && (
                                  <span className="bg-slate-900 text-white font-bold px-2 py-0.5 rounded-md flex items-center">
                                    📞 Infoline: {item.infoline}
                                  </span>
                                )}
                                {item.instagramHandle && (
                                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center">
                                    📸 {item.instagramHandle}
                                  </span>
                                )}
                                <span className="bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.5 rounded">
                                  SHAADI FITS ONLY
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Description Snippet */}
                          {item.description && (
                            <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
                              {item.description}
                            </p>
                          )}

                          {/* Mess Today's Menu Highlight */}
                          {item.category === 'mess' && item.todayMenu && (
                            <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#5128E8]/10 text-[10px] space-y-1">
                              <div className="flex justify-between font-bold text-slate-700">
                                <span>Lunch:</span>
                                <span className="text-[#5128E8] font-semibold truncate max-w-[170px]">{getMenuText(item.todayMenu.lunch)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-slate-700">
                                <span>Dinner:</span>
                                <span className="text-[#5128E8] font-semibold truncate max-w-[170px]">{getMenuText(item.todayMenu.dinner)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between mt-1">
                      {item.category === 'mess' && (
                        <button 
                          onClick={() => handleOpenMenuQuickEdit(item)}
                          className="text-[10px] font-extrabold text-[#5128E8] bg-[#EAE5FF] hover:bg-[#5128E8] hover:text-white px-2.5 py-1.5 rounded-xl transition-all"
                        >
                          🍱 Edit Today's Menu
                        </button>
                      )}

                      <div className="flex items-center space-x-1 ml-auto">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-[#5128E8] hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* TAB 2: INCOMING ORDERS & BOOKINGS (REAL TIME FROM NEARLYY APP) */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Customer Orders</h3>
                <span className="text-[10px] font-bold bg-[#EAE5FF] text-[#5128E8] px-2 py-0.5 rounded-full">
                  {bookings.length} Total
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="text-xs font-bold text-slate-700">No active bookings yet</h4>
                  <p className="text-[10px]">When a user books in NearlyY (port 3000), it lands right here in real time!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-xs space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#EAE5FF] text-[#5128E8] flex items-center justify-center font-bold shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">{b.title}</h4>
                            <p className="text-[10px] text-slate-500">{b.service}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full capitalize">
                          {b.status || 'Confirmed'}
                        </span>
                      </div>

                      <div className="bg-[#F8FAFC] p-2 rounded-xl text-[10px] space-y-0.5 text-slate-600">
                        <p><span className="font-bold text-slate-800">Student:</span> {b.userName || 'Resident'} ({b.userCollege || 'ADYPU'})</p>
                        <p><span className="font-bold text-slate-800">Area:</span> {b.locality || 'Porwal Road, Lohegaon'}</p>
                        <p><span className="font-bold text-slate-800">Booked:</span> {new Date(b.createdAt || Date.now()).toLocaleTimeString()}</p>
                      </div>

                      {/* Status Changer & WhatsApp Button */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <select 
                          value={b.status || 'confirmed'}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-800"
                        >
                          <option value="confirmed">Confirmed 🟢</option>
                          <option value="in_progress">In Progress 🟡</option>
                          <option value="delivered">Delivered 🔵</option>
                          <option value="cancelled">Cancelled 🔴</option>
                        </select>

                        <a 
                          href={`https://wa.me/${(b.phone || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${b.userName || 'there'}, regarding your NearlyY order for ${b.title}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[10px] flex items-center space-x-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEADS & INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Chat Inquiries & Leads</h3>
                <span className="text-[10px] font-bold bg-[#EAE5FF] text-[#5128E8] px-2 py-0.5 rounded-full">
                  {inquiries.length} Leads
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
                  <p className="text-xs font-bold text-slate-600">No chat inquiries yet</p>
                  <p className="text-[10px] mt-1">When students tap Chat in NearlyY, inquiries appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold bg-[#EAE5FF] text-[#5128E8] px-2 py-0.5 rounded-full">
                          {inq.source || 'App Chat'}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(inq.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{inq.userName || 'Student'}</h4>
                      <p className="text-[10px] text-slate-500">{inq.userEmail}</p>
                      <p className="text-[10px] text-slate-600 italic">"{inq.note || (inq.wantsEarlyAccess ? 'Wants notification when chat launches' : 'Inquired via app')}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REGISTERED RESIDENTS */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Registered Residents</h3>
                <span className="text-[10px] font-bold bg-[#EAE5FF] text-[#5128E8] px-2 py-0.5 rounded-full">
                  {users.length} Users
                </span>
              </div>

              <div className="space-y-2">
                {users.map((u, i) => (
                  <div key={u.id || i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EAE5FF] text-[#5128E8] font-black text-xs flex items-center justify-center">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                        <p className="text-[10px] text-slate-400">{u.college || 'ADYPU'} • {u.livingType || 'PG'}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {u.subLocality?.split(',')[0] || 'Lohegaon'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================ */}
        {/* MOBILE BOTTOM NAVIGATION BAR                                 */}
        {/* ============================================================ */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 flex items-center justify-between z-40">
          <button 
            onClick={() => setActiveTab('listings')} 
            className={`flex flex-col items-center text-[10px] font-bold ${activeTab === 'listings' ? 'text-[#5128E8]' : 'text-slate-400'}`}
          >
            <Home className="w-5 h-5" />
            <span>Catalog</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`flex flex-col items-center text-[10px] font-bold ${activeTab === 'bookings' ? 'text-[#5128E8]' : 'text-slate-400'} relative`}
          >
            <Calendar className="w-5 h-5" />
            <span>Orders</span>
            {bookings.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#5128E8] absolute top-0 right-1 border border-white"></span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('inquiries')} 
            className={`flex flex-col items-center text-[10px] font-bold ${activeTab === 'inquiries' ? 'text-[#5128E8]' : 'text-slate-400'}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Leads</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex flex-col items-center text-[10px] font-bold ${activeTab === 'users' ? 'text-[#5128E8]' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* MODAL: QUICK EDIT TODAY'S MENU FOR MESS                        */}
      {/* ============================================================ */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="text-sm font-black text-slate-900">Update Today's Menu</h3>
                <p className="text-[11px] text-slate-500">{showMenuModal.name}</p>
              </div>
              <button onClick={() => setShowMenuModal(null)} className="p-1 rounded-full bg-slate-100">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-700">Lunch Special</label>
                <input 
                  type="text" 
                  value={menuForm.lunch} 
                  onChange={(e) => setMenuForm({ ...menuForm, lunch: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala + Roti + Rice"
                  className="w-full p-2.5 rounded-xl border"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Dinner Special</label>
                <input 
                  type="text" 
                  value={menuForm.dinner} 
                  onChange={(e) => setMenuForm({ ...menuForm, dinner: e.target.value })}
                  placeholder="e.g. Veg Dum Biryani + Raita"
                  className="w-full p-2.5 rounded-xl border"
                />
              </div>

              <p className="text-[10px] text-slate-400">
                ⚡ Once saved, this refreshes instantly on the student app in real time!
              </p>

              <button 
                onClick={handleSaveMenu}
                className="w-full py-3 rounded-2xl bg-[#5128E8] text-white font-bold text-xs shadow-md"
              >
                Sync Menu Live to NearlyY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT LISTING                                     */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar space-y-4 sync-modal-sheet">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="text-sm font-black text-slate-900">{editingItem ? 'Edit Listing' : 'Add New Listing'}</h3>
                <p className="text-[10px] text-slate-400">Publishes live to NearlyY</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full bg-slate-100">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveListing} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-700">Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 rounded-xl border bg-white"
                >
                  <option value="mess">🍲 Mess & Tiffin</option>
                  <option value="laundry">👕 Laundry & Dry Cleaning</option>
                  <option value="gym">🏋️ Gym & Fitness</option>
                  <option value="flats">🏡 Flats & PG</option>
                  <option value="parties">🎉 Parties & Campus Events</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Vendor / Place Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Annapurna Mess"
                  className="w-full p-2.5 rounded-xl border"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Locality in Lohegaon</label>
                <select 
                  value={formData.locality} 
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="w-full p-2 rounded-xl border bg-white"
                >
                  {LOHEGAON_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Phone / WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="919876543210"
                  className="w-full p-2.5 rounded-xl border"
                />
              </div>

              {/* DESCRIPTION & HIGHLIGHTS */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold flex items-center">
                    <Info className="w-3.5 h-3.5 text-[#5128E8] mr-1" />
                    Description & Highlights
                  </label>
                  <span className="text-[10px] text-slate-400 font-normal">Shown to students</span>
                </div>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your offerings, cleanliness/hygiene standards, special amenities, distance from DY Patil/Airforce Station, timings, etc."
                  className="w-full p-2.5 rounded-xl border text-xs text-slate-800 leading-relaxed focus:border-[#5128E8] focus:outline-none bg-white"
                />
              </div>

              {/* MULTIPLE IMAGES UPLOAD & MANAGEMENT SECTION */}
              <div className="space-y-2 p-3 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold text-xs flex items-center">
                    <ImageIcon className="w-3.5 h-3.5 text-[#5128E8] mr-1" />
                    Listing Photos & Gallery
                  </label>
                  <span className="text-[10px] font-extrabold bg-[#EAE5FF] text-[#5128E8] px-2 py-0.5 rounded-full">
                    {formData.images.length} Photos
                  </span>
                </div>

                {/* Upload Multiple Files from Device / Mobile Gallery */}
                <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#5128E8]/30 rounded-2xl bg-white hover:bg-[#F7F5FF] cursor-pointer transition-all group">
                  <UploadCloud className="w-6 h-6 text-[#5128E8] mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 text-center">
                    {isUploadingImages ? 'Optimizing & Adding Photos...' : 'Tap to Upload Multiple Photos'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 text-center">
                    Select multiple pictures from phone gallery or camera
                  </span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageFilesUpload} 
                    className="hidden" 
                    disabled={isUploadingImages}
                  />
                </label>

                {/* Or paste Image URL */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] text-slate-500 font-semibold">Or Add Photo via Direct URL</label>
                  <div className="flex space-x-1.5">
                    <input 
                      type="url" 
                      value={tempImageUrl} 
                      onChange={(e) => setTempImageUrl(e.target.value)} 
                      placeholder="https://images.unsplash.com/..." 
                      className="flex-1 p-2 rounded-xl border bg-white text-[11px] text-slate-800 font-mono" 
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrlImage(); }}}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddUrlImage}
                      className="px-3 py-2 bg-[#5128E8] text-white rounded-xl text-xs font-bold hover:bg-[#431fcd] transition shrink-0 shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Uploaded Photos Thumbnails & Cover Selector */}
                {formData.images.length > 0 ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700">Uploaded Gallery ({formData.images.length})</span>
                      <span className="text-[#5128E8] font-semibold">⭐ 1st photo is Cover</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                      {formData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 shadow-2xs">
                          <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Cover badge or Make Cover button */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-emerald-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded-md shadow-xs">
                              ⭐ Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1 left-1 bg-slate-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md opacity-85 hover:opacity-100 transition shadow-xs"
                            >
                              Set Cover
                            </button>
                          )}

                          {/* Delete Photo button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition shadow-xs"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-200 text-center">
                    ⚠️ No photos added yet. Upload at least 1 photo for your listing.
                  </p>
                )}
              </div>

              {formData.category === 'mess' && (
                <div className="p-2.5 bg-[#F7F5FF] rounded-2xl border border-[#5128E8]/20 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px]">Single Thali (₹)</label>
                      <input 
                        type="number" 
                        value={formData.singleThaliPrice} 
                        onChange={(e) => setFormData({ ...formData, singleThaliPrice: e.target.value })}
                        className="w-full p-1.5 rounded-lg border text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px]">Monthly Pass (₹)</label>
                      <input 
                        type="number" 
                        value={formData.monthlyPrice} 
                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                        className="w-full p-1.5 rounded-lg border text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px]">Lunch Special</label>
                    <input 
                      type="text" 
                      value={formData.lunchMenu} 
                      onChange={(e) => setFormData({ ...formData, lunchMenu: e.target.value })}
                      className="w-full p-1.5 rounded-lg border text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px]">Dinner Special</label>
                    <input 
                      type="text" 
                      value={formData.dinnerMenu} 
                      onChange={(e) => setFormData({ ...formData, dinnerMenu: e.target.value })}
                      className="w-full p-1.5 rounded-lg border text-xs"
                    />
                  </div>
                </div>
              )}

              {formData.category === 'flats' && (
                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px]">Rent / mo (₹)</label>
                      <input 
                        type="number" 
                        value={formData.flatRent} 
                        onChange={(e) => setFormData({ ...formData, flatRent: e.target.value })}
                        className="w-full p-1.5 rounded-lg border text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px]">Deposit (₹)</label>
                      <input 
                        type="number" 
                        value={formData.flatDeposit} 
                        onChange={(e) => setFormData({ ...formData, flatDeposit: e.target.value })}
                        className="w-full p-1.5 rounded-lg border text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'parties' && (
                <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-pink-900 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Party & Event Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-700">Date & Timing</label>
                      <input 
                        type="text" 
                        value={formData.eventDateTime || ''} 
                        onChange={(e) => setFormData({ ...formData, eventDateTime: e.target.value })}
                        placeholder="e.g. Saturday • 8:00 PM"
                        className="w-full p-1.5 rounded-lg border text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-700">Starting Pass (₹)</label>
                      <input 
                        type="number" 
                        value={formData.eventStartingPrice || 399} 
                        onChange={(e) => setFormData({ ...formData, eventStartingPrice: e.target.value })}
                        className="w-full p-1.5 rounded-lg border text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-700">Venue / Lounge</label>
                    <input 
                      type="text" 
                      value={formData.eventVenue || ''} 
                      onChange={(e) => setFormData({ ...formData, eventVenue: e.target.value })}
                      placeholder="e.g. The Mill / High Spirits, Viman Nagar"
                      className="w-full p-1.5 rounded-lg border text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-700">Music / Genre</label>
                      <input 
                        type="text" 
                        value={formData.eventGenre || ''} 
                        onChange={(e) => setFormData({ ...formData, eventGenre: e.target.value })}
                        placeholder="e.g. Bollywood + EDM"
                        className="w-full p-1.5 rounded-lg border text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-700">Organizer Name</label>
                      <input 
                        type="text" 
                        value={formData.eventOrganizer || ''} 
                        onChange={(e) => setFormData({ ...formData, eventOrganizer: e.target.value })}
                        placeholder="e.g. Campus Pulse"
                        className="w-full p-1.5 rounded-lg border text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-[#5128E8] text-white font-bold text-xs shadow-md"
                >
                  Save & Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
