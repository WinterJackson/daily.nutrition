"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

// Fix for custom marker icons in Leaflet with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapPickerProps {
  latitude: number
  longitude: number
  onChange: (lat: number, lng: number) => void
}

function LocationMarker({ position, onChange }: { position: [number, number], onChange: (lat: number, lng: number) => void }) {
  const markerRef = useRef<any>(null)

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return (
    <Marker 
      position={position}
      draggable={true}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            const latlng = marker.getLatLng()
            onChange(latlng.lat, latlng.lng)
          }
        },
      }}
    />
  )
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl flex items-center justify-center text-neutral-400">Loading Map Engine...</div>
  }

  // Force Leaflet map initialization z-index low so it doesn't overlap Next.js nav and dropdowns
  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-neutral-200 dark:border-white/10 relative z-0">
      <MapContainer 
        center={[latitude, longitude]} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={[latitude, longitude]} onChange={onChange} />
      </MapContainer>
    </div>
  )
}
