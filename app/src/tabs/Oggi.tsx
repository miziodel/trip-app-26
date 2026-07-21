import React, { useState } from 'react';
import { useViaggioStore } from '../store/store';
import { ScheduleCard } from '../components/ui/ScheduleCard';
import { CopyableText } from '../components/ui/CopyableText';
import {
  ChevronLeft,
  ChevronRight,
  CloudRain,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  Utensils,
  Hotel,
  Plus,
  Trash2,
} from 'lucide-react';

export const OggiTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const selectedDay = useViaggioStore((state) => state.selectedDay);
  const setSelectedDay = useViaggioStore((state) => state.setSelectedDay);
  const showRainPlan = useViaggioStore((state) => state.showRainPlan);
  const toggleRainPlan = useViaggioStore((state) => state.toggleRainPlan);
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

  // Find accommodation for selected day
  const dayAccommodation = data.alloggi.find((h) => {
    return currentDayData.data >= h.check_in && currentDayData.data <= h.check_out;
  }) || data.alloggi[0];

  const currentTodos = userTodos[currentDayData.giorno] || currentDayData.todo_list.map((t) => t.fatto);
  const customList = customTodos[currentDayData.giorno] || [];

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    await addCustomTodo(currentDayData.giorno, newTodoInput);
    setNewTodoInput('');
  };

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
          <h2 className="text-lg font-black text-white">{currentDayData.data}</h2>
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

      {/* Culinary Focus Box */}
      {currentDayData.focus_culinario && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-md">
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
      )}

      {/* Rain Plan / Heatwave Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className={`w-5 h-5 ${showRainPlan ? 'text-blue-400' : 'text-slate-400'}`} />
            <div>
              <h3 className="text-sm font-bold text-white">Piano Pioggia / Caldo ☔</h3>
              <p className="text-[11px] text-slate-400">Rifugi al coperto e aria condizionata</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleRainPlan}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              showRainPlan ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                showRainPlan ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {showRainPlan && (
          <div className="bg-blue-950/40 border border-blue-800/60 p-3 rounded-xl text-xs text-blue-200 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <Sparkles className="w-4 h-4" />
              <span>Consigli anti-pioggia/caldo per {currentDayData.citta}:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Usa i centri commerciali sotterranei (Depachika / Shotengai coperti).</li>
              <li>Mantieni idratazione costante con integratori Pocari Sweat da 7-Eleven.</li>
              <li>Musei e concept store climatizzati (The Hyundai, teamLab, Mori Art Museum).</li>
            </ul>
          </div>
        )}
      </div>

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

      {/* Current Accommodation Info */}
      {dayAccommodation && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Hotel className="w-4 h-4 text-amber-400" />
              <span>Alloggio Notturno ({dayAccommodation.citta})</span>
            </span>
            <span className="px-2 py-0.5 bg-slate-800 text-amber-400 font-semibold rounded text-[10px]">
              {dayAccommodation.stato_pagamento}
            </span>
          </div>

          <h4 className="text-base font-bold text-white">{dayAccommodation.nome}</h4>

          <div className="text-xs space-y-1">
            <CopyableText text={dayAccommodation.indirizzo_locale} className="text-amber-300 font-mono block">
              📍 {dayAccommodation.indirizzo_locale}
            </CopyableText>
            <p className="text-slate-400">EN: {dayAccommodation.indirizzo_en}</p>
            <p className="text-slate-400">🚉 Stazione: {dayAccommodation.stazione}</p>
          </div>

          {dayAccommodation.note && (
            <p className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 mt-2">
              💡 {dayAccommodation.note}
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              openTaxiCard({
                name: dayAccommodation.nome,
                addressLocale: dayAccommodation.indirizzo_locale,
                addressEn: dayAccommodation.indirizzo_en,
              })
            }
            className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 shadow transition-all active:scale-95"
          >
            🚗 Mostra Taxi Card
          </button>
        </div>
      )}
    </div>
  );
};

export default OggiTab;
