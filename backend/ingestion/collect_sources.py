"""
Official Agricultural Knowledge Base Catalog for Raitha Seva AI.
Sourced from:
- ICAR (Indian Council of Agricultural Research)
- UAS Bangalore (University of Agricultural Sciences, Bengaluru - Package of Practices for Southern Dry Zone / Mandya Zone 6)
- DPPQS (Directorate of Plant Protection, Quarantine & Storage, Govt. of India)
- IMD (Agromet Advisory Service Bulletins, Mandya District)
- KSDA (Karnataka State Department of Agriculture)
"""

import hashlib
from typing import List, Dict, Any

OFFICIAL_SOURCES = [
    {
        "id": "uasb-pop-paddy-2024",
        "crop": "paddy",
        "crop_kn": "ಭತ್ತ / ನೆಲ್ಲು",
        "title": "Package of Practices for High-Yielding Paddy Cultivation in Southern Karnataka (Mandya Region)",
        "source": "University of Agricultural Sciences, Bengaluru (UASB)",
        "source_url": "https://www.uasbangalore.edu.in/extension/package-of-practices",
        "publication_date": "2024-05-15",
        "applicable_region": "Mandya, Mysuru, Ramanagara, Southern Dry Zone",
        "soil_climate": "Clayey loam, alluvial canal-irrigated soils with pH 6.5–7.5",
        "growth_stages": ["nursery", "tillering", "panicle_initiation", "grain_filling", "harvest"],
        "review_status": "expert_reviewed",
        "topics": ["seed_treatment", "nutrient_management", "system_of_rice_intensification", "blast_and_sheath_blight", "stem_borer_ipm"],
        "content_en": """
Paddy Cultivation in Mandya & Cauvery Basin (Zone 6):
1. Varieties: Jyothi, IR-64, BR-2655 (resistant to blast), MTU-1001, Jaya, KMP-175.
2. Seed Rate & Treatment: 20-25 kg/acre for transplanted rice. Treat seeds with Trichoderma harzianum @ 5g/kg or Carbendazim 50% WP @ 2g/kg seed in 1 liter of water to prevent seed-borne blast (Pyricularia oryzae).
3. Nursery & Transplanting: 20-25 days old seedlings should be transplanted at 20x10 cm spacing (2-3 seedlings per hill). For SRI (System of Rice Intensification), 10-12 days single seedling at 25x25 cm spacing.
4. Integrated Nutrient Management (INM) per acre: Apply 10 tonnes Farmyard Manure (FYM) or green leaf manure (Daincha/Sunnhemp) 15 days before transplanting. Recommended chemical fertilizer: 40 kg N (Urea ~87 kg), 20 kg P2O5 (SSP ~125 kg), 20 kg K2O (MOP ~33 kg). Apply 50% N, 100% P, and 50% K as basal dose; remaining 25% N at active tillering (25-30 DAT) and 25% N + 50% K at panicle initiation (50-55 DAT). Zinc sulphate @ 10 kg/acre should be broadcasted basally (do not mix directly with phosphate fertilizers).
5. Water Management: Keep shallow water depth of 2-3 cm for initial 7-10 days, then 5 cm during tillering to panicle emergence. Drain water completely 10-12 days before harvest.
6. Major Pest & Disease Management:
- Yellow Stem Borer (Scirpophaga incertulas): Causes 'dead heart' at vegetative stage and 'white earhead' at reproductive stage. ETL: 2 egg masses/sq.m or 5% dead hearts. Install pheromone traps @ 5-8/acre. Release Trichogramma japonicum egg parasitoid @ 40,000/acre. If ETL crossed, spray Cartap hydrochloride 50% SP @ 2g/liter or Chlorantraniliprole 18.5% SC @ 0.3 ml/liter (observe 14-day pre-harvest waiting period).
- Leaf Blast (Pyricularia oryzae): Diamond-shaped lesions with grey center. Avoid excess urea. Spray Tricyclazole 75% WP @ 0.6g/liter or Isoprothiolane 40% EC @ 1.5 ml/liter.
- Brown Plant Hopper (BPH - Nilaparvata lugens): Sucking pest causing 'hopper burn'. Drain water from fields for 3-4 days to create dry microclimate. Spray Pymetrozine 50% WG @ 0.6g/liter or Triflumezopyrim 10% SC @ 0.5 ml/liter into base of hills.
        """,
        "content_kn": """
ಮಂಡ್ಯ ಮತ್ತು ಕಾವೇರಿ ಕಣಿವೆ ಪ್ರದೇಶದಲ್ಲಿ ಭತ್ತದ ಸುಧಾರಿತ ಬೇಸಾಯ ಕ್ರಮಗಳು:
1. ಸೂಕ್ತ ತಳಿಗಳು: ಜ್ಯೋತಿ, ಬಿಆರ್-2655 (ಬೆಂಕಿ ರೋಗ ನಿರೋಧಕ), ಐಆರ್-64, ಜಯ, ಎಂಟಿಯು-1001, ಕೆಎಂಪಿ-175.
2. ಬೀಜ ಪ್ರಮಾಣ ಮತ್ತು ಉಪಚಾರ: ನಾಟಿ ಪದ್ಧತಿಗೆ ಎಕರೆಗೆ 20-25 ಕೆ.ಜಿ. ಬೀಜ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ 1 ಕೆ.ಜಿ. ಬೀಜಕ್ಕೆ 5 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ 2 ಗ್ರಾಂ ಕಾರ್ಬೆಂಡಾಜಿಮ್ 50% ಡಬ್ಲ್ಯೂಪಿ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.
3. ರಸಗೊಬ್ಬರ ನಿರ್ವಹಣೆ (ಎಕರೆಗೆ): 10 ಟನ್ ತಿಪ್ಪೆಗೊಬ್ಬರ. ಸಾರಜನಕ 40 ಕೆ.ಜಿ (ಯೂರಿಯಾ 87 ಕೆ.ಜಿ), ರಂಜಕ 20 ಕೆ.ಜಿ (ಎಸ್.ಎಸ್.ಪಿ 125 ಕೆ.ಜಿ), ಪೊಟ್ಯಾಷ್ 20 ಕೆ.ಜಿ (ಎಂ.ಒ.ಪಿ 33 ಕೆ.ಜಿ). ರಂಜಕ ಸಂಪೂರ್ಣ ತಳಕೊಬ್ಬರವಾಗಿ ನೀಡಬೇಕು. ಸಾರಜನಕವನ್ನು 3 ಕಂತುಗಳಲ್ಲಿ (ನಾಟಿ ಸಮಯದಲ್ಲಿ 50%, ಕವಲೊಡೆಯುವ 25 ದಿನಕ್ಕೆ 25%, ಮತ್ತು ತೆನೆ ಹೊರಬರುವ 50 ದಿನಕ್ಕೆ 25%) ಕೊಡಿ. ಸತುವಿನ ಕೊರತೆ ತಡೆಗಟ್ಟಲು 10 ಕೆ.ಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ ನೀಡಬೇಕು.
4. ರೋಗ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣ:
- ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್): ಎಲೆಗಳ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ ಚುಕ್ಕೆಗಳು. ನಿಯಂತ್ರಣಕ್ಕೆ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
- ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು: ಮೊಳಕೆ ಒಣಗುವಿಕೆ (ಡೆಡ್ ಹಾರ್ಟ್) ಉಂಟಾಗುತ್ತದೆ. ಎಕರೆಗೆ 5-8 ಲಿಂಗಾಕರ್ಷಕ ಬಲೆ ಅಳವಡಿಸಿ. ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% SC @ 0.3 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
- ಕಂದು ಜಿಗಿಹುಳು: ಹೊಲದಲ್ಲಿ ನೀರನ್ನು 3-4 ದಿನ ಬಸಿದು ಹಾಕಿ ಗಾಳಿಯಾಡುವಂತೆ ಮಾಡಿ. ಪೈಮೆಟ್ರೋಜೈನ್ 50% WG @ 0.6 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
        """
    },
    {
        "id": "uasb-pop-ragi-2024",
        "crop": "ragi",
        "crop_kn": "ರಾಗಿ (ಬೆರಳ ಸಿರಿಧಾನ್ಯ)",
        "title": "Package of Practices for Finger Millet (Ragi) Cultivation in Karnataka",
        "source": "University of Agricultural Sciences, Bengaluru (UASB) & ICAR-AICRP on Small Millets",
        "source_url": "https://www.uasbangalore.edu.in/extension/package-of-practices",
        "publication_date": "2024-04-10",
        "applicable_region": "Mandya, Mysore, Hassan, Tumakuru, Kolar, Chikkaballapura",
        "soil_climate": "Red sandy loam, laterite soils with good drainage; rainfed or semi-irrigated",
        "growth_stages": ["sowing", "seedling", "tillering", "flowering", "maturity"],
        "review_status": "expert_reviewed",
        "topics": ["drought_management", "blast_control", "intercropping", "organic_manuring", "gundu_tholu"],
        "content_en": """
Finger Millet (Ragi) Cultivation Guide for Southern Karnataka:
1. Recommended Varieties: ML-365 (tolerant to blast and drought), GPU-28, MR-1, MR-6, KMR-301, Indaf-8, KMR-630.
2. Sowing Time: July 15 to August 15 for rainfed kharif. Can be sown under irrigated conditions in January-February (Summer Ragi).
3. Seed Rate & Sowing: 5 kg/acre for line sowing with seed drill (30 cm between rows); 2 kg/acre for transplanting or 'Gundu Tholu' method. Treat seed with Azospirillum brasilense and Phosphobacteria biofertilizers @ 200g each per 5 kg seed.
4. Fertilizer Recommendation per acre: Rainfed: 20 kg N (Urea 43 kg), 16 kg P2O5 (SSP 100 kg), 12 kg K2O (MOP 20 kg). Irrigated: 40 kg N, 20 kg P2O5, 20 kg K2O. Apply 100% P and K along with 50% N at sowing; remaining 50% N at 25-30 days after sowing after weeding.
5. Intercropping Systems: Ragi + Red Gram (8:2 or 10:2 ratio), Ragi + Field bean (Avare) provides risk resilience and soil nitrogen enrichment.
6. Pest and Disease Management:
- Ragi Blast (Magnaporthe grisea): Affects leaves, neck, and fingers. Use certified seed of ML-365 or GPU-28. For chemical control, spray Tricyclazole 75% WP @ 0.6g/liter or Mancozeb 75% WP @ 2g/liter at 50% earhead emergence.
- Stem Borer & Armyworm: Dust neem seed kernel extract (NSKE 5%) @ 50g/liter or spray Chlorpyrifos 20% EC @ 2 ml/liter if outbreak occurs.
        """,
        "content_kn": """
ಕರ್ನಾಟಕದಲ್ಲಿ ರಾಗಿ ಸುಧಾರಿತ ಬೇಸಾಯ ಕ್ರಮಗಳು:
1. ಸೂಕ್ತ ತಳಿಗಳು: ಎಂಎಲ್-365 (ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಬರ ನಿರೋಧಕ), ಜಿಪಿಯು-28, ಕೆಎಂಆರ್-301, ಎಂಆರ್-1, ಎಂಆರ್-6, ಕೆಎಂಆರ್-630.
2. ಬಿತ್ತನೆ ಸಮಯ: ಮುಂಗಾರು ಮಳೆ ಆಶ್ರಯದಲ್ಲಿ ಜುಲೈ 15 ರಿಂದ ಆಗಸ್ಟ್ 15. ಬೇಸಿಗೆ ನೀರಾವರಿ ರಾಗಿಗೆ ಜನವರಿ-ಫೆಬ್ರವರಿ.
3. ಬೀಜ ಪ್ರಮಾಣ: ಸಾಲು ಬಿತ್ತನೆಗೆ ಎಕರೆಗೆ 5 ಕೆ.ಜಿ; ನಾಟಿ ಪದ್ಧತಿಗೆ 2 ಕೆ.ಜಿ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಅಜೋಸ್ಪೈರಿಲಂ ಮತ್ತು ರಂಜಕ ಕರಗಿಸುವ ಜೀವಾಣು ಗೊಬ್ಬರ (ಪಿಎಸ್‌ಬಿ) ತಲಾ 200 ಗ್ರಾಂ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.
4. ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ (ಎಕರೆಗೆ): ಮಳೆಯಾಶ್ರಿತ ಬೆಳೆಗೆ 20 ಕೆ.ಜಿ ಸಾರಜನಕ (ಯೂರಿಯಾ 43 ಕೆ.ಜಿ), 16 ಕೆ.ಜಿ ರಂಜಕ (ಎಸ್.ಎಸ್.ಪಿ 100 ಕೆ.ಜಿ), 12 ಕೆ.ಜಿ ಪೊಟ್ಯಾಷ್ (ಎಂ.ಒ.ಪಿ 20 ಕೆ.ಜಿ). ನೀರಾವರಿ ಬೆಳೆಗೆ ಎರಡು ಪಟ್ಟು ಗೊಬ್ಬರ ಬೇಕು. ಅರ್ಧ ಸಾರಜನಕ ಮತ್ತು ಪೂರ್ಣ ರಂಜಕ, ಪೊಟ್ಯಾಷ್ ಬಿತ್ತನೆ ಕಾಲದಲ್ಲಿ ನೀಡಿ, ಉಳಿದ ಸಾರಜನಕವನ್ನು 25-30 ದಿನಗಳ ನಂತರ ಕಳೆ ಕೀಳುವಾಗ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.
5. ರೋಗ ನಿಯಂತ್ರಣ:
- ರಾಗಿ ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್): ಎಲೆ, ಕುತ್ತಿಗೆ ಮತ್ತು ತೆನೆ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಎಂಎಲ್-365 ರೋಗ ನಿರೋಧಕ ತಳಿ ಬಳಸಿ. ನಿಯಂತ್ರಣಕ್ಕೆ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% WP @ 0.6 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ @ 2 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
- ಸೈನಿಕ ಹುಳು / ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು: 5% ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE) ಅಥವಾ ಕ್ಲೋರ್‌ಪೈರಿಫಾಸ್ 20% EC @ 2 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
        """
    },
    {
        "id": "uasb-pop-sugarcane-2024",
        "crop": "sugarcane",
        "crop_kn": "ಕಬ್ಬು",
        "title": "Comprehensive Sugarcane Production & Drip Fertigation Technology for Mandya District",
        "source": "Zonal Agricultural Research Station (ZARS), V.C. Farm, Mandya & ICAR-Sugarcane Breeding Institute",
        "source_url": "https://www.uasbangalore.edu.in/research/zars-mandya",
        "publication_date": "2024-03-20",
        "applicable_region": "Mandya (Sugar City), Mysuru, Chamarajanagar, Belagavi",
        "soil_climate": "Deep rich loams with good drainage, warm tropical climate with abundant sunshine",
        "growth_stages": ["germination", "tillering", "grand_growth", "maturation", "ripening"],
        "review_status": "expert_reviewed",
        "topics": ["sett_treatment", "drip_fertigation", "early_shoot_borer", "woolly_aphid", "trash_mulching"],
        "content_en": """
Sugarcane Cultivation Protocol in Mandya (Sugar Bowl of Karnataka):
1. Varieties: Co 86032 (Nayana - high sugar recovery), Co 62175, VCF 0517, Co 0212, Co 09004.
2. Planting Seasons: Adsali (July-August - highest yield), Eksali (January-February), Pre-seasonal (October-November).
3. Sett Selection & Treatment: Use top 1/3 portion of 8-10 month cane. Treat setts with Carbendazim 50% WP @ 1g/liter + Malathion 50% EC @ 1 ml/liter for 15 minutes before planting to control smut, sett rot, and scale insects.
4. Spacing: Paired row planting (75 cm - 150 cm - 75 cm) or wide furrow at 120-150 cm to facilitate mechanical earthing-up and drip irrigation.
5. Fertilizer Schedule per acre:
- Normal cultivation: 100 kg N (Urea 217 kg), 40 kg P2O5 (SSP 250 kg), 50 kg K2O (MOP 83 kg). Apply P full at planting, N & K in 4 splits: 10% at planting, 20% at 45 DAP, 30% at 90 DAP, 40% at earthing-up (120-150 DAP).
- Under Drip Fertigation: Water saving of 40% and fertilizer saving of 25-30% using water-soluble fertilizers (19-19-19, 13-0-45, Urea) weekly through venturi injector.
6. Major Pest & Disease Management:
- Early Shoot Borer (Chilo infuscatellus): Attacking before 90 DAP. Dead hearts emit offensive odor when pulled. Trash mulching @ 3 tonnes/acre reduces borer incidence by 40%. Earthing-up at 45 DAP. Spray Chlorantraniliprole 18.5% SC @ 0.4 ml/liter or apply Cartap hydrochloride 4G granules @ 10 kg/acre in furrows.
- Sugarcane Woolly Aphid (Ceratovacuna lanigera): White woolly colonies under leaves. Conserve natural predators: Dipha aphidivora, Micromus igorotus. Spray Acephate 75% SP @ 1.5g/liter if biological control is delayed.
- Red Rot (Colletotrichum falcatum): Use disease-free setts from registered nurseries; crop rotation with paddy.
        """,
        "content_kn": """
ಮಂಡ್ಯ ಜಿಲ್ಲೆಯಲ್ಲಿ ಕಬ್ಬು ಬೆಳೆಯ ಸಮಗ್ರ ಬೇಸಾಯ ತಂತ್ರಜ್ಞಾನ:
1. ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳು: ಕೊ 86032 (ನಯನ - ಅಧಿಕ ಸಕ್ಕರೆ ಅಂಶ), ಕೊ 62175, ವಿಸಿಎಫ್ 0517 (ಮಂಡ್ಯ ವಿಸಿ ಫಾರ್ಮ್ ತಳಿ), ಕೊ 0212.
2. ನಾಟಿ ಕಾಲ: ಅಡ್ಸಾಲಿ (ಜುಲೈ-ಆಗಸ್ಟ್), ಏಕಸಾಲಿ (ಜನವರಿ-ಫೆಬ್ರವರಿ).
3. ಬಿತ್ತನೆ ಬೀಜ (ಕಣ್ಣುಗಳ) ಉಪಚಾರ: 8-10 ತಿಂಗಳ ವಯಸ್ಸಿನ ಕಬ್ಬಿನ ಮೇಲ್ಭಾಗದ ತುಂಡುಗಳನ್ನು 1 ಗ್ರಾಂ ಕಾರ್ಬೆಂಡಾಜಿಮ್ ಮತ್ತು 1 ಮಿ.ಲೀ ಮಲಾಥಿಯಾನ್ ಬೆರೆಸಿದ 1 ಲೀಟರ್ ನೀರಿನ ದ್ರಾವಣದಲ್ಲಿ 15 ನಿಮಿಷ ನೆನೆಸಿ ನಾಟಿ ಮಾಡಿ (ಕಾಡಿಗೆ ರೋಗ ಮತ್ತು ಬೆಂಕಿ ರೋಗ ತಡೆಗಟ್ಟಲು).
4. ರಸಗೊಬ್ಬರ ನಿರ್ವಹಣೆ (ಎಕರೆಗೆ): 100 ಕೆ.ಜಿ ಸಾರಜನಕ, 40 ಕೆ.ಜಿ ರಂಜಕ, 50 ಕೆ.ಜಿ ಪೊಟ್ಯಾಷ್. ರಂಜಕ ಸಂಪೂರ್ಣವಾಗಿ ನಾಟಿ ಸಮಯದಲ್ಲಿ ನೀಡಿ. ಸಾರಜನಕ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಅನ್ನು 4 ಕಂತುಗಳಲ್ಲಿ (ನಾಟಿ ಸಮಯದಲ್ಲಿ, 45 ನೇ ದಿನಕ್ಕೆ, 90 ನೇ ದಿನಕ್ಕೆ ಮತ್ತು 120-150 ನೇ ದಿನ ದೊಡ್ಡ ಸಾಲು ಏರಿಸುವಾಗ) ನೀಡಿ.
5. ರೋಗ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣ:
- ಸುಳಿ ಕೊರೆಯುವ ಹುಳು: ನಾಟಿಯಾದ 90 ದಿನಗಳೊಳಗೆ ಕಾಡುತ್ತದೆ. ಒಣಗಿದ ಸುಳಿಯನ್ನು ಎಳೆದರೆ ಕೆಟ್ಟ ವಾಸನೆ ಬರುತ್ತದೆ. ಎಕರೆಗೆ 3 ಟನ್ ಕಬ್ಬಿನ ರವದಿಯನ್ನು ಸಾಲುಗಳ ನಡುವೆ ಹರಡಿ (ರವದಿ ಹೊದಿಕೆ). ನಾಟಿ ಸಮಯದಲ್ಲಿ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% SC @ 0.4 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
- ಬಿಳಿ ಗೂಡು ನುಸಿ (ವುಲ್ಲಿ ಆಫಿಡ್): ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಬಣ್ಣದ ಹತ್ತಿಯಂತಹ ಕೀಟಗಳು. ಡಿಫಾ ಪ್ರಿಡೇಟರ್ ಕೀಟಗಳನ್ನು ಬಿಡಿ. ತೀವ್ರವಾದರೆ ಅಸಿಫೇಟ್ 75% SP @ 1.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
        """
    },
    {
        "id": "uasb-pop-maize-2024",
        "crop": "maize",
        "crop_kn": "ಮೆಕ್ಕೆಜೋಳ",
        "title": "Maize Production & Fall Armyworm (FAW) Integrated Management Guidelines",
        "source": "ICAR-Indian Institute of Maize Research & UAS Bengaluru",
        "source_url": "https://iimr.icar.gov.in/fall-armyworm-management",
        "publication_date": "2024-06-01",
        "applicable_region": "Mandya, Davanagere, Haveri, Belagavi, Ballari",
        "soil_climate": "Well-drained sandy loam to clay loam, pH 6.0–7.5",
        "growth_stages": ["vegetative", "knee_high", "tasseling", "silking", "dough", "maturity"],
        "review_status": "expert_reviewed",
        "topics": ["fall_armyworm_ipm", "pith_application", "zinc_deficiency", "fertilizer_management"],
        "content_en": """
Maize Production and Fall Armyworm (FAW) Management:
1. Varieties: NAH-1137, Deccan 103, CP 818, Bio-9681, PAC-740, Hema.
2. Seed Rate & Spacing: 7-8 kg/acre at 60 cm row-to-row and 20 cm plant-to-plant.
3. Seed Treatment: Fortify seeds with Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS @ 4 ml/kg seed for initial 20 days protection against Fall Armyworm.
4. Fertilizer per acre: 60 kg N (Urea 130 kg), 30 kg P2O5 (SSP 187 kg), 16 kg K2O (MOP 27 kg), and Zinc Sulphate 10 kg. Apply full P, K and 1/3rd N as basal; 1/3rd N at knee-high stage (30 DAS) and 1/3rd N at tasseling stage (50 DAS).
5. Integrated Management of Fall Armyworm (Spodoptera frugiperda):
- Monitor window pane feeding marks and ragged leaves with frass in whorls.
- Install FAW pheromone traps @ 4-6 traps/acre.
- Bio-agent: Spray Bacillus thuringiensis (Bt) kurstaki @ 2g/liter or Metarhizium anisopliae @ 5g/liter at early vegetative stage.
- Push-Pull technology: Plant Desmodium as intercrop (repels moths) and Napier grass on borders (trap crop).
- Chemical whorl application (only when ETL > 10% damaged plants): Emamectin benzoate 5% SG @ 0.4g/liter or Spinetoram 11.7% SC @ 0.5 ml/liter directed into plant whorls using knapsack sprayer with hollow cone nozzle.
        """,
        "content_kn": """
ಮೆಕ್ಕೆಜೋಳ ಮತ್ತು ಸೈನಿಕ ಹುಳು (ಫಾಲ್ ಆರ್ಮಿವರ್ಮ್) ಸಮಗ್ರ ನಿರ್ವಹಣೆ:
1. ಸುಧಾರಿತ ತಳಿಗಳು: ಎನ್ಎಹೆಚ್-1137, ಡೆಕ್ಕನ್-103, ಸಿಪಿ-818, ಬಯೋ-9681, ಹೇಮಾ.
2. ಬೀಜ ಪ್ರಮಾಣ: ಎಕರೆಗೆ 7-8 ಕೆ.ಜಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ 60 ಸೆಂ.ಮೀ, ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ 20 ಸೆಂ.ಮೀ ಅಂತರ.
3. ಬೀಜೋಪಚಾರ: ಸೈನಿಕ ಹುಳು ಬಾಧೆ ತಡೆಯಲು 1 ಕೆ.ಜಿ ಬೀಜಕ್ಕೆ ಸಯಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ + ಥಯಾಮೆಥಾಕ್ಸಮ್ (ಫೋರ್ಟೆನ್ಜಾ ಡ್ಯುಯೊ) @ 4 ಮಿ.ಲೀ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.
4. ರಸಗೊಬ್ಬರ (ಎಕರೆಗೆ): 60 ಕೆ.ಜಿ ಸಾರಜನಕ (ಯೂರಿಯಾ 130 ಕೆ.ಜಿ), 30 ಕೆ.ಜಿ ರಂಜಕ (ಎಸ್.ಎಸ್.ಪಿ 187 ಕೆ.ಜಿ), 16 ಕೆ.ಜಿ ಪೊಟ್ಯಾಷ್ (ಎಂ.ಒ.ಪಿ 27 ಕೆ.ಜಿ), 10 ಕೆ.ಜಿ ಜಿಂಕ್ ಸಲ್ಫೇಟ್. ಸಾರಜನಕವನ್ನು ಬಿತ್ತನೆ ಕಾಲ, ಮಂಡಿ ಎತ್ತರದ ಹಂತ (30 ದಿನ) ಮತ್ತು ಜೊಂಡು ಬರುವ ಹಂತದಲ್ಲಿ (50 ದಿನ) ಮೂರು ಸಮಪಾಲುಗಳಲ್ಲಿ ಕೊಡಿ.
5. ಕೀಟ ನಿರ್ವಹಣೆ (ಫಾಲ್ ಆರ್ಮಿವರ್ಮ್ ಸೈನಿಕ ಹುಳು):
- ಸುಳಿಯಲ್ಲಿ ಹುಳು ಇರುವುದು ಮತ್ತು ಹಿಕ್ಕೆಯುಳ್ಳ ರಂಧ್ರಗಳಿರುವ ಎಲೆಗಳು ಪ್ರಮುಖ ಲಕ್ಷಣ.
- ಎಕರೆಗೆ 4-6 ಲಿಂಗಾಕರ್ಷಕ ಬಲೆ ಅಳವಡಿಸಿ.
- ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಮೆಟಾರೈಜಿಯಮ್ ಅಥವಾ ಬಿಟಿ ಜೈವಿಕ ಕೀಟನಾಶಕ @ 2 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
- ಬಾಧೆ ಶೇ.10 ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೇಟ್ 5% SG @ 0.4 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ಸ್ಪೈನಟೋರಾಮ್ 11.7% SC @ 0.5 ಮಿ.ಲೀ/ಲೀಟರ್ ದ್ರಾವಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸುಳಿಯೊಳಗೆ ಬೀಳುವಂತೆ ಸಿಂಪಡಿಸಿ.
        """
    },
    {
        "id": "uasb-pop-redgram-2024",
        "crop": "pulses",
        "crop_kn": "ತೊಗರಿ / ಬೇಳೆಕಾಳುಗಳು",
        "title": "Red Gram (Pigeonpea) and Pulses Package of Practices for Dryland Farmers",
        "source": "UAS Bengaluru & ICAR-Indian Institute of Pulses Research",
        "source_url": "https://www.uasbangalore.edu.in/extension/pulses-advisory",
        "publication_date": "2024-05-02",
        "applicable_region": "Mandya, Kalaburagi (Tur Bowl), Raichur, Vijayapura, Tumakuru",
        "soil_climate": "Deep black soils or red sandy loams with excellent drainage, pH 6.5–8.0",
        "growth_stages": ["vegetative", "branching", "flowering", "pod_formation", "maturity"],
        "review_status": "expert_reviewed",
        "topics": ["nipping", "sterility_mosaic", "pod_borer_helicoverpa", "rhizobium_inoculation", "pulse_magic"],
        "content_en": """
Red Gram (Tur / Arhar) Production Practices:
1. Varieties: BRG-1, BRG-2, BRG-4, ICPH-2671 (hybrid), GRG-811, BSMR-736 (resistant to wilt and sterility mosaic).
2. Seed Treatment: Treat seeds with Rhizobium leguminosarum + PSB @ 200g each per 5 kg seeds + Trichoderma harzianum @ 5g/kg to manage Fusarium wilt.
3. Spacing & Agronomy: Sole crop at 90x20 cm or paired row 120x30 cm. Nipping of terminal bud at 45-50 DAS encourages profuse secondary branching and pod bearing.
4. Foliar Nutrition: Spray 'Pulse Magic' (formulated micronutrient cocktail by UAS) @ 10g/liter or 1% 19-19-19 + 0.2% Boron at 50% flowering and 15 days later to prevent flower drop and increase pod filling by 20%.
5. Major Pest Management:
- Gram Pod Borer (Helicoverpa armigera): Larvae feed by inserting head into pods. Install 5 pheromone traps/acre. Plant African marigold as trap crop (1 line per 10 lines of red gram). Spray HaNPV 250 LE/acre or NSKE 5% at flowering. If ETL (1 larva/plant) is crossed, spray Chlorantraniliprole 18.5% SC @ 0.3 ml/liter or Indoxacarb 14.5% SC @ 0.7 ml/liter.
- Sterility Mosaic Disease (SMD): Transmitted by Aceria cajani mite. Eradicate infected stunted bushy plants immediately. Spray Fenazaquin 10% EC @ 1 ml/liter for vector control.
        """,
        "content_kn": """
ತೊಗರಿ ಬೇಸಾಯ ಕ್ರಮಗಳು ಮತ್ತು ಹೂವುದುರುವಿಕೆ ತಡೆಗಟ್ಟುವ ತಂತ್ರಜ್ಞಾನ:
1. ತಳಿಗಳು: ಬಿಆರ್‌ಜಿ-1, ಬಿಆರ್‌ಜಿ-2, ಬಿಆರ್‌ಜಿ-4, ಜಿಆರ್‌ಜಿ-811, ಬಿಎಸ್‌ಎಂಆರ್-736 (ವಸ್ತು ಮತ್ತು ಬಂಜೆರೋಗ ನಿರೋಧಕ).
2. ಬೀಜೋಪಚಾರ: 5 ಕೆ.ಜಿ ಬೀಜಕ್ಕೆ ರೈಜೋಬಿಯಂ ಮತ್ತು ಪಿಎಸ್‌ಬಿ ತಲಾ 200 ಗ್ರಾಂ ಹಾಗೂ ಸೊರಗು ರೋಗ ತಡೆಗೆ 1 ಕೆ.ಜಿ ಬೀಜಕ್ಕೆ 5 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಪುಡಿ ಹಾಕಿ ಕಲೆಸಿ ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ ಬಿತ್ತನೆ ಮಾಡಿ.
3. ಸುಳಿ ಚಿವುಟುವಿಕೆ (Nipping): ಬಿತ್ತನೆಯ 45-50 ದಿನಗಳಲ್ಲಿ ಮುಖ್ಯ ಕಾಂಡದ ತುದಿಯನ್ನು 2-3 ಇಂಚು ಚಿವುಟುವುದರಿಂದ ಪಕ್ಕದ ಕೊಂಬೆಗಳು ಹೆಚ್ಚು ಒಡೆದು ಇಳುವರಿ ಶೇ. 25-30 ರಷ್ಟು ಹೆಚ್ಚುತ್ತದೆ.
4. ಹೂವು ಉದುರುವಿಕೆ ತಡೆಗೆ: ಶೇ. 50 ರಷ್ಟು ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ 10 ಗ್ರಾಂ 'ಪಲ್ಸ್ ಮ್ಯಾಜಿಕ್' (Pulse Magic) ಅಥವಾ 19-19-19 @ 5 ಗ್ರಾಂ + ಬೋರಾನ್ 1 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
5. ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು (ಹೆಲಿಕೋವರ್ಪ): ಮರಿ ಹುಳುಗಳು ಕಾಯಿಗೆ ರಂಧ್ರ ಕೊರೆದು ಕಾಳು ತಿನ್ನುತ್ತವೆ. ಎಕರೆಗೆ 5 ಲಿಂಗಾಕರ್ಷಕ ಬಲೆ ಹಾಕಿ. ಶೇ. 5 ರ ಬೇವಿನ ಬೀಜದ ಕಷಾಯ ಸಿಂಪಡಿಸಿ. ಬಾಧೆ ಮಿತಿ ಮೀರಿದರೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% SC @ 0.3 ಮಿ.ಲೀ/ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
        """
    },
    {
        "id": "uasb-pop-vegetables-tomato-chilli-2024",
        "crop": "vegetables",
        "crop_kn": "ತರಕಾರಿ ಬೆಳೆಗಳು (ಟೊಮೆಟೊ, ಮೆಣಸಿನಕಾಯಿ, ಈರುಳ್ಳಿ)",
        "title": "Vegetable Integrated Pest & Nutrient Management for Karnataka Horticultural Belts",
        "source": "ICAR-Indian Institute of Horticultural Research (IIHR, Hessaraghatta, Bengaluru)",
        "source_url": "https://iihr.icar.gov.in/crop-protection-technologies",
        "publication_date": "2024-04-18",
        "applicable_region": "Mandya, Kolar, Chikkaballapura, Belagavi, Haveri",
        "soil_climate": "Well-drained fertile loam with good organic matter, soil pH 6.0–7.0",
        "growth_stages": ["nursery", "vegetative", "flowering", "fruiting", "multiple_pickings"],
        "review_status": "expert_reviewed",
        "topics": ["tomato_pinworm_tuta", "chilli_leaf_curl_murda", "onion_purple_blotch", "iihr_special_micronutrients"],
        "content_en": """
Tomato, Chilli, and Onion Comprehensive Horticultural Guide:
1. Tomato (Solanum lycopersicum):
- Varieties/Hybrids: Arka Rakshak (triple disease resistant to ToLCV, Early Blight & Bacterial Wilt), Arka Samrat, Shivam.
- Spacing: 90x60 cm on raised beds with silver-black plastic mulch (25 micron) and drip irrigation.
- Tomato Pinworm (Tuta absoluta): Mines into leaves and bores fruits near calyx. Install Tuta pheromone traps @ 16 traps/acre. Spray Flubendiamide 39.35% SC @ 0.3 ml/liter or Chlorantraniliprole 18.5% SC @ 0.3 ml/liter.
- Early & Late Blight: Spray Mancozeb 75% WP @ 2g/liter or Dimethomorph 50% WP @ 1g/liter alternating with Azoxystrobin 23% SC @ 1 ml/liter.
2. Chilli (Capsicum annuum):
- Varieties: Arka Kyathi, Arka Meghna, Byadagi Kaddi, Byadagi Dabbi, G-4.
- Murda Disease / Leaf Curl Complex: Sucking pests (Thrips & Yellow Mites) transmit virus. Yellow sticky traps (10/acre) for whitefly; Blue sticky traps (10/acre) for thrips. Spray Diafenthiuron 50% WP @ 1.2g/liter or Spinetoram 11.7% SC @ 0.9 ml/liter for thrips. For mites, spray Spiromesifen 22.9% SC @ 1 ml/liter.
3. Onion (Allium cepa):
- Varieties: Arka Kalyan, Arka Lalima, Bhima Super.
- Purple Blotch (Alternaria porri): Purple necrotic sunken spots on leaves. Spray Tebuconazole 25.9% EC @ 1 ml/liter or Mancozeb 75% WP @ 2.5g/liter with sticker (sandovit @ 0.5 ml/liter).
        """,
        "content_kn": """
ಟೊಮೆಟೊ, ಮೆಣಸಿನಕಾಯಿ ಮತ್ತು ಈರುಳ್ಳಿ ಸಮಗ್ರ ರೋಗ ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ:
1. ಟೊಮೆಟೊ:
- ತಳಿಗಳು: ಅರ್ಕ ರಕ್ಷಕ್ (ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೊರಗು, ಎಲೆ ಮುರುಟು ಮತ್ತು ಅರ್ಲಿ ಬ್ಲೈಟ್ ರೋಗಗಳ ತ್ರಿವಳಿ ರೋಗ ನಿರೋಧಕ ತಳಿ), ಅರ್ಕ ಸಾಮ್ರಾಟ್, ಶಿವಮ್.
- ಟ್ಯೂಟಾ ಎಲೆ ಕೊರೆಯುವ ಹುಳು (Tuta absoluta): ಕಾಯಿ ಮತ್ತು ಎಲೆಗಳ ಒಳಗೆ ಕೊರೆದು ಹಾನಿ ಮಾಡುತ್ತದೆ. ಎಕರೆಗೆ 16 ಟ್ಯೂಟಾ ಲಿಂಗಾಕರ್ಷಕ ಬಲೆ ಅಳವಡಿಸಿ. ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% SC @ 0.3 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
- ಬೆಂಕಿ / ಚಿಬ್ಬು ರೋಗ: ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2 ಗ್ರಾಂ ಅಥವಾ ಅಜೋಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ 23% SC @ 1 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
2. ಮೆಣಸಿನಕಾಯಿ (ಮುರುಟು ರೋಗ / ಮುರ್ದಾ ರೋಗ):
- ನುಸಿ ಮತ್ತು ಥ್ರಿಪ್ಸ್ ರಸ ಹೀರುವ ಕೀಟಗಳಿಂದ ಎಲೆಗಳು ದೋಣಿಯಾಕಾರದಲ್ಲಿ ಮೇಲಕ್ಕೆ ಅಥವಾ ಕೆಳಕ್ಕೆ ಮುರುಟಿಕೊಳ್ಳುತ್ತವೆ.
- ತೋಟದಲ್ಲಿ ಎಕರೆಗೆ 10 ನೀಲಿ ಜಿಗುಟು ಬಲೆ (ಥ್ರಿಪ್ಸ್‌ಗಾಗಿ) ಮತ್ತು 10 ಹಳದಿ ಬಲೆ (ಬಿಳಿ ನೊಣಕ್ಕಾಗಿ) ಅಳವಡಿಸಿ.
- ಪೆಗಾಸಸ್ (Diafenthiuron 50% WP) @ 1.2 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ಡೆಲಿಗೇಟ್ (Spinetoram 11.7% SC) @ 0.9 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
- ನುಸಿ ಬಾಧೆಗೆ ಸ್ಪೈರೋಮೆಸಿಫೆನ್ 22.9% SC @ 1 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
3. ಈರುಳ್ಳಿ (ನೇರಳೆ ಮಚ್ಚೆ ರೋಗ):
- ಎಲೆಗಳ ಮೇಲೆ ನೇರಳೆ ಕಂದು ಬಣ್ಣದ ಮಚ್ಚೆಗಳು. ನಿಯಂತ್ರಣಕ್ಕೆ ಟೆಬುಕೊನಜೋಲ್ @ 1 ಮಿ.ಲೀ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ @ 2.5 ಗ್ರಾಂ ಜೊತೆಗೆ ಅಂಟು (ಸ್ಪ್ರೆಡರ್) ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
        """
    },
    {
        "id": "uasb-pop-coconut-2024",
        "crop": "coconut",
        "crop_kn": "ತೆಂಗು",
        "title": "Coconut Nutrition & Rugose Spiralling Whitefly / Rhinoceros Beetle Bio-Management",
        "source": "ICAR-Central Plantation Crops Research Institute (CPCRI) & UASB",
        "source_url": "https://cpcri.icar.gov.in/technology-bulletins",
        "publication_date": "2024-03-12",
        "applicable_region": "Mandya (Maddur, Malavalli), Tumakuru, Hassan, Coastal Karnataka",
        "soil_climate": "Deep well-drained sandy loam, red sandy soil with high water table",
        "growth_stages": ["seedling", "juvenile", "bearing", "perennial"],
        "review_status": "expert_reviewed",
        "topics": ["rhinoceros_beetle", "black_headed_caterpillar", "rugose_whitefly", "boron_deficiency_button_shedding"],
        "content_en": """
Coconut Palm Management Protocol:
1. Varieties: Tiptur Tall, Arasikere Tall, COD x DTO, Chandra Sankara.
2. Annual Nutrition per adult palm (Apply in 2 splits in May-June & September-October):
- Farmyard manure: 50 kg/palm/year
- Nitrogen: 500g (Urea 1.1 kg)
- Phosphorus: 320g (Rock phosphate or SSP 2 kg)
- Potassium: 1200g (MOP 2 kg) - Coconut has high potassium requirement for nut filling.
- Micronutrients: Apply 1 kg agricultural lime or dolomite every alternative year in acidic soils. Apply Borax 100g/palm/year to prevent crown chocking and button shedding.
3. Major Pest Management:
- Rhinoceros Beetle (Oryctes rhinoceros): Bores into unopened spindle leaf producing geometric 'V' shape leaf cuts. Clean palm crown before monsoon. Fill leaf axils with mixture of Sevidol 8G (25g) + fine sand (200g) or hook out beetles with iron rod. Treat FYM pits with Metarhizium majus fungus to kill grubs.
- Rugose Spiralling Whitefly (Aleurodicus rugosus): Produces heavy honeydew and black sooty mold. Strictly avoid chemical sprays that destroy natural parasitoids. Release Encarsia guadeloupae parasitic wasps. Spray 1% starch solution to flake off sooty mold.
- Black-headed Caterpillar (Opisina arenosella): Releases Goniozus nephantidis larval parasitoids @ 20 parasitoids/palm.
        """,
        "content_kn": """
ತೆಂಗಿನ ಮರಗಳ ಸಮಗ್ರ ಪೋಷಕಾಂಶ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆ:
1. ವಾರ್ಷಿಕ ಪೋಷಕಾಂಶ ಪ್ರಮಾಣ (ಒಂದು ಫಲ ನೀಡುವ ಮರಕ್ಕೆ ವರ್ಷಕ್ಕೆ):
- 50 ಕೆ.ಜಿ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ.
- ಯೂರಿಯಾ: 1.1 ಕೆ.ಜಿ, ರಾಕ್‌ಫಾಸ್ಫೇಟ್: 2 ಕೆ.ಜಿ, ಪೊಟ್ಯಾಷ್ (ಎಂ.ಒ.ಪಿ): 2 ಕೆ.ಜಿ (ತೆಂಗಿನಲ್ಲಿ ಕಾಯಿ ಕಟ್ಟಲು ಮತ್ತು ನೀರು ತುಂಬಲು ಪೊಟ್ಯಾಷ್ ಅತ್ಯಂತ ಮುಖ್ಯ).
- ಬೋರಾನ್ ಕೊರತೆಯಿಂದ ಕಾಯಿಗಳು ಉದುರುತ್ತಿದ್ದರೆ (ಬಟನ್ ಶೆಡ್ಡಿಂಗ್) ಪ್ರತಿ ಮರಕ್ಕೆ ವರ್ಷಕ್ಕೆ 100 ಗ್ರಾಂ ಬೋರಾಕ್ಸ್ ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.
2. ಕೀಟಗಳ ಜೈವಿಕ ನಿಯಂತ್ರಣ:
- ಕಪ್ಪು ಮೂತಿಯ ದುಂಬಿ (ರೈನೋಸಿರಸ್ ಜೀರುಂಡೆ): ಸುಳಿ ಎಲೆಗಳನ್ನು 'V' ಆಕಾರದಲ್ಲಿ ಕತ್ತರಿಸುತ್ತದೆ. ಮರದ ಸುಳಿಯನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ ಸುಳಿಯ ಎಲೆಗಳ ಸಂದಿಗಳಲ್ಲಿ ಬೇವಿನ ಹಿಂಡಿ ಮತ್ತು ಮರಳಿನ ಮಿಶ್ರಣ (1:1) ತುಂಬಿ.
- ಸುರುಳಿ ಬಿಳಿ ನೊಣ (Rugose Whitefly): ಎಲೆಗಳ ಕೆಳಗೆ ಬಿಳಿ ಹಿಟ್ಟಿನಂತಹ ನೊಣಗಳು ಹಾಗೂ ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಬೂಷ್ಟು ರೋಗ. ಯಾವುದೇ ವಿಷಕಾರಿ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ. ಎನ್‌ಕಾರ್ಸಿಯಾ ಪರಾವಲಂಬಿ ಜೀವಿಗಳನ್ನು ಬಿಡಿ ಮತ್ತು ಕಪ್ಪು ಬೂಷ್ಟನ್ನು ತೊಳೆಯಲು ಶೇ. 1 ರ ಗಂಜಿ ದ್ರಾವಣವನ್ನು ರಭಸವಾಗಿ ಸಿಂಪಡಿಸಿ.
        """
    }
]

def generate_content_hash(text: str) -> str:
    """Generate SHA-256 hash for document content verification."""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()

def get_source_by_id(source_id: str) -> Dict[str, Any]:
    """Retrieve official source record by unique identifier."""
    for s in OFFICIAL_SOURCES:
        if s["id"] == source_id:
            return s
    return {}

def list_all_crops() -> List[Dict[str, str]]:
    """Return catalog of all supported crops with multilingual names."""
    seen = {}
    crops = []
    for s in OFFICIAL_SOURCES:
        c = s["crop"]
        if c not in seen:
            seen[c] = True
            crops.append({
                "slug": c,
                "name_en": c.capitalize(),
                "name_kn": s.get("crop_kn", c),
                "region": s.get("applicable_region", "Karnataka")
            })
    return crops

if __name__ == "__main__":
    print(f"Loaded {len(OFFICIAL_SOURCES)} verified official crop advisory guides.")
    for c in list_all_crops():
        print(f" - {c['name_en']} ({c['name_kn']}): {c['region']}")
