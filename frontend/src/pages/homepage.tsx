import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Building2,
  FileCheck,
  Search,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Hospital as HospitalIcon
} from 'lucide-react';
import { Scheme } from '../types';
import { api } from '../services/api';
import { SchemeCard } from '../components/SchemeCard';
import { DemoPersonaSelector, DemoPersona } from '../components/DemoPersonaSelector';

interface HomePageProps {
  onNavigate: (tab: string, params?: any) => void;
  openChat: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, openChat }) => {
  const [featuredSchemes, setFeaturedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.schemes.list({ featured_only: true });
        setFeaturedSchemes(data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured schemes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSelectPersona = (persona: DemoPersona) => {
    // Navigate directly to Eligibility Check with pre-filled persona data
    onNavigate('eligibility', { presetData: persona.data });
  };

  const faqs = [
    {
      q: 'How does the Eligibility Engine evaluate my qualification?',
      a: 'The engine uses official criteria from the National Health Authority (NHA) and State Health Agencies. It evaluates age, family income, ration card/BPL status, state domicile, and medical need against statutory guidelines to determine if you are Eligible, Potentially Eligible, or Ineligible.',
    },
    {
      q: 'What is the "Find Schemes Near You" Hospital Navigator?',
      a: 'Unlike generic information portals, ArogyaNav connects your location (State → District → Taluka) directly with verified empanelled hospitals. You can view which local public and private hospitals accept PM-JAY, MJPJAY, or other schemes, complete with distance in kilometers and map directions.',
    },
    {
      q: 'Does this platform guarantee approval for hospital admission?',
      a: 'No. ArogyaNav is an informational navigation and discovery assistant. Hospital cashless admissions and insurance claims are verified directly by hospital Arogya Mitra / Helpdesk staff upon presenting required identity documents.',
    },
    {
      q: 'Is my personal information kept secure and private?',
      a: 'Yes. We do not sell or share citizen information. You can check eligibility completely as a Guest without creating an account.',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Indian Healthcare Schemes & Verified Empanelled Hospitals</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto text-white">
            Find the Right Healthcare Scheme{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              & Hospitals Near You
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover government healthcare schemes you qualify for in minutes. Get explainable AI recommendations, explore benefits, and find verified local hospitals accepting your scheme.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => onNavigate('eligibility')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group"
            >
              <FileCheck className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Check My Eligibility</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('hospitals')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Find Hospitals Near Me</span>
            </button>

            <button
              onClick={openChat}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/40 text-teal-300 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>

          {/* Key Value Stat Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto text-left">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">₹5 Lakh</span>
              <span className="text-[11px] text-slate-400 font-medium">Free Hospitalization / Family</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">100% Cashless</span>
              <span className="text-[11px] text-slate-400 font-medium">Secondary & Tertiary Care</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">Verified</span>
              <span className="text-[11px] text-slate-400 font-medium">State & District Hospitals</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">Explainable</span>
              <span className="text-[11px] text-slate-400 font-medium">Rule-Based Reasonings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Interactive Demo Personas */}
        <div>
          <DemoPersonaSelector onSelectPersona={handleSelectPersona} />
        </div>

        {/* 3-Step Discovery Journey */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simple 3-Step Navigation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How ArogyaNav Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              A transparent journey connecting your personal requirements to verified government schemes and local hospitals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Answer Simple Questions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide basic demographic, location (district/taluka), and healthcare requirement details. No Aadhaar or confidential documents are uploaded.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-600/30">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Explainable AI Matching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The deterministic rule engine evaluates statutory criteria, and our recommendation model generates 0–100% match scores with clear explanations of why you matched.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-slate-900/30">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Locate Nearby Hospitals
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover verified public and private hospitals in your taluka accepting the scheme, view distance in km, check 24x7 emergency status, and get instant directions.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Government Healthcare Schemes */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Major Government Healthcare Schemes
              </h2>
              <p className="text-xs text-slate-500">
                Verified national and state healthcare programs available across India.
              </p>
            </div>

            <button
              onClick={() => onNavigate('schemes')}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <span>Explore All Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onViewDetails={(slug) => onNavigate('scheme-detail', { slug })}
                onFindHospitals={(slug) => onNavigate('hospitals', { scheme_slug: slug })}
              />
            ))}
          </div>
        </section>

        {/* Location-Based Hospital Navigator Highlight Banner */}
        <section className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-600/40">
              Location-Based Hospital Discovery
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Don't just know your schemes — find where to access them.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Explore our geospatial directory connecting District Hospitals, Medical Colleges, and Private Empanelled Centers with real-time distance and available schemes.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('hospitals')}
                className="px-6 py-3 rounded-xl bg-white text-slate-950 font-extrabold text-xs hover:bg-slate-100 transition-colors shadow-md flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Search Nearby Hospitals</span>
              </button>
              <button
                onClick={() => onNavigate('compare')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-colors"
              >
                Compare Schemes Side-by-Side
              </button>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Common questions regarding eligibility, government sources, and hospital empanelment.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/70 font-bold text-xs sm:text-sm text-slate-900"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
