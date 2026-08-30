export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  age?: number;
  gender?: string;
  marital_status?: string;
  state?: string;
  district?: string;
  taluka?: string;
  city_village?: string;
  pincode?: string;
  area_type?: string;
  annual_income?: number;
  income_bracket?: string;
  occupation?: string;
  bpl_status?: boolean;
  ration_card_type?: string;
  social_category?: string;
  family_size?: number;
  children_count?: number;
  elderly_count?: number;
  dependents_count?: number;
  has_disability?: boolean;
  disability_percentage?: number;
  healthcare_requirement?: string;
  has_chronic_illness?: boolean;
  chronic_conditions?: string;
  is_pregnant?: boolean;
  is_lactating?: boolean;
  child_age_months?: number;
  hospitalization_needed?: boolean;
  has_existing_insurance?: boolean;
}

export interface SchemeBenefit {
  id?: number;
  title: string;
  description: string;
  benefit_type?: string;
  amount?: number;
}

export interface SchemeDocument {
  id?: number;
  name: string;
  is_mandatory: boolean;
  description?: string;
  alternatives?: string;
}

export interface SchemeEligibilityRule {
  id?: number;
  min_age: number;
  max_age: number;
  gender: string;
  max_annual_income: number;
  bpl_required: boolean;
  secc_required?: boolean;
  ration_card_types?: string;
  allowed_social_categories?: string;
  allowed_occupations?: string;
  rural_urban?: string;
  requires_disability?: boolean;
  requires_pregnancy?: boolean;
  requires_lactating?: boolean;
  requires_child?: boolean;
  max_child_age_years?: number;
  requires_senior?: boolean;
  requires_hospitalization?: boolean;
  applicable_states?: string;
  healthcare_conditions: string;
  match_reasons_template?: string;
  verification_caveat_template?: string;
}

export interface Scheme {
  id: number;
  slug: string;
  name: string;
  category?: string;
  disease_focus?: string;
  short_description: string;
  long_description?: string;
  government_department: string;
  scheme_type: string;
  target_population: string;
  states_covered: string;
  coverage_state?: string;
  coverage_amount: string;
  income_limit?: string;
  cashless: boolean;
  application_mode: string;
  application_process?: string;
  application_url?: string;
  official_website: string;
  helpline: string;
  last_verified_date: string;
  official_source: string;
  data_source?: string;
  source_file?: string;
  source_record_id?: number;
  verification_status?: string;
  is_active: boolean;
  featured?: boolean;
  eligibility_rule?: SchemeEligibilityRule;
  benefits?: SchemeBenefit[];
  documents?: SchemeDocument[];
  empanelled_hospitals_count?: number;
}

export interface RuleEvaluationDetail {
  status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  matched_criteria: string[];
  unmatched_criteria: string[];
  verification_caveats: string[];
  summary: string;
}

export interface RecommendationScoreBreakdown {
  rule_score: number;
  healthcare_need_score: number;
  demographic_score: number;
  location_score: number;
  socioeconomic_score: number;
  total_score: number;
  match_level: string;
}

export interface RecommendedScheme {
  scheme: Scheme;
  eligibility_status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  match_score: number;
  match_level: string;
  rule_evaluation: RuleEvaluationDetail;
  score_breakdown: RecommendationScoreBreakdown;
  why_recommended: string[];
  verification_warning: string;
  nearby_hospitals_count?: number;
}

export interface EligibilityResponse {
  total_schemes_evaluated: number;
  eligible_count: number;
  potentially_eligible_count: number;
  recommendations: RecommendedScheme[];
  disclaimer: string;
}

export interface HospitalSchemeMapping {
  scheme_id: number;
  scheme_name: string;
  scheme_slug: string;
  status: string;
  empanelment_number?: string;
  services_covered?: string;
  last_verified_date?: string;
  official_source?: string;
  notes?: string;
}

export interface Hospital {
  id: number;
  name: string;
  hospital_type?: string;
  is_government?: boolean;
  state: string;
  district_name: string;
  taluka_name?: string | null;
  city_village?: string | null;
  pincode?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coordinate_source?: string | null;
  phone?: string | null;
  emergency_contact?: string | null;
  email?: string | null;
  website?: string | null;
  specialties?: string | null;
  facilities?: string | null;
  has_emergency_24x7?: boolean;
  bed_count?: number | null;
  verification_status?: string;
  last_verified_date?: string;
  official_source?: string;
  data_source?: string;
  source_file?: string;
  source_record_id?: number;
  is_active?: boolean;
  distance_km?: number | null;
  recommendation_score?: number | null;
  available_schemes: HospitalSchemeMapping[];
}

export interface DistrictCount {
  district: string;
  hospital_count: number;
  state: string;
}

export interface DataSource {
  id: number;
  name: string;
  organization: string;
  source_type: string;
  url?: string;
  description?: string;
  status: string;
  record_count: number;
  last_checked_at?: string;
}

export interface IngestionLog {
  id: number;
  source_id?: number;
  source_name: string;
  started_at: string;
  completed_at?: string;
  status: string;
  records_found: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  records_failed: number;
  error_message?: string;
  summary_report?: string;
}

export interface Taluka {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
}

export interface District {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  talukas: Taluka[];
}

export interface State {
  id: number;
  name: string;
  code?: string;
  districts: District[];
}

export interface ChatMessage {
  id?: number;
  sender: 'user' | 'assistant';
  content: string;
  relevant_schemes?: Scheme[];
  suggested_followups?: string[];
  sources?: string;
  created_at?: string;
}

export interface AnalyticsOverview {
  total_users: number;
  total_schemes: number;
  total_hospitals: number;
  total_eligibility_checks: number;
  top_recommended_schemes: { name: string; count: number }[];
  popular_healthcare_categories: { category: string; percentage: number }[];
  state_wise_activity?: { state: string; checks: number; hospitals: number }[];
  recent_checks_trend?: { date: string; checks: number }[];
}
