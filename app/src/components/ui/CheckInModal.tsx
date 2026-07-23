import React, { useState, useEffect } from 'react';
import { useViaggioStore } from '../../store/store';
import { compressPhoto } from '../../utils/photoUtils';
import {
  X,
  MapPin,
  Star,
  Camera,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3,
} from 'lucide-react';

interface PhotoItem {
  id?: string;
  url: string;
  blob?: Blob;
}

export const CheckInModal: React.FC = () => {
  const modalOptions = useViaggioStore((state) => state.activeCheckInModal);
  const closeModal = useViaggioStore((state) => state.closeCheckInModal);
  const addCheckIn = useViaggioStore((state) => state.addCheckIn);
  const updateCheckIn = useViaggioStore((state) => state.updateCheckIn);
  const checkInPhotos = useViaggioStore((state) => state.checkInPhotos);
  const showToast = useViaggioStore((state) => state.showToast);
  const data = useViaggioStore((state) => state.data);
  const selectedDay = useViaggioStore((state) => state.selectedDay);

  const [locationName, setLocationName] = useState<string>('');
  const [giorno, setGiorno] = useState<number>(selectedDay || 1);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState<boolean>(false);

  // GPS state
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const isOpen = !!modalOptions?.isOpen;
  const isEditing = !!modalOptions?.editingCheckIn;

  // Initialize modal state when opened
  useEffect(() => {
    if (isOpen) {
      const editing = modalOptions?.editingCheckIn;
      if (editing) {
        setLocationName(editing.locationName || editing.luogo_nome || '');
        setGiorno(editing.giorno);
        setRating(editing.rating ?? 5);
        setComment(editing.comment || editing.commento || '');

        if (editing.lat !== undefined && editing.lng !== undefined) {
          setGpsCoords({
            lat: editing.lat,
            lng: editing.lng,
            accuracy: editing.accuracy ?? 0,
          });
          setGpsError(null);
        } else {
          setGpsCoords(null);
        }

        const existingIdsOrUrls = editing.photoIds || editing.photos || [];
        const items: PhotoItem[] = existingIdsOrUrls.map((idOrUrl) => ({
          id: idOrUrl,
          url: checkInPhotos[idOrUrl] || idOrUrl,
        }));
        setPhotoItems(items);
        setIsProcessingPhotos(false);
      } else {
        setLocationName(modalOptions?.defaultLocationName || '');
        setGiorno(modalOptions?.defaultGiorno ?? selectedDay ?? 1);
        setRating(5);
        setComment('');
        setPhotoItems([]);
        setIsProcessingPhotos(false);
        requestGpsPosition();
      }
    }
  }, [isOpen, modalOptions, selectedDay, checkInPhotos]);

  const requestGpsPosition = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocalizzazione non supportata dal browser');
      return;
    }

    setIsLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoadingGps(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let errorMsg = 'Impossibile rilevare la posizione GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permesso GPS negato.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Segnale GPS non disponibile.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Timeout ricerca GPS.';
        }
        setGpsError(errorMsg);
        setIsLoadingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photoItems.length >= 3) {
      showToast('Puoi caricare massimo 3 foto per check-in');
      return;
    }

    setIsProcessingPhotos(true);
    try {
      const remainingSlots = 3 - photoItems.length;
      const selectedFiles = Array.from(files).slice(0, remainingSlots);

      const newItems: PhotoItem[] = [];

      for (const file of selectedFiles) {
        const compressedBlob = await compressPhoto(file, 1200, 1200, 0.7);
        const objectUrl = URL.createObjectURL(compressedBlob);
        newItems.push({
          url: objectUrl,
          blob: compressedBlob,
        });
      }

      setPhotoItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error('Error processing photos:', err);
      showToast('Errore durante la compressione della foto');
    } finally {
      setIsProcessingPhotos(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      showToast('Inserisci il nome del luogo');
      return;
    }

    const editing = modalOptions?.editingCheckIn;

    const newPhotoBlobs = photoItems
      .filter((item) => item.blob && item.blob instanceof Blob)
      .map((item) => item.blob as Blob);

    const retainedPhotoIds = photoItems
      .filter((item) => item.id)
      .map((item) => item.id as string);

    try {
      if (editing) {
        await updateCheckIn(
          editing.id,
          {
            giorno,
            locationName: locationName.trim(),
            luogo_nome: locationName.trim(),
            lat: gpsCoords?.lat,
            lng: gpsCoords?.lng,
            accuracy: gpsCoords?.accuracy,
            rating,
            comment: comment.trim() || undefined,
            commento: comment.trim() || undefined,
            photoIds: retainedPhotoIds,
            photos: retainedPhotoIds,
          },
          newPhotoBlobs
        );
        showToast('Check-in aggiornato con successo! ✏️');
      } else {
        await addCheckIn(
          {
            giorno,
            locationName: locationName.trim(),
            luogo_nome: locationName.trim(),
            timestamp: Date.now(),
            lat: gpsCoords?.lat,
            lng: gpsCoords?.lng,
            accuracy: gpsCoords?.accuracy,
            rating,
            comment: comment.trim() || undefined,
            commento: comment.trim() || undefined,
            scheduleItemId: modalOptions?.scheduleItemId,
          },
          newPhotoBlobs
        );
        showToast('Check-in registrato con successo! 📍');
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save check-in:', err);
      showToast('Errore nel salvataggio del check-in');
    }
  };

  if (!isOpen) return null;

  const totalDays = data?.itinerario?.length || 24;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 relative my-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-torii/15 text-torii border border-torii/30">
              {isEditing ? <Edit3 className="w-5 h-5 text-torii" /> : <MapPin className="w-5 h-5 text-torii" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)] font-outfit uppercase tracking-wide leading-none">
                {isEditing ? 'Modifica Check-in' : 'Nuovo Check-in'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEditing ? 'Aggiorna i dettagli o gestisci le foto' : 'Salva posizione & momento offline'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center rounded-xl bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            aria-label="Chiudi modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Status Banner */}
        <div className="p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 bg-[var(--bg-primary)] border-[var(--border-subtle)]">
          {isLoadingGps ? (
            <div className="flex items-center gap-2 text-amber-500 font-medium">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Rilevamento posizione GPS in corso...</span>
            </div>
          ) : gpsCoords ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono font-medium min-w-0">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="truncate">
                📍 {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)} (±{Math.round(gpsCoords.accuracy)}m)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-500 font-medium min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{gpsError || 'Posizione GPS non rilevata'}</span>
            </div>
          )}

          <button
            type="button"
            onClick={requestGpsPosition}
            disabled={isLoadingGps}
            className="min-w-[48px] min-h-[48px] px-3 flex items-center justify-center gap-1 rounded-xl bg-torii/15 hover:bg-torii/25 text-torii border border-torii/30 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
            title="Aggiorna GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGps ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Nome del Luogo *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="es. Shibuya Crossing, Tempio Senso-ji..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-torii font-sans min-h-[48px]"
            />
          </div>

          {/* Giorno Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Giorno dell'Itinerario
            </label>
            <select
              value={giorno}
              onChange={(e) => setGiorno(Number(e.target.value))}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-torii font-sans min-h-[48px]"
            >
              {Array.from({ length: totalDays }, (_, i) => i).map((d) => (
                <option key={d} value={d}>
                  Giorno {d} {data?.itinerario?.find((g) => g.giorno === d)?.titolo ? `- ${data.itinerario.find((g) => g.giorno === d)?.titolo}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Rating 1-5 Stars */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Valutazione Esperienza
            </label>
            <div className="flex items-center justify-between gap-1 bg-[var(--bg-primary)] p-2 rounded-2xl border border-[var(--border-subtle)] min-h-[48px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="min-w-[48px] min-h-[48px] flex-1 flex items-center justify-center rounded-xl hover:bg-[var(--border-subtle)] transition-transform active:scale-95"
                  aria-label={`Valuta ${star} stelle`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-[var(--border-subtle)]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Commento / Ricordo
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Scrivi le tue impressioni su questo luogo..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl p-3 text-sm focus:outline-none focus:border-torii font-sans resize-none"
            />
          </div>

          {/* Photo Picker Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-torii" />
                <span>Foto ({photoItems.length}/3)</span>
              </label>
              {isProcessingPhotos && (
                <span className="text-[11px] text-amber-500 font-mono flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Compressione...
                </span>
              )}
            </div>

            {/* Photo Previews */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {photoItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] w-20 h-20 shrink-0 group"
                >
                  <img
                    src={item.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 min-w-[28px] min-h-[28px] p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors"
                    title="Rimuovi foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {photoItems.length < 3 && (
                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] hover:border-torii bg-[var(--bg-primary)] flex flex-col items-center justify-center text-[var(--text-secondary)] hover:text-torii cursor-pointer transition-colors shrink-0 min-h-[48px]">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">+ Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={isProcessingPhotos}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 min-h-[48px] py-3 px-4 bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] font-bold rounded-2xl text-sm transition-all"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={isProcessingPhotos || !locationName.trim()}
              className="flex-1 min-h-[48px] py-3 px-4 bg-torii hover:bg-torii/90 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-torii/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              <span>{isEditing ? 'Salva Modifiche' : 'Registra Check-in'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;
