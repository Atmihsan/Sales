import React, { useState } from 'react';
import { Receipt, Search, Calendar, FileText, Printer } from 'lucide-react';
import { Sale, Language, ShopSettings } from '../types';
import { translations } from '../translations';

interface SalesHistoryProps {
  sales: Sale[];
  onViewReceipt: (sale: Sale) => void;
  lang: Language;
  settings: ShopSettings;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  sales,
  onViewReceipt,
  lang,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const filteredSales = [...sales].reverse().filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMethod = selectedMethod === 'all' || s.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t.salesHistory}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {filteredSales.length} Invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'ta'
              ? 'சம்மாந்துறை கிளையின் அனைத்து விற்பனை பில்கள் மற்றும் ரசீது பதிவுகள்'
              : 'Audit and reprint POS tax invoices for Sammanthurai branch.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">
            {lang === 'ta' ? 'மொத்த வருமானம்' : 'Filtered Revenue'}
          </span>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            Rs. {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ta' ? 'பில் இலக்கம் அல்லது வாடிக்கையாளர்...' : 'Search by invoice # or customer...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-emerald-600 font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* Method Filter */}
        <div className="flex gap-1.5 w-full sm:w-auto">
          {['all', 'cash', 'card', 'lanka_qr', 'khata'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setSelectedMethod(method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                selectedMethod === method
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {method === 'all' ? t.all : method.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5">{t.billNumber}</th>
                <th className="px-4 py-3.5">{t.date}</th>
                <th className="px-4 py-3.5">{t.customerName}</th>
                <th className="px-4 py-3.5 text-center">{t.paymentMethod}</th>
                <th className="px-4 py-3.5 text-center">{t.item}s</th>
                <th className="px-4 py-3.5 text-right">{t.grandTotal}</th>
                <th className="px-4 py-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {sale.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sale.customerName || t.walkInCustomer}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {sale.items.reduce((a, b) => a + b.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Rs. {sale.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(sale)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto border border-slate-200 dark:border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.print}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
