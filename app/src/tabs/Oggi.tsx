import React, { useState } from 'react';
import { useViaggioStore } from '../store/store';
import { ScheduleCard } from '../components/ui/ScheduleCard';
import { CopyableText } from '../components/ui/CopyableText';
import { formatDate } from '../utils/dateUtils';
import { getMapDeepLink } from '../utils/linkUtils';
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
} from 'lucide-react';

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

  const [newTodoInput, setNewTodoInput] = useState<string>('');

  if (!data || !data.itinerario) return null;

  const totalDays = data.itinerario.length;
  const currentDayData = data.itinerario.find((g) => g.giorno === selectedDay) || data.itinerario[0];

  // Helper to subtract 1 day from ISO string
  const getPreviousDayDateStr = (dateStr: string): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // Sleep accommodation: night of date D (check_in <= D < check_out)
  const sleepAccommodation = data.alloggi.find(
    (h) => currentDayData.data >= h.check_in && currentDayData.data < h.check_out
  ) || data.alloggi[data.alloggi.length - 1];

  // Wakeup accommodation: night of date D-1 (check_in <= D-1 < check_out)
  const prevDateStr = getPreviousDayDateStr(currentDayData.data);
  const wakeupAccommodation = data.alloggi.find(
    (h) => prevDateStr >= h.check_in && prevDateStr < h.check_out
  );

  const sameAccommodation = wakeupAccommodation?.id === sleepAccommodation?.id;

  const currentTodos = userTodos[currentDayData.giorno] || currentDayData.todo_list.map((t) => t.fatto);
  const customList = customTodos[currentDayData.giorno] || [];

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    await addCustomTodo(currentDayData.giorno, newTodoInput);
    setNewTodoInput('');
  };

  // Extract food items for Google Search Photos links
  const getFoodItems = (): string[] => {
    if (currentDayData.focus_culinario_items && currentDayData.focus_culinario_items.length > 0) {
      return currentDayData.focus_culinario_items;
    }
    if (!currentDayData.focus_culinario) return [];

    const match = currentDayData.focus_culinario.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1].split(/,|\+|\//).map((s) => s.trim()).filter(Boolean);
    }

    return currentDayData.focus_culinario
      .split(/,|\+|\/|da\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && !s.toLowerCase().startsWith('cena') && !s.toLowerCase().startsWith('pranzo'));
  };

  const foodItems = getFoodItems();

  // Find index of item closest to current time (if today)
  const now = new Date();
  const currentHour = now.getHours();
  let defaultOpenIndex = 0;
  if (currentDayData.tabella_oraria.length > 0) {
    const found = currentDayData.tabella_oraria.findIndex((item) => {
      const startHour = parseInt(item.ora.split(':')[0], 10);
      return !isNaN(startHour) && startHour >= currentHour;
    });
    if (found !== -1) defaultOpenIndex = found;
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Day Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
          disabled={selectedDay === 0}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>{currentDayData.fase}</span>
            <span>•</span>
            <span>Giorno {currentDayData.giorno}</span>
          </div>
          <h2 className="text-lg font-black text-white">{formatDate(currentDayData.data)}</h2>
          <p className="text-xs text-slate-400 font-medium">{currentDayData.titolo}</p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDay(Math.min(totalDays - 1, selectedDay + 1))}
          disabled={selectedDay === totalDays - 1}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 1. FIRST ITEM OF THE DAY: WAKEUP ACCOMMODATION (If different from sleep hotel) */}
      {!sameAccommodation && wakeupAccommodation && (
        <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>🌅 Sveglia a ({wakeupAccommodation.citta})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{wakeupAccommodation.stazione}</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{wakeupAccommodation.nome}</span>
              {wakeupAccommodation.nome_locale && (
                <span className="text-xs text-amber-300 font-normal font-mono">({wakeupAccommodation.nome_locale})</span>
              )}
            </h4>
            <CopyableText text={wakeupAccommodation.indirizzo_locale} className="text-xs text-amber-300 font-mono block">
              📍 {wakeupAccommodation.indirizzo_locale}
            </CopyableText>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={getMapDeepLink(wakeupAccommodation.indirizzo_locale, wakeupAccommodation.citta)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700 transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
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
              className="py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Taxi Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Culinary Focus Box with Google Image Links */}
      {currentDayData.focus_culinario && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex-shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Focus Culinario 🍜
              </h4>
              <p className="text-sm text-slate-200 font-medium leading-snug">
                {currentDayData.focus_culinario}
              </p>
            </div>
          </div>

          {/* Photo Search Links */}
          {foodItems.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                📸 Guarda foto cibo su Google:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {foodItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={`https://www.google.com/search?q=${encodeURIComponent(item)}+food&tbm=isch`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 px-2.5 py-1 rounded-lg border border-orange-500/30 transition-all active:scale-95"
                  >
                    <span>{item}</span>
                    <ExternalLink className="w-3 h-3 text-orange-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Schedule list with Expandable Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Programma della Giornata ({currentDayData.tabella_oraria.length} attività)</span>
        </h3>

        <div className="space-y-2.5">
          {currentDayData.tabella_oraria.map((item, idx) => (
            <ScheduleCard
              key={idx}
              item={item}
              citta={currentDayData.citta}
              giornoDate={currentDayData.data}
              giornoIndex={currentDayData.giorno}
              itemIndex={idx}
              isDefaultOpen={idx === defaultOpenIndex}
            />
          ))}
        </div>
      </div>

      {/* Daily Checklist / Todo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <CheckSquare className="w-4 h-4 text-amber-400" />
          <span>
            Checklist & Promemoria ({currentTodos.filter(Boolean).length}/{currentDayData.todo_list.length})
          </span>
        </h3>

        <div className="space-y-2">
          {/* Base JSON todos */}
          {currentDayData.todo_list.map((todo, idx) => {
            const isChecked = currentTodos[idx] ?? todo.fatto;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => updateTodo(currentDayData.giorno, idx, !isChecked)}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                    : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-xs font-medium leading-relaxed">{todo.testo}</span>
              </button>
            );
          })}

          {/* Custom local user todos */}
          {customList.map((customItem, cIdx) => (
            <div
              key={cIdx}
              className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 text-amber-200 flex items-center justify-between text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">★</span>
                {customItem}
              </span>
              <button
                type="button"
                onClick={() => removeCustomTodo(currentDayData.giorno, cIdx)}
                className="p-1 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add custom todo input */}
          <form onSubmit={handleAddTodo} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="+ Aggiungi nota o promemoria..."
              value={newTodoInput}
              onChange={(e) => setNewTodoInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi</span>
            </button>
          </form>
        </div>
      </div>

      {/* LAST ITEM OF THE DAY: SLEEP ACCOMMODATION */}
      {sleepAccommodation && (
        <div className="bg-gradient-to-r from-slate-900 to-purple-950/30 border border-purple-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-purple-300">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>🌙 Pernottamento ({sleepAccommodation.citta})</span>
            </span>
            <span className="px-2 py-0.5 bg-slate-800 text-amber-400 font-semibold rounded text-[10px]">
              {sleepAccommodation.stato_pagamento}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{sleepAccommodation.nome}</span>
              {sleepAccommodation.nome_locale && (
                <span className="text-xs text-purple-300 font-normal font-mono">({sleepAccommodation.nome_locale})</span>
              )}
            </h4>

            <div className="text-xs space-y-1">
              <CopyableText text={sleepAccommodation.indirizzo_locale} className="text-amber-300 font-mono block">
                📍 {sleepAccommodation.indirizzo_locale}
              </CopyableText>
              <p className="text-slate-400">EN: {sleepAccommodation.indirizzo_en}</p>
              <p className="text-slate-400">🚉 Stazione: {sleepAccommodation.stazione}</p>
            </div>
          </div>

          {sleepAccommodation.note && (
            <p className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 mt-1">
              💡 {sleepAccommodation.note}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={getMapDeepLink(sleepAccommodation.indirizzo_locale, sleepAccommodation.citta)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700 transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
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
              className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 shadow transition-all active:scale-95 flex items-center justify-center gap-1"
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
