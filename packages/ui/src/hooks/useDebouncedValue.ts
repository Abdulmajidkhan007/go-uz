/**
 * @file useDebouncedValue.ts
 * Returns a debounced copy of a value that only updates after `delay` ms of
 * inactivity. Designed for place-autocomplete search inputs where you want to
 * suppress API calls while the user is still typing.
 *
 * The debounced value trails the live value; they are equal once the user
 * stops changing the input.
 */
import { useState, useEffect } from 'react';

/**
 * Debounce a rapidly-changing value.
 *
 * @param value - The source value to debounce.
 * @param delay - Debounce delay in milliseconds (default: 300).
 * @returns     The debounced value.
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(query, 400);
 * // Fire autocomplete fetch only when debouncedQuery changes.
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
