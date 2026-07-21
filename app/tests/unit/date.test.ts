import { describe, it, expect } from 'vitest';
import { calculateCurrentTripDay } from '../../src/store/store';
import { ViaggioData } from '../../src/types/viaggio';

describe('Logica Data e Selettore Giorno', () => {
  const mockItinerario = [
    { giorno: 0, data: '2026-07-28', citta: 'Seoul', fase: '🇰🇷', titolo: 'Tappa 0', focus_culinario: '', tabella_oraria: [], todo_list: [] },
    { giorno: 1, data: '2026-07-29', citta: 'Seoul', fase: '🇰🇷', titolo: 'Tappa 1', focus_culinario: '', tabella_oraria: [], todo_list: [] },
    { giorno: 8, data: '2026-08-05', citta: 'Tokyo', fase: '🇯🇵', titolo: 'Tappa 8', focus_culinario: '', tabella_oraria: [], todo_list: [] },
  ] as unknown as ViaggioData['itinerario'];

  it('deve ritornare 0 se la data corrente non è nel range del viaggio', () => {
    const day = calculateCurrentTripDay(mockItinerario);
    // Data corrente test 2026-07-21 -> fuori dal range (ritorna 0)
    expect(day).toBe(0);
  });
});
