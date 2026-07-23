import React, { useState } from 'react';
import { X, Copy, Check, Car, Volume2 } from 'lucide-react';

interface TaxiCardProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  destinationAddress: string;
  nameLocale?: string;
  addressLocale?: string;
}

/**
 * High-contrast Taxi Card optimized for driver legibility in Japan & Korea
 */
export const TaxiCard: React.FC<TaxiCardProps> = ({
  isOpen,
  onClose,
  destinationName,
  destinationAddress,
  nameLocale,
  addressLocale
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayTitleLocale = nameLocale || destinationName;
  const displayAddressLocale = addressLocale || destinationAddress;

  const handleCopy = () => {
    const fullText = [
      displayTitleLocale,
      destinationName && destinationName !== displayTitleLocale ? `(${destinationName})` : null,
      displayAddressLocale,
      destinationAddress && destinationAddress !== displayAddressLocale ? `(${destinationAddress})` : null,
    ].filter(Boolean).join('\n');
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(displayTitleLocale);
      // Auto-detect language
      if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(displayTitleLocale)) {
        utterance.lang = 'ja-JP';
      } else if (/[\uac00-\ud7af]/.test(displayTitleLocale)) {
        utterance.lang = 'ko-KR';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white text-slate-950 rounded-3xl p-6 shadow-2xl border-4 border-amber-400 relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Driver Taxi Card
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High contrast destination for driver */}
        <div className="space-y-4 text-center py-2">
          {/* Destination Name */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Destinazione / Destination
            </span>
            <h2 className="text-3xl font-black font-noto tracking-tight text-slate-900 leading-tight">
              {displayTitleLocale}
            </h2>
            {destinationName && (
              <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center justify-center gap-1">
                <span>🇮🇹 / 🇬🇧</span>
                <span>{destinationName}</span>
              </p>
            )}
          </div>

          {/* Destination Address */}
          <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 space-y-2 text-left">
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">
                Indirizzo da mostrare al tassista (Locale)
              </span>
              <p className="text-lg font-bold font-noto text-slate-900 leading-relaxed break-words mt-0.5">
                {displayAddressLocale}
              </p>
            </div>

            {destinationAddress && (
              <div className="border-t border-amber-200/80 pt-2 mt-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
                  Indirizzo (IT / EN)
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-normal break-words mt-0.5">
                  {destinationAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleSpeak}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
          >
            <Volume2 className="w-4 h-4 text-slate-700" />
            <span>Pronuncia</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiato!' : 'Copia Testo'}</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-600 italic">
          💡 Suggerimento: mostra questo schermo direttamente al conducente.
        </p>
      </div>
    </div>
  );
};
