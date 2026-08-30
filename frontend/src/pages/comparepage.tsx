import React, { useState, useEffect } from 'react';
import { Scale, Plus, Trash2, ArrowLeft, Building2, Sparkles } from 'lucide-react';
import { Scheme } from '../types';
import { api } from '../services/api';
import { ComparisonTable } from '../components/ComparisonTable';

interface ComparePageProps {
  initialSchemeIds?: number[];
  onViewDetails: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  initialSchemeIds = [],
  onViewDetails,
  onFindHospitals,
}) => {
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSchemeIds.length > 0 ? initialSchemeIds : [1, 2]);
  const [comparedSchemes, setComparedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await api.schemes.list();
        setAllSchemes(data);
        if (selectedIds.length === 0 && data.length >= 2) {
          setSelectedIds([data[0].id, data[1].id]);
        }
      } catch (err) {
        console.error('Failed to load schemes list', err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const loadComparison = async () => {
      if (selectedIds.length < 2) {
        setComparedSchemes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.compare.getMatrix(selectedIds);
        setComparedSchemes(data.schemes);
      } catch (err) {
        console.error('Failed to compare schemes', err);
      } finally {
        setLoading(false);
      }
    };
    loadComparison();
  }, [selectedIds]);

  const handleAddScheme = (id: number) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveScheme = (id: number) => {
    setSelectedIds(selectedIds.filter((sId) => sId !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Side-by-Side Scheme Comparison Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Compare Healthcare Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Evaluate benefits, eligibility rules, and mandatory documents across 2 to 4 government programs.
          </p>
        </div>

        {/* Add Scheme Selector */}
        {selectedIds.length < 4 && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                const id = parseInt(e.target.value);
                if (id) {
                  handleAddScheme(id);
                  e.target.value = '';
                }
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">+ Add Scheme to Compare</option>
              {allSchemes
                .filter((s) => !selectedIds.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading scheme comparison matrix...</p>
        </div>
      ) : (
        <ComparisonTable
          schemes={comparedSchemes}
          onRemoveScheme={handleRemoveScheme}
          onViewDetails={onViewDetails}
          onFindHospitals={onFindHospitals}
        />
      )}
    </div>
  );
};
