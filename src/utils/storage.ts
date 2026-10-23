import { Product, Customer, Sale, ShopSettings } from '../types';

const STORAGE_KEYS = {
  AUTH: 'str_erp_auth_v1',
  LANG: 'str_erp_lang_v1',
  PRODUCTS: 'str_erp_products_v1',
  CUSTOMERS: 'str_erp_customers_v1',
  SALES: 'str_erp_sales_v1',
  SETTINGS: 'str_erp_settings_v1',
};

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'STR ERP',
  branchNameEn: 'Sammanthurai Branch',
  branchNameTa: 'சம்மாந்துறை கிளை',
  addressEn: 'Main Street, Sammanthurai, Eastern Province, Sri Lanka',
  addressTa: 'பிரதான வீதி, சம்மாந்துறை, கிழக்கு மாகாணம், இலங்கை',
  phone: '+94 67 222 3456',
  email: 'str.sammanthurai@gmail.com',
  vatRegNo: 'VAT-479001928-7000',
  currency: 'LKR',
  currencySymbol: 'Rs.',
  defaultTaxRate: 0, // 0%, 2.5% SSCL, 18% VAT selectable
  receiptFooterEn: 'Goods once sold can be exchanged within 3 days with receipt.',
  receiptFooterTa: 'விற்பனை செய்த பொருட்களை ரசீதுடன் 3 நாட்களுக்குள் மாற்றிக்கொள்ளலாம்.',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'TEA-DIL-400',
    barcode: '4791001001015',
    nameEn: 'Dilmah Premium Ceylon Tea 400g',
    nameTa: 'தில்மா சிலோன் தேயிலை 400g',
    category: 'Beverages',
    purchasePrice: 920,
    sellingPrice: 1150,
    stock: 35,
    minStockAlert: 8,
    unit: 'pkt',
  },
  {
    id: 'prod-2',
    sku: 'MLK-ANC-400',
    barcode: '4792014002028',
    nameEn: 'Anchor Full Cream Milk Powder 400g',
    nameTa: 'ஆங்கர் பால் மாவு 400g',
    category: 'Dairy',
    purchasePrice: 1040,
    sellingPrice: 1240,
    stock: 24,
    minStockAlert: 10,
    unit: 'pkt',
  },
  {
    id: 'prod-3',
    sku: 'BIS-MUN-500',
    barcode: '4793012003031',
    nameEn: 'Munchee Super Cream Cracker 500g',
    nameTa: 'மன்சி சுப்பர் கிரீம் கிராக்கர் 500g',
    category: 'Biscuits',
    purchasePrice: 380,
    sellingPrice: 470,
    stock: 50,
    minStockAlert: 15,
    unit: 'pkt',
  },
  {
    id: 'prod-4',
    sku: 'SOP-SUN-120',
    barcode: '4794015004044',
    nameEn: 'Sunlight Care Lemon Washing Soap 120g',
    nameTa: 'சன்லைட் சலவை சவர்க்காரம் 120g',
    category: 'Household',
    purchasePrice: 145,
    sellingPrice: 180,
    stock: 6,
    minStockAlert: 12, // Low stock demo!
    unit: 'pcs',
  },
  {
    id: 'prod-5',
    sku: 'HERB-SAM-25',
    barcode: '4795018005057',
    nameEn: 'Link Samahan Herbal Tea (Box of 25)',
    nameTa: 'லிங்க் சமாஹான் மூலிகை தேநீர் (25 பக்கெற்)',
    category: 'Health',
    purchasePrice: 780,
    sellingPrice: 950,
    stock: 18,
    minStockAlert: 5,
    unit: 'box',
  },
  {
    id: 'prod-6',
    sku: 'BIS-MAL-300',
    barcode: '4796019006060',
    nameEn: 'Maliban Gold Marie Biscuits 300g',
    nameTa: 'மாலிபன் கோல்ட் மேரி பிஸ்கட் 300g',
    category: 'Biscuits',
    purchasePrice: 280,
    sellingPrice: 350,
    stock: 4,
    minStockAlert: 10, // Low stock demo!
    unit: 'pkt',
  },
  {
    id: 'prod-7',
    sku: 'NOO-PRI-80',
    barcode: '4797011007073',
    nameEn: 'Prima Kottu Mee Hot & Spicy 80g',
    nameTa: 'பிரிமா கொத்து மீ நூடுல்ஸ் 80g',
    category: 'Grocery',
    purchasePrice: 110,
    sellingPrice: 140,
    stock: 45,
    minStockAlert: 10,
    unit: 'pkt',
  },
  {
    id: 'prod-8',
    sku: 'SPC-CIN-100',
    barcode: '4798012008086',
    nameEn: 'Pure Ceylon Cinnamon Sticks 100g',
    nameTa: 'சுத்தமான இலங்கை இலவங்கப்பட்டை 100g',
    category: 'Spices',
    purchasePrice: 420,
    sellingPrice: 620,
    stock: 15,
    minStockAlert: 5,
    unit: 'pkt',
  },
  {
    id: 'prod-9',
    sku: 'RIC-SAM-5K',
    barcode: '4799013009099',
    nameEn: 'Samba Rice Premium 5kg',
    nameTa: 'சம்பா அரிசி தரம் 5kg',
    category: 'Grains',
    purchasePrice: 1150,
    sellingPrice: 1350,
    stock: 0, // Out of stock demo!
    minStockAlert: 5,
    unit: 'bag',
  },
  {
    id: 'prod-10',
    sku: 'OIL-WHT-1L',
    barcode: '4791024010100',
    nameEn: 'Pure Coconut Cooking Oil 1 Litre',
    nameTa: 'தூய தேங்காய் எண்ணெய் 1 லீட்டர்',
    category: 'Grocery',
    purchasePrice: 650,
    sellingPrice: 780,
    stock: 22,
    minStockAlert: 8,
    unit: 'btl',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Mohamed Navas',
    phone: '0771234567',
    nic: '198829400192',
    address: 'Hospital Road, Sammanthurai-03',
    city: 'Sammanthurai',
    creditLimit: 25000,
    outstandingBalance: 4250,
    createdDate: '2026-08-14',
    transactions: [
      {
        id: 'tx-101',
        date: '2026-10-15 11:20',
        type: 'sale',
        amount: 5750,
        balanceAfter: 5750,
        description: 'POS Bill #INV-STR-1048',
        invoiceNumber: 'INV-STR-1048',
      },
      {
        id: 'tx-102',
        date: '2026-10-18 16:45',
        type: 'payment',
        amount: 1500,
        balanceAfter: 4250,
        description: 'Partial Cash Payment received',
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'M. S. Farook',
    phone: '0719876543',
    nic: '197914500321',
    address: 'Post Office Lane, Sammanthurai-06',
    city: 'Sammanthurai',
    creditLimit: 15000,
    outstandingBalance: 2800,
    createdDate: '2026-09-02',
    transactions: [
      {
        id: 'tx-201',
        date: '2026-10-19 14:10',
        type: 'sale',
        amount: 2800,
        balanceAfter: 2800,
        description: 'POS Bill #INV-STR-1082',
        invoiceNumber: 'INV-STR-1082',
      },
    ],
  },
  {
    id: 'cust-3',
    name: 'K. Sivakumar',
    phone: '0765544332',
    nic: '199201948372',
    address: 'Temple Road, Sammanthurai-01',
    city: 'Sammanthurai',
    creditLimit: 20000,
    outstandingBalance: 0,
    createdDate: '2026-09-10',
    transactions: [
      {
        id: 'tx-301',
        date: '2026-10-05 10:00',
        type: 'sale',
        amount: 3200,
        balanceAfter: 3200,
        description: 'POS Bill #INV-STR-1015',
        invoiceNumber: 'INV-STR-1015',
      },
      {
        id: 'tx-302',
        date: '2026-10-10 18:00',
        type: 'payment',
        amount: 3200,
        balanceAfter: 0,
        description: 'Full Settlement via Cash',
      },
    ],
  },
  {
    id: 'cust-4',
    name: 'A. R. Riswan',
    phone: '0754433221',
    nic: '198539201934',
    address: 'Beach Road, Sammanthurai-09',
    city: 'Sammanthurai',
    creditLimit: 30000,
    outstandingBalance: 6150,
    createdDate: '2026-07-20',
    transactions: [
      {
        id: 'tx-401',
        date: '2026-10-12 17:30',
        type: 'sale',
        amount: 6150,
        balanceAfter: 6150,
        description: 'Monthly provisions credit',
        invoiceNumber: 'INV-STR-1033',
      },
    ],
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-STR-1089',
    timestamp: '2026-10-22 10:45',
    customerName: 'Mohamed Navas',
    customerId: 'cust-1',
    items: [
      {
        productId: 'prod-1',
        sku: 'TEA-DIL-400',
        nameEn: 'Dilmah Premium Ceylon Tea 400g',
        nameTa: 'தில்மா சிலோன் தேயிலை 400g',
        quantity: 2,
        unitPrice: 1150,
        discountPercent: 0,
        total: 2300,
      },
      {
        productId: 'prod-3',
        sku: 'BIS-MUN-500',
        nameEn: 'Munchee Super Cream Cracker 500g',
        nameTa: 'மன்சி சுப்பர் கிரீம் கிராக்கர் 500g',
        quantity: 1,
        unitPrice: 470,
        discountPercent: 0,
        total: 470,
      },
    ],
    subtotal: 2770,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 2770,
    paymentMethod: 'cash',
    amountTendered: 3000,
    changeAmount: 230,
    cashier: 'Admin (Navas)',
    branch: 'Sammanthurai',
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-STR-1090',
    timestamp: '2026-10-22 12:15',
    customerName: 'Walk-in Customer',
    items: [
      {
        productId: 'prod-2',
        sku: 'MLK-ANC-400',
        nameEn: 'Anchor Full Cream Milk Powder 400g',
        nameTa: 'ஆங்கர் பால் மாவு 400g',
        quantity: 1,
        unitPrice: 1240,
        discountPercent: 0,
        total: 1240,
      },
      {
        productId: 'prod-5',
        sku: 'HERB-SAM-25',
        nameEn: 'Link Samahan Herbal Tea (Box of 25)',
        nameTa: 'லிங்க் சமாஹான் மூலிகை தேநீர் (25 பக்கெற்)',
        quantity: 1,
        unitPrice: 950,
        discountPercent: 0,
        total: 950,
      },
    ],
    subtotal: 2190,
    discountAmount: 90,
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 2100,
    paymentMethod: 'lanka_qr',
    cashier: 'Admin (Navas)',
    branch: 'Sammanthurai',
  },
];

// Helper functions for storage
export const getStorageData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const storage = {
  // Auth
  isLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },
  setLoggedIn: (val: boolean): void => {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },

  // Language
  getLanguage: (): 'en' | 'ta' => {
    const lang = localStorage.getItem(STORAGE_KEYS.LANG);
    return lang === 'ta' ? 'ta' : 'en';
  },
  setLanguage: (lang: 'en' | 'ta'): void => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  },

  // Products
  getProducts: (): Product[] => {
    return getStorageData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts: (products: Product[]): void => {
    setStorageData(STORAGE_KEYS.PRODUCTS, products);
  },

  // Customers (Khata)
  getCustomers: (): Customer[] => {
    return getStorageData<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  saveCustomers: (customers: Customer[]): void => {
    setStorageData(STORAGE_KEYS.CUSTOMERS, customers);
  },

  // Sales
  getSales: (): Sale[] => {
    return getStorageData<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  },
  saveSales: (sales: Sale[]): void => {
    setStorageData(STORAGE_KEYS.SALES, sales);
  },

  // Settings
  getSettings: (): ShopSettings => {
    return getStorageData<ShopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings: (settings: ShopSettings): void => {
    setStorageData(STORAGE_KEYS.SETTINGS, settings);
  },

  // Reset to default sample data
  resetAll: () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  },
};
