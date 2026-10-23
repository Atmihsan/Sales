import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Camera,
  CreditCard,
  Banknote,
  QrCode,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { Product, CartItem, Customer, Sale, PaymentMethod, Language, ShopSettings } from '../types';
import { translations } from '../translations';
import { soundFx } from '../utils/audio';

interface POSProps {
  products: Product[];
  customers: Customer[];
  onCompleteSale: (saleData: Omit<Sale, 'id'>) => void;
  lang: Language;
  settings: ShopSettings;
  onOpenScanner: () => void;
}

export const POS: React.FC<POSProps> = ({
  products,
  customers,
  onCompleteSale,
  lang,
  settings,
  onOpenScanner,
}) => {
  const t = translations[lang];

  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [billDiscountPercent, setBillDiscountPercent] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTaxRate);
  const [bannerAlert, setBannerAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // USB/Bluetooth Barcode Scanner Keystroke Buffer Detection
  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Typical barcode scanners emit keystrokes rapidly (less than 50-80ms per character)
      if (e.key === 'Enter') {
        const barcode = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';
        if (barcode.length >= 3) {
          handleBarcodeScanned(barcode);
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 120) {
          // If too slow, reset buffer (user manual typing)
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const showAlert = (msg: string, type: 'success' | 'error' = 'success') => {
    setBannerAlert({ msg, type });
    setTimeout(() => {
      setBannerAlert(null);
    }, 3500);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === barcode.toLowerCase() ||
        p.sku.toLowerCase() === barcode.toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      soundFx.playScanBeep();
      showAlert(`${t.scannedSuccess} (${matched.nameEn})`, 'success');
    } else {
      soundFx.playErrorBeep();
      showAlert(`${t.itemNotFound} "${barcode}"`, 'error');
    }
  };

  // Add item to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      soundFx.playErrorBeep();
      showAlert(`${product.nameEn}: ${t.outOfStock}`, 'error');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          soundFx.playErrorBeep();
          showAlert(t.stockLimitReached, 'error');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { product, quantity: 1, discountPercent: 0 }];
      }
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > prod.stock) {
      soundFx.playErrorBeep();
      showAlert(t.stockLimitReached, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.sellingPrice * item.quantity;
    const itemDiscount = (itemTotal * item.discountPercent) / 100;
    return sum + (itemTotal - itemDiscount);
  }, 0);

  const billDiscountAmount = (subtotal * billDiscountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - billDiscountAmount);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = Math.round(taxableAmount + taxAmount);

  const tenderedVal = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedVal - grandTotal);

  // Selected customer details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameTa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'khata' && !selectedCustomerId) {
      soundFx.playErrorBeep();
      showAlert(
        lang === 'ta'
          ? 'கடன் பற்றுக்கு வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும்!'
          : 'Please select a customer for Khata credit payment!',
        'error'
      );
      return;
    }

    // Check Khata credit limit
    if (paymentMethod === 'khata' && selectedCustomer) {
      const remainingLimit = selectedCustomer.creditLimit - selectedCustomer.outstandingBalance;
      if (grandTotal > remainingLimit) {
        soundFx.playErrorBeep();
        showAlert(
          lang === 'ta'
            ? `கடன் வரம்பு தாண்டியது! மீதமுள்ள வரம்பு: ரூ. ${remainingLimit}`
            : `Credit limit exceeded! Remaining limit: Rs. ${remainingLimit}`,
          'error'
        );
        return;
      }
    }

    if (paymentMethod === 'cash' && tenderedVal > 0 && tenderedVal < grandTotal) {
      soundFx.playErrorBeep();
      showAlert(
        lang === 'ta'
          ? 'பெற்ற பணம் மொத்த தொகையை விட குறைவாக உள்ளது!'
          : 'Tendered cash is less than grand total!',
        'error'
      );
      return;
    }

    // Generate Invoice
    const invoiceNum = `INV-STR-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      sku: item.product.sku,
      nameEn: item.product.nameEn,
      nameTa: item.product.nameTa,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
      discountPercent: item.discountPercent,
      total: item.product.sellingPrice * item.quantity * (1 - item.discountPercent / 100),
    }));

    onCompleteSale({
      invoiceNumber: invoiceNum,
      timestamp,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      items: saleItems,
      subtotal,
      discountAmount: billDiscountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      paymentMethod,
      amountTendered: paymentMethod === 'cash' ? (tenderedVal || grandTotal) : undefined,
      changeAmount: paymentMethod === 'cash' ? (tenderedVal > grandTotal ? changeDue : 0) : undefined,
      cashier: 'Admin (Navas)',
      branch: 'Sammanthurai',
    });

    clearCart();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-6.5rem)]">
      {/* Alert Banner */}
      {bannerAlert && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all animate-bounce ${
            bannerAlert.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {bannerAlert.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span>{bannerAlert.msg}</span>
        </div>
      )}

      {/* LEFT: Product Catalog & Search (60%) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Top Controls: Search & Category Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-emerald-600 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              title="Camera Scan Barcode"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t.scanCameraBtn}</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat === 'All' ? t.all : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const isOut = p.stock <= 0;
              const isLow = p.stock <= p.minStockAlert;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={isOut}
                  onClick={() => {
                    addToCart(p);
                    soundFx.playScanBeep();
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative group ${
                    isOut
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      : 'bg-white hover:bg-emerald-50/50 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {p.sku}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isOut
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {lang === 'ta' && p.nameTa ? p.nameTa : p.nameEn}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      Rs. {p.sellingPrice.toFixed(2)}
                    </span>
                    <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">{t.itemNotFound} "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer Hint for USB Scanner */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>{t.barcodeHint}</span>
          <span className="font-mono text-emerald-600 font-semibold">Sammanthurai POS</span>
        </div>
      </div>

      {/* RIGHT: Current Bill & Cart (40%) */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden shrink-0">
        {/* Bill Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.cart}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-mono">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              {t.clearCart}
            </button>
          )}
        </div>

        {/* Customer Selector */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t.selectCustomer}
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
          >
            <option value="">{t.walkInCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) - Due: Rs. {c.outstandingBalance}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {t.cartEmpty}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{t.cartEmptyDesc}</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.sellingPrice * item.quantity;
              return (
                <div
                  key={item.product.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {lang === 'ta' && item.product.nameTa ? item.product.nameTa : item.product.nameEn}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Rs. {item.product.sellingPrice.toFixed(2)} / {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-200 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-200 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      Rs. {itemTotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bill Calculations & Payment Options */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Discount & Tax Row */}
            <div className="flex gap-2 text-xs">
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                <Percent className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <span className="text-[11px] text-slate-500 mr-1">{t.discount}:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={billDiscountPercent || ''}
                  onChange={(e) => setBillDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  placeholder="0%"
                  className="w-12 text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">%</span>
              </div>

              {/* Tax selector */}
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                <span className="text-[11px] text-slate-500 mr-1">{t.tax}:</span>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-hidden w-full"
                >
                  <option value="0">0%</option>
                  <option value="2.5">2.5% SSCL</option>
                  <option value="18">18% VAT</option>
                </select>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2 font-mono">
              <div className="flex justify-between">
                <span>{t.subtotal}:</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              {billDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{t.discount} ({billDiscountPercent}%):</span>
                  <span>-Rs. {billDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>{t.tax} ({taxRate}%):</span>
                  <span>Rs. {taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>{t.grandTotal}:</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t.paymentMethod}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>{t.cash}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.card}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('lanka_qr')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                    paymentMethod === 'lanka_qr'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t.lankaQr}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khata')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
                    paymentMethod === 'khata'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.khataCredit}</span>
                </button>
              </div>
            </div>

            {/* Cash Calculator (if cash selected) */}
            {paymentMethod === 'cash' && (
              <div className="space-y-1.5 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    {t.cashTendered}:
                  </span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={grandTotal.toString()}
                      className="w-28 pl-8 pr-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-md focus:outline-emerald-600"
                    />
                  </div>
                </div>
                {tenderedVal > grandTotal && (
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    <span>{t.changeDue}:</span>
                    <span className="text-sm font-mono font-black">
                      Rs. {changeDue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.checkoutBtn}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
