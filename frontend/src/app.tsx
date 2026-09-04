import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotModal } from './components/ChatbotModal';

import { HomePage } from './pages/HomePage';
import { EligibilityCheckPage } from './pages/EligibilityCheckPage';
import { ResultsPage } from './pages/ResultsPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { HospitalDetailPage } from './pages/HospitalDetailPage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { ComparePage } from './pages/ComparePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MedicalReportPage } from './pages/medicalreportpage';
import { EligibilityResponse } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, continueAsGuest } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>({});
  const [evaluationResults, setEvaluationResults] = useState<EligibilityResponse | null>(null);
  const [evaluationFormData, setEvaluationFormData] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleNavigate = (tab: string, params: any = {}) => {
    setNavParams(params);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEvaluationComplete = (results: EligibilityResponse, formData: any) => {
    setEvaluationResults(results);
    setEvaluationFormData(formData);
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar currentTab={currentTab} setCurrentTab={(tab) => handleNavigate(tab)} openChat={() => setIsChatOpen(true)} />
      <main className="flex-1">
        {currentTab === 'home' && <HomePage onNavigate={handleNavigate} openChat={() => setIsChatOpen(true)} />}
        {currentTab === 'eligibility' && <EligibilityCheckPage initialPreset={navParams.presetData} onEvaluationComplete={handleEvaluationComplete} />}
        {currentTab === 'medical-report' && <MedicalReportPage />}
        {currentTab === 'results' && evaluationResults && <ResultsPage results={evaluationResults} userData={evaluationFormData} onViewDetails={(slug) => handleNavigate('scheme-detail', { slug })} onFindHospitals={(slug) => handleNavigate('hospitals', { scheme_slug: slug })} onRetake={() => handleNavigate('eligibility')} onNavigateToCompare={(ids) => handleNavigate('compare', { scheme_ids: ids })} />}
        {currentTab === 'hospitals' && <HospitalsPage initialSchemeSlug={navParams.scheme_slug} onViewHospital={(id) => handleNavigate('hospital-detail', { hospitalId: id })} onSelectScheme={(slug) => handleNavigate('scheme-detail', { slug })} />}
        {currentTab === 'hospital-detail' && navParams.hospitalId && <HospitalDetailPage hospitalId={navParams.hospitalId} onBack={() => handleNavigate('hospitals')} onViewScheme={(slug) => handleNavigate('scheme-detail', { slug })} />}
        {currentTab === 'schemes' && <SchemesPage onViewDetails={(slug) => handleNavigate('scheme-detail', { slug })} onFindHospitals={(slug) => handleNavigate('hospitals', { scheme_slug: slug })} onNavigateToCompare={(ids) => handleNavigate('compare', { scheme_ids: ids })} />}
        {currentTab === 'scheme-detail' && navParams.slug && <SchemeDetailPage slug={navParams.slug} onBack={() => handleNavigate('schemes')} onFindHospitals={(slug) => handleNavigate('hospitals', { scheme_slug: slug })} onCheckEligibility={() => handleNavigate('eligibility')} />}
        {currentTab === 'compare' && <ComparePage initialSchemeIds={navParams.scheme_ids || []} onViewDetails={(slug) => handleNavigate('scheme-detail', { slug })} onFindHospitals={(slug) => handleNavigate('hospitals', { scheme_slug: slug })} />}
        {currentTab === 'dashboard' && <DashboardPage onViewScheme={(slug) => handleNavigate('scheme-detail', { slug })} onFindHospitals={(slug) => handleNavigate('hospitals', { scheme_slug: slug })} onCheckEligibility={() => handleNavigate('eligibility')} />}
        {currentTab === 'admin' && <AdminPage />}
        {currentTab === 'login' && <LoginPage onSuccess={() => handleNavigate('dashboard')} onNavigateRegister={() => handleNavigate('register')} onContinueGuest={() => { continueAsGuest(); handleNavigate('home'); }} />}
        {currentTab === 'register' && <RegisterPage onSuccess={() => handleNavigate('dashboard')} onNavigateLogin={() => handleNavigate('login')} onContinueGuest={() => { continueAsGuest(); handleNavigate('home'); }} />}
      </main>
      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onViewScheme={(slug) => handleNavigate('scheme-detail', { slug })} onFindHospitals={(slug) => handleNavigate('hospitals', { scheme_slug: slug })} />
      <Footer />
    </div>
  );
};

export default function App() {
  return <AuthProvider><LocationProvider><MainApp /></LocationProvider></AuthProvider>;
}
