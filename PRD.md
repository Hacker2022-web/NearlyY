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

## 7. Workshop 3 Execution Blueprint & Presentation Dossier

**Academic Context:** upGrad School of Technology · Upstart Labs · Build. Iterate. Scale.  
**Workshop:** Workshop 3: Idea Validation & Experimentation (Pune Campus · Ashank Bhandari)  
**Primary Deliverable Drive Repository:** [Google Drive Proof Folder (Interviews-15-People)](https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma)  
*(Rule: No proof, no points. Every number, claim, and quote corresponds directly to files stored in this repository).*

---

### 7.1 Customer Discovery: The 15 Field Interviews (Step 3)

* **Protocol Followed:** Asked strictly about *past behavior* and the *last time the problem occurred* ("When was the last time you looked for a tiffin/laundry/PG?", "What did you actually do?"). Zero hypothetical questions ("Would you use an app?").
* **Evidence Repository:** [Google Drive: Interviews-15-People](https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma)
* **Pain Count:** **12 of 15** participants raised the problem unprompted and already pay money or time for clumsy workarounds (Qualifies as a **Strong Validated Problem**, benchmark is 8+).

| # | Persona & Location | Category | Pain? | Today's Clumsy Workaround | Verbatim Quote (Pune Field Notes) | Direct Video Proof Link |
|---|--------------------|----------|-------|--------------------------|------------------------------------|-------------------------|
| 1 | Student Hosteller (DY Patil / Lohegaon) | Mess & Food | **YES** | Walks 1.2km daily, checks 3 different mess notice boards | *"Bhai roz wahi aaloo-gobi khana padta hai. Sham ko kisi mess me paneer bana hai ya nahi pata hi nahi chalta jab tak gate tak na jao."* | [VID_20261110_181735179.mp4 (425MB)](https://drive.google.com/file/d/1oft_XT6WMYbMmYB0LqtMAvpN3dW7qrM3/view) |
| 2 | Mess Owner (Porwal Road, Lohegaon) | Merchant (Food) | **YES** | Prints 1,000 paper pamphlets at ₹1.5/sheet; guards confiscate them | *"Har sem naye bachhe aate hain, par hostel gate pe watchman khada rehta hai pamphlet nahi baantne deta. ₹2,000 ka print aise hi waste ho gaya."* | [VID_20261110_203930010.mp4 (211MB)](https://drive.google.com/file/d/1PzVSaoFBoF2tGPlXETh76fqRNBViZglU/view) |
| 3 | 2nd-Year Engineering Student (Lohegaon) | Laundry | **YES** | Gives clothes to local dhobi; loses shirts, no bill or record | *"Dhobi ko kapde diye the, 10 din baad bola ghum gaya. Koi receipt nahi deta, WhatsApp pe message karo toh reply nahi aata."* | [VID_20261116_175108359.mp4 (297MB)](https://drive.google.com/file/d/1CMkgH9MoFwqlBH20kuDBjXvt0dQ0m5WD/view) |
| 4 | Laundry Shop Operator (Sant Nagar) | Merchant (Laundry) | **YES** | Handwritten red diary, calls students manually when load is done | *"Bachhe aake puchte hain kapde hue kya. Register me dhoondhte baitho 15 minute. Agar WhatsApp pe seedha order aaye toh aadha tension khatam."* | [VID_20261116_175714324.mp4 (41MB)](https://drive.google.com/file/d/1q67ECnnUmR0oUt5rpsdC0nzADVmFY694/view) |
| 5 | PG Resident (Near Airforce Station) | Flats & PG | **YES** | Paid ₹10,000 broker commission for a room with broken geyser | *"Broker ne advance le liya, bola 24 ghante paani hai. Room lene ke baad geyser kharab nikla aur phone uthana band kar diya."* | [VID_20261116_175737289.mp4 (27MB)](https://drive.google.com/file/d/1cQZ2qTn2ByWcFyVGQ_WDVCEc8vLCVLts/view) |
| 6 | Local PG Owner (Porwal Road) | Merchant (PG) | **YES** | Relies on local brokers charging 1-month rent per bed | *"Broker 1 mahine ka pura bhaada le leta hai ek student laane ka. Agar directly student se baat ho jaye WhatsApp pe toh hum discount bhi de de."* | [VID_20261116_180147119.mp4 (45MB)](https://drive.google.com/file/d/1aahyApF75G0t7Y04j91Zl5mnD4m41C09/view) |
| 7 | Gym Owner / Trainer (Lohegaon) | Merchant (Fitness) | **YES** | Offers ₹500 off on roadside banner; gets 2 inquiries a week | *"College ke time pe batch full rehti hai, dopehar me gym pura khali. Afternoon slot ke liye student discount announce karne ka koi rasta nahi hai."* | [VID_20261116_180753106.mp4 (325MB)](https://drive.google.com/file/d/19kbmswK7FDth09jMGAJpTtEXjb1EOcEV/view) |
| 8 | 1st-Year Day Scholar (Viman Nagar) | Transport / Tiffin | NO | Lives with parents in Pune; mother packs lunchbox | *"Main ghar se hi dabba leke aata hu, toh mujhe mess ya tiffin ki zarurat nahi padti abhi."* | [VID_20261116_181048884.mp4 (179MB)](https://drive.google.com/file/d/11KR2VGozusq-38M0y-Abzf0-hAY0yAUL/view) |
| 9 | Outstation Student (Symbiosis Viman Nagar) | Mess & Diet | **YES** | Juggles 4 different WhatsApp groups to ask who delivers tiffin | *"Pune aake sabse bada jhanjhat khana tha. WhatsApp pe dosto se pucha, unhone 2 number diye, dono band the. 3 din swiggy se mangwaya ₹350 per meal."* | [VID_20261116_182114493.mp4 (214MB)](https://drive.google.com/file/d/1vbM0iD_4Y-A732nblQqe4IojGC6lJ8Lg/view) |
| 10 | Tiffin Service Lady (Home Cook, Viman Nagar) | Merchant (Tiffin) | **YES** | WhatsApp status updates that only existing 20 customers see | *"Mere paas 15 tiffin banane ki aur capacity hai, par society me poster lagane ki permission nahi dete. Naye bachhe milte hi nahi."* | [VID_20261116_182805946.mp4 (19MB)](https://drive.google.com/file/d/1YhJwSJ2Dih9jTgNxHN8wPnSepgEmAc5e/view) |
| 11 | Student (Flat Hunter, 3rd Year) | Flats & Rentals | **YES** | Scrolling dead Olx/NoBroker listings with fake photos | *"NoBroker pe photos 5 saal purani hoti hain. Physical visit karo toh pata chalta hai room me window hi nahi hai."* | [VID_20261116_182918630.mp4 (49MB)](https://drive.google.com/file/d/1ezUXso7Cd3PrQigCrL-hCzJcv-gOha57/view) |
| 12 | Ironing & Press Wala (Near College Gate) | Merchant (Laundry) | **YES** | Sits idle 11 AM - 4 PM waiting for hostelers | *"Sham ko line lagti hai, din me pura khali. Agar hostel me delivery karne ka order mil jaye toh extra ladka rakh lu."* | [VID_20261116_183246097.mp4 (35MB)](https://drive.google.com/file/d/1DzqULfSMAZ6xLmgBGVHOffOa1Vddh1tr/view) |
| 13 | Student Hosteller (Budget Conscious) | Fitness & Gym | **YES** | Paid ₹1,800/mo at commercial gym; quit because of timing | *"Student budget me ₹1,500 se kam ka koi dhang ka gym milta hi nahi paas me. Search karo toh sirf expensive franchise gym aate hain."* | [VID_20261116_184610533.mp4 (241MB)](https://drive.google.com/file/d/1bMGkXJbiGbs8TZUDXvz0pxbZD-BSN1qm/view) |
| 14 | Local Fast Food & Evening Mess Vendor | Merchant (Food) | **YES** | Pays ₹5,000 monthly cut to college canteen contractor | *"Hume campus ke bahar stall lagane me police ka dar rehta hai. Agar verified monthly tiffin subscriber mil jayein toh fixed income ho jaye."* | [VID_20261116_184817278.mp4 (43MB)](https://drive.google.com/file/d/1MtD_-Lt60Uenn6qY-MQlG9wakmPlvWtv/view) |
| 15 | 4th-Year Student (Senior Mentor) | Housing & Life | **YES** | Maintains personal Google Sheet of verified vendors for juniors | *"Har saal first year juniors aake puchte hain 'bhaiya acchi mess batao'. Maine excel sheet banayi hui thi phone me jo sabko forward karta hu."* | [Interviews-15-People Folder (Field Log #15)](https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma) |

---

### 7.2 The 11-Slide Deck Presentation Blueprint

Below is the slide-by-slide structure directly adhering to the Upstart Workshop 3 format:

#### Slide 1: Cover Slide
* **Title:** NearlyY — Hyper-Local Campus Living Infrastructure
* **Subtitle:** Sell Something That Doesn't Exist Yet | Workshop 3 Submission
* **Institution:** upGrad School of Technology · Upstart Labs · Pune Campus
* **Instructor:** Ashank Bhandari
* **Team:** Sahil Dehadray & Team (Team Lead & Full Stack Developer)
* **Live Proof Link:** `https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma`

#### Slide 2: Step 1 — Write the Problem Statement
* **Standard Class Template:**
  > **[Outstation college students in Pune]** are trying to **[find reliable daily mess, laundry, and affordable PG accommodations within 2km of campus]** but **[local micro-merchants have zero verified digital presence, broker markups are 100%, and food quality is unpredictable]**, so right now they **[walk door-to-door, waste money on food delivery apps, rely on random senior WhatsApp chats, and pay heavy broker fees]**, which is bad because **[they waste 12+ hours every month, spend ₹3,000+ extra in unnecessary markups, and local shopkeepers lose direct access to 5,000+ nearby students]**.
* **Complaint:** *"Bhai roz wahi aaloo-gobi khana padta hai, menu ka pata hi nahi chalta."*
* **Problem:** Extreme information asymmetry between students and hyper-local vendors within a 2km geofence.
* **Insight:** Students don't need another e-commerce cart; they need **transparent price comparison and 1-tap direct WhatsApp lead connect** with verified shop owners.
* **Solution:** **NearlyY** (Student Discovery App) + **NearlyYsync** (Merchant Real-Time Sync Portal).
* **Signal:** 12 out of 15 interviewed people actively spend money on clumsy manual workarounds.

#### Slide 3: Step 2 — Map Your Assumptions
* **10+ Hypotheses Evaluated:**
  * *Want It (Students):*
    1. Students want to see daily changing mess menus before walking to the dining hall. (Validated)
    2. Students prefer WhatsApp direct messaging over in-app checkout for hostel services. (Validated)
    3. Students will switch laundry if 24h doorstep pickup is guaranteed under ₹15/kg. (Validated)
    4. Students distrust brokers and prefer direct landlord contacts. (Validated)
  * *Pay For It (Merchants) — **Riskiest Assumption:**
    5. **[CIRCLED - RISKiEST ASSUMPTION]: Local micro-merchants (messes, laundries, PGs) will pay a ₹99–₹199/month subscription for direct student footfall and verified WhatsApp leads.**
    6. Merchants prefer a simple UPI advance payment over complex digital contracts. (Validated)
    7. Merchants will offer student-exclusive perks (e.g. 10% off pass) in exchange for featured placement. (Validated)
  * *Can We Deliver It (Execution):*
    8. We can onboard and verify a local shop in under 5 minutes using the NearlyYsync portal. (Validated)
    9. Real-time Firestore sync reflects menu and price changes instantaneously across both apps. (Validated)
    10. Hyper-local geofence (< 2.5km) keeps listings walking-distance relevant for students without vehicles. (Validated)

#### Slide 4: Step 3 — Talk to 15 Real People
* **Pain Count:** **12 / 15** (Validated: 8+ indicates strong systemic problem).
* **Summary Visualization:**
  * 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴 ⚪⚪⚪ (12 Strong Pain Points, 3 Non-Applicable).
* **Key Finding:** Both sides suffer equally. Students waste money and time; vendors print useless paper pamphlets or pay brokers 1-month cuts.
* **Proof Pointer:** [Google Drive: Interviews-15-People](https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma) (Includes 14 full-length unedited video recordings totaling over 2 GB).

#### Slide 5: Step 4 — File Your Bet Card
* **The Offer:** *"List your mess / laundry / PG on NearlyY for ₹199/month (Discounted ₹99 Launch Token) to receive direct student inquiries on WhatsApp without broker cuts."*
* **What Counts as a Commitment:**
  * ✅ Hard Commitment: ₹99 UPI Advance / Token Payment for verified listing.
  * ✅ High-Intent Commitment: Signed merchant onboarding form with menu rate card and owner WhatsApp number.
  * ❌ NOT Counted: "Nice idea", likes, verbal compliments, or casual agreement.
* **Reach Target:** Pitch **50+** local vendors across Lohegaon, Porwal Road, and Viman Nagar student hubs.
* **Pass Mark:** **8 paid commitments (₹99 UPI tokens)**.
* **Kill Mark:** Fewer than **3 paid commitments**.

#### Slide 6: Step 5 — The Live Test Prototype & One-Page Offer
* **Working Product URL / Live Binaries:**
  * Student Discovery: `NearlyY v1.0.1 Android Release APK` + Web Engine.
  * Merchant Portal: `NearlyYsync` live vendor sync dashboard.
* **Price Stated:** ₹99/mo (Launch Special) / ₹199/mo (Verified Pro).
* **One Primary Action:** [List Your Shop on WhatsApp / Scan UPI].
* **Mandatory Consumer Protection Guarantee:** *"Launching soon in Lohegaon campus cluster. Any advance money paid is 100% fully refundable on request."*

#### Slides 7 & 8: Step 6 — Sell It to 50+ Real People (Funnel & Evidence)
* **Execution Window:** Nov 15 to Nov 19 (Field blitz across Porwal Road, DY Patil road, and Viman Nagar student lanes).
* **Funnel Numbers (Logged Daily):**
  * **SAW IT (Total Pitched):** **68 vendors & students** (Walk-in physical visits + campus group outreach).
  * **STOPPED OR ASKED (Engaged in Detail):** **28 vendors** inspected the NearlyY live app on our phone and asked questions about onboarding.
  * **COMMITTED (Real Commitments):** **9 Paid Commitments (₹99 UPI Advances)** + 14 Merchant Claim Profiles submitted via NearlyYsync.
* **Pass Mark Achievement:** **9 / 8 = 112.5% of Pass Mark achieved!**
* **Channels Used:**
  1. *Physical Merchant Walk-Ins (Primary):* 42 shops visited in person with live demo on mobile.
  2. *Campus Student WhatsApp Broadcasts:* 26 student leads routed through WhatsApp CTA.
* **Anti-Bias Protocol:** 100% of the 9 paying vendors were complete strangers (zero friends, zero relatives).

#### Slides 9 & 10: Step 7 — Evidence Matrix & The Call (Verdict)
* **Evidence Matrix Coordinates:**
  * **Y-Axis (Is the Problem Real?):** **12 / 15 Pain Count** (Top quadrant, > 8).
  * **X-Axis (Did People Commit?):** **112.5%** (9 commitments ÷ 8 pass mark target).
  * **Quadrant:** **CONTINUE** (Real Pain + Real Commitments).
* **The Verdict Sentence:**
  > *"We choose to **CONTINUE** building and deploying NearlyY because **12 out of 15 interviewees demonstrated urgent unprompted pain**, and **9 independent local merchants committed ₹99 UPI advances** for guaranteed campus visibility, beating our pass mark of 8."*
* **The Counter-Factual (What Would Have Changed Our Mind):**
  > *"The evidence that would change our mind is if fewer than 3 merchants paid after seeing the live prototype, or if student WhatsApp click-through rates fell below 5% after listing activation."*

#### Slide 11: Team Contributions ("Who Did What")
* **Sahil Dehadray (Team Lead & Full-Stack Architect):**
  * Architecture of `NearlyY` mobile app (Capacitor/React/Tailwind) & `NearlyYsync` merchant sync portal.
  * Conducted on-ground merchant interviews #1 to #7 on Porwal Road and filmed raw proof footage.
  * Field sales pitches, UPI QR code generation, and repository setup.
* **Teammate 2 (Field Operations & Interview Lead):**
  * Student interviews #8 to #15 across DY Patil & Symbiosis hostels.
  * Video footage recording, Google Drive proof folder organization, and metadata collation.
* **Teammate 3 (Merchant Relations & Content):**
  * Rate card digitizing, menu photography, and WhatsApp lead link testing.
  * 60-90s Reel editing and voiceover coordination.

---

### 7.3 The 60–90 Second Reel Blueprint (#UpstartProveIt)

* **Format Chosen:** **The Bet + The Street Pitch** (Captions ON, vertical 9:16 format, real camera footage only, zero AI video).
* **Shot-by-Shot Timing Script:**
  1. **Shot 1 (Hook - 0 to 3s):** Face to camera holding phone showing NearlyY app: *"We tried to sell a student app that doesn't exist yet to 50 shopkeepers in Pune in 4 days."*
  2. **Shot 2 (The Bet - 3 to 10s):** Screenshot of Bet Card: *"Our pass mark was 8 paying shops. If we got 7, the idea dies."*
  3. **Shot 3 (Street - 10 to 35s):** Fast-paced montage of walking into tiffin centres, dhobi shops, and PGs in Lohegaon. Rejection clip: vendor waving hand away; then breakthrough clip: mess uncle looking at the screen saying *"WhatsApp pe aayega toh chalega."*
  4. **Shot 4 (The No's - 35 to 45s):** Funniest rejections: shopkeeper asking *"Mera photo aayega kya TV pe?"*
  5. **Shot 5 (The Count & Proof - 45 to 65s):** Showing the UPI payment notification chimes (₹99 received) and counting up to 9 on screen.
  6. **Shot 6 (Verdict & Lesson - 65 to 80s):** Verdict straight to camera: *"9 paid. Pain count 12/15. We choose CONTINUE. The biggest lesson? Small shopkeepers don't care about AI; they care about 5 extra students walking through their door."*
* **Tags & Social Checklist:**
  * Tag `@upstart_labs` and include hashtag `#UpstartProveIt`.
  * Collaborative post across team profiles between 7:00 PM and 9:00 PM.
