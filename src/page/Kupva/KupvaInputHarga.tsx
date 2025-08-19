import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";

interface MataUang {
  id: string;
  kode: string;
  nama: string;
}

interface HargaValas {
  id: string;
  mata_uang_id: string;
  harga_beli: number;
  harga_jual: number;
  mata_uang?: MataUang;
}

export default function KupvaInputHarga() {
  const [mataUangList, setMataUangList] = useState<MataUang[]>([]);
  const [hargaList, setHargaList] = useState<HargaValas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentKupvaId, setCurrentKupvaId] = useState<string | null>(null);

  // Check authentication
  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
  if (!token) {
    return <p>You need to log in as a Kupva user to access this page.</p>;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseCurrency = (value: string): number => {
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const formatInputValue = (value: string): string => {
    // Remove all non-digit and non-comma characters
    const cleaned = value.replace(/[^\d,]/g, "");

    // Split by comma to handle decimal part
    const parts = cleaned.split(",");

    // Format the integer part with dots as thousand separators
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Limit decimal places to 2
    if (parts[1]) {
      parts[1] = parts[1].substring(0, 2);
    }

    return parts.join(",");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          throw new Error("Not authenticated");
        }

        // Get user's profile ID
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setCurrentKupvaId(profileData.id);

        // Fetch mata uang (currencies)
        const { data: mataUangData, error: mataUangError } = await supabase
          .from("mata_uang")
          .select("*");

        if (mataUangError) throw mataUangError;
        setMataUangList(mataUangData);

        // Fetch existing harga valas for this Kupva
        const { data: hargaData, error: hargaError } = await supabase
          .from("harga_valas")
          .select(
            `
                        id, 
                        mata_uang_id, 
                        harga_beli, 
                        harga_jual,
                        mata_uang (id, kode, nama)
                    `
          )
          .eq("kupva_id", profileData.id);

        if (hargaError) throw hargaError;
        // Transform the data to match the HargaValas interface
        const formattedData = hargaData.map((item: any) => ({
          id: item.id,
          mata_uang_id: item.mata_uang_id,
          harga_beli: item.harga_beli,
          harga_jual: item.harga_jual,
          mata_uang: item.mata_uang,
        }));
        setHargaList(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleUpdateHarga = async (
    mata_uang_id: string,
    harga_beli: number,
    harga_jual: number
  ) => {
    if (!currentKupvaId) return;

    try {
      // Check if record exists
      const existingIndex = hargaList.findIndex(
        (h) => h.mata_uang_id === mata_uang_id
      );

      if (existingIndex >= 0) {
        // Update existing record
        const { error } = await supabase
          .from("harga_valas")
          .update({
            harga_beli,
            harga_jual,
            updated_at: new Date(),
          })
          .eq("id", hargaList[existingIndex].id);

        if (error) throw error;

        // Update local state
        const updatedList = [...hargaList];
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          harga_beli,
          harga_jual,
        };
        setHargaList(updatedList);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("harga_valas")
          .insert({
            kupva_id: currentKupvaId,
            mata_uang_id,
            harga_beli,
            harga_jual,
          })
          .select()
          .single();

        if (error) throw error;

        // Find mata uang details
        const mataUang = mataUangList.find((m) => m.id === mata_uang_id);

        // Add to local state
        setHargaList([
          ...hargaList,
          {
            ...data,
            mata_uang: mataUang,
          },
        ]);
      }

      alert("Harga berhasil diperbarui!");
    } catch (err: any) {
      setError(err.message);
      alert("Error: " + err.message);
    }
  };

  const HargaForm = ({ mataUang }: { mataUang: MataUang }) => {
    const existingHarga = hargaList.find((h) => h.mata_uang_id === mataUang.id);
    const [hargaBeli, setHargaBeli] = useState(existingHarga?.harga_beli || 0);
    const [hargaJual, setHargaJual] = useState(existingHarga?.harga_jual || 0);

    // Display values for the inputs (formatted)
    const [hargaBeliDisplay, setHargaBeliDisplay] = useState(
      existingHarga ? formatCurrency(existingHarga.harga_beli) : ""
    );
    const [hargaJualDisplay, setHargaJualDisplay] = useState(
      existingHarga ? formatCurrency(existingHarga.harga_jual) : ""
    );

    const handleHargaBeliChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatInputValue(e.target.value);
      setHargaBeliDisplay(formattedValue);
      setHargaBeli(parseCurrency(formattedValue));
    };

    const handleHargaJualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatInputValue(e.target.value);
      setHargaJualDisplay(formattedValue);
      setHargaJual(parseCurrency(formattedValue));
    };

    // Get currency flag
    const getCurrencyFlag = (kode: string) => {
      const flags: { [key: string]: string } = {
        USD: "🇺🇸",
        EUR: "🇪🇺",
        GBP: "🇬🇧",
        JPY: "🇯🇵",
        AUD: "🇦🇺",
        CAD: "🇨🇦",
        CHF: "🇨🇭",
        CNY: "🇨🇳",
        SGD: "🇸🇬",
        MYR: "🇲🇾",
        THB: "🇹🇭",
        KRW: "🇰🇷",
      };
      return flags[kode] || "💰";
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mt">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{getCurrencyFlag(mataUang.kode)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {mataUang.kode}
            </h3>
            <p className="text-sm text-gray-600">{mataUang.nama}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Beli (IDR)
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-right font-mono"
                value={hargaBeliDisplay}
                onChange={handleHargaBeliChange}
                placeholder="0,00"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Rp
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Jual (IDR)
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-right font-mono"
                value={hargaJualDisplay}
                onChange={handleHargaJualChange}
                placeholder="0,00"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Rp
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {(hargaBeli > 0 || hargaJual > 0) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Preview:</p>
            <div className="flex justify-between text-sm">
              <span>
                Beli:{" "}
                <span className="font-mono">
                  Rp {formatCurrency(hargaBeli)}
                </span>
              </span>
              <span>
                Jual:{" "}
                <span className="font-mono">
                  Rp {formatCurrency(hargaJual)}
                </span>
              </span>
            </div>
          </div>
        )}

        <button
          className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => handleUpdateHarga(mataUang.id, hargaBeli, hargaJual)}
        >
          Simpan Harga
        </button>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen mt-25 "
      style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
    >
      <NavbarKupva />
      <div className="container mx-auto px-6 py-8  ">
        <div className="max-w-6xl mx-auto  ">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Input Harga Valas
            </h1>
            <p className="text-gray-600">
              Perbarui harga mata uang untuk money changer Anda
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mataUangList.map((mataUang) => (
                <HargaForm key={mataUang.id} mataUang={mataUang} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
