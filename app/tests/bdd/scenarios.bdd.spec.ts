import { describe, it, expect } from 'vitest';
import sampleData from '../../../viaggio-sample.json';

describe('BDD Scenario: Feature 4 - Convertitore Valuta EUR ↔ JPY / KRW', () => {
  it('Given tasso JPY_EUR, When converte 5000 JPY, Then calcola correttamente gli Euro', () => {
    // Given
    const jpyRate = sampleData.meta.tassi_cambio.JPY_EUR || 0.006; // 1 JPY = 0.006 EUR
    const inputJpy = 5000;

    // When (conversione JPY -> EUR: 5000 * 0.006 = 30 Euro)
    const euroResult = inputJpy * jpyRate;

    // Then
    expect(euroResult).toBeGreaterThan(0);
    expect(euroResult).toBe(30);
  });
});

describe('BDD Scenario: Feature 1 - Struttura dati e tappe viaggio', () => {
  it('Given il database di viaggio, When caricato, Then contiene l\'itinerario e gli alloggi', () => {
    // Given
    const data = sampleData;

    // When & Then
    expect(data.itinerario.length).toBeGreaterThan(0);
    expect(data.alloggi.length).toBeGreaterThan(0);
    expect(data.meta.passeggeri.length).toBeGreaterThan(0);
  });
});
