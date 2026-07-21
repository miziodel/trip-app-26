import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, Globe, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { useViaggioStore } from '../store/store';
import { CopyableText } from '../components/ui/CopyableText';

export const EmergenzeTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const clearDatabase = useViaggioStore((state) => state.clearDatabase);
  const showToast = useViaggioStore((state) => state.showToast);

  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  if (!data) return null;

  const { assicurazione, corea, giappone } = data.emergenze;

  const handleResetApp = async () => {
    await clearDatabase();
    setShowConfirmReset(false);
    showToast('Database azzerato! L\'app è stata reimpostata. 🗑️');
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Assicurazione Card */}
      <div className="bg-gradient-to-br from-rose-950/60 to-slate-900 border border-rose-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-rose-400" />
          <div>
            <h2 className="text-base font-bold text-rose-200">{assicurazione.compagnia}</h2>
            <p className="text-xs text-rose-300/80 font-medium">Polizza Sanitaria & Assistenza H24</p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Numero Polizza:</span>
            <CopyableText text={assicurazione.polizza} className="font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded" />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
            <span className="text-slate-400">Centrale Operativa H24:</span>
            <CopyableText text={assicurazione.telefono_h24} className="font-mono font-bold text-white" />
          </div>
        </div>

        <a
          href={`tel:${assicurazione.telefono_h24.replace(/\s+/g, '')}`}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Chiama Assicurazione H24 (+39 02 3600 5814)</span>
        </a>
      </div>

      {/* Korea Emergency Numbers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-sky-400 flex items-center space-x-2">
          <span>🇰🇷 Numeri di Emergenza Corea del Sud</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Polizia:</div>
            <a href={`tel:${corea.polizia}`} className="font-mono font-bold text-base text-sky-300">
              {corea.polizia}
            </a>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Ambulanza:</div>
            <a href={`tel:${corea.ambulanza}`} className="font-mono font-bold text-base text-rose-400">
              {corea.ambulanza}
            </a>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Hotline Turistica H24:</span>
            <a href={`tel:${corea.hotline_turismo}`} className="font-mono font-bold text-amber-300">
              {corea.hotline_turismo}
            </a>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Ambasciata D'Italia (Seoul):</span>
            <a href={`tel:${corea.ambasciata}`} className="font-mono font-bold text-white">
              {corea.ambasciata}
            </a>
          </div>
        </div>
      </div>

      {/* Japan Emergency Numbers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
          <span>🇯🇵 Numeri di Emergenza Giappone</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Polizia:</div>
            <a href={`tel:${giappone.polizia}`} className="font-mono font-bold text-base text-sky-300">
              {giappone.polizia}
            </a>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Ambulanza:</div>
            <a href={`tel:${giappone.ambulanza}`} className="font-mono font-bold text-base text-rose-400">
              {giappone.ambulanza}
            </a>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">JNTO Hotline Turismo:</span>
            <a href={`tel:${giappone.hotline_jnto}`} className="font-mono font-bold text-amber-300">
              {giappone.hotline_jnto}
            </a>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Ambasciata Tokyo:</span>
            <a href={`tel:${giappone.ambasciata_tokyo}`} className="font-mono font-bold text-white">
              {giappone.ambasciata_tokyo}
            </a>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Consolato Osaka:</span>
            <a href={`tel:${giappone.consolato_osaka}`} className="font-mono font-bold text-white">
              {giappone.consolato_osaka}
            </a>
          </div>
        </div>
      </div>

      {/* Cloud Documents Link */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Documenti & Voucher Cloud</span>
        </h3>

        <p className="text-xs text-slate-400">
          Link diretto alla cartella Google Drive di backup per recuperare le prenotazioni originali.
        </p>

        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold py-2.5 px-4 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center justify-center space-x-2 border border-slate-700"
        >
          <span>Apri Google Drive Voucher</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Reset Database Button */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {!showConfirmReset ? (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="w-full bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-800/60 font-semibold py-3 px-4 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>🗑️ Reimposta App (Cancella IndexedDB)</span>
          </button>
        ) : (
          <div className="bg-rose-950/60 border border-rose-800 p-4 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Sei sicuro di voler resettare tutti i dati?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tutto il database salvato in IndexedDB (note, reazioni, tassi custom e promemoria) verrà eliminato. L'app tornerà alla schermata di benvenuto.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetApp}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow"
              >
                Sì, Elimina Tutto
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergenzeTab;
