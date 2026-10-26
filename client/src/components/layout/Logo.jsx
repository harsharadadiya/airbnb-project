import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-primary" aria-label="StayNest home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <path d="M8 17.5 16 10l8 7.5V24a1 1 0 0 1-1 1h-4.5v-5h-5v5H9a1 1 0 0 1-1-1z" fill="#fff" />
      </svg>
      <span className="hidden text-xl font-extrabold tracking-tight sm:inline">staynest</span>
    </Link>
  );
}
