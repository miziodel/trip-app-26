import React, { useState } from 'react';
import { MapPin, Search, ExternalLink, Ticket, ChevronDown, ChevronUp, Sparkles, Navigation } from 'lucide-react';
import { CopyableText } from './CopyableText';
import { getMapDeepLink } from '../../utils/linkUtils';
import { useViaggioStore } from '../../store/store';
import rawInsights from '../../data/insights.json';

interface InsightData {
  tip?: string;
  info?: string;
}

const insights: Record<string, InsightData> = rawInsights as Record<string, InsightData>;

export interface ScheduleItemProps {
  item: {
    ora: string;
    attivita: string;
    dettagli: string;
    tipo_luogo?: 'coperto' | 'aperto' | 'misto';
  };
  citta: string;
  giornoDate?: string;
  giornoIndex?: number;
  itemIndex?: number;
  isDefaultOpen?: boolean;
}

export const ScheduleCard: React.FC<ScheduleItemProps> = ({
  item,
  citta,
  giornoDate = '',
  giornoIndex = 0,
  itemIndex = 0,
  isDefaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(isDefaultOpen);

  const userLogs = useViaggioStore((state) => state.userLogs);
  const updateLog = useViaggioStore((state) => state.updateLog);

  const itemLogKey = `item_${giornoIndex}_${itemIndex}`;
  const currentItemLog = userLogs[itemLogKey] || {};

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
      return { label: 'Cibo 🍜', isFood: true, isTransport: false, bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
    }
    if (
      lower.includes('bus') ||
      lower.includes('volo') ||
      lower.includes('shinkansen') ||
      lower.includes('treno') ||
      lower.includes('metro') ||
      lower.includes('taxi')
    ) {
      return { label: 'Trasporto 🚌', isFood: false, isTransport: true, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
    if (lower.includes('onsen') || lower.includes('terme') || lower.includes('bagno')) {
      return { label: 'Onsen ♨️', isFood: false, isTransport: false, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    }
    if (lower.includes('odori') || lower.includes('matsuri') || lower.includes('notte bianca')) {
      return { label: 'Evento ⭐', isFood: false, isTransport: false, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Cultura ⛩️', isFood: false, isTransport: false, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  };

  const getLocationTypeBadge = (tipo?: 'coperto' | 'aperto' | 'misto') => {
    if (tipo === 'coperto') {
      return { label: '🏢 Coperto', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
    }
    if (tipo === 'aperto') {
      return { label: '☀️ All\'aperto', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    if (tipo === 'misto') {
      return { label: '🌤️ Misto', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    }
    return null;
  };

  const badge = getCategoryBadge(item.attivita);
  const locationBadge = getLocationTypeBadge(item.tipo_luogo);

  const getMapUrl = () => {
    return getMapDeepLink(item.attivita, citta);
  };

  const getRouteMapUrl = () => {
    if (citta.toLowerCase().includes('seoul')) {
      return `https://map.naver.com/v5/search/${encodeURIComponent(item.attivita)}`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(citta)}&destination=${encodeURIComponent(item.attivita)}`;
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

  // Check if offline insight exists for this item
  const insightKey = `${giornoDate}_${item.attivita}`;
  const itemInsight = insights[insightKey];

  const handleReaction = (reaction: string) => {
    const newReaction = currentItemLog.reaction === reaction ? undefined : reaction;
    updateLog(itemLogKey, newReaction, currentItemLog.note);
  };

  const reactionsList = [
    { key: '❤️', label: 'Love' },
    { key: '👍', label: 'Like' },
    { key: '😐', label: 'Okay' },
    { key: '👎', label: 'Dislike' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-md">
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-start justify-between gap-3 active:bg-slate-800/50 transition-colors"
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">{item.ora}</span>
              {currentItemLog.reaction && (
                <span className="text-xs bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {currentItemLog.reaction}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {locationBadge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${locationBadge.bg}`}>
                  {locationBadge.label}
                </span>
              )}
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
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
          {/* Map Link / Transport Menu */}
          {badge.isTransport ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>📍 Destinazione</span>
                </a>

                <a
                  href={getRouteMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold rounded-xl border border-blue-500/30 flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>🗺️ Itinerario</span>
                </a>
              </div>
            </div>
          ) : (
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
          )}

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

          {/* Offline Insight Box */}
          {itemInsight && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Insight Utile:</span>
              </div>
              {itemInsight.tip && <p className="text-slate-200 leading-relaxed">💡 {itemInsight.tip}</p>}
              {itemInsight.info && <p className="text-slate-300 leading-relaxed">📌 {itemInsight.info}</p>}
            </div>
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

          {/* Item 1-Tap Reaction */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Feedback item:</span>
            <div className="flex items-center gap-1.5">
              {reactionsList.map((r) => {
                const isSelected = currentItemLog.reaction === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleReaction(r.key)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 scale-110 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                    title={r.label}
                  >
                    <span>{r.key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
