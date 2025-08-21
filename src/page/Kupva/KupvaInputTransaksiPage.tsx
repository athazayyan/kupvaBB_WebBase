import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  DollarSign,
  User,
  FileText,
  Calculator,
  Clock,
  TrendingUp,
} from "lucide-react";

interface MataUang {
  id: string;
  nama: string;
  kode: string;
}

interface TransaksiData {
  id?: string;
  kupva_id?: string;
  mata_uang_id: string;
  no_nota: string;
  tanggal: string;
  no_id_nasabah: string;
  nominal: number;
  kurs: number;
  jenis_transaksi: "Beli" | "Jual";
  metode_pembayaran: "Cash" | "Transfer";
  nama_nasabah: string;
  alamat_nasabah: string;
  keterangan_kurir: string;
  id_nama: string;
  tipe_identitas: "KTP" | "SIM" | "Paspor";
  curr: string;
  kode_mc_bank: string;
  jumlah_transaksi: number;
  perubahan_valas: string;
  tanggal_cek_stok: string;
}

export default function KupvaInputTransaksiPage() {
  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
  const [mataUangList, setMataUangList] = useState<MataUang[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransaksiData[]>(
    []
  );
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransaksiData>({
    mata_uang_id: "",
    no_nota: "",
    tanggal: new Date().toISOString().split("T")[0],
    no_id_nasabah: "",
    nominal: 0,
    kurs: 0,
    jenis_transaksi: "Beli",
    metode_pembayaran: "Cash",
    nama_nasabah: "",
    alamat_nasabah: "",
    keterangan_kurir: "",
    id_nama: "",
    curr: "",
    tipe_identitas: "KTP",
    kode_mc_bank: "",
    jumlah_transaksi: 0,
    perubahan_valas: "",
    tanggal_cek_stok: new Date().toISOString().split("T")[0],
  });
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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
    return flags[kode] || "💱";
  };

  const fetchMataUang = async () => {
    const { data, error } = await supabase.from("mata_uang").select("*");
    if (error) {
      console.error("Error fetching mata uang:", error);
    } else {
      setMataUangList(data);
    }
  };

  const fetchRecentTransactions = async () => {
    const { data, error } = await supabase
      .from("transaksi")
      .select("*")
      .order("tanggal", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent transactions:", error);
    } else {
      setRecentTransactions(data || []);
    }
  };

  useEffect(() => {
    fetchMataUang();
    fetchRecentTransactions();
    const searchParams = new URLSearchParams(window.location.search);
    const transaksiId = searchParams.get("id");
    if (transaksiId) {
      setIsEdit(true);
      fetchTransaksi(transaksiId);
    }
  }, []);

  useEffect(() => {
    // Calculate total whenever nominal or kurs changes
    setCalculatedTotal(formData.nominal * formData.kurs);
  }, [formData.nominal, formData.kurs]);

  const fetchTransaksi = async (id: string) => {
    const { data, error } = await supabase
      .from("transaksi")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching transaksi:", error);
    } else if (data) {
      setFormData({
        ...data,
        tanggal: data.tanggal
          ? new Date(data.tanggal).toISOString().split("T")[0]
          : "",
        tanggal_cek_stok: data.tanggal_cek_stok
          ? new Date(data.tanggal_cek_stok).toISOString().split("T")[0]
          : "",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle numeric inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = supabase.auth.getUser();
      const kupvaId = (await user).data.user?.id;

      const dataToSend = {
        ...formData,
        kupva_id: kupvaId,
      };

      let response;
      if (isEdit && formData.id) {
        response = await supabase
          .from("transaksi")
          .update(dataToSend)
          .eq("id", formData.id);
      } else {
        response = await supabase.from("transaksi").insert([dataToSend]);
      }

      if (response.error) {
        alert(`Error: ${response.error.message}`);
      } else {
        alert(
          `Transaksi ${
            isEdit ? "berhasil diperbarui" : "berhasil ditambahkan"
          }!`
        );
        if (!isEdit) {
          // Reset form after successful submission
          setFormData({
            mata_uang_id: "",
            no_nota: "",
            tanggal: new Date().toISOString().split("T")[0],
            no_id_nasabah: "",
            nominal: 0,
            kurs: 0,
            jenis_transaksi: "Beli",
            metode_pembayaran: "Cash",
            nama_nasabah: "",
            alamat_nasabah: "",
            keterangan_kurir: "",
            tipe_identitas: "KTP",
            id_nama: "",
            curr: "",
            kode_mc_bank: "",
            jumlah_transaksi: 0,
            perubahan_valas: "",
            tanggal_cek_stok: new Date().toISOString().split("T")[0],
          });
        }
        fetchRecentTransactions(); // Refresh recent transactions
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
      alert("Terjadi kesalahan saat menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
      >
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-lg">
            Anda perlu login sebagai Kupva untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
    >
      <NavbarKupva />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {isEdit ? "Edit Transaksi" : "Input Transaksi Baru"}
            </h1>
            <p className="text-gray-600">
              Kelola transaksi valas untuk money changer Anda
            </p>
          </div>

            {/* Recent Transactions */}
            <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-800">
              Transaksi Terbaru
              </h2>
              </div>

              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. Nota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mata Uang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nominal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total (IDR)
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions
                .filter(transaction => {
                // Get user ID from token
                try {
                  const tokenData = JSON.parse(token || '{}');
                  const userID = tokenData.user?.id;
                  // Only show transactions for the current KUPVA user
                  return transaction.kupva_id === userID;
                } catch (e) {
                  return false;
                }
                })
                .map((transaksi) => (
                <tr key={transaksi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transaksi.no_nota}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaksi.tanggal).toLocaleDateString(
                  "id-ID"
                )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  transaksi.jenis_transaksi === "Beli"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {transaksi.jenis_transaksi}
                </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>
                  {getCurrencyFlag(
                  mataUangList.find(
                  (m) => m.id === transaksi.mata_uang_id
                  )?.kode || ""
                  )}
                  </span>
                  <span>
                  {mataUangList.find(
                  (m) => m.id === transaksi.mata_uang_id
                  )?.kode || "-"}
                  </span>
                </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {formatCurrency(transaksi.nominal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-semibold">
                Rp{" "}
                {formatCurrency(transaksi.nominal * transaksi.kurs)}
                </td>
                </tr>
              ))}
              {recentTransactions.filter(transaction => {
                try {
                const tokenData = JSON.parse(token || '{}');
                const userID = tokenData.user?.id;
                return transaction.kupva_id === userID;
                } catch (e) {
                return false;
                }
              }).length === 0 && (
                <tr>
                <td
                colSpan={6}
                className="px-6 py-8 text-center text-gray-500"
                >
                Belum ada transaksi terbaru
                </td>
                </tr>
              )}
              </tbody>
              </table>
              </div>
            </div>
            </div>

          {/* Transaction Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEdit ? "Edit Data Transaksi" : "Form Input Transaksi"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Transaction Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                  Detail Transaksi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Nota *
                    </label>
                    <input
                      type="text"
                      name="no_nota"
                      value={formData.no_nota}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Masukkan nomor nota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Uang *
                    </label>
                    <select
                      name="mata_uang_id"
                      value={formData.mata_uang_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Pilih Mata Uang</option>
                      {mataUangList.map((mata_uang) => (
                        <option key={mata_uang.id} value={mata_uang.id}>
                          {getCurrencyFlag(mata_uang.kode)} {mata_uang.nama} (
                          {mata_uang.kode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Transaksi *
                    </label>
                    <select
                      name="jenis_transaksi"
                      value={formData.jenis_transaksi}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    >
                      <option value="Beli">Beli</option>
                      <option value="Jual">Jual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metode Pembayaran *
                    </label>
                    <select
                      name="metode_pembayaran"
                      value={formData.metode_pembayaran}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode MC Bank
                    </label>
                    <input
                      type="text"
                      name="kode_mc_bank"
                      value={formData.kode_mc_bank}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Kode bank"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Calculation Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  Perhitungan Nominal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nominal *
                    </label>
                    <input
                      type="number"
                      name="nominal"
                      value={formData.nominal}
                      onChange={handleChange}
                      required
                      step="  1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-right font-mono"
                      placeholder="0.00"
                    />
                  </div>

                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kurs *
                      </label>
                      <input
                        type="text"
                        name="kurs"
                        value={formData.kurs === 0 ? "" : String(formData.kurs)}
                        onChange={(e) => {
                        // Allow digits, decimal point and comma
                        const value = e.target.value.replace(/[^\d.,]/g, '');
                        // Convert comma to period for parsing
                        const normalizedValue = value.replace(',', '.');
                        setFormData({
                          ...formData,
                          kurs: normalizedValue === "" ? 0 : parseFloat(normalizedValue),
                        });
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        placeholder=""
                      />
                      <p className="mt-1 text-sm text-gray-500 font-mono">
                        Preview: Rp {formatCurrency(formData.kurs)}
                      </p>
                      </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total (IDR)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={`Rp ${formatCurrency(calculatedTotal)}`}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-right font-mono font-semibold text-gray-700"
                      />
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Informasi Nasabah
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Nasabah
                    </label>
                    <input
                      type="text"
                      name="nama_nasabah"
                      value={formData.nama_nasabah}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Nama lengkap nasabah"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Identitas
                    </label>
                    <select
                      name="tipe_identitas"
                      value={formData.tipe_identitas}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    >
                      <option value="KTP">KTP</option>
                      <option value="SIM">SIM</option>
                      <option value="Paspor">Paspor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. ID Nasabah
                    </label>
                    <input
                      type="text"
                      name="no_id_nasabah"
                      value={formData.no_id_nasabah}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Nomor identitas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Nama
                    </label>
                    <input
                      type="text"
                      name="id_nama"
                      value={formData.id_nama}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="ID nama"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Nasabah
                    </label>
                    <textarea
                      name="alamat_nasabah"
                      value={formData.alamat_nasabah}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Alamat lengkap nasabah"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Informasi Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan Kurir
                    </label>
                    <input
                      type="text"
                      name="keterangan_kurir"
                      value={formData.keterangan_kurir}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Keterangan kurir"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      name="curr"
                      value={formData.curr}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Currency code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Transaksi
                    </label>
                    <input
                      type="number"
                      name="jumlah_transaksi"
                      value={formData.jumlah_transaksi}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-right font-mono"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Cek Stok
                    </label>
                    <input
                      type="date"
                      name="tanggal_cek_stok"
                      value={formData.tanggal_cek_stok}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Perubahan Valas
                    </label>
                    <input
                      type="text"
                      name="perubahan_valas"
                      value={formData.perubahan_valas}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Catatan perubahan valas"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{isEdit ? "Update" : "Simpan"} Transaksi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
