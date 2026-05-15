const now = Math.floor(Date.now() / 1000);
const DAY = 86400;

export const SAMPLE_PATIENT_RECORDS = [
  {
    id: 1,
    title: "Annual Physical Examination",
    type: "Consultation",
    description: "Comprehensive annual health assessment with vital signs and general evaluation",
    content: `PATIENT: Sample Patient
DATE: ${new Date((now - DAY * 45) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PHYSICIAN: Dr. Sarah Mitchell

VITAL SIGNS:
- Blood Pressure: 118/76 mmHg (Optimal)
- Heart Rate: 68 bpm (Normal)
- Respiratory Rate: 16/min
- Temperature: 36.7°C (98.1°F)
- Oxygen Saturation: 99%
- BMI: 22.4 (Normal)

PHYSICAL EXAMINATION:
- General: Well-nourished, alert, and oriented
- Head/Neck: Normocephalic, no lymphadenopathy
- Cardiovascular: Regular rhythm, no murmurs
- Respiratory: Clear to auscultation bilaterally
- Abdomen: Soft, non-tender, no organomegaly
- Musculoskeletal: Full range of motion, no deformities
- Neurological: Cranial nerves II-XII intact, normal gait

ASSESSMENT:
Overall excellent health. No acute concerns identified.

RECOMMENDATIONS:
1. Continue regular exercise regimen
2. Maintain balanced diet
3. Follow-up in 12 months
4. Routine blood work recommended`,
    timestamp: now - DAY * 45,
    doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
    isEncrypted: false,
    recordType: 0,
    ipfsHash: "",
    encryptionKey: ""
  },
  {
    id: 2,
    title: "Complete Blood Panel Results",
    type: "Analyse",
    description: "Comprehensive blood chemistry and hematology analysis",
    content: `LABORATORY RESULTS — COMPREHENSIVE METABOLIC PANEL
DATE: ${new Date((now - DAY * 40) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
LAB: Quest Diagnostics — Reference: LAB-2024-08942

HEMATOLOGY:
┌─────────────────────┬────────────┬──────────┬────────┐
│ Parameter           │ Result     │ Range    │ Status │
├─────────────────────┼────────────┼──────────┼────────┤
│ WBC                 │ 6.2 K/µL   │ 4.5-11.0 │ Normal │
│ RBC                 │ 5.1 M/µL   │ 4.5-5.9  │ Normal │
│ Hemoglobin          │ 14.8 g/dL  │ 13.5-17.5│ Normal │
│ Hematocrit          │ 44.2%      │ 38.3-48.6│ Normal │
│ Platelets           │ 242 K/µL   │ 150-400  │ Normal │
│ Neutrophils         │ 58%        │ 40-70    │ Normal │
│ Lymphocytes         │ 32%        │ 22-44    │ Normal │
│ Monocytes           │ 6%         │ 4-12     │ Normal │
│ Eosinophils         │ 3%         │ 0-6      │ Normal │
│ Basophils           │ 1%         │ 0-2      │ Normal │
└─────────────────────┴────────────┴──────────┴────────┘

COMPREHENSIVE METABOLIC PANEL:
┌─────────────────────┬────────────┬──────────┬────────┐
│ Parameter           │ Result     │ Range    │ Status │
├─────────────────────┼────────────┼──────────┼────────┤
│ Glucose (Fasting)   │ 92 mg/dL   │ 70-100   │ Normal │
│ Creatinine          │ 0.95 mg/dL │ 0.7-1.2  │ Normal │
│ BUN                 │ 14 mg/dL   │ 7-25     │ Normal │
│ Sodium              │ 140 mEq/L  │ 136-145  │ Normal │
│ Potassium           │ 4.2 mEq/L  │ 3.5-5.1  │ Normal │
│ Chloride            │ 102 mEq/L  │ 98-107   │ Normal │
│ CO2                 │ 26 mEq/L   │ 23-30    │ Normal │
│ Calcium             │ 9.6 mg/dL  │ 8.5-10.5 │ Normal │
│ Total Protein       │ 7.2 g/dL   │ 6.0-8.3  │ Normal │
│ Albumin             │ 4.1 g/dL   │ 3.5-5.0  │ Normal │
│ Total Bilirubin     │ 0.7 mg/dL  │ 0.1-1.2  │ Normal │
│ Alkaline Phosphatase│ 72 U/L     │ 44-147   │ Normal │
│ ALT (SGPT)          │ 28 U/L     │ 10-40    │ Normal │
│ AST (SGOT)          │ 24 U/L     │ 10-40    │ Normal │
└─────────────────────┴────────────┴──────────┴────────┘

LIPID PANEL:
┌─────────────────────┬────────────┬──────────┬────────┐
│ Parameter           │ Result     │ Range    │ Status │
├─────────────────────┼────────────┼──────────┼────────┤
│ Total Cholesterol   │ 178 mg/dL  │ <200     │ Normal │
│ LDL Cholesterol     │ 98 mg/dL   │ <130     │ Normal │
│ HDL Cholesterol     │ 52 mg/dL   │ >40      │ Normal │
│ Triglycerides       │ 112 mg/dL  │ <150     │ Normal │
└─────────────────────┴────────────┴──────────┴────────┘

INTERPRETATION:
All values within normal reference ranges. No abnormalities detected.

IMPRESSION:
Patient demonstrates excellent metabolic health. Continue current lifestyle.`,
    timestamp: now - DAY * 40,
    doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
    isEncrypted: false,
    recordType: 2,
    ipfsHash: "",
    encryptionKey: ""
  },
  {
    id: 3,
    title: "Chest X-Ray & Cardiac Evaluation",
    type: "Radiologie",
    description: "Routine chest radiography and cardiovascular assessment",
    content: `RADIOLOGY REPORT — CHEST X-RAY (PA & LATERAL)
DATE: ${new Date((now - DAY * 35) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
MODALITY: Digital Radiography
REFERRING: Dr. Sarah Mitchell

FINDINGS:
LUNGS:
- Lungs are well-inflated without evidence of consolidation
- No pulmonary nodules or masses identified
- No pleural effusion or pneumothorax
- Bronchovascular markings are normal

CARDIAC:
- Cardiac silhouette is within normal limits
- Cardiothoracic ratio: 0.48 (Normal < 0.50)
- No mediastinal widening

BONES & SOFT TISSUES:
- No acute osseous abnormalities
- No destructive bone lesions
- Soft tissues are unremarkable

IMPRESSION:
Normal chest radiograph. No acute cardiopulmonary abnormality.

CARDIAC EVALUATION:
┌─────────────────────┬────────────┬──────────┐
│ Parameter           │ Result     │ Status   │
├─────────────────────┼────────────┼──────────┤
│ Ejection Fraction   │ 60%        │ Normal   │
│ Heart Rate Variability│ 42 ms    │ Normal   │
│ PR Interval         │ 160 ms     │ Normal   │
│ QRS Duration        │ 98 ms      │ Normal   │
│ QT Interval (corrected)│ 420 ms  │ Normal   │
└─────────────────────┴────────────┴──────────┘

CONCLUSION:
Normal findings. No follow-up imaging required.`,
    timestamp: now - DAY * 35,
    doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
    isEncrypted: false,
    recordType: 3,
    ipfsHash: "",
    encryptionKey: ""
  },
  {
    id: 4,
    title: "Prescription — Antihypertensive Therapy",
    type: "Ordonnance",
    description: "Prescription for blood pressure management medication",
    content: `PRESCRIPTION ORDER
DATE: ${new Date((now - DAY * 30) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PHYSICIAN: Dr. Sarah Mitchell (License: MD789012)
PATIENT: Sample Patient — DOB: 03/15/1985

MEDICATION: Lisinopril 10 mg
DOSAGE: One (1) tablet by mouth once daily
QUANTITY: 30 tablets
REFILLS: 3
DIRECTIONS: Take with or without food. Best taken at the same time each day.
DIAGNOSIS: Essential Hypertension (ICD-10: I10)

MEDICATION: Atorvastatin 20 mg
DOSAGE: One (1) tablet by mouth once daily at bedtime
QUANTITY: 30 tablets
REFILLS: 3
DIRECTIONS: Take at bedtime. Avoid grapefruit juice.
DIAGNOSIS: Hyperlipidemia (ICD-10: E78.5)

NOTES:
- Monitor blood pressure weekly and log readings
- Follow-up lipid panel in 3 months
- Call office if BP > 140/90 on consecutive readings
- Maintain low-sodium, heart-healthy diet

ELECTRONIC PRESCRIPTION #: RX-2024-77291
This prescription is valid for 12 months from date of issue.`,
    timestamp: now - DAY * 30,
    doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
    isEncrypted: false,
    recordType: 1,
    ipfsHash: "",
    encryptionKey: ""
  },
  {
    id: 5,
    title: "Dermatology Consultation — Skin Assessment",
    type: "Consultation",
    description: "Specialty dermatology consultation for mole evaluation and skin health screening",
    content: `DERMATOLOGY CONSULTATION REPORT
DATE: ${new Date((now - DAY * 20) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
SPECIALIST: Dr. James Wilson, MD — Dermatology
REFERRING: Dr. Sarah Mitchell

CHIEF COMPLAINT:
Annual skin cancer screening and evaluation of pigmented lesion on left forearm.

HISTORY OF PRESENT ILLNESS:
Patient presents for routine annual skin examination. Reports a stable pigmented lesion on the left dorsal forearm present for approximately 3 years. No history of change in size, shape, or color. No pruritus, bleeding, or pain associated with the lesion.

DERMATOLOGIC EXAMINATION:
Total body skin examination performed using dermatoscopy.

FINDINGS:
- Left forearm: 4mm uniformly pigmented macule, symmetric borders, uniform light brown color (dermatoscopic: benign reticular pattern) — consistent with benign junctional nevus
- Upper back: Two 2-3mm lightly pigmented macules — consistent with solar lentigines
- No atypical nevi or lesions suspicious for malignancy identified
- No evidence of actinic keratosis or skin cancer
- Fitzpatrick skin type: III

ASSESSMENT:
1. Benign junctional nevus, left forearm — no intervention needed
2. Solar lentigines, upper back — benign, no treatment required
3. Overall low risk for skin malignancy

PLAN:
1. Continue monthly self-skin examinations
2. Maintain sun protection (SPF 30+ daily)
3. Routine follow-up in 12 months
4. Return promptly if any lesion changes in character

PATIENT EDUCATION PROVIDED:
- ABCDEs of melanoma detection reviewed
- Sun protection measures discussed
- Self-examination technique demonstrated`,
    timestamp: now - DAY * 20,
    doctorAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    isEncrypted: false,
    recordType: 0,
    ipfsHash: "",
    encryptionKey: ""
  },
  {
    id: 6,
    title: "Sleep Study Analysis Report",
    type: "Analyse",
    description: "Overnight polysomnography results and sleep quality assessment",
    content: `POLYSOMNOGRAPHY REPORT — SLEEP STUDY
DATE: ${new Date((now - DAY * 10) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
FACILITY: Advanced Sleep Medicine Center
REFERRING: Dr. Sarah Mitchell

STUDY TYPE: Full Night Polysomnography (PSG)
RECORDING TIME: 7 hours 42 minutes
TOTAL SLEEP TIME: 6 hours 28 minutes
SLEEP EFFICIENCY: 84.2% (Normal > 80%)

SLEEP ARCHITECTURE:
┌──────────────────────────┬──────────┬──────────┐
│ Stage                    │ Duration │ % of TST │
├──────────────────────────┼──────────┼──────────┤
│ N1 (Light Sleep)         │ 32 min   │ 8.2%     │
│ N2 (Stable Sleep)        │ 189 min  │ 48.7%    │
│ N3 (Deep/Slow Wave)      │ 96 min   │ 24.7%    │
│ REM Sleep                │ 71 min   │ 18.3%    │
└──────────────────────────┴──────────┴──────────┘

RESPIRATORY EVENTS:
- Apnea-Hypopnea Index (AHI): 2.4 events/hr (Normal < 5)
- Oxygen Desaturation Index: 1.8 events/hr
- Lowest O2 Saturation: 93% (Normal > 90%)
- No significant respiratory events detected

CARDIAC MONITORING:
- Mean Heart Rate during sleep: 62 bpm
- No significant arrhythmias detected
- Periodic Limb Movement Index: 4.2/hr (Normal < 15)

CONCLUSION:
Normal sleep study. No evidence of obstructive sleep apnea or other sleep-disordered breathing. Normal sleep architecture and oxygenation.

RECOMMENDATIONS:
1. Maintain consistent sleep schedule (7-9 hours)
2. Optimize sleep hygiene — dark, cool, quiet environment
3. Limit caffeine after 2:00 PM
4. Follow-up only if symptoms develop`,
    timestamp: now - DAY * 10,
    doctorAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    isEncrypted: false,
    recordType: 2,
    ipfsHash: "",
    encryptionKey: ""
  }
];

export const SAMPLE_DOCTORS = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
    name: "Dr. Sarah Mitchell",
    specialty: "General Practitioner",
    hasAccess: true,
    grantedAt: now - DAY * 90
  },
  {
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    hasAccess: true,
    grantedAt: now - DAY * 60
  },
  {
    address: "0x0987654321098765432109876543210987654321",
    name: "Dr. Emily Chen",
    specialty: "Cardiology",
    hasAccess: true,
    grantedAt: now - DAY * 30
  }
];

export const SAMPLE_PATIENTS = [
  {
    address: "0x1234567890123456789012345678901234567890",
    name: "John Anderson",
    accessGrantedAt: now - DAY * 90,
    records: [
      {
        id: 101,
        title: "Cardiac Stress Test Results",
        type: "Radiologie",
        description: "Treadmill stress echocardiogram for chest pain evaluation",
        content: `STRESS ECHOCARDIOGRAM REPORT
DATE: ${new Date((now - DAY * 85) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: John Anderson
REFERRING: Dr. Sarah Mitchell

PROTOCOL: Bruce Protocol — 9 minutes 42 seconds
MAXIMUM HEART RATE: 162 bpm (94% of age-predicted max)
BLOOD PRESSURE RESPONSE: 128/82 → 168/88 (Normal)
ECG INTERPRETATION: No ischemic ST changes

RESTING ECHOCARDIOGRAM:
- LVEF: 58% (Normal)
- Wall Motion: Normal
- Valves: Normal function

STRESS ECHOCARDIOGRAM:
- No inducible wall motion abnormalities
- Appropriate heart rate and blood pressure response
- Normal contractile reserve

CONCLUSION:
Negative stress echocardiogram. Low probability of significant coronary artery disease.`,
        timestamp: now - DAY * 85,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 3,
        ipfsHash: "",
        encryptionKey: ""
      },
      {
        id: 102,
        title: "Type 2 Diabetes Management Plan",
        type: "Consultation",
        description: "Initial consultation and treatment plan for newly diagnosed diabetes",
        content: `DIABETES MANAGEMENT CONSULTATION
DATE: ${new Date((now - DAY * 75) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: John Anderson
PHYSICIAN: Dr. Sarah Mitchell

ASSESSMENT:
Newly diagnosed Type 2 Diabetes Mellitus (ICD-10: E11.9)
HbA1c: 7.8% (Elevated — target < 7.0%)
Fasting Glucose: 142 mg/dL

CURRENT MEDICATIONS:
- Metformin 500 mg BID
- Atorvastatin 20 mg daily

TREATMENT PLAN:
1. Continue Metformin 500 mg twice daily with meals
2. Initiate dietary counseling — reduced carbohydrate intake
3. Target HbA1c < 7.0% at 3-month follow-up
4. Daily glucose monitoring — fasting and 2-hour postprandial
5. Ophthalmology referral for diabetic eye exam
6. Podiatry referral for foot evaluation

LABS ORDERED:
- Repeat HbA1c in 3 months
- Urine microalbumin
- Comprehensive metabolic panel`,
        timestamp: now - DAY * 75,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 0,
        ipfsHash: "",
        encryptionKey: ""
      },
      {
        id: 103,
        title: "Hemoglobin A1c Follow-Up",
        type: "Analyse",
        description: "Three-month diabetes follow-up lab work",
        content: `LABORATORY RESULTS — DIABETES FOLLOW-UP
DATE: ${new Date((now - DAY * 10) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: John Anderson

DIABETIC MARKERS:
┌─────────────────────┬──────────┬────────────┬──────────┐
│ Parameter           │ Result   │ Prior (3mo)│ Status   │
├─────────────────────┼──────────┼────────────┼──────────┤
│ HbA1c               │ 6.8%     │ 7.8%       │ Improved │
│ Fasting Glucose     │ 118 mg/dL│ 142 mg/dL  │ Improved │
│ Postprandial (2hr)  │ 146 mg/dL│ 178 mg/dL  │ Improved │
└─────────────────────┴──────────┴────────────┴──────────┘

INTERPRETATION:
Excellent response to treatment. HbA1c decreased by 1.0% in 3 months.
Continue current management plan. Target HbA1c < 7.0% achieved.`,
        timestamp: now - DAY * 10,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 2,
        ipfsHash: "",
        encryptionKey: ""
      }
    ]
  },
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
    name: "Maria Garcia",
    accessGrantedAt: now - DAY * 60,
    records: [
      {
        id: 201,
        title: "Prenatal Visit — First Trimester",
        type: "Consultation",
        description: "Initial prenatal examination and ultrasound",
        content: `PRENATAL VISIT REPORT
DATE: ${new Date((now - DAY * 55) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: Maria Garcia
GESTATIONAL AGE: 10 weeks 3 days
ESTIMATED DUE DATE: ${new Date((now + DAY * 200) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

VITAL SIGNS:
- BP: 112/72 mmHg (Normal)
- Weight: 62.5 kg — Pre-pregnancy: 58.0 kg
- Fundal Height: Appropriate for gestational age

FETAL ULTRASOUND:
- Single intrauterine pregnancy
- Fetal heart rate: 162 bpm (Normal 140-170)
- Crown-rump length: 3.4 cm (Consistent with dates)
- Nuchal translucency: 1.6 mm (Normal < 3.5 mm)
- No structural abnormalities identified

LABS ORDERED:
- Complete blood count
- Blood type and Rh
- Rubella antibody titer
- Hepatitis B surface antigen
- HIV screening
- Urinalysis and culture

PLAN:
1. Continue prenatal vitamins with folic acid
2. Schedule anatomy scan at 18-20 weeks
3. Next visit in 4 weeks
4. Discussed prenatal genetic screening options`,
        timestamp: now - DAY * 55,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 0,
        ipfsHash: "",
        encryptionKey: ""
      },
      {
        id: 202,
        title: "Iron Deficiency Anemia — Treatment",
        type: "Ordonnance",
        description: "Prescription for iron supplementation",
        content: `PRESCRIPTION ORDER
DATE: ${new Date((now - DAY * 40) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: Maria Garcia
DIAGNOSIS: Iron Deficiency Anemia (ICD-10: D50.9) — Pregnancy-associated

LAB VALUES:
- Hemoglobin: 10.8 g/dL (Low — Normal: 12.0-15.5)
- Ferritin: 18 ng/mL (Low — Normal: 20-200)
- Iron Saturation: 14% (Low — Normal: 20-50%)

MEDICATION: Ferrous Sulfate 325 mg (65 mg elemental iron)
DOSAGE: One (1) tablet by mouth twice daily
QUANTITY: 60 tablets
REFILLS: 2
DIRECTIONS: Take on empty stomach with vitamin C (orange juice) for optimal absorption. May cause constipation — increase fiber and water intake.

PLAN:
1. Recheck CBC and ferritin in 6 weeks
2. Dietary counseling — iron-rich foods (lean red meat, spinach, legumes)
3. Consider IV iron if no response to oral therapy`,
        timestamp: now - DAY * 40,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 1,
        ipfsHash: "",
        encryptionKey: ""
      }
    ]
  },
  {
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    name: "Robert Kim",
    accessGrantedAt: now - DAY * 45,
    records: [
      {
        id: 301,
        title: "Knee MRI — Post-Trauma Evaluation",
        type: "Radiologie",
        description: "MRI evaluation of right knee after sports injury",
        content: `MRI REPORT — RIGHT KNEE
DATE: ${new Date((now - DAY * 40) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: Robert Kim
TECHNIQUE: Multiplanar multisequence MRI of the right knee without contrast

HISTORY:
Sports-related injury during basketball game 2 weeks ago. Patient reports hearing a "pop" followed by swelling and instability.

FINDINGS:
- MEDIAL MENISCUS: Complex tear involving the posterior horn (Grade III) — 1.2 cm horizontal cleavage tear
- LATERAL MENISCUS: Intact with normal signal
- ANTERIOR CRUCIATE LIGAMENT: Intact with normal course and signal
- POSTERIOR CRUCIATE LIGAMENT: Intact
- MEDIAL COLLATERAL LIGAMENT: Grade I sprain — mild increased signal, intact fibers
- LATERAL COLLATERAL LIGAMENT: Intact
- PATELLAR TENDON: Normal
- JOINT EFFUSION: Moderate-sized effusion present
- ARTICULAR CARTILAGE: Normal thickness and signal throughout
- BONE MARROW: No contusion or fracture

IMPRESSION:
1. Complex tear of the medial meniscus posterior horn
2. Grade I MCL sprain
3. Moderate joint effusion

RECOMMENDATION:
Orthopedic surgery consultation for arthroscopic meniscal repair versus partial meniscectomy.`,
        timestamp: now - DAY * 40,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 3,
        ipfsHash: "",
        encryptionKey: ""
      },
      {
        id: 302,
        title: "Physical Therapy Evaluation",
        type: "Consultation",
        description: "Pre-operative physical therapy assessment for knee rehabilitation",
        content: `PHYSICAL THERAPY EVALUATION
DATE: ${new Date((now - DAY * 30) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: Robert Kim
DIAGNOSIS: Medial meniscus tear, right knee (ICD-10: S83.241A)

SUBJECTIVE:
Reports ongoing right knee pain (6/10) with weight-bearing activities. Difficulty descending stairs. Intermittent locking sensation.

OBJECTIVE:
- RANGE OF MOTION: Extension 0-5° (limited), Flexion 0-110° (limited, normal 135°)
- STRENGTH: Quadriceps 4-/5, Hamstrings 4/5 (Right)
- SWELLING: Mild effusion present
- GAIT: Antalgic gait pattern — decreased stance phase on right
- SPECIAL TESTS: Positive McMurray's test, Positive Thessaly test
- FUNCTIONAL SCORE: Lower Extremity Functional Scale 52/80

ASSESSMENT:
Patient presents with significant functional limitations due to medial meniscus tear. Pain and mechanical symptoms are limiting daily activities and sport participation.

PLAN:
1. Pre-surgical rehabilitation — 2x/week for 4 weeks
2. Goals: Reduce swelling, maintain ROM, strengthen quadriceps
3. Educate on post-operative rehabilitation expectations
4. Home exercise program provided

THERAPY PRESCRIPTION:
- Therapeutic exercise for quadriceps and hamstring strengthening
- Manual therapy for joint mobilization
- Neuromuscular re-education for gait retraining
- Cryotherapy and compression for edema management`,
        timestamp: now - DAY * 30,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 0,
        ipfsHash: "",
        encryptionKey: ""
      },
      {
        id: 303,
        title: "Post-Surgery Discharge Summary",
        type: "Consultation",
        description: "Hospital discharge summary after arthroscopic meniscal repair",
        content: `DISCHARGE SUMMARY — ARTHROSCOPIC MENISCAL REPAIR
DATE: ${new Date((now - DAY * 5) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
PATIENT: Robert Kim
PROCEDURE: Arthroscopic medial meniscus repair, right knee
SURGEON: Dr. Patricia Ortiz, MD — Orthopedic Surgery
HOSPITAL STAY: Same-day surgery (Outpatient)

PROCEDURE DETAILS:
Arthroscopic exploration revealed a 1.2 cm longitudinal tear of the medial meniscus posterior horn. Successful repair performed using 3 all-inside suture anchors. No complications.

POST-OPERATIVE STATUS:
- Pain controlled with oral analgesics (Norco 5/325 mg q6h PRN)
- Incisions clean, dry, intact
- Neurovascular status intact distally
- Ambulating with crutches — toe-touch weight bearing
- Discharged home with family

DISCHARGE INSTRUCTIONS:
1. Use crutches — toe-touch weight bearing for 2 weeks
2. Ice and elevation for swelling management
3. Change dressing in 48 hours — keep incisions dry
4. Follow-up with Dr. Ortiz in 2 weeks

MEDICATIONS:
- Norco 5/325 mg: 1 tab q6h PRN pain (dispensed: 20 tabs)
- Aspirin 81 mg: 1 tab daily for DVT prophylaxis (30 days)
- Colace 100 mg: 1 tab BID for constipation prevention

RESTRICTIONS:
- No driving for 2 weeks (right knee surgery)
- No sports for 4-6 months
- No heavy lifting > 10 lbs for 4 weeks
- Follow physical therapy protocol as prescribed

EMERGENCY CONTACT:
Return to emergency department for: fever > 101°F, uncontrolled pain, wound drainage, calf pain/swelling, chest pain, or shortness of breath.`,
        timestamp: now - DAY * 5,
        doctorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4",
        isEncrypted: false,
        recordType: 0,
        ipfsHash: "",
        encryptionKey: ""
      }
    ]
  }
];

export function getSampleRecordsForPatient() {
  return SAMPLE_PATIENT_RECORDS;
}

export function getSampleDoctors() {
  return SAMPLE_DOCTORS;
}

export function getSamplePatientsForDoctor() {
  return SAMPLE_PATIENTS;
}
