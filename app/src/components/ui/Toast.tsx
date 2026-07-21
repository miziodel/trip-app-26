import React from 'react';
import { useViaggioStore } from '../../store/store';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const toastMessage = useViaggioStore((state) => state.toastMessage);

  if (!toastMessage) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-sm border border-amber-300">
        <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
export default Toast;
