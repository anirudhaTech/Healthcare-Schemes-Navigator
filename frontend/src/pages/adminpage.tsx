import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Upload,
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  RotateCcw,
  Database,
  RefreshCw,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsOverview, Scheme, Hospital, DataSource, IngestionLog } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'sources' | 'schemes' | 'hospitals' | 'import'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshingData, setIsRefreshingData] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Scheme Create Modal / Form state
  const [isCreatingScheme, setIsCreatingScheme] = useState<boolean>(false);
  const [newScheme, setNewScheme] = useState({
    slug: '',
    name: '',
    short_description: '',
    long_description: '',
    government_department: 'Ministry of Health & Family Welfare',
    scheme_type: 'Central',
    target_population: 'Low-income families',
    states_covered: 'All India',
    coverage_amount: '₹5,00,000 per family per year',
    cashless: true,
    application_process: 'Visit empanelled hospital desk with Aadhaar & Ration Card.',
    application_mode: 'Hospital Desk / CSC',
    official_website: 'https://pmjay.gov.in',
    helpline: '14555',
    last_verified_date: 'August 2026',
    official_source: 'National Health Authority',
    min_age: 0,
    max_age: 120,
    gender: 'All',
    max_annual_income: 250000,
    bpl_required: true,
    healthcare_conditions: 'Hospitalization, Surgery, Critical Illness',
  });

  // CSV file upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anData, scData, hoData, dsData, igData] = await Promise.all([
        api.admin.getAnalytics(),
        api.schemes.list(),
        api.hospitals.search({ limit: 100 }),
        api.dataSources.list(),
        api.ingestion.getStatus(),
      ]);
      setAnalytics(anData);
      setSchemes(scData);
      setHospitals(hoData);
      setDataSources(dsData);
      setIngestionLogs(igData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefreshData = async () => {
    setIsRefreshingData(true);
    setRefreshMessage(null);
    try {
      const res = await api.ingestion.refresh();
      setRefreshMessage(`✓ Successfully refreshed: ${res.hospitals_imported} hospitals & ${res.schemes_imported} schemes synchronized.`);
      loadData();
    } catch (err) {
      console.error('Data refresh failed', err);
      setRefreshMessage('Failed to refresh data sources.');
    } finally {
      setIsRefreshingData(false);
    }
  };

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createScheme(newScheme);
      setIsCreatingScheme(false);
      loadData();
    } catch (err) {
      console.error('Failed to create scheme', err);
    }
  };

  const handleDeleteScheme = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this scheme?')) {
      try {
        await api.admin.deleteScheme(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete scheme', err);
      }
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsImporting(true);
    try {
      const res = await api.admin.importHospitalsCSV(csvFile);
      setImportResult(res);
      loadData();
    } catch (err) {
      console.error('CSV import failed', err);
      setImportResult({ success: false, errors: ['Failed to process CSV file.'] });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Admin Title Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
              Healthcare Systems Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Data Ingestion & Scheme Operations
            </h1>
            <p className="text-xs text-purple-200/80">
              Manage statutory eligibility rules, verified Maharashtra empanelled registries, data connectors, and system analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshData}
              disabled={isRefreshingData}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingData ? 'animate-spin' : ''}`} />
              <span>{isRefreshingData ? 'Syncing...' : 'Sync Data Now'}</span>
            </button>

            <button
              onClick={() => setIsCreatingScheme(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Scheme</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-white/10 overflow-x-auto text-xs font-bold">
          {[
            { id: 'analytics', label: 'Analytics Overview', icon: BarChart3 },
            { id: 'sources', label: 'Data Sources & Ingestion', icon: Database },
            { id: 'schemes', label: `Schemes Directory (${schemes.length})`, icon: FileCheck },
            { id: 'hospitals', label: `Empanelled Hospitals (${hospitals.length})`, icon: Building2 },
            { id: 'import', label: 'CSV Bulk Hospital Import', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {refreshMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{refreshMessage}</span>
        </div>
      )}

      {/* TAB 1: Analytics Overview */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Users</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{analytics.total_users}</span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Active Citizens</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Eligibility Checks</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 block mt-1">{analytics.total_eligibility_checks}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Evaluations logged</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Healthcare Schemes</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-700 block mt-1">{analytics.total_schemes}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Central & State catalogs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Empanelled Hospitals</span>
              <span className="text-2xl sm:text-3xl font-black text-purple-700 block mt-1">{analytics.total_hospitals}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Spanning 28 districts</span>
            </div>
          </div>

          {/* Analytics Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Recommended Schemes */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Most Frequently Recommended Schemes</span>
              </h3>

              <div className="space-y-3">
                {analytics.top_recommended_schemes.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{s.name}</span>
                      <span className="text-emerald-700 font-bold">{s.count} recommendations</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (s.count / 300) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Healthcare Needs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Popular Healthcare Requirement Inquiries</span>
              </h3>

              <div className="space-y-3">
                {analytics.popular_healthcare_categories.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{c.category}</span>
                      <span className="text-purple-700 font-bold">{c.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Data Sources & Ingestion Status */}
      {activeTab === 'sources' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Data Quality Report Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Data Integration & Quality Architecture</h3>
                <p className="text-xs text-slate-500">
                  Real dataset connectors, provenance tracking, and idempotent deduplication metrics.
                </p>
              </div>
              <button
                onClick={handleRefreshData}
                disabled={isRefreshingData}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingData ? 'animate-spin' : ''}`} />
                <span>Refresh Data Now</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Hospital Provenance</span>
                <span className="text-xl font-black text-slate-900 block">520 Records</span>
                <span className="text-[11px] text-emerald-700 font-semibold">100% source-provided, 28 districts</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Schemes Catalog</span>
                <span className="text-xl font-black text-slate-900 block">11 Verified Schemes</span>
                <span className="text-[11px] text-emerald-700 font-semibold">Central & Maharashtra State</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Duplicate Prevention</span>
                <span className="text-xl font-black text-emerald-700 block">0 Duplicates</span>
                <span className="text-[11px] text-slate-500 font-semibold">Unique (source_file, record_id) constraint</span>
              </div>
            </div>
          </div>

          {/* Registered Data Sources Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs overflow-hidden">
            <h3 className="font-extrabold text-base text-slate-900">Registered Authoritative Data Sources</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Source Name</th>
                    <th className="p-3">Issuing Organization</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Records Ingested</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataSources.map((ds) => (
                    <tr key={ds.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{ds.name}</td>
                      <td className="p-3 text-slate-600">{ds.organization}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {ds.source_type}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-emerald-700">{ds.record_count}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          {ds.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ingestion Run Logs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs overflow-hidden">
            <h3 className="font-extrabold text-base text-slate-900">Recent Ingestion Run Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Source Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Updated / Verified</th>
                    <th className="p-3">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingestionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-500">#{log.id}</td>
                      <td className="p-3 font-bold text-slate-900">{log.source_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-700">+{log.records_created}</td>
                      <td className="p-3 text-slate-600">{log.records_updated}</td>
                      <td className="p-3 text-slate-500 text-[11px] truncate max-w-sm">{log.summary_report || 'Completed successfully.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Schemes Management Table */}
      {activeTab === 'schemes' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Government Healthcare Schemes Management</h3>
            <button
              onClick={() => setIsCreatingScheme(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scheme</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Scheme Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Coverage Limit</th>
                  <th className="p-3">Target Group</th>
                  <th className="p-3">Last Verified</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {s.scheme_type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-800">{s.coverage_amount}</td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{s.target_population}</td>
                    <td className="p-3 text-slate-500">{s.last_verified_date}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteScheme(s.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Hospital Registry */}
      {activeTab === 'hospitals' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
          <h3 className="font-bold text-base text-slate-900">Verified Empanelled Hospital Registry (Showing {hospitals.length})</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Record ID</th>
                  <th className="p-3">Hospital Name</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Data Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-400">#{h.source_record_id || h.id}</td>
                    <td className="p-3 font-bold text-slate-900">{h.name}</td>
                    <td className="p-3 text-slate-700 font-semibold">{h.district_name}, MH</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {h.verification_status || 'source_provided'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{h.data_source || 'Provided dataset'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CSV Bulk Import */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              <span>Bulk Import Empanelled Hospital Registry (CSV)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload official State Health Agency (SHA) or NHA hospital CSV files to update coordinates, facilities, and empanelments in batch.
            </p>
          </div>

          <form onSubmit={handleCsvUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 hover:border-purple-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <span className="text-[11px] text-slate-400 block">
                Required Columns: hospital_name, hospital_type, state, district, taluka, address, latitude, longitude, phone, specialties
              </span>
            </div>

            <button
              type="submit"
              disabled={!csvFile || isImporting}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/20"
            >
              {isImporting ? 'Validating & Importing...' : 'Validate and Import CSV Data'}
            </button>
          </form>

          {importResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
              importResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              <strong className="block font-bold">
                {importResult.success ? `✓ Successfully imported ${importResult.created_count} hospital records.` : 'Import failed'}
              </strong>
              {importResult.errors && importResult.errors.length > 0 && (
                <ul className="text-[11px] space-y-0.5 pt-1 text-red-700">
                  {importResult.errors.map((err: string, i: number) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scheme Create Modal */}
      {isCreatingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Healthcare Scheme</h3>
              <button onClick={() => setIsCreatingScheme(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slug (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pm-jay"
                    value={newScheme.slug}
                    onChange={(e) => setNewScheme({ ...newScheme, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheme Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Scheme title"
                    value={newScheme.name}
                    onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={newScheme.short_description}
                  onChange={(e) => setNewScheme({ ...newScheme, short_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Financial Coverage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹5,00,000 per year"
                    value={newScheme.coverage_amount}
                    onChange={(e) => setNewScheme({ ...newScheme, coverage_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">States Covered</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra or All India"
                    value={newScheme.states_covered}
                    onChange={(e) => setNewScheme({ ...newScheme, states_covered: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Annual Income</label>
                  <input
                    type="number"
                    value={newScheme.max_annual_income}
                    onChange={(e) => setNewScheme({ ...newScheme, max_annual_income: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Helpline</label>
                  <input
                    type="text"
                    value={newScheme.helpline}
                    onChange={(e) => setNewScheme({ ...newScheme, helpline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Portal URL</label>
                  <input
                    type="url"
                    value={newScheme.official_website}
                    onChange={(e) => setNewScheme({ ...newScheme, official_website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingScheme(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
