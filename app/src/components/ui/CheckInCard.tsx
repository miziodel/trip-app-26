import React, { useState } from 'react';
import { MapPin, Star, Trash2, Clock, Camera, X, Edit3 } from 'lucide-react';
import type { CheckIn } from '../../types/viaggio';
import { useViaggioStore } from '../../store/store';

interface CheckInCardProps {
  checkIn: CheckIn;
  onDelete?: (id: string) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({ checkIn, onDelete }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const openCheckInModal = useViaggioStore((state) => state.openCheckInModal);
  const checkInPhotos = useViaggioStore((state) => state.checkInPhotos);

  const formattedTime = new Date(checkIn.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = new Date(checkIn.timestamp).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
  });

  const hasCoords = checkIn.lat !== undefined && checkIn.lng !== undefined;
  const mapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${checkIn.lat},${checkIn.lng}`
    : undefined;

  const rawPhotos = checkIn.photoIds || checkIn.photos || [];
  const photoList = rawPhotos.map((p) => checkInPhotos[p] || p);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-3 font-sans transition-all relative">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-torii/15 text-torii border border-torii/30">
              <MapPin className="w-3 h-3 text-torii shrink-0" />
              <span>Check-in</span>
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Giorno {checkIn.giorno}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">•</span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {formattedDate} {formattedTime}
            </span>
          </div>

          <h4 className="text-base font-extrabold text-[var(--text-primary)] leading-tight tracking-tight break-words">
            {checkIn.locationName || checkIn.luogo_nome}
          </h4>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openCheckInModal({ editingCheckIn: checkIn })}
            className="min-w-[48px] min-h-[48px] px-2.5 py-2 flex items-center justify-center gap-1 text-xs font-bold text-torii hover:bg-torii/15 rounded-xl border border-torii/30 transition-colors cursor-pointer"
            title="Modifica Check-in & Foto"
            aria-label="Modifica Check-in"
          >
            <Edit3 className="w-4 h-4 shrink-0 text-torii" />
            <span className="hidden sm:inline">Modifica</span>
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  `⚠️ Sei sicuro di voler eliminare definitivamente il check-in "${checkIn.locationName || checkIn.luogo_nome || 'selezionato'}"?\n\nQuesta azione eliminerà anche le foto associate e non potrà essere annullata.`
                );
                if (confirmed) {
                  onDelete(checkIn.id);
                }
              }}
              className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Elimina check-in"
              aria-label="Elimina check-in"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* GPS Coordinates Badge */}
      {hasCoords && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>
            {checkIn.lat?.toFixed(5)}, {checkIn.lng?.toFixed(5)}
            {checkIn.accuracy !== undefined && ` (±${Math.round(checkIn.accuracy)}m)`}
          </span>
        </a>
      )}

      {/* Rating Stars */}
      {checkIn.rating && checkIn.rating > 0 && (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= (checkIn.rating || 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-[var(--border-subtle)]'
              }`}
            />
          ))}
          <span className="text-xs font-mono font-bold text-amber-500 ml-1">
            {checkIn.rating}/5
          </span>
        </div>
      )}

      {/* Comment Text */}
      {(checkIn.comment || checkIn.commento) && (
        <p className="text-xs text-[var(--text-primary)] leading-relaxed italic bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-subtle)]">
          "{checkIn.comment || checkIn.commento}"
        </p>
      )}

      {/* Photo Thumbnails */}
      {photoList.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1 font-bold">
            <Camera className="w-3 h-3 text-torii" />
            <span>Foto ({photoList.length})</span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {photoList.map((photoUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(photoUrl)}
                className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] shrink-0 min-w-[70px] min-h-[70px] w-20 h-20 group focus:outline-none cursor-pointer"
              >
                <img
                  src={photoUrl}
                  alt={`Check-in ${checkIn.locationName || checkIn.luogo_nome} photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Photo Modal Preview */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 min-w-[48px] min-h-[48px] p-2 flex items-center justify-center text-white bg-white/20 hover:bg-white/40 rounded-full transition-all cursor-pointer"
              aria-label="Chiudi foto"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto}
              alt="Anteprima foto Check-in"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInCard;
