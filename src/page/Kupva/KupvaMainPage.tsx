import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Coins,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Legend,
  Pie,
} from "recharts";

interface TransactionData {
  tanggal: string;
  total_beli: number;
  total_jual: number;
  jumlah_beli: number;
  jumlah_jual: number;
  total_value: number;
}

interface CurrencyData {
  kode: string;
  nama: string;
  beli: number;
  jual: number;
  last_updated: string;
  transactions_count: number;
  total_volume: number;
}

interface DashboardStats {
  totalTransaksi: number;
  totalValue: number;
  totalPelanggan: number;
  avgTransactionValue: number;
  todayTransactions: number;
  monthlyGrowth: number;
}

interface CurrencyTransactionData {
  currency: string;
  beli: number;
  jual: number;
  total: number;
  volume: number;
}

export default function KupvaMainPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTransaksi: 0,
    totalValue: 0,
    totalPelanggan: 0,
    avgTransactionValue: 0,
    todayTransactions: 0,
    monthlyGrowth: 0,
  });
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([]);
  const [currencyTransactions, setCurrencyTransactions] = useState<
    CurrencyTransactionData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setCurrentKupvaId] = useState<string | null>(null);
  const [kupvaName, setKupvaName] = useState<string>("Kupva User");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7");

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
    if (typeof value !== "number" || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (typeof value !== "number" || isNaN(value)) return "0";
    return value.toLocaleString("id-ID");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
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

  const getKupvaName = () => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      return decodedToken.nama || decodedToken.email || "Kupva User";
    } catch (error) {
      return "Kupva User";
    }
  };

  useEffect(() => {
    setKupvaName(getKupvaName());
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

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
        .select("id, nama")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentKupvaId(profileData.id);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(selectedPeriod));

      // Fetch transaction data for charts
      const { data: transactionData, error: transactionError } = await supabase
        .from("transaksi")
        .select(
          `
          tanggal,
          total,
          jenis_transaksi,
          mata_uang (kode, nama),
          no_id_nasabah
        `
        )
        .eq("kupva_id", profileData.id)
        .gte("tanggal", startDate.toISOString())
        .lte("tanggal", endDate.toISOString())
        .order("tanggal");

      if (transactionError) throw transactionError;

      // Fetch all transactions for stats
      const { data: allTransactions, error: allTransError } = await supabase
        .from("transaksi")
        .select(
          `
          total,
          tanggal,
          no_id_nasabah,
          jenis_transaksi
        `
        )
        .eq("kupva_id", profileData.id);

      if (allTransError) throw allTransError;

      // Fetch currency rates
      const { data: currencyRates, error: currencyError } = await supabase
        .from("mata_uang")
        .select("*")
        .order("kode");

      if (currencyError) throw currencyError;

      console.log("Currency rates from DB:", currencyRates);
      console.log("Transaction data:", transactionData);

      // Process data with null checks
      processTransactionData(transactionData || []);
      processCurrencyData(currencyRates || [], transactionData || []);
      calculateDashboardStats(allTransactions || [], transactionData || []);
      processCurrencyTransactions(transactionData || []);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionData = (data: any[]) => {
    const dailyData = new Map<string, any>();

    data.forEach((transaction) => {
      const date = new Date(transaction.tanggal).toISOString().split("T")[0];

      if (!dailyData.has(date)) {
        dailyData.set(date, {
          tanggal: date,
          total_beli: 0,
          total_jual: 0,
          jumlah_beli: 0,
          jumlah_jual: 0,
          total_value: 0,
        });
      }

      const dayData = dailyData.get(date);
      const total = transaction.total || 0;

      if (transaction.jenis_transaksi === "Beli") {
        dayData.total_beli += total;
        dayData.jumlah_beli += 1;
      } else {
        dayData.total_jual += total;
        dayData.jumlah_jual += 1;
      }
      dayData.total_value += total;
    });

    const processedData = Array.from(dailyData.values()).sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );

    setTransactionData(processedData);
  };

  const processCurrencyData = (rates: any[], transactions: any[]) => {
    const currencyMap = new Map();

    // Initialize with rates - add null checks
    rates.forEach((rate) => {
      if (rate && rate.kode) {
        currencyMap.set(rate.kode, {
          kode: rate.kode,
          nama: rate.nama || "Unknown",
          beli: Number(rate.beli) || 0,
          jual: Number(rate.jual) || 0,
          last_updated: rate.updated_at || rate.created_at || "",
          transactions_count: 0,
          total_volume: 0,
        });
      }
    });

    // Add transaction data
    transactions.forEach((transaction) => {
      const currencyCode = transaction.mata_uang?.kode;
      if (currencyCode && currencyMap.has(currencyCode)) {
        const currency = currencyMap.get(currencyCode);
        currency.transactions_count += 1;
        currency.total_volume += transaction.total || 0;
      }
    });

    console.log("Processed currency data:", Array.from(currencyMap.values()));

    // Only show currencies that have been used in transactions
    setCurrencyData(
      Array.from(currencyMap.values()).filter((c) => c.transactions_count > 0)
    );
  };

  const processCurrencyTransactions = (data: any[]) => {
    const currencyMap = new Map<string, any>();

    data.forEach((transaction) => {
      const currency = transaction.mata_uang?.kode || "Unknown";

      if (!currencyMap.has(currency)) {
        currencyMap.set(currency, {
          currency,
          beli: 0,
          jual: 0,
          total: 0,
          volume: 0,
        });
      }

      const currData = currencyMap.get(currency);
      const total = transaction.total || 0;

      if (transaction.jenis_transaksi === "Beli") {
        currData.beli += total;
      } else {
        currData.jual += total;
      }
      currData.total += total;
      currData.volume += 1;
    });

    setCurrencyTransactions(Array.from(currencyMap.values()));
  };

  const calculateDashboardStats = (
    allTransactions: any[],
    periodTransactions: any[]
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const todayTrans = allTransactions.filter(
      (t) => new Date(t.tanggal).toISOString().split("T")[0] === today
    );

    const uniqueCustomers = new Set(
      allTransactions.filter((t) => t.no_id_nasabah).map((t) => t.no_id_nasabah)
    ).size;

    const totalValue = allTransactions.reduce(
      (sum, t) => sum + (t.total || 0),
      0
    );
    const totalTransaksi = allTransactions.length;
    const avgValue = totalTransaksi > 0 ? totalValue / totalTransaksi : 0;

    // Calculate monthly growth (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthTransactions = allTransactions.filter(
      (t) => new Date(t.tanggal) >= lastMonth
    );
    const monthlyGrowth =
      lastMonthTransactions.length > 0
        ? (periodTransactions.length / lastMonthTransactions.length - 1) * 100
        : 0;

    setDashboardStats({
      totalTransaksi,
      totalValue,
      totalPelanggan: uniqueCustomers,
      avgTransactionValue: avgValue,
      todayTransactions: todayTrans.length,
      monthlyGrowth,
    });
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  if (loading) {
    return (
      <div
        className="min-h-screen mt-16"
        style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
      >
        <NavbarKupva />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-gray-600">Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Selamat Datang, {kupvaName}
                </h1>
                <p className="text-gray-600">
                  Dashboard analisis transaksi dan kurs mata uang
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="7">7 Hari Terakhir</option>
                  <option value="14">14 Hari Terakhir</option>
                  <option value="30">30 Hari Terakhir</option>
                  <option value="90">90 Hari Terakhir</option>
                </select>
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Transaksi
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.totalTransaksi}
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
                    Total Nilai
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(dashboardStats.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Pelanggan
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats.totalPelanggan}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Rata-rata Transaksi
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(dashboardStats.avgTransactionValue)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Transaksi Hari Ini
                  </p>
                  <p className="text-2xl font-bold text-teal-600">
                    {dashboardStats.todayTransactions}
                  </p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pertumbuhan
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      dashboardStats.monthlyGrowth >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {dashboardStats.monthlyGrowth >= 0 ? "+" : ""}
                    {dashboardStats.monthlyGrowth.toFixed(1)}%
                  </p>
                </div>
                <div
                  className={`p-3 ${
                    dashboardStats.monthlyGrowth >= 0
                      ? "bg-green-100"
                      : "bg-red-100"
                  } rounded-full`}
                >
                  {dashboardStats.monthlyGrowth >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Transaction Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Tren Transaksi
                </h3>
              </div>
              {transactionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="tanggal"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), ""]}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_beli"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Beli"
                    />
                    <Area
                      type="monotone"
                      dataKey="total_jual"
                      stackId="1"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                      name="Jual"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada data transaksi untuk ditampilkan
                </div>
              )}
            </div>

            {/* Currency Transaction Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Distribusi Mata Uang
                </h3>
              </div>
              {currencyTransactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={currencyTransactions}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      label={({ currency, percent }) =>
                        `${currency} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                    >
                      {currencyTransactions.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(value),
                        "Total",
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada data distribusi mata uang
                </div>
              )}
            </div>
          </div>

          {/* Detailed Charts */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Volume by Currency */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Volume Transaksi per Mata Uang
                </h3>
              </div>
              {currencyTransactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={currencyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="currency" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        formatCurrency(value),
                        name === "beli" ? "Beli" : "Jual",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="beli" fill="#10B981" name="Beli" />
                    <Bar dataKey="jual" fill="#EF4444" name="Jual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada data volume transaksi
                </div>
              )}
            </div>
          </div>

          {/* Currency Rates Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Coins className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Kurs Mata Uang Aktif
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Uang
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kurs Beli
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kurs Jual
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spread
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaksi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currencyData.map((currency, index) => {
                    const spread =
                      currency.beli > 0
                        ? (
                            ((currency.jual - currency.beli) / currency.beli) *
                            100
                          ).toFixed(2)
                        : "0.00";

                    return (
                      <tr
                        key={currency.kode}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">
                              {getCurrencyFlag(currency.kode)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {currency.kode}
                              </div>
                              <div className="text-sm text-gray-500">
                                {currency.nama}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-mono text-gray-900">
                            {formatNumber(currency.beli)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-mono text-gray-900">
                            {formatNumber(currency.jual)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {spread}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">
                            {currency.transactions_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(currency.total_volume)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {currencyData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada mata uang yang diperdagangkan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
