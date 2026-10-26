import CircularProgress from '@mui/material/CircularProgress';

// Full-page spinner (MUI) while a page or the login session is loading
export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
      <CircularProgress size={36} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
