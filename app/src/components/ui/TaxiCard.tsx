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
      await navigator.clipboard.writeText(activeTaxiCard.addressLocale);
      showToast('Indirizzo locale copiato!');
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

      <h2 className="text-xl font-medium text-slate-300 mb-6">{activeTaxiCard.name}</h2>

      {/* Main Large Local Address */}
      <div className="bg-slate-900 border-2 border-amber-500/40 p-6 rounded-2xl max-w-lg w-full mb-6 shadow-2xl">
        <p className="text-4xl text-center font-bold text-white mb-4 leading-tight tracking-wide select-all">
          {activeTaxiCard.addressLocale}
        </p>
        
        <button
          type="button"
          onClick={handleCopyLocale}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Copy className="w-4 h-4" />
          <span>Copia Indirizzo Locale</span>
        </button>
      </div>

      {activeTaxiCard.addressEn && (
        <p className="text-base text-slate-400 max-w-md mb-8">
          <span className="font-semibold text-slate-300">English:</span> {activeTaxiCard.addressEn}
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
