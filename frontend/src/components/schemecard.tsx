import React from 'react';
import {
  ShieldCheck,
  Building2,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  Info,
  Scale
} from 'lucide-react';
import { Scheme, RecommendedScheme } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
  recommendation?: RecommendedScheme;
  onViewDetails: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
  onSaveScheme?: (schemeId: number) => void;
  onToggleCompare?: (schemeId: number) => void;
  isSaved?: boolean;
  isCompared?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  recommendation,
  onViewDetails,
  onFindHospitals,
  onSaveScheme,
  onToggleCompare,
  isSaved = false,
  isCompared = false,
}) => {
  const matchScore = recommendation?.match_score;
  const matchLevel = recommendation?.match_level;
  const whyRecommended = recommendation?.why_recommended || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between relative group">
      <div>
        {/* Top Badges & Match Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              scheme.scheme_type === 'Central'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                : 'bg-amber-50 text-amber-800 border border-amber-200/60'
            }`}>
              {scheme.scheme_type} Scheme
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {scheme.states_covered}
            </span>
          </div>

          {/* Match Score Indicator (if evaluated) */}
          {matchScore !== undefined && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-sm font-extrabold">{Math.round(matchScore)}%</span>
                <span className="text-[11px] font-semibold hidden sm:inline">Match</span>
              </div>
              {matchLevel && (
                <span className="text-[10px] font-bold text-emerald-700 mt-1 uppercase tracking-wider">
                  {matchLevel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scheme Title */}
        <h3
          onClick={() => onViewDetails(scheme.slug)}
          className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer leading-snug"
        >
          {scheme.name}
        </h3>

        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {scheme.government_department}
        </p>

        {/* Short Description */}
        <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-2">
          {scheme.short_description}
        </p>

        {/* Key Highlights Pill Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Financial Benefit</span>
            <span className="font-bold text-slate-900 truncate block">{scheme.coverage_amount}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Treatment Mode</span>
            <span className="font-semibold text-emerald-700 truncate block">
              {scheme.cashless ? '✓ 100% Cashless' : 'Cash Assistance'}
            </span>
          </div>
        </div>

        {/* Why Matched List (if evaluated) */}
        {whyRecommended.length > 0 && (
          <div className="mt-3.5 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 space-y-1">
            <span className="font-bold text-emerald-900 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Why this matches you:
            </span>
            {whyRecommended.slice(0, 2).map((reason, idx) => (
              <p key={idx} className="text-emerald-800 text-[11px] leading-tight">
                {reason}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFindHospitals(scheme.slug)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors border border-emerald-200/70"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Find Hospitals</span>
          </button>

          <button
            onClick={() => onViewDetails(scheme.slug)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Secondary comparison and bookmark toggles */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(scheme.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isCompared ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Added to Compare' : '+ Compare'}</span>
            </button>
          )}

          {onSaveScheme && (
            <button
              onClick={() => onSaveScheme(scheme.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isSaved ? 'text-amber-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
