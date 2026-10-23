import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Send,
  CreditCard,
  Trash2,
  X,
  Check,
  AlertTriangle,
  History,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { Customer, Language, ShopSettings } from '../types';
import { translations } from '../translations';
import { soundFx } from '../utils/audio';

interface KhataProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'transactions' | 'createdDate'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onRemoveCustomer: (customerId: string) => void;
  onRecordPayment: (customerId: string, amount: number, note: string) => void;
  onAddCredit: (customerId: string, amount: number, note: string) => void;
  lang: Language;
  settings: ShopSettings;
}

export const Khata: React.FC<KhataProps> = ({
  customers,
  onAddCustomer,
  onRemoveCustomer,
  onRecordPayment,
  onAddCredit,
  lang,
  settings,
}) => {
  const t = translations[lang];

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<Customer | null>(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);
  const [creditModalCustomer, setCreditModalCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Forms
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    nic: '',
    address: '',
    city: 'Sammanthurai',
    creditLimit: '20000',
    outstandingBalance: '0',
  });

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');

  // Total debt
  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);

  // Filtered
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.nic && c.nic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add Customer
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) return;

    onAddCustomer({
      name: newCustomerForm.name.trim(),
      phone: newCustomerForm.phone.trim(),
      nic: newCustomerForm.nic.trim(),
      address: newCustomerForm.address.trim() || 'Sammanthurai',
      city: newCustomerForm.city.trim() || 'Sammanthurai',
      creditLimit: parseFloat(newCustomerForm.creditLimit) || 15000,
      outstandingBalance: parseFloat(newCustomerForm.outstandingBalance) || 0,
    });

    soundFx.playSuccessChime();
    setAddCustomerModalOpen(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      nic: '',
      address: '',
      city: 'Sammanthurai',
      creditLimit: '20000',
      outstandingBalance: '0',
    });
  };

  // Record Payment (Settlement)
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer) return;
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) return;

    onRecordPayment(
      paymentModalCustomer.id,
      amt,
      paymentNote.trim() || (lang === 'ta' ? 'ரொக்கக் கொடுப்பனவு' : 'Cash payment received')
    );

    soundFx.playSuccessChime();
    setPaymentModalCustomer(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  // Add Credit (New Debt)
  const handleCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalCustomer) return;
    const amt = parseFloat(creditAmount);
    if (!amt || amt <= 0) return;

    onAddCredit(
      creditModalCustomer.id,
      amt,
      creditNote.trim() || (lang === 'ta' ? 'கடன் பற்று' : 'Manual credit adjustment')
    );

    soundFx.playSuccessChime();
    setCreditModalCustomer(null);
    setCreditAmount('');
    setCreditNote('');
  };

  // Delete Customer
  const handleConfirmRemoveCustomer = () => {
    if (!customerToDelete) return;
    onRemoveCustomer(customerToDelete.id);
    soundFx.playScanBeep();
    if (selectedCustomerForLedger?.id === customerToDelete.id) {
      setSelectedCustomerForLedger(null);
    }
    setCustomerToDelete(null);
  };

  // WhatsApp Reminder Generator
  const handleSendWhatsAppReminder = (customer: Customer) => {
    const isTa = lang === 'ta';
    let msg = `*${settings.shopName} - ${isTa ? settings.branchNameTa : settings.branchNameEn}*\n`;
    msg += `📍 ${isTa ? settings.addressTa : settings.addressEn}\n`;
    msg += `📞 ${settings.phone}\n`;
    msg += `─────────────────────────\n`;
    if (isTa) {
      msg += `வணக்கம் ${customer.name},\n`;
      msg += `எமது கடையில் நீங்கள் கொள்வனவு செய்த பொருட்களுக்கான நிலுவைத் தொகை: *ரூ. ${customer.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}* ஆகும்.\n\n`;
      msg += `தயவுசெய்து இத்தொகையை விரைவாக செலுத்தி ஒத்துழைக்குமாறு அன்புடன் கேட்டுக்கொள்கிறோம்.\n\n`;
      msg += `நன்றி,\n*STR ERP - சம்மாந்துறை கிளை*`;
    } else {
      msg += `Dear ${customer.name},\n`;
      msg += `This is a friendly payment reminder from STR ERP Sammanthurai regarding your outstanding credit balance of *Rs. ${customer.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}*.\n\n`;
      msg += `Kindly arrange to settle this amount at your earliest convenience.\n\n`;
      msg += `Thank you,\n*STR ERP - Sammanthurai Branch*`;
    }

    // Clean phone number (e.g. 0771234567 -> 94771234567)
    let phone = customer.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '94' + phone.substring(1);
    }

    const encoded = encodeURIComponent(msg);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t.customerLedger}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Total Due: Rs. {totalOutstanding.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.khataSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddCustomerModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCustomer}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ta'
                ? 'வாடிக்கையாளர் பெயர், தொலைபேசி அல்லது NIC மூலம் தேடுக...'
                : 'Search customer by name, phone, NIC, or address...'
            }
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-emerald-600 font-medium text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5">{t.customerName}</th>
                <th className="px-4 py-3.5">{t.phone} & NIC</th>
                <th className="px-4 py-3.5">{t.address}</th>
                <th className="px-4 py-3.5 text-right">{t.creditLimit}</th>
                <th className="px-4 py-3.5 text-right">{t.outstandingBalance}</th>
                <th className="px-4 py-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {filteredCustomers.map((c) => {
                const hasDue = c.outstandingBalance > 0;
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{c.name}</span>
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Member since {c.createdDate}
                        </span>
                      </div>
                    </td>

                    {/* Phone & NIC */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{c.phone}</span>
                        </div>
                        {c.nic && (
                          <div className="text-[10px] text-slate-400">
                            NIC: {c.nic}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Address in Sammanthurai */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{c.address}</span>
                      </div>
                    </td>

                    {/* Credit Limit */}
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      Rs. {c.creditLimit.toLocaleString()}
                    </td>

                    {/* Outstanding Due */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono font-bold text-sm ${
                          hasDue
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        Rs. {c.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Actions: Receive Payment, Ledger History, WhatsApp Reminder, Remove Member */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Settle / Receive Payment */}
                        <button
                          type="button"
                          onClick={() => setPaymentModalCustomer(c)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg text-[11px] font-bold transition-colors"
                          title={t.settlePayment}
                        >
                          {t.settlePayment}
                        </button>

                        {/* View Ledger History */}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForLedger(c)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title={t.ledgerHistory}
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Send WhatsApp Reminder */}
                        {hasDue && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(c)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                            title={t.sendReminder}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* REMOVE MEMBER (DELETE CUSTOMER) ACTION BUTTON */}
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title={t.removeMember}
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

      {/* Remove Member Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.removeMember}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                {customerToDelete.name} ({customerToDelete.phone})
              </p>

              {customerToDelete.outstandingBalance > 0 ? (
                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-left text-xs text-rose-700 dark:text-rose-300">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'ta' ? 'நிலுவைக் கடன் எச்சரிக்கை!' : 'Outstanding Debt Warning!'}
                    </span>
                  </p>
                  <p className="mt-1">
                    {lang === 'ta'
                      ? `இந்த வாடிக்கையாளர் ரூ. ${customerToDelete.outstandingBalance.toLocaleString()} கடன் வைத்துள்ளார். இவரை நீக்கினால் இக்கடன் கணக்கு ரத்து செய்யப்படும்.`
                      : `This member currently owes Rs. ${customerToDelete.outstandingBalance.toLocaleString()}. Deleting them will write off this outstanding credit.`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  {t.removeMemberConfirmZero}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveCustomer}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                {t.removeMember}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Ledger History Modal */}
      {selectedCustomerForLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>{selectedCustomerForLedger.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedCustomerForLedger.phone} &bull; {selectedCustomerForLedger.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerForLedger(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {t.outstandingBalance}
                </span>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  Rs. {selectedCustomerForLedger.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalCustomer(selectedCustomerForLedger);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {t.settlePayment}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreditModalCustomer(selectedCustomerForLedger);
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
                >
                  {t.addCredit}
                </button>
              </div>
            </div>

            {/* Ledger Transactions List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.ledgerHistory}
              </h4>
              {selectedCustomerForLedger.transactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  {t.noTransactions}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomerForLedger.transactions.map((tx) => {
                    const isPayment = tx.type === 'payment';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isPayment
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {isPayment ? (lang === 'ta' ? 'வரவு' : 'Payment') : (lang === 'ta' ? 'கடன் பற்று' : 'Credit')}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {tx.description}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {tx.date}
                          </span>
                        </div>

                        <div className="text-right font-mono">
                          <p
                            className={`font-black ${
                              isPayment ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPayment ? '-' : '+'}Rs. {tx.amount.toLocaleString()}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Bal: Rs. {tx.balanceAfter.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer with Member Remove Option */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCustomerToDelete(selectedCustomerForLedger)}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.removeMember}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCustomerForLedger(null)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Payment Modal */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.settlePayment} - {paymentModalCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setPaymentModalCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs flex justify-between">
                <span className="text-emerald-900 dark:text-emerald-200">{t.outstandingBalance}:</span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  Rs. {paymentModalCustomer.outstandingBalance.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.paymentAmount} *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="1"
                  max={paymentModalCustomer.outstandingBalance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.paymentNotes}
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Cash settlement / Receipt note"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credit Modal */}
      {creditModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.addCredit} - {creditModalCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setCreditModalCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.paymentAmount} *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.paymentNotes}
                </label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="Items bought on credit"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreditModalCustomer(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{t.addCustomer}</h3>
              <button
                type="button"
                onClick={() => setAddCustomerModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-800 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-5 overflow-y-auto space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
                  }
                  placeholder="e.g. Mohamed Navas"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.phone}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                    }
                    placeholder="0771234567"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.nic}
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.nic}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, nic: e.target.value })
                    }
                    placeholder="198829400192"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t.address} (Sammanthurai)
                </label>
                <input
                  type="text"
                  value={newCustomerForm.address}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
                  }
                  placeholder="Hospital Road, Sammanthurai"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.creditLimit}
                  </label>
                  <input
                    type="number"
                    value={newCustomerForm.creditLimit}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, creditLimit: e.target.value })
                    }
                    placeholder="20000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t.outstandingBalance}
                  </label>
                  <input
                    type="number"
                    value={newCustomerForm.outstandingBalance}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, outstandingBalance: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
