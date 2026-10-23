import React, { useRef } from 'react';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { Sale, Language, ShopSettings } from '../types';
import { translations } from '../translations';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  lang: Language;
  settings: ShopSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  lang,
  settings,
}) => {
  const t = translations[lang];
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const isTa = lang === 'ta';
    let msg = `*${settings.shopName} - ${isTa ? settings.branchNameTa : settings.branchNameEn}*\n`;
    msg += `📍 ${isTa ? settings.addressTa : settings.addressEn}\n`;
    msg += `📞 ${settings.phone}\n`;
    msg += `─────────────────────────\n`;
    msg += `*${t.billNumber}:* ${sale.invoiceNumber}\n`;
    msg += `*${t.date}:* ${sale.timestamp}\n`;
    msg += `*${t.cashier}:* ${sale.cashier}\n`;
    if (sale.customerName) {
      msg += `*${t.customerName}:* ${sale.customerName}\n`;
    }
    msg += `─────────────────────────\n`;
    msg += `*ITEMS / பொருட்கள்:*\n`;

    sale.items.forEach((item, idx) => {
      const name = isTa && item.nameTa ? item.nameTa : item.nameEn;
      msg += `${idx + 1}. ${name}\n`;
      msg += `   ${item.quantity} x Rs. ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} = *Rs. ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}*\n`;
    });

    msg += `─────────────────────────\n`;
    msg += `*${t.subtotal}:* Rs. ${sale.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    if (sale.discountAmount > 0) {
      msg += `*${t.discount}:* -Rs. ${sale.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    }
    if (sale.taxAmount > 0) {
      msg += `*${t.tax}:* Rs. ${sale.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    }
    msg += `*${t.grandTotal}: Rs. ${sale.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}*\n`;
    msg += `*${t.paymentMethod}:* ${sale.paymentMethod.toUpperCase()}\n`;
    if (sale.amountTendered && sale.changeAmount !== undefined) {
      msg += `*${t.cashTendered}:* Rs. ${sale.amountTendered.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
      msg += `*${t.changeDue}:* Rs. ${sale.changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    }
    msg += `─────────────────────────\n`;
    msg += `${isTa ? settings.receiptFooterTa : settings.receiptFooterEn}\n`;
    msg += `🙏 ${t.thankYouMessage}\n`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">
              {lang === 'ta' ? 'விற்பனை நிறைவடைந்தது' : 'Sale Completed'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex justify-center">
          <div
            ref={receiptPrintRef}
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-black p-5 shadow-sm border border-slate-200 font-mono text-xs rounded-sm"
          >
            {/* Header info */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="text-base font-black tracking-tight uppercase">{settings.shopName}</h2>
              <p className="text-[11px] font-bold text-gray-800">
                {lang === 'ta' ? settings.branchNameTa : settings.branchNameEn}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {lang === 'ta' ? settings.addressTa : settings.addressEn}
              </p>
              <p className="text-[10px] text-gray-600">Tel: {settings.phone}</p>
              {settings.vatRegNo && (
                <p className="text-[9px] text-gray-500">VAT: {settings.vatRegNo}</p>
              )}
            </div>

            {/* Bill details */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>{t.billNumber}:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.date}:</span>
                <span>{sale.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.cashier}:</span>
                <span>{sale.cashier}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span>{t.customerName}:</span>
                  <span className="font-semibold">{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Item Table */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px]">
              <div className="grid grid-cols-12 font-bold pb-1 text-[10px] uppercase border-b border-gray-200">
                <span className="col-span-6">{t.item}</span>
                <span className="col-span-2 text-center">{t.qty}</span>
                <span className="col-span-4 text-right">{t.total}</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {sale.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 leading-tight">
                    <div className="col-span-6 pr-1">
                      <p className="font-semibold truncate">
                        {lang === 'ta' && item.nameTa ? item.nameTa : item.nameEn}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        @ Rs. {item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-2 text-center font-bold">{item.quantity}</div>
                    <div className="col-span-4 text-right font-bold">
                      Rs. {item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>{t.subtotal}:</span>
                <span>Rs. {sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>{t.discount}:</span>
                  <span>-Rs. {sale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>{t.tax} ({sale.taxRate}%):</span>
                  <span>Rs. {sale.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                <span>{t.grandTotal}:</span>
                <span>Rs. {sale.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1 text-gray-600">
                <span>{t.paymentMethod}:</span>
                <span className="font-bold uppercase">{sale.paymentMethod}</span>
              </div>
              {sale.amountTendered && sale.changeAmount !== undefined && (
                <>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{t.cashTendered}:</span>
                    <span>Rs. {sale.amountTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-900">
                    <span>{t.changeDue}:</span>
                    <span>Rs. {sale.changeAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-3 text-[10px] text-gray-700 space-y-1">
              <p>{lang === 'ta' ? settings.receiptFooterTa : settings.receiptFooterEn}</p>
              <p className="font-bold">{t.thankYouMessage}</p>
              <p className="text-[9px] text-gray-500">*** STR ERP - Sammanthurai Branch ***</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{t.print}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareWhatsApp}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
