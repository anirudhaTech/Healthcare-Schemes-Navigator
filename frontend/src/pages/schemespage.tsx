import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Compass,
  Building2,
  Bookmark,
  RotateCcw,
  Sparkles,
  Scale
} from 'lucide-react';
import { Scheme } from '../types';
import { api } from '../services/api';
import { SchemeCard } from '../components/SchemeCard';

interface SchemesPageProps {
  onViewDetails: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
  onNavigateToCompare: (ids: number[]) => void;
}

export const SchemesPage: React.FC<SchemesPageProps> = ({
  onViewDetails,
  onFindHospitals,
  onNavigateToCompare,
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSchemeType, setSelectedSchemeType] = useState<string>('');
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<number[]>([]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.schemes.list({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        state: selectedState || undefined,
        scheme_type: selectedSchemeType || undefined,
      });
      setSchemes(data);
    } catch (err) {
      console.error('Failed to load schemes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory, selectedState, selectedSchemeType]);

  const handleSaveScheme = async (id: number) => {
    try {
      await api.schemes.save(id);
      setSavedSchemeIds((prev) => [...prev, id]);
    } catch (err) {
      console.error('Failed to save scheme', err);
    }
  };

  const toggleCompare = (id: number) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedState('');
    setSelectedSchemeType('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Official Indian Scheme Directory
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Government Healthcare Schemes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Search and filter official health assistance programs, coverage limits, eligibility rules, and required application documents.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Keyword Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scheme name, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSchemes()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Health Categories</option>
            <option value="Hospitalization">Hospitalization & Surgery</option>
            <option value="Maternal">Maternal & Antenatal Care</option>
            <option value="Child">Child & Pediatric Health (RBSK)</option>
            <option value="Critical Illness">Critical Illness & Oncology</option>
            <option value="General">General & Preventive Care</option>
          </select>

          {/* State Scope Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All States Coverage</option>
            <option value="Maharashtra">Maharashtra Specific</option>
            <option value="Tamil Nadu">Tamil Nadu Specific</option>
            <option value="All India">Nationwide (Central Schemes)</option>
          </select>

          {/* Scheme Type */}
          <select
            value={selectedSchemeType}
            onChange={(e) => setSelectedSchemeType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Scheme Types</option>
            <option value="Central">Central Govt Schemes</option>
            <option value="State">State Govt Schemes</option>
          </select>
        </div>

        {/* Reset button */}
        {(searchQuery || selectedCategory || selectedState || selectedSchemeType) && (
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Floating Comparison Action Bar */}
      {selectedForCompare.length >= 2 && (
        <div className="sticky top-20 z-30 bg-indigo-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-indigo-700 animate-slideDown">
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

      {/* Schemes Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading healthcare scheme directory...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <h3 className="text-base font-bold text-slate-800">No schemes found</h3>
          <p className="text-xs text-slate-500">
            No healthcare programs matched your current search filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onViewDetails={onViewDetails}
              onFindHospitals={onFindHospitals}
              onSaveScheme={handleSaveScheme}
              onToggleCompare={toggleCompare}
              isSaved={savedSchemeIds.includes(scheme.id)}
              isCompared={selectedForCompare.includes(scheme.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
