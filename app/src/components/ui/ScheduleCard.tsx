import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MapPin, ExternalLink } from 'lucide-react';
import type { ItemOrario, Paese, TipoAttivita } from '../../types/viaggio';
import { formatMapQuery } from '../../utils/linkUtils';

interface ScheduleCardProps {
  item: ItemOrario;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onOpenTaxiCard?: (name: string, address: string, nameLocale?: string) => void;
  onCheckIn?: (locationName?: string) => void;
  currentCity?: string;
  countryContext?: Paese;
}

export const TIMELINE_DOT_COLORS: Record<TipoAttivita, string> = {
  trasporto: 'bg-sky-500',
  pasto: 'bg-amber-500',
  festival: 'bg-[var(--accent-torii)]',
  alloggio: 'bg-purple-500',
  compito: 'bg-yellow-500',
  attivita: 'bg-emerald-500',
  info: 'bg-slate-500'
};

const TYPE_BADGES: Record<TipoAttivita, { label: string; icon: string; bg: string }> = {
  trasporto: { label: 'Trasporto', icon: '🚄', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  attivita: { label: 'Visita', icon: '📍', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  pasto: { label: 'Pasto', icon: '🍜', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  alloggio: { label: 'Hotel', icon: '🏨', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  festival: { label: 'Event', icon: '🎏', bg: 'bg-[var(--accent-torii)]/20 text-[var(--accent-torii)] border-[var(--accent-torii)]/30' },
  compito: { label: 'Task', icon: '⚡', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  info: { label: 'Info', icon: 'ℹ️', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  isOpen: propIsOpen,
  onToggle,
  onOpenTaxiCard,
  onCheckIn,
  currentCity,
  countryContext
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(propIsOpen ?? false);

  useEffect(() => {
    setInternalIsOpen(propIsOpen ?? false);
  }, [propIsOpen]);

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
    setInternalIsOpen((prev) => !prev);
  };

  const isKorea = countryContext === 'KR' || item.maps_provider === 'naver' || currentCity?.toLowerCase().includes('seoul') || currentCity?.toLowerCase().includes('busan');
  const badgeInfo = TYPE_BADGES[item.tipo] || TYPE_BADGES.attivita;
  const dotColor = TIMELINE_DOT_COLORS[item.tipo] || 'bg-slate-500';

  const mapQuery = item.maps_query || item.luogo_nome || item.attivita;
  const fullQuery = formatMapQuery(mapQuery, currentCity);
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(formatMapQuery(item.maps_query || item.luogo_nome_locale || mapQuery, currentCity))}`;

  return (
    <div className="editorial-card rounded-2xl p-4 transition-all border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      {/* Header - 3-row layout inside clickable wrapper */}
      <div 
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick(e as any);
          }
        }}
        className="cursor-pointer select-none w-full flex flex-col gap-1.5"
      >
        {/* Riga 1: Pallino colorato + Orario + Tag tipo badge + (Reaction & Chevron) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
            <span className="font-mono text-base font-bold text-[var(--accent-bamboo)] shrink-0">
              {item.ora}
              {item.ora_fine && <span className="text-xs text-[var(--text-muted)] font-normal"> - {item.ora_fine}</span>}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${badgeInfo.bg} font-medium inline-flex items-center gap-1 shrink-0`}>
              <span>{badgeInfo.icon}</span>
              <span>{badgeInfo.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1">
              {internalIsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Riga 2: Titolo dell'item ed eventuale nome in lingua locale */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">
            {item.attivita}
          </h3>
          {item.luogo_nome_locale && (
            <span className="text-xs font-noto text-[var(--text-secondary)] opacity-90">
              {item.luogo_nome_locale}
            </span>
          )}
        </div>

        {/* Riga 3: Descrizione dell'item visibile sempre */}
        {item.dettagli && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
            {item.dettagli}
          </p>
        )}
      </div>

      {/* Sezione Espansa (visibile SOLO se internalIsOpen === true) */}
      {internalIsOpen && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-3">
          {item.costo_stimato && (
            <div className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1.5 rounded-lg border border-amber-400/20 inline-block">
              💰 Costo: {item.costo_stimato}
            </div>
          )}

          {item.prenotazione && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1.5 rounded-lg border border-emerald-400/20 flex items-center justify-between">
              <span>🎟️ Codice: {item.prenotazione.codice}</span>
              {item.prenotazione.note && <span className="text-[10px] opacity-80">{item.prenotazione.note}</span>}
            </div>
          )}

          {/* Action buttons with Google Maps, Naver Maps, Check-in & Taxi Card */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {onCheckIn && (
              <button
                type="button"
                onClick={() => onCheckIn(item.luogo_nome || item.attivita)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-torii text-white hover:bg-torii/90 transition shadow-sm min-h-[36px]"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>📍 Check-in</span>
              </button>
            )}

            <a
              href={googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 border border-sky-500/30 transition shadow-sm min-h-[36px]"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {isKorea && (
              <a
                href={naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition shadow-sm min-h-[36px]"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Naver Maps</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {item.tabelog_url && (
              <a
                href={item.tabelog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/20 border border-orange-500/30 transition min-h-[36px]"
              >
                <span>🍊 Tabelog</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {onOpenTaxiCard && (item.luogo_nome_locale || item.indirizzo_locale) && (
              <button
                type="button"
                onClick={() => onOpenTaxiCard(item.luogo_nome || item.attivita, item.indirizzo_locale || '', item.luogo_nome_locale)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition min-h-[36px]"
              >
                🚕 Taxi Card
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
