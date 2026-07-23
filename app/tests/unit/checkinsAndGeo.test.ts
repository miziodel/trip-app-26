import { describe, it, expect } from 'vitest';
import { generateGeoJSON, generateKML } from '../../src/utils/geoUtils';
import type { CheckIn } from '../../src/types/viaggio';

describe('GeoUtils Exporters', () => {
  const sampleCheckins: CheckIn[] = [
    {
      id: 'c1',
      giorno: 1,
      timestamp: 1770000000000,
      luogo_nome: 'Tokyo Tower',
      coords: { lat: 35.6586, lng: 139.7454 },
      commento: 'Vista fantastica!',
      rating: 5,
      photoIds: ['p1'],
    },
    {
      id: 'c2',
      giorno: 2,
      timestamp: 1770086400000,
      luogo_nome: 'Senso-ji',
      coords: { lat: 35.7148, lng: 139.7967 },
      rating: 4,
    },
    {
      id: 'c3',
      giorno: 3,
      timestamp: 1770172800000,
      luogo_nome: 'Nessuna coordinata',
    },
  ];

  it('generateGeoJSON genera GeoJSON FeatureCollection valido includendo checkin senza GPS', () => {
    const geojsonStr = generateGeoJSON(sampleCheckins);
    const parsed = JSON.parse(geojsonStr);

    expect(parsed.type).toBe('FeatureCollection');
    expect(parsed.features).toHaveLength(3); // tutti i check-in inclusi
    expect(parsed.features[0].geometry.type).toBe('Point');
    expect(parsed.features[0].geometry.coordinates).toEqual([139.7454, 35.6586]);
    expect(parsed.features[0].properties.luogo_nome).toBe('Tokyo Tower');
    expect(parsed.features[0].properties.photoCount).toBe(1);
    expect(parsed.features[0].properties.gps_estimated).toBe(false);

    expect(parsed.features[2].properties.luogo_nome).toBe('Nessuna coordinata');
    expect(parsed.features[2].properties.gps_estimated).toBe(true);
    expect(parsed.features[2].properties.gps_missing).toBe(true);
  });

  it('generateKML genera stringa KML valida includendo checkin senza GPS', () => {
    const kmlStr = generateKML(sampleCheckins);

    expect(kmlStr).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(kmlStr).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
    expect(kmlStr).toContain('<name>Tokyo Tower</name>');
    expect(kmlStr).toContain('<coordinates>139.7454,35.6586,0</coordinates>');
    expect(kmlStr).toContain('<name>Senso-ji</name>');
    expect(kmlStr).toContain('<coordinates>139.7967,35.7148,0</coordinates>');
    expect(kmlStr).toContain('<name>Nessuna coordinata</name>');
  });
});
