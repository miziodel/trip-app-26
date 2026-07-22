import React, { useState, useEffect } from 'react';
import { Coins, CheckSquare } from 'lucide-react';
import { useViaggioStore } from '../../store/store';

export const TopBar: React.FC = () => {
  const toggleCurrencyModal = useViaggioStore((state) => state.toggleCurrencyModal);
  const toggleTodoDrawer = useViaggioStore((state) => state.toggleTodoDrawer);
  const [times, setTimes] = useState<{ cet: string; asia: string }>({ cet: '', asia: '' });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      const cetStr = now.toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
      });

      const asiaStr = now.toLocaleTimeString('it-IT', {
        timeZone: 'Asia/Tokyo', // Asia/Tokyo and Asia/Seoul are both UTC+9
        hour: '2-digit',
        minute: '2-digit',
      });

      setTimes({ cet: cetStr, asia: asiaStr });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-md">
      {/* Clock section */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">ITA (CET)</span>
          <span className="text-slate-200 font-semibold text-sm">{times.cet || '--:--'}</span>
        </div>
        <div className="h-6 w-px bg-slate-800" />
        <div className="flex flex-col">
          <span className="text-amber-400 text-[10px] uppercase tracking-wider">JP/KR (UTC+9)</span>
          <span className="text-amber-300 font-semibold text-sm">{times.asia || '--:--'}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-1.5">
        {/* Todo Drawer Trigger */}
        <button
          type="button"
          onClick={toggleTodoDrawer}
          className="flex items-center space-x-1 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl transition-all active:scale-95 text-xs font-semibold"
          title="Tutti i Todo & Promemoria"
        >
          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Todo</span>
        </button>

        {/* Currency Converter Trigger */}
        <button
          type="button"
          onClick={toggleCurrencyModal}
          className="flex items-center space-x-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1.5 rounded-xl transition-all active:scale-95 text-xs font-semibold"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Cambio</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
