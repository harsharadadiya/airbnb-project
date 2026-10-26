// Home page: search bar, categories, results grid, map and pagination.
import { useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { List, Map as MapIcon, SearchX } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { listingService } from '@/services';
import SearchBar from '@/components/listings/SearchBar';
import CategoryBar from '@/components/listings/CategoryBar';
import FiltersDialog from '@/components/listings/FiltersDialog';
import ListingCard from '@/components/listings/ListingCard';
import ListingCardSkeleton from '@/components/listings/ListingCardSkeleton';
import ListingMap from '@/components/listings/ListingMap';
import { EmptyState, ErrorState } from '@/components/common/StateViews';
import { Button } from '@/components/ui/button';
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

export default function HomePage() {
  const { filters, updateFilters, clearFilters } = useSearchFilters();
  const [hoveredId, setHoveredId] = useState(null);
  const [showMapMobile, setShowMapMobile] = useState(false);

  const query = JSON.stringify(filters); // re-run the search whenever any filter changes
  const { data, loading, error, reload } = useAsync(
    () => listingService.search({ ...filters, limit: PAGE_SIZE }),
    [query]
  );

  const listings = data?.listings ?? [];
  const pagination = data?.pagination;
  const hasFilters = Object.values(filters).some(Boolean);

  // Pass the chosen dates/guests on to the listing page so the booking box is pre-filled
  const linkSearch = new URLSearchParams(
    Object.fromEntries(['checkIn', 'checkOut', 'guests'].filter((k) => filters[k]).map((k) => [k, filters[k]]))
  ).toString();

  return (
    <div>
      {/* ---------- Hero + search ---------- */}
      <section className="border-b bg-gradient-to-b from-accent/70 to-background">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 lg:px-8">
          <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find a place that feels like <span className="text-primary">home</span>
          </h1>
          <p className="mt-2 mb-7 text-center text-muted-foreground">
            Cabins, villas, lofts and one-of-a-kind stays around the world.
          </p>
          <SearchBar filters={filters} onSearch={updateFilters} />
        </div>
      </section>

      {/* ---------- Categories + filters ---------- */}
      <div className="sticky top-16 z-[1050] border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 pt-4 pb-2 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <CategoryBar value={filters.category} onChange={(category) => updateFilters({ category })} />
          </div>
          <FiltersDialog filters={filters} onApply={updateFilters} />
        </div>
      </div>

      {/* ---------- Results + map ---------- */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
          <section className={cn(showMapMobile && 'hidden lg:block')} aria-live="polite">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                {loading ? 'Searching…' : pagination ? `${plural(pagination.total, 'stay')} found` : ''}
              </p>
              {hasFilters && (
                <Button variant="link" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>

            {error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No stays match your search"
                description="Try different dates, a wider price range or another destination."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    active={hoveredId === listing._id}
                    onHover={setHoveredId}
                    linkSearch={linkSearch ? `?${linkSearch}` : ''}
                  />
                ))}
              </div>
            )}

            {pagination?.totalPages > 1 && !loading && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(_e, page) => {
                    updateFilters({ page });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  shape="rounded"
                />
              </div>
            )}
          </section>

          <aside className={cn('lg:block', showMapMobile ? 'block' : 'hidden')}>
            <div className="sticky top-40 h-[calc(100vh-12rem)] min-h-[420px] overflow-hidden rounded-2xl border shadow-sm">
              <ListingMap listings={listings} activeId={hoveredId} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: switch between list and map */}
      <Button
        variant="dark"
        className="fixed bottom-6 left-1/2 z-[1060] -translate-x-1/2 rounded-full shadow-xl lg:hidden"
        onClick={() => setShowMapMobile((v) => !v)}
      >
        {showMapMobile ? <List /> : <MapIcon />}
        {showMapMobile ? 'Show list' : 'Show map'}
      </Button>
    </div>
  );
}
