import React from 'react';
import { Scheme } from '../types';
import { Check, X, ShieldCheck, ExternalLink, Building2, Trash2 } from 'lucide-react';

interface ComparisonTableProps {
  schemes: Scheme[];
  onRemoveScheme: (schemeId: number) => void;
  onViewDetails: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  schemes,
  onRemoveScheme,
  onViewDetails,
  onFindHospitals,
}) => {
  if (schemes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="text-base font-bold text-slate-800">No schemes selected for comparison</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please select 2 to 4 schemes from the Scheme Explorer or your Recommended Results to see a side-by-side feature comparison.
        </p>
      </div>
    );
  }

  const features = [
    { label: 'Scheme Type', render: (s: Scheme) => s.scheme_type },
    { label: 'Coverage Amount', render: (s: Scheme) => <strong className="text-slate-900 text-sm">{s.coverage_amount}</strong> },
    { label: 'Treatment Mode', render: (s: Scheme) => s.cashless ? <span className="text-emerald-700 font-bold">✓ 100% Cashless</span> : 'Direct Cash Assistance' },
    { label: 'Government Authority', render: (s: Scheme) => s.government_department },
    { label: 'Target Beneficiaries', render: (s: Scheme) => s.target_population },
    { label: 'States Covered', render: (s: Scheme) => s.states_covered },
    {
      label: 'Age Eligibility',
      render: (s: Scheme) => {
        const r = s.eligibility_rule;
        if (!r) return 'All ages';
        return r.min_age === 0 && r.max_age === 120 ? 'All age groups' : `${r.min_age} to ${r.max_age} years`;
      },
    },
    {
      label: 'Gender Scope',
      render: (s: Scheme) => s.eligibility_rule?.gender || 'All genders',
    },
    {
      label: 'Income / Socioeconomic Criteria',
      render: (s: Scheme) => {
        const r = s.eligibility_rule;
        if (!r) return 'General';
        if (r.bpl_required) return 'BPL / SECC / Ration Card Holder';
        if (r.max_annual_income > 0) return `Up to ₹${r.max_annual_income.toLocaleString('en-IN')} / year`;
        return 'No explicit income cap';
      },
    },
    {
      label: 'Mandatory Documents',
      render: (s: Scheme) => {
        if (!s.documents || s.documents.length === 0) return 'Aadhaar / Ration Card';
        return (
          <ul className="text-xs space-y-1">
            {s.documents.map((d, i) => (
              <li key={i} className="flex items-center gap-1 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{d.name}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    { label: 'Application Mode', render: (s: Scheme) => s.application_mode },
    { label: 'National Helpline', render: (s: Scheme) => <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">{s.helpline}</code> },
    {
      label: 'Official Source',
      render: (s: Scheme) => (
        <a
          href={s.official_website}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
        >
          {s.official_source} <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="p-4 w-1/4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100/50">
                Key Parameters
              </th>
              {schemes.map((scheme) => (
                <th key={scheme.id} className="p-4 w-1/4 align-top border-l border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {scheme.name}
                    </h4>
                    <button
                      onClick={() => onRemoveScheme(scheme.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => onFindHospitals(scheme.slug)}
                      className="py-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 border border-emerald-200"
                    >
                      <Building2 className="w-3 h-3" />
                      Hospitals
                    </button>
                    <button
                      onClick={() => onViewDetails(scheme.slug)}
                      className="py-1 px-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold"
                    >
                      Details
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {features.map((feat, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                <td className="p-4 font-bold text-slate-700 bg-slate-50/80 align-top">
                  {feat.label}
                </td>
                {schemes.map((scheme) => (
                  <td key={scheme.id} className="p-4 text-slate-600 border-l border-slate-200/80 align-top leading-relaxed">
                    {feat.render(scheme)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
