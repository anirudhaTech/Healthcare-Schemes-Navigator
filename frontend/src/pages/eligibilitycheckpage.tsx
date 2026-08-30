import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  Building2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/ProgressBar';
import { DemoPersonaSelector, DemoPersona } from '../components/DemoPersonaSelector';
import { EligibilityResponse } from '../types';

interface EligibilityCheckPageProps {
  initialPreset?: any;
  onEvaluationComplete: (results: EligibilityResponse, formData: any) => void;
}

export const EligibilityCheckPage: React.FC<EligibilityCheckPageProps> = ({
  initialPreset,
  onEvaluationComplete,
}) => {
  const { states, availableDistricts, availableTalukas, setSelectedState, setSelectedDistrict, setSelectedTaluka } = useLocation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    // Step 1: Personal
    age: 35,
    gender: 'Male',
    marital_status: 'Married',
    
    // Step 2: Location
    state: 'Maharashtra',
    district: 'Kolhapur',
    taluka: 'Karvir',
    city_village: 'Kolhapur City',
    pincode: '416003',
    area_type: 'Urban',
    
    // Step 3: Socioeconomic
    annual_income: 120000,
    income_bracket: 'Below 1L',
    occupation: 'Daily Wage Worker',
    bpl_status: true,
    ration_card_type: 'BPL / Yellow',
    social_category: 'OBC',
    
    // Step 4: Family
    family_size: 4,
    children_count: 1,
    elderly_count: 1,
    dependents_count: 2,
    has_disability: false,
    disability_percentage: 0,
    
    // Step 5: Healthcare Need
    healthcare_requirement: 'Hospitalization',
    has_chronic_illness: false,
    chronic_conditions: '',
    is_pregnant: false,
    is_lactating: false,
    child_age_months: 0,
    hospitalization_needed: true,
    has_existing_insurance: false,
  });

  useEffect(() => {
    if (initialPreset) {
      setFormData((prev) => ({ ...prev, ...initialPreset }));
      if (initialPreset.state) setSelectedState(initialPreset.state);
      if (initialPreset.district) setSelectedDistrict(initialPreset.district);
      if (initialPreset.taluka) setSelectedTaluka(initialPreset.taluka);
    }
  }, [initialPreset]);

  const steps = [
    { id: 1, name: 'Personal Details', shortName: 'Personal' },
    { id: 2, name: 'Location Scope', shortName: 'Location' },
    { id: 3, name: 'Socioeconomic', shortName: 'Income' },
    { id: 4, name: 'Family Profile', shortName: 'Family' },
    { id: 5, name: 'Healthcare Need', shortName: 'Health' },
    { id: 6, name: 'Review & Verify', shortName: 'Review' },
  ];

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSelectPreset = (persona: DemoPersona) => {
    setFormData(persona.data);
    setSelectedState(persona.data.state);
    setSelectedDistrict(persona.data.district);
    setSelectedTaluka(persona.data.taluka);
  };

  const validateStep = (stepId: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (stepId === 1) {
      if (formData.age < 0 || formData.age > 120 || isNaN(formData.age)) {
        errors.age = 'Please enter a valid age between 0 and 120.';
      }
      if (!formData.gender) {
        errors.gender = 'Please select your gender.';
      }
    }

    if (stepId === 2) {
      if (!formData.state) {
        errors.state = 'Please select your resident state.';
      }
      if (!formData.district) {
        errors.district = 'Please select your district.';
      }
    }

    if (stepId === 3) {
      if (formData.annual_income < 0 || isNaN(formData.annual_income)) {
        errors.annual_income = 'Please enter a valid annual income amount.';
      }
    }

    if (stepId === 5) {
      if (!formData.healthcare_requirement) {
        errors.healthcare_requirement = 'Please specify your primary healthcare requirement.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(5)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.eligibility.check(formData);
      onEvaluationComplete(response, formData);
    } catch (err) {
      console.error('Eligibility check failed', err);
      setFormErrors({ submit: 'Failed to process eligibility. Please check backend connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300/60">
          Statutory Eligibility & Recommendation Engine
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Discover Healthcare Schemes You Qualify For
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Complete this 6-step questionnaire to receive instant, explainable scheme recommendations and nearby hospital availability.
        </p>
      </div>

      {/* Preset Demo Persona Selector Bar */}
      <DemoPersonaSelector onSelectPersona={handleSelectPreset} />

      {/* Main Questionnaire Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10">
        <ProgressBar
          steps={steps}
          currentStep={currentStep}
          onStepClick={(sId) => {
            if (sId < currentStep) setCurrentStep(sId);
          }}
        />

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Step 1 — Personal Demographics</h2>
              <p className="text-xs text-slate-500">
                Age and gender help us identify specific age-bracketed entitlements (such as RBSK pediatric care, maternal care, or senior citizen benefits).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age (in years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                />
                {formErrors.age && <p className="text-xs text-red-600 mt-1">{formErrors.age}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => updateField('gender', g)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        formData.gender === g
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {formErrors.gender && <p className="text-xs text-red-600 mt-1">{formErrors.gender}</p>}
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Marital Status
                </label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => updateField('marital_status', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced / Separated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Step 2 — Location Scope</h2>
              <p className="text-xs text-slate-500">
                Government health schemes have state and district-specific benefits (e.g. MJPJAY in Maharashtra, CMCHIS in Tamil Nadu).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  State / Union Territory <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => {
                    updateField('state', e.target.value);
                    setSelectedState(e.target.value);
                    updateField('district', '');
                    updateField('taluka', '');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-white"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>
                {formErrors.state && <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => {
                    updateField('district', e.target.value);
                    setSelectedDistrict(e.target.value);
                    updateField('taluka', '');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 bg-white"
                >
                  <option value="">Select District</option>
                  {availableDistricts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  {/* Fallback for Kolhapur / Pune */}
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
                {formErrors.district && <p className="text-xs text-red-600 mt-1">{formErrors.district}</p>}
              </div>

              {/* Taluka */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Taluka / Sub-District
                </label>
                <select
                  value={formData.taluka}
                  onChange={(e) => {
                    updateField('taluka', e.target.value);
                    setSelectedTaluka(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="">Select Taluka</option>
                  {availableTalukas.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                  <option value="Karvir">Karvir</option>
                  <option value="Hatkanangle">Hatkanangle</option>
                  <option value="Shahuwadi">Shahuwadi</option>
                  <option value="Haveli">Haveli</option>
                </select>
              </div>

              {/* Area Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Area Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Rural', 'Urban'].map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => updateField('area_type', a)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        formData.area_type === a
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {a} Area
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Socioeconomic Details */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Step 3 — Socioeconomic Profile</h2>
              <p className="text-xs text-slate-500">
                Income thresholds and BPL / NFSA Ration cards are primary qualifying factors for free insurance covers like PM-JAY.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Annual Income */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Annual Family Income (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.annual_income}
                  onChange={(e) => updateField('annual_income', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current: ₹{formData.annual_income.toLocaleString('en-IN')} / year
                </span>
                {formErrors.annual_income && <p className="text-xs text-red-600 mt-1">{formErrors.annual_income}</p>}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Occupation
                </label>
                <select
                  value={formData.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="Daily Wage Worker">Daily Wage Worker / Informal Labor</option>
                  <option value="Farmer / Agricultural Worker">Farmer / Agricultural Worker</option>
                  <option value="Self Employed / Artisan">Self Employed / Artisan / Small Vendor</option>
                  <option value="Salaried Employee (Private)">Salaried Employee (Private)</option>
                  <option value="Government Employee">Government Employee</option>
                  <option value="Senior Citizen / Retired">Senior Citizen / Retired</option>
                  <option value="Student">Student</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Ration Card Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ration Card Category
                </label>
                <select
                  value={formData.ration_card_type}
                  onChange={(e) => {
                    updateField('ration_card_type', e.target.value);
                    const isBpl = e.target.value.includes('BPL') || e.target.value.includes('Antyodaya') || e.target.value.includes('Priority');
                    updateField('bpl_status', isBpl);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="Antyodaya (AAY)">Antyodaya Anna Yojana (AAY / Poorest of Poor)</option>
                  <option value="BPL / Yellow">BPL / Yellow Card (Below Poverty Line)</option>
                  <option value="Priority Household (PHH) / Orange">Priority Household (PHH) / Orange Card</option>
                  <option value="White / Non-BPL">White Card / Above Poverty Line (APL)</option>
                  <option value="None">No Ration Card</option>
                </select>
              </div>

              {/* Social Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Social Category
                </label>
                <select
                  value={formData.social_category}
                  onChange={(e) => updateField('social_category', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="General">General / Open</option>
                  <option value="OBC">Other Backward Classes (OBC)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Family Details */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Step 4 — Family Profile</h2>
              <p className="text-xs text-slate-500">
                Helps evaluate schemes with family floater coverage (PM-JAY covers entire family with no cap on family size).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Family Size */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Family Members
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.family_size}
                  onChange={(e) => updateField('family_size', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Elderly Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Senior Citizens (60+ yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.elderly_count}
                  onChange={(e) => updateField('elderly_count', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Children Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Children (0–18 yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.children_count}
                  onChange={(e) => updateField('children_count', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Disability Toggle */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Person with Disability (PwD)</span>
                <span className="text-[11px] text-slate-500">Is any family member a certified person with benchmark disability?</span>
              </div>
              <input
                type="checkbox"
                checked={formData.has_disability}
                onChange={(e) => updateField('has_disability', e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Healthcare Need */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Step 5 — Healthcare Need</h2>
              <p className="text-xs text-slate-500">
                Match your immediate or anticipated medical requirement with schemes providing specialized benefits.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Primary Healthcare Requirement <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'Hospitalization', title: 'Hospitalization & Surgery', desc: 'Inpatient treatment, planned surgery, ICU admission' },
                  { id: 'Maternal / Child', title: 'Maternal & Pregnancy Care', desc: 'Antenatal care, institutional delivery, newborn health' },
                  { id: 'Child Health', title: 'Child / Pediatric Care', desc: 'RBSK screening, congenital defect surgery, developmental therapy' },
                  { id: 'Critical Illness', title: 'Critical Illness / Oncology', desc: 'Cancer chemotherapy/radiation, cardiac surgery, dialysis' },
                  { id: 'General Care', title: 'General & Preventive OPD', desc: 'Free medicines, diagnostic blood tests, NCD wellness screening' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      updateField('healthcare_requirement', item.id);
                      if (item.id === 'Hospitalization' || item.id === 'Critical Illness') {
                        updateField('hospitalization_needed', true);
                      }
                      if (item.id === 'Maternal / Child') {
                        updateField('is_pregnant', true);
                      }
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.healthcare_requirement === item.id
                        ? 'bg-emerald-50/80 border-emerald-600 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{item.title}</span>
                      {formData.healthcare_requirement === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              {formErrors.healthcare_requirement && (
                <p className="text-xs text-red-600 mt-1">{formErrors.healthcare_requirement}</p>
              )}

              {/* Conditional Pregnancy Check */}
              {formData.gender === 'Female' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Currently Pregnant?</span>
                    <span className="text-[11px] text-slate-500">Qualifies for PMSMA monthly checkups and JSY cash delivery benefits.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_pregnant}
                    onChange={(e) => updateField('is_pregnant', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Step 6 — Review & Confirmation</h2>
              <p className="text-xs text-slate-500">
                Please review your details before running the AI recommendation and eligibility engine.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Age & Gender</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.age} yrs • {formData.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Resident Location</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.taluka || formData.district}, {formData.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Family Income</span>
                  <span className="font-bold text-slate-900 text-sm">₹{formData.annual_income.toLocaleString('en-IN')} / yr</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Ration Card</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.ration_card_type}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Healthcare Requirement</span>
                  <span className="font-bold text-emerald-800 text-sm">{formData.healthcare_requirement}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Family Breakdown</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formData.family_size} members ({formData.elderly_count} elderly, {formData.children_count} children)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-900 font-bold mb-0.5">Privacy Assured</strong>
                <span>
                  Your answers are processed securely to rank government schemes against official statutory rules. No personally identifiable data is stored on public ledgers.
                </span>
              </div>
            </div>

            {formErrors.submit && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {formErrors.submit}
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              <span>{isSubmitting ? 'Evaluating Eligibility...' : 'Submit & Check My Eligibility'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
