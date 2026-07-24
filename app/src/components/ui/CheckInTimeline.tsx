import React, { useState, useMemo } from 'react';
import { useViaggioStore } from '../../store/store';
import { CheckInCard } from './CheckInCard';
import { MapPin, ArrowUpDown, Plus, Sparkles, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { syncPendingCheckIns } from '../../services/gipsigoService';

export const CheckInTimeline: React.FC = () => {
  const checkIns = useViaggioStore((state) => state.checkIns);
  const deleteCheckIn = useViaggioStore((state) => state.deleteCheckIn);
  const openCheckInModal = useViaggioStore((state) => state.openCheckInModal);
  const gipsigoConfig = useViaggioStore((state) => state.gipsigoConfig);
  const setActiveTab = useViaggioStore((state) => state.setActiveTab);
  const markCheckInsSyncedGiPSigo = useViaggioStore((state) => state.markCheckInsSyncedGiPSigo);
  const showToast = useViaggioStore((state) => state.showToast);

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const checkInList = useMemo(() => {
    return Object.values(checkIns || {});
  }, [checkIns]);

  const availableDays = useMemo(() => {
    const daysSet = new Set<number>();
    checkInList.forEach((c) => {
      if (typeof c.giorno === 'number') {
        daysSet.add(c.giorno);
      }
    });
    return Array.from(daysSet).sort((a, b) => a - b);
  }, [checkInList]);

  const sortedCheckIns = useMemo(() => {
    let filtered = checkInList;
    if (selectedDayFilter !== 'all') {
      filtered = filtered.filter((c) => c.giorno === selectedDayFilter);
    }

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.timestamp - a.timestamp;
      }
      return a.timestamp - b.timestamp;
    });
  }, [checkInList, selectedDayFilter, sortOrder]);

  const pendingCount = useMemo(() => {
    return checkInList.filter((c) => !c.syncedToGiPSigo).length;
  }, [checkInList]);

  const handleSync = async () => {
    if (!gipsigoConfig?.enabled) return;
    setIsSyncing(true);
    try {
      const pending = checkInList.filter((c) => !c.syncedToGiPSigo);
      const result = await syncPendingCheckIns(gipsigoConfig);
      if (result.synced > 0) {
        await markCheckInsSyncedGiPSigo(pending.map((c) => c.id).slice(0, result.synced));
        showToast(`✅ Sincronizzati ${result.synced} check-in su GiPSigo!`);
      } else if (result.errors.length > 0) {
        showToast(`⚠️ Errore sync: ${result.errors[0]}`);
      } else {
        showToast(`✅ Nessun check-in da sincronizzare`);
      }
    } catch (e) {
      showToast(`❌ Errore durante la sincronizzazione`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div id="checkin-timeline-section" className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-md space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-torii/15 text-torii border border-torii/30">
            <MapPin className="w-5 h-5 text-torii" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] font-outfit uppercase tracking-wide flex items-center gap-2">
              <span>Timeline Check-in</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-torii/15 text-torii border border-torii/30">
                {checkInList.length}
              </span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">Tutti i momenti registrati in ordine cronologico</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openCheckInModal()}
            className="min-w-[44px] min-h-[44px] px-3 py-2 bg-torii hover:bg-torii/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
            title="Registra nuovo check-in"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuovo Check-in</span>
          </button>
        </div>
      </div>

      {/* Sync Widget / Banner */}
      {!gipsigoConfig?.enabled ? (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
            <LinkIcon className="w-5 h-5 flex-shrink-0" />
            <span>Integrazione GiPSigo non attiva. I tuoi check-in rimangono solo locali.</span>
          </div>
          <button
            onClick={() => setActiveTab('emergenze')}
            className="text-amber-700 dark:text-amber-300 font-bold text-xs underline whitespace-nowrap hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
          >
            Configura
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm font-medium">
            {pendingCount > 0 ? (
              <>⚠️ {pendingCount} check-in pendenti su GiPSigo</>
            ) : (
              <>✅ Tutto sincronizzato</>
            )}
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing || pendingCount === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSyncing || pendingCount === 0
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizzazione...' : 'Sync Ora'}
          </button>
        </div>
      )}

      {/* Filter & Sort Toolbar */}
      {checkInList.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2 bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)] text-xs">
          {/* Day Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedDayFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer whitespace-nowrap ${
                selectedDayFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tutti i giorni ({checkInList.length})
            </button>
            {availableDays.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDayFilter(d)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedDayFilter === d
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                Giorno {d}
              </button>
            ))}
          </div>

          {/* Sort Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="min-w-[44px] min-h-[36px] px-3 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold rounded-lg border border-[var(--border-subtle)] flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            title="Cambia ordine cronologico"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-torii" />
            <span>{sortOrder === 'desc' ? 'Più recenti primi' : 'Più vecchi primi'}</span>
          </button>
        </div>
      )}

      {/* Check-ins Timeline List */}
      {sortedCheckIns.length > 0 ? (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-[var(--border-subtle)] pt-1">
          {sortedCheckIns.map((checkIn) => (
            <div key={checkIn.id} className="relative pl-8">
              <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full bg-torii border-2 border-[var(--bg-card)] z-10" />
              <CheckInCard checkIn={checkIn} onDelete={deleteCheckIn} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[var(--bg-primary)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-torii/15 text-torii border border-torii/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              {checkInList.length === 0
                ? 'Nessun Check-in ancora registrato'
                : `Nessun check-in trovato per Giorno ${selectedDayFilter}`}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
              Registra i luoghi che visiti per salvare la tua posizione GPS, valutazione e foto ricordi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCheckInModal()}
            className="min-h-[48px] px-4 py-2.5 bg-torii hover:bg-torii/90 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registra il tuo primo Check-in 📍</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckInTimeline;
