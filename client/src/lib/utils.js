import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combines class names and removes conflicting Tailwind classes.
// cn('px-2', isBig && 'px-4') -> 'px-4'
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
