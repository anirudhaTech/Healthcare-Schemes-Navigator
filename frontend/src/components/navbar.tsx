import React, { useState } from 'react';
import {
  ShieldAlert,
  HeartPulse,
  MapPin,
  Sparkles,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
  FileCheck,
  Scale,
  LayoutDashboard,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openChat }) => {
  const { user, isAuthenticated, isGuest, isAdmin, logout } = useAuth();
  const { selectedState, selectedDistrict, selectedTaluka } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: HeartPulse },
    { id: 'eligibility', label: 'Check Eligibility', icon: FileCheck, highlight: true },
    { id: 'hospitals', label: 'Find Hospitals', icon: Building2, highlight: true },
    { id: 'schemes', label: 'Explore Schemes', icon: Compass },
    { id: 'compare', label: 'Compare', icon: Scale },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top public service banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium tracking-wide">National Public Healthcare Schemes & Empanelled Hospital Portal</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100 text-[11px]">
            <span>National Helpline: <strong>14555</strong> / <strong>104</strong></span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Emergency: <strong>108</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Emblem */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  Arogya<span className="text-emerald-600">Nav</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  India
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Healthcare Schemes & Hospital Navigator
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-slate-800 hover:text-emerald-700 hover:bg-slate-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={openChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/80 text-xs font-semibold shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>AI Scheme Assistant</span>
            </button>

            {/* Location Indicator Pill */}
            {selectedDistrict && (
              <button
                onClick={() => setCurrentTab('hospitals')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                title="Your active location filter"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[120px]">
                  {selectedTaluka || selectedDistrict}
                </span>
              </button>
            )}

            {/* Auth State Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{user?.full_name?.split(' ')[0] || 'Dashboard'}</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                      currentTab === 'admin'
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }`}
                  >
                    Admin
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('eligibility')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
                >
                  Check Eligibility
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={openChat}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-700"
              title="AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-slate-500" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentTab('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-lg bg-purple-700 text-white text-sm font-bold"
                  >
                    Admin Portal
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-semibold text-red-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setCurrentTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm font-semibold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold text-center"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
