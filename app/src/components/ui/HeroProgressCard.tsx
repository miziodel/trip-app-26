import React from 'react';
import { Copy, Check, Car, Navigation } from 'lucide-react';
import type { Treno, Bus, Volo } from '../../types/viaggio';

export interface HeroProgressCardProps {
  item: Treno | Bus | Volo;
  progressPercent: number;
  etaMinutes: number;
  onCopyPnr: (pnr: string) => void;
  onOpenTaxiCard?: () => void;
}

export const HeroProgressCard: React.FC<HeroProgressCardProps> = ({
  item,
  progressPercent,
  etaMinutes,
  onCopyPnr,
  onOpenTaxiCard
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if ('pnr' in item && item.pnr) {
      onCopyPnr(item.pnr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract origin & destination titles
  let origin = 'Partenza';
  let destination = 'Arrivo';
  let vehicleName = 'Trasporto';

  if ('aeroporto_partenza' in item) {
    // Volo
    origin = `${item.citta_partenza} (${item.aeroporto_partenza})`;
    destination = `${item.citta_arrivo} (${item.aeroporto_arrivo})`;
    vehicleName = `${item.compagnia} ${item.numero_volo}`;
  } else if ('stazione_partenza' in item) {
    // Treno o Bus
    origin = item.stazione_partenza;
    destination = item.stazione_arrivo;
    vehicleName = 'mezzo' in item ? item.mezzo : item.vettore;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 border border-amber-400/40 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase">
            IN CORSO • NOW
          </span>
        </div>

        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
          ETA: {etaMinutes} min
        </span>
      </div>

      {/* Title / Vehicle */}
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-base text-[var(--text-primary)]">
          {vehicleName}
        </h3>
        {'pnr' in item && item.pnr && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 font-mono text-xs text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 transition"
          >
            <span>PNR: {item.pnr}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
          </button>
        )}
      </div>

      {/* 3-Column Transit Route */}
      <div className="grid grid-cols-3 items-center text-center py-1 bg-slate-950/50 rounded-2xl p-3 border border-slate-800/80">
        {/* Origin */}
        <div className="space-y-0.5 text-left">
          <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">Da</span>
          <span className="font-bold text-xs text-[var(--text-primary)] line-clamp-2">{origin}</span>
          <span className="font-mono text-xs text-[var(--accent-torii)] font-semibold block">{item.ora_partenza}</span>
        </div>

        {/* Center Arrow / Icon */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <Navigation className="w-4 h-4 text-amber-400 rotate-90" />
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">{'durata' in item ? item.durata || '' : ''}</span>
        </div>

        {/* Destination */}
        <div className="space-y-0.5 text-right">
          <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">A</span>
          <span className="font-bold text-xs text-[var(--text-primary)] line-clamp-2">{destination}</span>
          <span className="font-mono text-xs text-[var(--accent-torii)] font-semibold block">{item.ora_arrivo}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-[var(--text-secondary)]">
          <span>Avanzamento Tratta</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-torii)] via-[var(--accent-sakura)] to-[var(--accent-gold)] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Footer Taxi Action */}
      {onOpenTaxiCard && (
        <button
          type="button"
          onClick={onOpenTaxiCard}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-amber-300 transition shadow-lg"
        >
          <Car className="w-4 h-4" />
          <span>Mostra Indirizzo Taxi all'Arrivo</span>
        </button>
      )}
    </div>
  );
};
