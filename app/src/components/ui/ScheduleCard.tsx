import React, { useState } from 'react';
import { MapPin, Search, ExternalLink, Ticket, ChevronDown, ChevronUp } from 'lucide-react';
import { CopyableText } from './CopyableText';

export interface ScheduleItemProps {
  item: {
    ora: string;
    attivita: string;
    dettagli: string;
  };
  citta: string;
  isDefaultOpen?: boolean;
}

export const ScheduleCard: React.FC<ScheduleItemProps> = ({ item, citta, isDefaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(isDefaultOpen);

  const getCategoryBadge = (text: string) => {
    const lower = text.toLowerCase();
    if (
      lower.includes('cena') ||
      lower.includes('pranzo') ||
      lower.includes('cibo') ||
      lower.includes('bento') ||
      lower.includes('market') ||
      lower.includes('izakaya') ||
      lower.includes('ramen')
    ) {
      return { label: 'Cibo 🍜', isFood: true, bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
    }
    if (
      lower.includes('bus') ||
      lower.includes('volo') ||
      lower.includes('shinkansen') ||
      lower.includes('treno') ||
      lower.includes('metro') ||
      lower.includes('taxi')
    ) {
      return { label: 'Trasporto 🚌', isFood: false, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
    if (lower.includes('onsen') || lower.includes('terme') || lower.includes('bagno')) {
      return { label: 'Onsen ♨️', isFood: false, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    }
    if (lower.includes('odori') || lower.includes('matsuri') || lower.includes('notte bianca')) {
      return { label: 'Evento ⭐', isFood: false, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Cultura ⛩️', isFood: false, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  };

  const badge = getCategoryBadge(item.attivita);

  const getMapUrl = () => {
    if (citta.toLowerCase().includes('seoul')) {
      return `https://map.naver.com/v5/search/${encodeURIComponent(item.attivita)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.attivita + ' ' + citta)}`;
  };

  const getGoogleSearchUrl = () => {
    return `https://www.google.com/search?q=${encodeURIComponent(item.attivita + ' ' + citta)}`;
  };

  const getTabelogUrl = () => {
    return `https://tabelog.com/rstLst/?vs=1&sa=${encodeURIComponent(citta)}&sk=${encodeURIComponent(item.attivita)}`;
  };

  // Check if details contain ticket codes or PNRs
  const extractTicketCode = () => {
    const match = item.dettagli.match(/(Codice:\s*[\w-]+|Ticket ID:\s*[\w-]+|PNR:\s*[\w-]+)/i);
    return match ? match[0] : null;
  };

  const ticketCode = extractTicketCode();
  const isJapan = !citta.toLowerCase().includes('seoul');

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-md">
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-start justify-between gap-3 active:bg-slate-800/50 transition-colors"
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-amber-400">{item.ora}</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">{item.attivita}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{item.dettagli}</p>
        </div>

        <div className="p-1 rounded-lg bg-slate-800 text-slate-400 mt-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Actions Panel */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 bg-slate-950/80 border-t border-slate-800/80 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {/* Map Link */}
            <a
              href={getMapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mappa ({citta.includes('Seoul') ? 'Naver' : 'Google'})</span>
            </a>

            {/* Google SERP */}
            <a
              href={getGoogleSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95"
            >
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>Cerca Google</span>
            </a>
          </div>

          {/* Tabelog Link if Food in Japan */}
          {badge.isFood && isJapan && (
            <a
              href={getTabelogUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold rounded-xl border border-orange-500/30 flex items-center justify-center gap-2 text-xs transition-all active:scale-95"
            >
              <span>🍜 Cerca su Tabelog (&gt;3.5 score)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Copyable Ticket Code if Present */}
          {ticketCode && (
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Ticket className="w-4 h-4 text-purple-400" />
                <span>Biglietto / Codice:</span>
              </span>
              <CopyableText text={ticketCode} className="font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
