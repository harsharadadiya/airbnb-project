import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const KEYS = ['location', 'checkIn', 'checkOut', 'guests', 'category', 'minPrice', 'maxPrice', 'sort', 'page'];

/**
 * Search filters are stored in the URL (?location=goa&guests=2...).
 * That way the browser back button works and a search can be shared as a link.
 */
export function useSearchFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => Object.fromEntries(KEYS.map((key) => [key, params.get(key) ?? ''])), [params]);

  // Change some filters. Any change (except the page itself) goes back to page 1.
  const updateFilters = useCallback(
    (changes) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value === '' || value === null || value === undefined) next.delete(key);
          else next.set(key, String(value));
        }
        if (!('page' in changes)) next.delete('page');
        return next;
      });
    },
    [setParams]
  );

  const clearFilters = useCallback(() => setParams(new URLSearchParams()), [setParams]);

  return { filters, updateFilters, clearFilters };
}
