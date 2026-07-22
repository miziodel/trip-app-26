import React, { useState } from 'react';
import { useViaggioStore } from '../../store/store';
import { X, CheckSquare, Square, Plus, Trash2, Filter } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const TodoDrawer: React.FC = () => {
  const showTodoDrawer = useViaggioStore((state) => state.showTodoDrawer);
  const toggleTodoDrawer = useViaggioStore((state) => state.toggleTodoDrawer);
  const data = useViaggioStore((state) => state.data);
  const userTodos = useViaggioStore((state) => state.userTodos);
  const updateTodo = useViaggioStore((state) => state.updateTodo);
  const customTodos = useViaggioStore((state) => state.customTodos);
  const addCustomTodo = useViaggioStore((state) => state.addCustomTodo);
  const removeCustomTodo = useViaggioStore((state) => state.removeCustomTodo);

  const [hidePastDays, setHidePastDays] = useState<boolean>(false);
  const [newTodoInput, setNewTodoInput] = useState<Record<number, string>>({});

  if (!showTodoDrawer || !data) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredDays = data.itinerario.filter((g) => {
    if (hidePastDays && g.data < todayStr) return false;
    return true;
  });

  const handleAddCustomTodo = async (giorno: number, e: React.FormEvent) => {
    e.preventDefault();
    const text = newTodoInput[giorno] || '';
    if (!text.trim()) return;
    await addCustomTodo(giorno, text.trim());
    setNewTodoInput((prev) => ({ ...prev, [giorno]: '' }));
  };

  // Calculate totals
  let totalTodosCount = 0;
  let completedTodosCount = 0;

  data.itinerario.forEach((g) => {
    const todos = userTodos[g.giorno] || g.todo_list.map((t) => t.fatto);
    const custom = customTodos[g.giorno] || [];
    totalTodosCount += todos.length + custom.length;
    completedTodosCount += todos.filter(Boolean).length;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              <span>Checklist & Promemoria</span>
            </h2>
            <p className="text-xs text-slate-400">
              Completati {completedTodosCount} di {totalTodosCount} todo
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTodoDrawer}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtra giorni passati:</span>
          </span>
          <button
            type="button"
            onClick={() => setHidePastDays(!hidePastDays)}
            className={`px-3 py-1 rounded-full font-bold transition-all border ${
              hidePastDays
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {hidePastDays ? 'Nascondi Passati' : 'Mostra Tutti'}
          </button>
        </div>

        {/* Days List */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {filteredDays.map((g) => {
            const todos = userTodos[g.giorno] || g.todo_list.map((t) => t.fatto);
            const custom = customTodos[g.giorno] || [];
            const isToday = g.data === todayStr;

            return (
              <div
                key={g.giorno}
                className={`rounded-2xl p-4 space-y-3 border transition-all ${
                  isToday
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {g.fase}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-bold text-white">Giorno {g.giorno}</span>
                    <span className="text-xs text-slate-400">({formatDate(g.data)})</span>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      Oggi
                    </span>
                  )}
                </div>

                {/* Base Todos */}
                <div className="space-y-2">
                  {g.todo_list.map((todo, idx) => {
                    const isChecked = todos[idx] ?? todo.fatto;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateTodo(g.giorno, idx, !isChecked)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-start gap-2.5 transition-all text-xs ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                            : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
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

                  {/* Custom Todos */}
                  {custom.map((cText, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200 flex items-center justify-between text-xs font-medium"
                    >
                      <span className="flex items-center gap-1.5 flex-1 pr-2 break-words">
                        <span className="text-amber-400 font-bold">★</span>
                        {cText}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomTodo(g.giorno, cIdx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Todo Form */}
                <form
                  onSubmit={(e) => handleAddCustomTodo(g.giorno, e)}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    placeholder="+ Aggiungi promemoria..."
                    value={newTodoInput[g.giorno] || ''}
                    onChange={(e) =>
                      setNewTodoInput((prev) => ({ ...prev, [g.giorno]: e.target.value }))
                    }
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Aggiungi</span>
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoDrawer;
