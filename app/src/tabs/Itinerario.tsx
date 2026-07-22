import React, { useState } from 'react';
import { useViaggioStore } from '../store/store';
import { ScheduleCard } from '../components/ui/ScheduleCard';
import { CopyableText } from '../components/ui/CopyableText';
import { formatDate } from '../utils/dateUtils';
import {
  Map,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Plane,
  Hotel,
  Car,
  Plus,
  X,
  CheckSquare,
  Square,
  Calendar,
} from 'lucide-react';

export const ItinerarioTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const setActiveTab = useViaggioStore((state) => state.setActiveTab);
  const setSelectedDay = useViaggioStore((state) => state.setSelectedDay);
  const openTaxiCard = useViaggioStore((state) => state.openTaxiCard);
  const userLogs = useViaggioStore((state) => state.userLogs);
  const userTodos = useViaggioStore((state) => state.userTodos);
  const updateTodo = useViaggioStore((state) => state.updateTodo);
  const customTodos = useViaggioStore((state) => state.customTodos);
  const addCustomTodo = useViaggioStore((state) => state.addCustomTodo);
  const removeCustomTodo = useViaggioStore((state) => state.removeCustomTodo);
  const showToast = useViaggioStore((state) => state.showToast);

  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('Tutti');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [customTodoInputs, setCustomTodoInputs] = useState<Record<number, string>>({});

  if (!data || !data.itinerario) return null;

  const cityFilters = ['Tutti', 'Seoul', 'Tokyo', 'Alpi Giapponesi', 'Osaka'];

  const filteredItinerario = data.itinerario.filter((giorno) => {
    if (selectedCityFilter === 'Tutti') return true;
    if (selectedCityFilter === 'Seoul') return giorno.citta.toLowerCase().includes('seoul');
    if (selectedCityFilter === 'Tokyo') return giorno.citta.toLowerCase().includes('tokyo');
    if (selectedCityFilter === 'Osaka') return giorno.citta.toLowerCase().includes('osaka');
    if (selectedCityFilter === 'Alpi Giapponesi') {
      const c = giorno.citta.toLowerCase();
      return c.includes('kanazawa') || c.includes('takayama') || c.includes('gujo');
    }
    return true;
  });

  const toggleAccordion = (giornoNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDays((prev) => ({
      ...prev,
      [giornoNum]: !prev[giornoNum],
    }));
  };

  const handleNavigateToOggi = (giornoNum: number) => {
    setSelectedDay(giornoNum);
    setActiveTab('oggi');
  };

  const handleAddCustomTodoForDay = async (giornoNum: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputVal = customTodoInputs[giornoNum] || '';
    if (!inputVal.trim()) return;
    await addCustomTodo(giornoNum, inputVal.trim());
    setCustomTodoInputs((prev) => ({ ...prev, [giornoNum]: '' }));
  };

  const handleExportTravelLog = () => {
    try {
      const exportObject = {
        meta: data.meta,
        exportDate: new Date().toISOString(),
        logs: userLogs,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `diario-di-viaggio-2026-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Diario di Viaggio esportato! 📥');
    } catch (err) {
      console.error('Failed to export travel log:', err);
      showToast('Errore durante l\'esportazione del diario');
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Header & Export Button */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-400" />
            <span>Itinerario Completo</span>
          </h2>
          <p className="text-xs text-slate-400">28 Luglio - 20 Agosto 2026</p>
        </div>

        <button
          type="button"
          onClick={handleExportTravelLog}
          className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 text-xs shadow transition-all active:scale-95"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Esporta</span>
        </button>
      </div>

      {/* City Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {cityFilters.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setSelectedCityFilter(city)}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCityFilter === city
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Accordion List for Days */}
      <div className="space-y-3">
        {filteredItinerario.map((giorno) => {
          const isExpanded = !!expandedDays[giorno.giorno];
          const isJapan = !giorno.citta.toLowerCase().includes('seoul') && !giorno.citta.toLowerCase().includes('roma');

          // Find flights for this day
          let dayFlights = data.trasporti.voli.filter((v) => v.data === giorno.data);

          // Giorno 0 special logic: include initial flight from day before (27 Luglio)
          if (giorno.giorno === 0) {
            const prevDayFlights = data.trasporti.voli.filter((v) => v.data === '2026-07-27');
            dayFlights = [...prevDayFlights, ...dayFlights];
          }

          // Find accommodation for this day
          const dayAccommodation = data.alloggi.find((h) => {
            return giorno.data >= h.check_in && giorno.data <= h.check_out;
          });

          // Todos for this day
          const dayTodos = userTodos[giorno.giorno] || giorno.todo_list.map((t) => t.fatto);
          const dayCustomTodos = customTodos[giorno.giorno] || [];

          return (
            <div
              key={giorno.giorno}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all"
            >
              {/* Accordion Header Bar - Clicking navigates to Oggi tab */}
              <div
                onClick={() => handleNavigateToOggi(giorno.giorno)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition-colors cursor-pointer"
              >
                <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      {giorno.fase}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-semibold text-slate-400">Giorno {giorno.giorno}</span>
                    <span className="text-xs text-slate-500">({formatDate(giorno.data)})</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug break-words">
                    {giorno.titolo}
                  </h3>
                  <span className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1 pt-0.5">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>Apri in Oggi ➔</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => toggleAccordion(giorno.giorno, e)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title={isExpanded ? 'Riduci' : 'Espandi'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Accordion Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-4 animate-in fade-in duration-200">
                  {/* Integrated Day Flights */}
                  {dayFlights.length > 0 && (
                    <div className="space-y-2">
                      {dayFlights.map((flight) => (
                        <div
                          key={flight.id}
                          className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-300 flex items-center gap-1.5">
                              <Plane className="w-4 h-4 text-blue-400" />
                              <span>
                                {flight.compagnia} ({flight.tratta})
                                {flight.data === '2026-07-27' && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-mono">
                                    Volo Ieri
                                  </span>
                                )}
                              </span>
                            </span>
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold text-[10px] border border-blue-500/30">
                              {flight.stato}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span>🕒 Orario: <strong className="text-white">{flight.orario}</strong></span>
                            <span>⏳ Durata: {flight.durata}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-blue-900/40">
                            <CopyableText text={flight.pnr} toastMessage="PNR copiato! 🎟️" className="text-blue-300 font-mono">
                              🎟️ PNR: <strong className="underline">{flight.pnr}</strong>
                            </CopyableText>

                            {flight.note && (
                              <span className="text-[11px] text-amber-300 italic">{flight.note}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Focus Culinario & Tabelog Finder */}
                  {giorno.focus_culinario && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400">🍜 Focus Culinario:</span>
                        {isJapan && (
                          <a
                            href={`https://tabelog.com/rstLst/?vs=1&sa=${encodeURIComponent(giorno.citta)}&sk=${encodeURIComponent(giorno.focus_culinario.split('(')[0])}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20"
                          >
                            <span>🍜 Cerca su Tabelog</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {giorno.focus_culinario}
                      </p>
                    </div>
                  )}

                  {/* Hourly Schedule Table using ScheduleCard */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tabella Oraria
                    </h4>
                    <div className="space-y-2">
                      {giorno.tabella_oraria.map((slot, sIdx) => (
                        <ScheduleCard
                          key={sIdx}
                          item={slot}
                          citta={giorno.citta}
                          giornoDate={giorno.data}
                          giornoIndex={giorno.giorno}
                          itemIndex={sIdx}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Integrated Overnight Accommodation */}
                  {dayAccommodation && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
                        <span className="flex items-center gap-1.5 font-bold text-slate-200">
                          <Hotel className="w-4 h-4 text-amber-400" />
                          <span>Alloggio Notturno ({dayAccommodation.citta})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openTaxiCard({
                              name: dayAccommodation.nome,
                              nameLocale: dayAccommodation.nome_locale,
                              addressLocale: dayAccommodation.indirizzo_locale,
                              addressEn: dayAccommodation.indirizzo_en,
                            })
                          }
                          className="py-1 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/30 flex items-center gap-1 text-[11px] transition-all"
                        >
                          <Car className="w-3 h-3" />
                          <span>🚗 Taxi Card</span>
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white">{dayAccommodation.nome}</h4>
                      <CopyableText text={dayAccommodation.indirizzo_locale} className="text-xs text-amber-300 font-mono block">
                        📍 {dayAccommodation.indirizzo_locale}
                      </CopyableText>
                    </div>
                  )}

                  {/* Todo & Custom Todo Section */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Checklist & Promemoria (Giorno {giorno.giorno})</span>
                    </h4>

                    {giorno.todo_list.length > 0 && (
                      <div className="space-y-1.5">
                        {giorno.todo_list.map((todo, idx) => {
                          const isChecked = dayTodos[idx] ?? todo.fatto;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => updateTodo(giorno.giorno, idx, !isChecked)}
                              className={`w-full text-left p-2.5 rounded-lg border flex items-start gap-2.5 transition-all text-xs ${
                                isChecked
                                  ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                                  : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                              )}
                              <span className="leading-relaxed">{todo.testo}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Custom Todos List */}
                    {dayCustomTodos.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider block">
                          Personalizzati:
                        </span>
                        {dayCustomTodos.map((todoText, cIdx) => (
                          <div
                            key={cIdx}
                            className="w-full p-2.5 rounded-lg border bg-slate-950/70 border-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="leading-relaxed flex-1 break-words">{todoText}</span>
                            <button
                              type="button"
                              onClick={() => removeCustomTodo(giorno.giorno, cIdx)}
                              className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex-shrink-0"
                              title="Rimuovi"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom Todo Input */}
                    <form
                      onSubmit={(e) => handleAddCustomTodoForDay(giorno.giorno, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={customTodoInputs[giorno.giorno] || ''}
                        onChange={(e) =>
                          setCustomTodoInputs((prev) => ({
                            ...prev,
                            [giorno.giorno]: e.target.value,
                          }))
                        }
                        placeholder="Aggiungi promemoria..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 text-xs whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Aggiungi</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItinerarioTab;
