import sys
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserProfile
from app.models.location import State, District, Taluka
from app.models.scheme import Scheme, SchemeEligibilityRule, SchemeBenefit, SchemeDocument
from app.models.hospital import Hospital, HospitalScheme

def seed_database(db: Session = None):
    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        if db.query(Scheme).count() > 0:
            print("Database already contains schemes. Skipping seed.")
            return

        print("Seeding Indian Healthcare Schemes Navigator Database...")

        # -------------------------------------------------------------
        # 1. Admin & Demo Users
        # -------------------------------------------------------------
        admin_user = User(
            full_name="National Health Administrator",
            email="admin@healthcare.gov.in",
            mobile="9876543210",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)

        demo_citizen = User(
            full_name="Anirudha Patil",
            email="citizen@demo.in",
            mobile="9822012345",
            hashed_password=get_password_hash("demo123"),
            role="user",
            is_active=True
        )
        db.add(demo_citizen)
        db.flush()

        demo_profile = UserProfile(
            user_id=demo_citizen.id,
            age=62,
            gender="Male",
            marital_status="Married",
            state="Maharashtra",
            district="Kolhapur",
            taluka="Karvir",
            city_village="Kolhapur City",
            pincode="416003",
            area_type="Urban",
            annual_income=120000.0,
            income_bracket="Below 1L",
            occupation="Senior Citizen / Retired",
            bpl_status=True,
            ration_card_type="BPL / Yellow",
            social_category="OBC",
            family_size=4,
            children_count=0,
            elderly_count=2,
            dependents_count=2,
            has_disability=False,
            healthcare_requirement="Hospitalization",
            has_chronic_illness=True,
            chronic_conditions="Hypertension, Osteoarthritis",
            hospitalization_needed=True
        )
        db.add(demo_profile)

        # -------------------------------------------------------------
        # 2. Location Hierarchy (States, Districts, Talukas)
        # -------------------------------------------------------------
        # Maharashtra
        st_mh = State(name="Maharashtra", code="MH")
        db.add(st_mh)
        db.flush()

        dist_kolhapur = District(state_id=st_mh.id, name="Kolhapur", latitude=16.7050, longitude=74.2433)
        dist_pune = District(state_id=st_mh.id, name="Pune", latitude=18.5204, longitude=73.8567)
        dist_mumbai = District(state_id=st_mh.id, name="Mumbai", latitude=19.0760, longitude=72.8777)
        db.add_all([dist_kolhapur, dist_pune, dist_mumbai])
        db.flush()

        tal_karvir = Taluka(district_id=dist_kolhapur.id, name="Karvir", latitude=16.7050, longitude=74.2433, pincode="416003")
        tal_hatkanangle = Taluka(district_id=dist_kolhapur.id, name="Hatkanangle", latitude=16.7537, longitude=74.4447, pincode="416109")
        tal_shahuwadi = Taluka(district_id=dist_kolhapur.id, name="Shahuwadi", latitude=16.9078, longitude=73.9450, pincode="416215")
        tal_radhanagari = Taluka(district_id=dist_kolhapur.id, name="Radhanagari", latitude=16.4172, longitude=73.9989, pincode="416212")
        
        tal_haveli = Taluka(district_id=dist_pune.id, name="Haveli", latitude=18.5204, longitude=73.8567, pincode="411001")
        tal_baramati = Taluka(district_id=dist_pune.id, name="Baramati", latitude=18.1517, longitude=74.5772, pincode="413102")
        
        tal_mumbai_city = Taluka(district_id=dist_mumbai.id, name="Mumbai City", latitude=19.0760, longitude=72.8777, pincode="400001")

        db.add_all([tal_karvir, tal_hatkanangle, tal_shahuwadi, tal_radhanagari, tal_haveli, tal_baramati, tal_mumbai_city])

        # Other Key States
        st_up = State(name="Uttar Pradesh", code="UP")
        st_tn = State(name="Tamil Nadu", code="TN")
        st_ka = State(name="Karnataka", code="KA")
        st_dl = State(name="Delhi", code="DL")
        db.add_all([st_up, st_tn, st_ka, st_dl])
        db.flush()

        dist_lucknow = District(state_id=st_up.id, name="Lucknow", latitude=26.8467, longitude=80.9462)
        dist_chennai = District(state_id=st_tn.id, name="Chennai", latitude=13.0827, longitude=80.2707)
        dist_bengaluru = District(state_id=st_ka.id, name="Bengaluru Urban", latitude=12.9716, longitude=77.5946)
        db.add_all([dist_lucknow, dist_chennai, dist_bengaluru])
        db.flush()

        tal_lucknow_central = Taluka(district_id=dist_lucknow.id, name="Lucknow Central", latitude=26.8467, longitude=80.9462, pincode="226001")
        tal_chennai_central = Taluka(district_id=dist_chennai.id, name="Chennai Central", latitude=13.0827, longitude=80.2707, pincode="600001")
        tal_bengaluru_south = Taluka(district_id=dist_bengaluru.id, name="Bengaluru South", latitude=12.9716, longitude=77.5946, pincode="560001")
        db.add_all([tal_lucknow_central, tal_chennai_central, tal_bengaluru_south])
        db.flush()

        # -------------------------------------------------------------
        # 3. Healthcare Schemes (Official Indian Government Schemes)
        # -------------------------------------------------------------
        schemes_data = [
            {
                "slug": "pm-jay",
                "name": "Ayushman Bharat PM-JAY",
                "short_description": "Flagship National Health Protection Scheme providing cashless secondary and tertiary hospitalization cover of up to ₹5 Lakh per family per year.",
                "long_description": "Pradhan Mantri Jan Arogya Yojana (PM-JAY) is the world's largest government-funded health assurance scheme. It provides a health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families (approximately 55 crore beneficiaries) that form the bottom 40% of the Indian population.",
                "government_department": "National Health Authority (NHA) & Ministry of Health & Family Welfare (MoHFW)",
                "scheme_type": "Central",
                "target_population": "Bottom 40% economically vulnerable rural & urban families identified via SECC 2011 & NFSA ration database",
                "states_covered": "All India (33 States & UTs)",
                "coverage_amount": "₹5,00,000 per family per year",
                "cashless": True,
                "application_process": "1. Check eligibility on mera.pmjay.gov.in or nearest CSC.\n2. Visit any empanelled public or private hospital with Aadhaar & Ration Card.\n3. Contact the hospital 'Ayushman Mitra' desk to generate your Golden Ayushman Card.\n4. Receive 100% cashless treatment.",
                "application_mode": "Hospital Ayushman Mitra Desk / Common Service Centre (CSC) / Online",
                "official_website": "https://pmjay.gov.in",
                "helpline": "14555 / 1800-111-565",
                "last_verified_date": "August 2026",
                "official_source": "National Health Authority (pmjay.gov.in)",
                "featured": True,
                "rule": {
                    "min_age": 0,
                    "max_age": 120,
                    "gender": "All",
                    "max_annual_income": 250000.0,
                    "bpl_required": True,
                    "secc_required": True,
                    "ration_card_types": "AAY,PHH,BPL",
                    "allowed_social_categories": "All",
                    "allowed_occupations": "All",
                    "rural_urban": "Both",
                    "healthcare_conditions": "Hospitalization, Secondary Care, Tertiary Care, Surgery, Critical Illness, Oncology, Cardiology, Orthopedics, ICU",
                    "verification_caveat_template": "Beneficiary must be listed in the SECC 2011 / state NFSA database or possess a verified BPL/Antyodaya Ration Card."
                },
                "benefits": [
                    {"title": "₹5 Lakh Cashless Cover", "description": "Free inpatient hospitalization cover per family per year with no cap on family size.", "benefit_type": "Financial Coverage"},
                    {"title": "1,949+ Medical Procedures Covered", "description": "Covers oncology, neurosurgery, cardiovascular surgeries, burns, and general surgeries.", "benefit_type": "Medical Procedure"},
                    {"title": "Pre & Post Hospitalization", "description": "Covers diagnostic tests 3 days prior and medicines/follow-up up to 15 days post-discharge.", "benefit_type": "Post-Care"}
                ],
                "documents": [
                    {"name": "Aadhaar Card", "is_mandatory": True, "description": "Individual identity verification for card generation."},
                    {"name": "Ration Card (BPL / AAY / PHH)", "is_mandatory": True, "description": "Proof of family unit and socioeconomic qualification."},
                    {"name": "PM-JAY Family Letter / HHID", "is_mandatory": False, "description": "Official letter containing Family ID / HHID if received."}
                ]
            },
            {
                "slug": "mjpjay",
                "name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
                "short_description": "Maharashtra State flagship health insurance scheme offering cashless medical treatment up to ₹5 Lakh per family per year for all state citizens.",
                "long_description": "MJPJAY is the flagship health assurance initiative by the Government of Maharashtra. Universalized in Maharashtra, it provides comprehensive cashless tertiary healthcare and surgical packages for identified serious illnesses, hospital admissions, and surgical operations.",
                "government_department": "State Health Assurance Society (SHAS), Public Health Department, Maharashtra",
                "scheme_type": "State",
                "target_population": "All domicile residents of Maharashtra holding Yellow/Orange/White Ration Cards or Annapurna Card",
                "states_covered": "Maharashtra",
                "coverage_amount": "₹5,00,000 per family per year",
                "cashless": True,
                "application_process": "1. Visit any MJPJAY network hospital in Maharashtra.\n2. Meet the Arogyamitra at the reception with Ration card and Aadhaar.\n3. The medical coordinator evaluates the diagnosis and raises an online pre-authorization request.\n4. Complete cashless admission and treatment are provided upon approval.",
                "application_mode": "Network Hospital Arogyamitra Counter",
                "official_website": "https://www.jeevandayee.gov.in",
                "helpline": "155388 / 1800-233-2200",
                "last_verified_date": "August 2026",
                "official_source": "State Health Assurance Society, Govt. of Maharashtra",
                "featured": True,
                "rule": {
                    "min_age": 0,
                    "max_age": 120,
                    "gender": "All",
                    "max_annual_income": 500000.0,
                    "bpl_required": False,
                    "secc_required": False,
                    "ration_card_types": "All",
                    "allowed_social_categories": "All",
                    "allowed_occupations": "All",
                    "rural_urban": "Both",
                    "healthcare_conditions": "Hospitalization, Critical Illness, Surgery, Cardiology, Nephrology, Oncology, Polytrauma, Pediatric Surgery",
                    "verification_caveat_template": "Requires Maharashtra domicile and a valid State Ration card (Yellow, Orange, or White)."
                },
                "benefits": [
                    {"title": "₹5 Lakh Universal Cover", "description": "Complete cashless inpatient treatment across 1,356+ identified secondary and tertiary procedures.", "benefit_type": "Financial Coverage"},
                    {"title": "Free Follow-up & Diagnostics", "description": "Includes pathology, radiology, surgical implants, post-discharge consultation, and medicines.", "benefit_type": "Medical Procedure"}
                ],
                "documents": [
                    {"name": "Valid Maharashtra Ration Card", "is_mandatory": True, "description": "Yellow, Orange, or White ration card."},
                    {"name": "Aadhaar Card / Voter ID", "is_mandatory": True, "description": "Photo identification for the patient."},
                    {"name": "Doctor Referral / Prescription", "is_mandatory": False, "description": "Initial diagnosis from a registered medical practitioner."}
                ]
            },
            {
                "slug": "pmsma",
                "name": "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
                "short_description": "Guaranteed comprehensive, free antenatal care and high-risk pregnancy screening on the 9th day of every month across all government health facilities.",
                "long_description": "PMSMA is a national program dedicated to providing quality antenatal care (ANC) to pregnant women in their 2nd and 3rd trimesters. On the 9th of every month, OBGYN specialists and medical doctors conduct free clinical examinations, sonography, blood tests, and identify high-risk pregnancies (HRP) for timely referral.",
                "government_department": "Maternal Health Division, Ministry of Health & Family Welfare",
                "scheme_type": "Central",
                "target_population": "All pregnant women in India in their 2nd and 3rd trimesters (4 to 9 months)",
                "states_covered": "All India",
                "coverage_amount": "100% Free Antenatal Consultations, Ultrasound & Diagnostics",
                "cashless": True,
                "application_process": "1. Visit any Government District Hospital, Sub-District Hospital, CHC, or PHC on the 9th of the month.\n2. Register at the PMSMA desk with Mother and Child Protection (MCP) card.\n3. Receive free specialist checkup, ultrasound, iron-folic acid supplements, and high-risk screening.",
                "application_mode": "Walk-in on 9th of every month at Public Health Facilities",
                "official_website": "https://pmsma.nhp.gov.in",
                "helpline": "1800-180-1104",
                "last_verified_date": "August 2026",
                "official_source": "Ministry of Health & Family Welfare (MoHFW)",
                "featured": True,
                "rule": {
                    "min_age": 15,
                    "max_age": 50,
                    "gender": "Female",
                    "max_annual_income": 0.0,
                    "bpl_required": False,
                    "secc_required": False,
                    "requires_pregnancy": True,
                    "healthcare_conditions": "Maternal / Child, Pregnancy, Antenatal Care, Ultrasound, High Risk Pregnancy, Anemia, Fetal Monitoring",
                    "verification_caveat_template": "Beneficiary must be in 2nd or 3rd trimester of pregnancy (4th month onwards)."
                },
                "benefits": [
                    {"title": "Free Specialist Examination", "description": "Consultation with OBGYN specialists and certified medical officers.", "benefit_type": "Consultation"},
                    {"title": "Free Diagnostic Battery", "description": "Complete blood count, blood sugar, urine routine, Hb, and ultrasound sonography.", "benefit_type": "Diagnostic"},
                    {"title": "Color-coded Risk Tagging", "description": "Red sticker on MCP card for High-Risk Pregnancies ensuring specialized hospital tracking.", "benefit_type": "Preventive"}
                ],
                "documents": [
                    {"name": "Mother and Child Protection (MCP) Card", "is_mandatory": True, "description": "Provided by local ASHA/ANM at Anganwadi or PHC."},
                    {"name": "Aadhaar Card", "is_mandatory": True, "description": "For identification and registration in RCH portal."}
                ]
            },
            {
                "slug": "janani-suraksha-yojana",
                "name": "Janani Suraksha Yojana (JSY)",
                "short_description": "Safe motherhood intervention promoting institutional delivery among poor pregnant women through direct cash transfer assistance.",
                "long_description": "Janani Suraksha Yojana (JSY) is a safe motherhood intervention under the National Health Mission (NHM). It integrates cash assistance with antenatal delivery and post-delivery care to reduce maternal and neonatal mortality by encouraging institutional delivery at public and accredited private health centres.",
                "government_department": "National Health Mission (NHM), MoHFW",
                "scheme_type": "Centrally Sponsored",
                "target_population": "Pregnant women belonging to BPL/SC/ST households delivering in health institutions",
                "states_covered": "All India",
                "coverage_amount": "Direct Cash Assistance: ₹1,400 (Rural) / ₹1,000 (Urban) + ASHA incentive",
                "cashless": False,
                "application_process": "1. Register pregnancy with the local ASHA worker or ANM at the nearest Sub-Centre / PHC.\n2. Complete minimum 3 antenatal visits.\n3. Undergo delivery at an accredited government hospital or empanelled private facility.\n4. Cash assistance is transferred directly into the mother's bank account upon discharge.",
                "application_mode": "Through ASHA / ANM / Public Health Facility",
                "official_website": "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
                "helpline": "104 / 108 (Ambulance)",
                "last_verified_date": "August 2026",
                "official_source": "National Health Mission (NHM)",
                "featured": False,
                "rule": {
                    "min_age": 18,
                    "max_age": 50,
                    "gender": "Female",
                    "max_annual_income": 200000.0,
                    "bpl_required": True,
                    "requires_pregnancy": True,
                    "healthcare_conditions": "Maternal / Child, Institutional Delivery, Postnatal Care, Newborn Health",
                    "verification_caveat_template": "Delivery must take place in an authorized government health institution or accredited private hospital."
                },
                "benefits": [
                    {"title": "Cash Assistance for Delivery", "description": "₹1,400 for rural mothers and ₹1,000 for urban mothers transferred to bank account.", "benefit_type": "Cash Assistance"},
                    {"title": "Free Transport", "description": "Free 102/108 ambulance pickup from home to hospital and drop back home.", "benefit_type": "Logistics"}
                ],
                "documents": [
                    {"name": "MCP Card / ANC Registration Card", "is_mandatory": True, "description": "Proof of registration and antenatal visits."},
                    {"name": "Bank Account Passbook (Aadhaar linked)", "is_mandatory": True, "description": "For direct DBT transfer of incentive."},
                    {"name": "BPL / SC / ST Certificate", "is_mandatory": True, "description": "Category qualification proof."}
                ]
            },
            {
                "slug": "rbsk",
                "name": "Rashtriya Bal Swasthya Karyakram (RBSK)",
                "short_description": "Child Health Screening and Early Intervention Services covering 30 health conditions (Birth Defects, Deficiencies, Diseases, Development Delays).",
                "long_description": "RBSK is an ambitious initiative aimed at early identification and intervention for children from birth to 18 years, covering '4Ds': Defects at birth, Deficiencies, Diseases, and Development delays including disability. Children diagnosed with conditions such as Congenital Heart Disease (CHD), Cleft Lip/Palate, Club Foot, or Neural Tube Defects receive 100% free surgical management and therapy at tertiary hospitals and District Early Intervention Centres (DEIC).",
                "government_department": "Child Health Division, Ministry of Health & Family Welfare",
                "scheme_type": "Centrally Sponsored",
                "target_population": "All infants, children, and adolescents from 0 to 18 years enrolled in Anganwadis and Government/Aided Schools",
                "states_covered": "All India",
                "coverage_amount": "100% Free Specialized Surgeries & Early Intervention Therapies",
                "cashless": True,
                "application_process": "1. Mobile Health Teams (MHT) screen children at Anganwadis (twice a year) and Schools (once a year).\n2. Children with detected conditions are referred to the District Early Intervention Centre (DEIC) or Medical College.\n3. Comprehensive medical and surgical management is sponsored completely free of cost.",
                "application_mode": "Anganwadi / Government School Screening / Direct Walk-in to DEIC",
                "official_website": "https://rbsk.gov.in",
                "helpline": "104 (State Health Helpline)",
                "last_verified_date": "August 2026",
                "official_source": "Rashtriya Bal Swasthya Karyakram Portal (MoHFW)",
                "featured": True,
                "rule": {
                    "min_age": 0,
                    "max_age": 18,
                    "gender": "All",
                    "max_annual_income": 0.0,
                    "bpl_required": False,
                    "requires_child": True,
                    "max_child_age_years": 18,
                    "healthcare_conditions": "Child Health, Pediatric Surgery, Congenital Heart Disease, Cleft Palate, Club Foot, Neurodevelopmental Delay, Vision Impairment, Hearing Loss",
                    "verification_caveat_template": "Child must be between 0–18 years and evaluated by an RBSK screening team or District Early Intervention Centre."
                },
                "benefits": [
                    {"title": "Free Pediatric Surgeries", "description": "Free cardiac surgeries, cleft surgeries, cataract, and orthopedics for identified children.", "benefit_type": "Medical Procedure"},
                    {"title": "DEIC Rehabilitation Services", "description": "Speech therapy, physiotherapy, behavioral therapy, and hearing aids at no cost.", "benefit_type": "Therapy"}
                ],
                "documents": [
                    {"name": "Birth Certificate / School ID / Anganwadi Registration", "is_mandatory": True, "description": "Proof of age under 18 years."},
                    {"name": "RBSK Referral Slip", "is_mandatory": True, "description": "Issued by Mobile Health Team or DEIC Officer."},
                    {"name": "Parent Aadhaar Card", "is_mandatory": True, "description": "Guardian identification."}
                ]
            },
            {
                "slug": "abdm",
                "name": "Ayushman Bharat Digital Mission (ABDM)",
                "short_description": "Digital health ecosystem enabling 14-digit ABHA (Ayushman Bharat Health Account) for seamless digital medical records and consent management.",
                "long_description": "Ayushman Bharat Digital Mission (ABDM) creates the digital backbone for India's healthcare infrastructure. It bridges existing healthcare gaps by allowing citizens to create a unique 14-digit ABHA ID to securely store, access, and share electronic health records (lab reports, prescriptions, discharge summaries) with doctors across any participating hospital nationwide.",
                "government_department": "National Health Authority (NHA)",
                "scheme_type": "Central",
                "target_population": "All Citizens of India",
                "states_covered": "All India",
                "coverage_amount": "Free Digital Health ID & Record Management System",
                "cashless": True,
                "application_process": "1. Visit abha.abdm.gov.in or download the ABHA App.\n2. Enter Aadhaar or Driving License number and verify via OTP.\n3. Create your 14-digit ABHA number and ABHA address (e.g. yourname@abdm).\n4. Link hospital records and scan QR codes at OPD counters for paperless fast registration.",
                "application_mode": "Online (Instant via Aadhaar OTP) / Hospital OPD Kiosk",
                "official_website": "https://abdm.gov.in",
                "helpline": "1800-11-4477",
                "last_verified_date": "August 2026",
                "official_source": "National Health Authority (abdm.gov.in)",
                "featured": False,
                "rule": {
                    "min_age": 0,
                    "max_age": 120,
                    "gender": "All",
                    "max_annual_income": 0.0,
                    "bpl_required": False,
                    "healthcare_conditions": "Digital Health Record, General Care, OPD Registration, Preventive, Diagnostic, Prescription History",
                    "verification_caveat_template": "Requires mobile number linked with Aadhaar for instant OTP generation."
                },
                "benefits": [
                    {"title": "14-digit Unique ABHA ID", "description": "Nationally recognized personal digital health identifier.", "benefit_type": "Digital Service"},
                    {"title": "Paperless Hospital Registration", "description": "Scan & Share QR at hospital OPD counters to skip long queues.", "benefit_type": "Hospital Convenience"},
                    {"title": "Unified Health Records", "description": "Access lifetime diagnostic reports and prescriptions on your smartphone.", "benefit_type": "Digital Service"}
                ],
                "documents": [
                    {"name": "Aadhaar Card / Driving License", "is_mandatory": True, "description": "For demographic identity validation and OTP verification."}
                ]
            },
            {
                "slug": "ayushman-arogya-mandir",
                "name": "Ayushman Arogya Mandir (Health & Wellness Centres)",
                "short_description": "Transformed primary health centres providing free essential drugs, diagnostics, screening for Non-Communicable Diseases (NCDs), and tele-consultations.",
                "long_description": "Ayushman Arogya Mandirs (formerly Ayushman Bharat Health & Wellness Centres) bring comprehensive primary healthcare (CPHC) closer to the community. They deliver universal screening and free management for hypertension, diabetes, oral, breast, and cervical cancers, along with maternal and child health services, free wellness yoga, and eSanjeevani doctor tele-consultations.",
                "government_department": "Ministry of Health & Family Welfare (MoHFW)",
                "scheme_type": "Centrally Sponsored",
                "target_population": "All community residents across rural and urban catchment areas",
                "states_covered": "All India",
                "coverage_amount": "100% Free Primary Consultations, 172+ Free Medicines & 63+ Diagnostics",
                "cashless": True,
                "application_process": "1. Walk in to your neighborhood Ayushman Arogya Mandir / Sub-Health Centre.\n2. Get registered with your ABHA ID or Aadhaar.\n3. Undergo free blood pressure, blood glucose, and wellness screenings.\n4. Collect prescribed medicines free of charge or connect to specialist doctors via eSanjeevani teleconsultation.",
                "application_mode": "Walk-in at Local Community Centre",
                "official_website": "https://ab-hwc.nhp.gov.in",
                "helpline": "104 / 1075",
                "last_verified_date": "August 2026",
                "official_source": "MoHFW (ab-hwc.nhp.gov.in)",
                "featured": False,
                "rule": {
                    "min_age": 0,
                    "max_age": 120,
                    "gender": "All",
                    "max_annual_income": 0.0,
                    "bpl_required": False,
                    "healthcare_conditions": "General Care, Preventive, Diagnostic, Chronic Illness, Diabetes, Hypertension, Wellness, Primary Health",
                    "verification_caveat_template": "Free universal walk-in service with no socioeconomic barriers."
                },
                "benefits": [
                    {"title": "Free Essential Medicines & Tests", "description": "Dispenses essential hypertension, diabetes, and infectious disease medicines free.", "benefit_type": "Medication"},
                    {"title": "eSanjeevani Teleconsultation", "description": "Direct video consultation with district hospital specialists and physicians.", "benefit_type": "Consultation"}
                ],
                "documents": [
                    {"name": "Any Photo ID / ABHA Card", "is_mandatory": False, "description": "Preferred for digital record creation."}
                ]
            },
            {
                "slug": "cmchis-tamilnadu",
                "name": "Chief Minister Comprehensive Health Insurance Scheme (CMCHIS - TN)",
                "short_description": "Tamil Nadu State health insurance scheme offering cashless tertiary healthcare and specialized surgeries up to ₹5 Lakh per family per year.",
                "long_description": "CMCHIS is implemented by the Government of Tamil Nadu through the United India Insurance Company. It provides financial protection to poor families against high medical costs for specified procedures, diagnostic packages, and surgical interventions across approved government and private hospitals in Tamil Nadu.",
                "government_department": "Department of Health and Family Welfare, Government of Tamil Nadu",
                "scheme_type": "State",
                "target_population": "Families whose annual family income is below ₹1,20,000 in Tamil Nadu with Smart Family Card",
                "states_covered": "Tamil Nadu",
                "coverage_amount": "₹5,00,000 per family per year",
                "cashless": True,
                "application_process": "1. Obtain an Income Certificate from the Village Administrative Officer (VAO) / Revenue Department.\n2. Visit the District Kiosk with Family Smart Card to enroll and generate the CMCHIS smart card.\n3. Present the card at network hospitals for pre-authorized cashless care.",
                "application_mode": "District Collectorate Kiosk / Network Hospital",
                "official_website": "https://www.cmchistn.com",
                "helpline": "1800-425-3993",
                "last_verified_date": "August 2026",
                "official_source": "Government of Tamil Nadu (cmchistn.com)",
                "featured": False,
                "rule": {
                    "min_age": 0,
                    "max_age": 120,
                    "gender": "All",
                    "max_annual_income": 120000.0,
                    "bpl_required": True,
                    "healthcare_conditions": "Hospitalization, Surgery, Tertiary Care, Critical Illness, Cardiology, Oncology, Neonatal Care",
                    "verification_caveat_template": "Applicant must possess a valid Tamil Nadu Smart Family Card and income proof below ₹1.2L."
                },
                "benefits": [
                    {"title": "₹5 Lakh Coverage", "description": "Covers 1,090 medical and surgical procedures across empanelled hospitals.", "benefit_type": "Financial Coverage"},
                    {"title": "Free Diagnostic Packages", "description": "Includes high-end scans, MRI, CT, and specialized laboratory tests.", "benefit_type": "Diagnostic"}
                ],
                "documents": [
                    {"name": "Tamil Nadu Smart Family Card", "is_mandatory": True, "description": "Primary eligibility credential."},
                    {"name": "Income Certificate from Revenue Authority", "is_mandatory": True, "description": "Certifying family income <= ₹1,20,000/year."},
                    {"name": "Aadhaar Card of all family members", "is_mandatory": True, "description": "Identity proof."}
                ]
            }
        ]

        created_schemes = {}
        for s_data in schemes_data:
            rule_data = s_data.pop("rule")
            benefits_list = s_data.pop("benefits")
            docs_list = s_data.pop("documents")

            scheme = Scheme(**s_data)
            db.add(scheme)
            db.flush()

            # Rule
            rule = SchemeEligibilityRule(scheme_id=scheme.id, **rule_data)
            db.add(rule)

            # Benefits
            for b in benefits_list:
                benefit = SchemeBenefit(scheme_id=scheme.id, **b)
                db.add(benefit)

            # Documents
            for d in docs_list:
                doc = SchemeDocument(scheme_id=scheme.id, **d)
                db.add(doc)

            created_schemes[scheme.slug] = scheme

        # -------------------------------------------------------------
        # 4. Hospitals & Empanelment Mappings (Focusing on Kolhapur/Karvir & Key Hubs)
        # -------------------------------------------------------------
        hospitals_data = [
            {
                "name": "Chhatrapati Pramila Raje (CPR) General Hospital",
                "hospital_type": "District Hospital / Government Medical College",
                "is_government": True,
                "state": "Maharashtra",
                "district_id": dist_kolhapur.id,
                "district_name": "Kolhapur",
                "taluka_id": tal_karvir.id,
                "taluka_name": "Karvir",
                "city_village": "Kolhapur City",
                "pincode": "416002",
                "address": "Bhausingji Road, Near Dasara Chowk, Karvir, Kolhapur, Maharashtra 416002",
                "latitude": 16.6985,
                "longitude": 74.2285,
                "phone": "+91 231 2641555",
                "emergency_contact": "+91 231 2641556",
                "email": "cprhospital.kolhapur@maharashtra.gov.in",
                "website": "https://kolhapur.gov.in/en/public-utility/cpr-hospital/",
                "specialties": "General Medicine, General Surgery, Cardiology, Orthopedics, Pediatrics, Obstetrics & Gynecology, Oncology, Nephrology, ENT, Ophthalmology",
                "facilities": "24x7 Emergency, Trauma Care, Blood Bank, CT Scan, Dialysis Unit, NICU, PICU, Burn Ward, Ayushman Mitra Helpdesk",
                "has_emergency_24x7": True,
                "bed_count": 650,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "NHA & SHAS Maharashtra Empanelled Directory",
                "empanelled_slugs": ["pm-jay", "mjpjay", "pmsma", "rbsk", "abdm", "ayushman-arogya-mandir"]
            },
            {
                "name": "Aster Aadhar Multispeciality Hospital",
                "hospital_type": "Private Hospital",
                "is_government": False,
                "state": "Maharashtra",
                "district_id": dist_kolhapur.id,
                "district_name": "Kolhapur",
                "taluka_id": tal_karvir.id,
                "taluka_name": "Karvir",
                "city_village": "Kolhapur",
                "pincode": "416005",
                "address": "R.S. No. 628, B Ward, Near Kadamwadi, Shastri Nagar, Karvir, Kolhapur, Maharashtra 416005",
                "latitude": 16.7150,
                "longitude": 74.2560,
                "phone": "+91 231 6622555",
                "emergency_contact": "+91 231 6622500",
                "email": "info.kolhapur@asterhospital.com",
                "website": "https://www.asterhospitals.in/kolhapur",
                "specialties": "Cardiac Sciences, Oncology, Neurosurgery, Orthopedics, Critical Care, Gastroenterology, Urology",
                "facilities": "24x7 Emergency, Cath Lab, Advanced ICU, LINAC Radiation Oncology, MRI 1.5T, Organ Transplant Unit",
                "has_emergency_24x7": True,
                "bed_count": 300,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "NHA Empanelled Hospital Registry",
                "empanelled_slugs": ["pm-jay", "mjpjay", "abdm"]
            },
            {
                "name": "D.Y. Patil Medical College Hospital & Research Centre",
                "hospital_type": "Medical College Hospital",
                "is_government": False,
                "state": "Maharashtra",
                "district_id": dist_kolhapur.id,
                "district_name": "Kolhapur",
                "taluka_id": tal_karvir.id,
                "taluka_name": "Karvir",
                "city_village": "Kadamwadi, Kolhapur",
                "pincode": "416003",
                "address": "Line Bazar, Kasaba Bawada Road, Karvir, Kolhapur, Maharashtra 416006",
                "latitude": 16.7212,
                "longitude": 74.2418,
                "phone": "+91 231 2601234",
                "emergency_contact": "+91 231 2601235",
                "email": "hospital@dypatilkolhapur.org",
                "website": "https://dypatilkolhapur.org",
                "specialties": "Multi-organ Surgery, Pediatric Cardiology, Neurology, Pulmonology, Dermatology, Psychiatry, Obstetrics",
                "facilities": "24x7 Emergency, Blood Bank, 100-bed ICU, Dialysis, Diagnostic Imaging, Free OPD, Ayushman Helpdesk",
                "has_emergency_24x7": True,
                "bed_count": 800,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "SHAS Maharashtra Empanelled Registry",
                "empanelled_slugs": ["pm-jay", "mjpjay", "rbsk", "pmsma", "abdm"]
            },
            {
                "name": "Apple Saraswati Multispeciality Hospital",
                "hospital_type": "Private Hospital",
                "is_government": False,
                "state": "Maharashtra",
                "district_id": dist_kolhapur.id,
                "district_name": "Kolhapur",
                "taluka_id": tal_karvir.id,
                "taluka_name": "Karvir",
                "city_village": "Kolhapur",
                "pincode": "416008",
                "address": "Opp. S.T. Stand, Station Road, New Shahupuri, Karvir, Kolhapur, Maharashtra 416001",
                "latitude": 16.7020,
                "longitude": 74.2380,
                "phone": "+91 231 2655000",
                "emergency_contact": "+91 231 2655108",
                "email": "contact@applesaraswati.com",
                "website": "https://applesaraswati.com",
                "specialties": "Emergency Medicine, Polytrauma, Joint Replacement, Laparoscopic Surgery, Nephrology",
                "facilities": "24x7 Emergency, Modular OTs, ICU, In-house Pharmacy, Ambulance Service",
                "has_emergency_24x7": True,
                "bed_count": 150,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "NHA Registry",
                "empanelled_slugs": ["pm-jay", "mjpjay"]
            },
            {
                "name": "Sub-District Hospital, Hatkanangle",
                "hospital_type": "Sub-District Hospital",
                "is_government": True,
                "state": "Maharashtra",
                "district_id": dist_kolhapur.id,
                "district_name": "Kolhapur",
                "taluka_id": tal_hatkanangle.id,
                "taluka_name": "Hatkanangle",
                "city_village": "Hatkanangle",
                "pincode": "416109",
                "address": "Near Bus Stand, Hatkanangle, Dist. Kolhapur, Maharashtra 416109",
                "latitude": 16.7537,
                "longitude": 74.4447,
                "phone": "+91 230 2483222",
                "emergency_contact": "108",
                "email": "sdh.hatkanangle@maharashtra.gov.in",
                "website": "https://arogya.maharashtra.gov.in",
                "specialties": "General Medicine, Obstetrics, Pediatrics, Emergency Care",
                "facilities": "24x7 Emergency, Delivery Room, Free Pharmacy, X-Ray, Laboratory",
                "has_emergency_24x7": True,
                "bed_count": 100,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "Govt. of Maharashtra Public Health",
                "empanelled_slugs": ["pm-jay", "mjpjay", "pmsma", "janani-suraksha-yojana", "rbsk", "ayushman-arogya-mandir"]
            },
            {
                "name": "Sassoon General Hospital & B.J. Medical College",
                "hospital_type": "Government Hospital / Medical College",
                "is_government": True,
                "state": "Maharashtra",
                "district_id": dist_pune.id,
                "district_name": "Pune",
                "taluka_id": tal_haveli.id,
                "taluka_name": "Haveli",
                "city_village": "Pune City",
                "pincode": "411001",
                "address": "Near Pune Railway Station, Jai Prakash Narayan Road, Pune, Maharashtra 411001",
                "latitude": 18.5264,
                "longitude": 73.8732,
                "phone": "+91 20 26128000",
                "emergency_contact": "108",
                "email": "deanbjmcpune@yahoo.com",
                "website": "https://bjmcpune.org",
                "specialties": "Super Speciality Services, Cardiology, Neurosurgery, Organ Transplant, Oncology, Burns, Trauma",
                "facilities": "24x7 Emergency, 1200+ Beds, Central Blood Bank, Advanced ICUs, Ayushman Helpdesk",
                "has_emergency_24x7": True,
                "bed_count": 1296,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "NHA & SHAS Directory",
                "empanelled_slugs": ["pm-jay", "mjpjay", "pmsma", "rbsk", "abdm"]
            },
            {
                "name": "King Edward Memorial (KEM) Hospital",
                "hospital_type": "Government Hospital / Municipal Medical College",
                "is_government": True,
                "state": "Maharashtra",
                "district_id": dist_mumbai.id,
                "district_name": "Mumbai",
                "taluka_id": tal_mumbai_city.id,
                "taluka_name": "Mumbai City",
                "city_village": "Parel, Mumbai",
                "pincode": "400012",
                "address": "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
                "latitude": 19.0024,
                "longitude": 72.8423,
                "phone": "+91 22 24107000",
                "emergency_contact": "+91 22 24107001",
                "email": "kemh@kem.edu",
                "website": "https://www.kem.edu",
                "specialties": "All Major Super-specialties, Cardiology, Neurology, Pediatric Surgery, Nephrology, Oncology",
                "facilities": "24x7 Trauma Centre, 1800 Beds, Organ Transplant, Robotic Surgery, Ayushman Mitra Centre",
                "has_emergency_24x7": True,
                "bed_count": 1800,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "NHA & BMC Directory",
                "empanelled_slugs": ["pm-jay", "mjpjay", "pmsma", "rbsk", "abdm"]
            },
            {
                "name": "Rajiv Gandhi Government General Hospital",
                "hospital_type": "Government Hospital / Madras Medical College",
                "is_government": True,
                "state": "Tamil Nadu",
                "district_id": dist_chennai.id,
                "district_name": "Chennai",
                "taluka_id": tal_chennai_central.id,
                "taluka_name": "Chennai Central",
                "city_village": "Chennai",
                "pincode": "600003",
                "address": "EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003",
                "latitude": 13.0827,
                "longitude": 74.2707,
                "phone": "+91 44 25305000",
                "emergency_contact": "108",
                "email": "deanmmc@tn.gov.in",
                "website": "https://mmc.ac.in",
                "specialties": "Cardiothoracic Surgery, Neurology, Nephrology, Medical Oncology, Surgical Gastroenterology",
                "facilities": "24x7 Trauma Care, 2500 Beds, Free Dialysis, Cath Lab, CMCHIS Counter",
                "has_emergency_24x7": True,
                "bed_count": 2722,
                "verification_status": "Verified",
                "last_verified_date": "August 2026",
                "official_source": "TN Health & Family Welfare",
                "empanelled_slugs": ["pm-jay", "cmchis-tamilnadu", "pmsma", "rbsk", "abdm"]
            }
        ]

        for h_data in hospitals_data:
            slugs = h_data.pop("empanelled_slugs")
            hosp = Hospital(**h_data)
            db.add(hosp)
            db.flush()

            for slug in slugs:
                if slug in created_schemes:
                    mapping = HospitalScheme(
                        hospital_id=hosp.id,
                        scheme_id=created_schemes[slug].id,
                        status="ACTIVE",
                        empanelment_number=f"EMP-{hosp.id}-{created_schemes[slug].id}",
                        services_covered=f"Cashless inpatient care and diagnostic packages under {created_schemes[slug].name}",
                        last_verified_date="August 2026",
                        official_source="NHA / SHA Official Portal"
                    )
                    db.add(mapping)

        db.commit()
        print("Database successfully seeded with realistic Indian healthcare schemes and hospitals!")
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
