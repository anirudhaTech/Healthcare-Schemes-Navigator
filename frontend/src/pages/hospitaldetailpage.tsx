import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Mail,
  ShieldCheck,
  Navigation,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bed,
  Stethoscope,
  FileCheck2,
  Database,
  AlertCircle
} from 'lucide-react';
import { Hospital } from '../types';
import { api } from '../services/api';

interface HospitalDetailPageProps {
  hospitalId: number;
  onBack: () => void;
  onViewScheme: (slug: string) => void;
}

export const HospitalDetailPage: React.FC<HospitalDetailPageProps> = ({
  hospitalId,
  onBack,
  onViewScheme,
}) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.hospitals.get(hospitalId);
        setHospital(data);
      } catch (err) {
        console.error('Failed to load hospital details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading verified hospital profile...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-800">Hospital profile not found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          ← Back to Hospital Directory
        </button>
      </div>
    );
  }

  const hasCoordinates = hospital.latitude !== null && hospital.latitude !== undefined &&
                         hospital.longitude !== null && hospital.longitude !== undefined;

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&destination_place_id=${encodeURIComponent(hospital.name)}`
    : '#';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hospitals Directory</span>
      </button>

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Source Verified Record #{hospital.source_record_id || hospital.id}</span>
              </span>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {hospital.district_name} District, Maharashtra
              </span>

              {hospital.has_emergency_24x7 && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>24x7 Emergency</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {hospital.name}
            </h1>

            <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed pt-1">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {hospital.address || `${hospital.district_name} District, Maharashtra`}
              </span>
            </p>
          </div>

          {/* Quick Action Box */}
          <div className="flex flex-col gap-2 shrink-0 sm:w-56">
            {hasCoordinates ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Get GPS Directions</span>
              </a>
            ) : (
              <div className="py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs text-center">
                Location coordinates unavailable
              </div>
            )}

            {hospital.phone ? (
              <a
                href={`tel:${hospital.phone}`}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call {hospital.phone}</span>
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 text-center italic py-1">
                Phone contact not provided in source
              </span>
            )}
          </div>
        </div>

        {/* Data Provenance & Attribution Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Source File</span>
            <span className="font-mono font-bold text-[11px] text-slate-800 truncate block mt-0.5">
              {hospital.source_file || 'Pasted text (2).txt'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Source Record ID</span>
            <span className="font-extrabold text-sm text-slate-900 block mt-0.5">
              #{hospital.source_record_id || hospital.id}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Verification Status</span>
            <span className="font-bold text-emerald-800 text-xs truncate block mt-0.5">
              {hospital.verification_status || 'source_provided'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Data Source</span>
            <span className="font-bold text-slate-900 text-[11px] truncate block mt-0.5">
              {hospital.data_source || 'Provided Maharashtra Hospital Dataset'}
            </span>
          </div>
        </div>
      </div>

      {/* Verified Empanelled Healthcare Schemes Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Empanelled Healthcare Schemes</span>
          </h2>
          <p className="text-xs text-slate-500">
            Official scheme mappings and authorized clinical empanelment data.
          </p>
        </div>

        {hospital.available_schemes && hospital.available_schemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospital.available_schemes.map((mapping) => (
              <div
                key={mapping.scheme_id}
                className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {mapping.scheme_name}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      Status: {mapping.status}
                    </span>
                  </div>
                  {mapping.empanelment_number && (
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                      {mapping.empanelment_number}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {mapping.services_covered || 'Covers cashless inpatient hospitalization and surgical procedures.'}
                </p>

                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Source: {mapping.official_source}
                  </span>
                  <button
                    onClick={() => onViewScheme(mapping.scheme_slug)}
                    className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    <span>Scheme Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
              Scheme-specific empanelment information not available in supplied dataset.
            </p>
            <p className="text-[11px] text-slate-400">
              This hospital is part of the verified Maharashtra empanelled directory. For specific scheme package eligibility, contact the hospital helpdesk.
            </p>
          </div>
        )}
      </div>

      {/* Facilities, Contact, and Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Contact & Address Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Contact & Address Details</span>
          </h3>
          <div className="space-y-2 text-slate-600">
            <p><strong>District:</strong> {hospital.district_name}</p>
            <p><strong>State:</strong> {hospital.state}</p>
            <p><strong>Taluka / Sub-District:</strong> {hospital.taluka_name || 'Not available in supplied dataset'}</p>
            <p><strong>Phone:</strong> {hospital.phone || 'Not available in supplied dataset'}</p>
            <p><strong>Email:</strong> {hospital.email || 'Not available in supplied dataset'}</p>
            <p><strong>Website:</strong> {hospital.website || 'Not available in supplied dataset'}</p>
          </div>
        </div>

        {/* Clinical Capabilities */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>Clinical Capabilities & Infrastructure</span>
          </h3>
          <div className="space-y-2 text-slate-600">
            <p><strong>Hospital Type:</strong> {hospital.hospital_type || 'Empanelled Hospital'}</p>
            <p><strong>Bed Capacity:</strong> {hospital.bed_count ? `${hospital.bed_count}+ Beds` : 'Not available in supplied dataset'}</p>
            <p><strong>Specialties:</strong> {hospital.specialties || 'Not available in supplied dataset'}</p>
            <p><strong>Facilities:</strong> {hospital.facilities || 'Not available in supplied dataset'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
