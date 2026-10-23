import React, { useState, useEffect, useCallback } from 'react';
import { Language, Product, Customer, Sale, ShopSettings } from './types';
import { storage } from './utils/storage';
import { soundFx } from './utils/audio';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Khata } from './components/Khata';
import { SalesHistory } from './components/SalesHistory';
import { Settings } from './components/Settings';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storage.isLoggedIn());

  // Language
  const [lang, setLang] = useState<Language>(() => storage.getLanguage());

  // Core Data
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [sales, setSales] = useState<Sale[]>(() => storage.getSales());
  const [settings, setSettings] = useState<ShopSettings>(() => storage.getSettings());

  // UI Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Modals
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [scannerCallback, setScannerCallback] = useState<((code: string) => void) | null>(null);
  const [scannerTitle, setScannerTitle] = useState<string | undefined>(undefined);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  // Save to localStorage when state changes
  useEffect(() => {
    storage.saveProducts(products);
  }, [products]);

  useEffect(() => {
    storage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    storage.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // Language handler
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    storage.setLanguage(newLang);
  };

  // Auth handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    storage.setLoggedIn(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    storage.setLoggedIn(false);
  };

  // Scanner modal opener with optional custom callback
  const openScanner = (customCallback?: (code: string) => void, title?: string) => {
    if (customCallback) {
      setScannerCallback(() => customCallback);
    } else {
      setScannerCallback(null);
    }
    setScannerTitle(title);
    setScannerOpen(true);
  };

  const handleScanCodeResult = (barcode: string) => {
    if (scannerCallback) {
      scannerCallback(barcode);
    } else {
      // Default global behavior: if in POS, handled by POS; if outside, check product and show alert
      const found = products.find(
        (p) =>
          p.barcode.toLowerCase() === barcode.toLowerCase() ||
          p.sku.toLowerCase() === barcode.toLowerCase()
      );
      if (found) {
        soundFx.playScanBeep();
        setActiveTab('pos');
      } else {
        soundFx.playErrorBeep();
        alert(
          lang === 'ta'
            ? `பொருள் கிடைக்கவில்லை: ${barcode}. சரக்கு இருப்பில் சேர்க்கவும்.`
            : `Product not found: ${barcode}. You can add it in Inventory.`
        );
      }
    }
  };

  // Inventory handlers
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const productWithId: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [productWithId, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleQuickStockChange = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock, lastUpdated: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // Khata Handlers
  const handleAddCustomer = (
    newCust: Omit<Customer, 'id' | 'transactions' | 'createdDate'>
  ) => {
    const cust: Customer = {
      ...newCust,
      id: `cust-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      transactions: [],
    };
    setCustomers((prev) => [cust, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleRemoveCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const handleRecordKhataPayment = (customerId: string, amount: number, note: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBalance = Math.max(0, c.outstandingBalance - amount);
          const now = new Date();
          const dateStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`;
          const newTx = {
            id: `tx-${Date.now()}`,
            date: dateStr,
            type: 'payment' as const,
            amount,
            balanceAfter: newBalance,
            description: note || 'Settlement Payment',
          };
          return {
            ...c,
            outstandingBalance: newBalance,
            transactions: [newTx, ...c.transactions],
          };
        }
        return c;
      })
    );
  };

  const handleAddKhataCredit = (customerId: string, amount: number, note: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBalance = c.outstandingBalance + amount;
          const now = new Date();
          const dateStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`;
          const newTx = {
            id: `tx-${Date.now()}`,
            date: dateStr,
            type: 'sale' as const,
            amount,
            balanceAfter: newBalance,
            description: note || 'Credit Adjustment',
          };
          return {
            ...c,
            outstandingBalance: newBalance,
            transactions: [newTx, ...c.transactions],
          };
        }
        return c;
      })
    );
  };

  // Complete POS Sale
  const handleCompleteSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
    };

    // 1. Add to sales history
    setSales((prev) => [newSale, ...prev]);

    // 2. Reduce inventory stock
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = newSale.items.find((item) => item.productId === p.id);
        if (soldItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - soldItem.quantity),
            lastUpdated: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // 3. If Khata credit payment, record into customer ledger
    if (newSale.paymentMethod === 'khata' && newSale.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            const newBal = c.outstandingBalance + newSale.grandTotal;
            const newTx = {
              id: `tx-${Date.now()}`,
              date: newSale.timestamp,
              type: 'sale' as const,
              amount: newSale.grandTotal,
              balanceAfter: newBal,
              description: `POS Bill #${newSale.invoiceNumber}`,
              invoiceNumber: newSale.invoiceNumber,
            };
            return {
              ...c,
              outstandingBalance: newBal,
              transactions: [newTx, ...c.transactions],
            };
          }
          return c;
        })
      );
    }

    // 4. Play transaction success sound
    soundFx.playSuccessChime();

    // 5. Open receipt modal
    setActiveReceiptSale(newSale);
  };

  // Backup & Restore
  const handleExportData = () => {
    const backupData = {
      version: '1.0',
      branch: 'Sammanthurai',
      exportDate: new Date().toISOString(),
      settings,
      products,
      customers,
      sales,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STR_ERP_Sammanthurai_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.settings) setSettings(parsed.settings);
        soundFx.playSuccessChime();
        alert(
          lang === 'ta'
            ? 'தரவு வெற்றிகரமாக மீட்டெடுக்கப்பட்டது!'
            : 'Store data imported and restored successfully!'
        );
      } catch (err) {
        soundFx.playErrorBeep();
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      lang === 'ta'
        ? 'அனைத்து சரக்கு, பில் மற்றும் வாடிக்கையாளர் தரவையும் கிளை இயல்புநிலைக்கு மீட்டமைக்க விரும்புகிறீர்களா?'
        : 'Are you sure you want to reset all data to default Sammanthurai branch records?'
    );
    if (confirmReset) {
      storage.resetAll();
      setProducts(storage.getProducts());
      setCustomers(storage.getCustomers());
      setSales(storage.getSales());
      setSettings(storage.getSettings());
      soundFx.playSuccessChime();
    }
  };

  // If not authenticated, render Login
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenScanner={() => openScanner()}
        onLogout={handleLogout}
        onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
        activeTab={activeTab}
        settings={settings}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lang={lang}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          settings={settings}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              products={products}
              sales={sales}
              customers={customers}
              lang={lang}
              settings={settings}
              onNavigate={setActiveTab}
              onOpenScanner={() => openScanner()}
              onViewReceipt={(sale) => setActiveReceiptSale(sale)}
              onQuickRestock={(productId, amount) => handleQuickStockChange(productId, amount)}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              products={products}
              customers={customers}
              onCompleteSale={handleCompleteSale}
              lang={lang}
              settings={settings}
              onOpenScanner={() => openScanner()}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickStockChange={handleQuickStockChange}
              lang={lang}
              onOpenScannerForInventory={(callback) =>
                openScanner(callback, lang === 'ta' ? 'சரக்கு பார்கோடு ஸ்கேனர்' : 'Inventory Barcode Scanner')
              }
            />
          )}

          {activeTab === 'khata' && (
            <Khata
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onRemoveCustomer={handleRemoveCustomer}
              onRecordPayment={handleRecordKhataPayment}
              onAddCredit={handleAddKhataCredit}
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'sales' && (
            <SalesHistory
              sales={sales}
              onViewReceipt={(sale) => setActiveReceiptSale(sale)}
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={settings}
              onUpdateSettings={setSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Global Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          setScannerCallback(null);
        }}
        onScan={handleScanCodeResult}
        lang={lang}
        title={scannerTitle}
      />

      {/* Receipt Modal (Print & WhatsApp) */}
      <ReceiptModal
        isOpen={activeReceiptSale !== null}
        onClose={() => setActiveReceiptSale(null)}
        sale={activeReceiptSale}
        lang={lang}
        settings={settings}
      />
    </div>
  );
}
