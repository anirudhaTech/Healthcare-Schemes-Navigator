import React, { useState } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const MedicalReportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setText('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE}/medical-report/analyze`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Handwriting recognition failed.');
      setText(data.text || 'No text was detected.');
      setConfidence(data.confidence);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Handwriting Recognition
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Analyze a Doctor's Handwritten Report</h1>
        <p className="mt-2 text-slate-600">Upload a clear JPG, PNG, or WebP image. Google Cloud Vision will extract the handwritten text.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <label className="flex flex-col items-center justify-center min-h-64 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/40 cursor-pointer hover:bg-emerald-50 transition-colors">
            <Upload className="w-10 h-10 text-emerald-600 mb-3" />
            <span className="font-semibold text-slate-800">Choose handwritten report</span>
            <span className="text-xs text-slate-500 mt-1">JPG, PNG or WebP · max 10 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          <button disabled={!file || loading} onClick={analyze} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Recognizing handwriting…' : 'Analyze Report'}
          </button>

          <div className="mt-4 flex gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            AI extraction can contain mistakes. Verify every important field before using it for scheme eligibility.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Extracted Text</h2>
            {confidence !== null && <span className="text-xs font-semibold text-emerald-700">Avg. confidence: {(confidence * 100).toFixed(1)}%</span>}
          </div>
          {error && <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm mb-4">{error}</div>}
          {text ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 min-h-64 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold"><CheckCircle2 className="w-4 h-4" /> Recognition complete</div>
              {text}
            </div>
          ) : (
            <div className="min-h-64 flex items-center justify-center text-sm text-slate-400 text-center">
              Your recognized handwriting will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
