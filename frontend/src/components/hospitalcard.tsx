import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Navigation,
  CheckCircle,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { Hospital } from '../types';

interface HospitalCardProps {
  hospital: Hospital;
  onViewHospital: (id: number) => void;
  onSelectScheme?: (slug: string) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onViewHospital,
  onSelectScheme
}) => {
  const hasCoordinates = hospital.latitude !== null && hospital.latitude !== undefined &&
                         hospital.longitude !== null && hospital.longitude !== undefined;

  const getDirectionsUrl = () => {
    if (!hasCoordinates) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&destination_place_id=${encodeURIComponent(hospital.name)}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Source Data Badge & District Tag */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-emerald-600" />
              <span>Source Data ✓</span>
            </span>

            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {hospital.district_name}
            </span>

            {hospital.has_emergency_24x7 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                24x7 Emergency
              </span>
            )}
          </div>

          {/* Distance Indicator (Only if valid coordinates exist) */}
          {hasCoordinates && hospital.distance_km !== undefined && hospital.distance_km !== null && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-extrabold whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{hospital.distance_km} km</span>
            </div>
          )}
        </div>

        {/* Real Source Hospital Name */}
        <h3
          onClick={() => onViewHospital(hospital.id)}
          className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer leading-snug"
        >
          {hospital.name}
        </h3>

        {/* Location & District info */}
        <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5 leading-relaxed">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {hospital.address || `${hospital.district_name}, Maharashtra`}
          </span>
        </p>

        {/* Coordinates availability notice */}
        {!hasCoordinates && (
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>Map coordinates unavailable in source dataset</span>
          </div>
        )}

        {/* Available Schemes Badges or Strict Absence Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Empanelled Healthcare Schemes
          </span>
          {hospital.available_schemes && hospital.available_schemes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {hospital.available_schemes.map((mapping) => (
                <button
                  key={mapping.scheme_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectScheme) onSelectScheme(mapping.scheme_slug);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>{mapping.scheme_name}</span>
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic block leading-tight">
              Scheme-specific empanelment information not available in supplied dataset.
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewHospital(hospital.id)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors text-center shadow-xs"
        >
          View Details
        </button>

        {hasCoordinates ? (
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 font-semibold px-2">
            Map unavailable
          </span>
        )}

        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title={`Call ${hospital.phone}`}
          >
            <Phone className="w-4 h-4 text-emerald-600" />
          </a>
        )}
      </div>
    </div>
  );
};
