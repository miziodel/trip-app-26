import React from 'react';
import { useViaggioStore } from '../../store/store';
import { X, Copy, Car } from 'lucide-react';

export const TaxiCard: React.FC = () => {
  const activeTaxiCard = useViaggioStore((state) => state.activeTaxiCard);
  const closeTaxiCard = useViaggioStore((state) => state.closeTaxiCard);
  const showToast = useViaggioStore((state) => state.showToast);

  if (!activeTaxiCard) return null;

  const handleCopyLocale = async () => {
    try {
      const copyText = activeTaxiCard.nameLocale
        ? `${activeTaxiCard.nameLocale}\n${activeTaxiCard.addressLocale}`
        : activeTaxiCard.addressLocale;
      await navigator.clipboard.writeText(copyText);
      showToast('Destinazione e Indirizzo copiati! 🚕');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 p-6 flex flex-col justify-center items-center text-center animate-in fade-in duration-200">
      <button
        type="button"
        onClick={closeTaxiCard}
        className="absolute top-6 right-6 p-3 text-slate-400 hover:text-white bg-slate-800 rounded-full focus:outline-none"
        aria-label="Chiudi"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-sm mb-4 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30">
        <Car className="w-4 h-4" />
        <span>Mostra al Tassista / 택시 기사님께</span>
      </div>

      {/* Western / Main English Name */}
      <h2 className="text-xl font-medium text-slate-300 mb-4">{activeTaxiCard.name}</h2>

      {/* Main Large Display Box for Driver */}
      <div className="bg-slate-900 border-2 border-amber-500/50 p-6 rounded-2xl max-w-lg w-full mb-6 shadow-2xl space-y-4">
        {/* Destination Translated Name */}
        {activeTaxiCard.nameLocale && (
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs text-amber-400 font-mono uppercase tracking-wider block mb-1">
              Nome Destinazione Tradotto:
            </span>
            <p className="text-3xl font-black text-amber-300 leading-tight tracking-wide select-all">
              {activeTaxiCard.nameLocale}
            </p>
          </div>
        )}

        {/* Local Address */}
        <div>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">
            Indirizzo Locale / 주소:
          </span>
          <p className="text-3xl text-center font-bold text-white leading-tight tracking-wide select-all">
            {activeTaxiCard.addressLocale}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyLocale}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95 shadow"
        >
          <Copy className="w-4 h-4" />
          <span>Copia Nome & Indirizzo Locale</span>
        </button>
      </div>

      {activeTaxiCard.addressEn && (
        <p className="text-sm text-slate-400 max-w-md mb-8">
          <span className="font-semibold text-slate-300">Indirizzo EN:</span> {activeTaxiCard.addressEn}
        </p>
      )}

      <button
        type="button"
        onClick={closeTaxiCard}
        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-base border border-slate-700"
      >
        Chiudi Taxi Card
      </button>
    </div>
  );
};

export default TaxiCard;
