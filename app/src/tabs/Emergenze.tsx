import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldCheck, Globe, ExternalLink, Trash2, AlertTriangle, Link2, CheckCircle2, Loader2 } from 'lucide-react';
import { useViaggioStore } from '../store/store';
import { CopyableText } from '../components/ui/CopyableText';
import { syncPendingCheckIns } from '../services/gipsigoService';

export const EmergenzeTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const clearDatabase = useViaggioStore((state) => state.clearDatabase);
  const showToast = useViaggioStore((state) => state.showToast);
  const gipsigoConfig = useViaggioStore((state) => state.gipsigoConfig);
  const updateGiPSigoConfig = useViaggioStore((state) => state.updateGiPSigoConfig);
  const markCheckInsSyncedGiPSigo = useViaggioStore((state) => state.markCheckInsSyncedGiPSigo);
  const checkIns = useViaggioStore((state) => state.checkIns);

  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  // GiPSigo form state
  const [gipsigoApiKey, setGipsigoApiKey] = useState(gipsigoConfig?.apiKey ?? '');
  const [gipsigoTripToken, setGipsigoTripToken] = useState(gipsigoConfig?.tripToken ?? '');
  const [gipsigoEndpoint, setGipsigoEndpoint] = useState(
    gipsigoConfig?.endpointUrl ?? 'https://giemme76.com/gipsigo/api/external_checkin.php'
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync form fields quando gipsigoConfig viene caricato da IndexedDB (caricamento asincrono)
  useEffect(() => {
    if (gipsigoConfig) {
      setGipsigoApiKey(gipsigoConfig.apiKey);
      setGipsigoTripToken(gipsigoConfig.tripToken);
      setGipsigoEndpoint(gipsigoConfig.endpointUrl);
    }
  }, [gipsigoConfig?.apiKey, gipsigoConfig?.tripToken, gipsigoConfig?.endpointUrl]);

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
      <div className="bg-[var(--accent-torii)]/10 border border-[var(--accent-torii)]/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-[var(--accent-torii)]" />
          <div>
            <h2 className="text-base font-bold text-[var(--accent-torii)]">{assicurazione.compagnia}</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Polizza Sanitaria & Assistenza H24</p>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Numero Polizza:</span>
            <CopyableText text={assicurazione.polizza} className="font-mono font-bold text-[var(--accent-torii)] bg-[var(--accent-torii)]/20 px-2 py-0.5 rounded" />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)]">Centrale Operativa H24:</span>
            <CopyableText text={assicurazione.telefono_h24} className="font-mono font-bold text-[var(--text-primary)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${assicurazione.telefono_h24.replace(/\s+/g, '')}`}
            className="bg-[var(--accent-torii)] hover:opacity-90 text-white font-bold py-3 px-3 rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span className="truncate">Chiama H24</span>
          </a>

          <a
            href={assicurazione.sito_web || 'https://www.columbus.it'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--bg-card)] hover:opacity-90 text-[var(--accent-torii)] border border-[var(--accent-torii)]/40 font-bold py-3 px-3 rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-1.5"
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
            <a href={`tel:${corea.ambulanza}`} className="font-mono font-bold text-base text-[var(--accent-torii)]">
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
        <h3 className="text-sm font-bold text-[var(--accent-torii)] flex items-center space-x-2">
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
            <a href={`tel:${giappone.ambulanza}`} className="font-mono font-bold text-base text-[var(--accent-torii)]">
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

      {/* GiPSigo Sync Section */}
      <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-2">
          <Link2 className="w-4 h-4" />
          <span>🔗 Sync GiPSigo</span>
        </h3>

        {gipsigoConfig?.enabled && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Integrazione attiva · ultima sync:{' '}
              {gipsigoConfig.lastSyncAt
                ? new Date(gipsigoConfig.lastSyncAt).toLocaleString('it-IT')
                : 'mai'}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-[var(--text-secondary)] font-medium block">Endpoint GiPSigo</label>
          <input
            id="gipsigo-endpoint"
            type="url"
            value={gipsigoEndpoint}
            onChange={(e) => setGipsigoEndpoint(e.target.value)}
            placeholder="https://mio-gipsigo.it/api/external_checkin.php"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[var(--text-secondary)] font-medium block">API Key</label>
          <input
            id="gipsigo-apikey"
            type="text"
            value={gipsigoApiKey}
            onChange={(e) => setGipsigoApiKey(e.target.value)}
            placeholder="gips_live_abc123..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[var(--text-secondary)] font-medium block">Trip Token</label>
          <input
            id="gipsigo-triptoken"
            type="text"
            value={gipsigoTripToken}
            onChange={(e) => setGipsigoTripToken(e.target.value)}
            placeholder="trip_kr_jp_2026..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="gipsigo-save-btn"
            type="button"
            onClick={async () => {
              if (!gipsigoApiKey.trim() || !gipsigoTripToken.trim() || !gipsigoEndpoint.trim()) {
                showToast('Compila tutti i campi GiPSigo prima di salvare.');
                return;
              }
              await updateGiPSigoConfig({
                enabled: true,
                apiKey: gipsigoApiKey.trim(),
                tripToken: gipsigoTripToken.trim(),
                endpointUrl: gipsigoEndpoint.trim(),
              });
              showToast('✅ Credenziali GiPSigo salvate!');
            }}
            className="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow transition-all active:scale-95"
          >
            Salva Credenziali
          </button>

          <button
            id="gipsigo-sync-btn"
            type="button"
            disabled={isSyncing || !gipsigoConfig?.enabled}
            onClick={async () => {
              if (!gipsigoConfig) return;
              const pending = Object.values(checkIns).filter((c) => !c.syncedToGiPSigo);
              if (pending.length === 0) {
                showToast('Nessun check-in in coda — tutto sincronizzato! ✅');
                return;
              }
              setIsSyncing(true);
              try {
                const result = await syncPendingCheckIns(gipsigoConfig);
                if (result.synced > 0) {
                  await markCheckInsSyncedGiPSigo(pending.map((c) => c.id).slice(0, result.synced));
                  showToast(`✅ Sincronizzati ${result.synced} check-in su GiPSigo!`);
                } else {
                  showToast(`⚠️ Nessun check-in sincronizzato. ${result.errors[0] ?? ''}`);
                }
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                console.error('[GiPSigo sync error]', e);
                showToast(`❌ ${msg}`);
              } finally {
                setIsSyncing(false);
              }
            }}
            className="py-2.5 bg-[var(--bg-card)] hover:opacity-90 text-sky-600 dark:text-sky-300 border border-sky-500/30 font-semibold rounded-xl text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sync.....</>
            ) : (
              <>Sync Ora{Object.values(checkIns).filter((c) => !c.syncedToGiPSigo).length > 0 && (
                <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {Object.values(checkIns).filter((c) => !c.syncedToGiPSigo).length}
                </span>
              )}</>
            )}
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          I check-in sono <strong>sempre salvati localmente</strong> sul dispositivo. La sync verso GiPSigo è opzionale e avviene automaticamente quando la connessione internet è disponibile.
        </p>
      </div>

      {/* Reset Database Button */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        {!showConfirmReset ? (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="w-full bg-[var(--accent-torii)]/10 hover:bg-[var(--accent-torii)]/20 text-[var(--accent-torii)] border border-[var(--accent-torii)]/30 font-semibold py-3 px-4 rounded-2xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>🗑️ Reimposta App (Cancella IndexedDB)</span>
          </button>
        ) : (
          <div className="bg-[var(--accent-torii)]/10 border border-[var(--accent-torii)]/40 p-4 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-[var(--accent-torii)] text-xs font-bold">
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
                className="py-2.5 bg-[var(--accent-torii)] hover:opacity-90 text-white font-bold rounded-xl text-xs shadow"
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
