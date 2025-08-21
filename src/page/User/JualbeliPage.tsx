import { useEffect, useState } from "react";
import { NavbarUser } from "../../components/utils/NavbarUser";
import { supabase } from "../../supabaseClient";
import { Search, Filter, Clock, MapPin } from "lucide-react";
import { Footer } from "../../components/user-component/Footer";

interface Currency {
  id: string;
  kode: string;
  nama: string;
}

interface Profile {
  id: string;
  nama: string;
}

interface ExchangeRate {
  id: string;
  harga_beli: number;
  harga_jual: number;
  updated_at: string;
  nominal: number;
  mata_uang: Currency | null;
  profile: Profile | null;
  kupva_id?: string;
  mata_uang_id?: string;
}

export default function JualbeliPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [filteredRates, setFilteredRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKupva, setSelectedKupva] = useState("all");
  const [uniqueKupvas, setUniqueKupvas] = useState<string[]>([]);

  // Helper function to check if rate has valid prices
  const hasValidPrices = (rate: ExchangeRate) => {
    return rate.harga_beli > 0 && rate.harga_jual > 0;
  };

  // Filter exchange rates to only include valid prices
  const getValidExchangeRates = (rates: ExchangeRate[]) => {
    return rates.filter(hasValidPrices);
  };

  useEffect(() => {
    async function fetchExchangeRates() {
      try {
        const { data, error } = await supabase
          .from("harga_valas")
          .select(
            `
                        id,
                        harga_beli,
                        harga_jual,
                        updated_at,
                        nominal,
                        mata_uang (
                            id,
                            kode,
                            nama
                        ),
                        profile (
                            id,
                            nama
                        )
                    `
          )
          .gt("harga_beli", 0) // Only fetch rates with harga_beli > 0
          .gt("harga_jual", 0) // Only fetch rates with harga_jual > 0
          .order("updated_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedData = data.map((item) => ({
            ...item,
            mata_uang:
              Array.isArray(item.mata_uang) && item.mata_uang.length > 0
                ? item.mata_uang[0]
                : typeof item.mata_uang === "object" && item.mata_uang !== null
                ? (item.mata_uang as unknown as Currency)
                : null,
            profile:
              Array.isArray(item.profile) && item.profile.length > 0
                ? item.profile[0]
                : typeof item.profile === "object" && item.profile !== null
                ? (item.profile as unknown as Profile)
                : null,
          }));

          // Additional client-side filter for extra safety
          const validRates = getValidExchangeRates(
            formattedData as unknown as ExchangeRate[]
          );

          setExchangeRates(validRates);
          setFilteredRates(validRates);

          // Extract unique kupvas (only from valid rates)
          const kupvas = [
            ...new Set(
              validRates.map((item) => item.profile?.nama).filter(Boolean)
            ),
          ];
          setUniqueKupvas(kupvas as string[]);
        } else {
          setExchangeRates([]);
          setFilteredRates([]);
          setUniqueKupvas([]);
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExchangeRates();
  }, []);

  // Filter function
  useEffect(() => {
    let filtered = exchangeRates;

    // Apply valid price filter first
    filtered = getValidExchangeRates(filtered);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (rate) =>
          rate.mata_uang?.nama
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          rate.mata_uang?.kode
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          rate.profile?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by kupva
    if (selectedKupva !== "all") {
      filtered = filtered.filter(
        (rate) => rate.profile?.nama === selectedKupva
      );
    }

    setFilteredRates(filtered);
  }, [searchTerm, selectedKupva, exchangeRates]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrencyFlag = (kode: string) => {
    const flags: { [key: string]: string } = {
      // Utama
      USD: "🇺🇸",
      EUR: "🇪🇺",
      GBP: "🇬🇧",
      JPY: "🇯🇵",
      AUD: "🇦🇺",
      CAD: "🇨🇦",
      CHF: "🇨🇭",
      CNY: "🇨🇳",
      HKD: "🇭🇰",
      SGD: "🇸🇬",
      MYR: "🇲🇾",
      THB: "🇹🇭",
      KRW: "🇰🇷",
      IDR: "🇮🇩",
      PHP: "🇵🇭",
      INR: "🇮🇳",
      PKR: "🇵🇰",
      BDT: "🇧🇩",
      VND: "🇻🇳",

      // Timur Tengah & Afrika
      SAR: "🇸🇦",
      AED: "🇦🇪",
      QAR: "🇶🇦",
      KWD: "🇰🇼",
      OMR: "🇴🇲",
      BHD: "🇧🇭",
      EGP: "🇪🇬",
      ZAR: "🇿🇦",
      NGN: "🇳🇬",
      KES: "🇰🇪",
      MAD: "🇲🇦",
      DZD: "🇩🇿",
      TZS: "🇹🇿",

      // Amerika Latin
      MXN: "🇲🇽",
      BRL: "🇧🇷",
      ARS: "🇦🇷",
      CLP: "🇨🇱",
      COP: "🇨🇴",
      PEN: "🇵🇪",
      UYU: "🇺🇾",
      BOB: "🇧🇴",
      PYG: "🇵🇾",

      // Eropa lainnya
      NOK: "🇳🇴",
      SEK: "🇸🇪",
      DKK: "🇩🇰",
      CZK: "🇨🇿",
      PLN: "🇵🇱",
      HUF: "🇭🇺",
      RON: "🇷🇴",
      RUB: "🇷🇺",
      TRY: "🇹🇷",
      UAH: "🇺🇦",

      // Pasifik
      NZD: "🇳🇿",
      FJD: "🇫🇯",
      PGK: "🇵🇬",
      WST: "🇼🇸",
      TOP: "🇹🇴",

      // Default
      XAU: "🥇",
      XAG: "🥈",
      BTC: "₿",
      ETH: "◆",
    };
    return flags[kode] || "💰";
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
    >
      <NavbarUser />

      {/* Header Section */}
      <div className="pt-24 pb-8" style={{ background: "#326593" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Kurs Mata Uang
              </h1>
              <p className="text-white/80 mt-2">
                Real-time exchange rates from verified money changers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari mata uang atau money changer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                value={selectedKupva}
                onChange={(e) => setSelectedKupva(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Semua Money Changer</option>
                {uniqueKupvas.map((kupva) => (
                  <option key={kupva} value={kupva}>
                    {kupva}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {filteredRates.length} mata uang tersedia
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {uniqueKupvas.length} money changer aktif
            </div>
          </div>
        </div>

        {/* Exchange Rates */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-gray-600">Memuat data kurs mata uang...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: "#326593" }}>
                    <tr className="text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Mata Uang
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Kode
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Nominal
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">
                        Harga Beli
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">
                        Harga Jual
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Terakhir Update
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Money Changer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRates.length > 0 ? (
                      filteredRates.map((rate) => (
                        <tr
                          key={rate.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {getCurrencyFlag(rate.mata_uang?.kode || "")}
                              </span>
                              <span className="font-medium text-gray-900">
                                {rate.mata_uang?.nama || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-mono font-semibold text-gray-700">
                              {rate.mata_uang?.kode || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">{rate.nominal || "N/A"}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold text-green-600">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(rate.harga_beli)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold text-red-600">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(rate.harga_jual)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {formatDate(rate.updated_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {rate.profile?.nama || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-6xl">🔍</div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Tidak ada data ditemukan
                            </h3>
                            <p className="text-gray-500">
                              Tidak ada kurs yang valid atau sesuai dengan
                              filter pencarian
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredRates.length > 0 ? (
                filteredRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {getCurrencyFlag(rate.mata_uang?.kode || "")}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {rate.mata_uang?.nama || "N/A"}
                          </h3>
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono font-semibold text-gray-600">
                            {rate.mata_uang?.kode || "N/A"}
                          </span>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {rate.profile?.nama || "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-sm text-green-700 font-medium">
                            Beli
                          </span>
                        </div>
                        <div className="font-bold text-green-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(rate.harga_beli)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-sm text-red-700 font-medium">
                            Jual
                          </span>
                        </div>
                        <div className="font-bold text-red-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(rate.harga_jual)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      Update terakhir: {formatDate(rate.updated_at)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada data ditemukan
                  </h3>
                  <p className="text-gray-500">
                    Tidak ada kurs yang valid atau sesuai dengan filter
                    pencarian
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
