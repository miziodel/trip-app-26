import React, { useState } from 'react';
import { useViaggioStore } from '../store/store';
import { ScheduleCard } from '../components/ui/ScheduleCard';
import { CopyableText } from '../components/ui/CopyableText';
import { HeroProgressCard } from '../components/ui/HeroProgressCard';
import { NightlyJournalCard } from '../components/ui/NightlyJournalCard';
import { CheckInCard } from '../components/ui/CheckInCard';
import { formatDate } from '../utils/dateUtils';
import { getMapDeepLink } from '../utils/linkUtils';
import { isTransitActiveNow, getTransitProgressPercent, getTransitEtaMinutes } from '../utils/transitUtils';
import type { Volo, Treno, Bus } from '../types/viaggio';
import {
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Clock,
  Utensils,
  Plus,
  Trash2,
  ExternalLink,
  Sun,
  Moon,
  MapPin,
  Car,
  Sparkles,
  Plane,
  Train,
  Ticket,
} from 'lucide-react';

const TYPE_DOT_COLORS: Record<string, string> = {
  trasporto: 'bg-sky-500',
  attivita: 'bg-emerald-500',
  pasto: 'bg-amber-500',
  alloggio: 'bg-purple-500',
  festival: 'bg-[var(--accent-torii)]',
  compito: 'bg-yellow-500',
  info: 'bg-slate-500',
};

export const OggiTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const selectedDay = useViaggioStore((state) => state.selectedDay);
  const setSelectedDay = useViaggioStore((state) => state.setSelectedDay);
  const openTaxiCard = useViaggioStore((state) => state.openTaxiCard);
  const userTodos = useViaggioStore((state) => state.userTodos);
  const updateTodo = useViaggioStore((state) => state.updateTodo);
  const customTodos = useViaggioStore((state) => state.customTodos);
  const addCustomTodo = useViaggioStore((state) => state.addCustomTodo);
  const removeCustomTodo = useViaggioStore((state) => state.removeCustomTodo);
  const dailyJournals = useViaggioStore((state) => state.dailyJournals);
  const updateJournal = useViaggioStore((state) => state.updateJournal);

  const checkIns = useViaggioStore((state) => state.checkIns);
  const openCheckInModal = useViaggioStore((state) => state.openCheckInModal);
  const deleteCheckIn = useViaggioStore((state) => state.deleteCheckIn);

  const [newTodoInput, setNewTodoInput] = useState<string>('');
  const [openCardIndexes, setOpenCardIndexes] = useState<Record<number, boolean>>({});

  if (!data || !data.itinerario) return null;

  const totalDays = data.itinerario.length;
  const currentDayData =
    data.itinerario.find((g) => g.giorno === selectedDay) || data.itinerario[0];

  const toggleCardIndex = (idx: number) => {
    setOpenCardIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Calculate active transits for current selected date only across Voli, Treni, and Bus
  const todayTransits: (Volo | Treno | Bus)[] = [
    ...(data.trasporti?.voli || []).filter((t) => t.data === currentDayData.data),
    ...(data.trasporti?.treni || []).filter((t) => t.data === currentDayData.data),
    ...(data.trasporti?.bus || []).filter((t) => t.data === currentDayData.data),
  ];

  const activeTransit = todayTransits.length > 0 ? todayTransits[0] : null;

  // Day specific sections calculations
  const dayFlights = (data.trasporti?.voli || []).filter((v) => v.data === currentDayData.data);
  const dayTransits = [
    ...(data.trasporti?.treni || []),
    ...(data.trasporti?.bus || []),
  ].filter((t) => t.data === currentDayData.data);
  const dayTickets = (data.biglietti || []).filter(
    (b) => b.data === currentDayData.data || b.giorno === currentDayData.giorno
  );

  const getPreviousDayDateStr = (dateStr: string): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const sleepAccommodation =
    data.alloggi.find(
      (h) => currentDayData.data >= h.check_in && currentDayData.data < h.check_out
    ) || data.alloggi[data.alloggi.length - 1];

  const prevDateStr = getPreviousDayDateStr(currentDayData.data);
  const wakeupAccommodation = data.alloggi.find(
    (h) => prevDateStr >= h.check_in && prevDateStr < h.check_out
  );

  const sameAccommodation = wakeupAccommodation?.id === sleepAccommodation?.id;

  const currentTodos =
    userTodos[currentDayData.giorno] || currentDayData.todo_list.map((t) => t.fatto);
  const customList = customTodos[currentDayData.giorno] || [];

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    await addCustomTodo(currentDayData.giorno, newTodoInput);
    setNewTodoInput('');
  };

  const getFoodItems = (): string[] => {
    if (!currentDayData.focus_culinario) return [];

    const match = currentDayData.focus_culinario.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1].split(/,|\+|\//).map((s) => s.trim()).filter(Boolean);
    }

    return currentDayData.focus_culinario
      .split(/,|\+|\/|da\s+/)
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.length > 2 &&
          !s.toLowerCase().startsWith('cena') &&
          !s.toLowerCase().startsWith('pranzo')
      );
  };

  const foodItems = getFoodItems();
  const isJapan = currentDayData.paese === 'JP' || (!currentDayData.citta.toLowerCase().includes('seoul') && !currentDayData.citta.toLowerCase().includes('roma'));

  // Kanji watermark based on current city
  const kanjiCityMap: Record<string, string> = {
    Tokyo: '東京',
    Seoul: '서울',
    Kyoto: '京都',
    Osaka: '大阪',
    Kanazawa: '金沢',
    Takayama: '高山',
    Gujo: '郡上',
    Hiroshima: '広島',
    Nara: '奈良',
    Hakone: '箱根',
  };
  const currentKanji = kanjiCityMap[currentDayData.citta] || '旅';

  const currentDayCheckIns = Object.values(checkIns || {}).filter((c) => c.giorno === currentDayData.giorno);

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-6 relative overflow-hidden font-sans">
      {/* Kanji Decorative Watermark Background */}
      <div className="kanji-watermark text-[180px] -right-10 top-12 text-[var(--text-primary)]">
        {currentKanji}
      </div>

      {/* EDITORIAL HEADER BANNER */}
      <div className="relative">
        <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold tracking-widest uppercase mb-2">
          <button
            type="button"
            onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
            disabled={selectedDay === 0}
            aria-label="Giorno precedente"
            className="min-w-[44px] min-h-[44px] -ml-2 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-center">
            <span className="text-[var(--text-primary)]">GIORNO {String(currentDayData.giorno).padStart(2, '0')}</span>
            <span className="text-[var(--text-secondary)]">•</span>
            <span className="text-[var(--text-secondary)]">{formatDate(currentDayData.data)}</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDay(Math.min(totalDays - 1, selectedDay + 1))}
            disabled={selectedDay === totalDays - 1}
            aria-label="Giorno successivo"
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight uppercase leading-none mb-1.5 font-outfit">
          {currentDayData.titolo}
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-noto tracking-wide">
          {currentDayData.fase}
          {!currentDayData.fase.toLowerCase().includes(currentDayData.citta.toLowerCase()) && (
            <span> • Tappa a {currentDayData.citta}</span>
          )}
        </p>
      </div>

      {/* HERO PROGRESS CARD FOR ACTIVE TRANSIT */}
      {activeTransit && isTransitActiveNow(activeTransit) && (
        <HeroProgressCard
          item={activeTransit}
          progressPercent={getTransitProgressPercent(activeTransit)}
          etaMinutes={getTransitEtaMinutes(activeTransit)}
          onCopyPnr={(pnr) => {
            if (navigator.clipboard) navigator.clipboard.writeText(pnr);
          }}
          onOpenTaxiCard={() =>
            sleepAccommodation &&
            openTaxiCard({
              name: sleepAccommodation.nome,
              nameLocale: sleepAccommodation.nome_locale,
              addressLocale: sleepAccommodation.indirizzo_locale,
              addressEn: sleepAccommodation.indirizzo_en,
            })
          }
        />
      )}

      {/* 1. Voli del Giorno */}
      {dayFlights.length > 0 && (
        <div className="space-y-2">
          {dayFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-[var(--bg-card)] border border-[var(--accent-torii)]/40 text-[var(--text-primary)] rounded-xl p-3 space-y-2 text-xs shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-[var(--accent-torii)]" />
                  <span>
                    {flight.compagnia} {flight.numero_volo} ({flight.citta_partenza} → {flight.citta_arrivo})
                  </span>
                </span>
                <span className="px-2 py-0.5 bg-[var(--accent-torii)] text-white rounded font-bold text-[10px]">
                  {flight.stato}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)] font-medium">
                <span>🕒 Orario: <strong className="text-[var(--text-primary)] font-extrabold">{flight.ora_partenza} → {flight.ora_arrivo}</strong></span>
                <span>⏳ Durata: <strong className="text-[var(--text-primary)] font-bold">{flight.durata}</strong></span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--accent-torii)]/20">
                <CopyableText text={flight.pnr} toastMessage="PNR copiato! 🎟️" className="text-[var(--text-primary)] font-mono font-bold">
                  🎟️ PNR: <strong className="underline text-[var(--text-primary)] font-extrabold">{flight.pnr}</strong>
                </CopyableText>

                {flight.note && (
                  <span className="text-[11px] text-[var(--text-secondary)] italic">{flight.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Treni & Bus del Giorno */}
      {dayTransits.length > 0 && (
        <div className="space-y-2">
          {dayTransits.map((transit) => {
            const isTrain = 'mezzo' in transit;
            const mezzoName = isTrain ? (transit as Treno).mezzo : (transit as Bus).vettore;
            const depStation = transit.stazione_partenza;
            const arrStation = transit.stazione_arrivo;
            const seats = transit.posti?.join(', ');

            return (
              <div
                key={transit.id}
                className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>
                      {mezzoName} ({depStation} → {arrStation})
                    </span>
                  </span>
                  {'durata' in transit && transit.durata && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-semibold text-[10px] border border-amber-500/30">
                      {transit.durata}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>🕒 Orario: <strong className="text-[var(--text-primary)]">{transit.ora_partenza} → {transit.ora_arrivo}</strong></span>
                  {seats && <span>💺 Posti: <strong className="text-[var(--text-primary)]">{seats}</strong></span>}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 flex-wrap gap-2">
                  {'pnr' in transit && transit.pnr && (
                    <CopyableText text={transit.pnr} toastMessage="PNR copiato! 🎟️" className="text-amber-700 dark:text-amber-300 font-mono">
                      🎟️ PNR: <strong className="underline">{transit.pnr}</strong>
                    </CopyableText>
                  )}
                  {isTrain && (transit as Treno).codice_ritiro && (
                    <CopyableText text={(transit as Treno).codice_ritiro!} toastMessage="Codice ritiro copiato!" className="text-amber-700 dark:text-amber-300 font-mono">
                      🔑 Ritiro: <strong className="underline">{(transit as Treno).codice_ritiro}</strong>
                    </CopyableText>
                  )}
                  {transit.note && (
                    <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 italic">{transit.note}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Biglietti del Giorno */}
      {dayTickets.length > 0 && (
        <div className="space-y-2">
          {dayTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {ticket.nome} {ticket.nome_locale && `(${ticket.nome_locale})`}
                  </span>
                </span>
                {ticket.ora_ingresso && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-semibold text-[10px] border border-emerald-500/30">
                    🕒 {ticket.ora_ingresso}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20">
                <CopyableText text={ticket.codice} toastMessage="Codice biglietto copiato! 🎟️" className="text-emerald-700 dark:text-emerald-300 font-mono">
                  🎟️ Codice: <strong className="underline">{ticket.codice}</strong>
                </CopyableText>

                {ticket.note && (
                  <span className="text-[11px] text-emerald-700/80 dark:text-emerald-200/80 italic">{ticket.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Focus Culinario del Giorno */}
      {currentDayData.focus_culinario && (
        <div className="editorial-card p-4 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-torii/15 text-torii border border-torii/30 flex-shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold text-torii uppercase tracking-wider">
                Focus Culinario 🍜
              </h4>
            </div>

            {isJapan && (
              <a
                href={`https://tabelog.com/rstLst/?vs=1&sa=${encodeURIComponent(currentDayData.citta)}&sk=${encodeURIComponent(currentDayData.focus_culinario.split('(')[0])}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20"
              >
                <span>🍜 Cerca su Tabelog</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <p className="text-xs text-[var(--text-primary)] font-semibold leading-snug font-sans">
            {currentDayData.focus_culinario}
          </p>

          {foodItems.length > 0 && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider block">
                📸 Guarda foto cibo su Google:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {foodItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={`https://www.google.com/search?q=${encodeURIComponent(item)}+food&tbm=isch`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-torii/10 hover:bg-torii/20 text-torii px-2.5 py-1 rounded-full border border-torii/30 transition-all active:scale-95"
                  >
                    <span>{item}</span>
                    <ExternalLink className="w-3 h-3 text-torii" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WAKEUP HOTEL CARD (IF DIFFERENT) */}
      {!sameAccommodation && wakeupAccommodation && (
        <div className="editorial-card p-4 space-y-2.5 shadow-lg border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between text-xs border-b border-[var(--border-subtle)] pb-2 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4" />
              <span>🌅 Sveglia a ({wakeupAccommodation.citta})</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{wakeupAccommodation.stazione}</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 font-sans">
              <span>{wakeupAccommodation.nome}</span>
              {wakeupAccommodation.nome_locale && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-noto font-normal">({wakeupAccommodation.nome_locale})</span>
              )}
            </h4>
            <CopyableText text={wakeupAccommodation.indirizzo_locale} className="text-xs text-amber-600 dark:text-amber-400 font-noto block">
              📍 {wakeupAccommodation.indirizzo_locale}
            </CopyableText>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
            <a
              href={getMapDeepLink(wakeupAccommodation.indirizzo_locale, wakeupAccommodation.citta)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] shadow-sm transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Mappa</span>
            </a>

            <button
              type="button"
              onClick={() =>
                openTaxiCard({
                  name: wakeupAccommodation.nome,
                  nameLocale: wakeupAccommodation.nome_locale,
                  addressLocale: wakeupAccommodation.indirizzo_locale,
                  addressEn: wakeupAccommodation.indirizzo_en,
                })
              }
              className="py-2 bg-torii/20 hover:bg-torii/30 text-torii font-bold rounded-xl text-xs border border-torii/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Taxi Card</span>
            </button>
          </div>
        </div>
      )}

      {/* DAILY TIMELINE SCHEDULE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 font-mono">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-gold" />
            <span>Programma del Giorno</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            {currentDayData.tabella_oraria.length} Attività
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[var(--border-strong)]">
          {currentDayData.tabella_oraria.map((item, idx) => {
            const itemKey = `${currentDayData.giorno}-${idx}`;
            return (
              <div key={idx} className="timeline-item relative pl-9">
                <div
                  className={`absolute left-1.5 top-4 w-4 h-4 rounded-full ${
                    TYPE_DOT_COLORS[item.tipo] || 'bg-[var(--accent-torii)]'
                  } border-4 border-[var(--bg-primary)] z-10`}
                />
                <ScheduleCard
                  item={item}
                  index={idx}
                  isOpen={!!openCardIndexes[idx]}
                  onToggle={() => toggleCardIndex(idx)}
                  onOpenTaxiCard={(name, address, nameLocale) =>
                    openTaxiCard({
                      name,
                      addressEn: address,
                      nameLocale,
                      addressLocale: address
                    })
                  }
                  onCheckIn={(locationName) =>
                    openCheckInModal({
                      defaultLocationName: locationName || item.luogo_nome || item.attivita,
                      defaultGiorno: currentDayData.giorno,
                      scheduleItemId: itemKey,
                    })
                  }
                  currentCity={currentDayData.citta}
                  countryContext={currentDayData.paese}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* CHECK-IN CARDS DEL GIORNO */}
      {currentDayCheckIns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 font-mono">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-torii" />
              <span>Check-in Registrati ({currentDayCheckIns.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {currentDayCheckIns.map((c) => (
              <CheckInCard key={c.id} checkIn={c} onDelete={deleteCheckIn} />
            ))}
          </div>
        </div>
      )}

      {/* DAILY CHECKLIST / TODO */}
      <div className="editorial-card p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 font-mono uppercase tracking-wider">
          <CheckSquare className="w-4 h-4 text-bamboo" />
          <span>
            Checklist ({currentTodos.filter(Boolean).length}/{currentDayData.todo_list.length})
          </span>
        </h3>

        <div className="space-y-2 font-sans">
          {currentDayData.todo_list.map((todo, idx) => {
            const isChecked = currentTodos[idx] ?? todo.fatto;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => updateTodo(currentDayData.giorno, idx, !isChecked)}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all ${
                  isChecked
                    ? 'bg-bamboo/10 border-bamboo/30 text-[var(--text-muted)] line-through'
                    : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-torii/40'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-bamboo flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                )}
                <span className="text-xs font-medium leading-relaxed">{todo.testo}</span>
              </button>
            );
          })}

          {customList.map((customItem, cIdx) => (
            <div
              key={cIdx}
              className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-between text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                {customItem}
              </span>
              <button
                type="button"
                onClick={() => removeCustomTodo(currentDayData.giorno, cIdx)}
                className="p-1 text-[var(--text-muted)] hover:text-torii"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <form onSubmit={handleAddTodo} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="+ Aggiungi nota o promemoria..."
              value={newTodoInput}
              onChange={(e) => setNewTodoInput(e.target.value)}
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-torii font-sans"
            />
            <button
              type="submit"
              className="px-3.5 py-2.5 bg-torii hover:bg-torii/90 text-white font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-torii/20"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi</span>
            </button>
          </form>
        </div>
      </div>

      {/* NIGHTLY JOURNAL CARD */}
      <NightlyJournalCard
        giorno={currentDayData.giorno}
        date={currentDayData.data}
        journal={dailyJournals[currentDayData.giorno]}
        onUpdate={updateJournal}
      />

      {/* SLEEP ACCOMMODATION CARD */}
      {sleepAccommodation && (
        <div className="editorial-card p-4 space-y-2.5 shadow-lg border-l-4 border-l-sakura">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-sakura">
              <Moon className="w-4 h-4" />
              <span>🌙 Pernottamento ({sleepAccommodation.citta})</span>
            </span>
            <span className="px-2 py-0.5 bg-[var(--bg-primary)] text-gold font-semibold rounded text-[10px]">
              {sleepAccommodation.stato_pagamento}
            </span>
          </div>

          <div className="space-y-1 font-sans">
            <h4 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>{sleepAccommodation.nome}</span>
              {sleepAccommodation.nome_locale && (
                <span className="text-xs text-sakura font-noto font-normal">({sleepAccommodation.nome_locale})</span>
              )}
            </h4>

            <div className="text-xs space-y-1">
              <CopyableText text={sleepAccommodation.indirizzo_locale} className="text-gold font-noto block">
                📍 {sleepAccommodation.indirizzo_locale}
              </CopyableText>
              <p className="text-[var(--text-secondary)]">EN: {sleepAccommodation.indirizzo_en}</p>
              <p className="text-[var(--text-secondary)] font-mono">🚉 Stazione: {sleepAccommodation.stazione}</p>
            </div>
          </div>

          {sleepAccommodation.note && (
            <p className="text-[11px] bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] mt-1 font-sans">
              💡 {sleepAccommodation.note}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
            <a
              href={getMapDeepLink(sleepAccommodation.indirizzo_locale, sleepAccommodation.citta)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] shadow-sm transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>Mappa</span>
            </a>

            <button
              type="button"
              onClick={() =>
                openTaxiCard({
                  name: sleepAccommodation.nome,
                  nameLocale: sleepAccommodation.nome_locale,
                  addressLocale: sleepAccommodation.indirizzo_locale,
                  addressEn: sleepAccommodation.indirizzo_en,
                })
              }
              className="py-2.5 bg-torii/20 hover:bg-torii/30 text-torii font-bold rounded-xl text-xs border border-torii/30 shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Taxi Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OggiTab;
