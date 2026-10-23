import React from 'react';
import { Store, Camera, LogOut, Globe, Menu, MapPin } from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenScanner: () => void;
  onLogout: () => void;
  onToggleMobileNav: () => void;
  activeTab: string;
  settings: ShopSettings;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onOpenScanner,
  onLogout,
  onToggleMobileNav,
  settings,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo / Branch */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white leading-tight">
                    {settings.shopName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    <MapPin className="w-2.5 h-2.5" />
                    {lang === 'ta' ? settings.branchNameTa : settings.branchNameEn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {lang === 'ta' ? 'விற்பனை மையம் & சரக்கு இருப்பு' : 'POS Billing & Retail Inventory'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Camera scanner quick trigger, Language switch, Admin badge, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Barcode Scanner Button */}
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Camera Barcode Scanner"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t.scanBarcode}</span>
            </button>

            {/* Language Switcher */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:inline" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('ta')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  lang === 'ta'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Cashier Badge */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                N
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-semibold text-slate-200 block">Navas</span>
                <span className="text-[10px] text-emerald-400">Admin</span>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title={t.logout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
