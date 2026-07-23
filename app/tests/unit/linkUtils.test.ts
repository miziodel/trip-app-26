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
    const link = getMapDeepLink('', 'Tokyo');
    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=Tokyo');
  });

  it('returns Naver Maps URL for Seoul, Busan, or Korea', () => {
    expect(getMapDeepLink('Gyeongbokgung', 'Seoul')).toBe('https://map.naver.com/v5/search/Gyeongbokgung%2C%20Seoul');
    expect(getMapDeepLink('Haeundae Beach', 'Busan')).toBe('https://map.naver.com/v5/search/Haeundae%20Beach%2C%20Busan');
    expect(getMapDeepLink('Myeongdong Korea')).toBe('https://map.naver.com/v5/search/Myeongdong%20Korea');
    expect(getMapDeepLink('', 'Seoul')).toBe('https://map.naver.com/v5/search/Seoul');
  });
});
