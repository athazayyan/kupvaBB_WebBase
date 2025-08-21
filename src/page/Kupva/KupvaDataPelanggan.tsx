import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  DollarSign,
  User,
  MapPin,
  CreditCard,
  
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PelangganData {
  no_id_nasabah: string;
  nama_nasabah: string;
  alamat_nasabah: string;
  tipe_identitas: string;
  total_transaksi: number;
  jumlah_transaksi: number;
  transaksi_beli: number;
  transaksi_jual: number;
  rata_rata_transaksi: number;
  transaksi_pertama: string;
  transaksi_terakhir: string;
  mata_uang_terbanyak: string;
  metode_cash: number;
  metode_transfer: number;
  currencies: string[];
}

interface TransaksiDetail {
  id: string;
  no_nota: string;
  tanggal: string;
  nominal: number;
  kurs: number;
  total: number;
  jenis_transaksi: string;
  metode_pembayaran: string;
  mata_uang: {
    kode: string;
    nama: string;
  };
}

export default function KupvaDataPelanggan() {
  const [pelangganList, setPelangganList] = useState<PelangganData[]>([]);
  const [filteredPelangganList, setFilteredPelangganList] = useState<
    PelangganData[]
  >([]);
  const [selectedPelanggan, ] =
    useState<PelangganData | null>(null);
  const [transaksiDetail, setTransaksiDetail] = useState<TransaksiDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentKupvaId, setCurrentKupvaId] = useState<string | null>(null);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(
    new Set()
  );

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMinTransaksi, setFilterMinTransaksi] = useState<string>("");
  const [filterMinAmount, setFilterMinAmount] = useState<string>("");
  const [filterCurrency, setFilterCurrency] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "nama" | "total_transaksi" | "jumlah_transaksi" | "rata_rata_transaksi"
  >("total_transaksi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
      >
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 shadow-lg">
          <p className="text-red-600 text-lg font-medium">
            You need to log in as a Kupva user to access this page.
          </p>
        </div>
      </div>
    );
  }

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
    });
  };

  const formatDateTime = (dateString: string) => {
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

  const toggleCustomerExpansion = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
      // Fetch transaction details when expanding
      fetchTransaksiDetail(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  useEffect(() => {
    async function fetchPelangganData() {
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

        // Fetch aggregated customer data
        const { data: transaksiData, error: transaksiError } = await supabase
          .from("transaksi")
          .select(
            `
            no_id_nasabah,
            nama_nasabah,
            alamat_nasabah,
            tipe_identitas,
            nominal,
            total,
            jenis_transaksi,
            metode_pembayaran,
            tanggal,
            mata_uang (kode, nama)
          `
          )
          .eq("kupva_id", profileData.id)
          .not("no_id_nasabah", "is", null)
          .not("nama_nasabah", "is", null)
          .order("tanggal", { ascending: true });

        if (transaksiError) throw transaksiError;

        // Group and aggregate data by customer
        const customerMap = new Map<string, any>();

        transaksiData.forEach((transaksi: any) => {
          const customerId = transaksi.no_id_nasabah;

          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              no_id_nasabah: customerId,
              nama_nasabah: transaksi.nama_nasabah,
              alamat_nasabah: transaksi.alamat_nasabah,
              tipe_identitas: transaksi.tipe_identitas,
              transaksi_list: [],
              mata_uang_count: new Map(),
              currencies: new Set(),
            });
          }

          const customer = customerMap.get(customerId);
          customer.transaksi_list.push(transaksi);

          // Count mata uang usage
          const mataUangKode = transaksi.mata_uang?.kode || "Unknown";
          customer.mata_uang_count.set(
            mataUangKode,
            (customer.mata_uang_count.get(mataUangKode) || 0) + 1
          );
          customer.currencies.add(mataUangKode);
        });

        // Calculate aggregated statistics for each customer
        const aggregatedData: PelangganData[] = Array.from(
          customerMap.values()
        ).map((customer) => {
          const transaksiList = customer.transaksi_list;
          const jumlah_transaksi = transaksiList.length;
          const total_transaksi = transaksiList.reduce(
            (sum: number, t: any) => sum + t.total,
            0
          );
          const rata_rata_transaksi = total_transaksi / jumlah_transaksi;

          const transaksi_beli = transaksiList.filter(
            (t: any) => t.jenis_transaksi === "Beli"
          ).length;
          const transaksi_jual = transaksiList.filter(
            (t: any) => t.jenis_transaksi === "Jual"
          ).length;

          const metode_cash = transaksiList.filter(
            (t: any) => t.metode_pembayaran === "Cash"
          ).length;
          const metode_transfer = transaksiList.filter(
            (t: any) => t.metode_pembayaran === "Transfer"
          ).length;

          // Find most used currency
          let mata_uang_terbanyak = "N/A";
          let maxCount = 0;
          customer.mata_uang_count.forEach((count: number, kode: string) => {
            if (count > maxCount) {
              maxCount = count;
              mata_uang_terbanyak = kode;
            }
          });

          const transaksi_pertama = transaksiList[0]?.tanggal || "";
          const transaksi_terakhir =
            transaksiList[transaksiList.length - 1]?.tanggal || "";

          return {
            no_id_nasabah: customer.no_id_nasabah,
            nama_nasabah: customer.nama_nasabah,
            alamat_nasabah: customer.alamat_nasabah,
            tipe_identitas: customer.tipe_identitas,
            total_transaksi,
            jumlah_transaksi,
            transaksi_beli,
            transaksi_jual,
            rata_rata_transaksi,
            transaksi_pertama,
            transaksi_terakhir,
            mata_uang_terbanyak,
            metode_cash,
            metode_transfer,
            currencies: Array.from(customer.currencies),
          };
        });

        setPelangganList(aggregatedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPelangganData();
  }, []);

  // Filter and sort effect
  useEffect(() => {
    let filtered = [...pelangganList];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pelanggan) =>
          pelanggan.nama_nasabah
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pelanggan.no_id_nasabah
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pelanggan.alamat_nasabah
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply minimum transactions filter
    if (filterMinTransaksi) {
      const minTransaksi = parseInt(filterMinTransaksi);
      filtered = filtered.filter(
        (pelanggan) => pelanggan.jumlah_transaksi >= minTransaksi
      );
    }

    // Apply minimum amount filter
    if (filterMinAmount) {
      const minAmount = parseFloat(filterMinAmount);
      filtered = filtered.filter(
        (pelanggan) => pelanggan.total_transaksi >= minAmount
      );
    }

    // Apply currency filter
    if (filterCurrency) {
      filtered = filtered.filter((pelanggan) =>
        pelanggan.currencies.includes(filterCurrency)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "nama":
          aValue = a.nama_nasabah;
          bValue = b.nama_nasabah;
          break;
        case "total_transaksi":
          aValue = a.total_transaksi;
          bValue = b.total_transaksi;
          break;
        case "jumlah_transaksi":
          aValue = a.jumlah_transaksi;
          bValue = b.jumlah_transaksi;
          break;
        case "rata_rata_transaksi":
          aValue = a.rata_rata_transaksi;
          bValue = b.rata_rata_transaksi;
          break;
        default:
          aValue = a.total_transaksi;
          bValue = b.total_transaksi;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredPelangganList(filtered);
  }, [
    pelangganList,
    searchTerm,
    filterMinTransaksi,
    filterMinAmount,
    filterCurrency,
    sortBy,
    sortOrder,
  ]);

  const fetchTransaksiDetail = async (no_id_nasabah: string) => {
    try {
      const { data, error } = await supabase
        .from("transaksi")
        .select(
          `
          id,
          no_nota,
          tanggal,
          nominal,
          kurs,
          total,
          jenis_transaksi,
          metode_pembayaran,
          mata_uang (kode, nama)
        `
        )
        .eq("kupva_id", currentKupvaId)
        .eq("no_id_nasabah", no_id_nasabah)
        .order("tanggal", { ascending: false });

      if (error) throw error;

      // Map the data to ensure mata_uang is properly structured
      const formattedData = data.map((item: any) => ({
        ...item,
        mata_uang:
          item.mata_uang && item.mata_uang.length > 0
            ? item.mata_uang[0]
            : { kode: "", nama: "" },
      }));

      setTransaksiDetail(formattedData);
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
    }
  };


  const getStatistics = () => {
    const totalPelanggan = filteredPelangganList.length;
    const totalTransaksi = filteredPelangganList.reduce(
      (sum, p) => sum + p.jumlah_transaksi,
      0
    );
    const totalTransaksiValue = filteredPelangganList.reduce(
      (sum, p) => sum + p.total_transaksi,
      0
    );
    const avgTransaksiPerPelanggan =
      totalPelanggan > 0 ? totalTransaksi / totalPelanggan : 0;
    const totalBeli = filteredPelangganList.reduce(
      (sum, p) => sum + p.transaksi_beli,
      0
    );
    const totalJual = filteredPelangganList.reduce(
      (sum, p) => sum + p.transaksi_jual,
      0
    );

    return {
      totalPelanggan,
      totalTransaksi,
      totalTransaksiValue,
      avgTransaksiPerPelanggan,
      totalBeli,
      totalJual,
    };
  };

  const {
    totalPelanggan,
    totalTransaksi,
    totalTransaksiValue,
    totalBeli,
    totalJual,
  } = getStatistics();

  // Get unique currencies for filter
  const allCurrencies = Array.from(
    new Set(pelangganList.flatMap((p) => p.currencies))
  );

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
              Data Pelanggan
            </h1>
            <p className="text-gray-600">
              Kelola dan monitor data pelanggan beserta riwayat transaksi
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Pelanggan
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPelanggan}
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
                  <p className="text-2xl font-bold text-purple-600">
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
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(totalTransaksiValue)}
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
                  placeholder="Cari nama, ID, atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Toggle */}
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
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Min Transactions Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Transaksi
                    </label>
                    <input
                      type="number"
                      placeholder="Minimal transaksi"
                      value={filterMinTransaksi}
                      onChange={(e) => setFilterMinTransaksi(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Min Amount Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount (IDR)
                    </label>
                    <input
                      type="number"
                      placeholder="Minimal total transaksi"
                      value={filterMinAmount}
                      onChange={(e) => setFilterMinAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Currency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Uang
                    </label>
                    <select
                      value={filterCurrency}
                      onChange={(e) => setFilterCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Semua Mata Uang</option>
                      {allCurrencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {getCurrencyFlag(currency)} {currency}
                        </option>
                      ))}
                    </select>
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
                            e.target.value as
                              | "nama"
                              | "total_transaksi"
                              | "jumlah_transaksi"
                              | "rata_rata_transaksi"
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="total_transaksi">Total Transaksi</option>
                        <option value="nama">Nama</option>
                        <option value="jumlah_transaksi">
                          Jumlah Transaksi
                        </option>
                        <option value="rata_rata_transaksi">
                          Rata-rata Transaksi
                        </option>
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
                Memuat data pelanggan...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {/* Pelanggan Display */}
          {!loading && !error && (
            <>
              {filteredPelangganList.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada data pelanggan
                  </h3>
                  <p className="text-gray-500">
                    Belum ada data pelanggan atau tidak ada yang sesuai dengan
                    filter
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPelangganList.map((pelanggan) => (
                    <div
                      key={pelanggan.no_id_nasabah}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Customer Header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-teal-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-teal-100 rounded-full">
                                <User className="w-5 h-5 text-teal-600" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {pelanggan.nama_nasabah}
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span>
                                  {pelanggan.tipe_identitas}:{" "}
                                  {pelanggan.no_id_nasabah}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{pelanggan.alamat_nasabah || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Periode:{" "}
                                  {formatDate(pelanggan.transaksi_pertama)} -{" "}
                                  {formatDate(pelanggan.transaksi_terakhir)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                  Mata Uang: {pelanggan.currencies.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {pelanggan.jumlah_transaksi} Transaksi
                            </p>
                            <p className="text-teal-600 font-medium">
                              {formatCurrency(pelanggan.total_transaksi)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Avg:{" "}
                              {formatCurrency(pelanggan.rata_rata_transaksi)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Summary */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-600">Beli</p>
                            <p className="font-semibold text-green-600">
                              {pelanggan.transaksi_beli}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            </div>
                            <p className="text-sm text-gray-600">Jual</p>
                            <p className="font-semibold text-red-600">
                              {pelanggan.transaksi_jual}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <DollarSign className="w-4 h-4 text-yellow-600" />
                            </div>
                            <p className="text-sm text-gray-600">Cash</p>
                            <p className="font-semibold text-yellow-600">
                              {pelanggan.metode_cash}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">Transfer</p>
                            <p className="font-semibold text-blue-600">
                              {pelanggan.metode_transfer}
                            </p>
                          </div>
                        </div>

                        {/* Detail Transaction Toggle */}
                        <div className="border-t border-gray-200 pt-4">
                          <button
                            onClick={() =>
                              toggleCustomerExpansion(pelanggan.no_id_nasabah)
                            }
                            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>
                              {expandedCustomers.has(pelanggan.no_id_nasabah)
                                ? "Sembunyikan Detail Transaksi"
                                : "Lihat Detail Transaksi"}
                            </span>
                            {expandedCustomers.has(pelanggan.no_id_nasabah) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Detailed Transactions */}
                        {expandedCustomers.has(pelanggan.no_id_nasabah) && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              Detail Transaksi ({transaksiDetail.length})
                            </h4>

                            {transaksiDetail.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        No Nota
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tanggal
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
                                    {transaksiDetail.map((transaksi, index) => (
                                      <tr
                                        key={transaksi.id}
                                        className={
                                          index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                        }
                                      >
                                        <td className="px-4 py-3">
                                          <span className="font-mono text-sm text-blue-600">
                                            {transaksi.no_nota}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="text-sm text-gray-900">
                                            {formatDateTime(transaksi.tanggal)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                              {getCurrencyFlag(
                                                transaksi.mata_uang?.kode || ""
                                              )}
                                            </span>
                                            <span className="font-medium text-sm">
                                              {transaksi.mata_uang?.kode ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              transaksi.jenis_transaksi ===
                                              "Beli"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {transaksi.jenis_transaksi ===
                                            "Beli" ? (
                                              <TrendingUp className="w-3 h-3 mr-1" />
                                            ) : (
                                              <TrendingDown className="w-3 h-3 mr-1" />
                                            )}
                                            {transaksi.jenis_transaksi}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <span className="font-mono text-sm">
                                            {transaksi.nominal.toLocaleString(
                                              "id-ID"
                                            )}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <span className="font-mono text-sm">
                                            {transaksi.kurs.toLocaleString(
                                              "id-ID"
                                            )}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <span className="font-semibold text-gray-900">
                                            {formatCurrency(transaksi.total)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              transaksi.metode_pembayaran ===
                                              "Cash"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}
                                          >
                                            <CreditCard className="w-3 h-3 mr-1" />
                                            {transaksi.metode_pembayaran}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 py-8">
                                Tidak ada detail transaksi
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal (kept for backward compatibility) */}
      {showDetailModal && selectedPelanggan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detail Pelanggan: {selectedPelanggan.nama_nasabah}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Informasi Pelanggan
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">
                        {selectedPelanggan.nama_nasabah}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono">
                        {selectedPelanggan.no_id_nasabah}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipe ID:</span>
                      <span>{selectedPelanggan.tipe_identitas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alamat:</span>
                      <span className="text-right">
                        {selectedPelanggan.alamat_nasabah || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Statistik Transaksi
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Transaksi:</span>
                      <span className="font-medium">
                        {selectedPelanggan.jumlah_transaksi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Nilai:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPelanggan.total_transaksi)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rata-rata:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPelanggan.rata_rata_transaksi)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mata Uang Favorit:</span>
                      <span className="font-medium">
                        {selectedPelanggan.mata_uang_terbanyak}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Transaksi</div>
                  <div className="text-xl font-bold text-blue-600">
                    {selectedPelanggan.jumlah_transaksi}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Transaksi Beli</div>
                  <div className="text-xl font-bold text-green-600">
                    {selectedPelanggan.transaksi_beli}
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Transaksi Jual</div>
                  <div className="text-xl font-bold text-red-600">
                    {selectedPelanggan.transaksi_jual}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Nilai</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(selectedPelanggan.total_transaksi)}
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Riwayat Transaksi
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {transaksiDetail.length > 0 ? (
                    <div className="space-y-3">
                      {transaksiDetail.map((transaksi) => (
                        <div
                          key={transaksi.id}
                          className="bg-white rounded-lg p-3 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-mono text-sm text-blue-600">
                                {transaksi.no_nota}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(transaksi.tanggal)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {formatCurrency(transaksi.total)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaksi.mata_uang.kode} -{" "}
                                {transaksi.jenis_transaksi}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Tidak ada data transaksi
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
