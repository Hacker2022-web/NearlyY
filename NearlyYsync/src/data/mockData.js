export const LOCALITY = "Lohegaon, Pune";

export const SERVICES_MENU = [
  { id: 'mess', name: 'Mess & Tiffin', icon: 'UtensilsCrossed', count: '4 places', starting: '₹80/thali' },
  { id: 'laundry', name: 'Laundry & Dry Cleaning', icon: 'Shirt', count: '3 services', starting: '₹10/kg' },
  { id: 'gym', name: 'Gym & Fitness', icon: 'Dumbbell', count: '3 centers', starting: '₹800/mo' },
  { id: 'flats', name: 'Flats & PG', icon: 'Home', count: '4 verified', starting: '₹5,500/mo' },
  { id: 'parties', name: 'Parties & Events', icon: 'Sparkles', count: '1 featured gig', starting: '₹499/pass' },
];

export const CATEGORY_DATA = {
  mess: [
    {
      id: 'mess-1',
      name: 'Annapurna Executive & Student Mess',
      category: 'mess',
      locality: 'Lohegaon, Pune (Near Bus Stop)',
      distance: '0.4 km away',
      rating: 4.6,
      reviewsCount: '1.2k',
      priceDisplay: '₹2,000 / mo',
      startingPrice: 90,
      isOpen: true,
      timeLeft: '12 min left',
      coverImage: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Clean, hygienic, homestyle daily meals for students, interns & IT professionals in Lohegaon.',
      phone: '919876543210',
      dietType: 'Pure Veg',
      tags: ['Unlimited Roti', 'Pure Veg', 'Weekly Sweet'],
      todayMenu: {
        lunch: {
          name: 'Paneer Butter Masala + 4 Phulkas + Jeera Rice + Dal Tadka + Salad',
          type: 'veg',
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80'
        },
        dinner: {
          name: 'Veg Dum Biryani + Burani Raita + Sweet Gulab Jamun',
          type: 'veg',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'
        }
      },
      pricing: [
        { type: 'Single Thali', price: 90, note: '/per meal', save: null },
        { type: '15-Day Pass', price: 1200, note: 'Lunch or Dinner', save: 'save ₹150' },
        { type: '30-Day Unlimited', price: 2000, note: 'Both Meals Daily', save: 'save ₹400' }
      ],
      timings: {
        lunch: '12:30 PM – 2:30 PM',
        dinner: '7:30 PM – 10:00 PM',
        days: 'Open all 7 days (Sunday Special Feast)'
      },
      gallery: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      ]
    },
    {
      id: 'mess-2',
      name: 'Shree Ganesh Homestyle Bhojanalay',
      category: 'mess',
      locality: 'Porwal Road, Lohegaon',
      distance: '0.8 km away',
      rating: 4.8,
      reviewsCount: '890',
      priceDisplay: '₹1,800 / mo',
      startingPrice: 80,
      isOpen: true,
      timeLeft: 'Open Now',
      coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      description: 'Special Maharashtrian & North Indian thali. Fresh chapati made on order.',
      phone: '919876543220',
      dietType: 'Pure Veg',
      tags: ['Tiffin Delivery', 'Pure Veg', 'Fresh Phulkas'],
      todayMenu: {
        lunch: {
          name: 'Sev Bhaji + 4 Chapatis + Dal Fry + Steamed Rice + Kheer',
          type: 'veg',
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80'
        },
        dinner: {
          name: 'Aloo Gobi Matar + Dal Tadka + Rice + Phulkas',
          type: 'veg',
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80'
        }
      },
      pricing: [
        { type: 'Single Thali', price: 80, note: '/per meal', save: null },
        { type: '15-Day Pass', price: 1050, note: 'Lunch or Dinner', save: 'save ₹150' },
        { type: '30-Day Unlimited', price: 1800, note: 'Both Meals Daily', save: 'save ₹300' }
      ],
      timings: {
        lunch: '12:00 PM – 3:00 PM',
        dinner: '7:00 PM – 10:30 PM',
        days: 'Mon – Sat (Sunday Holiday)'
      },
      gallery: [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
      ],
      photos: [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'mess-3',
      name: 'Kolhapuri Tiffin & Mess Services',
      category: 'mess',
      locality: 'Near Lohegaon Chowk, Pune',
      distance: '1.1 km away',
      rating: 4.5,
      reviewsCount: '640',
      priceDisplay: '₹2,300 / mo',
      startingPrice: 100,
      isOpen: true,
      timeLeft: 'Open Now',
      coverImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
      description: 'Famous for authentic Kolhapuri flavors, Tambada/Pandhra rassa & daily healthy thalis.',
      phone: '919876543221',
      dietType: 'Non-Veg Available',
      tags: ['Non-Veg on Wed/Sun', 'Doorstep Tiffin', 'Egg Thali'],
      todayMenu: {
        lunch: {
          name: 'Chicken Sukka / Paneer Masala + 3 Bhakri + Rassa + Indrayani Rice',
          type: 'mixed',
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80'
        },
        dinner: {
          name: 'Egg Curry / Dal Khichdi + Roti + Onion Salad',
          type: 'mixed',
          image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=500&auto=format&fit=crop&q=80'
        }
      },
      pricing: [
        { type: 'Veg Thali', price: 90, note: '/per meal', save: null },
        { type: 'Non-Veg Thali', price: 140, note: 'Special Days', save: null },
        { type: '30-Day Monthly Pass', price: 2300, note: 'Veg + Non-Veg 2x/wk', save: 'save ₹400' }
      ],
      timings: {
        lunch: '12:30 PM – 3:30 PM',
        dinner: '7:30 PM – 11:00 PM',
        days: 'Open all 7 days'
      },
      gallery: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
      ],
      photos: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ],

  laundry: [
    {
      id: 'laundry-1',
      name: 'SuperClean Express & Laundry',
      category: 'laundry',
      locality: 'Lohegaon Road, Pune',
      distance: '0.5 km away',
      rating: 4.8,
      reviewsCount: '620',
      priceDisplay: '₹80 / kg',
      startingPrice: 80,
      badge: '24h Express Available',
      coverImage: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80',
      description: 'Computerized washing with fabric care, steam iron and doorstep pickup across Lohegaon.',
      phone: '919876543211',
      tags: ['Steam Iron', 'Free Pickup', '24h Delivery'],
      perKgRates: [
        { name: 'Wash & Fold', price: 80, unit: '/ kg', icon: 'ShoppingBag' },
        { name: 'Wash & Iron', price: 100, unit: '/ kg', icon: 'Shirt' }
      ],
      perPieceRates: [
        { item: 'Formal Shirt / T-Shirt', price: 40 },
        { item: 'Blazer / Coat', price: 120 },
        { item: 'Winter Jacket / Hoodie', price: 180 },
        { item: 'Double Bedsheet', price: 70 },
        { item: 'Heavy Blanket / Quilt', price: 100 }
      ],
      doorstepPickup: {
        available: true,
        timing: 'Daily: 9:00 AM – 7:00 PM',
        note: 'Free doorstep pickup across Lohegaon'
      },
      photos: [
        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'laundry-2',
      name: 'Spotless Dry Cleaners & Steam Iron',
      category: 'laundry',
      locality: 'Porwal Road, Lohegaon',
      distance: '1.0 km away',
      rating: 4.6,
      reviewsCount: '410',
      priceDisplay: '₹70 / kg',
      startingPrice: 70,
      badge: 'Same Day Delivery',
      coverImage: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
      description: 'Specialists in formal wear dry-cleaning, winter jackets, shoes and bulk student loads.',
      phone: '919876543222',
      tags: ['Shoe Cleaning', 'Dry Cleaning', 'Affordable'],
      perKgRates: [
        { name: 'Wash & Fold', price: 70, unit: '/ kg', icon: 'ShoppingBag' },
        { name: 'Wash & Iron', price: 90, unit: '/ kg', icon: 'Shirt' }
      ],
      perPieceRates: [
        { item: 'Formal Shirt', price: 35 },
        { item: 'Trousers / Jeans', price: 40 },
        { item: 'Blazer Dry Clean', price: 110 },
        { item: 'Single Blanket', price: 80 }
      ],
      doorstepPickup: {
        available: true,
        timing: 'Daily: 10:00 AM – 8:00 PM',
        note: 'Minimum pickup weight: 3 kg'
      },
      photos: [
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'laundry-3',
      name: 'QuickWash Student & Resident Care',
      category: 'laundry',
      locality: 'Near Airforce Station, Lohegaon',
      distance: '1.4 km away',
      rating: 4.4,
      reviewsCount: '280',
      priceDisplay: '₹60 / kg',
      startingPrice: 60,
      badge: 'Budget Friendly',
      coverImage: 'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=800&auto=format&fit=crop&q=80',
      description: 'Fast, budget laundry for bachelor flats, students and everyday washing needs.',
      phone: '919876543223',
      tags: ['Economical', 'Fast Turnaround', 'Daily Wash'],
      perKgRates: [
        { name: 'Wash & Fold', price: 60, unit: '/ kg', icon: 'ShoppingBag' },
        { name: 'Wash & Iron', price: 80, unit: '/ kg', icon: 'Shirt' }
      ],
      perPieceRates: [
        { item: 'Regular Clothes', price: 25 },
        { item: 'Ironing Only', price: 10 },
        { item: 'Bedsheet Wash', price: 50 }
      ],
      doorstepPickup: {
        available: false,
        timing: 'Drop-off at counter: 8 AM - 9 PM',
        note: 'Walk-in express counter'
      },
      photos: [
        'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ],

  gym: [
    {
      id: 'gym-1',
      name: 'Iron Den Unisex Fitness Hub',
      category: 'gym',
      locality: 'Near Lohegaon Chowk, Pune',
      distance: '0.6 km away',
      rating: 4.9,
      reviewsCount: '910',
      priceDisplay: '₹999 / mo',
      startingPrice: 999,
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Fully air-conditioned 3,500 sq ft fitness floor with certified trainers and personal diet guidance.',
      phone: '919876543212',
      tags: ['Air Conditioned', 'Cardio + Strength', 'Certified Trainer'],
      plans: [
        { title: 'Monthly', price: 999, sub: '/person', save: null, popular: true },
        { title: '3 Months', price: 2499, sub: 'Quarterly', save: 'save 17%', popular: false },
        { title: 'Semester / 6 Mo', price: 4499, sub: 'Biannual', save: 'save 25%', popular: false }
      ],
      facilities: [
        { name: 'Air Conditioned', icon: 'Snowflake' },
        { name: 'Certified Trainers', icon: 'Users' },
        { name: 'Cardio Zone', icon: 'Activity' },
        { name: 'Showers & Lockers', icon: 'ShowerHead' }
      ],
      timings: {
        general: 'Mon – Sat: 6:00 AM – 10:30 PM',
        ladiesOnly: '4:00 PM – 6:00 PM',
        sunday: '6:00 AM – 1:00 PM'
      }
    },
    {
      id: 'gym-2',
      name: 'PowerFit Gym & Crossfit Club',
      category: 'gym',
      locality: 'Porwal Road, Lohegaon',
      distance: '1.2 km away',
      rating: 4.7,
      reviewsCount: '580',
      priceDisplay: '₹850 / mo',
      startingPrice: 850,
      coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Heavy strength equipment, Olympic barbells, crossfit turf and dedicated weight-loss batches.',
      phone: '919876543224',
      tags: ['Crossfit Turf', 'Strength Gym', 'Open Early'],
      plans: [
        { title: 'Monthly', price: 850, sub: '/person', save: null, popular: true },
        { title: '3 Months', price: 2100, sub: 'Quarterly', save: 'save 18%', popular: false },
        { title: '1 Year Annual', price: 6500, sub: 'Annual Pass', save: 'save 36%', popular: false }
      ],
      facilities: [
        { name: 'Olympic Barbells', icon: 'Dumbbell' },
        { name: 'Crossfit Turf', icon: 'Activity' },
        { name: 'Steam Bath', icon: 'Flame' },
        { name: 'Free Parking', icon: 'Car' }
      ],
      timings: {
        general: 'Mon – Sat: 5:30 AM – 10:00 PM',
        ladiesOnly: '11:00 AM – 1:00 PM',
        sunday: '7:00 AM – 12:00 PM'
      }
    },
    {
      id: 'gym-3',
      name: 'Pulse 24/7 Premium Fitness',
      category: 'gym',
      locality: 'Near Airport Road, Lohegaon',
      distance: '1.8 km away',
      rating: 4.8,
      reviewsCount: '720',
      priceDisplay: '₹1,299 / mo',
      startingPrice: 1299,
      coverImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Biometric 24/7 gym access, imported cardio treadmills, sauna and certified Zumba/Yoga classes.',
      phone: '919876543225',
      tags: ['24/7 Open', 'Sauna & Steam', 'Zumba Classes'],
      plans: [
        { title: 'Monthly', price: 1299, sub: '/person', save: null, popular: true },
        { title: '3 Months', price: 3200, sub: 'Quarterly', save: 'save 18%', popular: false },
        { title: 'Annual VIP', price: 9999, sub: 'Full Year Access', save: 'save 35%', popular: false }
      ],
      facilities: [
        { name: '24x7 Biometric', icon: 'Zap' },
        { name: 'Imported Cardio', icon: 'Activity' },
        { name: 'Sauna Room', icon: 'Flame' },
        { name: 'Shower Rooms', icon: 'ShowerHead' }
      ],
      timings: {
        general: 'Open 24 Hours / 7 Days',
        ladiesOnly: 'Special trainer slots on request',
        sunday: 'Open 24 Hours'
      }
    }
  ],

  flats: [
    {
      id: 'pg-1',
      name: 'Sunrise PG & Executive Co-Living',
      category: 'flats',
      locality: 'Lohegaon, Pune (Near Airforce Station)',
      rating: 4.7,
      reviewsCount: '842',
      price: 6500,
      priceDisplay: '₹6.5k / mo',
      deposit: 5000,
      sharing: 'Single / Double',
      propertyType: 'Single & Double PG',
      distance: '0.8 km away',
      brokerage: 'Zero Brokerage',
      coverImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
      phone: '919876543213',
      tags: ['WiFi', 'AC Available', 'Food Option'],
      amenities: [
        { name: 'Wi-Fi (100 Mbps)', icon: 'Wifi' },
        { name: 'RO Purified Water', icon: 'Droplets' },
        { name: 'Geyser (Hot Water)', icon: 'Flame' },
        { name: 'Power Backup', icon: 'Zap' },
        { name: 'Washing Machine', icon: 'RotateCw' },
        { name: 'Daily Maid Service', icon: 'Sparkles' }
      ],
      rules: [
        'Gate closes at 11:00 PM',
        'Day visitors allowed till 8:00 PM',
        'Strictly non-smoking interior zones',
        'Quiet study & work hours after 10:30 PM'
      ],
      photos: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'pg-2',
      name: 'Lohegaon Comforts & Executive Stay',
      category: 'flats',
      locality: 'Porwal Road, Lohegaon',
      rating: 4.5,
      reviewsCount: '410',
      price: 7000,
      priceDisplay: '₹7.0k / mo',
      deposit: 6000,
      sharing: 'Double / Triple Sharing',
      propertyType: 'Double Sharing PG',
      distance: '1.2 km away',
      brokerage: 'Zero Brokerage',
      coverImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80',
      phone: '919876543214',
      tags: ['AC Included', 'Meals Included', 'Power Backup'],
      amenities: [
        { name: 'High-speed WiFi', icon: 'Wifi' },
        { name: 'AC in All Rooms', icon: 'Snowflake' },
        { name: 'Daily Food Included', icon: 'UtensilsCrossed' },
        { name: 'Power Backup', icon: 'Zap' },
        { name: 'RO Water', icon: 'Droplets' },
        { name: 'Hot Water Geyser', icon: 'Flame' }
      ],
      rules: [
        'Gate closes at 11:30 PM',
        'Visitors allowed in lounge area',
        'Cleanliness inspection weekly'
      ],
      photos: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'pg-3',
      name: 'Urban Nest 1BHK / 2BHK Rentals',
      category: 'flats',
      locality: 'Sant Nagar, Lohegaon, Pune',
      rating: 4.4,
      reviewsCount: '190',
      price: 11000,
      priceDisplay: '₹11.0k / mo',
      deposit: 15000,
      sharing: 'Private 1BHK Flat',
      propertyType: '1BHK Flat',
      distance: '1.5 km away',
      brokerage: 'Zero Brokerage',
      coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
      phone: '919876543215',
      tags: ['Private Flat', 'No Curfew', 'Car Parking'],
      amenities: [
        { name: 'Covered Parking', icon: 'Car' },
        { name: '24/7 Water Supply', icon: 'Droplets' },
        { name: 'Gated Security', icon: 'Shield' },
        { name: 'Balcony View', icon: 'Home' },
        { name: 'Modular Kitchen', icon: 'Flame' }
      ],
      rules: [
        'No restriction on gate timings',
        'Family & bachelor friendly society',
        'Deposit refundable within 48h of move-out'
      ],
      photos: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'pg-4',
      name: 'GreenPark Luxury PG for Working & Students',
      category: 'flats',
      locality: 'Near Lohegaon Bus Terminal, Pune',
      rating: 4.6,
      reviewsCount: '340',
      price: 5800,
      priceDisplay: '₹5.8k / mo',
      deposit: 5000,
      sharing: 'Triple Sharing Bed',
      propertyType: 'Triple Sharing',
      distance: '1.7 km away',
      brokerage: 'Zero Brokerage',
      coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
      phone: '919876543216',
      tags: ['Budget Pick', 'Free Laundry', 'WiFi'],
      amenities: [
        { name: 'WiFi', icon: 'Wifi' },
        { name: 'Free Laundry (Weekly)', icon: 'Shirt' },
        { name: 'Hot Water', icon: 'Flame' },
        { name: 'Security Guard', icon: 'Shield' }
      ],
      rules: [
        'Gate closes at 10:45 PM',
        'Quiet hours after 10 PM'
      ],
      photos: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ],
  parties: [
    {
      id: 'party-ex-ki-shaadi',
      name: 'Ex Ki Shaadi — The Ultimate Move-On Night!',
      category: 'parties',
      locality: 'The Mills, Raja Bahadur City Centre, Pune',
      venue: 'B Wing, 2nd Floor, The Mills - Raja Bahadur City Centre, Pune',
      distance: '~6.8 km away (18 min)',
      rating: 4.9,
      reviewsCount: '890+',
      priceDisplay: 'Passes from ₹499',
      startingPrice: 499,
      dateTime: 'Sunday, 22nd Nov • 05:00 PM Onwards',
      genre: 'Bollywood + Desi Commercial Sundowner',
      organizer: 'UV Events & Entertainment',
      instagram: 'https://www.instagram.com/uv_events.co/',
      instagramHandle: '@uv_events.co',
      phone: '917058547559',
      infoline: '7058547559',
      isOpen: true,
      timeLeft: 'Sunday Sundowner • Limited Student Passes',
      coverImage: '/ex-ki-shaadi.jpg',
      photos: [
        '/ex-ki-shaadi.jpg',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'CLOSURE LOOKS BETTER ON THE DANCE FLOOR!\n\nCurated by House of Desi & India\'s #1 Sundowner Kiki, in official collaboration with UV Events & Entertainment.\n\nFeaturing DJ Naaïro & DJ Nyx bringing non-stop high-energy Bollywood, Punjabi, and commercial club anthems.\n\n• Dress Code: (SHAADI FITS ONLY) — Kurta, Sherwani, Lehenga, Wedding Drip!\n• Mandatory: DigiLocker & Communication for 21+ required at entry.',
      tags: ['Shaadi Fits Only', 'Sunday Sundowner', 'DJ Naaïro', 'DJ Nyx', 'DigiLocker 21+', 'The Mills Pune', 'UV Events'],
      pricing: [
        { type: 'Early Bird Stag Pass', price: 499, note: 'Includes cover beverage', save: 'Fast Filling' },
        { type: 'Couple Entry Pass', price: 899, note: 'Full cover charge included', save: 'Save ₹100' },
        { type: 'VIP Table / Bottle Service', price: 3999, note: 'Dedicated table + starters & bottle (Enquire via WhatsApp)', save: 'Exclusive' }
      ],
      rules: [
        'Dress Code: (SHAADI FITS ONLY) — Wear your best ethnic/wedding party outfit',
        'DigiLocker Govt ID mandatory for 21+ age verification at entry gate',
        'Sunday Sundowner gates open sharp at 05:00 PM',
        'Infoline & Reservations: 7058547559 • Instagram: @uv_events.co'
      ],
      gallery: [
        '/ex-ki-shaadi.jpg'
      ]
    }
  ]
};

export const USER_PROFILE = {
  name: 'Sahil Dehadray',
  subtitle: 'Lohegaon Resident',
  initial: 'S',
  plan: 'Early Access Member',
  location: 'Lohegaon, Pune',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  college: 'Ajeenkya DY Patil University (ADYPU)',
  subLocality: 'Porwal Road, Lohegaon',
  livingType: 'Private Flat / Shared Room'
};

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
];
