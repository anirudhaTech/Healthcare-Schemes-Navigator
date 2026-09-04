import React, { useState } from 'react';
import { HeartPulse, MapPin, Sparkles, User as UserIcon, LogOut, Menu, X, Compass, FileCheck, Scale, LayoutDashboard, Building2, FileSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

interface NavbarProps { currentTab: string; setCurrentTab: (tab: string) => void; openChat: () => void; }

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openChat }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedDistrict, selectedTaluka } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', label: 'Home', icon: HeartPulse },
    { id: 'eligibility', label: 'Check Eligibility', icon: FileCheck, highlight: true },
    { id: 'medical-report', label: 'AI Report', icon: FileSearch, highlight: true },
    { id: 'hospitals', label: 'Find Hospitals', icon: Building2, highlight: true },
    { id: 'schemes', label: 'Explore Schemes', icon: Compass },
    { id: 'compare', label: 'Compare', icon: Scale },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white text-xs py-1.5 px-4"><div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2"><span className="font-medium tracking-wide">National Public Healthcare Schemes & Empanelled Hospital Portal</span><span className="text-emerald-100 text-[11px]">National Helpline: <strong>14555</strong> / <strong>104</strong> · Emergency: <strong>108</strong></span></div></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentTab('home')}><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white"><HeartPulse className="w-6 h-6" /></div><div><div className="flex items-center gap-1.5"><span className="font-extrabold text-lg sm:text-xl tracking-tight">Arogya<span className="text-emerald-600">Nav</span></span><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">INDIA</span></div><p className="text-[11px] text-slate-500 hidden sm:block">Healthcare Schemes & Hospital Navigator</p></div></div>
        <nav className="hidden lg:flex items-center gap-1">{navItems.map((item) => { const Icon=item.icon; return <button key={item.id} onClick={()=>setCurrentTab(item.id)} className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium ${currentTab===item.id?'bg-emerald-50 text-emerald-700': 'text-slate-600 hover:bg-slate-50'}`}><Icon className="w-4 h-4" />{item.label}</button>; })}</nav>
        <div className="hidden sm:flex items-center gap-2"><button onClick={openChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"><Sparkles className="w-3.5 h-3.5" />AI Assistant</button>{selectedDistrict&&<button onClick={()=>setCurrentTab('hospitals')} className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs"><MapPin className="w-3.5 h-3.5 text-emerald-600" />{selectedTaluka||selectedDistrict}</button>}{isAuthenticated?<div className="flex items-center gap-2"><button onClick={()=>setCurrentTab('dashboard')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100"><UserIcon className="w-3.5 h-3.5" />{user?.full_name?.split(' ')[0]||'Dashboard'}</button>{isAdmin&&<button onClick={()=>setCurrentTab('admin')} className="px-2.5 py-2 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">Admin</button>}<button onClick={logout} className="p-2 text-slate-400 hover:text-red-600"><LogOut className="w-4 h-4" /></button></div>:<><button onClick={()=>setCurrentTab('login')} className="px-3 py-2 text-xs font-semibold">Sign In</button><button onClick={()=>setCurrentTab('eligibility')} className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg">Check Eligibility</button></>}</div>
        <div className="flex sm:hidden items-center gap-2"><button onClick={openChat} className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Sparkles className="w-5 h-5" /></button><button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-slate-600">{mobileMenuOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button></div>
      </div></div>
      {mobileMenuOpen&&<div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">{navItems.map((item)=>{const Icon=item.icon;return <button key={item.id} onClick={()=>{setCurrentTab(item.id);setMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${currentTab===item.id?'bg-emerald-50 text-emerald-700':'text-slate-700'}`}><Icon className="w-5 h-5"/>{item.label}</button>})}<button onClick={()=>{setCurrentTab('dashboard');setMobileMenuOpen(false)}} className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold"><LayoutDashboard className="w-4 h-4 inline mr-2"/>My Dashboard</button></div>}
    </header>
  );
};
