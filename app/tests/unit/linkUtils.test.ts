import { describe, it, expect } from 'vitest';
import { getMapDeepLink } from '../../src/utils/linkUtils';

describe('linkUtils - getMapDeepLink', () => {
  it('returns generic Google Maps URL when no query or city is provided', () => {
    expect(getMapDeepLink('')).toBe('https://www.google.com/maps');
    expect(getMapDeepLink('', '')).toBe('https://www.google.com/maps');
  });

  it('crafts map link with query only', () => {
    const link = getMapDeepLink('Shinjuku Station');
    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=Shinjuku%20Station');
  });

  it('appends city to query if city is not already present in query', () => {
    const link = getMapDeepLink('Hotel S-Presso', 'Osaka');
    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=Hotel%20S-Presso%2C%20Osaka');
  });

  it('does not duplicate city if query already contains city name', () => {
    const link = getMapDeepLink('Hotel S-Presso Osaka', 'Osaka');
    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=Hotel%20S-Presso%20Osaka');
  });

  it('uses city as query if query is empty', () => {
    const link = getMapDeepLink('', 'Seoul');
    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=Seoul');
  });
});
