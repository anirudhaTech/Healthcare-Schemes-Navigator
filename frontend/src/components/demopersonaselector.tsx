import React from 'react';
import { UserCheck, Sparkles, Baby, HeartPulse } from 'lucide-react';

export interface DemoPersona {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  data: {
    age: number;
    gender: string;
    marital_status: string;
    state: string;
    district: string;
    taluka: string;
    city_village: string;
    pincode: string;
    area_type: string;
    annual_income: number;
    income_bracket: string;
    occupation: string;
    bpl_status: boolean;
    ration_card_type: string;
    social_category: string;
    family_size: number;
    children_count: number;
    elderly_count: number;
    dependents_count: number;
    has_disability: boolean;
    disability_percentage: number;
    healthcare_requirement: string;
    has_chronic_illness: boolean;
    chronic_conditions: string;
    is_pregnant: boolean;
    is_lactating: boolean;
    child_age_months: number;
    hospitalization_needed: boolean;
    has_existing_insurance: boolean;
  };
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'senior-hospitalization',
    name: 'Anirudha Patil (Senior Citizen)',
    tag: 'Hospitalization & Surgery',
    description: 'Age 62, Low Income, BPL Ration Card, Karvir (Kolhapur). Needs cashless hospital surgery.',
    icon: UserCheck,
    data: {
      age: 62,
      gender: 'Male',
      marital_status: 'Married',
      state: 'Maharashtra',
      district: 'Kolhapur',
      taluka: 'Karvir',
      city_village: 'Kolhapur City',
      pincode: '416003',
      area_type: 'Urban',
      annual_income: 120000,
      income_bracket: 'Below 1L',
      occupation: 'Senior Citizen / Retired',
      bpl_status: true,
      ration_card_type: 'BPL / Yellow',
      social_category: 'OBC',
      family_size: 4,
      children_count: 0,
      elderly_count: 2,
      dependents_count: 2,
      has_disability: false,
      disability_percentage: 0,
      healthcare_requirement: 'Hospitalization',
      has_chronic_illness: true,
      chronic_conditions: 'Hypertension, Osteoarthritis',
      is_pregnant: false,
      is_lactating: false,
      child_age_months: 0,
      hospitalization_needed: true,
      has_existing_insurance: false,
    },
  },
  {
    id: 'pregnant-mother',
    name: 'Sunita Kamble (Young Mother)',
    tag: 'Maternal & Antenatal Care',
    description: 'Age 26, Pregnant (2nd Trimester), Low-to-Middle Income, Karvir. Needs free ANC & delivery assistance.',
    icon: HeartPulse,
    data: {
      age: 26,
      gender: 'Female',
      marital_status: 'Married',
      state: 'Maharashtra',
      district: 'Kolhapur',
      taluka: 'Karvir',
      city_village: 'Uchgaon',
      pincode: '416005',
      area_type: 'Rural',
      annual_income: 160000,
      income_bracket: '1L-2.5L',
      occupation: 'Homemaker',
      bpl_status: true,
      ration_card_type: 'Priority Household (PHH) / Orange',
      social_category: 'SC',
      family_size: 3,
      children_count: 0,
      elderly_count: 0,
      dependents_count: 1,
      has_disability: false,
      disability_percentage: 0,
      healthcare_requirement: 'Maternal / Child',
      has_chronic_illness: false,
      chronic_conditions: '',
      is_pregnant: true,
      is_lactating: false,
      child_age_months: 0,
      hospitalization_needed: false,
      has_existing_insurance: false,
    },
  },
  {
    id: 'rural-child-rbsk',
    name: 'Aarav Shinde (Child Care)',
    tag: 'Pediatric Health & RBSK',
    description: 'Age 6, Congenital heart condition detected in Anganwadi screening, Hatkanangle (Kolhapur).',
    icon: Baby,
    data: {
      age: 6,
      gender: 'Male',
      marital_status: 'Single',
      state: 'Maharashtra',
      district: 'Kolhapur',
      taluka: 'Hatkanangle',
      city_village: 'Hatkanangle Village',
      pincode: '416109',
      area_type: 'Rural',
      annual_income: 90000,
      income_bracket: 'Below 1L',
      occupation: 'Student',
      bpl_status: true,
      ration_card_type: 'Antyodaya (AAY)',
      social_category: 'General',
      family_size: 5,
      children_count: 2,
      elderly_count: 1,
      dependents_count: 3,
      has_disability: false,
      disability_percentage: 0,
      healthcare_requirement: 'Child Health',
      has_chronic_illness: true,
      chronic_conditions: 'Congenital Heart Defect (Screened under RBSK)',
      is_pregnant: false,
      is_lactating: false,
      child_age_months: 72,
      hospitalization_needed: true,
      has_existing_insurance: false,
    },
  },
];

interface DemoPersonaSelectorProps {
  onSelectPersona: (persona: DemoPersona) => void;
}

export const DemoPersonaSelector: React.FC<DemoPersonaSelectorProps> = ({ onSelectPersona }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-md border border-emerald-800/40 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Interactive Demonstration Personas</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                1-Click Preset
              </span>
            </h4>
            <p className="text-xs text-emerald-200/80">
              Quickly test realistic citizen profiles to observe explainable match scoring and local hospital discovery.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEMO_PERSONAS.map((persona) => {
          const Icon = persona.icon;
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-white group-hover:text-emerald-300 truncate">
                    {persona.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 block mt-0.5">
                  {persona.tag}
                </span>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-tight">
                  {persona.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
