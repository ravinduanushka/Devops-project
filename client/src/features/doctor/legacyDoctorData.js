// Existing demonstration profiles retained during the structural refactor.
// These are sample data, not records loaded from the hospital database.
export const initialPatientsCatalog = {
  "04": {
    token: "04",
    name: "Kavindi Jayawardena",
    age: 34,
    gender: "Female",
    pid: "P-88210",
    room: "02",
    bloodGroup: "A+",
    allergy: "None known",
    vitals: { bp: "118/76 mmHg", pulse: "72 bpm", temp: "98.6°F" },
    pastHistory: [
      {
        date: "Jan 12, 2026 - Routine Health Checkup",
        desc: "All baseline labs normal, healthy recovery.",
      },
      {
        date: "Aug 05, 2025 - ENT Consultation",
        desc: "Treated for seasonal allergic rhinitis.",
      },
    ],
    symptoms: "Mild fever and sore throat for 3 days, mild fatigue.",
    diagnosis: "Acute viral pharyngitis. Conservative symptomatic care.",
    medications: [
      {
        id: 1,
        name: "Amoxicillin",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "7 days",
      },
      {
        id: 2,
        name: "Ibuprofen",
        dosage: "400 mg",
        frequency: "Once daily",
        duration: "5 days",
      },
    ],
    diagnostics: {
      bloodTests: true,
      urineTest: false,
      xRay: false,
      ecg: false,
    },
    followUpAdvice:
      "Take after meals. Drink plenty of water. Schedule a follow-up in 2 weeks.",
  },
  "05": {
    token: "05",
    name: "Kamal Perera",
    age: 38,
    gender: "Male",
    pid: "P-1042",
    room: "02",
    bloodGroup: "O+",
    allergy: "Penicillin",
    vitals: { bp: "124/80 mmHg", pulse: "74 bpm", temp: "98.6°F" },
    pastHistory: [
      {
        date: "Oct 09, 2026 - OPD Intake",
        desc: "Front-desk registration completed, token assigned.",
      },
      {
        date: "May 14, 2025 - Routine Health Check",
        desc: "All baseline labs normal, healthy recovery.",
      },
    ],
    symptoms:
      "Mild chest tightness upon exertion, persistent dry cough for 2 days.",
    diagnosis:
      "Early exertion-related bronchial irritation. Conservative symptomatic care.",
    medications: [
      {
        id: 1,
        name: "Salbutamol Inhaler",
        dosage: "100 mcg",
        frequency: "As needed",
        duration: "14 days",
      },
      {
        id: 2,
        name: "Paracetamol",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "5 days",
      },
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: true, ecg: true },
    followUpAdvice:
      "Rest adequately. Return immediately if breathlessness or tightness worsens.",
  },
  "06": {
    token: "06",
    name: "Nalani Wickramasinghe",
    age: 29,
    gender: "Female",
    pid: "P-2045",
    room: "02",
    bloodGroup: "B+",
    allergy: "Sulfa drugs",
    vitals: { bp: "112/70 mmHg", pulse: "80 bpm", temp: "99.1°F" },
    pastHistory: [
      {
        date: "Nov 02, 2025 - Neurology Clinic",
        desc: "Evaluated for recurring migraine episodes.",
      },
    ],
    symptoms:
      "Unilateral throbbing headache, photophobia and nausea since yesterday.",
    diagnosis: "Acute migraine attack with moderate tension headache.",
    medications: [
      {
        id: 1,
        name: "Sumatriptan",
        dosage: "50 mg",
        frequency: "Once daily",
        duration: "3 days",
      },
      {
        id: 2,
        name: "Paracetamol",
        dosage: "650 mg",
        frequency: "Twice daily",
        duration: "3 days",
      },
    ],
    diagnostics: {
      bloodTests: false,
      urineTest: false,
      xRay: false,
      ecg: false,
    },
    followUpAdvice:
      "Rest in a quiet, dark room. Maintain hydration and keep a headache diary.",
  },
  "07": {
    token: "07",
    name: "Nuwan Pradeep",
    age: 58,
    gender: "Male",
    pid: "P-3089",
    room: "02",
    bloodGroup: "AB-",
    allergy: "Aspirin",
    vitals: { bp: "142/90 mmHg", pulse: "88 bpm", temp: "99.8°F" },
    pastHistory: [
      {
        date: "Mar 10, 2026 - Pulmonology Review",
        desc: "Chronic bronchitis with moderate wheezing.",
      },
    ],
    symptoms:
      "Productive cough with yellowish sputum, shortness of breath on exertion.",
    diagnosis:
      "Exacerbation of chronic bronchitis. Inpatient observation advised if oxygen dips.",
    medications: [
      {
        id: 1,
        name: "Azithromycin",
        dosage: "500 mg",
        frequency: "Once daily",
        duration: "5 days",
      },
      {
        id: 2,
        name: "Salbutamol Inhaler",
        dosage: "100 mcg",
        frequency: "Three times daily",
        duration: "7 days",
      },
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: true, ecg: false },
    followUpAdvice:
      "Monitor SpO2 twice daily. Return immediately if breathlessness worsens.",
  },
  "08": {
    token: "08",
    name: "Kamal Perera",
    age: 38,
    gender: "Male",
    pid: "P-1042",
    room: "02",
    bloodGroup: "O+",
    allergy: "Penicillin",
    vitals: { bp: "120/80 mmHg", pulse: "78 bpm", temp: "99.4°F" },
    pastHistory: [
      {
        date: "Oct 2, 2026 - GP Consultation",
        desc: "Treated for viral fever, recovery good.",
      },
      { date: "Sep 14, 2026 - Cardiology Checkup", desc: "Routine ECG clear." },
    ],
    symptoms:
      "Patient reports persistent mild chest tightness, slight shortness of breath when walking.",
    diagnosis:
      "Suspected mild respiratory or cardiac effort under-exertion. Further testing required.",
    medications: [
      {
        id: 1,
        name: "Ibuprofen",
        dosage: "400 mg",
        frequency: "Once daily",
        duration: "5 days",
      },
      {
        id: 2,
        name: "Metformin",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "14 days",
      },
    ],
    diagnostics: { bloodTests: true, urineTest: false, xRay: false, ecg: true },
    followUpAdvice:
      "Take after meals. Drink plenty of water. Schedule a follow-up in 2 weeks.",
  },
};
