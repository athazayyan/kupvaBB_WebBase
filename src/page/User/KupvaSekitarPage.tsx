import { NavbarUser } from "../../components/utils/NavbarUser";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import { useState } from "react";

// Fix for default marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Dummy data for KUPVA locations in Aceh
const kupvaData = [
    { id: 1, name: "Money Changer Banda Aceh", position: [5.5483, 95.3238] as LatLngTuple, address: "Jl. Teuku Umar No. 25, Banda Aceh", rate: "USD 1 = IDR 15,500", open: "08:00 - 17:00" },
    { id: 2, name: "KUPVA Lhokseumawe", position: [5.1801, 97.1507] as LatLngTuple, address: "Jl. Merdeka No. 10, Lhokseumawe", rate: "USD 1 = IDR 15,450", open: "08:30 - 16:30" },
    { id: 3, name: "Aceh Exchange", position: [5.4021, 95.9539] as LatLngTuple, address: "Jl. Iskandar Muda No. 15, Sigli", rate: "USD 1 = IDR 15,480", open: "09:00 - 17:00" },
    { id: 4, name: "Sabang Money Changer", position: [5.8883, 95.3214] as LatLngTuple, address: "Jl. Perdagangan No. 5, Sabang", rate: "USD 1 = IDR 15,520", open: "08:00 - 16:00" },
    { id: 5, name: "Meulaboh Exchange", position: [4.1385, 96.1278] as LatLngTuple, address: "Jl. Cut Nyak Dhien No. 30, Meulaboh", rate: "USD 1 = IDR 15,470", open: "08:30 - 17:30" },
];

export default function KupvaSekitarPage() {
    const [selectedKupva, setSelectedKupva] = useState<number | null>(null);

    return (
        <div className="kupva-sekitar-page  min-h-screen">
            <NavbarUser />
            
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-2">
                    <a href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali
                    </a>
                </div>
                
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold  mb-2">KUPVA Di Sekitar Anda</h1>
                    <p className=" text-lg">Money changers (KUPVA) di Provinsi Aceh</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="map-container" style={{ height: "550px", width: "100%" }}>
                        <MapContainer 
                            center={[5.5483, 95.3238]} 
                            zoom={9} 
                            style={{ height: "100%", width: "100%" }}
                            className="z-0"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            
                            {kupvaData.map(kupva => (
                                <Marker 
                                    key={kupva.id} 
                                    position={kupva.position}
                                    eventHandlers={{
                                        click: () => {
                                            setSelectedKupva(kupva.id);
                                        },
                                    }}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <h3 className="font-bold text-lg text-blue-700">{kupva.name}</h3>
                                            <div className="flex items-center  mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p>{kupva.address}</p>
                                            </div>
                                            <div className="flex items-center  mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p>{kupva.open}</p>
                                            </div>
                                            <p className="text-green-600 font-medium mt-2">{kupva.rate}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
                
                <div className="kupva-list">
                    <h2 className="text-2xl font-bold mb-6  border-b pb-2">Daftar KUPVA</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {kupvaData.map(kupva => (
                            <div 
                                key={kupva.id} 
                                className={`p-5 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md ${selectedKupva === kupva.id ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                                onClick={() => setSelectedKupva(kupva.id)}
                            >
                                <h3 className="font-bold text-lg text-blue-700">{kupva.name}</h3>
                                <div className="flex items-center  mt-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p>{kupva.address}</p>
                                </div>
                                <div className="flex items-center  mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>{kupva.open}</p>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-green-600 font-medium text-lg">{kupva.rate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}