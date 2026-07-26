import React from 'react';
import { X, ExternalLink, AlertTriangle, Radio } from 'lucide-react';
import type { Volo } from '../../types/viaggio';
import { getFlightTrackingUrls } from '../../utils/linkUtils';

interface FlightStatusDrawerProps {
  volo: Volo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FlightStatusDrawer: React.FC<FlightStatusDrawerProps> = ({ volo, isOpen, onClose }) => {
  if (!isOpen || !volo) return null;

  const hasFlightNumber = !!(volo.numero_volo && volo.numero_volo.trim());
  const hasIcaoCode = !!(volo.codice_icao && volo.codice_icao.trim());
  const tracking = getFlightTrackingUrls(volo.numero_volo || '', volo.codice_icao);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-500 animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                Stato Volo Live — {volo.compagnia} {volo.numero_volo}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                {volo.citta_partenza} ({volo.aeroporto_partenza}) ➔ {volo.citta_arrivo} ({volo.aeroporto_arrivo})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 rounded-full hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!hasFlightNumber || !hasIcaoCode ? (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Dati Volo Incompleti nel JSON</span>
            </div>
            <p className="leading-relaxed">
              Per attivare il tracciamento live con i radar internazionali, inserisci nel file JSON i campi obbligatori:
            </p>
            <ul className="list-disc list-inside font-mono text-[11px] space-y-1 font-bold">
              {!hasFlightNumber && <li>numero_volo (es. "CA 940" o "NH 864")</li>}
              {!hasIcaoCode && <li>codice_icao (es. "CCA940" o "ANA864")</li>}
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Seleziona uno dei radar per verificare gate, orari in tempo reale e posizione del volo:
            </p>

            <div className="space-y-2 font-bold text-xs">
              <a
                href={tracking.flightAware}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">✈️</span>
                  <span>FlightAware (Codice ICAO: {volo.codice_icao})</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={tracking.tripCom}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-sky-600/10 hover:bg-sky-600/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🌐</span>
                  <span>Trip.com Status (Codice IATA: {volo.numero_volo})</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={tracking.flightradar24}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📡</span>
                  <span>Flightradar24 (Codice IATA: {volo.numero_volo})</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[var(--bg-primary)] hover:opacity-90 text-[var(--text-primary)] font-bold py-2.5 rounded-xl text-xs border border-[var(--border-subtle)] transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
