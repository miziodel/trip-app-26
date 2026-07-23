import React from 'react';
import { Plane, Train } from 'lucide-react';
import { parseTransitRoute } from '../../utils/transitUtils';

interface TransitCard3ColProps {
  tratta: string;
  orario: string;
  durata?: string;
  isVolo?: boolean;
  className?: string;
}

export const TransitCard3Col: React.FC<TransitCard3ColProps> = ({
  tratta,
  orario,
  durata,
  isVolo = false,
  className = '',
}) => {
  const route = parseTransitRoute(tratta, orario, durata);

  return (
    <div
      className={`grid grid-cols-3 items-center text-center py-3 px-3 my-2.5 bg-slate-950/60 rounded-2xl border border-[var(--border-subtle)] font-sans ${className}`}
    >
      {/* Left column: Origin City/Station + Departure time */}
      <div className="text-left font-sans min-w-0 pr-1">
        <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold tracking-wider">
          Partenza
        </span>
        <div className="text-sm font-extrabold text-white truncate" title={route.origin}>
          {route.origin}
        </div>
        <div className="text-xs font-mono font-bold text-torii mt-0.5">
          {route.depTime}
        </div>
      </div>

      {/* Center column: Travel Icon + Arrow icon + Duration */}
      <div className="flex flex-col items-center justify-center font-mono px-1">
        <div className="flex items-center gap-1 text-slate-400">
          {isVolo ? (
            <Plane className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <Train className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-xs text-slate-400">➔</span>
        </div>
        {route.duration && (
          <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full mt-1 border border-slate-700 whitespace-nowrap">
            {route.duration}
          </span>
        )}
      </div>

      {/* Right column: Destination City/Station + Arrival time */}
      <div className="text-right font-sans min-w-0 pl-1">
        <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold tracking-wider">
          Arrivo
        </span>
        <div className="text-sm font-extrabold text-white truncate" title={route.destination}>
          {route.destination}
        </div>
        <div className="text-xs font-mono font-bold text-torii mt-0.5">
          {route.arrTime}
        </div>
      </div>
    </div>
  );
};

export default TransitCard3Col;
