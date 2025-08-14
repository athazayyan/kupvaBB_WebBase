import { NavbarUser } from "../../components/utils/NavbarUser";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";

// Fix for default marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});
// Dummy data for KUPVA locations in Aceh
const kupvaData = [
    { id: 1, name: "Money Changer Banda Aceh", position: [5.5483, 95.3238] as LatLngTuple, address: "Jl. Teuku Umar No. 25, Banda Aceh", rate: "USD 1 = IDR 15,500" },
    { id: 2, name: "KUPVA Lhokseumawe", position: [5.1801, 97.1507] as LatLngTuple, address: "Jl. Merdeka No. 10, Lhokseumawe", rate: "USD 1 = IDR 15,450" },
    { id: 3, name: "Aceh Exchange", position: [5.4021, 95.9539] as LatLngTuple, address: "Jl. Iskandar Muda No. 15, Sigli", rate: "USD 1 = IDR 15,480" },
    { id: 4, name: "Sabang Money Changer", position: [5.8883, 95.3214] as LatLngTuple, address: "Jl. Perdagangan No. 5, Sabang", rate: "USD 1 = IDR 15,520" },
    { id: 5, name: "Meulaboh Exchange", position: [4.1385, 96.1278] as LatLngTuple, address: "Jl. Cut Nyak Dhien No. 30, Meulaboh", rate: "USD 1 = IDR 15,470" },
];


export default function KupvaSekitarPage() {
        return (
                <div className="kupva-sekitar-page">
                        <NavbarUser />
                        <p><a href="/">Back</a></p>
                        <h1 className="text-4xl font-bold mb-4">Kupva Di Sekitar Anda</h1>
                        <p className="mb-6">Money changers (KUPVA) di Provinsi Aceh</p>
                        
                        <div className="map-container" style={{ height: "500px", width: "100%", marginBottom: "20px" }}>
                                <MapContainer 
                                        center={[5.5483, 95.3238]} 
                                        zoom={9} 
                                        style={{ height: "100%", width: "100%" }}
                                >
                                        <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        
                                        {kupvaData.map(kupva => (
                                                <Marker key={kupva.id} position={kupva.position}>
                                                        <Popup>
                                                                <div>
                                                                        <h3 className="font-bold">{kupva.name}</h3>
                                                                        <p>{kupva.address}</p>
                                                                        <p className="text-green-600">{kupva.rate}</p>
                                                                </div>
                                                        </Popup>
                                                </Marker>
                                        ))}
                                </MapContainer>
                        </div>
                        
                        <div className="kupva-list mt-6">
                                <h2 className="text-2xl font-bold mb-4">Daftar KUPVA</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {kupvaData.map(kupva => (
                                                <div key={kupva.id} className="p-4 border rounded-lg shadow-sm">
                                                        <h3 className="font-bold">{kupva.name}</h3>
                                                        <p className="text-gray-600">{kupva.address}</p>
                                                        <p className="text-green-600 font-medium">{kupva.rate}</p>
                                                </div>
                                        ))}
                                </div>
                        </div>
                </div>
        );
}