"""
Builds an ultra-premium, modern, executive 16:9 widescreen PowerPoint presentation (PPTX)
for 'Raitha Seva' (ರೈತ ಸೇವಾ) designed for jury evaluation and hackathon finals.

Theme: Modern Executive Obsidian & Emerald Tech Theme
- Deep Obsidian Slate & Midnight Forest palette
- Sleek frosted glass cards with colored left accent indicators
- High-contrast typography (Crisp White, Mint Green, Radiant Amber Gold, Cyan)
- Visual badge pills, prominent hero metrics, and clean structured layout
- Exact same comprehensive content, empirical test data, citations, and Kannada vernacular strings
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # =========================================================================
    # ULTRA-PREMIUM COLOR PALETTE (Modern Executive Obsidian & Emerald Tech)
    # =========================================================================
    BG_DARK = RGBColor(10, 15, 26)         # Deep Obsidian Slate (#0A0F1A)
    BG_HEADER = RGBColor(13, 24, 38)       # Slightly elevated obsidian for headers
    CARD_BG = RGBColor(16, 26, 43)         # Frosted glass card fill (#101A2B)
    CARD_BG_ALT = RGBColor(13, 34, 30)     # Subtle emerald tint card fill
    CARD_BORDER = RGBColor(30, 58, 68)     # Soft cyan-slate border (#1E3A44)
    CARD_BORDER_HI = RGBColor(16, 185, 129)# High-contrast emerald border
    
    ACCENT_EMERALD = RGBColor(16, 185, 129) # Vibrant Emerald (#10B981)
    ACCENT_MINT = RGBColor(110, 231, 183)   # Mint Glow (#6EE7B7)
    ACCENT_GOLD = RGBColor(245, 158, 11)    # Radiant Amber Gold (#F59E0B)
    ACCENT_CYAN = RGBColor(6, 182, 212)     # Electric Cyan (#06B6D4)
    ACCENT_ROSE = RGBColor(244, 63, 94)     # Coral Crimson (#F43F5E)
    ACCENT_PURPLE = RGBColor(168, 85, 247)  # Violet Purple (#A855F7)
    
    TEXT_WHITE = RGBColor(255, 255, 255)   # Pure White
    TEXT_MINT = RGBColor(167, 243, 208)    # Light Mint (#A7F3D0)
    TEXT_MUTED = RGBColor(148, 163, 184)   # Silver Slate (#94A3B8)
    TEXT_SUBTLE = RGBColor(100, 116, 139)  # Slate 500 (#64748B)

    def add_blank_slide(bg_color=BG_DARK, slide_num=1, total_slides=13):
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        
        # 1. Main Background Shape
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = bg_color
        bg.line.fill.background()

        # 2. Sleek Dual-Accent Top Banner
        top_bar_green = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(8.5), Inches(0.08))
        top_bar_green.fill.solid()
        top_bar_green.fill.fore_color.rgb = ACCENT_EMERALD
        top_bar_green.line.fill.background()

        top_bar_gold = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(8.5), 0, Inches(4.833), Inches(0.08))
        top_bar_gold.fill.solid()
        top_bar_gold.fill.fore_color.rgb = ACCENT_GOLD
        top_bar_gold.line.fill.background()

        # 3. Bottom Professional Brand & Slide Counter Footer
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(11.7), Inches(0.3))
        ftf = footer_box.text_frame
        ftf.margin_top = ftf.margin_bottom = ftf.margin_left = ftf.margin_right = 0
        fp = ftf.paragraphs[0]
        fp.text = "Raitha Seva (ರೈತ ಸೇವಾ) • AI Operating System for Karnataka's Farmers • Jury Evaluation"
        fp.font.size = Pt(8.5)
        fp.font.color.rgb = TEXT_SUBTLE

        p_num = ftf.add_paragraph()
        p_num.text = f"{slide_num:02d} / {total_slides:02d}"
        p_num.alignment = PP_ALIGN.RIGHT
        p_num.font.size = Pt(8.5)
        p_num.font.bold = True
        p_num.font.color.rgb = ACCENT_EMERALD

        return slide

    def add_header(slide, tag: str, title: str, subtitle: str = ""):
        # Floating Category Tag Pill
        tag_bg = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(3.2), Inches(0.32))
        tag_bg.fill.solid()
        tag_bg.fill.fore_color.rgb = RGBColor(19, 36, 52)
        tag_bg.line.color.rgb = ACCENT_GOLD
        tag_bg.line.width = Pt(1)

        tag_tf = tag_bg.text_frame
        tag_tf.margin_top = Inches(0.03)
        tag_tf.margin_left = Inches(0.12)
        tag_p = tag_tf.paragraphs[0]
        tag_p.text = f"✦  {tag.upper()}"
        tag_p.font.size = Pt(9.5)
        tag_p.font.bold = True
        tag_p.font.color.rgb = ACCENT_GOLD

        # Slide Title & Subtitle Box
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.95))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        tf_t.margin_top = tf_t.margin_bottom = tf_t.margin_left = tf_t.margin_right = 0
        
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE

        if subtitle:
            p_sub = tf_t.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.size = Pt(11.5)
            p_sub.font.color.rgb = TEXT_MINT
            p_sub.space_before = Pt(3)

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER, accent_bar_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)

        # Optional Left Vertical Accent Strip (gives dashboard widget aesthetic)
        if accent_bar_color:
            bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(0.12), height)
            bar.fill.solid()
            bar.fill.fore_color.rgb = accent_bar_color
            bar.line.fill.background()

        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE (Hero Cinematic Dark Theme)
    # =========================================================================
    slide1 = add_blank_slide(bg_color=RGBColor(6, 12, 22), slide_num=1)

    # Decorative Center Glow / Accent Panel
    center_glow = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(11.733), Inches(5.8))
    center_glow.fill.solid()
    center_glow.fill.fore_color.rgb = RGBColor(12, 22, 38)
    center_glow.line.color.rgb = RGBColor(22, 101, 52)
    center_glow.line.width = Pt(1.5)

    # Title & Subtitle Box
    t_box = slide1.shapes.add_textbox(Inches(1.3), Inches(1.2), Inches(10.7), Inches(3.6))
    tf1 = t_box.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "🏆 KRISHI AI HACKATHON / JURY EVALUATION • 2026"
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = ACCENT_GOLD
    p_badge.space_after = Pt(10)

    p_title = tf1.add_paragraph()
    p_title.text = "ರೈತ ಸೇವಾ — Raitha Seva"
    p_title.font.size = Pt(40)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_WHITE
    p_title.space_after = Pt(6)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Kannada-First AI Operating System for Karnataka's Farmers"
    p_sub.font.size = Pt(20)
    p_sub.font.bold = True
    p_sub.font.color.rgb = ACCENT_MINT
    p_sub.space_after = Pt(12)

    p_desc = tf1.add_paragraph()
    p_desc.text = (
        "Solving Karnataka's Agricultural Crisis through Grounded Multimodal Vision Diagnosis,\n"
        "Tri-Authority Official Pest Warnings (UASB + ICAR + KSDA), Real-time APMC Mandi Prices,\n"
        "and Multilingual Vernacular Voice Assistance."
    )
    p_desc.font.size = Pt(13)
    p_desc.font.color.rgb = TEXT_MUTED

    # 3 Glowing Stat Cards on Title Slide
    stats = [
        ("Official Grounding", "100%", "UAS Bengaluru, ICAR & Raitamitra PoP", ACCENT_EMERALD),
        ("False-Positive Rate", "0%", "Strict healthy canopy triage protection", ACCENT_CYAN),
        ("Access Language", "ಕನ್ನಡ", "Kannada-first vernacular AI voice & UI", ACCENT_GOLD)
    ]
    card_w = Inches(3.45)
    card_h = Inches(1.3)
    card_y = Inches(5.1)
    for i, (label, val, note, col) in enumerate(stats):
        cx = Inches(1.3 + i * 3.7)
        c_shape = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, card_y, card_w, card_h)
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = RGBColor(17, 30, 52)
        c_shape.line.color.rgb = col
        c_shape.line.width = Pt(1.5)

        # Left colored accent line
        c_bar = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, card_y, Inches(0.1), card_h)
        c_bar.fill.solid()
        c_bar.fill.fore_color.rgb = col
        c_bar.line.fill.background()

        c_tf = c_shape.text_frame
        c_tf.word_wrap = True
        c_tf.margin_top = Inches(0.15)
        c_tf.margin_left = Inches(0.25)
        
        cp0 = c_tf.paragraphs[0]
        cp0.text = f"{val}  •  {label}"
        cp0.font.size = Pt(14)
        cp0.font.bold = True
        cp0.font.color.rgb = TEXT_WHITE

        cp1 = c_tf.add_paragraph()
        cp1.text = note
        cp1.font.size = Pt(9.5)
        cp1.font.color.rgb = TEXT_MUTED
        cp1.space_before = Pt(3)

    # =========================================================================
    # SLIDE 2: THE GROUND REALITY — FARMERS' CRITICAL PAIN POINTS
    # =========================================================================
    slide2 = add_blank_slide(slide_num=2)
    add_header(
        slide2,
        tag="Problem Discovery",
        title="The Ground Reality: What Critical Problems Are Karnataka Farmers Facing?",
        subtitle="Despite breakthroughs in agricultural institutes, smallholders in Karnataka face systemic information barriers."
    )

    problems = [
        ("Language & Digital Divide", "ಭಾಷಾ ಅಡೆತಡೆ", [
            "Over 85% of existing ag-tech apps are in English or poorly translated Hindi.",
            "Complex botanical and chemical terms confuse smallholder farmers in Mandya, Mysuru, Raichur.",
            "Farmers need conversational voice-first interfaces in native Kannada."
        ], ACCENT_ROSE),
        ("Misdiagnosis & Chemical Misuse", "ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಔಷಧ ದುರ್ಬಳಕೆ", [
            "Uncalibrated AI apps hallucinate diseases (e.g. diagnosing Rice Blast on Maize ears).",
            "Pesticide shops push costly chemicals like Tricyclazole inappropriately.",
            "Toxic systemic fungicides sprayed on edible corn cobs risk farmer health and consumer safety."
        ], ACCENT_ROSE),
        ("Delayed Pest Warnings", "ಕಾಲಮಿತಿಯಿಲ್ಲದ ಕೀಟ ಬಾಧೆ ಎಚ್ಚರಿಕೆಗಳು", [
            "University advisories (UASB, ICAR) are buried in English PDFs and websites.",
            "Farmers discover Fall Armyworm or Leaf Blast only after 30-50% crop loss.",
            "Absence of localized, real-time alert triage linked to official Package of Practices."
        ], ACCENT_GOLD),
        ("Mandi Price Asymmetry", "ಮಾರುಕಟ್ಟೆ ದರ ವಂಚನೆ ಮತ್ತು ದಲ್ಲಾಳಿಗಳು", [
            "Middlemen exploit farmers due to lack of transparent real-time mandi prices.",
            "Farmers distress-sell produce 30-40% below actual APMC modal benchmarks.",
            "No unified tool compares min, max, and modal rates across neighboring districts."
        ], ACCENT_GOLD),
    ]

    for i, (title_p, kn_title, points, col) in enumerate(problems):
        row = i // 2
        col_idx = i % 2
        x = Inches(0.8 + col_idx * 5.95)
        y = Inches(1.85 + row * 2.5)
        card = add_card(slide2, x, y, Inches(5.7), Inches(2.35), accent_bar_color=col)
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.18)

        p_h = tf.paragraphs[0]
        p_h.text = f"🚨 {title_p} ({kn_title})"
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = col
        p_h.space_after = Pt(6)

        for pt in points:
            p_item = tf.add_paragraph()
            p_item.text = f"• {pt}"
            p_item.font.size = Pt(10)
            p_item.font.color.rgb = TEXT_MUTED
            p_item.space_after = Pt(3)

    # =========================================================================
    # SLIDE 3: OUR SOLUTION — RAITHA SEVA PLATFORM OVERVIEW
    # =========================================================================
    slide3 = add_blank_slide(slide_num=3)
    add_header(
        slide3,
        tag="The Solution Architecture",
        title="Our Solution: Raitha Seva (ರೈತ ಸೇವಾ) — The Complete Farmer Companion",
        subtitle="A unified, Kannada-first web platform integrating scientific AI triage with official state agricultural data."
    )

    modules = [
        ("🌿 Plant Disease Doctor", "ಸಸ್ಯ ರೋಗ ತಪಾಸಣೆ", "Multimodal AI visual doctor diagnosing diseased vs healthy crops in 8 structured sections with biological host compatibility.", ACCENT_EMERALD),
        ("🚨 Official Pest Alerts", "ಅಧಿಕೃತ ಕೀಟ ಎಚ್ಚರಿಕೆ", "RAG-powered live alerts synchronized from UAS Bengaluru, ICAR, and Karnataka KSDA Raitamitra.", ACCENT_ROSE),
        ("📊 Live APMC Market Prices", "ಮಾರುಕಟ್ಟೆ ದರಗಳು", "Real-time mandi modal prices across Karnataka districts with min/max rates to eliminate middlemen exploitation.", ACCENT_GOLD),
        ("⛅ Hyperlocal Weather & Spray", "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ", "7-day precipitation, humidity, and agronomic advisory evaluating optimal spraying and harvest windows.", ACCENT_CYAN),
        ("🤖 AI Saathi Voice Assistant", "ಕೃಷಿ AI ಸಾಥಿ", "Conversational audio/text agent fluent in Kannada and English for instant agricultural problem solving.", ACCENT_EMERALD),
        ("🎬 Krishi Reels & Video Feed", "ಕೃಷಿ ವೀಡಿಯೊಗಳು", "Bite-sized visual demonstrations of modern organic farming, drip irrigation, and mechanization techniques.", ACCENT_PURPLE),
        ("📞 24/7 Expert Help & RSK", "ತಜ್ಞರ ಸಹಾಯವಾಣಿ", "Direct telephone integration to Kisan Call Centre (1800-180-1551) and KVK Mandya (08232-277456).", ACCENT_CYAN),
        ("🛡️ Grounded Data Sources", "ಅಧಿಕೃತ ಆಕರಗಳು", "Every chemical dose and diagnostic finding cited directly from UASB & ICAR Package of Practices.", ACCENT_GOLD)
    ]

    for i, (mod_title, kn_name, mod_desc, col) in enumerate(modules):
        r = i // 4
        c = i % 4
        x = Inches(0.8 + c * 2.95)
        y = Inches(1.85 + r * 2.5)
        card = add_card(slide3, x, y, Inches(2.8), Inches(2.35), accent_bar_color=col)
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.24)
        tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.16)

        p0 = tf.paragraphs[0]
        p0.text = mod_title
        p0.font.size = Pt(12)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_WHITE

        p_kn = tf.add_paragraph()
        p_kn.text = kn_name
        p_kn.font.size = Pt(10)
        p_kn.font.bold = True
        p_kn.font.color.rgb = col
        p_kn.space_after = Pt(4)

        p_desc = tf.add_paragraph()
        p_desc.text = mod_desc
        p_desc.font.size = Pt(9.5)
        p_desc.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 4: FEATURE DEEP-DIVE 1 — PLANT DISEASE VISION DOCTOR
    # =========================================================================
    slide4 = add_blank_slide(slide_num=4)
    add_header(
        slide4,
        tag="Core Innovation • Multimodal AI",
        title="Feature 1: Multimodal Plant Disease Doctor & Visual Triage",
        subtitle="Eliminating false positives and toxic chemical misdiagnosis with biological host validation."
    )

    # Left: The Farmer's Problem
    card_l = add_card(slide4, Inches(0.8), Inches(1.85), Inches(5.6), Inches(5.0), accent_bar_color=ACCENT_ROSE)
    tf_l = card_l.text_frame
    tf_l.word_wrap = True
    tf_l.margin_left = Inches(0.3)
    tf_l.margin_right = Inches(0.2)
    tf_l.margin_top = Inches(0.22)

    pl_t = tf_l.paragraphs[0]
    pl_t.text = "❌ THE PROBLEM: Dangerous AI Hallucination in Ag-Tech"
    pl_t.font.size = Pt(13)
    pl_t.font.bold = True
    pl_t.font.color.rgb = ACCENT_ROSE
    pl_t.space_after = Pt(8)

    p_case = tf_l.add_paragraph()
    p_case.text = "Real Bug Repro Scenario:"
    p_case.font.size = Pt(11)
    p_case.font.bold = True
    p_case.font.color.rgb = TEXT_WHITE

    case_items = [
        "A farmer uploaded a photo of a Maize (Corn) ear with rotted kernels.",
        "Generic AI returned: 'Paddy Leaf Blast & Neck Blast (96.2% Confidence)'!",
        "Prescribed Tricyclazole 75% WP to be sprayed on maize.",
        "Disaster: Pyricularia oryzae cannot infect maize cobs. Spraying systemic rice blast fungicides on edible mature kernels causes grain contamination!",
        "Healthy fields were being falsely diagnosed as diseased, forcing farmers to buy needless pesticides."
    ]
    for ci in case_items:
        p = tf_l.add_paragraph()
        p.text = f"• {ci}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(4)

    # Right: Raitha Seva's Engineering Solution
    card_r = add_card(slide4, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.0), accent_bar_color=ACCENT_EMERALD)
    tf_r = card_r.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = Inches(0.3)
    tf_r.margin_right = Inches(0.2)
    tf_r.margin_top = Inches(0.22)

    pr_t = tf_r.paragraphs[0]
    pr_t.text = "✅ OUR SOLUTION: Biological Host Matrix & 8-Section Report"
    pr_t.font.size = Pt(13)
    pr_t.font.bold = True
    pr_t.font.color.rgb = ACCENT_EMERALD
    pr_t.space_after = Pt(8)

    sol_items = [
        ("Step 0: Botanical & Organ Identification", "Computer vision analyzes Excess Green (ExG) index, yellow chlorosis, and cob kernel morphology before any disease inference."),
        ("Strict Host-Pathogen Matrix", "Blocks Rice Blast on Maize/Tomato; Early Blight on Paddy. Intercepts mismatches and corrects to Maize Ear Rot (Fusarium / Spodoptera damage)."),
        ("Chemical Sanitization Guardrails", "Strictly confines Tricyclazole to Paddy. Zero foliar fungicides permitted on edible cobs (recommends sun-drying to <13% moisture & Trichoderma)."),
        ("8 Structured Farmer Sections", "Bilingual Kannada/English report: 1. Identification 2. What is Happening 3. Symptoms 4. Causes 5. Management 6. Prevention 7. Expert Help 8. Source Citations."),
        ("Calibrated Confidence", "Eliminated uncalibrated '96.2%' fake scores. Uses qualitative ratings (HIGH, MODERATE, INCONCLUSIVE) with agronomic safety disclaimers.")
    ]
    for title_s, desc_s in sol_items:
        p_t = tf_r.add_paragraph()
        p_t.text = f"✔ {title_s}:"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_MINT
        
        p_d = tf_r.add_paragraph()
        p_d.text = f"   {desc_s}"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_after = Pt(3)

    # =========================================================================
    # SLIDE 5: FEATURE DEEP-DIVE 2 — OFFICIAL PEST ALERTS & RAG
    # =========================================================================
    slide5 = add_blank_slide(slide_num=5)
    add_header(
        slide5,
        tag="Tri-Authority Knowledge Engine",
        title="Feature 2: Official Pest & Disease Alert System (RAG-Powered)",
        subtitle="Unifying UAS Bengaluru, ICAR, and Karnataka KSDA Raitamitra into an actionable surveillance system."
    )

    # 3 Column Cards for the 3 Authorities
    authorities = [
        ("1. UAS Bengaluru (UASB)", "ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾನಿಲಯ, ಬೆಂಗಳೂರು", "https://www.uasbangalore.edu.in/", [
            "Official Package of Practices (PoP) for Southern Karnataka.",
            "District-specific pest threshold levels (ETL) for Mandya, Mysuru, Bengaluru Rural, Hassan.",
            "Standardized chemical dosage, water dilution ratios, and bio-agent protocols (Trichoderma, Pseudomonas)."
        ], ACCENT_EMERALD),
        ("2. ICAR & ICAR-IIHR", "ಭಾರತೀಯ ಕೃಷಿ ಸಂಶೋಧನಾ ಪರಿಷತ್ತು", "https://icar.org.in/ & iihr.res.in", [
            "National crop protection bulletins and entomological advisories.",
            "Specialized horticultural pest management (IIHR Hessaraghatta) for tomato, brinjal, chilli, onion.",
            "Biological control methods (Neem Seed Kernel Extract NSKE 5%, pheromone traps)."
        ], ACCENT_CYAN),
        ("3. KSDA / Raitamitra", "ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆ / ರೈತಮಿತ್ರ", "https://raitamitra.karnataka.gov.in/", [
            "State Department of Agriculture real-time pest alert bulletins.",
            "Subsidized bio-pesticide and seed treatment distribution notices.",
            "Direct telephone links to 750+ Raitha Samparka Kendras (RSK) and Krishi Vigyan Kendras."
        ], ACCENT_GOLD)
    ]

    for i, (name, kn_name, url, points, col) in enumerate(authorities):
        x = Inches(0.8 + i * 3.95)
        card = add_card(slide5, x, Inches(1.85), Inches(3.75), Inches(3.9), accent_bar_color=col)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.18)

        p0 = tf.paragraphs[0]
        p0.text = name
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = col

        p1 = tf.add_paragraph()
        p1.text = kn_name
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_after = Pt(2)

        p_url = tf.add_paragraph()
        p_url.text = url
        p_url.font.size = Pt(8.5)
        p_url.font.color.rgb = ACCENT_CYAN
        p_url.space_after = Pt(8)

        for pt in points:
            p_pt = tf.add_paragraph()
            p_pt.text = f"• {pt}"
            p_pt.font.size = Pt(9.5)
            p_pt.font.color.rgb = TEXT_MUTED
            p_pt.space_after = Pt(3)

    # Bottom Banner on RAG Architecture
    b_banner = add_card(slide5, Inches(0.8), Inches(5.95), Inches(11.7), Inches(0.95), bg_color=RGBColor(13, 34, 30), border_color=ACCENT_EMERALD, accent_bar_color=ACCENT_GOLD)
    b_tf = b_banner.text_frame
    b_tf.word_wrap = True
    b_tf.margin_left = Inches(0.3)
    b_tf.margin_top = Inches(0.1)

    bp0 = b_tf.paragraphs[0]
    bp0.text = "⚡ RAG Retrieval-Augmented Generation Architecture with ChromaDB Vector Store:"
    bp0.font.size = Pt(11)
    bp0.font.bold = True
    bp0.font.color.rgb = ACCENT_GOLD

    bp1 = b_tf.add_paragraph()
    bp1.text = "Scraped & parsed university bulletins are embedded into ChromaDB with crop and district metadata filters. Every diagnosis query strictly retrieves citations matching the validated host crop, blocking cross-crop advisory leaks."
    bp1.font.size = Pt(9.5)
    bp1.font.color.rgb = TEXT_MINT

    # =========================================================================
    # SLIDE 6: FEATURE DEEP-DIVE 3 — LIVE APMC MARKET PRICES
    # =========================================================================
    slide6 = add_blank_slide(slide_num=6)
    add_header(
        slide6,
        tag="Market Intelligence",
        title="Feature 3: Real-Time APMC Mandi Market Prices",
        subtitle="Empowering farmers with transparent price intelligence across Karnataka markets to eliminate middlemen exploitation."
    )

    # Left: The Farmer's Problem
    card_l6 = add_card(slide6, Inches(0.8), Inches(1.85), Inches(5.6), Inches(5.0), accent_bar_color=ACCENT_ROSE)
    tf_l6 = card_l6.text_frame
    tf_l6.word_wrap = True
    tf_l6.margin_left = Inches(0.3)
    tf_l6.margin_right = Inches(0.2)
    tf_l6.margin_top = Inches(0.22)

    p_p6 = tf_l6.paragraphs[0]
    p_p6.text = "❌ THE PROBLEM: Market Opacity & Distress Selling"
    p_p6.font.size = Pt(13)
    p_p6.font.bold = True
    p_p6.font.color.rgb = ACCENT_ROSE
    p_p6.space_after = Pt(8)

    p6_items = [
        "Karnataka farmers lose ₹400-800 per quintal because village commission agents conceal current mandi rates.",
        "Prices fluctuate drastically between adjacent APMCs (e.g. Mandya vs. Ramanagara vs. Mysuru).",
        "Small farmers cannot afford to transport produce without knowing if prices justify transport costs.",
        "Official government Agmarknet portals are complex, slow, and not mobile-friendly for farmers."
    ]
    for item in p6_items:
        p = tf_l6.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(6)

    # Right: Raitha Seva's Implementation
    card_r6 = add_card(slide6, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.0), accent_bar_color=ACCENT_GOLD)
    tf_r6 = card_r6.text_frame
    tf_r6.word_wrap = True
    tf_r6.margin_left = Inches(0.3)
    tf_r6.margin_right = Inches(0.2)
    tf_r6.margin_top = Inches(0.22)

    p_s6 = tf_r6.paragraphs[0]
    p_s6.text = "✅ OUR IMPLEMENTATION: Live APMC Price Dashboard"
    p_s6.font.size = Pt(13)
    p_s6.font.bold = True
    p_s6.font.color.rgb = ACCENT_GOLD
    p_s6.space_after = Pt(8)

    s6_items = [
        ("Real-Time Price Updates", "Live tracking of Min, Max, and Modal prices (₹/Quintal) updated for key crops: Paddy, Maize, Ragi, Tomato, Onion, Cotton, Sugarcane."),
        ("District & Market Filter", "Farmers can filter prices by their local mandi or compare across Karnataka districts with one click."),
        ("Price Trend Indicators", "Visual indicators show whether commodity prices are rising, falling, or stable compared to the weekly moving average."),
        ("Bilingual Clarity (ಕನ್ನಡ / English)", "Crop varieties and mandi names displayed in clear Kannada script, enabling immediate comprehension at the farmgate."),
        ("Bargaining Power", "Equips farmers with undeniable proof of current modal rates when negotiating with local buyers and traders.")
    ]
    for title_s, desc_s in s6_items:
        p_t = tf_r6.add_paragraph()
        p_t.text = f"✔ {title_s}:"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_GOLD
        
        p_d = tf_r6.add_paragraph()
        p_d.text = f"   {desc_s}"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_after = Pt(3)

    # =========================================================================
    # SLIDE 7: FEATURE DEEP-DIVE 4 — WEATHER & AGRO-ADVISORIES
    # =========================================================================
    slide7 = add_blank_slide(slide_num=7)
    add_header(
        slide7,
        tag="Precision Agronomy",
        title="Feature 4: Hyperlocal Weather & Spray Advisory Engine",
        subtitle="Preventing pesticide runoff and harvest spoilage with intelligent meteorological decision support."
    )

    weather_cards = [
        ("7-Day Hyperlocal Forecast", "7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ", [
            "Pinpoint GPS or district-level forecasts for temperature, humidity, and rainfall probability.",
            "Hourly precipitation trends prevent farmers from applying expensive fertilizers before heavy rains wash them into waterways."
        ], ACCENT_CYAN),
        ("Agronomic Spray Suitability", "ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಸೂಕ್ತತೆಯ ಎಚ್ಚರಿಕೆ", [
            "Evaluates wind speed (must be <15 km/h to prevent spray drift onto neighboring crops).",
            "Evaluates rain probability within 6 hours (prevents costly chemical runoff and ground water contamination).",
            "Provides unambiguous guidance: '✅ ಸಿಂಪರಣೆಗೆ ಸೂಕ್ತ (Good to Spray)' or '⚠️ ಸಿಂಪಡಿಸಬೇಡಿ (Do Not Spray)'."
        ], ACCENT_EMERALD),
        ("Harvest & Grain Drying Advisory", "ಕೊಯ್ಲು ಮತ್ತು ಕಾಳು ಒಣಗಿಸುವಿಕೆ", [
            "Maize and paddy require dry conditions to lower grain moisture below 12-13% to prevent toxic Aspergillus aflatoxin formation.",
            "Warns farmers 48 hours in advance of overcast or rainy periods so threshing and drying floors can be shielded."
        ], ACCENT_GOLD)
    ]

    for i, (title_w, kn_w, points, col) in enumerate(weather_cards):
        x = Inches(0.8 + i * 3.95)
        card = add_card(slide7, x, Inches(1.85), Inches(3.75), Inches(4.9), accent_bar_color=col)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.18)

        p0 = tf.paragraphs[0]
        p0.text = title_w
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_WHITE

        p1 = tf.add_paragraph()
        p1.text = kn_w
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(8)

        for pt in points:
            p_pt = tf.add_paragraph()
            p_pt.text = f"• {pt}"
            p_pt.font.size = Pt(10)
            p_pt.font.color.rgb = TEXT_MUTED
            p_pt.space_after = Pt(6)

    # =========================================================================
    # SLIDE 8: FEATURE DEEP-DIVE 5 & 6 — AI SAATHI & KRISHI REELS
    # =========================================================================
    slide8 = add_blank_slide(slide_num=8)
    add_header(
        slide8,
        tag="Vernacular Engagement",
        title="Features 5 & 6: AI Saathi Conversational Assistant & Krishi Reels",
        subtitle="Making complex scientific agriculture conversational, accessible, and engaging for rural youth."
    )

    # Left: AI Saathi
    card_l8 = add_card(slide8, Inches(0.8), Inches(1.85), Inches(5.6), Inches(5.0), accent_bar_color=ACCENT_EMERALD)
    tf_l8 = card_l8.text_frame
    tf_l8.word_wrap = True
    tf_l8.margin_left = Inches(0.3)
    tf_l8.margin_right = Inches(0.2)
    tf_l8.margin_top = Inches(0.22)

    pl8_t = tf_l8.paragraphs[0]
    pl8_t.text = "🤖 AI Saathi (ಕೃಷಿ AI ಸಾಥಿ) — 24/7 Agro Chatbot"
    pl8_t.font.size = Pt(13)
    pl8_t.font.bold = True
    pl8_t.font.color.rgb = ACCENT_EMERALD
    pl8_t.space_after = Pt(8)

    saathi_points = [
        ("Bilingual Natural Language", "Understands conversational Kannada (ಕನ್ನಡ) and English with voice synthesis and audio playback."),
        ("Karnataka Agronomic Grounding", "Answers tailored to Karnataka agro-climatic zones (Dry zone, Central dry zone, Coastal zone, Hilly zone)."),
        ("Holistic Farming Domains", "Addresses soil health, organic manures (Jeevamrutha, Panchagavya), government subsidies (Kisan Samman, Krishi Bhagya), and dairy farming."),
        ("Offline Safe Responses", "Built with local knowledge fallbacks ensuring farmers get immediate help even in low-bandwidth rural areas.")
    ]
    for t_pt, d_pt in saathi_points:
        p_t = tf_l8.add_paragraph()
        p_t.text = f"✔ {t_pt}:"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_MINT

        p_d = tf_l8.add_paragraph()
        p_d.text = f"   {d_pt}"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_after = Pt(4)

    # Right: Krishi Reels
    card_r8 = add_card(slide8, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.0), accent_bar_color=ACCENT_PURPLE)
    tf_r8 = card_r8.text_frame
    tf_r8.word_wrap = True
    tf_r8.margin_left = Inches(0.3)
    tf_r8.margin_right = Inches(0.2)
    tf_r8.margin_top = Inches(0.22)

    pr8_t = tf_r8.paragraphs[0]
    pr8_t.text = "🎬 Krishi Reels (ಕೃಷಿ ರೀಲ್ಸ್) — Visual Video Learning"
    pr8_t.font.size = Pt(13)
    pr8_t.font.bold = True
    pr8_t.font.color.rgb = ACCENT_PURPLE
    pr8_t.space_after = Pt(8)

    reels_points = [
        ("Engaging Short Video Format", "Young farmers prefer 30-60 second practical video demonstrations over 50-page text manuals."),
        ("Verified Practical Techniques", "Features verified demonstrations: Drip fertigation setup, solar insect light traps, grafting, and mulching."),
        ("Peer-to-Peer Success Stories", "Showcases innovative Karnataka farmers achieving high yields with reduced input costs."),
        ("Zero Bandwidth Waste", "Optimized video streaming format designed to buffer smoothly on rural 4G networks.")
    ]
    for t_pt, d_pt in reels_points:
        p_t = tf_r8.add_paragraph()
        p_t.text = f"✔ {t_pt}:"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = ACCENT_PURPLE

        p_d = tf_r8.add_paragraph()
        p_d.text = f"   {d_pt}"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_after = Pt(4)

    # =========================================================================
    # SLIDE 9: FEATURE DEEP-DIVE 7 — INTEGRATED EXPERT HELP & TELEPHONY
    # =========================================================================
    slide9 = add_blank_slide(slide_num=9)
    add_header(
        slide9,
        tag="Human-in-the-Loop Safety",
        title="Feature 7: Integrated Farmer Support, KVK Helplines & Telephony",
        subtitle="When visual AI triage is inconclusive, farmers have instant one-tap telephony to authorized agronomists."
    )

    support_cards = [
        ("Kisan Call Centre (KCC)", "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (ಉಚಿತ ಸಹಾಯವಾಣಿ)", "1800-180-1551", [
            "Toll-free 24/7 hotline operated by Government of India & Karnataka KSDA.",
            "Staffed by agricultural graduates speaking native Kannada.",
            "Integrated into every diagnostic screen with a single tap call trigger."
        ], ACCENT_EMERALD),
        ("KVK Mandya / District KVKs", "ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK)", "08232-277456", [
            "University of Agricultural Sciences, Bengaluru research extension officers.",
            "Direct link for complex soil pathology, viral wilt, or unknown pest attacks.",
            "Mandya, VC Farm research station telephone directory built into the system."
        ], ACCENT_CYAN),
        ("Raitha Samparka Kendras (RSK)", "ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳು", "Hobli-Level Extension", [
            "Over 750 RSKs across Karnataka provide physical seed testing and input subsidies.",
            "Raitha Seva directs farmers to their nearest hobli center whenever lab testing is required."
        ], ACCENT_GOLD)
    ]

    for i, (title_sp, kn_sp, contact, points, col) in enumerate(support_cards):
        x = Inches(0.8 + i * 3.95)
        card = add_card(slide9, x, Inches(1.85), Inches(3.75), Inches(4.9), accent_bar_color=col)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.18)

        p0 = tf.paragraphs[0]
        p0.text = title_sp
        p0.font.size = Pt(12.5)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_WHITE

        p1 = tf.add_paragraph()
        p1.text = kn_sp
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = col
        p1.space_after = Pt(4)

        p_c = tf.add_paragraph()
        p_c.text = f"📞 {contact}"
        p_c.font.size = Pt(13)
        p_c.font.bold = True
        p_c.font.color.rgb = col
        p_c.space_after = Pt(8)

        for pt in points:
            p_pt = tf.add_paragraph()
            p_pt.text = f"• {pt}"
            p_pt.font.size = Pt(10)
            p_pt.font.color.rgb = TEXT_MUTED
            p_pt.space_after = Pt(6)

    # =========================================================================
    # SLIDE 10: TECHNICAL ARCHITECTURE & RESILIENCE
    # =========================================================================
    slide10 = add_blank_slide(slide_num=10)
    add_header(
        slide10,
        tag="Engineering Excellence",
        title="System Architecture: Scalable, Grounded, and Fail-Safe",
        subtitle="Designed for high availability, zero latency, and seamless offline-ready fallback resilience."
    )

    layers = [
        ("1. Frontend Client Layer", [
            "React 19 + TanStack Router & Start with Server-Side Rendering (SSR).",
            "TailwindCSS with high-contrast accessibility for outdoor sunlight viewing.",
            "Bilingual i18n engine (Kannada first, English fallback) across all features.",
            "Client-side image compression ensures fast uploads on 2G/3G connections."
        ], ACCENT_CYAN),
        ("2. Backend API & Intelligence", [
            "Django REST Framework & Python 3.14 handling REST endpoints.",
            "Multimodal Image Preprocessor calculating Excess Green (ExG), blur, and crop organ masks.",
            "Gemini 2.0 / 1.5 Flash Vision API integration with strict biological schema enforcement.",
            "Biological Host-Pathogen validation engine filtering out physiological impossibilities."
        ], ACCENT_EMERALD),
        ("3. Knowledge Retrieval (RAG)", [
            "ChromaDB Vector Store containing thousands of official Package of Practices chunks.",
            "Semantic embeddings with metadata filters on crop species and administrative districts.",
            "Prevents cross-crop knowledge bleed (maize queries will never return rice blast advisories)."
        ], ACCENT_GOLD),
        ("4. Fail-Safe Fallback Resilience", [
            "Deterministic Agronomic Expert System fallback kicks in if external AI APIs hit rate limits or downtime.",
            "Guarantees 100% operational uptime without leaving farmers stranded.",
            "Pre-compiled UASB / ICAR treatment guidelines embedded in local knowledge engine."
        ], ACCENT_PURPLE)
    ]

    for i, (layer_t, pts, col) in enumerate(layers):
        r = i // 2
        c = i % 2
        x = Inches(0.8 + c * 5.95)
        y = Inches(1.85 + r * 2.5)
        card = add_card(slide10, x, y, Inches(5.7), Inches(2.35), accent_bar_color=col)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.18)

        p_t = tf.paragraphs[0]
        p_t.text = layer_t
        p_t.font.size = Pt(12.5)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_t.space_after = Pt(6)

        for pt in pts:
            p_p = tf.add_paragraph()
            p_p.text = f"• {pt}"
            p_p.font.size = Pt(9.5)
            p_p.font.color.rgb = TEXT_MUTED
            p_p.space_after = Pt(3)

    # =========================================================================
    # SLIDE 11: VALIDATION & BENCHMARK METRICS (FOR JURIES)
    # =========================================================================
    slide11 = add_blank_slide(slide_num=11)
    add_header(
        slide11,
        tag="Verification & Empirical Rigor",
        title="Validation Results: Why the Jury Can Trust Raitha Seva",
        subtitle="Empirical test outcomes from our automated testing suite (39 Passing Regression Tests)."
    )

    metrics = [
        ("0.0%", "False-Positive Rate", "Zero false disease alerts on healthy leaves or wide-field landscape canopy views.", ACCENT_EMERALD),
        ("100%", "Biological Host Accuracy", "Zero impossible diagnoses (e.g. Rice Blast blocked from Maize; Early Blight blocked from Paddy).", ACCENT_CYAN),
        ("100%", "Chemical Safety Enforcement", "Tricyclazole stripped from all non-paddy crops; zero toxic foliar sprays on edible mature cobs.", ACCENT_GOLD),
        ("39 / 39", "Automated Tests Passing", "Full coverage across wide-angle, chlorosis, maize cobs, paddy blast, non-plant, and blurry images.", ACCENT_PURPLE)
    ]

    for i, (val, title_m, desc_m, col) in enumerate(metrics):
        x = Inches(0.8 + i * 2.95)
        card = add_card(slide11, x, Inches(1.85), Inches(2.8), Inches(1.9), border_color=col, accent_bar_color=col)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.24)
        tf.margin_right = Inches(0.15)
        tf.margin_top = Inches(0.16)

        p0 = tf.paragraphs[0]
        p0.text = val
        p0.font.size = Pt(26)
        p0.font.bold = True
        p0.font.color.rgb = col

        p1 = tf.add_paragraph()
        p1.text = title_m
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_after = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = desc_m
        p2.font.size = Pt(9)
        p2.font.color.rgb = TEXT_MUTED

    # Bottom Table: Regression Test Verification Matrix
    tbl_card = add_card(slide11, Inches(0.8), Inches(3.95), Inches(11.7), Inches(2.95), accent_bar_color=ACCENT_EMERALD)
    t_tf = tbl_card.text_frame
    t_tf.word_wrap = True
    t_tf.margin_left = Inches(0.3)
    t_tf.margin_right = Inches(0.2)
    t_tf.margin_top = Inches(0.18)

    tp0 = t_tf.paragraphs[0]
    tp0.text = "📋 Rigorous Automated Regression Test Suite Matrix (Django Test Suite Verified):"
    tp0.font.size = Pt(11.5)
    tp0.font.bold = True
    tp0.font.color.rgb = ACCENT_EMERALD
    tp0.space_after = Pt(5)

    cases = [
        ("Case A (Wide Field Canopy)", "Wide landscape photo of green crop field", "CATEGORY_APPARENTLY_HEALTHY, requests closeup, 0 pesticides", "✅ PASSED"),
        ("Case B (Nutrient Deficiency)", "Yellow chlorotic leaves without necrosis", "CATEGORY_NUTRIENT_OR_STRESS, 19:19:19 @ 5g/L, 0 pesticides", "✅ PASSED"),
        ("Case C (Maize Ear Damage)", "Maize cob with rotted kernels + accidental paddy hint", "Corrects to Maize Ear Rot, identifies Ear part, 0 Tricyclazole", "✅ PASSED"),
        ("Case D (Confirmed Paddy Blast)", "Paddy foliage with spindle brown necrotic lesions", "CATEGORY_POSSIBLE_DISEASE, Tricyclazole 75% WP @ 0.6g/L", "✅ PASSED"),
        ("Case E (Non-Plant Image)", "Indoor surface / tool / household object", "CATEGORY_NON_PLANT, ಸಸ್ಯವಲ್ಲದ ಚಿತ್ರ, 0 agricultural treatments", "✅ PASSED"),
        ("Case F (Blurry / Ambiguous)", "Out-of-focus or low contrast foliage", "CATEGORY_INCONCLUSIVE, requests closer well-lit photo, 0 spray", "✅ PASSED")
    ]
    for c_name, c_inp, c_exp, c_res in cases:
        p_row = t_tf.add_paragraph()
        p_row.text = f"{c_res}  {c_name}: {c_inp} ➜ {c_exp}"
        p_row.font.size = Pt(9)
        p_row.font.color.rgb = TEXT_WHITE
        p_row.space_after = Pt(2)

    # =========================================================================
    # SLIDE 12: DATA SOURCES & CITATIONS (EXPLICIT DATA AUDIT)
    # =========================================================================
    slide12 = add_blank_slide(slide_num=12)
    add_header(
        slide12,
        tag="Data Transparency & Accountability",
        title="Official Data Sources & Institutional Citations",
        subtitle="Where did we collect this data? Complete, verified provenance of every advisory on Raitha Seva."
    )

    sources = [
        ("1. University of Agricultural Sciences, Bengaluru (UASB)", [
            "Portal: https://www.uasbangalore.edu.in/",
            "Data Extracted: Official Package of Practices (PoP) for Field & Horticultural Crops.",
            "Content: Recommended NPK fertilizer doses, pest economic threshold levels, seed treatment protocols.",
            "Authority: Karnataka's premier agricultural university established under Act No. 22 of 1963."
        ], ACCENT_EMERALD),
        ("2. Indian Council of Agricultural Research (ICAR) & ICAR-IIHR", [
            "Portals: https://icar.org.in/ and https://iihr.res.in/",
            "Data Extracted: National Pest Surveillance Guidelines & Biological Control Schedules.",
            "Content: Integrated Pest Management (IPM), pheromone traps, Trichoderma and Pseudomonas dosages.",
            "Authority: Autonomous apex national body coordinating agricultural research under MoA&FW, GoI."
        ], ACCENT_CYAN),
        ("3. Karnataka State Department of Agriculture / KSDA Raitamitra", [
            "Portal: https://raitamitra.karnataka.gov.in/",
            "Data Extracted: Government crop advisories, seasonal pest outbreaks, and subsidy schemes.",
            "Content: Raitha Samparka Kendra (RSK) contacts, seed supply alerts, Kisan Call Centre linkage.",
            "Authority: Government of Karnataka nodal agricultural development department."
        ], ACCENT_GOLD),
        ("4. Agmarknet / Karnataka State Agricultural Marketing Board (KSAMB)", [
            "Portal: https://agmarknet.gov.in/",
            "Data Extracted: Daily mandi arrivals, Minimum, Maximum, and Modal prices (₹/Quintal).",
            "Content: APMC price feeds for Mandya, Mysuru, Bengaluru, Davanagere, Belagavi, Raichur markets."
        ], ACCENT_EMERALD),
        ("5. Open-Meteo & India Meteorological Department (IMD)", [
            "Portals: https://open-meteo.com/ and https://mausam.imd.gov.in/",
            "Data Extracted: Hyperlocal GPS-based precipitation probability, wind velocity, humidity, and temperature.",
            "Content: Calculation of agro-meteorological spray suitability and harvest-drying windows."
        ], ACCENT_CYAN)
    ]

    for i, (s_title, s_points, col) in enumerate(sources):
        y = Inches(1.85 + i * 1.02)
        card = add_card(slide12, Inches(0.8), y, Inches(11.7), Inches(0.92), accent_bar_color=col)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_top = Inches(0.08)

        p0 = tf.paragraphs[0]
        p0.text = s_title
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.color.rgb = col

        p1 = tf.add_paragraph()
        p1.text = " | ".join(s_points)
        p1.font.size = Pt(9)
        p1.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 13: CONCLUSION & FUTURE ROADMAP
    # =========================================================================
    slide13 = add_blank_slide(bg_color=RGBColor(6, 12, 22), slide_num=13)

    # Decorative Center Glow Container
    center_glow13 = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(11.733), Inches(5.8))
    center_glow13.fill.solid()
    center_glow13.fill.fore_color.rgb = RGBColor(12, 22, 38)
    center_glow13.line.color.rgb = ACCENT_GOLD
    center_glow13.line.width = Pt(1.5)

    t_box13 = slide13.shapes.add_textbox(Inches(1.2), Inches(1.15), Inches(10.9), Inches(5.3))
    tf13 = t_box13.text_frame
    tf13.word_wrap = True

    p13_tag = tf13.paragraphs[0]
    p13_tag.text = "✦  SUMMARY & IMPACT ROADMAP"
    p13_tag.font.size = Pt(11)
    p13_tag.font.bold = True
    p13_tag.font.color.rgb = ACCENT_GOLD
    p13_tag.space_after = Pt(8)

    p13_title = tf13.add_paragraph()
    p13_title.text = "Raitha Seva: Transforming Karnataka Agriculture with Reliable AI"
    p13_title.font.size = Pt(28)
    p13_title.font.bold = True
    p13_title.font.color.rgb = TEXT_WHITE
    p13_title.space_after = Pt(16)

    p13_rm = tf13.add_paragraph()
    p13_rm.text = "Strategic Future Roadmap:"
    p13_rm.font.size = Pt(16)
    p13_rm.font.bold = True
    p13_rm.font.color.rgb = ACCENT_MINT
    p13_rm.space_after = Pt(8)

    rm_items = [
        "1. Offline Progressive Web App (PWA): On-device visual diagnosis caching for remote farms without cell towers.",
        "2. Drone & Multispectral Imagery API: Ingesting aerial drone surveys to detect early patch chlorosis across large acreage.",
        "3. IoT Soil Sensor Integration: Real-time telemetry connecting low-cost NPK and moisture sensors to AI Saathi.",
        "4. Vernacular Audio WhatsApp Bot: Permitting farmers to send Kannada voice notes and receive instant voice responses."
    ]
    for rmi in rm_items:
        p = tf13.add_paragraph()
        p.text = f"• {rmi}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(5)

    p_thanks = tf13.add_paragraph()
    p_thanks.text = "ಧನ್ಯವಾದಗಳು — Thank You! Open for Jury Questions & Discussion."
    p_thanks.font.size = Pt(20)
    p_thanks.font.bold = True
    p_thanks.font.color.rgb = ACCENT_GOLD
    p_thanks.space_before = Pt(20)

    # Save to presentation folder
    out_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "Raitha_Seva_Jury_Presentation.pptx")
    try:
        prs.save(out_path)
        print(f"Presentation successfully created at: {out_path}")
    except PermissionError:
        out_path_v2 = os.path.join(out_dir, "Raitha_Seva_Jury_Presentation_Modern.pptx")
        prs.save(out_path_v2)
        print(f"Raitha_Seva_Jury_Presentation.pptx was locked. Saved modern presentation to: {out_path_v2}")

if __name__ == "__main__":
    create_presentation()
