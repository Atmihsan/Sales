import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  MapPin,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Save,
} from 'lucide-react';
import { ShopSettings, Language } from '../types';
import { translations } from '../translations';
import { soundFx } from '../utils/audio';

interface SettingsProps {
  settings: ShopSettings;
  onUpdateSettings: (newSettings: ShopSettings) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  lang: Language;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
  lang,
}) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    soundFx.playSuccessChime();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600" />
            <span>{t.systemSettings}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'ta'
              ? 'STR ERP சம்மாந்துறை கிளை தகவல், ரசீது மற்றும் தரவு காப்புப்பிரதி'
              : 'Configure STR ERP store metadata, tax policies, and JSON backups for Sammanthurai.'}
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-4 h-4" />
            <span>{t.save} ✓</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>{t.shopDetails}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Store / ERP Name
            </label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Branch Name (English)
            </label>
            <input
              type="text"
              required
              value={formData.branchNameEn}
              onChange={(e) => setFormData({ ...formData, branchNameEn: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Branch Name (Tamil)
            </label>
            <input
              type="text"
              required
              value={formData.branchNameTa}
              onChange={(e) => setFormData({ ...formData, branchNameTa: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Phone Number
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Address (English)
            </label>
            <input
              type="text"
              required
              value={formData.addressEn}
              onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Address (Tamil)
            </label>
            <input
              type="text"
              required
              value={formData.addressTa}
              onChange={(e) => setFormData({ ...formData, addressTa: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Sri Lanka VAT Reg No
            </label>
            <input
              type="text"
              value={formData.vatRegNo || ''}
              onChange={(e) => setFormData({ ...formData, vatRegNo: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              {t.taxRatePercent}
            </label>
            <select
              value={formData.defaultTaxRate}
              onChange={(e) =>
                setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
            >
              <option value="0">0% (Standard Non-VAT Retail)</option>
              <option value="2.5">2.5% (Social Security Contribution Levy - SSCL)</option>
              <option value="18">18% (Value Added Tax - VAT)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </form>

      {/* Backup and Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'ta' ? 'தரவு மேலாண்மை & காப்புப்பிரதி' : 'Data Management & JSON Backup'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export */}
          <button
            type="button"
            onClick={onExportData}
            className="p-4 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-left transition-colors flex flex-col justify-between"
          >
            <Download className="w-5 h-5 text-emerald-600 mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.backupData}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Download complete store JSON file</p>
            </div>
          </button>

          {/* Import */}
          <label className="p-4 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-left transition-colors flex flex-col justify-between cursor-pointer">
            <Upload className="w-5 h-5 text-teal-600 mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.restoreData}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Restore from previously saved JSON</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>

          {/* Reset Demo */}
          <button
            type="button"
            onClick={onResetData}
            className="p-4 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500 rounded-xl text-left transition-colors flex flex-col justify-between"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 mb-2" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t.resetDemoData}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'ta'
                  ? 'சம்மாந்துறை கிளையின் ஆரம்பப் பொருட்கள் & வாடிக்கையாளர் கணக்குகளை மீட்டெடுக்கும்'
                  : 'Restore standard Sammanthurai products and Khata accounts'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
