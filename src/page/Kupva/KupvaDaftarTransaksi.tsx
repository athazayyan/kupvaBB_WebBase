import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";
import {
  Search,
  Filter,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Download,
  Plus,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";

interface MataUang {
  id: string;
  kode: string;
  nama: string;
}

interface Transaksi {
  id: string;
  kupva_id: string;
  mata_uang_id: string;
  no_nota: string;
  tanggal: string;
  no_id_nasabah: string;
  nominal: number;
  kurs: number;
  jenis_transaksi: "Beli" | "Jual";
  metode_pembayaran: "Cash" | "Transfer";
  total: number;
  nama_nasabah: string;
  alamat_nasabah: string;
  keterangan_kurir: string;
  id_nama: string;
  curr: string;
  kode_mc_bank: string;
  jumlah_transaksi: number;
  perubahan_valas: string;
  tanggal_cek_stok: string;
  tipe_identitas: string;
  created_at: string;
  mata_uang?: MataUang;
}

export default function KupvaDaftarTransaksi() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [filteredTransaksiList, setFilteredTransaksiList] = useState<
    Transaksi[]
  >([]);
  const [mataUangList, setMataUangList] = useState<MataUang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setCurrentKupvaId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState<"all" | "Beli" | "Jual">(
    "all"
  );
  const [filterMetode, setFilterMetode] = useState<"all" | "Cash" | "Transfer">(
    "all"
  );
  const [filterMataUang, setFilterMataUang] = useState<string>("all");
  const [filterTanggal, setFilterTanggal] = useState<string>("");
  const [sortBy, setSortBy] = useState<"tanggal" | "nominal" | "total">(
    "tanggal"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication
  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
  if (!token) {
    return <p>You need to log in as a Kupva user to access this page.</p>;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      SAR: "🇸🇦",
      AED: "🇦🇪",
      QAR: "🇶🇦",
      KWD: "🇰🇼",
      OMR: "🇴🇲",
    };
    return flags[kode] || "💰";
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
        if (!user) throw new Error("Not authenticated");

        // Get user's profile ID
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setCurrentKupvaId(profileData.id);

        // Fetch mata uang
        const { data: mataUangData, error: mataUangError } = await supabase
          .from("mata_uang")
          .select("*")
          .order("kode", { ascending: true });

        if (mataUangError) throw mataUangError;
        setMataUangList(mataUangData);

        // Fetch transaksi for this Kupva
        const { data: transaksiData, error: transaksiError } = await supabase
          .from("transaksi")
          .select(
            `
            *,
            mata_uang (id, kode, nama)
          `
          )
          .eq("kupva_id", profileData.id)
          .order("tanggal", { ascending: false });

        if (transaksiError) throw transaksiError;

        const formattedData = transaksiData.map((item: any) => ({
          ...item,
          mata_uang: item.mata_uang,
        }));

        setTransaksiList(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort effect
  useEffect(() => {
    let filtered = [...transaksiList];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaksi) =>
          transaksi.no_nota.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaksi.nama_nasabah
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaksi.no_id_nasabah
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaksi.mata_uang?.kode
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply jenis transaksi filter
    if (filterJenis !== "all") {
      filtered = filtered.filter(
        (transaksi) => transaksi.jenis_transaksi === filterJenis
      );
    }

    // Apply metode pembayaran filter
    if (filterMetode !== "all") {
      filtered = filtered.filter(
        (transaksi) => transaksi.metode_pembayaran === filterMetode
      );
    }

    // Apply mata uang filter
    if (filterMataUang !== "all") {
      filtered = filtered.filter(
        (transaksi) => transaksi.mata_uang_id === filterMataUang
      );
    }

    // Apply date filter
    if (filterTanggal) {
      const filterDate = new Date(filterTanggal);
      filtered = filtered.filter((transaksi) => {
        const transaksiDate = new Date(transaksi.tanggal);
        return transaksiDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "tanggal":
          aValue = new Date(a.tanggal).getTime();
          bValue = new Date(b.tanggal).getTime();
          break;
        case "nominal":
          aValue = a.nominal;
          bValue = b.nominal;
          break;
        case "total":
          aValue = a.total;
          bValue = b.total;
          break;
        default:
          aValue = new Date(a.tanggal).getTime();
          bValue = new Date(b.tanggal).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransaksiList(filtered);
  }, [
    transaksiList,
    searchTerm,
    filterJenis,
    filterMetode,
    filterMataUang,
    filterTanggal,
    sortBy,
    sortOrder,
  ]);

  const getStatistics = () => {
    const totalTransaksi = filteredTransaksiList.length;
    const totalBeli = filteredTransaksiList.filter(
      (t) => t.jenis_transaksi === "Beli"
    ).length;
    const totalJual = filteredTransaksiList.filter(
      (t) => t.jenis_transaksi === "Jual"
    ).length;
    const totalNominal = filteredTransaksiList.reduce(
      (sum, t) => sum + t.total,
      0
    );

    return { totalTransaksi, totalBeli, totalJual, totalNominal };
  };

  const { totalTransaksi, totalBeli, totalJual, totalNominal } =
    getStatistics();

  return (
    <div
      className="min-h-screen mt-16"
      style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
    >
      <NavbarKupva />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Daftar Transaksi
            </h1>
            <p className="text-gray-600">
              Kelola dan pantau semua transaksi valas Anda
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Transaksi
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalTransaksi}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Transaksi Beli
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalBeli}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Transaksi Jual
                  </p>
                  <p className="text-2xl font-bold text-red-600">{totalJual}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Nilai
                  </p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(totalNominal)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari no nota, nama, ID, mata uang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                  {showFilters ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                <button className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Jenis Transaksi Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Transaksi
                    </label>
                    <select
                      value={filterJenis}
                      onChange={(e) =>
                        setFilterJenis(
                          e.target.value as "all" | "Beli" | "Jual"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua</option>
                      <option value="Beli">Beli</option>
                      <option value="Jual">Jual</option>
                    </select>
                  </div>

                  {/* Metode Pembayaran Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metode Pembayaran
                    </label>
                    <select
                      value={filterMetode}
                      onChange={(e) =>
                        setFilterMetode(
                          e.target.value as "all" | "Cash" | "Transfer"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua</option>
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>

                  {/* Mata Uang Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Uang
                    </label>
                    <select
                      value={filterMataUang}
                      onChange={(e) => setFilterMataUang(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">Semua</option>
                      {mataUangList.map((mata_uang) => (
                        <option key={mata_uang.id} value={mata_uang.id}>
                          {getCurrencyFlag(mata_uang.kode)} {mata_uang.kode}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={filterTanggal}
                      onChange={(e) => setFilterTanggal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urutkan
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as "tanggal" | "nominal" | "total"
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="tanggal">Tanggal</option>
                        <option value="nominal">Nominal</option>
                        <option value="total">Total</option>
                      </select>
                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <span className="ml-3 text-gray-600">
                Memuat data transaksi...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {/* Transaksi Table */}
          {!loading && !error && (
            <>
              {filteredTransaksiList.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada transaksi
                  </h3>
                  <p className="text-gray-500">
                    Belum ada data transaksi atau tidak ada yang sesuai dengan
                    filter
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              No Nota
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              Tanggal
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              Nasabah
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              Mata Uang
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              Jenis
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              Nominal
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              Kurs
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              Total
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              Metode
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredTransaksiList.map((transaksi) => (
                            <tr
                              key={transaksi.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm text-blue-600">
                                  {transaksi.no_nota}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {formatDate(transaksi.tanggal)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaksi.nama_nasabah || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {transaksi.no_id_nasabah || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {getCurrencyFlag(
                                      transaksi.mata_uang?.kode || ""
                                    )}
                                  </span>
                                  <span className="font-medium">
                                    {transaksi.mata_uang?.kode || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaksi.jenis_transaksi === "Beli"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {transaksi.jenis_transaksi === "Beli" ? (
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                  )}
                                  {transaksi.jenis_transaksi}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-mono text-sm">
                                  {transaksi.nominal.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-mono text-sm">
                                  {transaksi.kurs.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(transaksi.total)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaksi.metode_pembayaran === "Cash"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  {transaksi.metode_pembayaran}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {filteredTransaksiList.map((transaksi) => (
                      <div
                        key={transaksi.id}
                        className="bg-white rounded-xl shadow-md p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getCurrencyFlag(transaksi.mata_uang?.kode || "")}
                            </span>
                            <span className="font-semibold">
                              {transaksi.mata_uang?.kode}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                transaksi.jenis_transaksi === "Beli"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaksi.jenis_transaksi}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-blue-600">
                            {transaksi.no_nota}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Nasabah:
                            </span>
                            <span className="text-sm font-medium">
                              {transaksi.nama_nasabah || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Tanggal:
                            </span>
                            <span className="text-sm">
                              {formatDate(transaksi.tanggal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Nominal:
                            </span>
                            <span className="text-sm font-mono">
                              {transaksi.nominal.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Kurs:</span>
                            <span className="text-sm font-mono">
                              {transaksi.kurs.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Total:
                            </span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(transaksi.total)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Metode:
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                transaksi.metode_pembayaran === "Cash"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {transaksi.metode_pembayaran}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <button className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
