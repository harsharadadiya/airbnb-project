import Skeleton from '@mui/material/Skeleton';

// Grey placeholder shown while listings are loading (MUI Skeleton)
export default function ListingCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton variant="rounded" sx={{ borderRadius: '16px', width: '100%', height: 'auto', aspectRatio: '20 / 19' }} />
      <Skeleton width="70%" sx={{ mt: 1.5 }} />
      <Skeleton width="50%" />
      <Skeleton width="30%" />
    </div>
  );
}
