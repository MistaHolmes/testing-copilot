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
  const [saved, setSaved] = useState<Array<{ id: number; latitude?: number; longitude?: number; name?: string; message?: string }>>([]);
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);

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
        },
        () => {
          // keep default
        },
        { maximumAge: 60_000, timeout: 5000 }
      );
    }

    // fetch saved form locations (only entries with coordinates) from localhost:3000
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/forms/getLocation');
        if (!res.ok) return;
        const data = await res.json();
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
  
  return (
    <div style={{ width: '100%', height: 420, marginTop: 16 }}>
      <MapContainer center={center ?? [20.5937, 78.9629]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        {/* Use explicit Google tile layer as requested; attach using Leaflet when map is ready. */}
        <GoogleTileLayer url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsKey}`} attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>' maxZoom={20} />
        <LocateMarker center={center} />
        {saved.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude as number, s.longitude as number]}
            eventHandlers={{
              click: () => {
                setSelected({ latitude: s.latitude as number, longitude: s.longitude as number });
                setCenter([s.latitude as number, s.longitude as number]);
                setZoom(13);
              },
            }}
          />
        ))}

        {selected && (
          <Marker position={[selected.latitude, selected.longitude]}>
            <Popup>Selected location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
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
