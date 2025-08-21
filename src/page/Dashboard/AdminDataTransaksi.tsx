import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  CreditCard,
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
  created_at: string;
  tipe_identitas: string;
  profile?: {
    nama: string;
  };
  mata_uang?: MataUang;
}

interface KupvaGroup {
  kupvaId: string;
  kupvaName: string;
  transactions: Transaksi[];
  totalTransactions: number;
  totalAmount: number;
  totalBeli: number;
  totalJual: number;
  totalCash: number;
  totalTransfer: number;
}

export default function AdminDataTransaksi() {
  const [transactions, setTransactions] = useState<KupvaGroup[]>([]);
  const [kupvaOptions, setKupvaOptions] = useState<any[]>([]);
  const [mataUangOptions, setMataUangOptions] = useState<MataUang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    kupvaId: "",
    mataUangId: "",
    jenisTransaksi: "",
    metodePembayaran: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
      >
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 shadow-lg">
          <p className="text-red-600 text-lg font-medium">
            You need to log in as an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchKupvaOptions(),
        fetchMataUangOptions(),
        fetchTransactions(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchKupvaOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("id, nama")
        .eq("role", "kupva")
        .order("nama");

      if (error) throw error;
      setKupvaOptions(data || []);
    } catch (error) {
      console.error("Error fetching Kupva options:", error);
    }
  };

  const fetchMataUangOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("mata_uang")
        .select("*")
        .order("kode");

      if (error) throw error;
      setMataUangOptions(data || []);
    } catch (error) {
      console.error("Error fetching mata uang options:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query with filters
      let query = supabase
        .from("transaksi")
        .select(
          `
          *,
          profile:kupva_id (nama),
          mata_uang:mata_uang_id (id, kode, nama)
        `
        )
        .order("tanggal", { ascending: false });

      // Apply filters
      if (filters.kupvaId) {
        query = query.eq("kupva_id", filters.kupvaId);
      }

      if (filters.mataUangId) {
        query = query.eq("mata_uang_id", filters.mataUangId);
      }

      if (filters.jenisTransaksi) {
        query = query.eq("jenis_transaksi", filters.jenisTransaksi);
      }

      if (filters.metodePembayaran) {
        query = query.eq("metode_pembayaran", filters.metodePembayaran);
      }

      if (filters.dateFrom) {
        query = query.gte("tanggal", filters.dateFrom);
      }

      if (filters.dateTo) {
        const nextDay = new Date(filters.dateTo);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt("tanggal", nextDay.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setTransactions([]);
        return;
      }

      // Apply search filter
      let filteredData = data;
      if (searchTerm) {
        filteredData = data.filter(
          (transaction: any) =>
            transaction.no_nota
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            transaction.nama_nasabah
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            transaction.no_id_nasabah
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            transaction.profile?.nama
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            transaction.mata_uang?.kode
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      // Group by Kupva
      const groupedData = filteredData.reduce(
        (acc: Record<string, any>, transaction: any) => {
          const kupvaId = transaction.kupva_id;
          const kupvaName = transaction.profile?.nama || "Unknown";

          if (!acc[kupvaId]) {
            acc[kupvaId] = {
              kupvaId,
              kupvaName,
              transactions: [],
              totalTransactions: 0,
              totalAmount: 0,
              totalBeli: 0,
              totalJual: 0,
              totalCash: 0,
              totalTransfer: 0,
            };
          }

          acc[kupvaId].transactions.push(transaction);
          acc[kupvaId].totalTransactions += 1;
          acc[kupvaId].totalAmount += transaction.total || 0;

          if (transaction.jenis_transaksi === "Beli")
            acc[kupvaId].totalBeli += 1;
          if (transaction.jenis_transaksi === "Jual")
            acc[kupvaId].totalJual += 1;
          if (transaction.metode_pembayaran === "Cash")
            acc[kupvaId].totalCash += 1;
          if (transaction.metode_pembayaran === "Transfer")
            acc[kupvaId].totalTransfer += 1;

          return acc;
        },
        {}
      );

      const groupedArray = Object.values(groupedData) as KupvaGroup[];
      setTransactions(groupedArray);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      setError(error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilters({
      kupvaId: "",
      mataUangId: "",
      jenisTransaksi: "",
      metodePembayaran: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchTerm("");
    setTimeout(() => {
      fetchTransactions();
    }, 100);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    };
    return flags[kode] || "💰";
  };

  const exportToCSV = () => {
    const csvData = [];
    const headers = [
      "No Nota",
      "Tanggal",
      "Kupva",
      "Nama Nasabah",
      "ID Nasabah",
      "Mata Uang",
      "Jenis Transaksi",
      "Nominal",
      "Kurs",
      "Total",
      "Metode Pembayaran",
      "Alamat Nasabah",
    ];
    csvData.push(headers.join(","));

    transactions.forEach((group) => {
      group.transactions.forEach((transaction: Transaksi) => {
        const row = [
          transaction.no_nota,
          formatDate(transaction.tanggal),
          group.kupvaName,
          transaction.nama_nasabah || "",
          transaction.no_id_nasabah || "",
          transaction.mata_uang?.kode || "",
          transaction.jenis_transaksi,
          transaction.nominal,
          transaction.kurs,
          transaction.total,
          transaction.metode_pembayaran,
          transaction.alamat_nasabah || "",
        ];
        csvData.push(row.join(","));
      });
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_transaksi_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOverallStatistics = () => {
    const totalKupva = transactions.length;
    const totalTransaksi = transactions.reduce(
      (sum, group) => sum + group.totalTransactions,
      0
    );
    const totalNilai = transactions.reduce(
      (sum, group) => sum + group.totalAmount,
      0
    );
    const totalBeli = transactions.reduce(
      (sum, group) => sum + group.totalBeli,
      0
    );
    const totalJual = transactions.reduce(
      (sum, group) => sum + group.totalJual,
      0
    );

    return { totalKupva, totalTransaksi, totalNilai, totalBeli, totalJual };
  };

  const { totalKupva, totalTransaksi, totalNilai, totalBeli, totalJual } =
    getOverallStatistics();

  return (
    <div
      className="min-h-screen mt-16"
      style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
    >
      <NavbarAdmin />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Data Transaksi Admin
            </h1>
            <p className="text-gray-600">
              Monitor semua transaksi valas dari seluruh money changer
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Kupva
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalKupva}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

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
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
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
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(totalNilai)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-orange-600" />
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
                  placeholder="Cari no nota, nama, ID..."
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

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Kupva Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Money Changer
                    </label>
                    <select
                      name="kupvaId"
                      value={filters.kupvaId}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Semua Kupva</option>
                      {kupvaOptions.map((kupva) => (
                        <option key={kupva.id} value={kupva.id}>
                          {kupva.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mata Uang Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Uang
                    </label>
                    <select
                      name="mataUangId"
                      value={filters.mataUangId}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Semua Mata Uang</option>
                      {mataUangOptions.map((mataUang) => (
                        <option key={mataUang.id} value={mataUang.id}>
                          {getCurrencyFlag(mataUang.kode)} {mataUang.kode} -{" "}
                          {mataUang.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jenis Transaksi Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Transaksi
                    </label>
                    <select
                      name="jenisTransaksi"
                      value={filters.jenisTransaksi}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Semua Jenis</option>
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
                      name="metodePembayaran"
                      value={filters.metodePembayaran}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Semua Metode</option>
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={applyFilters}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Terapkan Filter
                  </button>
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Reset Filter
                  </button>
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

          {/* Transactions Display */}
          {!loading && !error && (
            <>
              {transactions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada data transaksi
                  </h3>
                  <p className="text-gray-500">
                    Belum ada transaksi atau tidak ada yang sesuai dengan filter
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {transactions.map((group) => (
                    <div
                      key={group.kupvaId}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Kupva Header */}
                      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {group.kupvaName}
                            </h3>
                            <p className="text-teal-100 text-sm">
                              Money Changer
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {group.totalTransactions} Transaksi
                            </p>
                            <p className="text-teal-100 text-sm">
                              {group.totalBeli} Beli • {group.totalJual} Jual
                            </p>
                            <p className="text-teal-100 text-sm">
                              Total: {formatCurrency(group.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Transactions Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                No Nota
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tanggal
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nasabah
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Mata Uang
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Jenis
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Nominal
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Kurs
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Total
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Metode
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {group.transactions.map((transaction, index) => (
                              <tr
                                key={transaction.id}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <td className="px-4 py-3">
                                  <span className="font-mono text-sm text-blue-600">
                                    {transaction.no_nota}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-900">
                                    {formatDate(transaction.tanggal)}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {transaction.nama_nasabah || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {transaction.no_id_nasabah || "N/A"}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {getCurrencyFlag(
                                        transaction.mata_uang?.kode || ""
                                      )}
                                    </span>
                                    <span className="font-medium">
                                      {transaction.mata_uang?.kode || "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      transaction.jenis_transaksi === "Beli"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {transaction.jenis_transaksi === "Beli" ? (
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                    )}
                                    {transaction.jenis_transaksi}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-mono text-sm">
                                    {transaction.nominal.toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-mono text-sm">
                                    {transaction.kurs.toLocaleString("id-ID")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(transaction.total)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      transaction.metode_pembayaran === "Cash"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    {transaction.metode_pembayaran}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
