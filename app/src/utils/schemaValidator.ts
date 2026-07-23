import type { ViaggioData } from '../types/viaggio';

export function validateViaggioSchema(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Il formato dati deve essere un oggetto JSON valido.'] };
  }

  const obj = data as Partial<ViaggioData>;

  if (!obj.meta || typeof obj.meta !== 'object') {
    errors.push('Campo "meta" mancante o non valido.');
  } else {
    if (!obj.meta.titolo) errors.push('Campo "meta.titolo" mancante.');
    if (!obj.meta.versione) errors.push('Campo "meta.versione" mancante.');
  }

  if (!Array.isArray(obj.alloggi)) {
    errors.push('Campo "alloggi" mancante o non è un array.');
  }

  if (!obj.trasporti || typeof obj.trasporti !== 'object') {
    errors.push('Campo "trasporti" mancante o non valido.');
  } else {
    if (!Array.isArray(obj.trasporti.voli)) errors.push('Campo "trasporti.voli" mancante o non array.');
    // Backward compatibility & new 4.0 schema support
    if (!Array.isArray(obj.trasporti.treni) && !(obj.trasporti as any).treni_e_bus) {
      errors.push('Campo "trasporti.treni" mancante o non array.');
    }
  }

  if (!obj.emergenze || typeof obj.emergenze !== 'object') {
    errors.push('Campo "emergenze" mancante o non valido.');
  }

  if (!Array.isArray(obj.itinerario)) {
    errors.push('Campo "itinerario" mancante o non è un array.');
  } else if (obj.itinerario.length === 0) {
    errors.push('L\'itinerario non contiene alcun giorno.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
