// Map where the host clicks to place their listing (sets latitude/longitude).
// "Find address" uses the free OpenStreetMap Nominatim search (no API key).
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const pinIcon = L.divIcon({
  className: '',
  iconSize: null,
  html: '<span class="price-marker is-active">📍 Here</span>',
});

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 12), { duration: 0.8 });
  }, [map, position]);
  return null;
}

export default function LocationPicker({ lat, lng, onChange, addressQuery }) {
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng);
  const round = (n) => Math.round(n * 1e6) / 1e6;

  async function findAddress() {
    if (!addressQuery?.trim()) {
      toast.error('Type the address, city and country first.');
      return;
    }
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressQuery)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const [first] = await res.json();
      if (!first) {
        toast.error('Address not found. Click on the map instead.');
        return;
      }
      const next = [round(Number(first.lat)), round(Number(first.lon))];
      onChange(...next);
      setFlyTarget(next);
    } catch {
      toast.error('Address search is not available right now. Click on the map instead.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Click on the map to set the exact spot, or search the address.</p>
        <Button type="button" variant="outline" size="sm" onClick={findAddress} loading={searching}>
          <LocateFixed /> Find address
        </Button>
      </div>
      <div className="h-72 overflow-hidden rounded-xl border">
        <MapContainer center={hasPoint ? [lat, lng] : [20, 78]} zoom={hasPoint ? 12 : 3} className="size-full" scrollWheelZoom>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler
            onPick={(a, b) => {
              onChange(round(a), round(b));
            }}
          />
          <FlyTo position={flyTarget} />
          {hasPoint && <Marker position={[lat, lng]} icon={pinIcon} />}
        </MapContainer>
      </div>
    </div>
  );
}
