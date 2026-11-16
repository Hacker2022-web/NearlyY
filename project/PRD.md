# MASTER PRODUCT REQUIREMENT DOCUMENT (PRD)

## Project Name: NearlyY
**Tagline:** Hyper-Local Student Living & Essential Services Infrastructure  
**Target Market:** University & College Hubs in Pune (Viman Nagar, Kothrud, Hinjawadi, Katraj, Camp)  
**Primary Users:** College students, hostellers, and PG residents (Consumer side); Local micro-businesses (Merchant side).  
**Monetization Engine:** Monthly B2B SaaS Listing Tiers (₹99 / ₹199 / ₹299 per merchant).

---

## 1. System Prompt for AI App Generation
*(Copy and paste this entire block directly into ChatGPT, Claude, or v0.dev to generate the complete application codebase or UI design)*

> **Prompt to AI:**  
> "You are a Principal Product Designer and Full-Stack Mobile Architect. Using the comprehensive specifications below for **NearlyY**, design and write the complete, production-ready frontend code (using React Native Expo with NativeWind/Tailwind CSS, or Next.js 14 with Tailwind CSS mobile-viewport layout). The app must be hyper-clean, modern (inspired by Airbnb and DoorDash), and optimized for fast 1-tap WhatsApp lead conversions for local merchants."

---

## 2. Design System & Brand Identity

### 2.1 Color Palette
* **Primary Brand Accent:** Deep Indigo / Electric Violet (`#4F46E5` / `indigo-600`) — Conveys trust, authority, and modern tech.
* **Secondary Surface Accent:** Emerald Green (`#10B981` / `emerald-500`) — Used for verified badges, savings chips, and WhatsApp CTA buttons.
* **Background Canvas:** Off-White / Soft Slate (`#F8FAFC` / `slate-50`).
* **Surface Containers / Cards:** Pure White (`#FFFFFF`) with subtle border (`border-slate-200`) and soft shadow (`shadow-sm`).
* **Text Hierarchy:**
  * Primary Headings: Slate 900 (`#0F172A`) — SemiBold / Bold.
  * Body Text: Slate 600 (`#475569`) — Regular.
  * Subtext / Meta: Slate 400 (`#94A3B8`) — Medium.

### 2.2 Typography Scale
* **Header 1 (Screen Titles):** 24px, Bold.
* **Header 2 (Card / Section Titles):** 18px, SemiBold.
* **Body Text (Service details, description):** 14px, Regular.
* **Badge / Pricing Tag:** 12px, Bold, Uppercase tracking.

---

## 3. Information Architecture & App Structure

```
NearlyY (Mobile App Architecture)
├── 1. Campus Onboarding
│   └── University / Area Selector (e.g., Symbiosis Viman Nagar, MIT Kothrud)
├── 2. Home Discovery Hub
│   ├── Campus Location Switcher Bar
│   ├── Category Quick-Launch Grid (Mess, Laundry, Gym, Flats)
│   ├── "Verified Student Perks" Carousel (Featured Partners)
│   └── Near You Quick-List
├── 3. Category Listing & Comparison Engine
│   ├── Sticky Search & Filter Bar (Veg/Non-Veg, Distance, AC, Price)
│   └── Merchant Card Feed (Photos, Verified Badge, Rates, Distance)
├── 4. Merchant Detail & Conversion Page
│   ├── Photo Gallery & Operating Hours
│   ├── Transparent Rate Card / Pricing Matrix
│   ├── Student Reviews & Hygiene Rating
│   └── Floating Action Bar: [1-Tap WhatsApp Connect] & [Call Shop]
└── 5. Merchant Self-Serve Portal (B2B)
    ├── Subscription Tier Selector (₹99 / ₹199 / ₹299)
    ├── Shop Details & Rate Card Uploader
    └── UPI Verification Submission
```

---

## 4. Screen-by-Screen Technical Specifications

### Screen 1: Campus Onboarding / Geofence Selector
* **Objective:** Establish the student's hyper-local context within 2.5 km of their specific campus.
* **UI Components:**
  * Clean vector illustration of campus life.
  * Searchable dropdown list of Pune student clusters:
    * *Symbiosis (Viman Nagar)*
    * *MIT World Peace University (Kothrud)*
    * *COEP Technological University (Shivajinagar)*
    * *Bharati Vidyapeeth (Katraj)*
    * *DY Patil (Akurdi / Pimpri)*
  * "Detect My Current Campus" GPS button.
* **User Flow:** Selecting a campus saves the `campus_id` to local storage / state and immediately routes to Screen 2 with pre-filtered local merchants.

---

### Screen 2: Home Discovery Dashboard
* **Header Bar:**
  * Left: Active Campus Tag (`📍 Symbiosis, Viman Nagar` with dropdown caret).
  * Right: Search icon + "List Your Business" text button (for onboarding owners).
* **Section 1: Category Quick-Grid (4 Core Hubs):**
  * 🍛 **Mess & Tiffin:** Icon + "Daily Thalis from ₹70".
  * 👕 **Laundry:** Icon + "Wash & Fold from ₹10/kg".
  * 🏋️ **Gyms:** Icon + "Student Plans from ₹800/mo".
  * 🏠 **Flats & PGs:** Icon + "Zero Brokerage Beds".
* **Section 2: Featured Student Privilege Carousel (₹299 Tier Merchants):**
  * Horizontal scrolling cards with visual banner, partner logo, exclusive student discount chip (e.g., *"10% Off First Month Mess Pass"*), and expiration timer.
* **Section 3: Trending Near You:**
  * Feed of top-rated services sorted by walking distance (< 500m).

---

### Screen 3: Category Listing & Filter View
* **Sticky Filter Pills:**
  * For Mess: `All`, `Pure Veg`, `Non-Veg Available`, `Monthly Pass < ₹3,500`, `Trial Meal Available`.
  * For Laundry: `All`, `Per Kg Wash`, `Ironing Only`, `Hostel Doorstep Pickup`, `24h Express`.
  * For Gym: `All`, `Air Conditioned`, `Certified Trainer`, `Ladies Batch`, `< ₹1,000/mo`.
  * For Flats: `1RK`, `1BHK`, `Single Room PG`, `Double Sharing`, `No Curfew`.
* **Merchant Card Layout:**
  * 16:9 Thumbnail image with badging: `[Verified Partner 🛡️]` (for ₹199+ tiers).
  * Business Name, Sub-category, Distance chip (`🚶 350m from Main Gate`).
  * Highlighted Pricing: Large bold font (e.g., `₹3,200 / month` or `₹12 / kg`).
  * Fast CTA: Direct phone call button and green WhatsApp icon.

---

### Screen 4: Merchant Detail View (The Conversion Engine)
* **Hero Image Carousel:** 5–8 high-resolution photos of the kitchen/dining hall, laundry equipment, gym floor, or bedroom.
* **Key Attribute Grid:**
  * Timings (e.g., *Lunch: 12:30 PM – 3:30 PM | Dinner: 7:30 PM – 10:30 PM*).
  * Days open (e.g., *Open 7 Days a week; Sunday Special Feast*).
  * Address with 1-tap "Open in Google Maps" link.
* **Structured Rate Card Table:**
  * Clear breakdown of itemized pricing vs. subscription passes.
  * e.g., Single Thali: ₹80 | 15-Day Pass: ₹1,600 | 30-Day Monthly Unlimited: ₹3,100.
* **Floating Bottom Sticky Bar:**
  * Left: Starting Price display (`₹3,100/mo`).
  * Right: Primary CTA button: **"Chat on WhatsApp"** (Deep-links directly to merchant's WhatsApp with pre-filled context message).

---

### Screen 5: B2B Merchant Claim & Onboarding Portal
* **Objective:** Enable frictionless self-serve onboarding for local shopkeepers paying ₹99–₹299/month.
* **Fields:**
  * Business Name & Owner Name.
  * Primary WhatsApp Contact Number.
  * Category (Dropdown: Mess / Laundry / Gym / Housing).
  * Physical Shop Address & Google Map link.
  * Upload Menu / Rate Card Photo.
* **Plan Selector Radio Group:**
  * `Basic (₹99/mo)` | `Verified Pro (₹199/mo - Recommended)` | `Featured Spotlight (₹299/mo)`.
* **Payment Step:**
  * Displays NearlyY dynamic UPI QR code (`nearlyy@upi`).
  * Field: "Enter 12-Digit UPI Transaction ID (UTR)" or screenshot upload.
  * Notice: *"Listing activates within 2 hours of verification."*

---

## 5. Technical Data Schema (PostgreSQL / Supabase Ready)

```sql
-- 1. CAMPUSES TABLE
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Pune',
    locality VARCHAR(100) NOT NULL, -- e.g. Viman Nagar, Kothrud
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL, -- mess, laundry, gym, flats
    display_name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL
);

-- 3. MERCHANTS TABLE
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    whatsapp_number VARCHAR(15) NOT NULL,
    phone_number VARCHAR(15),
    address TEXT NOT NULL,
    google_maps_url TEXT,
    starting_price DECIMAL(10, 2) NOT NULL,
    price_unit VARCHAR(50) NOT NULL, -- per month, per kg, per meal
    is_verified BOOLEAN DEFAULT false,
    subscription_tier VARCHAR(20) DEFAULT 'basic', -- basic, pro, spotlight
    rating DECIMAL(2, 1) DEFAULT 4.5,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. PRICING ITEMS / RATE CARDS
CREATE TABLE rate_card_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(50) -- single, monthly, per_kg
);

-- 5. STUDENT LEAD INQUIRIES (ANALYTICS)
CREATE TABLE lead_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    click_type VARCHAR(50) NOT NULL, -- whatsapp_click, call_click
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

---

## 6. WhatsApp Lead Generation Integration Logic

Every merchant card and detail page must invoke the following URL schema when the student clicks the primary CTA:

```javascript
// Function to generate high-intent direct lead for merchant
function getWhatsAppLeadLink(merchant, studentCategory) {
    const phone = merchant.whatsapp_number.replace(/\D/g, ''); // strip non-digits
    const message = encodeURIComponent(
        `Hi ${merchant.business_name}, I saw your listing on NearlyY Pune for ${merchant.category_name}. ` +
        `I am a student nearby and wanted to check your current rates and availability. Could you share details?`
    );
    return `https://wa.me/91${phone}?text=${message}`;
}
```

---

## 7. Workshop 3 Execution Blueprint (How to Get Full Marks)

* **Riskiest Assumption:** Local shopkeepers will pay ₹199/month upfront for visibility to an audience of 100+ students.
* **Field Target:** Pitch 50 vendors across Viman Nagar / Kothrud.
* **Pass Mark:** 8 vendors pay ₹99 token advance.
* **Kill/Modify Mark:** Fewer than 3 vendors pay.
* **+10 Marks Protocol:** Manually escort 3 students with digital discount vouchers into a partnered mess or laundry and record their redemption on camera.
