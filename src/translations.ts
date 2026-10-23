export interface Translations {
  appName: string;
  branchName: string;
  tagline: string;
  // Auth
  loginTitle: string;
  loginSubtitle: string;
  username: string;
  password: string;
  loginBtn: string;
  demoCredentialsHint: string;
  fillDemoBtn: string;
  loginError: string;
  logout: string;
  // Nav
  dashboard: string;
  pos: string;
  inventory: string;
  khata: string;
  salesHistory: string;
  settings: string;
  // General & Currency
  currencySymbol: string;
  currencyCode: string;
  search: string;
  filter: string;
  all: string;
  actions: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  confirm: string;
  date: string;
  total: string;
  status: string;
  print: string;
  shareWhatsApp: string;
  // Dashboard
  todaySales: string;
  lowStockItems: string;
  totalCustomerCredit: string;
  monthlyProfit: string;
  weeklySalesTrends: string;
  quickActions: string;
  newBill: string;
  addProduct: string;
  addCustomer: string;
  scanBarcode: string;
  recentSales: string;
  criticalLowStock: string;
  restockNow: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  // POS
  posTerminal: string;
  cart: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  item: string;
  qty: string;
  price: string;
  subtotal: string;
  discount: string;
  tax: string;
  grandTotal: string;
  cashTendered: string;
  changeDue: string;
  selectCustomer: string;
  walkInCustomer: string;
  paymentMethod: string;
  cash: string;
  card: string;
  lankaQr: string;
  khataCredit: string;
  checkoutBtn: string;
  clearCart: string;
  scanCameraBtn: string;
  barcodeHint: string;
  scannedSuccess: string;
  itemNotFound: string;
  stockLimitReached: string;
  // Inventory
  inventoryManagement: string;
  inventorySubtitle: string;
  productName: string;
  productNameTa: string;
  category: string;
  sku: string;
  barcode: string;
  purchaseCost: string;
  sellingPrice: string;
  currentStock: string;
  minStockAlert: string;
  unit: string;
  scanItemCamera: string;
  autoGenerateBarcode: string;
  editProduct: string;
  addNewProduct: string;
  deleteProduct: string;
  deleteProductConfirm: string;
  deleteProductWarning: string;
  stockAdjusted: string;
  productSaved: string;
  productDeleted: string;
  // Khata
  customerLedger: string;
  khataSubtitle: string;
  customerName: string;
  phone: string;
  nic: string;
  address: string;
  creditLimit: string;
  outstandingBalance: string;
  settlePayment: string;
  addCredit: string;
  paymentAmount: string;
  paymentNotes: string;
  paymentRecorded: string;
  sendReminder: string;
  removeMember: string;
  removeMemberConfirmZero: string;
  removeMemberConfirmDebt: string;
  removeMemberSuccess: string;
  ledgerHistory: string;
  noTransactions: string;
  // Receipt
  receiptTitle: string;
  billNumber: string;
  cashier: string;
  thankYouMessage: string;
  visitAgain: string;
  // Settings
  systemSettings: string;
  shopDetails: string;
  shopAddress: string;
  taxRatePercent: string;
  backupData: string;
  restoreData: string;
  resetDemoData: string;
  resetConfirm: string;
  dataExported: string;
  dataImported: string;
}

export const translations: Record<'en' | 'ta', Translations> = {
  en: {
    appName: 'STR ERP',
    branchName: 'Sammanthurai Branch',
    tagline: 'Retail Enterprise Resource Planning & POS',
    // Auth
    loginTitle: 'Welcome to STR ERP',
    loginSubtitle: 'Single-Branch POS & Retail Management - Sammanthurai',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Sign In to STR ERP',
    demoCredentialsHint: 'Authorized Administrator Access (Sammanthurai)',
    fillDemoBtn: 'Use Demo Credentials',
    loginError: 'Invalid username or password. Please try again.',
    logout: 'Log Out',
    // Nav
    dashboard: 'Dashboard',
    pos: 'POS Billing',
    inventory: 'Inventory & Stock',
    khata: 'Customer Khata (Credit)',
    salesHistory: 'Sales History',
    settings: 'Shop Settings',
    // General
    currencySymbol: 'Rs.',
    currencyCode: 'LKR',
    search: 'Search by name, SKU, or barcode...',
    filter: 'Filter',
    all: 'All Categories',
    actions: 'Actions',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    date: 'Date & Time',
    total: 'Total',
    status: 'Status',
    print: 'Print Receipt',
    shareWhatsApp: 'Send via WhatsApp',
    // Dashboard
    todaySales: "Today's Sales",
    lowStockItems: 'Low Stock Alerts',
    totalCustomerCredit: 'Total Customer Credit',
    monthlyProfit: 'Estimated Monthly Profit',
    weeklySalesTrends: 'Weekly Sales Performance (LKR)',
    quickActions: 'Quick Actions',
    newBill: 'New POS Bill',
    addProduct: 'Add Product',
    addCustomer: 'Add Khata Member',
    scanBarcode: 'Camera Scanner',
    recentSales: 'Recent Invoices',
    criticalLowStock: 'Critical Stock Items',
    restockNow: '+10 Restock',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    // POS
    posTerminal: 'Point of Sale Terminal',
    cart: 'Current Bill',
    cartEmpty: 'Your Cart is Empty',
    cartEmptyDesc: 'Scan a barcode or click products on the left to add items.',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Govt. Tax (SSCL/VAT)',
    grandTotal: 'Grand Total',
    cashTendered: 'Cash Tendered',
    changeDue: 'Change to Return',
    selectCustomer: 'Select Customer (Optional)',
    walkInCustomer: 'Walk-in Customer',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    lankaQr: 'LankaQR / Digital',
    khataCredit: 'Khata Credit (Ledger)',
    checkoutBtn: 'Complete Sale & Print Bill',
    clearCart: 'Clear Bill',
    scanCameraBtn: 'Scan with Camera',
    barcodeHint: 'USB Barcode scanner is active in background.',
    scannedSuccess: 'Item scanned successfully!',
    itemNotFound: 'Product not found for scanned code:',
    stockLimitReached: 'Available stock limit reached!',
    // Inventory
    inventoryManagement: 'Inventory & Stock Control',
    inventorySubtitle: 'Manage stock levels, retail pricing, and barcodes for Sammanthurai branch.',
    productName: 'Product Name (English)',
    productNameTa: 'Product Name (Tamil)',
    category: 'Category',
    sku: 'SKU Code',
    barcode: 'Barcode / EAN',
    purchaseCost: 'Cost Price (LKR)',
    sellingPrice: 'Selling Price (LKR)',
    currentStock: 'Current Stock',
    minStockAlert: 'Low Stock Threshold',
    unit: 'Unit (pcs/kg/pkt)',
    scanItemCamera: 'Scan Item with Camera',
    autoGenerateBarcode: 'Generate Barcode',
    editProduct: 'Edit Product',
    addNewProduct: 'Add New Product',
    deleteProduct: 'Remove Product',
    deleteProductConfirm: 'Are you sure you want to delete this product?',
    deleteProductWarning: 'This item will be permanently removed from inventory.',
    stockAdjusted: 'Stock adjusted successfully.',
    productSaved: 'Product details saved successfully.',
    productDeleted: 'Product has been removed from inventory.',
    // Khata
    customerLedger: 'Customer Credit Ledger (Khata)',
    khataSubtitle: 'Track customer debt, record settlements, and send WhatsApp payment reminders.',
    customerName: 'Customer Name',
    phone: 'Phone Number',
    nic: 'NIC Number',
    address: 'Address in Sammanthurai',
    creditLimit: 'Credit Limit (LKR)',
    outstandingBalance: 'Outstanding Due (LKR)',
    settlePayment: 'Receive Settlement',
    addCredit: 'Add Credit',
    paymentAmount: 'Amount (LKR)',
    paymentNotes: 'Notes / Receipt Note',
    paymentRecorded: 'Payment received and balance updated.',
    sendReminder: 'WhatsApp Reminder',
    removeMember: 'Remove Member',
    removeMemberConfirmZero: 'Are you sure you want to remove this customer?',
    removeMemberConfirmDebt: 'WARNING: This customer has an outstanding balance of {amount}. Removing them will write off this debt. Are you sure you want to proceed?',
    removeMemberSuccess: 'Customer member removed successfully.',
    ledgerHistory: 'Transaction History',
    noTransactions: 'No previous transactions recorded.',
    // Receipt
    receiptTitle: 'Sales Receipt / வரி விலைப்பட்டியல்',
    billNumber: 'Invoice #',
    cashier: 'Cashier',
    thankYouMessage: 'Thank you for shopping at STR ERP Sammanthurai!',
    visitAgain: 'Please come again!',
    // Settings
    systemSettings: 'Store & Branch Settings',
    shopDetails: 'STR ERP Sammanthurai Information',
    shopAddress: 'Main Street, Sammanthurai, Sri Lanka',
    taxRatePercent: 'Default Tax Rate (%)',
    backupData: 'Export Store Data (JSON)',
    restoreData: 'Import & Restore Data',
    resetDemoData: 'Restore Store Defaults',
    resetConfirm: 'Reset all products, sales, and Khata members to default branch records?',
    dataExported: 'Backup file downloaded successfully.',
    dataImported: 'Store data restored successfully.',
  },
  ta: {
    appName: 'STR ERP',
    branchName: 'சம்மாந்துறை கிளை',
    tagline: 'சில்லறை விற்பனை மேலாண்மை மற்றும் POS கட்டமைப்பு',
    // Auth
    loginTitle: 'STR ERP இற்கு நல்வரவு',
    loginSubtitle: 'ஒற்றைக் கிளை விற்பனை & இருப்பு மேலாண்மை - சம்மாந்துறை',
    username: 'பயனர்பெயர் (Username)',
    password: 'கடவுச்சொல் (Password)',
    loginBtn: 'உள்நுழைக (Sign In)',
    demoCredentialsHint: 'அங்கீகரிக்கப்பட்ட நிர்வாக உள்நுழைவு (சம்மாந்துறை)',
    fillDemoBtn: 'தானியங்கி நிரப்பல்',
    loginError: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.',
    logout: 'வெளியேறு (Logout)',
    // Nav
    dashboard: 'முகப்பு பலகை',
    pos: 'POS பில்லிங்',
    inventory: 'சரக்கு இருப்பு',
    khata: 'கடன் ஏடு (Khata)',
    salesHistory: 'விற்பனை வரலாறு',
    settings: 'அமைப்புகள்',
    // General
    currencySymbol: 'ரூ.',
    currencyCode: 'LKR',
    search: 'பொருளின் பெயர், SKU அல்லது பார்கோடு மூலம் தேடுக...',
    filter: 'வடிகட்டி',
    all: 'அனைத்து பிரிவுகள்',
    actions: 'செயல்கள்',
    save: 'சேமிக்க',
    cancel: 'ரத்து செய்',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    close: 'மூடுக',
    confirm: 'உறுதி செய்',
    date: 'திகதி & நேரம்',
    total: 'மொத்தம்',
    status: 'நிலை',
    print: 'ரசீது அச்சிடு',
    shareWhatsApp: 'WhatsApp இல் அனுப்பு',
    // Dashboard
    todaySales: 'இன்றைய விற்பனை',
    lowStockItems: 'குறைந்த இருப்பு எச்சரிக்கை',
    totalCustomerCredit: 'வாடிக்கையாளர் மொத்த கடன்',
    monthlyProfit: 'மாதாந்த உத்தேச லாபம்',
    weeklySalesTrends: 'வாராந்த விற்பனை போக்கு (ரூ.)',
    quickActions: 'விரைவு நடவடிக்கைகள்',
    newBill: 'புதிய பில் போடு',
    addProduct: 'பொருள் சேர்க்க',
    addCustomer: 'கடன் வாடிக்கையாளர் சேர்க்க',
    scanBarcode: 'கேமரா ஸ்கேனர்',
    recentSales: 'சமீபத்திய பில்கள்',
    criticalLowStock: 'இருப்பு தீரும் நிலையில் உள்ளவை',
    restockNow: '+10 சேர்க்க',
    inStock: 'இருப்பில் உள்ளது',
    lowStock: 'குறைந்த இருப்பு',
    outOfStock: 'இருப்பில்லை',
    // POS
    posTerminal: 'விற்பனை மையம் (POS)',
    cart: 'தற்போதைய பில்',
    cartEmpty: 'பில் காலியாக உள்ளது',
    cartEmptyDesc: 'பார்கோடை ஸ்கேன் செய்யவும் அல்லது இடதுபுறம் உள்ள பொருட்களை கிளிக் செய்யவும்.',
    item: 'பொருள்',
    qty: 'அளவு',
    price: 'விலை',
    subtotal: 'கூட்டுத்தொகை',
    discount: 'தள்ளுபடி',
    tax: 'அரசு வரி (SSCL/VAT)',
    grandTotal: 'இறுதி மொத்தம்',
    cashTendered: 'பெற்றுக் கொண்ட பணம்',
    changeDue: 'மீதி கொடுக்க வேண்டிய தொகை',
    selectCustomer: 'வாடிக்கையாளரைத் தேர்வுசெய் (விரும்பினால்)',
    walkInCustomer: 'நேரடி வாடிக்கையாளர்',
    paymentMethod: 'செலுத்தும் முறை',
    cash: 'ரொக்கம் (Cash)',
    card: 'வங்கி அட்டை (Card)',
    lankaQr: 'LankaQR / டிஜிட்டல்',
    khataCredit: 'கடன் பற்று (Khata)',
    checkoutBtn: 'பில்லை முடித்து அச்சிடு',
    clearCart: 'பில்லை அழிக்க',
    scanCameraBtn: 'கேமராவில் ஸ்கேன் செய்',
    barcodeHint: 'USB பார்கோடு ஸ்கேனர் பின்னணியில் தயாராக உள்ளது.',
    scannedSuccess: 'பொருள் வெற்றிகரமாக ஸ்கேன் செய்யப்பட்டது!',
    itemNotFound: 'ஸ்கேன் செய்யப்பட்ட குறியீட்டிற்கு பொருள் இல்லை:',
    stockLimitReached: 'இருப்பில் உள்ள அதிகபட்ச அளவு எட்டப்பட்டது!',
    // Inventory
    inventoryManagement: 'சரக்கு இருப்பு மேலாண்மை',
    inventorySubtitle: 'சம்மாந்துறை கிளையின் பொருட்கள், கொள்முதல் விலை மற்றும் பார்கோடுகளை நிர்வகிக்கவும்.',
    productName: 'பொருள் பெயர் (ஆங்கிலம்)',
    productNameTa: 'பொருள் பெயர் (தமிழ்)',
    category: 'பிரிவு (Category)',
    sku: 'SKU குறியீடு',
    barcode: 'பார்கோடு (Barcode/EAN)',
    purchaseCost: 'கொள்முதல் விலை (ரூ.)',
    sellingPrice: 'விற்பனை விலை (ரூ.)',
    currentStock: 'தற்போதைய இருப்பு',
    minStockAlert: 'குறைந்தபட்ச இருப்பு எச்சரிக்கை',
    unit: 'அளவு அலகு (பாக்கெட்/கிலோ/எண்ணிக்கை)',
    scanItemCamera: 'கேமரா மூலம் பொருளை ஸ்கேன் செய்',
    autoGenerateBarcode: 'பார்கோடு உருவாக்கு',
    editProduct: 'பொருளைத் திருத்து',
    addNewProduct: 'புதிய பொருள் சேர்க்க',
    deleteProduct: 'பொருளை நீக்கு',
    deleteProductConfirm: 'இந்தப் பொருளை நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
    deleteProductWarning: 'இப்பொருள் சரக்கு இருப்பிலிருந்து நிரந்தரமாக நீக்கப்படும்.',
    stockAdjusted: 'இருப்பு அளவு மாற்றப்பட்டது.',
    productSaved: 'பொருள் விபரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன.',
    productDeleted: 'பொருள் சரக்கிலிருந்து நீக்கப்பட்டது.',
    // Khata
    customerLedger: 'வாடிக்கையாளர் கடன் ஏடு (Khata)',
    khataSubtitle: 'வாடிக்கையாளர் கடன்களைக் கண்காணித்து, வரவுகளைப் பதிவு செய்து, வாட்ஸ்அப் நினைவூட்டல் அனுப்பவும்.',
    customerName: 'வாடிக்கையாளர் பெயர்',
    phone: 'தொலைபேசி எண்',
    nic: 'தேசிய அடையாள அட்டை எண் (NIC)',
    address: 'சம்மாந்துறை முகவரி',
    creditLimit: 'கடன் எல்லை (ரூ.)',
    outstandingBalance: 'செலுத்த வேண்டிய கடன் (ரூ.)',
    settlePayment: 'கடனைப் பெறுக (வரவு)',
    addCredit: 'புதிய கடன் சேர்க்க',
    paymentAmount: 'தொகை (ரூ.)',
    paymentNotes: 'குறிப்பு / ரசீது இலக்கம்',
    paymentRecorded: 'வரவுத்தொகை பதிவு செய்யப்பட்டு நிலுவை புதுப்பிக்கப்பட்டது.',
    sendReminder: 'WhatsApp நினைவூட்டல்',
    removeMember: 'உறுப்பினரை நீக்கு',
    removeMemberConfirmZero: 'இந்த வாடிக்கையாளரை நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
    removeMemberConfirmDebt: 'எச்சரிக்கை: இந்த வாடிக்கையாளர் ரூ. {amount} கடன் வைத்துள்ளார். இவரை நீக்கினால் இக்கடன் கணக்கு ரத்து செய்யப்படும். தொடர விரும்புகிறீர்களா?',
    removeMemberSuccess: 'வாடிக்கையாளர் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது.',
    ledgerHistory: 'பரிவர்த்தனை வரலாறு',
    noTransactions: 'முந்தைய பதிவுகள் எதுவும் இல்லை.',
    // Receipt
    receiptTitle: 'விற்பனை ரசீது (Sales Receipt)',
    billNumber: 'பில் இலக்கம்',
    cashier: 'காசாளர்',
    thankYouMessage: 'STR ERP சம்மாந்துறையில் கொள்வனவு செய்ததற்கு நன்றி!',
    visitAgain: 'மீண்டும் வருக!',
    // Settings
    systemSettings: 'கடை மற்றும் கிளை அமைப்புகள்',
    shopDetails: 'STR ERP சம்மாந்துறை கிளை விபரம்',
    shopAddress: 'பிரதான வீதி, சம்மாந்துறை, இலங்கை',
    taxRatePercent: 'வழக்கமான வரி விகிதம் (%)',
    backupData: 'தரவு காப்புப்பிரதி (JSON)',
    restoreData: 'தரவை மீட்டெடுக்க (Import)',
    resetDemoData: 'இயல்புநிலைக்கு மீட்டமைக்க',
    resetConfirm: 'அனைத்து சரக்கு, பில் மற்றும் வாடிக்கையாளர் தரவையும் கிளை இயல்புநிலைக்கு மீட்டமைக்க விரும்புகிறீர்களா?',
    dataExported: 'காப்புப்பிரதி கோப்பு பதிவிறக்கப்பட்டது.',
    dataImported: 'தரவு வெற்றிகரமாக மீட்டெடுக்கப்பட்டது.',
  },
};
