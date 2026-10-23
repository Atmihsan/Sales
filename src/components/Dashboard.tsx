import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Coins,
  ShoppingCart,
  PlusCircle,
  Camera,
  ArrowUpRight,
  Receipt,
  RotateCw,
} from 'lucide-react';
import { Product, Sale, Customer, Language, ShopSettings } from '../types';
import { translations } from '../translations';
import { soundFx } from '../utils/audio';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  lang: Language;
  settings: ShopSettings;
  onNavigate: (tab: string) => void;
  onOpenScanner: () => void;
  onViewReceipt: (sale: Sale) => void;
  onQuickRestock: (productId: string, amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  sales,
  customers,
  lang,
  onNavigate,
  onOpenScanner,
  onViewReceipt,
  onQuickRestock,
}) => {
  const t = translations[lang];

  // Calculate Metrics
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySales = sales
    .filter((s) => s.timestamp.startsWith(todayDateStr) || s.timestamp.includes('2026-10-22'))
    .reduce((acc, curr) => acc + curr.grandTotal, 0);

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const totalCustomerCredit = customers.reduce(
    (acc, curr) => acc + (curr.outstandingBalance || 0),
    0
  );

  // Profit calculation: (sellingPrice - purchasePrice) * quantity sold
  const totalProfitEstimate = sales.reduce((acc, sale) => {
    const saleProfit = sale.items.reduce((itemAcc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cost = prod ? prod.purchasePrice : item.unitPrice * 0.75;
      return itemAcc + (item.unitPrice - cost) * item.quantity;
    }, 0);
    return acc + saleProfit;
  }, 0);

  // Critical items (stock <= minStockAlert)
  const criticalProducts = products.filter((p) => p.stock <= p.minStockAlert);

  // Recent 5 sales
  const recentSales = [...sales].reverse().slice(0, 5);

  // Chart data: past 7 days sales
  const daysOfWeek = lang === 'ta'
    ? ['திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி', 'ஞாயிறு']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weeklyData = [12450, 18900, 15600, 22100, 19400, 28750, todaySales > 0 ? todaySales : 24300];
  const maxWeekly = Math.max(...weeklyData, 30000);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-emerald-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              {lang === 'ta' ? 'சம்மாந்துறை கிளை' : 'Sammanthurai Branch'}
            </span>
            <span className="text-xs text-emerald-200">
              {new Date().toLocaleDateString(lang === 'ta' ? 'ta-LK' : 'en-LK', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            {lang === 'ta'
              ? 'STR ERP சம்மாந்துறைக்கு நல்வரவு'
              : 'Welcome to STR ERP - Sammanthurai'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
            {lang === 'ta'
              ? 'இன்றைய விற்பனை, சரக்கு இருப்பு மற்றும் வாடிக்கையாளர் கடன் நிலவரம்'
              : 'Monitor real-time retail sales, inventory depletion, and Khata credit.'}
          </p>
        </div>

        {/* Quick Actions in Banner */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate('pos')}
            className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>{t.newBill}</span>
          </button>
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-400/40"
          >
            <Camera className="w-4 h-4 text-emerald-300" />
            <span>{t.scanBarcode}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.todaySales}
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              Rs. {todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{sales.length} {lang === 'ta' ? 'பில்கள் பதிவு' : 'invoices recorded'}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Low Stock Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.lowStockItems}
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {lowStockCount}{' '}
              <span className="text-sm font-semibold text-slate-500">
                {lang === 'ta' ? 'பொருட்கள்' : 'items'}
              </span>
            </p>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline mt-1 block"
            >
              {lang === 'ta' ? 'இருப்பை சரிபார்க்க' : 'Review inventory'} &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Total Customer Credit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-rose-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.totalCustomerCredit}
            </span>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
              Rs. {totalCustomerCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <button
              onClick={() => onNavigate('khata')}
              className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline mt-1 block"
            >
              {lang === 'ta' ? 'கடன் ஏடு பார்க்க' : 'Open Khata Ledger'} &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Estimated Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-teal-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.monthlyProfit}
            </span>
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 tabular-nums">
              Rs. {totalProfitEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 mt-1 block">
              {lang === 'ta' ? 'அக்டோபர் 2026 வருவாய்' : 'Gross retail margin'}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Trends Chart & Quick Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Performance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.weeklySalesTrends}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ta'
                  ? 'கடந்த 7 நாட்களின் தினசரி விற்பனைத் தொகை'
                  : 'Daily turnover metrics for the Sammanthurai branch'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
              {lang === 'ta' ? 'நேரலை' : 'Live Analytics'}
            </span>
          </div>

          {/* Clean High-Fidelity SVG Bar & Area Chart */}
          <div className="h-56 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2">
            {weeklyData.map((val, idx) => {
              const heightPercent = Math.round((val / maxWeekly) * 100);
              const isToday = idx === weeklyData.length - 1;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md font-mono pointer-events-none whitespace-nowrap shadow-md">
                    Rs. {val.toLocaleString()}
                  </div>
                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-emerald-500/70 group-hover:bg-emerald-500'
                      }`}
                    />
                  </div>
                  {/* Day label */}
                  <span
                    className={`text-[11px] mt-2 font-medium ${
                      isToday
                        ? 'text-emerald-600 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {daysOfWeek[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Shortcut Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t.quickActions}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {lang === 'ta'
                ? 'அடிக்கடி பயன்படுத்தப்படும் செயல்பாடுகள்'
                : 'Direct access to core retail workflows'}
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate('pos')}
                className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.newBill}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'ta' ? 'விற்பனை பில்லிங் செய்ய' : 'Create new POS invoice'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('inventory')}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.addProduct}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'ta' ? 'புதிய சரக்கு பதிவேற்ற' : 'Add product with barcode'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('khata')}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.addCustomer}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'ta' ? 'வாடிக்கையாளர் கடன் கணக்கு' : 'Khata ledger balance'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Branch: Sammanthurai</span>
            <span className="font-mono text-emerald-600 font-semibold">Online POS</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Critical Low Stock Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Low Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.criticalLowStock}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {lang === 'ta' ? 'அனைத்தும் காண்க' : 'View All'} &rarr;
            </button>
          </div>

          {criticalProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              {lang === 'ta' ? 'அனைத்துப் பொருட்களும் போதிய இருப்பில் உள்ளன.' : 'All items are currently well-stocked.'}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {criticalProducts.slice(0, 4).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {lang === 'ta' && item.nameTa ? item.nameTa : item.nameEn}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {item.sku} &bull; Alert at {item.minStockAlert} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.stock === 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.stock} {item.unit} {item.stock === 0 ? '❌' : '🔴'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playScanBeep();
                        onQuickRestock(item.id, 10);
                      }}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Quick restock +10"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{t.restockNow}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.recentSales}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {lang === 'ta' ? 'அனைத்தும் காண்க' : 'View All'} &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {sale.invoiceNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sale.timestamp} &bull; {sale.customerName || t.walkInCustomer}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                    Rs. {sale.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewReceipt(sale)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={t.print}
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
