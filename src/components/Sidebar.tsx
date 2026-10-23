import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  BookOpen,
  Receipt,
  Settings as SettingsIcon,
  X,
  MapPin,
} from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  settings: ShopSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  lang,
  mobileOpen,
  onCloseMobile,
  settings,
}) => {
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'pos', label: t.pos, icon: ShoppingCart },
    { id: 'inventory', label: t.inventory, icon: Boxes },
    { id: 'khata', label: t.khata, icon: BookOpen },
    { id: 'sales', label: t.salesHistory, icon: Receipt },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in drawer */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">{settings.shopName}</span>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">
              {lang === 'ta' ? 'சம்மாந்துறை' : 'Sammanthurai'}
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sammanthurai Branch Location Footer info */}
        <div className="p-4 border-t border-slate-800 text-slate-400 text-xs">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <MapPin className="w-3.5 h-3.5" />
              <span>{settings.shopName}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight">
              {lang === 'ta' ? settings.branchNameTa : settings.branchNameEn}
            </p>
            <p className="text-[10px] text-slate-400">
              {lang === 'ta' ? 'பிரதான வீதி, சம்மாந்துறை' : 'Main Street, Sammanthurai'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
