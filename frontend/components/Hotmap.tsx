"use client";
import { useEffect, useState } from "react";
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

type Coord = { latitude: number; longitude: number };

// fix default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocateMarker({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Hotmap() {
  const [center, setCenter] = useState<[number, number] | null>([20.5937, 78.9629]); // default India
  const [zoom, setZoom] = useState<number>(5);
  const [mapReady, setMapReady] = useState<boolean>(false);
  type SavedEntry = { id: number; latitude: number; longitude: number; name?: string; message?: string; createdAt?: string };
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SavedEntry | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false); // modal open state

  useEffect(() => {
    // try navigator geolocation
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenter([lat, lng]);
          const acc = pos.coords.accuracy || 1000;
          if (acc <= 50) setZoom(15);
          else if (acc <= 200) setZoom(13);
          else if (acc <= 1000) setZoom(11);
          else setZoom(9);
          setMapReady(true);
        },
        () => {
          // keep default
          setMapReady(true);
        },
        { maximumAge: 60_000, timeout: 5000 }
      );
    } else {
      setMapReady(true);
    }

    // fetch saved form locations (only entries with coordinates) from localhost:3000
    (async () => {
      try {
        console.log('[Hotmap] fetching locations from http://localhost:3000/forms/getLocation');
        const res = await fetch('http://localhost:3000/forms/getLocation');
        if (!res.ok) {
          console.warn('[Hotmap] fetch returned non-ok status', res.status);
          return;
        }
        const data = await res.json();
        console.log('[Hotmap] fetched locations count =', Array.isArray(data) ? data.length : 'non-array');
        setSaved(data);
      } catch (e) {
        console.error('fetch saved coords error', e);
      }
    })();
  }, []);
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const googleUrl = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${googleMapsKey ? `&key=${googleMapsKey}` : ''}`;
  const mapboxUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : '';
  const tileUrl = googleMapsKey ? googleUrl : mapboxToken ? mapboxUrl : osmUrl;
  const tileAttribution = googleMapsKey
    ? '&copy; <a href="https://www.google.com/maps">Google Maps</a>'
    : mapboxToken
    ? '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    : osmAttribution;
  
  // Escape key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // click handler to open preview
  const openModal = () => {
    if (!mapReady) return; // keep static until ready
    setIsOpen(true);
  };

  // close when clicking overlay
  const closeModal = () => setIsOpen(false);

  // preview style: match main Map component (full width, 300px height)
  const previewStyle: React.CSSProperties = { width: '100%', height: 300, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', position: 'relative' };

  return (
    <>
      {/* Loading placeholder while finding location */}
      {!mapReady && (
        <div style={{ width: '100%', height: 420, border: '1px solid #ddd', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#666' }}>
          Loading your location...
        </div>
      )}

      {/* Preview box when mapReady */}
      {mapReady && !isOpen && (
        <div style={{ marginTop: 16 }}>
          <div style={previewStyle}>
            <MapContainer key="hotmap-preview" center={center ?? [20.5937, 78.9629]} zoom={zoom} style={{ height: '100%', width: '100%', pointerEvents: 'none' }}>
              <GoogleTileLayer url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsKey}`} attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>' maxZoom={20} />
              <LocateMarker center={center} />
              {saved.map((s) => (
                <Marker key={`p-${s.id}`} position={[s.latitude as number, s.longitude as number]} />
              ))}
            </MapContainer>
            {/* clickable overlay to open modal */}
            <div onClick={openModal} style={{ position: 'absolute', inset: 0, cursor: mapReady ? 'pointer' : 'default' }} />
          </div>
        </div>
      )}

      {/* Modal overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '90vw', maxWidth: 1200, height: '70vh', background: '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              aria-label="Close map"
              style={{ position: 'absolute', right: 12, top: 12, zIndex: 10000, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: 6, cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ width: '100%', height: '100%' }}>
              <MapContainer key="hotmap-modal" center={center ?? [20.5937, 78.9629]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <GoogleTileLayer url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsKey}`} attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>' maxZoom={20} />
                <LocateMarker center={center} />
                {saved.map((s) => (
                  <Marker
                    key={`m-${s.id}`}
                    position={[s.latitude as number, s.longitude as number]}
                    eventHandlers={{
                      click: () => {
                        console.log('[Hotmap] marker clicked', s);
                        setSelectedEntry(s);
                        setCenter([s.latitude as number, s.longitude as number]);
                        setZoom(13);
                      },
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: 220 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.name ?? 'Anonymous'}</div>
                        <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>{s.message ?? ''}</div>
                        {s.createdAt && (
                          <div style={{ fontSize: 12, color: '#666' }}>{new Date(s.createdAt).toLocaleString()}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GoogleTileLayer({ url, attribution, maxZoom }: { url: string; attribution?: string; maxZoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    let layer: L.TileLayer | null = null;
    try {
      layer = L.tileLayer(url, { attribution, maxZoom });
      layer.addTo(map);
    } catch (e) {
      // ignore
    }
    return () => {
      if (layer && map.hasLayer(layer)) map.removeLayer(layer);
    };
  }, [map, url, attribution, maxZoom]);
  return null;
}
