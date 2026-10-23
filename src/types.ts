export type Language = 'en' | 'ta';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  nameEn: string;
  nameTa: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  imageUrl?: string;
  lastUpdated?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number; // item level discount
}

export type PaymentMethod = 'cash' | 'card' | 'lanka_qr' | 'khata';

export interface SaleItem {
  productId: string;
  sku: string;
  nameEn: string;
  nameTa: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number; // e.g. 0, 2.5, 18
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  changeAmount?: number;
  cashier: string;
  branch: string;
}

export interface KhataTransaction {
  id: string;
  date: string;
  type: 'sale' | 'payment' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  invoiceNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  nic?: string;
  address: string;
  city: string;
  creditLimit: number;
  outstandingBalance: number;
  transactions: KhataTransaction[];
  createdDate: string;
}

export interface ShopSettings {
  shopName: string;
  branchNameEn: string;
  branchNameTa: string;
  addressEn: string;
  addressTa: string;
  phone: string;
  email: string;
  vatRegNo?: string;
  currency: string;
  currencySymbol: string;
  defaultTaxRate: number;
  receiptFooterEn: string;
  receiptFooterTa: string;
}
