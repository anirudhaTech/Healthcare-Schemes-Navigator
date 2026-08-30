import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Bookmark,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Phone,
  Globe,
  FileText,
  FileCheck,
  Users,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Scheme } from '../types';
import { api } from '../services/api';

interface SchemeDetailPageProps {
  slug: string;
  onBack: () => void;
  onFindHospitals: (slug: string) => void;
  onCheckEligibility: () => void;
}

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({
  slug,
  onBack,
  onFindHospitals,
  onCheckEligibility,
}) => {
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.schemes.get(slug);
        setScheme(data);
      } catch (err) {
        console.error('Failed to load scheme details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  const handleSave = async () => {
    if (!scheme) return;
    try {
      await api.schemes.save(scheme.id);
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save scheme');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading verified government scheme information...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-800">Scheme not found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          ← Back to Schemes Directory
        </button>
      </div>
    );
  }

  const rule = scheme.eligibility_rule;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Scheme Explorer</span>
      </button>

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                scheme.scheme_type === 'Central'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {scheme.scheme_type} Scheme
              </span>

              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                {scheme.states_covered}
              </span>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {scheme.coverage_amount}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {scheme.name}
            </h1>

            <p className="text-xs text-slate-500 font-medium">
              Administering Authority: {scheme.government_department}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
              {scheme.long_description || scheme.short_description}
            </p>
          </div>

          {/* Quick Action Side Panel */}
          <div className="flex flex-col gap-2.5 shrink-0 sm:w-60">
            <button
              onClick={() => onFindHospitals(scheme.slug)}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-center"
            >
              <Building2 className="w-4 h-4" />
              <span>Find Empanelled Hospitals</span>
            </button>

            <button
              onClick={onCheckEligibility}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check My Eligibility</span>
            </button>

            <a
              href={scheme.official_website}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Official Government Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleSave}
              className={`py-2 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isSaved ? 'Saved to Profile' : 'Save Scheme'}</span>
            </button>
          </div>
        </div>

        {/* Official Data Provenance Notice */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Helpline</span>
            <span className="font-extrabold text-sm text-slate-900 block mt-0.5">{scheme.helpline}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Application Mode</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5">{scheme.application_mode}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Data Verified</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5">{scheme.last_verified_date}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Source</span>
            <span className="font-bold text-emerald-800 text-[11px] truncate block mt-0.5">{scheme.official_source}</span>
          </div>
        </div>
      </div>

      {/* Grid: Eligibility & Covered Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statutory Eligibility Criteria */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Eligibility & Qualifying Criteria</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 min-w-28">Target Group:</span>
              <span>{scheme.target_population}</span>
            </div>

            {rule && (
              <>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-28">Age Bracket:</span>
                  <span>
                    {rule.min_age === 0 && rule.max_age === 120
                      ? 'No age restrictions (Infants to Senior Citizens)'
                      : `${rule.min_age} to ${rule.max_age} years`}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-28">Gender:</span>
                  <span>{rule.gender === 'All' ? 'All Genders (Male, Female, Other)' : rule.gender}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-28">Income Limit:</span>
                  <span>
                    {rule.max_annual_income > 0
                      ? `Annual family income up to ₹${rule.max_annual_income.toLocaleString('en-IN')}`
                      : 'No explicit income limit (determined by BPL / SECC deprivation status)'}
                  </span>
                </div>

                {rule.bpl_required && (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900 min-w-28">Ration Card:</span>
                    <span>Requires valid BPL, Antyodaya (AAY), or Priority Household (PHH) card</span>
                  </div>
                )}

                {rule.requires_pregnancy && (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900 min-w-28">Maternal Status:</span>
                    <span>Applicable to pregnant women in 2nd/3rd trimesters</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Benefits Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Key Benefits & Medical Packages</span>
          </h2>

          <div className="space-y-3">
            {scheme.benefits && scheme.benefits.length > 0 ? (
              scheme.benefits.map((b) => (
                <div key={b.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                  <strong className="text-emerald-950 block text-xs font-bold">{b.title}</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{b.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Comprehensive secondary and tertiary inpatient healthcare.</p>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents & Application Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Documents */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span>Required Documents & KYC</span>
          </h2>

          <div className="space-y-2.5">
            {scheme.documents && scheme.documents.length > 0 ? (
              scheme.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-bold block">{doc.name}</strong>
                    {doc.description && <p className="text-slate-500 text-[11px] mt-0.5">{doc.description}</p>}
                    {doc.alternatives && <span className="text-[10px] text-slate-400 block mt-0.5">Alt: {doc.alternatives}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Aadhaar Card and State Ration Card / Identity Proof.</p>
            )}
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>How to Apply / Claim Benefits</span>
          </h2>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {scheme.application_process || '1. Visit nearest empanelled hospital or Common Service Centre (CSC).\n2. Present Aadhaar and Ration card at the helpdesk.\n3. Receive cashless treatment approval.'}
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Always ensure your Aadhaar details match your hospital records for instant biometrics verification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
