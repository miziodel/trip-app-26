import React, { useState, useEffect } from 'react';
import type { DailyJournal } from '../../types/viaggio';
import { Moon, Star, Sparkles, FileText, Check } from 'lucide-react';

interface NightlyJournalCardProps {
  giorno: number;
  date: string;
  journal?: DailyJournal;
  onUpdate: (
    giorno: number,
    date: string,
    updates: Partial<Omit<DailyJournal, 'giorno' | 'date'>>
  ) => void;
}

export const NightlyJournalCard: React.FC<NightlyJournalCardProps> = ({
  giorno,
  date,
  journal,
  onUpdate,
}) => {
  const [rating, setRating] = useState<number>(journal?.rating || 0);
  const [highlight, setHighlight] = useState<string>(journal?.highlight || '');
  const [notes, setNotes] = useState<string>(journal?.notes || '');
  const [savedIndicator, setSavedIndicator] = useState<boolean>(false);

  useEffect(() => {
    setRating(journal?.rating || 0);
    setHighlight(journal?.highlight || '');
    setNotes(journal?.notes || '');
  }, [journal]);

  const triggerSaveIndicator = () => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  const handleRatingChange = (newRating: number) => {
    const nextRating = rating === newRating ? 0 : newRating;
    setRating(nextRating);
    onUpdate(giorno, date, { rating: nextRating, highlight, notes });
    triggerSaveIndicator();
  };

  const handleHighlightBlur = () => {
    if (highlight !== (journal?.highlight || '')) {
      onUpdate(giorno, date, { rating, highlight, notes });
      triggerSaveIndicator();
    }
  };

  const handleNotesBlur = () => {
    if (notes !== (journal?.notes || '')) {
      onUpdate(giorno, date, { rating, highlight, notes });
      triggerSaveIndicator();
    }
  };

  return (
    <div className="editorial-card p-4 space-y-3.5 shadow-lg border-l-4 border-l-purple-500 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 font-mono">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300">
            <Moon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            🌙 Diario di Bordo Serale
          </h3>
        </div>
        {savedIndicator && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
      </div>

      {/* Star Rating */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Valuta la giornata:</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="p-1.5 rounded-lg transition-transform active:scale-115 hover:scale-110"
              title={`${star} stelle`}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : 'text-[var(--border-strong)] hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs font-bold text-amber-500 font-mono ml-2">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Highlight Moment */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Momento Highlight del Giorno:</span>
        </label>
        <input
          type="text"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          onBlur={handleHighlightBlur}
          placeholder="es. Vista panoramica al tramonto, cena indimenticabile..."
          className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-sans"
        />
      </div>

      {/* Nightly Notes / Journal */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-500" />
          <span>Note Serali & Ricordi:</span>
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Scrivi qui i tuoi pensieri, dettagli della giornata o ricordi da conservare..."
          className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded-xl p-3 focus:outline-none focus:border-purple-500 font-sans resize-y"
        />
      </div>
    </div>
  );
};
