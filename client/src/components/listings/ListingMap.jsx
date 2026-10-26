// Map of listings with price markers. Uses Leaflet + free OpenStreetMap tiles (no API key needed).
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatPrice } from '@/lib/format';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// A marker that looks like a little price tag
function priceIcon(price, active) {
  return L.divIcon({
    className: '', // remove Leaflet's default white square
    iconSize: null,
    html: `<span class="price-marker${active ? ' is-active' : ''}">${formatPrice(price)}</span>`,
  });
}

// Zoom the map so every listing is visible
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 11);
    else map.fitBounds(points, { padding: [50, 50], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function ListingMap({ listings, activeId, className = 'h-full w-full' }) {
  const points = useMemo(() => listings.map((l) => [l.location.lat, l.location.lng]), [listings]);

  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom className={className} worldCopyJump>
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      <FitBounds points={points} />
      {listings.map((listing) => (
        <Marker
          key={listing._id}
          position={[listing.location.lat, listing.location.lng]}
          icon={priceIcon(listing.pricePerNight, listing._id === activeId)}
          zIndexOffset={listing._id === activeId ? 1000 : 0}
        >
          <Popup>
            <Link to={`/listings/${listing._id}`} className="block w-48 !text-inherit no-underline">
              <img src={listing.images[0]} alt="" className="mb-2 h-28 w-full rounded-lg object-cover" />
              <strong className="block truncate">{listing.title}</strong>
              <span>{formatPrice(listing.pricePerNight)} / night</span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
