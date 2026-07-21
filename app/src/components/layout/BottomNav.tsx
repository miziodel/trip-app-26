import React from 'react';
import { Calendar, Map, Navigation, BookOpen, AlertTriangle } from 'lucide-react';
import { useViaggioStore } from '../../store/store';
import type { ActiveTab } from '../../store/store';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'oggi', label: 'Oggi', icon: Calendar },
  { id: 'itinerario', label: 'Itinerario', icon: Map },
  { id: 'trasporti', label: 'Viaggi', icon: Navigation },
  { id: 'guida', label: 'Guida', icon: BookOpen },
  { id: 'emergenze', label: 'SOS', icon: AlertTriangle },
];

export const BottomNav: React.FC = () => {
  const activeTab = useViaggioStore((state) => state.activeTab);
  const setActiveTab = useViaggioStore((state) => state.setActiveTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isSos = item.id === 'emergenze';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[52px] min-w-[56px] px-2 py-1 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? isSos
                    ? 'text-rose-400 bg-rose-500/10 font-bold'
                    : 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      isSos ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                  />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
