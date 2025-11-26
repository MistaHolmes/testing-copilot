"use client";
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, WMSTileLayer } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon paths for Leaflet when using webpack/next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

type Coord = { latitude: number; longitude: number };

function MapClickHandler({ onClick }: { onClick: (c: Coord) => void }) {
  useMapEvents({
    click(e: any) {
      onClick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

interface Props {
  onSelect?: (c: Coord | null) => void;
  base?: string;
  resetKey?: number;
}

export default function Map({ onSelect, base, resetKey }: Props) {
  const apiBase = (base ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/g, '');
  const [selectedCoord, setSelectedCoord] = useState<Coord | null>(null);
  const [savedCoords, setSavedCoords] = useState<Coord[]>([]);
  const [mapCenter, setMapCenter] = useState<Coord>({ latitude: 20.5937, longitude: 78.9629 });
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [mapReady, setMapReady] = useState(false);
  const [showSavedMarkers, setShowSavedMarkers] = useState(false);

  // clear any previous selection on mount
  useEffect(() => {
    setSelectedCoord(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('selectedCoord');
        localStorage.removeItem('selectedCoord');
      } catch {}
    }
  }, []);

  // notify parent when selection changes
  useEffect(() => {
    if (onSelect) onSelect(selectedCoord);
  }, [selectedCoord, onSelect]);

  // fetch saved coords and get user location
  useEffect(() => {
    let mounted = true;

    const fetchSaved = async () => {
      try {
        const res = await fetch(`${apiBase}/forms`);
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          const coords: Coord[] = data
            .filter((d: any) => typeof d.latitude === 'number' && typeof d.longitude === 'number')
            .map((d: any) => ({ latitude: d.latitude, longitude: d.longitude }));
          setSavedCoords(coords);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchSaved();

    try {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setMapCenter({ latitude: lat, longitude: lng });
            const acc = pos.coords.accuracy ?? 1000;
            if (acc <= 50) setMapZoom(15);
            else if (acc <= 200) setMapZoom(13);
            else if (acc <= 1000) setMapZoom(11);
            else setMapZoom(9);
            setMapReady(true);
          },
          () => {
            setMapReady(true);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setMapReady(true);
      }
    } catch (e) {
      setMapReady(true);
    }

    return () => { mounted = false; };
  }, [apiBase]);

  // respond to resetKey changes: clear selection and refetch saved markers
  useEffect(() => {
    if (typeof resetKey === 'undefined') return;
    setSelectedCoord(null);
    // refetch saved markers
    (async () => {
      try {
        const res = await fetch(`${apiBase}/forms`);
        if (res.ok) {
          const data = await res.json();
          const coords: Coord[] = data
            .filter((d: any) => typeof d.latitude === 'number' && typeof d.longitude === 'number')
            .map((d: any) => ({ latitude: d.latitude, longitude: d.longitude }));
          setSavedCoords(coords);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [resetKey, apiBase]);

  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  return (
    <>
      {!mapReady && (
        <div style={{ width: '100%', height: 300, border: '1px solid #ddd', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#666' }}>
          Loading your location...
        </div>
      )}

      {mapReady && (
        <>
          <div style={{ width: '100%', height: 300, border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
            <MapContainer center={[mapCenter.latitude, mapCenter.longitude]} zoom={mapZoom} style={{ width: '100%', height: '100%' }}>
                {/* Google Maps */}
                <TileLayer
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                  url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsKey}`}
                  maxZoom={20}
                />
                {/* Mapbox */}
                {/* <TileLayer
                  attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
                  tileSize={512}
                  zoomOffset={-1}
                  maxZoom={20}
                /> */}
              <MapClickHandler onClick={(c) => setSelectedCoord(c)} />
              {selectedCoord && (
                <Marker position={[selectedCoord.latitude, selectedCoord.longitude]}>
                  <Popup>Selected location</Popup>
                </Marker>
              )}
              {showSavedMarkers && savedCoords.map((c, i) => (
                <Marker key={`saved-${i}`} position={[c.latitude, c.longitude]} />
              ))}
            </MapContainer>
          </div>

          <div style={{ fontSize: 13, color: '#333', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div>Selected:</div>
            <div style={{ fontWeight: 600 }}>{selectedCoord ? `${selectedCoord.latitude.toFixed(6)}, ${selectedCoord.longitude.toFixed(6)}` : 'none'}</div>
            {selectedCoord && (
              <button type="button" onClick={() => setSelectedCoord(null)} style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 6 }}>
                Clear
              </button>
            )}

            <label style={{ marginLeft: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={showSavedMarkers} onChange={(e) => setShowSavedMarkers(e.target.checked)} />
              <span style={{ fontSize: 12 }}>Show saved markers</span>
            </label>
          </div>
        </>
      )}
    </>
  );
}
