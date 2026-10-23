import React, { useState } from 'react';
import {
  Plus,
  Search,
  Camera,
  Edit,
  Trash2,
  AlertTriangle,
  Sparkles,
  Barcode,
  X,
  Check,
  RotateCw,
} from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../translations';
import { soundFx } from '../utils/audio';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickStockChange: (productId: string, delta: number) => void;
  lang: Language;
  onOpenScannerForInventory: (callback: (scannedCode: string) => void) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onQuickStockChange,
  lang,
  onOpenScannerForInventory,
}) => {
  const t = translations[lang];

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    nameEn: '',
    nameTa: '',
    category: 'Grocery',
    purchasePrice: '',
    sellingPrice: '',
    stock: '',
    minStockAlert: '10',
    unit: 'pkt',
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameTa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = (initialBarcode = '') => {
    setEditingProduct(null);
    setFormData({
      sku: `STR-${Date.now().toString().slice(-4)}`,
      barcode: initialBarcode || `479${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      nameEn: '',
      nameTa: '',
      category: 'Grocery',
      purchasePrice: '',
      sellingPrice: '',
      stock: '20',
      minStockAlert: '8',
      unit: 'pkt',
    });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      barcode: product.barcode,
      nameEn: product.nameEn,
      nameTa: product.nameTa,
      category: product.category,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stock: product.stock.toString(),
      minStockAlert: product.minStockAlert.toString(),
      unit: product.unit,
    });
    setModalOpen(true);
  };

  // Header "Scan Item with Camera"
  const handleScanHeaderCamera = () => {
    onOpenScannerForInventory((scannedCode) => {
      const existing = products.find(
        (p) =>
          p.barcode.toLowerCase() === scannedCode.toLowerCase() ||
          p.sku.toLowerCase() === scannedCode.toLowerCase()
      );
      if (existing) {
        openEditModal(existing);
      } else {
        openAddModal(scannedCode);
      }
    });
  };

  // Modal camera scanner for barcode field
  const handleScanInModal = () => {
    onOpenScannerForInventory((scannedCode) => {
      setFormData((prev) => ({ ...prev, barcode: scannedCode }));
    });
  };

  const handleGenerateBarcode = () => {
    // Generate Sri Lanka GS1 479 standard 13-digit barcode
    const random10 = Math.floor(1000000000 + Math.random() * 9000000000);
    setFormData((prev) => ({ ...prev, barcode: `479${random10}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    const stockQty = parseInt(formData.stock) || 0;
    const minAlert = parseInt(formData.minStockAlert) || 5;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        nameEn: formData.nameEn.trim(),
        nameTa: formData.nameTa.trim(),
        category: formData.category.trim(),
        purchasePrice: purchase,
        sellingPrice: selling,
        stock: stockQty,
        minStockAlert: minAlert,
        unit: formData.unit.trim(),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      onAddProduct({
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        nameEn: formData.nameEn.trim(),
        nameTa: formData.nameTa.trim(),
        category: formData.category.trim(),
        purchasePrice: purchase,
        sellingPrice: selling,
        stock: stockQty,
        minStockAlert: minAlert,
        unit: formData.unit.trim(),
        lastUpdated: new Date().toISOString(),
      });
    }

    soundFx.playSuccessChime();
    setModalOpen(false);
  };

  // Confirmation before delete
  const handleDeleteConfirm = () => {
    if (!productToDelete) return;
    onDeleteProduct(productToDelete.id);
    soundFx.playScanBeep();
    setProductToDelete(null);
    if (editingProduct && editingProduct.id === productToDelete.id) {
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {t.inventoryManagement}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.inventorySubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Header Barcode Camera Scan */}
          <button
            type="button"
            onClick={handleScanHeaderCamera}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>{t.scanItemCamera}</span>
          </button>

          {/* Add New Product Button */}
          <button
            type="button"
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewProduct}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-emerald-600 font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? t.all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5">Barcode / EAN</th>
                <th className="px-4 py-3.5">{t.category}</th>
                <th className="px-4 py-3.5 text-right">{t.purchaseCost}</th>
                <th className="px-4 py-3.5 text-right">{t.sellingPrice}</th>
                <th className="px-4 py-3.5 text-center">{t.currentStock}</th>
                <th className="px-4 py-3.5 text-center">{t.status}</th>
                <th className="px-4 py-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {filteredProducts.map((p) => {
                const isOut = p.stock <= 0;
                const isLow = p.stock <= p.minStockAlert;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name & SKU */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {p.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-500">{p.nameTa}</p>
                        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
                          {p.sku}
                        </span>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      Rs. {p.purchasePrice.toFixed(2)}
                    </td>

                    {/* Selling */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      Rs. {p.sellingPrice.toFixed(2)}
                    </td>

                    {/* Current Stock with Quick Adjust (+ / - / +10) */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            if (p.stock > 0) onQuickStockChange(p.id, -1);
                          }}
                          className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-700 rounded-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          title="-1 stock"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold font-mono text-slate-900 dark:text-white">
                          {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickStockChange(p.id, 1)}
                          className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-700 rounded-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          title="+1 stock"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuickStockChange(p.id, 10)}
                          className="px-1.5 h-5 flex items-center justify-center bg-emerald-600 text-white rounded-sm text-[9px] font-bold hover:bg-emerald-500"
                          title="+10 restock"
                        >
                          +10
                        </button>
                      </div>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {p.unit}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isOut ? `❌ ${t.outOfStock}` : isLow ? `🔴 ${t.lowStock}` : `✓ ${t.inStock}`}
                      </span>
                    </td>

                    {/* Actions: Edit & Working Delete */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title={t.edit}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Remove / Delete icon working with confirmation */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title={t.deleteProduct}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.deleteProduct}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.deleteProductConfirm}
              </p>
              <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200">
                {productToDelete.nameEn}
                <span className="block text-[10px] text-slate-500 font-mono">
                  SKU: {productToDelete.sku} &bull; Barcode: {productToDelete.barcode}
                </span>
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2">
                {t.deleteProductWarning}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">
                  {editingProduct ? t.editProduct : t.addNewProduct}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-800 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Product Names: English & Tamil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.productName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Dilmah Tea 400g"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.productNameTa} (தமிழ்)
                  </label>
                  <input
                    type="text"
                    value={formData.nameTa}
                    onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                    placeholder="உதா: தில்மா தேயிலை 400g"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Barcode & SKU with Camera Scanner and Auto-generate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {t.barcode} *
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleScanInModal}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md"
                        title="Scan with Camera"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateBarcode}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded-md"
                        title="Generate GS1 Barcode"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Gen</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="4791001001015"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.sku} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="TEA-DIL-400"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.category}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Grocery, Dairy, Biscuits, etc."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.unit}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
                  >
                    <option value="pkt">Packet (pkt)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="btl">Bottle (btl)</option>
                    <option value="box">Box</option>
                    <option value="tin">Tin</option>
                  </select>
                </div>
              </div>

              {/* Pricing: Purchase & Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.purchaseCost}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="920.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.sellingPrice}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="1150.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Stock and Low Stock Alert Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.currentStock}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="35"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.minStockAlert}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder="8"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProductToDelete(editingProduct);
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteProduct}</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.save}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
