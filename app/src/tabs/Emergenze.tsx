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
      <div className="bg-rose-500/10 border border-rose-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-rose-500 dark:text-rose-400" />
          <div>
            <h2 className="text-base font-bold text-rose-700 dark:text-rose-200">{assicurazione.compagnia}</h2>
            <p className="text-xs text-rose-600 dark:text-rose-300/80 font-medium">Polizza Sanitaria & Assistenza H24</p>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] border border-rose-500/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Numero Polizza:</span>
            <CopyableText text={assicurazione.polizza} className="font-mono font-bold text-rose-600 dark:text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded" />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)]">Centrale Operativa H24:</span>
            <CopyableText text={assicurazione.telefono_h24} className="font-mono font-bold text-[var(--text-primary)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${assicurazione.telefono_h24.replace(/\s+/g, '')}`}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-3 rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span className="truncate">Chiama H24</span>
          </a>

          <a
            href={assicurazione.sito_web || 'https://www.columbus.it'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--bg-card)] hover:opacity-90 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold py-3 px-3 rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className="truncate">Sito Web Polizza</span>
          </a>
        </div>
      </div>

      {/* Korea Emergency Numbers */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-2">
          <span>🇰🇷 Numeri di Emergenza Corea del Sud</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)]">Polizia:</div>
            <a href={`tel:${corea.polizia}`} className="font-mono font-bold text-base text-sky-600 dark:text-sky-300">
              {corea.polizia}
            </a>
          </div>

          <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)]">Ambulanza:</div>
            <a href={`tel:${corea.ambulanza}`} className="font-mono font-bold text-base text-rose-600 dark:text-rose-400">
              {corea.ambulanza}
            </a>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[var(--text-primary)] font-medium">Hotline Turistica H24:</span>
            <a href={`tel:${corea.hotline_turismo}`} className="font-mono font-bold text-amber-600 dark:text-amber-300">
              {corea.hotline_turismo}
            </a>
          </div>

          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[var(--text-primary)] font-medium">Ambasciata D'Italia (Seoul):</span>
            <a href={`tel:${corea.ambasciata}`} className="font-mono font-bold text-[var(--text-primary)]">
              {corea.ambasciata}
            </a>
          </div>
        </div>
      </div>

      {/* Japan Emergency Numbers */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
          <span>🇯🇵 Numeri di Emergenza Giappone</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)]">Polizia:</div>
            <a href={`tel:${giappone.polizia}`} className="font-mono font-bold text-base text-sky-600 dark:text-sky-300">
              {giappone.polizia}
            </a>
          </div>

          <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)]">Ambulanza:</div>
            <a href={`tel:${giappone.ambulanza}`} className="font-mono font-bold text-base text-rose-600 dark:text-rose-400">
              {giappone.ambulanza}
            </a>
          </div>
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[var(--text-primary)] font-medium">JNTO Hotline Turismo:</span>
            <a href={`tel:${giappone.hotline_jnto}`} className="font-mono font-bold text-amber-600 dark:text-amber-300">
              {giappone.hotline_jnto}
            </a>
          </div>

          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[var(--text-primary)] font-medium">Ambasciata Tokyo:</span>
            <a href={`tel:${giappone.ambasciata_tokyo}`} className="font-mono font-bold text-[var(--text-primary)]">
              {giappone.ambasciata_tokyo}
            </a>
          </div>

          <div className="flex items-center justify-between bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[var(--text-primary)] font-medium">Consolato Osaka:</span>
            <a href={`tel:${giappone.consolato_osaka}`} className="font-mono font-bold text-[var(--text-primary)]">
              {giappone.consolato_osaka}
            </a>
          </div>
        </div>
      </div>

      {/* Cloud Documents Link */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
          <Globe className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span>Documenti & Voucher Cloud</span>
        </h3>

        <p className="text-xs text-[var(--text-secondary)]">
          Link diretto alla cartella Google Drive di backup per recuperare le prenotazioni originali.
        </p>

        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[var(--bg-primary)] hover:opacity-90 text-sky-600 dark:text-sky-300 font-semibold py-2.5 px-4 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center justify-center space-x-2 border border-[var(--border-subtle)]"
        >
          <span>Apri Google Drive Voucher</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Reset Database Button */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        {!showConfirmReset ? (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold py-3 px-4 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>🗑️ Reimposta App (Cancella IndexedDB)</span>
          </button>
        ) : (
          <div className="bg-rose-500/10 border border-rose-500/40 p-4 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Sei sicuro di voler resettare tutti i dati?</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
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
                className="py-2.5 bg-[var(--bg-card)] hover:opacity-90 text-[var(--text-primary)] border border-[var(--border-subtle)] font-semibold rounded-xl text-xs"
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
