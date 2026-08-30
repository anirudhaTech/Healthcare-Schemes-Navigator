import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Bookmark,
  FileCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit,
  Save,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scheme, UserProfile } from '../types';

interface DashboardPageProps {
  onViewScheme: (slug: string) => void;
  onFindHospitals: (slug: string) => void;
  onCheckEligibility: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onViewScheme,
  onFindHospitals,
  onCheckEligibility,
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dash, saved, prof] = await Promise.all([
        api.user.getDashboard(),
        api.user.getSavedSchemes(),
        api.user.getProfile(),
      ]);
      setDashboardData(dash);
      setSavedSchemes(saved);
      setProfileData(prof);
    } catch (err) {
      console.error('Failed to load user dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await api.user.updateProfile(profileData);
      setIsEditingProfile(false);
      loadDashboard();
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleRemoveSaved = async (id: number) => {
    try {
      await api.schemes.removeSaved(id);
      setSavedSchemes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to remove saved scheme', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading your healthcare dashboard...</p>
      </div>
    );
  }

  const completionPct = dashboardData?.profile_completion || 65;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/40 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Citizen Healthcare Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.full_name || 'Citizen'}
            </h1>
            <p className="text-xs text-emerald-200/90 max-w-lg">
              Manage your personal healthcare profile, review saved government schemes, and check previous eligibility evaluations.
            </p>
          </div>

          {/* Quick Check CTA */}
          <button
            onClick={onCheckEligibility}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition-colors shadow-md shadow-emerald-500/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>New Eligibility Check</span>
          </button>
        </div>

        {/* Profile Completion Meter */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Profile Completion: {completionPct}%</span>
            <span className="text-emerald-400 font-semibold">
              {completionPct >= 80 ? '✓ Fully Complete' : 'Complete remaining fields for higher accuracy'}
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Profile Editor & Saved Schemes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Saved Schemes & Recent Checks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Schemes */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-600" />
                <span>Saved Healthcare Schemes ({savedSchemes.length})</span>
              </h2>
            </div>

            {savedSchemes.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-2">
                <p className="text-xs text-slate-500">You haven't bookmarked any schemes yet.</p>
                <button
                  onClick={onCheckEligibility}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Run Eligibility Check to discover matching schemes →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-500 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900">{scheme.name}</h4>
                      <p className="text-xs text-emerald-700 font-semibold">{scheme.coverage_amount}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{scheme.target_population}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onFindHospitals(scheme.slug)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                        title="Find Hospitals"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hospitals</span>
                      </button>

                      <button
                        onClick={() => onViewScheme(scheme.slug)}
                        className="p-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-2xs"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleRemoveSaved(scheme.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Remove saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Eligibility Checks */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Recent Eligibility Check Records</span>
            </h2>

            {dashboardData?.recent_checks && dashboardData.recent_checks.length > 0 ? (
              <div className="space-y-2.5">
                {dashboardData.recent_checks.map((check: any) => (
                  <div
                    key={check.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Top Match: {check.top_scheme || 'Healthcare Evaluation'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Evaluated on {check.created_at} • {check.matched_count} schemes qualified
                      </span>
                    </div>

                    {check.match_score > 0 && (
                      <span className="font-black text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                        {Math.round(check.match_score)}% Match
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No saved checks found.</p>
            )}
          </div>
        </div>

        {/* Right Col: Personal Demographics Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>My Profile Details</span>
            </h2>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {isEditingProfile ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Age</label>
                <input
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">State</label>
                <input
                  type="text"
                  value={profileData.state || ''}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">District</label>
                <input
                  type="text"
                  value={profileData.district || ''}
                  onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  value={profileData.annual_income || ''}
                  onChange={(e) => setProfileData({ ...profileData, annual_income: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Ration Card</label>
                <input
                  type="text"
                  value={profileData.ration_card_type || ''}
                  onChange={(e) => setProfileData({ ...profileData, ration_card_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-slate-800">{user?.full_name || 'Citizen'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Email</span>
                <span className="font-bold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Age & Gender</span>
                <span className="font-bold text-slate-800">{profileData.age || '—'} yrs • {profileData.gender || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Location</span>
                <span className="font-bold text-slate-800">{profileData.taluka || profileData.district || 'Kolhapur'}, {profileData.state || 'Maharashtra'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Family Income</span>
                <span className="font-bold text-slate-800">₹{(profileData.annual_income || 120000).toLocaleString('en-IN')} / yr</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Ration Card</span>
                <span className="font-bold text-slate-800">{profileData.ration_card_type || 'BPL / Yellow'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Healthcare Need</span>
                <span className="font-bold text-emerald-800">{profileData.healthcare_requirement || 'Hospitalization'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
