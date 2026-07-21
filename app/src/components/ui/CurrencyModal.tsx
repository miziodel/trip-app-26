import React, { useState, useEffect } from 'react';
import { useViaggioStore } from '../../store/store';
import { X, ArrowRightLeft, Settings, RotateCcw, Check } from 'lucide-react';

export const CurrencyModal: React.FC = () => {
  const showCurrencyModal = useViaggioStore((state) => state.showCurrencyModal);
  const toggleCurrencyModal = useViaggioStore((state) => state.toggleCurrencyModal);
  const data = useViaggioStore((state) => state.data);
  const customRates = useViaggioStore((state) => state.customRates);
  const updateCustomRates = useViaggioStore((state) => state.updateCustomRates);

  const baseJpyRate = data?.meta.tassi_cambio.JPY_EUR || 0.006;
  const baseKrwRate = data?.meta.tassi_cambio.KRW_EUR || 0.00068;

  const jpyRate = customRates?.JPY_EUR ?? baseJpyRate;
  const krwRate = customRates?.KRW_EUR ?? baseKrwRate;

  const isCustom =
    customRates !== null &&
    (customRates.JPY_EUR !== baseJpyRate || customRates.KRW_EUR !== baseKrwRate);

  const [mode, setMode] = useState<'EUR' | 'JPY' | 'KRW'>('EUR');
  const [inputValue, setInputValue] = useState<string>('10');

  // Collapsible edit rates section
  const [showEditRates, setShowEditRates] = useState<boolean>(false);
  const [editJpyRate, setEditJpyRate] = useState<string>(String(jpyRate));
  const [editKrwRate, setEditKrwRate] = useState<string>(String(krwRate));
  const [rateSaved, setRateSaved] = useState<boolean>(false);

  useEffect(() => {
    setEditJpyRate(String(jpyRate));
    setEditKrwRate(String(krwRate));
  }, [jpyRate, krwRate]);

  if (!showCurrencyModal) return null;

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    const newJpy = parseFloat(editJpyRate);
    const newKrw = parseFloat(editKrwRate);
    if (!isNaN(newJpy) && newJpy > 0 && !isNaN(newKrw) && newKrw > 0) {
      await updateCustomRates({ JPY_EUR: newJpy, KRW_EUR: newKrw });
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2000);
    }
  };

  const handleResetRates = async () => {
    await updateCustomRates({ JPY_EUR: baseJpyRate, KRW_EUR: baseKrwRate });
    setEditJpyRate(String(baseJpyRate));
    setEditKrwRate(String(baseKrwRate));
  };

  const numVal = parseFloat(inputValue) || 0;

  let eurAmount = 0;
  let jpyAmount = 0;
  let krwAmount = 0;

  if (mode === 'EUR') {
    eurAmount = numVal;
    jpyAmount = Math.round(numVal / jpyRate);
    krwAmount = Math.round(numVal / krwRate);
  } else if (mode === 'JPY') {
    jpyAmount = numVal;
    eurAmount = parseFloat((numVal * jpyRate).toFixed(2));
    krwAmount = Math.round((numVal * jpyRate) / krwRate);
  } else {
    krwAmount = numVal;
    eurAmount = parseFloat((numVal * krwRate).toFixed(2));
    jpyAmount = Math.round((numVal * krwRate) / jpyRate);
  }

  const presets = [
    { label: '1.000 ¥', mode: 'JPY', val: '1000' },
    { label: '5.000 ¥', mode: 'JPY', val: '5000' },
    { label: '10.000 ¥', mode: 'JPY', val: '10000' },
    { label: '10.000 ₩', mode: 'KRW', val: '10000' },
    { label: '50.000 ₩', mode: 'KRW', val: '50000' },
    { label: '10 €', mode: 'EUR', val: '10' },
    { label: '50 €', mode: 'EUR', val: '50' },
    { label: '100 €', mode: 'EUR', val: '100' },
  ];

  const jpyPerEur = (1 / jpyRate).toFixed(1);
  const krwPerEur = (1 / krwRate).toFixed(0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={toggleCurrencyModal}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6 pr-8">
          <div className="flex items-center gap-2 text-amber-400">
            <ArrowRightLeft className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Convertitore Valuta 💱</h2>
          </div>
          {isCustom && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Personalizzato
            </span>
          )}
        </div>

        {/* Currency selection tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
          {(['EUR', 'JPY', 'KRW'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setInputValue(m === 'EUR' ? '10' : m === 'JPY' ? '1000' : '10000');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === m ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'EUR' ? '🇪🇺 EUR (€)' : m === 'JPY' ? '🇯🇵 JPY (¥)' : '🇰🇷 KRW (₩)'}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="mb-6">
          <label className="block text-xs text-slate-400 mb-1 font-medium">
            Importo da convertire in {mode}:
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-2xl font-bold p-3 rounded-xl focus:outline-none focus:border-amber-400"
            placeholder="0"
          />
        </div>

        {/* Presets */}
        <div className="mb-6">
          <span className="text-xs text-slate-400 block mb-2 font-medium">Scorciatoie veloci:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setMode(p.mode as 'EUR' | 'JPY' | 'KRW');
                  setInputValue(p.val);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversion Display Cards */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-400 text-sm font-medium">🇪🇺 Euro (EUR)</span>
            <span className="text-xl font-bold text-white">€ {eurAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-400 text-sm font-medium">🇯🇵 Yen (JPY)</span>
            <span className="text-xl font-bold text-amber-400">¥ {jpyAmount.toLocaleString('it-IT')}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 text-sm font-medium">🇰🇷 Won (KRW)</span>
            <span className="text-xl font-bold text-blue-400">₩ {krwAmount.toLocaleString('it-IT')}</span>
          </div>
        </div>

        {/* Pivoted Rate Info */}
        <div className="mt-4 text-center space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <p className="text-xs font-bold text-amber-400">
            1 EUR = {jpyPerEur} JPY / {krwPerEur} KRW
          </p>
          <p className="text-[10px] text-slate-500">
            (Tassi base: 1 JPY = {jpyRate} EUR | 1 KRW = {krwRate} EUR)
          </p>
        </div>

        {/* Collapsible Edit Rates Section */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowEditRates(!showEditRates)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-bold">
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              ⚙️ Aggiorna Tassi di Cambio
            </span>
            <span className="text-[10px] font-mono text-slate-500">{showEditRates ? '▲ Chiudi' : '▼ Apri'}</span>
          </button>

          {showEditRates && (
            <form onSubmit={handleSaveRates} className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    JPY/EUR (1 ¥ in €):
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={editJpyRate}
                    onChange={(e) => setEditJpyRate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs p-2 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    1 € ≈ {parseFloat(editJpyRate) > 0 ? (1 / parseFloat(editJpyRate)).toFixed(1) : 0} ¥
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    KRW/EUR (1 ₩ in €):
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editKrwRate}
                    onChange={(e) => setEditKrwRate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs p-2 rounded-lg focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    1 € ≈ {parseFloat(editKrwRate) > 0 ? (1 / parseFloat(editKrwRate)).toFixed(0) : 0} ₩
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  {rateSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{rateSaved ? 'Salvato!' : 'Salva Tassi'}</span>
                </button>
                {isCustom && (
                  <button
                    type="button"
                    onClick={handleResetRates}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                    title="Ripristina tassi originali"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyModal;
