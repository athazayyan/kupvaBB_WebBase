import { useEffect, useState } from "react";
import { NavbarUser } from "../../components/utils/NavbarUser";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import { supabase } from "../../supabaseClient";
import { MapPin, Clock, Phone, Mail, TrendingUp, TrendingDown, Navigation, Filter } from "lucide-react";
import { Footer } from "../../components/user-component/Footer";

// Fix for default marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});



interface Currency {
    id: string;
    kode: string;
    nama: string;
}

interface ExchangeRate {
    id: string;
    harga_beli: number;
    harga_jual: number;
    updated_at: string;
    nominal: number;
    mata_uang: Currency | null;
}

interface KupvaProfile {
    id: string;
    nama: string;
    email: string;
    alamat: string;
    no_telepon: string;
    latitude: number;
    longitude: number;
    exchangeRates: ExchangeRate[];
}

export default function KupvaSekitarPage() {
    const [kupvaData, setKupvaData] = useState<KupvaProfile[]>([]);
    const [selectedKupva, setSelectedKupva] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredKupva, setHoveredKupva] = useState<string | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>("all");
    const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);

    useEffect(() => {
        async function fetchKupvaData() {
            try {
                // Fetch KUPVA profiles with location data
                const { data: profiles, error: profileError } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('role', 'kupva')
                    .neq('latitude', 0)
                    .neq('longitude', 0);

                if (profileError) throw profileError;

                // Fetch exchange rates for each KUPVA
                const kupvaWithRates = await Promise.all(
                    profiles.map(async (profile) => {
                        const { data: rates, error: rateError } = await supabase
                            .from('harga_valas')
                            .select(`
                                id,
                                harga_beli,
                                harga_jual,
                                updated_at,
                                nominal,
                                mata_uang (
                                    id,
                                    kode,
                                    nama
                                )
                            `)
                            .eq('kupva_id', profile.id)
                            .order('updated_at', { ascending: false });

                        if (rateError) {
                            console.error('Error fetching rates for', profile.nama, rateError);
                            return {
                                ...profile,
                                exchangeRates: []
                            };
                        }

                        const formattedRates = rates.map(rate => ({
                            ...rate,
                            mata_uang: Array.isArray(rate.mata_uang) && rate.mata_uang.length > 0 
                                ? rate.mata_uang[0] 
                                : (typeof rate.mata_uang === 'object' && rate.mata_uang !== null 
                                    ? rate.mata_uang as unknown as Currency 
                                    : null)
                        }));

                        return {
                            ...profile,
                            exchangeRates: formattedRates as ExchangeRate[]
                        };
                    })
                );

                setKupvaData(kupvaWithRates);

                // Extract unique currencies
                const allCurrencies = kupvaWithRates
                    .flatMap(kupva => kupva.exchangeRates)
                    .map(rate => rate.mata_uang)
                    .filter(Boolean) as Currency[];
                
                const uniqueCurrencies = allCurrencies.filter((currency, index, self) => 
                    index === self.findIndex(c => c.id === currency.id)
                );
                
                setAvailableCurrencies(uniqueCurrencies);

            } catch (error) {
                console.error('Error fetching KUPVA data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchKupvaData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getCurrencyFlag = (kode: string) => {
        const flags: { [key: string]: string } = {
            'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
            'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭', 'CNY': '🇨🇳',
            'SGD': '🇸🇬', 'MYR': '🇲🇾', 'THB': '🇹🇭', 'KRW': '🇰🇷'
        };
        return flags[kode] || '💰';
    };

    const filteredKupvaData = kupvaData.filter(kupva => {
        if (selectedCurrency === "all") return true;
        return kupva.exchangeRates.some(rate => rate.mata_uang?.id === selectedCurrency);
    });

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'hsl(34, 24%, 94%)' }}>
            <NavbarUser />
            
            {/* Header Section */}
            <div className="pt-24 pb-8" style={{ background: 'linear-gradient(135deg, hsl(170.9, 37.5%, 34.5%) 0%, hsl(170.9, 37.5%, 44.5%) 100%)' }}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
                   
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                                KUPVA Di Sekitar Anda
                            </h1>
                            <p className="text-white/80 mt-2">Money changers (KUPVA) terdekat di Provinsi Aceh</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Filter className="text-gray-500 w-5 h-5" />
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                            >
                                <option value="all">Semua Mata Uang</option>
                                {availableCurrencies.map(currency => (
                                    <option key={currency.id} value={currency.id}>
                                        {getCurrencyFlag(currency.kode)} {currency.nama} ({currency.kode})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {filteredKupvaData.length} KUPVA aktif
                            </div>
                            <div className="flex items-center gap-2">
                                <Navigation className="w-4 h-4" />
                                Real-time location
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                            <p className="text-gray-600">Memuat data lokasi KUPVA...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Map Section */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    🗺️ Peta Lokasi KUPVA
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Klik marker untuk melihat detail lengkap</p>
                            </div>
                            <div className="map-container" style={{ height: "600px", width: "100%" }}>
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
                                    
                                    {filteredKupvaData.map(kupva => (
                                        <Marker 
                                            key={kupva.id} 
                                            position={[kupva.latitude, kupva.longitude] as LatLngTuple}
                                            eventHandlers={{
                                                click: () => {
                                                    setSelectedKupva(kupva.id);
                                                },
                                            }}
                                        >
                                            <Popup maxWidth={350}>
                                                <div className="p-2">
                                                    <h3 className="font-bold text-lg text-teal-700 mb-3">{kupva.nama}</h3>
                                                    
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                                            <p className="text-sm text-gray-700">{kupva.alamat}</p>
                                                        </div>
                                                        {kupva.no_telepon && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-gray-500" />
                                                                <p className="text-sm text-gray-700">{kupva.no_telepon}</p>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-gray-500" />
                                                            <p className="text-sm text-gray-700">{kupva.email}</p>
                                                        </div>
                                                    </div>

                                                    {kupva.exchangeRates.length > 0 && (
                                                        <div className="border-t pt-3">
                                                            <h4 className="font-semibold text-sm text-gray-800 mb-2">📊 Kurs Terbaru:</h4>
                                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                                {kupva.exchangeRates.slice(0, 3).map(rate => (
                                                                    <div key={rate.id} className="bg-gray-50 rounded-lg p-2">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-lg">{getCurrencyFlag(rate.mata_uang?.kode || '')}</span>
                                                                            <span className="font-medium text-sm">{rate.mata_uang?.kode}</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                            <div className="flex items-center gap-1">
                                                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                                                                <span className="text-green-600 font-semibold">
                                                                                    {formatCurrency(rate.harga_beli)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <TrendingDown className="w-3 h-3 text-red-500" />
                                                                                <span className="text-red-600 font-semibold">
                                                                                    {formatCurrency(rate.harga_jual)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {kupva.exchangeRates.length > 3 && (
                                                                    <p className="text-xs text-gray-500 text-center">
                                                                        +{kupva.exchangeRates.length - 3} mata uang lainnya
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>
                        
                        {/* KUPVA List */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">📋 Daftar KUPVA</h2>
                                <span className="text-sm text-gray-600">{filteredKupvaData.length} lokasi ditemukan</span>
                            </div>
                            
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredKupvaData.map(kupva => (
                                    <div 
                                        key={kupva.id} 
                                        className={`relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
                                            selectedKupva === kupva.id ? 'ring-2 ring-teal-500 shadow-lg' : ''
                                        }`}
                                        onClick={() => setSelectedKupva(kupva.id)}
                                        onMouseEnter={() => setHoveredKupva(kupva.id)}
                                        onMouseLeave={() => setHoveredKupva(null)}
                                    >
                                        {/* Header */}
                                        <div className="p-6 pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-teal-700 mb-2">{kupva.nama}</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                                            <p className="text-sm text-gray-600">{kupva.alamat}</p>
                                                        </div>
                                                        {kupva.no_telepon && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-gray-500" />
                                                                <p className="text-sm text-gray-600">{kupva.no_telepon}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-teal-100 p-2 rounded-full">
                                                    <span className="text-lg">💱</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Exchange Rates - Show on Hover */}
                                        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-gray-50 border-t transition-all duration-300 ${
                                            hoveredKupva === kupva.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                                        }`}>
                                            <div className="p-4">
                                                <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Kurs Terbaru
                                                </h4>
                                                {kupva.exchangeRates.length > 0 ? (
                                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                                        {kupva.exchangeRates.slice(0, 2).map(rate => (
                                                            <div key={rate.id} className="bg-white rounded-lg p-3 border">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">{getCurrencyFlag(rate.mata_uang?.kode || '')}</span>
                                                                        <span className="font-semibold">{rate.mata_uang?.kode}</span>
                                                                    </div>
                                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="text-center p-2 bg-green-50 rounded">
                                                                        <div className="text-xs text-green-700 mb-1">Beli</div>
                                                                        <div className="text-sm font-bold text-green-600">
                                                                            {formatCurrency(rate.harga_beli)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-red-50 rounded">
                                                                        <div className="text-xs text-red-700 mb-1">Jual</div>
                                                                        <div className="text-sm font-bold text-red-600">
                                                                            {formatCurrency(rate.harga_jual)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {kupva.exchangeRates.length > 2 && (
                                                            <p className="text-xs text-gray-500 text-center py-1">
                                                                +{kupva.exchangeRates.length - 2} mata uang lainnya
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 text-center py-4">
                                                        Belum ada data kurs tersedia
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Default Footer */}
                                        <div className={`p-4 border-t bg-gray-50 transition-all duration-300 ${
                                            hoveredKupva === kupva.id ? 'opacity-0' : 'opacity-100'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    {kupva.exchangeRates.length} mata uang tersedia
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Aktif
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredKupvaData.length === 0 && (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada KUPVA ditemukan</h3>
                                    <p className="text-gray-500">Coba ubah filter mata uang atau periksa kembali nanti</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
                        <Footer></Footer>

        </div>
    );
}