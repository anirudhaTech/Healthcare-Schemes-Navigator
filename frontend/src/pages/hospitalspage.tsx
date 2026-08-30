import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Search,
  Filter,
  Navigation,
  CheckCircle2,
  Sparkles,
  Map as MapIcon,
  List as ListIcon,
  Crosshair,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { Hospital, Scheme, DistrictCount } from '../types';
import { api } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { HospitalCard } from '../components/HospitalCard';
import { MapView } from '../components/MapView';

interface HospitalsPageProps {
  initialSchemeSlug?: string;
  onViewHospital: (id: number) => void;
  onSelectScheme: (slug: string) => void;
}

export const HospitalsPage: React.FC<HospitalsPageProps> = ({
  initialSchemeSlug,
  onViewHospital,
  onSelectScheme,
}) => {
  const {
    selectedState,
    selectedDistrict,
    selectedTaluka,
    pincode,
    userLat,
    userLng,
    locationStatus,
    setSelectedState,
    setSelectedDistrict,
    setSelectedTaluka,
    setPincode,
    useMyLocation,
  } = useLocation();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [districtList, setDistrictList] = useState<DistrictCount[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeSlug, setSelectedSchemeSlug] = useState<string>(initialSchemeSlug || '');
  const [selectedHospitalType, setSelectedHospitalType] = useState<string>('');
  const [hasEmergencyOnly, setHasEmergencyOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  useEffect(() => {
    if (initialSchemeSlug) {
      setSelectedSchemeSlug(initialSchemeSlug);
    }
  }, [initialSchemeSlug]);

  // Load registered schemes and available districts from database
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [schemesData, districtsData] = await Promise.all([
          api.schemes.list(),
          api.hospitals.getDistricts('Maharashtra')
        ]);
        setAllSchemes(schemesData);
        setDistrictList(districtsData);
      } catch (err) {
        console.error('Failed to load initial directory metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await api.hospitals.search({
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
        taluka: selectedTaluka || undefined,
        pincode: pincode || undefined,
        scheme_slug: selectedSchemeSlug || undefined,
        hospital_type: selectedHospitalType || undefined,
        has_emergency: hasEmergencyOnly ? true : undefined,
        search: searchQuery || undefined,
        user_lat: userLat || undefined,
        user_lng: userLng || undefined,
        max_distance_km: 100.0,
      });
      setHospitals(data);
    } catch (err) {
      console.error('Failed to fetch hospitals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedState, selectedDistrict, selectedTaluka, selectedSchemeSlug, selectedHospitalType, hasEmergencyOnly, userLat, userLng]);

  const handleResetFilters = () => {
    setSelectedSchemeSlug('');
    setSelectedHospitalType('');
    setHasEmergencyOnly(false);
    setSearchQuery('');
    setSelectedDistrict('');
  };

  // Center coordinates for Map view
  const mapCenterLat = userLat || 19.7515;
  const mapCenterLng = userLng || 75.7139;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-emerald-800/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                Maharashtra Healthcare Directory
              </span>
              <span className="text-xs font-semibold text-emerald-300/80 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                520 Verified Empanelled Hospitals
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Empanelled Hospital Navigator
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Explore authentic empanelled hospitals across 28 Maharashtra districts. Direct provenance links to state and central health assurance programs.
            </p>
          </div>

          {/* Use My Location GPS Button */}
          <button
            onClick={useMyLocation}
            disabled={locationStatus === 'locating'}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
          >
            <Crosshair className={`w-4 h-4 text-slate-950 ${locationStatus === 'locating' ? 'animate-spin' : ''}`} />
            <span>{locationStatus === 'locating' ? 'Detecting GPS...' : 'Find Nearest (GPS)'}</span>
          </button>
        </div>

        {/* Cascading Location Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs">
          {/* State */}
          <div>
            <label className="text-slate-300 font-bold block mb-1 text-[11px] uppercase">State</label>
            <select
              value={selectedState || 'Maharashtra'}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-400"
            >
              <option value="Maharashtra" className="text-slate-900">Maharashtra (All Districts)</option>
            </select>
          </div>

          {/* District - Dynamic from real 28 districts */}
          <div>
            <label className="text-slate-300 font-bold block mb-1 text-[11px] uppercase">
              District ({districtList.length} Districts Available)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-400"
            >
              <option value="" className="text-slate-900">All Maharashtra Districts</option>
              {districtList.map((d) => (
                <option key={d.district} value={d.district} className="text-slate-900">
                  {d.district} ({d.hospital_count} hospitals)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div>
            <label className="text-slate-300 font-bold block mb-1 text-[11px] uppercase">Search by Hospital Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Jupiter, Noble, Sassoon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchHospitals()}
                className="w-full bg-white/10 text-white placeholder:text-slate-400 border border-white/20 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={fetchHospitals}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Scheme Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={selectedSchemeSlug}
            onChange={(e) => setSelectedSchemeSlug(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Schemes & Services</option>
            {allSchemes.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Hospital Type Filter */}
          <select
            value={selectedHospitalType}
            onChange={(e) => setSelectedHospitalType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Hospital Types</option>
            <option value="Empanelled Hospital">Empanelled Hospital</option>
            <option value="Government Hospital">Government Hospital</option>
            <option value="Private Hospital">Private Hospital</option>
            <option value="Medical College">Medical College Hospital</option>
          </select>
        </div>

        {/* Right: View Toggle (List vs Map) */}
        <div className="flex items-center gap-2">
          {(selectedSchemeSlug || selectedHospitalType || selectedDistrict || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List ({hospitals.length})</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result Count and Active Location Badge */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>
            Showing hospitals in <strong>{selectedDistrict ? `${selectedDistrict}, ` : ''}Maharashtra</strong>
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>
        <span className="font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {hospitals.length} hospitals found
        </span>
      </div>

      {/* Content Rendering: Map View or List View */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView
            hospitals={hospitals}
            centerLat={mapCenterLat}
            centerLng={mapCenterLng}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={(id) => setSelectedHospitalId(id)}
            userLat={userLat}
            userLng={userLng}
          />
          {/* Below map: quick cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {hospitals.slice(0, 6).map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onViewHospital={onViewHospital}
                onSelectScheme={onSelectScheme}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Searching hospital registry...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No Hospitals Found</h3>
                <p className="text-xs text-slate-500">
                  No hospitals found for this location.
                </p>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• Try selecting a different Maharashtra district from the dropdown</p>
                <p>• Clear keywords or search terms</p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onViewHospital={onViewHospital}
                  onSelectScheme={onSelectScheme}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
