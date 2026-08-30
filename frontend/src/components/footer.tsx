import React from 'react';
import { HeartPulse, PhoneCall, ShieldCheck, ExternalLink, Globe, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Emergency & Official Helplines Ribbon */}
      <div className="bg-emerald-900/60 border-b border-emerald-800/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-white text-sm">Official Citizen Healthcare Helplines (24x7 Free):</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <span className="bg-slate-900/60 px-3 py-1.5 rounded-md border border-emerald-700/50 text-white">
              Ayushman PM-JAY: <strong className="text-emerald-400">14555</strong>
            </span>
            <span className="bg-slate-900/60 px-3 py-1.5 rounded-md border border-emerald-700/50 text-white">
              State Health: <strong className="text-emerald-400">104</strong>
            </span>
            <span className="bg-slate-900/60 px-3 py-1.5 rounded-md border border-emerald-700/50 text-white">
              National Emergency / Ambulance: <strong className="text-emerald-400">108 / 102</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Arogya<span className="text-emerald-400">Nav</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, transparent public healthcare navigation platform helping Indian citizens discover eligible government schemes and find verified empanelled hospitals near them.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Grounded in verified official MoHFW & NHA public data.</span>
            </div>
          </div>

          {/* Col 2: Major Schemes */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Major Health Schemes
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="https://pmjay.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">Ayushman Bharat PM-JAY <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://www.jeevandayee.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">MJPJAY Maharashtra <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://pmsma.nhp.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">PMSMA Maternal Care <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://rbsk.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">RBSK Child Health <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://abdm.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">Ayushman Bharat Digital (ABHA) <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Government Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="https://www.myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">myScheme National Portal <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://nha.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">National Health Authority (NHA) <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://main.mohfw.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">Ministry of Health & Family Welfare <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://mera.pmjay.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">Am I Eligible Portal (NHA) <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://arogya.maharashtra.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">Public Health Dept Maharashtra <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Col 4: Important Public Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Public Notice & Privacy
            </h4>
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Informational Guidance Only</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                This platform calculates scheme match relevance based on public rules. We never guarantee benefit approval. Final eligibility and claims are determined exclusively by official hospital desk verification.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 ArogyaNav — Healthcare Schemes & Hospital Navigator. Public Service Demonstration Project.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Notice</span>
            <span>•</span>
            <span>Terms of Access</span>
            <span>•</span>
            <span>Official Data Attribution</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
