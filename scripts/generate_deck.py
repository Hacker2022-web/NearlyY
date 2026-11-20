import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Initialize 16:9 widescreen presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Theme Colors
C_DARK_BG       = RGBColor(15, 23, 42)     # Slate 900
C_LIGHT_BG      = RGBColor(248, 250, 252) # Slate 50
C_WHITE         = RGBColor(255, 255, 255)
C_CARD_BORDER   = RGBColor(226, 232, 240) # Slate 200
C_PRIMARY       = RGBColor(79, 70, 229)    # Indigo 600
C_PRIMARY_BG    = RGBColor(238, 242, 255) # Indigo 50
C_ACCENT        = RGBColor(16, 185, 129)   # Emerald 500
C_ACCENT_BG     = RGBColor(236, 253, 245) # Emerald 50
C_TEXT_MAIN     = RGBColor(15, 23, 42)     # Slate 900
C_TEXT_MUTED    = RGBColor(100, 116, 139) # Slate 500
C_TEXT_LIGHT    = RGBColor(148, 163, 184) # Slate 400
C_DANGER        = RGBColor(239, 68, 68)    # Red 500
C_DANGER_BG     = RGBColor(254, 242, 242)
C_WARNING       = RGBColor(245, 158, 11)   # Amber 500
C_WARNING_BG    = RGBColor(254, 243, 199)

DRIVE_URL = "https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma"

def add_header(slide, step_label, title, subtitle=None):
    # Header container
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p0 = tf.paragraphs[0]
    p0.text = step_label.upper()
    p0.font.size = Pt(10)
    p0.font.bold = True
    p0.font.color.rgb = C_PRIMARY
    p0.space_after = Pt(2)
    
    p1 = tf.add_paragraph()
    p1.text = title
    p1.font.size = Pt(20)
    p1.font.bold = True
    p1.font.color.rgb = C_TEXT_MAIN
    
    if subtitle:
        p1.space_after = Pt(2)
        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED

def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_CARD_BORDER, radius=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
    else:
        shape.line.fill.background()
    return shape

# ==========================================
# SLIDE 1: COVER
# ==========================================
s1 = prs.slides.add_slide(blank_layout)
bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg1.fill.solid()
bg1.fill.fore_color.rgb = C_DARK_BG
bg1.line.fill.background()

badge1 = add_card(s1, Inches(0.8), Inches(0.8), Inches(5.8), Inches(0.45), bg_color=RGBColor(30, 41, 59), border_color=C_PRIMARY)
tf_b1 = badge1.text_frame
tf_b1.vertical_anchor = MSO_ANCHOR.MIDDLE
p_b1 = tf_b1.paragraphs[0]
p_b1.text = "UPGRAD SCHOOL OF TECHNOLOGY • WORKSHOP 3"
p_b1.font.size = Pt(11)
p_b1.font.bold = True
p_b1.font.color.rgb = RGBColor(165, 180, 252)

tb_main1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(2.7))
tf_m1 = tb_main1.text_frame
tf_m1.word_wrap = True

p_m1 = tf_m1.paragraphs[0]
p_m1.text = "NearlyY"
p_m1.font.size = Pt(56)
p_m1.font.bold = True
p_m1.font.color.rgb = C_WHITE
p_m1.space_after = Pt(8)

p_m2 = tf_m1.add_paragraph()
p_m2.text = "Hyper-Local Student Living & Essential Services Infrastructure"
p_m2.font.size = Pt(24)
p_m2.font.bold = True
p_m2.font.color.rgb = C_ACCENT
p_m2.space_after = Pt(10)

p_m3 = tf_m1.add_paragraph()
p_m3.text = "Validation Experiment & Evidence Deck • Pune Campus Hub (Lohegaon / ADYPU)\nBrief: 'Sell something that doesn't exist yet.' • 100% Raw Proof Submission"
p_m3.font.size = Pt(13)
p_m3.font.color.rgb = C_TEXT_LIGHT

# Two Bottom Info Cards
c_lead = add_card(s1, Inches(0.8), Inches(4.7), Inches(5.6), Inches(2.1), bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
tf_lead = c_lead.text_frame
tf_lead.margin_left = tf_lead.margin_top = Inches(0.25)
p_l1 = tf_lead.paragraphs[0]
p_l1.text = "FOUNDER & TEAM LEAD"
p_l1.font.size = Pt(10)
p_l1.font.bold = True
p_l1.font.color.rgb = RGBColor(165, 180, 252)
p_l2 = tf_lead.add_paragraph()
p_l2.text = "Sahil Dehadray"
p_l2.font.size = Pt(18)
p_l2.font.bold = True
p_l2.font.color.rgb = C_WHITE
p_l3 = tf_lead.add_paragraph()
p_l3.text = "Ajeenkya DY Patil University (ADYPU), Lohegaon, Pune\nRole: Full-Stack Builder, Customer Discovery & Field Sales Lead"
p_l3.font.size = Pt(11)
p_l3.font.color.rgb = C_TEXT_LIGHT

c_proof = add_card(s1, Inches(6.8), Inches(4.7), Inches(5.7), Inches(2.1), bg_color=RGBColor(30, 41, 59), border_color=C_ACCENT)
tf_proof = c_proof.text_frame
tf_proof.margin_left = tf_proof.margin_top = Inches(0.25)
p_p1 = tf_proof.paragraphs[0]
p_p1.text = "RAW PROOF REPOSITORY (GOOGLE DRIVE EVIDENCE)"
p_p1.font.size = Pt(10)
p_p1.font.bold = True
p_p1.font.color.rgb = C_ACCENT
p_p2 = tf_proof.add_paragraph()
p_p2.text = "15 Recorded Interviews & Payment Proof"
p_p2.font.size = Pt(16)
p_p2.font.bold = True
p_p2.font.color.rgb = C_WHITE
p_p3 = tf_proof.add_paragraph()
p_p3.text = "Folder: 'Interviews-15-People' (14 High-Res Video Files, 1.8+ GB)\nDirect URL: https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma"
p_p3.font.size = Pt(11)
p_p3.font.color.rgb = C_TEXT_LIGHT

# ==========================================
# SLIDE 2: STEP 1 - PROBLEM STATEMENT
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
add_header(s2, "Step 1: Problem Statement (6 to 12 Nov)", "The Class Template & 5-Pillar Problem Breakdown", "Specific, testable problem articulation verified on-ground in Lohegaon student hub")

# Card 1: Filled-in Template Box
c_tpl = add_card(s2, Inches(0.8), Inches(1.5), Inches(11.733), Inches(2.3), bg_color=C_PRIMARY_BG, border_color=C_PRIMARY)
tf_tpl = c_tpl.text_frame
tf_tpl.margin_left = tf_tpl.margin_top = tf_tpl.margin_right = Inches(0.3)
tf_tpl.word_wrap = True

p_t1 = tf_tpl.paragraphs[0]
p_t1.text = "THE OFFICIAL CLASS TEMPLATE:"
p_t1.font.size = Pt(11)
p_t1.font.bold = True
p_t1.font.color.rgb = C_PRIMARY
p_t1.space_after = Pt(6)

p_t2 = tf_tpl.add_paragraph()
run1 = p_t2.add_run()
run1.text = "[Outstation college students moving to Lohegaon/ADYPU] "
run1.font.bold = True
run1.font.color.rgb = C_PRIMARY
run2 = p_t2.add_run()
run2.text = "is trying to "
run3 = p_t2.add_run()
run3.text = "[find reliable mess tiffins, flats/PG without broker lock-in, and laundry within 1.5 km] "
run3.font.bold = True
run3.font.color.rgb = C_PRIMARY
run4 = p_t2.add_run()
run4.text = "but "
run5 = p_t2.add_run()
run5.text = "[local micro-vendors have zero digital presence and brokers charge 1-month upfront brokerage], "
run5.font.bold = True
run5.font.color.rgb = C_DANGER
run6 = p_t2.add_run()
run6.text = "so right now they "
run7 = p_t2.add_run()
run7.text = "[walk 5-8 km in the sun asking seniors, click photos of pole posters, or use spam WhatsApp groups], "
run7.font.bold = True
run7.font.color.rgb = C_WARNING
run8 = p_t2.add_run()
run8.text = "which is bad because "
run9 = p_t2.add_run()
run9.text = "[they waste 20+ hours, lose ₹3,000–₹8,000 in unfair fees, and get locked into unhygienic 30-day meal passes they quit after 3 days]."
run9.font.bold = True
run9.font.color.rgb = C_DANGER
p_t2.font.size = Pt(12.5)

# Card 2: 5 Pillars (Complaint, Problem, Insight, Solution, Signal)
pillars = [
    ("1. Complaint", "Students complain: 'Google Maps pe number band rehta hai ya switch off. Broker bina room dikhaye 1 mahine ka rent maangta hai.'", C_DANGER, C_DANGER_BG),
    ("2. Problem", "Acute information asymmetry & zero transparent rate cards within walking distance of college campuses.", C_WARNING, C_WARNING_BG),
    ("3. Insight", "Students don't want national aggregators (Zomato/Magicbricks). They need a verified 1.5 km campus cheat-sheet with direct 1-tap WhatsApp contacts.", C_PRIMARY, C_PRIMARY_BG),
    ("4. Solution", "NearlyY: Hyper-local verified directory with transparent rate cards, student discount perks, and 1-tap WhatsApp leads.", C_ACCENT, C_ACCENT_BG),
    ("5. Signal", "Students and shopkeepers already use makeshift WhatsApp groups to connect, but struggle with spam, dead links, and trust deficit.", C_DARK_BG, RGBColor(241, 245, 249)),
]

col_w = Inches(2.22)
gap = Inches(0.16)
for i, (title_p, body_p, p_color, bg_p) in enumerate(pillars):
    pos_x = Inches(0.8) + i * (col_w + gap)
    card_p = add_card(s2, pos_x, Inches(4.0), col_w, Inches(2.9), bg_color=bg_p, border_color=p_color)
    tf_p = card_p.text_frame
    tf_p.margin_left = tf_p.margin_right = tf_p.margin_top = Inches(0.15)
    tf_p.word_wrap = True
    
    p_h = tf_p.paragraphs[0]
    p_h.text = title_p
    p_h.font.size = Pt(12)
    p_h.font.bold = True
    p_h.font.color.rgb = p_color
    p_h.space_after = Pt(6)
    
    p_b = tf_p.add_paragraph()
    p_b.text = body_p
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = C_TEXT_MAIN

# ==========================================
# SLIDE 3: STEP 2 - MAP ASSUMPTIONS
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
add_header(s3, "Step 2: Map Your Assumptions (6 to 12 Nov)", "10+ Hypotheses & The Single Riskiest Assumption", "Identified the assumption that kills the business if wrong and had zero proof")

col_w3 = Inches(3.75)
gap3 = Inches(0.24)

# 3 Columns: Want It, Pay For It, Can We Deliver It
col_data = [
    ("1. WANT IT (Demand - Students)", [
        "Students will use a curated campus directory instead of physical walking.",
        "Transparent rate cards and hygiene ratings matter more than generic star reviews.",
        "Students prefer 1-tap WhatsApp chat with shop owners over in-app checkout.",
        "New admissions & 1st-year hostellers experience the highest daily friction."
    ], C_PRIMARY, C_WHITE),
    ("2. PAY FOR IT (Supply - Vendors) [RISKIEST]", [
        "★ RISKIET ASSUMPTION: Local micro-merchants (Mess, Laundry, Gym, PG) will pay an upfront monthly listing fee (₹99 - ₹199/mo) for verified student WhatsApp leads before we have massive traffic.",
        "Merchants prefer a flat subscription over 20-30% aggregator commission cuts.",
        "Merchants will pay instantly via UPI upon in-person onboarding."
    ], C_DANGER, C_DANGER_BG),
    ("3. CAN WE DELIVER IT (Operations)", [
        "We can onboard 30+ merchants in a 1.5 km radius in under 3 days with field walk-ins.",
        "A lightweight mobile PWA / APK provides faster conversion than heavy native apps.",
        "WhatsApp pre-filled message templates provide verifiable lead attribution to shopkeepers.",
        "Merchant rate cards can be updated seamlessly via cloud sync."
    ], C_ACCENT, C_WHITE)
]

for i, (col_title, items, border_c, bg_c) in enumerate(col_data):
    x_pos = Inches(0.8) + i * (col_w3 + gap3)
    card_col = add_card(s3, x_pos, Inches(1.5), col_w3, Inches(4.3), bg_color=bg_c, border_color=border_c)
    tf_c = card_col.text_frame
    tf_c.margin_left = tf_c.margin_right = tf_c.margin_top = Inches(0.2)
    tf_c.word_wrap = True
    
    p_th = tf_c.paragraphs[0]
    p_th.text = col_title
    p_th.font.size = Pt(12)
    p_th.font.bold = True
    p_th.font.color.rgb = border_c
    p_th.space_after = Pt(8)
    
    for item in items:
        p_item = tf_c.add_paragraph()
        p_item.text = "• " + item
        p_item.font.size = Pt(10.5)
        p_item.font.color.rgb = C_TEXT_MAIN
        p_item.space_after = Pt(5)

# Bottom Callout: Why This Kills If Wrong
c_kill = add_card(s3, Inches(0.8), Inches(6.0), Inches(11.733), Inches(1.0), bg_color=RGBColor(30, 41, 59), border_color=C_WARNING)
tf_k = c_kill.text_frame
tf_k.margin_left = tf_k.margin_top = Inches(0.2)
p_k1 = tf_k.paragraphs[0]
p_k1.text = "WHY THE CIRCLED ASSUMPTION KILLS THE IDEA IF WRONG:"
p_k1.font.size = Pt(10)
p_k1.font.bold = True
p_k1.font.color.rgb = C_WARNING
p_k2 = tf_k.add_paragraph()
p_k2.text = "If local micro-businesses refuse to pay upfront (demanding 100% free discovery or commission on actual sales), the B2B SaaS model fails instantly. Students are terrible paying customers; our survival hinges entirely on merchant willingness to pay."
p_k2.font.size = Pt(11)
p_k2.font.color.rgb = C_WHITE

# ==========================================
# SLIDE 4: STEP 3 - TALK TO 15 REAL PEOPLE
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
add_header(s4, "Step 3: Talk to 15 Real People (7 to 14 Nov)", "Real Conversations & Verified Evidence in Lohegaon, Pune", "Asked about the last time it happened • Face-to-face & calls • Raw verbatim quotes • Proof Folder Linked")

# Highlight Banner for Pain Count & Drive Link
b_metric = add_card(s4, Inches(0.8), Inches(1.4), Inches(5.6), Inches(0.85), bg_color=C_ACCENT_BG, border_color=C_ACCENT)
tf_bm = b_metric.text_frame
tf_bm.margin_left = tf_bm.margin_top = Inches(0.15)
p_bm1 = tf_bm.paragraphs[0]
p_bm1.text = "PAIN COUNT: 12 OF 15 PEOPLE (80.0%)"
p_bm1.font.size = Pt(14)
p_bm1.font.bold = True
p_bm1.font.color.rgb = RGBColor(6, 95, 70)
p_bm2 = tf_bm.add_paragraph()
p_bm2.text = "Threshold: 8+ = Strong Problem • 12 raised the problem themselves & pay for clumsy workarounds."
p_bm2.font.size = Pt(9.5)
p_bm2.font.color.rgb = RGBColor(4, 120, 87)

b_link = add_card(s4, Inches(6.6), Inches(1.4), Inches(5.933), Inches(0.85), bg_color=RGBColor(30, 41, 59), border_color=C_PRIMARY)
tf_bl = b_link.text_frame
tf_bl.margin_left = tf_bl.margin_top = Inches(0.15)
p_bl1 = tf_bl.paragraphs[0]
p_bl1.text = "📁 RAW PROOF FOLDER: 14 RECORDED VIDEOS (1.8+ GB)"
p_bl1.font.size = Pt(12)
p_bl1.font.bold = True
p_bl1.font.color.rgb = RGBColor(165, 180, 252)
p_bl2 = tf_bl.add_paragraph()
p_bl2.text = "Google Drive Folder: Interviews-15-People\nLink: https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma"
p_bl2.font.size = Pt(9.5)
p_bl2.font.color.rgb = C_TEXT_LIGHT

# 15 Interviews Table
table_shape = s4.shapes.add_table(16, 5, Inches(0.8), Inches(2.35), Inches(11.733), Inches(4.75))
t = table_shape.table
t.columns[0].width = Inches(0.6)  # #
t.columns[1].width = Inches(2.1)  # Role / Category
t.columns[2].width = Inches(2.4)  # Video Evidence File
t.columns[3].width = Inches(5.633) # Verbatim Quote (Exact Words)
t.columns[4].width = Inches(1.0)  # Pain?

headers = ["#", "Stakeholder / Area", "Google Drive Video File", "Exact Verbatim Quote (Raw Indian Spoken Hindi/English)", "Pain?"]
for j, h in enumerate(headers):
    cell = t.cell(0, j)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

interviews_data = [
    ("1", "Student (1st Yr ADYPU)", "VID_20261110_181735179.mp4 (425MB)", "\"Bhai mess ka khana 3 din baad khaya nahi jata, but deposit de diya toh fas gaya.\"", "YES"),
    ("2", "Student (Flat Resident)", "VID_20261110_203930010.mp4 (211MB)", "\"Broker ne 1 mahine ka rent brokerage maang liya bas room dikhane ke liye.\"", "YES"),
    ("3", "Mess Owner (Porwal Rd)", "VID_20261116_175108359.mp4 (297MB)", "\"Student log aate hain 2 din khate hain fir gayab, naya batch kab aaya pata nahi chalta.\"", "YES"),
    ("4", "Student (Day Scholar)", "VID_20261116_175714324.mp4 (41MB)", "\"Campus ke paas koi gym 1 mahine ka student discount nahi deta, 3 mahine advance maangte.\"", "YES"),
    ("5", "Hosteller (1st Year)", "VID_20261116_175737289.mp4 (27MB)", "\"Dhobi kapde ghumata hai aur time pe nahi deta, exam ke din shirt nahi mili thi.\"", "YES"),
    ("6", "Laundry Owner (Lohegaon)", "VID_20261116_180147119.mp4 (45MB)", "\"Pamphlet chapwate hain ₹2000 ka, aadha raste pe phek dete hain. Direct student chahiye.\"", "YES"),
    ("7", "PG Owner (Air Force Stn)", "VID_20261116_180753106.mp4 (325MB)", "\"Vacant beds rehte hain 2 mahine tak, broker har student pe 15 din ka commission leta hai.\"", "YES"),
    ("8", "Female Student (Hostel)", "VID_20261116_181048884.mp4 (179MB)", "\"Curfew safe hostel aur transparent mess menu online nahi milta, senior pe depend rehna padta hai.\"", "YES"),
    ("9", "Student (3rd Yr Engg)", "VID_20261116_182114493.mp4 (214MB)", "\"Mujhe daily tiffin trial chahiye, direct 30-day card nahi lena. Koi options compare nahi kar sakta.\"", "YES"),
    ("10", "Gym Owner (Lohegaon)", "VID_20261116_182805946.mp4 (19MB)", "\"Justdial waale 15,000 maangte hain saal ka, student aate nahi wahan se. Sasta local option chahiye.\"", "YES"),
    ("11", "Student (Delhi Native)", "VID_20261116_182918630.mp4 (49MB)", "\"Local shopkeepers ke saath language problem hoti hai, WhatsApp pe rate card mil jaye toh best.\"", "YES"),
    ("12", "Tiffin Cloud Kitchen", "VID_20261116_183246097.mp4 (35MB)", "\"WhatsApp groups pe spam karte hain roz menu, log mute kar dete hain. Dedicated listing chahiye.\"", "YES"),
    ("13", "Student (Flat Sharing)", "VID_20261116_184610533.mp4 (241MB)", "\"Room lene ke baad pata chala Wi-Fi aur paani ka issue hai, pehle review nahi tha.\"", "YES"),
    ("14", "Stationery & Xerox Owner", "VID_20261116_184817278.mp4 (43MB)", "\"Daily 200 student aate hain, mess-PG ke baare mein poochte hain, hum bata dete hain.\"", "NO"),
    ("15", "Student (Diwali Call)", "Call Log / Notes (Diwali)", "\"Home town me hoon, sem break ke baad aake naya flat dhoondna hai, authentic list nahi hai.\"", "YES")
]

for row_idx, r_data in enumerate(interviews_data, start=1):
    for c_idx, val in enumerate(r_data):
        cell = t.cell(row_idx, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_WHITE if row_idx % 2 == 1 else RGBColor(248, 250, 252)
        cell.margin_top = cell.margin_bottom = Inches(0.02)
        cell.margin_left = cell.margin_right = Inches(0.05)
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(8)
        if c_idx == 4:
            p.font.bold = True
            p.font.color.rgb = C_ACCENT if val == "YES" else C_TEXT_MUTED
            p.alignment = PP_ALIGN.CENTER
        elif c_idx == 2:
            p.font.color.rgb = C_PRIMARY
        else:
            p.font.color.rgb = C_TEXT_MAIN

# ==========================================
# SLIDE 5: STEP 4 - FILE BET CARD
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
add_header(s5, "Step 4: File Your Bet Card (Checkpoint: Sun 15 Nov)", "Pre-Commitment Before Selling • Pass Mark & Kill Mark Locked", "Success & failure defined upfront with zero moving goalposts")

cards_bet = [
    ("1. THE OFFER", [
        "B2B Merchant Listing: ₹99 Early-Bird Token Advance (Lock-in for 1st Month Listing on NearlyY with verified badge & direct student WhatsApp leads).",
        "Student Promise: 100% Free, verified 1.5 km campus radius directory with zero-brokerage flats and student discounts."
    ], C_PRIMARY, C_PRIMARY_BG),
    ("2. WHAT COUNTS AS A COMMITMENT", [
        "✓ STRICTLY COUNTED: Real money! ₹99 UPI token advance or cash with UTR / payment receipt + signed vendor onboarding sheet.",
        "✕ STRICTLY DISQUALIFIED: Verbal praise ('badiya idea hai'), promise to pay later, website clicks without payment, or Instagram likes."
    ], C_ACCENT, C_ACCENT_BG),
    ("3. REACH TARGET", [
        "Pitch 50+ local micro-merchants across Lohegaon, Porwal Road, and ADYPU perimeter face-to-face.",
        "At least two channels: Physical shop walk-ins and direct WhatsApp business outreach."
    ], C_DARK_BG, RGBColor(241, 245, 249)),
    ("4. PASS MARK VS KILL MARK", [
        "PASS MARK: 8 Paying Merchants (₹99 token advance paid upfront).",
        "KILL MARK: Fewer than 3 Paying Merchants.",
        "MODIFY ZONE: 3 to 7 Paying Merchants (pivot pricing or target category)."
    ], C_DANGER, C_DANGER_BG)
]

w_b = Inches(5.7)
h_b = Inches(2.3)
coords_b = [
    (Inches(0.8), Inches(1.6)),
    (Inches(6.8), Inches(1.6)),
    (Inches(0.8), Inches(4.3)),
    (Inches(6.8), Inches(4.3))
]

for idx, (b_title, b_lines, b_col, b_bg) in enumerate(cards_bet):
    bx, by = coords_b[idx]
    c_card = add_card(s5, bx, by, w_b, h_b, bg_color=b_bg, border_color=b_col)
    tf_c = c_card.text_frame
    tf_c.margin_left = tf_c.margin_right = tf_c.margin_top = Inches(0.2)
    tf_c.word_wrap = True
    
    p_h = tf_c.paragraphs[0]
    p_h.text = b_title
    p_h.font.size = Pt(13)
    p_h.font.bold = True
    p_h.font.color.rgb = b_col
    p_h.space_after = Pt(6)
    
    for line in b_lines:
        p_l = tf_c.add_paragraph()
        p_l.text = line
        p_l.font.size = Pt(11)
        p_l.font.color.rgb = C_TEXT_MAIN
        p_l.space_after = Pt(4)

# ==========================================
# SLIDE 6: STEP 5 - BUILD A ONE-PAGE WEBSITE / MVP
# ==========================================
s6 = prs.slides.add_slide(blank_layout)
add_header(s6, "Step 5: Build a One-Page Website / MVP (1 Day)", "NearlyY Live Mobile Platform & Merchant Claiming Flow", "Tested against our riskiest assumption with price, CTA, and mandatory refund promise")

# Left Column: The Required Headline, Price, One Button & Mandatory Line
c_site = add_card(s6, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3), bg_color=C_WHITE, border_color=C_PRIMARY)
tf_s = c_site.text_frame
tf_s.margin_left = tf_s.margin_right = tf_s.margin_top = Inches(0.25)
tf_s.word_wrap = True

p_s1 = tf_s.paragraphs[0]
p_s1.text = "OFFICIAL LANDING PAGE & MVP SPECIFICATION"
p_s1.font.size = Pt(10)
p_s1.font.bold = True
p_s1.font.color.rgb = C_PRIMARY
p_s1.space_after = Pt(8)

p_s2 = tf_s.add_paragraph()
p_s2.text = "Headline:\n\"NearlyY: Hyper-Local Student Living & Essential Services Infrastructure\""
p_s2.font.size = Pt(14)
p_s2.font.bold = True
p_s2.font.color.rgb = C_TEXT_MAIN
p_s2.space_after = Pt(12)

p_s3 = tf_s.add_paragraph()
p_s3.text = "Price:\n₹99 / month (Early-Bird Merchant Listing Tier)"
p_s3.font.size = Pt(16)
p_s3.font.bold = True
p_s3.font.color.rgb = C_ACCENT
p_s3.space_after = Pt(12)

p_s4 = tf_s.add_paragraph()
p_s4.text = "One Clear Primary CTA Button:\n[ Claim Your Shop Listing & Get Student Leads ]"
p_s4.font.size = Pt(13)
p_s4.font.bold = True
p_s4.font.color.rgb = C_PRIMARY
p_s4.space_after = Pt(14)

p_s5 = tf_s.add_paragraph()
p_s5.text = "Mandatory Class Policy Line (Prominently Displayed):\n\"Launching soon. Any money paid is fully refundable.\""
p_s5.font.size = Pt(12)
p_s5.font.bold = True
p_s5.font.color.rgb = C_DANGER

# Right Column: The Product Feature Engine (Matching PRD)
c_prod = add_card(s6, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.3), bg_color=C_PRIMARY_BG, border_color=C_PRIMARY)
tf_prod = c_prod.text_frame
tf_prod.margin_left = tf_prod.margin_right = tf_prod.margin_top = Inches(0.25)
tf_prod.word_wrap = True

p_p1 = tf_prod.paragraphs[0]
p_p1.text = "FUNCTIONAL MVP FEATURES VALIDATED WITH MERCHANTS"
p_p1.font.size = Pt(11)
p_p1.font.bold = True
p_p1.font.color.rgb = C_PRIMARY
p_p1.space_after = Pt(8)

mvp_features = [
    ("🍛 Mess & Tiffin Hub", "Daily verified thali menus, trial meal booking, transparent monthly passes from ₹70/meal."),
    ("👕 Laundry & Dry Clean", "Wash & fold from ₹10/kg with hostel doorstep pickup tracking."),
    ("🏋️ Gym & Fitness", "Flexible 1-month student passes from ₹800/mo without annual lock-in."),
    ("🏠 Flats & PG Co-living", "Zero-brokerage direct landlord contacts and student verified reviews."),
    ("⚡ 1-Tap WhatsApp Lead Engine", "Direct deep-linking: 'Hi, I saw your listing on NearlyY Pune, please share rates.'"),
    ("📱 Live Android APK & Web App", "Compiled release APK with Capgo live OTA updates + Firestore backend sync.")
]

for feat, desc in mvp_features:
    p_f = tf_prod.add_paragraph()
    p_f.text = f"{feat}: {desc}"
    p_f.font.size = Pt(11)
    p_f.font.color.rgb = C_TEXT_MAIN
    p_f.space_after = Pt(5)

# ==========================================
# SLIDE 7: STEP 6 - SELL IT (FUNNEL & CHANNELS)
# ==========================================
s7 = prs.slides.add_slide(blank_layout)
add_header(s7, "Step 6: Sell It to 50+ People (15 to 19 Nov) — Part 1", "Multi-Channel Sales Funnel & Merchant Conversion", "Pitching real micro-businesses on Porwal Road & Lohegaon student strip")

# 3 Funnel Cards
funnel_steps = [
    ("SAW IT (PITCHED)", "52", "100%", "Walk-ins & direct calls to local shopkeepers across 4 categories", C_DARK_BG),
    ("STOPPED OR ASKED", "28", "53.8%", "Shopkeepers who reviewed rate card, discussed terms & evaluated listing", C_WARNING),
    ("COMMITTED (PAID)", "9", "17.3%", "Merchants paid ₹99 token advance via UPI / cash. (Pass mark was 8!)", C_ACCENT)
]

fw = Inches(3.75)
fgap = Inches(0.24)
for i, (f_title, f_num, f_pct, f_sub, f_col) in enumerate(funnel_steps):
    fx = Inches(0.8) + i * (fw + fgap)
    card_f = add_card(s7, fx, Inches(1.5), fw, Inches(2.2), bg_color=C_WHITE, border_color=f_col)
    tf_f = card_f.text_frame
    tf_f.margin_left = tf_f.margin_right = tf_f.margin_top = Inches(0.2)
    tf_f.word_wrap = True
    
    p_ft = tf_f.paragraphs[0]
    p_ft.text = f_title
    p_ft.font.size = Pt(11)
    p_ft.font.bold = True
    p_ft.font.color.rgb = f_col
    p_ft.space_after = Pt(2)
    
    p_fn = tf_f.add_paragraph()
    p_fn.text = f_num
    p_fn.font.size = Pt(44)
    p_fn.font.bold = True
    p_fn.font.color.rgb = f_col
    
    p_fp = tf_f.add_paragraph()
    p_fp.text = f"Conversion: {f_pct}\n{f_sub}"
    p_fp.font.size = Pt(10.5)
    p_fp.font.color.rgb = C_TEXT_MUTED

# Channel Breakdown (2 Channels required)
c_ch1 = add_card(s7, Inches(0.8), Inches(4.0), Inches(5.7), Inches(2.8), bg_color=C_PRIMARY_BG, border_color=C_PRIMARY)
tf_ch1 = c_ch1.text_frame
tf_ch1.margin_left = tf_ch1.margin_right = tf_ch1.margin_top = Inches(0.2)
p_ch1 = tf_ch1.paragraphs[0]
p_ch1.text = "CHANNEL 1: IN-PERSON SHOP WALK-INS (STREET SALES)"
p_ch1.font.size = Pt(12)
p_ch1.font.bold = True
p_ch1.font.color.rgb = C_PRIMARY
p_ch1.space_after = Pt(6)
p_ch1_b = tf_ch1.add_paragraph()
p_ch1_b.text = "• Target Area: Porwal Road, Lohegaon market, and ADYPU outer gate.\n• Pitch: Demonstrated live NearlyY student interface on phone; showed how a student sends 1-tap WhatsApp lead.\n• Metrics: 38 Shops Walked In | 21 Engaged | 7 Closed with ₹99 UPI Token.\n• Advantage: Face-to-face trust; immediate QR scan."
p_ch1_b.font.size = Pt(11)
p_ch1_b.font.color.rgb = C_TEXT_MAIN

c_ch2 = add_card(s7, Inches(6.8), Inches(4.0), Inches(5.733), Inches(2.8), bg_color=C_ACCENT_BG, border_color=C_ACCENT)
tf_ch2 = c_ch2.text_frame
tf_ch2.margin_left = tf_ch2.margin_right = tf_ch2.margin_top = Inches(0.2)
p_ch2 = tf_ch2.paragraphs[0]
p_ch2.text = "CHANNEL 2: DIRECT WHATSAPP & PHONE CALLS"
p_ch2.font.size = Pt(12)
p_ch2.font.bold = True
p_ch2.font.color.rgb = RGBColor(6, 95, 70)
p_ch2.space_after = Pt(6)
p_ch2_b = tf_ch2.add_paragraph()
p_ch2_b.text = "• Target: Local PG brokers & gym managers sourced from physical posters and college groups.\n• Pitch: Sent 1-minute video demo of NearlyY listing card + ₹99 early-bird lock-in offer.\n• Metrics: 14 Cold Calls / WhatsApp Pitches | 7 Engaged | 2 Closed with ₹99 UPI.\n• Advantage: Scalable follow-ups with digital payment links."
p_ch2_b.font.size = Pt(11)
p_ch2_b.font.color.rgb = C_TEXT_MAIN

# ==========================================
# SLIDE 8: STEP 6 - SELL IT (DAILY LOG & REVENUE)
# ==========================================
s8 = prs.slides.add_slide(blank_layout)
add_header(s8, "Step 6: Sell It to 50+ People — Part 2", "Daily Selling Log & Revenue Collected (15 to 19 Nov)", "Log of 3 numbers logged every evening • Target: 8 Paying Merchants • Result: 9 Paid (112.5%)")

# Left Column: Daily Table
t_log_shape = s8.shapes.add_table(7, 5, Inches(0.8), Inches(1.5), Inches(7.2), Inches(4.2))
tl = t_log_shape.table
tl.columns[0].width = Inches(1.3)
tl.columns[1].width = Inches(1.4)
tl.columns[2].width = Inches(1.6)
tl.columns[3].width = Inches(1.4)
tl.columns[4].width = Inches(1.5)

log_headers = ["Date", "Saw It (Pitched)", "Stopped / Asked", "Committed (Paid)", "UPI Revenue"]
for j, h in enumerate(log_headers):
    c = tl.cell(0, j)
    c.fill.solid()
    c.fill.fore_color.rgb = RGBColor(30, 41, 59)
    p = c.text_frame.paragraphs[0]
    p.text = h
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

daily_records = [
    ("Sun 15 Nov", "10", "5", "1", "₹99"),
    ("Mon 16 Nov", "14", "8", "3", "₹297"),
    ("Tue 17 Nov", "11", "6", "2", "₹198"),
    ("Wed 18 Nov", "9", "5", "2", "₹198"),
    ("Thu 19 Nov", "8", "4", "1", "₹99"),
    ("TOTAL (5 Days)", "52", "28", "9 PAID", "₹891 COLLECTED")
]

for r_i, row in enumerate(daily_records, start=1):
    for c_i, val in enumerate(row):
        cell = tl.cell(r_i, c_i)
        cell.fill.solid()
        if r_i == 6:
            cell.fill.fore_color.rgb = C_ACCENT_BG
        else:
            cell.fill.fore_color.rgb = C_WHITE if r_i % 2 == 1 else RGBColor(248, 250, 252)
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(10)
        if r_i == 6 or c_i == 3:
            p.font.bold = True
            p.font.color.rgb = C_ACCENT if c_i == 3 or r_i == 6 else C_TEXT_MAIN
        else:
            p.font.color.rgb = C_TEXT_MAIN

# Right Column: Pass Mark Success Card & Proof Callout
c_succ = add_card(s8, Inches(8.3), Inches(1.5), Inches(4.233), Inches(4.2), bg_color=C_ACCENT_BG, border_color=C_ACCENT)
tf_sc = c_succ.text_frame
tf_sc.margin_left = tf_sc.margin_right = tf_sc.margin_top = Inches(0.25)
tf_sc.word_wrap = True

p_sc1 = tf_sc.paragraphs[0]
p_sc1.text = "PASS MARK EVALUATION"
p_sc1.font.size = Pt(11)
p_sc1.font.bold = True
p_sc1.font.color.rgb = RGBColor(6, 95, 70)
p_sc1.space_after = Pt(4)

p_sc2 = tf_sc.add_paragraph()
p_sc2.text = "112.5%"
p_sc2.font.size = Pt(48)
p_sc2.font.bold = True
p_sc2.font.color.rgb = C_ACCENT
p_sc2.space_after = Pt(4)

p_sc3 = tf_sc.add_paragraph()
p_sc3.text = "Commitments ÷ Pass Mark:\n• Target Pass Mark: 8 Paying Merchants\n• Actual Paid Commitments: 9 Merchants\n• Result: 9 ÷ 8 = 112.5% Target Achieved!\n• Total Advance Paid: ₹891 via UPI\n• Zero Friends Counted (100% Real Strangers)"
p_sc3.font.size = Pt(11)
p_sc3.font.color.rgb = C_TEXT_MAIN
p_sc3.space_after = Pt(8)

p_sc4 = tf_sc.add_paragraph()
p_sc4.text = "📁 UPI Payment Proof in Google Drive: UTR transaction IDs and shop photos recorded."
p_sc4.font.size = Pt(10)
p_sc4.font.bold = True
p_sc4.font.color.rgb = RGBColor(6, 95, 70)

# Bottom rule notice
c_rule = add_card(s8, Inches(0.8), Inches(6.0), Inches(11.733), Inches(1.0), bg_color=C_WHITE, border_color=C_CARD_BORDER)
tf_rl = c_rule.text_frame
tf_rl.margin_left = tf_rl.margin_top = Inches(0.2)
p_rl = tf_rl.paragraphs[0]
p_rl.text = "WORKSHOP RULE COMPLIANCE: 'Only these count: sign-up with name, time given, pre-order, payment. Friends max 1 in 5.'\n✓ We counted ONLY ₹99 hard UPI payments. Zero friends included. All 9 paying merchants operate commercial shops in Lohegaon."
p_rl.font.size = Pt(10.5)
p_rl.font.bold = True
p_rl.font.color.rgb = C_TEXT_MAIN

# ==========================================
# SLIDE 9: STEP 7 - THE EVIDENCE MATRIX
# ==========================================
s9 = prs.slides.add_slide(blank_layout)
add_header(s9, "Step 7: The Evidence Matrix (19 Nov)", "Plotting Our Validation Dot on the Evidence Matrix", "Y-Axis: Pain Count (12/15) • X-Axis: Commitments ÷ Pass Mark (112.5%)")

# Left Column: The 2x2 Matrix Graphic
c_mat = add_card(s9, Inches(0.8), Inches(1.5), Inches(6.8), Inches(5.3), bg_color=C_WHITE, border_color=C_CARD_BORDER)
tf_m = c_mat.text_frame
tf_m.margin_left = tf_m.margin_top = Inches(0.2)
p_mh = tf_m.paragraphs[0]
p_mh.text = "THE EVIDENCE MATRIX (UPGRAD CLASS FRAMEWORK)"
p_mh.font.size = Pt(11)
p_mh.font.bold = True
p_mh.font.color.rgb = C_TEXT_MUTED

# 4 Quadrants
# Top Left: Modify Solution
q_tl = add_card(s9, Inches(1.2), Inches(2.1), Inches(2.9), Inches(1.9), bg_color=C_WARNING_BG, border_color=C_WARNING)
tf_qtl = q_tl.text_frame
tf_qtl.margin_left = tf_qtl.margin_top = Inches(0.15)
p_qtl = tf_qtl.paragraphs[0]
p_qtl.text = "MODIFY THE SOLUTION\nProblem is real. Offer didn't land."
p_qtl.font.size = Pt(10)
p_qtl.font.bold = True
p_qtl.font.color.rgb = C_WARNING

# Top Right: CONTINUE (OUR DOT IS HERE)
q_tr = add_card(s9, Inches(4.3), Inches(2.1), Inches(2.9), Inches(1.9), bg_color=C_ACCENT_BG, border_color=C_ACCENT)
tf_qtr = q_tr.text_frame
tf_qtr.margin_left = tf_qtr.margin_top = Inches(0.15)
p_qtr = tf_qtr.paragraphs[0]
p_qtr.text = "★ CONTINUE (OUR DOT)\nReal pain + Real commitments."
p_qtr.font.size = Pt(11)
p_qtr.font.bold = True
p_qtr.font.color.rgb = RGBColor(6, 95, 70)
p_qtr2 = tf_qtr.add_paragraph()
p_qtr2.text = "• Pain: 12 / 15 (80%)\n• Commitments: 112.5%\n• 9 Paid Merchants"
p_qtr2.font.size = Pt(10)
p_qtr2.font.color.rgb = C_TEXT_MAIN

# Bottom Left: Kill
q_bl = add_card(s9, Inches(1.2), Inches(4.2), Inches(2.9), Inches(1.9), bg_color=C_DANGER_BG, border_color=C_DANGER)
tf_qbl = q_bl.text_frame
tf_qbl.margin_left = tf_qbl.margin_top = Inches(0.15)
p_qbl = tf_qbl.paragraphs[0]
p_qbl.text = "KILL\nNo pain proven, no commitments."
p_qbl.font.size = Pt(10)
p_qbl.font.bold = True
p_qbl.font.color.rgb = C_DANGER

# Bottom Right: Modify Customer
q_br = add_card(s9, Inches(4.3), Inches(4.2), Inches(2.9), Inches(1.9), bg_color=RGBColor(241, 245, 249), border_color=C_TEXT_LIGHT)
tf_qbr = q_br.text_frame
tf_qbr.margin_left = tf_qbr.margin_top = Inches(0.15)
p_qbr = tf_qbr.paragraphs[0]
p_qbr.text = "MODIFY THE CUSTOMER\nThey said yes, but who really hurts?"
p_qbr.font.size = Pt(10)
p_qbr.font.bold = True
p_qbr.font.color.rgb = C_TEXT_MUTED

# Right Column: Coordinates & Axis Explanation
c_coord = add_card(s9, Inches(7.8), Inches(1.5), Inches(4.733), Inches(5.3), bg_color=C_PRIMARY_BG, border_color=C_PRIMARY)
tf_cd = c_coord.text_frame
tf_cd.margin_left = tf_cd.margin_right = tf_cd.margin_top = Inches(0.25)
tf_cd.word_wrap = True

p_cd1 = tf_cd.paragraphs[0]
p_cd1.text = "QUANTITATIVE MATRIX PLACEMENT"
p_cd1.font.size = Pt(11)
p_cd1.font.bold = True
p_cd1.font.color.rgb = C_PRIMARY
p_cd1.space_after = Pt(8)

p_cd2 = tf_cd.add_paragraph()
p_cd2.text = "1. Y-Axis: Is The Problem Real?\n• Value: 12 / 15 Pain Count (80.0%)\n• Class Threshold: 8+ represents a severe, active problem.\n• Evidence: 12 interviewees actively seek solutions and suffer financial or time loss."
p_cd2.font.size = Pt(11.5)
p_cd2.font.color.rgb = C_TEXT_MAIN
p_cd2.space_after = Pt(12)

p_cd3 = tf_cd.add_paragraph()
p_cd3.text = "2. X-Axis: Did People Commit?\n• Value: Commitments ÷ Pass Mark = 9 ÷ 8 = 112.5%\n• Class Threshold: 100%+ means target hit.\n• Evidence: 9 distinct commercial merchants paid ₹99 token advances via UPI."
p_cd3.font.size = Pt(11.5)
p_cd3.font.color.rgb = C_TEXT_MAIN
p_cd3.space_after = Pt(12)

p_cd4 = tf_cd.add_paragraph()
p_cd4.text = "3. Resulting Quadrant: TOP-RIGHT (CONTINUE)\nReal pain proven with 15 real people + real financial commitment collected before building the product."
p_cd4.font.size = Pt(12)
p_cd4.font.bold = True
p_cd4.font.color.rgb = C_ACCENT

# ==========================================
# SLIDE 10: STEP 7 - DECIDE: CONTINUE & LEARNINGS
# ==========================================
s10 = prs.slides.add_slide(blank_layout)
add_header(s10, "Step 7: The Verdict Call & Field Learnings", "Defending Our Dot with Evidence • Defense Prep for Ashank Bhandari", "Strictly following the class verdict sentence template")

# Top Card: The Exact Verdict Sentence
c_verd = add_card(s10, Inches(0.8), Inches(1.5), Inches(11.733), Inches(2.2), bg_color=C_ACCENT_BG, border_color=C_ACCENT)
tf_vd = c_verd.text_frame
tf_vd.margin_left = tf_vd.margin_right = tf_vd.margin_top = Inches(0.25)
tf_vd.word_wrap = True

p_vd1 = tf_vd.paragraphs[0]
p_vd1.text = "THE OFFICIAL VERDICT SENTENCE (DONE WHEN FORMAT):"
p_vd1.font.size = Pt(11)
p_vd1.font.bold = True
p_vd1.font.color.rgb = RGBColor(6, 95, 70)
p_vd1.space_after = Pt(6)

p_vd2 = tf_vd.add_paragraph()
p_vd2.text = "\"We choose to CONTINUE because 12 out of 15 interviewed students and shopkeepers experienced acute daily discovery friction, and 9 out of 52 pitched merchants committed real money (₹99 UPI advance) before launch.\n\nThe evidence that would change our mind is if merchant renewal drops below 40% in Month 2 or if listed merchants receive fewer than 5 student WhatsApp inquiries per week.\""
p_vd2.font.size = Pt(13.5)
p_vd2.font.bold = True
p_vd2.font.color.rgb = RGBColor(6, 95, 70)

# 3 Learnings Cards
learnings = [
    ("Mess & PG Owners Are Most Desperate", "Mess owners face 30% monthly student dropout; PG owners lose ₹10k/month on vacant beds. They closed fastest because lead cost is cheaper than empty capacity.", C_PRIMARY),
    ("WhatsApp Beats Fancy In-App Systems", "Shopkeepers rejected complex merchant portals. They loved NearlyY because it sends direct WhatsApp chats straight to their personal phones without login hurdles.", C_DARK_BG),
    ("Zero-Brokerage Is The Viral Hook", "Outstation students shared the app organically inside campus hostels solely because of verified 'Zero Brokerage Flat' listings that bypass greedy agents.", C_ACCENT)
]

lw = Inches(3.75)
lgap = Inches(0.24)
for i, (l_title, l_desc, l_col) in enumerate(learnings):
    lx = Inches(0.8) + i * (lw + lgap)
    c_lr = add_card(s10, lx, Inches(3.9), lw, Inches(3.1), bg_color=C_WHITE, border_color=l_col)
    tf_lr = c_lr.text_frame
    tf_lr.margin_left = tf_lr.margin_right = tf_lr.margin_top = Inches(0.2)
    tf_lr.word_wrap = True
    
    p_lt = tf_lr.paragraphs[0]
    p_lt.text = l_title
    p_lt.font.size = Pt(12)
    p_lt.font.bold = True
    p_lt.font.color.rgb = l_col
    p_lt.space_after = Pt(6)
    
    p_ld = tf_lr.add_paragraph()
    p_ld.text = l_desc
    p_ld.font.size = Pt(11)
    p_ld.font.color.rgb = C_TEXT_MAIN

# ==========================================
# SLIDE 11: TEAM & WHO DID WHAT (+ BONUS DELIVERY)
# ==========================================
s11 = prs.slides.add_slide(blank_layout)
add_header(s11, "Team & Deliverables Breakdown", "Who Did What • Bonus Customer Hand-Deliveries • Submission Links", "Complete accountability across all 7 steps • Submission: Fri 20 Nov • D-Day: Sat 21 Nov")

# Left Column: Team Ownership
c_team = add_card(s11, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3), bg_color=C_WHITE, border_color=C_PRIMARY)
tf_tm = c_team.text_frame
tf_tm.margin_left = tf_tm.margin_right = tf_tm.margin_top = Inches(0.25)
tf_tm.word_wrap = True

p_tm1 = tf_tm.paragraphs[0]
p_tm1.text = "TEAM ACCOUNTABILITY & OWNERSHIP"
p_tm1.font.size = Pt(11)
p_tm1.font.bold = True
p_tm1.font.color.rgb = C_PRIMARY
p_tm1.space_after = Pt(8)

p_tm2 = tf_tm.add_paragraph()
p_tm2.text = "Sahil Dehadray (Founder & Team Lead)"
p_tm2.font.size = Pt(15)
p_tm2.font.bold = True
p_tm2.font.color.rgb = C_TEXT_MAIN
p_tm2.space_after = Pt(4)

p_tm3 = tf_tm.add_paragraph()
p_tm3.text = "• Step 1 & 2: Articulated problem statement, identified and circled riskiest monetization assumption.\n• Step 3: Conducted and filmed 10+ student and merchant interviews (1.8+ GB video evidence in Drive).\n• Step 4: Filed Bet Card on Sun 15 Nov; locked pass mark at 8 paying merchants.\n• Step 5: Built full NearlyY mobile PWA & Android APK with real-time Firebase backend & Capgo updates.\n• Step 6: Led Porwal Road street sales; pitched 28 merchants; closed 5 paid ₹99 token advances.\n• Step 7: Formulated Evidence Matrix, Continue verdict, and defended team metrics."
p_tm3.font.size = Pt(10.5)
p_tm3.font.color.rgb = C_TEXT_MAIN
p_tm3.space_after = Pt(8)

p_tm4 = tf_tm.add_paragraph()
p_tm4.text = "Field Associates / Collaborators:\n• Assisted in video recording on Porwal Road & secondary merchant calls (24 pitched, 4 closed).\n• Assisted in filming vertical reel for #UpstartProveIt."
p_tm4.font.size = Pt(10)
p_tm4.font.color.rgb = C_TEXT_MUTED

# Right Column: Bonus Deliveries & Submission Links
c_deliv = add_card(s11, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.3), bg_color=C_PRIMARY_BG, border_color=C_ACCENT)
tf_dv = c_deliv.text_frame
tf_dv.margin_left = tf_dv.margin_right = tf_dv.margin_top = Inches(0.25)
tf_dv.word_wrap = True

p_dv1 = tf_dv.paragraphs[0]
p_dv1.text = "★ BONUS (+10 MARKS): DELIVERED BY HAND TO 3 CUSTOMERS"
p_dv1.font.size = Pt(11)
p_dv1.font.bold = True
p_dv1.font.color.rgb = C_ACCENT
p_dv1.space_after = Pt(6)

bonus_items = [
    ("Customer 1 (Mess):", "Manually escorted an ADYPU 1st-year hosteller to Pakpalak Mess; redeemed 10% student discount pass."),
    ("Customer 2 (Laundry):", "Hand-delivered laundry bag from student hostel to local partner with verified weight & rate receipt."),
    ("Customer 3 (PG Visit):", "Escorted flat-seeking student to Sunrise PG (near Air Force Station) for zero-brokerage landlord meet.")
]

for b_h, b_t in bonus_items:
    p_b = tf_dv.add_paragraph()
    p_b.text = f"• {b_h} {b_t}"
    p_b.font.size = Pt(10.5)
    p_b.font.color.rgb = C_TEXT_MAIN
    p_b.space_after = Pt(4)

p_sub_h = tf_dv.add_paragraph()
p_sub_h.text = "\nOFFICIAL SUBMISSION ASSETS (LMS SUBMISSION):"
p_sub_h.font.size = Pt(11)
p_sub_h.font.bold = True
p_sub_h.font.color.rgb = C_PRIMARY
p_sub_h.space_after = Pt(4)

sub_links = [
    ("📊 11-Slide Deck:", "NearlyY_Workshop3_Presentation.pptx (This presentation)"),
    ("📁 Proof Folder (Interviews):", "https://drive.google.com/drive/u/3/folders/1OJAp8ozetiOnlbrvikD1-AOkdYcMPbma"),
    ("🎬 60-90s Reel:", "Vertical footage filmed on campus, posted with #UpstartProveIt"),
    ("📱 Live Android APK:", "github.com/Hacker2022-web/NearlyY/raw/main/APKs/NearlyY.apk")
]

for sl_h, sl_u in sub_links:
    p_sl = tf_dv.add_paragraph()
    p_sl.text = f"{sl_h} {sl_u}"
    p_sl.font.size = Pt(10)
    p_sl.font.color.rgb = C_TEXT_MAIN

# Save Presentation
out_path = "/Users/sahildehadray/upstart_workshop-3/NearlyY_Workshop3_Presentation.pptx"
prs.save(out_path)
print(f"Successfully generated all 11 slides at: {out_path}")
