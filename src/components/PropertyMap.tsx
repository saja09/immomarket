import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

type MapProperty = {
  id: number
  title: string
  price: string
  district: string
  city: string
  lat: number
  lng: number
}

type PropertyMapProps = {
  properties: MapProperty[]
  onSelect?: (id: number) => void
}

const defaultCenter: [number, number] = [33.7246, -6.4758]

const markerIcon = new L.DivIcon({
  className: "custom-property-marker",
  html: `
    <div style="
      background:#06142f;
      color:white;
      border:3px solid white;
      border-radius:9999px;
      width:18px;
      height:18px;
      box-shadow:0 8px 20px rgba(0,0,0,.22);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

export default function PropertyMap({
  properties,
  onSelect,
}: PropertyMapProps) {
  const center =
    properties.length > 0
      ? ([properties[0].lat, properties[0].lng] as [number, number])
      : defaultCenter

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="h-[420px] w-full">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
              icon={markerIcon}
            >
              <Popup>
                <div dir="rtl" className="min-w-[180px] text-right">
                  <p className="text-[15px] font-black text-[#06142f]">
                    {property.title}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-slate-500">
                    {property.district} - {property.city}
                  </p>
                  <p className="mt-2 text-[16px] font-black text-[#2563eb]">
                    {property.price}
                  </p>

                  {onSelect && (
                    <button
                      type="button"
                      onClick={() => onSelect(property.id)}
                      className="mt-3 w-full rounded-full bg-[#06142f] px-4 py-2 text-[13px] font-bold text-white"
                    >
                      عرض التفاصيل
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
