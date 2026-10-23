import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  X,
  RefreshCw,
  Upload,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Sparkles,
  CameraOff,
  Video,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { soundFx } from '../utils/audio';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  lang: Language;
  title?: string;
}

interface CameraDevice {
  id: string;
  label: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  lang,
  title,
}) => {
  const t = translations[lang];

  // Scanner States
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = 'str-barcode-reader';

  // Safely stop and clear scanner instance
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
  }, []);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      const cleanCode = decodedText.trim();
      if (!cleanCode) return;

      soundFx.playScanBeep();
      setLastScannedCode(cleanCode);

      // Trigger callback
      onScan(cleanCode);

      // Brief visual confirmation before closing
      setTimeout(() => {
        stopScanner();
        onClose();
      }, 500);
    },
    [onScan, onClose, stopScanner]
  );

  // Initialize and start scanner with multiple automatic fallbacks
  const startScanner = useCallback(
    async (cameraIdToUse?: string) => {
      setCameraError(null);
      setIsInitializing(true);

      // Ensure DOM element is present
      const container = document.getElementById(readerElementId);
      if (!container) {
        setIsInitializing(false);
        return;
      }

      // Cleanup prior instance if any
      await stopScanner();

      try {
        // Enumerate devices if not already done
        let camerasList = availableCameras;
        if (camerasList.length === 0) {
          try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              camerasList = devices.map((d, idx) => ({
                id: d.id,
                label: d.label || `Camera ${idx + 1}`,
              }));
              setAvailableCameras(camerasList);
            }
          } catch (camEnumErr) {
            console.warn('Camera enumeration error (will try constraints):', camEnumErr);
          }
        }

        // Create fresh scanner instance
        const html5Qrcode = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        });
        scannerRef.current = html5Qrcode;

        // Dynamic responsive qrbox that NEVER exceeds viewfinder dimensions
        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeW = Math.max(160, Math.floor(minDim * 0.85));
            const edgeH = Math.max(120, Math.floor(minDim * 0.55));
            return { width: edgeW, height: edgeH };
          },
          aspectRatio: 1.333,
        };

        // Determine camera target
        let targetId = cameraIdToUse || selectedCameraId;
        if (!targetId && camerasList.length > 0) {
          // Prefer back/rear camera on phones
          const rearCam = camerasList.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
          );
          targetId = rearCam ? rearCam.id : camerasList[0].id;
          setSelectedCameraId(targetId);
        }

        // Attempt 1: Start with specific camera ID if available
        if (targetId) {
          try {
            await html5Qrcode.start(
              targetId,
              config,
              (decoded) => handleScanSuccess(decoded),
              () => {}
            );
            setIsScanning(true);
            setIsInitializing(false);
            return;
          } catch (idErr) {
            console.warn('Start with camera ID failed, attempting fallback...', idErr);
          }
        }

        // Attempt 2: Start with environment facingMode
        try {
          await html5Qrcode.start(
            { facingMode: 'environment' },
            config,
            (decoded) => handleScanSuccess(decoded),
            () => {}
          );
          setIsScanning(true);
          setIsInitializing(false);
          return;
        } catch (envErr) {
          console.warn('facingMode environment failed, attempting user facingMode...', envErr);
        }

        // Attempt 3: Start with user facingMode (standard desktop/laptop webcam)
        try {
          await html5Qrcode.start(
            { facingMode: 'user' },
            config,
            (decoded) => handleScanSuccess(decoded),
            () => {}
          );
          setIsScanning(true);
          setIsInitializing(false);
          return;
        } catch (userErr) {
          console.warn('facingMode user failed, attempting default constraint...', userErr);
        }

        // Attempt 4: Start with generic MediaTrackConstraints
        await html5Qrcode.start(
          {},
          config,
          (decoded) => handleScanSuccess(decoded),
          () => {}
        );
        setIsScanning(true);
        setIsInitializing(false);
      } catch (err: unknown) {
        console.error('All camera start attempts failed:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (
          errMsg.includes('NotAllowedError') ||
          errMsg.includes('Permission') ||
          errMsg.includes('denied')
        ) {
          setCameraError(
            lang === 'ta'
              ? 'கேமரா அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி அமைப்பில் கேமராவை அனுமதிக்கவும் அல்லது "நேரடி புகைப்படம்" தெரிவைப் பயன்படுத்தவும்.'
              : 'Camera permission denied. Please allow camera in browser address bar or use "Snap Photo" below.'
          );
        } else if (
          errMsg.includes('NotFoundError') ||
          errMsg.includes('DevicesNotFoundError') ||
          errMsg.includes('OverconstrainedError')
        ) {
          setCameraError(
            lang === 'ta'
              ? 'கேமரா சாதனம் கண்டறியப்படவில்லை. நீங்கள் புகைப்படத்தை பதிவேற்றி அல்லது பார்கோடை தட்டச்சு செய்து ஸ்கேன் செய்யலாம்.'
              : 'No compatible camera found. You can snap a photo, upload an image, or type the code.'
          );
        } else {
          setCameraError(
            lang === 'ta'
              ? 'கேமராவைத் தொடங்க முடியவில்லை. "மீண்டும் முயற்சி" அல்லது "நேரடி புகைப்படம்" பொத்தானை அழுத்தவும்.'
              : 'Unable to start camera stream. Click "Retry Camera" or "Snap Photo" below.'
          );
        }
        setIsScanning(false);
        setIsInitializing(false);
      }
    },
    [availableCameras, handleScanSuccess, lang, selectedCameraId, stopScanner]
  );

  // Mount/Unmount effect
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLastScannedCode(null);
      setCameraError(null);
      // Small timeout for DOM render
      const timer = setTimeout(() => {
        if (isMounted) {
          startScanner();
        }
      }, 250);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  // Decode barcode from an uploaded image or camera snapshot
  const handleProcessImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp', false);
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
      html5QrCode.clear();
    } catch {
      soundFx.playErrorBeep();
      alert(
        lang === 'ta'
          ? 'படத்திலிருந்து பார்கோடு கண்டறியப்படவில்லை. தயவுசெய்து தெளிவான படத்தை முயற்சிக்கவும்.'
          : 'No valid barcode detected in the image. Please ensure the barcode is clearly visible and in focus.'
      );
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
      setManualCode('');
    }
  };

  const sampleBarcodes = [
    { name: 'Dilmah Ceylon Tea', code: '4791001001015' },
    { name: 'Anchor Milk Powder', code: '4792014002028' },
    { name: 'Munchee Super Cream', code: '4793012003031' },
    { name: 'Sunlight Care Soap', code: '4794015004044' },
    { name: 'Samahan Herbal Tea', code: '4795018005057' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/80 rounded-lg">
              <Camera className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {title || (lang === 'ta' ? 'பார்கோடு கேமரா ஸ்கேனர்' : 'Camera Barcode Scanner')}
              </h3>
              <p className="text-[11px] text-emerald-100/90 font-medium">STR ERP - Sammanthurai Branch</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Scanner Viewport Box */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden min-h-[240px] flex items-center justify-center border-2 border-dashed border-emerald-500/40">
            {/* The element for html5-qrcode video */}
            <div id={readerElementId} className="w-full h-full min-h-[240px]" />

            {/* Initializing Spinner */}
            {isInitializing && !cameraError && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white space-y-2">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-emerald-300">
                  {lang === 'ta' ? 'கேமரா தொடங்குகிறது...' : 'Connecting camera stream...'}
                </p>
              </div>
            )}

            {/* Target Reticle Overlay */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-36 border-2 border-emerald-400 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.5)] relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
                  <div className="w-full h-0.5 bg-rose-500/80 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                </div>
                <span className="text-[11px] text-emerald-200 mt-2 bg-black/70 px-2.5 py-0.5 rounded-full font-mono">
                  {lang === 'ta' ? 'பார்கோடை மையத்தில் காட்டவும்' : 'Align Barcode within box'}
                </span>
              </div>
            )}

            {/* Camera Error Message with Actionable Help */}
            {cameraError && (
              <div className="absolute inset-0 p-5 bg-slate-900/95 flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-200 font-medium max-w-xs leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => startScanner()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'மீண்டும் முயற்சி செய்' : 'Retry Camera'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'நேரடி புகைப்படம்' : 'Snap Photo'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Success Badge */}
            {lastScannedCode && (
              <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center animate-fadeIn text-white">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                  {lang === 'ta' ? 'வெற்றிகரமாக ஸ்கேன் செய்யப்பட்டது!' : 'Barcode Captured!'}
                </span>
                <span className="font-mono text-lg font-bold text-white mt-1 bg-emerald-900/90 px-3 py-1 rounded-md border border-emerald-500/50">
                  {lastScannedCode}
                </span>
              </div>
            )}
          </div>

          {/* Camera Selection Dropdown & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Device selector if multiple cameras detected */}
            {availableCameras.length > 1 ? (
              <div className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedCameraId(newId);
                    startScanner(newId);
                  }}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-emerald-600"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startScanner()}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'மீளத் தொடங்கு' : 'Restart Stream'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              {/* Native Camera Snap (Works on all mobile phones & tablets) */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                title="Open device camera directly"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'புகைப்படம் எடு' : 'Snap Photo'}</span>
              </button>
              <input
                type="file"
                ref={nativeCameraInputRef}
                onChange={handleProcessImageFile}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {/* Upload image file */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                title="Scan barcode from image file"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'படம்' : 'Upload'}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProcessImageFile}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center gap-1 text-slate-500 text-[11px] pl-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'ta' ? 'ஒலி' : 'Beep'}</span>
              </div>
            </div>
          </div>

          <div id="file-scanner-temp" className="hidden" />

          {/* Quick Barcode Select */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {lang === 'ta' ? 'அடிக்கடி ஸ்கேன் செய்யப்படும் பொருட்கள்' : 'Popular Retail Barcodes'}
              </span>
              <span className="text-[10px] text-slate-400">
                {lang === 'ta' ? 'விரைவு தேர்வு' : 'Quick select'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleScanSuccess(item.code)}
                  className="px-2.5 py-1.5 text-left bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-lg transition-colors group"
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                    {item.name}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {item.code}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {lang === 'ta' ? 'அல்லது பார்கோடை தட்டச்சு செய்யவும்:' : 'Or type barcode manually:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 4791001001015"
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-emerald-600 font-mono text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {t.confirm}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
