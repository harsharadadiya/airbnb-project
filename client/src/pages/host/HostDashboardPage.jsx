// Host dashboard: stats, listings (edit / pause / delete) and reservations.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CalendarCheck, Eye, Home, Pencil, Plus, Star, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { bookingService, hostService, listingService } from '@/services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SafeImage from '@/components/common/SafeImage';
import { EmptyState, ErrorState } from '@/components/common/StateViews';
import { formatDateRange, formatPrice, fromDateKey, plural } from '@/lib/format';
import { startOfToday } from 'date-fns';

const TABS = ['overview', 'listings', 'reservations'];

export default function HostDashboardPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'overview';

  const stats = useAsync(() => hostService.stats(), []);
  const listings = useAsync(() => hostService.listings(), []);
  const bookings = useAsync(() => hostService.bookings(), []);

  const reloadAll = () => Promise.all([stats.reload(), listings.reload(), bookings.reload()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-muted-foreground">Here is how your places are doing.</p>
        </div>
        <Button asChild>
          <Link to="/host/listings/new">
            <Plus /> Create listing
          </Link>
        </Button>
      </div>

      <div className="mt-6 border-b">
        <Tabs value={tab} onChange={(_e, value) => setParams({ tab: value })} variant="scrollable" allowScrollButtonsMobile>
          <Tab value="overview" label="Overview" />
          <Tab value="listings" label={`Listings${listings.data ? ` (${listings.data.length})` : ''}`} />
          <Tab value="reservations" label={`Reservations${bookings.data ? ` (${bookings.data.length})` : ''}`} />
        </Tabs>
      </div>

      <div className="mt-8">
        {tab === 'overview' && <Overview stats={stats} bookings={bookings} />}
        {tab === 'listings' && <ListingsTab listings={listings} onChanged={reloadAll} />}
        {tab === 'reservations' && <ReservationsTab bookings={bookings} onChanged={reloadAll} />}
      </div>
    </div>
  );
}

/* ---------------- Overview ---------------- */

function Overview({ stats, bookings }) {
  if (stats.error) return <ErrorState error={stats.error} onRetry={stats.reload} />;
  const s = stats.data;

  const cards = [
    { icon: Wallet, label: 'Total earnings', value: s && formatPrice(s.totalEarnings), sub: s && `${plural(s.nightsBooked, 'night')} booked` },
    { icon: CalendarCheck, label: 'Upcoming stays', value: s?.upcomingBookings, sub: 'confirmed reservations' },
    { icon: Home, label: 'Active listings', value: s && `${s.activeListings} / ${s.totalListings}`, sub: 'listed / total' },
    { icon: Star, label: 'Average rating', value: s && (s.totalReviews ? s.avgRating.toFixed(2) : '—'), sub: s && plural(s.totalReviews, 'review') },
  ];

  const today = startOfToday();
  const upcoming = (bookings.data ?? [])
    .filter((b) => b.status === 'confirmed' && fromDateKey(b.checkOut) > today)
    .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
    .slice(0, 5);

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, sub }) => (
          <Card key={label} className="gap-0 py-5">
            <CardContent>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {stats.loading ? <Skeleton width="60%" height={36} /> : <p className="text-2xl font-extrabold">{value}</p>}
              <p className="text-xs text-muted-foreground">{stats.loading ? ' ' : sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Next check-ins</h2>
        {bookings.loading ? (
          <Skeleton variant="rounded" height={160} />
        ) : upcoming.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No upcoming stays" description="New reservations will show up here." />
        ) : (
          <ul className="divide-y rounded-2xl border">
            {upcoming.map((b) => (
              <li key={b._id} className="flex items-center gap-4 p-4">
                <SafeImage src={b.listing?.images?.[0]} alt="" className="size-14 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{b.guest?.name ?? 'Guest'}</p>
                  <p className="truncate text-sm text-muted-foreground">{b.listing?.title}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{formatDateRange(b.checkIn, b.checkOut)}</p>
                  <p className="text-muted-foreground">{plural(b.guests, 'guest')}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------------- Listings ---------------- */

function ListingsTab({ listings, onChanged }) {
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function toggleActive(listing) {
    setBusyId(listing._id);
    try {
      await listingService.update(listing._id, { isActive: !listing.isActive });
      toast.success(listing.isActive ? 'Listing paused' : 'Listing is live again');
      await onChanged();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    try {
      await listingService.remove(toDelete._id);
      toast.success('Listing deleted');
      await onChanged();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (listings.error) return <ErrorState error={listings.error} onRetry={listings.reload} />;
  if (listings.loading && !listings.data) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: '16px' }} />
        ))}
      </div>
    );
  }
  if (!listings.data.length) {
    return (
      <EmptyState
        icon={Home}
        title="You have no listings yet"
        description="Create your first listing to start welcoming guests."
        action={
          <Button asChild>
            <Link to="/host/listings/new">Create listing</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <ul className="grid gap-4">
        {listings.data.map((listing) => (
          <li key={listing._id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
            <SafeImage src={listing.images[0]} alt={listing.title} className="h-40 w-full rounded-xl sm:h-20 sm:w-28" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-bold">{listing.title}</p>
                <Badge variant={listing.isActive ? 'success' : 'warning'}>{listing.isActive ? 'Listed' : 'Paused'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {listing.location.city}, {listing.location.country} · {formatPrice(listing.pricePerNight)} / night ·{' '}
                {listing.reviewCount ? `★ ${listing.avgRating.toFixed(2)} (${listing.reviewCount})` : 'No reviews'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip title={listing.isActive ? 'Pause listing' : 'Publish listing'}>
                <Switch checked={listing.isActive} disabled={busyId === listing._id} onChange={() => toggleActive(listing)} />
              </Tooltip>
              {listing.isActive && (
                <Button asChild variant="ghost" size="icon" aria-label="View listing">
                  <Link to={`/listings/${listing._id}`}>
                    <Eye />
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="icon" aria-label="Edit listing">
                <Link to={`/host/listings/${listing._id}/edit`}>
                  <Pencil />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete listing" onClick={() => setToDelete(listing)}>
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this listing?"
        description={`"${toDelete?.title}" and its reviews will be removed for good. Listings with upcoming bookings cannot be deleted.`}
        confirmLabel="Delete listing"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}

/* ---------------- Reservations ---------------- */

function ReservationsTab({ bookings, onChanged }) {
  const [toCancel, setToCancel] = useState(null);
  const today = startOfToday();

  async function handleCancel() {
    try {
      await bookingService.cancel(toCancel._id);
      toast.success('Reservation cancelled');
      await onChanged();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (bookings.error) return <ErrorState error={bookings.error} onRetry={bookings.reload} />;
  if (bookings.loading && !bookings.data) return <Skeleton variant="rounded" height={260} />;
  if (!bookings.data.length) {
    return <EmptyState icon={CalendarCheck} title="No reservations yet" description="When guests book your places, they will appear here." />;
  }

  return (
    <>
      <TableContainer className="rounded-2xl border">
        <Table size="medium" aria-label="Reservations">
          <TableHead>
            <TableRow>
              <TableCell>Guest</TableCell>
              <TableCell>Listing</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.data.map((b) => {
              const upcoming = b.status === 'confirmed' && fromDateKey(b.checkIn) > today;
              const finished = b.status === 'confirmed' && fromDateKey(b.checkOut) <= today;
              return (
                <TableRow key={b._id} hover>
                  <TableCell>
                    <p className="font-semibold">{b.guest?.name ?? 'Deleted user'}</p>
                    <p className="text-xs text-muted-foreground">{b.guest?.email}</p>
                  </TableCell>
                  <TableCell className="max-w-56 truncate">{b.listing?.title ?? 'Removed listing'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateRange(b.checkIn, b.checkOut)}
                    <p className="text-xs text-muted-foreground">
                      {plural(b.nights, 'night')} · {plural(b.guests, 'guest')}
                    </p>
                  </TableCell>
                  <TableCell align="right" className="font-semibold">
                    {formatPrice(b.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === 'cancelled' ? 'destructive' : finished ? 'secondary' : 'success'}>
                      {b.status === 'cancelled' ? 'Cancelled' : finished ? 'Completed' : 'Confirmed'}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    {upcoming && (
                      <Button variant="outline" size="sm" onClick={() => setToCancel(b)}>
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={Boolean(toCancel)}
        onOpenChange={(open) => !open && setToCancel(null)}
        title="Cancel this reservation?"
        description={toCancel && `${toCancel.guest?.name} · ${formatDateRange(toCancel.checkIn, toCancel.checkOut)}. The guest will lose this booking.`}
        confirmLabel="Cancel reservation"
        destructive
        onConfirm={handleCancel}
      />
    </>
  );
}
