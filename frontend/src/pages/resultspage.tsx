import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Building2,
  Bookmark,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { EligibilityResponse, RecommendedScheme } from '../types';
import { api } from '../services/api';

interface ResultsPageProps {
  results: EligibilityResponse;
  userData: any;
  onViewDetails: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
  onRetake: () => void;
  onNavigateToCompare: (schemeIds: number[]) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  userData,
  onViewDetails,
  onFindHospitals,
  onRetake,
  onNavigateToCompare,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [expandedSchemeId, setExpandedSchemeId] = useState<number | null>(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState<number[]>([]);

  const toggleCompare = (id: number) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSave = async (id: number) => {
    try {
      await api.schemes.save(id);
      setSavedSchemeIds((prev) => [...prev, id]);
    } catch (err) {
      console.error('Failed to save scheme');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner / Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Recommendations Complete</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {results.eligible_count + results.potentially_eligible_count} Schemes Match Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl">
              Based on your age ({userData?.age || 35} yrs), location ({userData?.district || 'Your District'}, {userData?.state || 'India'}), and requirement ({userData?.healthcare_requirement || 'Health'}).
            </p>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <button
              onClick={onRetake}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Check</span>
            </button>
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10 text-left">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-emerald-400 font-extrabold text-xl sm:text-2xl block">{results.eligible_count}</span>
            <span className="text-[11px] text-slate-300 font-medium">Fully Eligible</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-amber-400 font-extrabold text-xl sm:text-2xl block">{results.potentially_eligible_count}</span>
            <span className="text-[11px] text-slate-300 font-medium">Potentially Eligible</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-slate-300 font-extrabold text-xl sm:text-2xl block">{results.total_schemes_evaluated}</span>
            <span className="text-[11px] text-slate-400 font-medium">Total Evaluated</span>
          </div>
        </div>
      </div>

      {/* Floating Comparison Action Bar if schemes are selected */}
      {selectedForCompare.length >= 2 && (
        <div className="sticky top-20 z-30 bg-indigo-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-slideDown border border-indigo-700">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Scale className="w-4 h-4 text-indigo-300" />
            <span>{selectedForCompare.length} schemes selected for side-by-side comparison</span>
          </div>
          <button
            onClick={() => onNavigateToCompare(selectedForCompare)}
            className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Compare Now →
          </button>
        </div>
      )}

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Ranked Recommendations with Explainable Reasons
          </h2>
          <span className="text-xs text-slate-500">Sorted by AI Match Score</span>
        </div>

        {results.recommendations.map((item: RecommendedScheme) => {
          const isExpanded = expandedSchemeId === item.scheme.id;
          const isCompared = selectedForCompare.includes(item.scheme.id);
          const isSaved = savedSchemeIds.includes(item.scheme.id);

          return (
            <div
              key={item.scheme.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden p-6 sm:p-8 relative"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.eligibility_status === 'ELIGIBLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.eligibility_status === 'POTENTIALLY_ELIGIBLE'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.eligibility_status.replace('_', ' ')}
                    </span>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.scheme.scheme_type} Scheme
                    </span>

                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.scheme.coverage_amount}
                    </span>
                  </div>

                  <h3
                    onClick={() => onViewDetails(item.scheme.slug)}
                    className="text-xl font-black text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer pt-1"
                  >
                    {item.scheme.name}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {item.scheme.government_department}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {item.scheme.short_description}
                  </p>
                </div>

                {/* Score Dial Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-emerald-100">
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span className="text-base font-black">{Math.round(item.match_score)}%</span>
                    <span className="text-xs font-bold">Match</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                    {item.match_level}
                  </span>
                </div>
              </div>

              {/* Explainable "Why Recommended" Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Why this scheme matches you:
                  </span>
                  <ul className="space-y-1.5 text-xs text-emerald-900">
                    {item.why_recommended.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-tight">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Verification Notice */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Official Verification Note:
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {item.verification_warning}
                  </p>
                </div>
              </div>

              {/* Expandable detailed score breakdown */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 animate-fadeIn">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Score Factor Breakdown (Weighted 0–100%)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Rule Match (50%)</span>
                      <span className="font-extrabold text-sm text-slate-900">{item.score_breakdown.rule_score} / 50</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Health Need (20%)</span>
                      <span className="font-extrabold text-sm text-slate-900">{item.score_breakdown.healthcare_need_score} / 20</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Demographics (10%)</span>
                      <span className="font-extrabold text-sm text-slate-900">{item.score_breakdown.demographic_score} / 10</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Location (10%)</span>
                      <span className="font-extrabold text-sm text-slate-900">{item.score_breakdown.location_score} / 10</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Socioeconomic (10%)</span>
                      <span className="font-extrabold text-sm text-slate-900">{item.score_breakdown.socioeconomic_score} / 10</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCompare(item.scheme.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isCompared
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Selected for Compare' : '+ Compare'}</span>
                  </button>

                  <button
                    onClick={() => handleSave(item.scheme.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSaved
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{isSaved ? 'Saved to Profile' : 'Save Scheme'}</span>
                  </button>

                  <button
                    onClick={() => setExpandedSchemeId(isExpanded ? null : item.scheme.id)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Factors' : 'View Scoring Factors'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFindHospitals(item.scheme.slug)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Find Empanelled Hospitals Nearby</span>
                  </button>

                  <button
                    onClick={() => onViewDetails(item.scheme.slug)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>View Scheme Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
