import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Calendar,
  MapPin,
  CreditCard,
  Activity,
  ChevronDown,
  ChevronUp,

} from "lucide-react";

interface Transaction {
  id: string;
  no_nota: string;
  tanggal: string;
  nama_nasabah: string;
  no_id_nasabah: string;
  alamat_nasabah: string;
  jenis_transaksi: "Beli" | "Jual";
  nominal: number;
  kurs: number;
  total: number;
  metode_pembayaran: "Cash" | "Transfer";
  curr: string;
  jumlah_transaksi: number;
  tipe_identitas: string;
  mata_uang?: {
    kode: string;
    nama: string;
  };
  profile?: {
    nama: string;
  };
}

interface CustomerAnalysis {
  customerId: string;
  customerName: string;
  customerAddress: string;
  identityType: string;
  transactions: Transaction[];
  totalTransactions: number;
  totalAmount: number;
  totalBeli: number;
  totalJual: number;
  totalCash: number;
  totalTransfer: number;
  currencies: string[];
  transactionDays: number;
  avgTransactionAmount: number;
  maxSingleTransaction: number;
  suspiciousFlags: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  firstTransaction: string;
  lastTransaction: string;
}

const AML_THRESHOLDS = {
  SINGLE_TRANSACTION_CASH: 100000000, // Rp 100 juta
  DAILY_CASH_LIMIT: 500000000, // Rp 500 juta per hari
  MONTHLY_LIMIT: 2500000000, // Rp 2.5 miliar per bulan
  FREQUENCY_THRESHOLD: 10, // 10+ transaksi per hari
  STRUCTURED_AMOUNT: 50000000, // Rp 50 juta (structured transaction)
  RAPID_TRANSACTION_MINUTES: 30, // Transaksi berurutan dalam 30 menit
};

export default function AdminDataPelanggan() {
  const [customers, setCustomers] = useState<CustomerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    riskLevel: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    currency: "",
    transactionType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(
    new Set()
  );

  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
      >
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 shadow-lg">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">
            You need to log in as an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const toggleCustomerExpansion = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("transaksi")
        .select(
          `
          id, 
          no_nota,
          tanggal,
          nama_nasabah,
          no_id_nasabah,
          alamat_nasabah,
          jenis_transaksi,
          nominal,
          kurs,
          total,
          metode_pembayaran,
          curr,
          jumlah_transaksi,
          tipe_identitas,
          mata_uang:mata_uang_id (kode, nama),
          profile:kupva_id (nama)
        `
        )
        .order("tanggal", { ascending: false });

      // Apply date filters
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
        setCustomers([]);
        return;
      }

      // Group by customer ID and analyze
      const customerMap = new Map<string, CustomerAnalysis>();

      data.forEach((transaction: any) => {
        const customerId = transaction.no_id_nasabah;
        if (!customerId) return;

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customerId,
            customerName: transaction.nama_nasabah || "Unknown",
            customerAddress: transaction.alamat_nasabah || "Unknown",
            identityType: transaction.tipe_identitas || "KTP",
            transactions: [],
            totalTransactions: 0,
            totalAmount: 0,
            totalBeli: 0,
            totalJual: 0,
            totalCash: 0,
            totalTransfer: 0,
            currencies: [],
            transactionDays: 0,
            avgTransactionAmount: 0,
            maxSingleTransaction: 0,
            suspiciousFlags: [],
            riskLevel: "LOW",
            firstTransaction: "",
            lastTransaction: "",
          });
        }

        const customer = customerMap.get(customerId)!;
        customer.transactions.push(transaction);
        customer.totalTransactions += 1;
        customer.totalAmount += transaction.total || 0;

        if (transaction.jenis_transaksi === "Beli") customer.totalBeli += 1;
        if (transaction.jenis_transaksi === "Jual") customer.totalJual += 1;
        if (transaction.metode_pembayaran === "Cash") customer.totalCash += 1;
        if (transaction.metode_pembayaran === "Transfer")
          customer.totalTransfer += 1;

        // Track currencies
        const currency = transaction.mata_uang?.kode || transaction.curr;
        if (currency && !customer.currencies.includes(currency)) {
          customer.currencies.push(currency);
        }

        // Track max single transaction
        if (transaction.total > customer.maxSingleTransaction) {
          customer.maxSingleTransaction = transaction.total;
        }
      });

      // Analyze each customer for AML compliance
      const analyzedCustomers = Array.from(customerMap.values()).map(
        (customer) => {
          return analyzeCustomerRisk(customer);
        }
      );

      // Apply filters
      let filteredCustomers = analyzedCustomers;

      if (searchTerm) {
        filteredCustomers = analyzedCustomers.filter(
          (customer) =>
            customer.customerName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            customer.customerId
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            customer.customerAddress
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      if (filters.riskLevel) {
        filteredCustomers = filteredCustomers.filter(
          (customer) => customer.riskLevel === filters.riskLevel
        );
      }

      if (filters.minAmount) {
        filteredCustomers = filteredCustomers.filter(
          (customer) => customer.totalAmount >= parseFloat(filters.minAmount)
        );
      }

      if (filters.maxAmount) {
        filteredCustomers = filteredCustomers.filter(
          (customer) => customer.totalAmount <= parseFloat(filters.maxAmount)
        );
      }

      // Sort by risk level and total amount
      filteredCustomers.sort((a, b) => {
        const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        }
        return b.totalAmount - a.totalAmount;
      });

      setCustomers(filteredCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const analyzeCustomerRisk = (
    customer: CustomerAnalysis
  ): CustomerAnalysis => {
    const flags: string[] = [];
    let riskScore = 0;

    // Sort transactions by date
    customer.transactions.sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
    customer.firstTransaction = customer.transactions[0]?.tanggal || "";
    customer.lastTransaction =
      customer.transactions[customer.transactions.length - 1]?.tanggal || "";

    // Calculate average transaction amount
    customer.avgTransactionAmount =
      customer.totalAmount / customer.totalTransactions;

    // Calculate transaction days
    const uniqueDays = new Set(
      customer.transactions.map((t) => t.tanggal.split("T")[0])
    );
    customer.transactionDays = uniqueDays.size;

    // AML Risk Analysis

    // 1. Large Cash Transactions (UU No. 8/2010 - Transaksi Tunai Besar)
    const largeCashTransactions = customer.transactions.filter(
      (t) =>
        t.metode_pembayaran === "Cash" &&
        t.total >= AML_THRESHOLDS.SINGLE_TRANSACTION_CASH
    );
    if (largeCashTransactions.length > 0) {
      flags.push(
        `${largeCashTransactions.length} transaksi tunai ≥ Rp 100 juta`
      );
      riskScore += largeCashTransactions.length * 3;
    }

    // 2. Structured Transactions (Penghindaran Pelaporan)
    const structuredTransactions = customer.transactions.filter(
      (t) =>
        t.total >= AML_THRESHOLDS.STRUCTURED_AMOUNT &&
        t.total < AML_THRESHOLDS.SINGLE_TRANSACTION_CASH
    );
    if (structuredTransactions.length >= 3) {
      flags.push(
        `${structuredTransactions.length} kemungkinan structured transactions`
      );
      riskScore += 2;
    }

    // 3. High Frequency Trading (Transaksi Berulang)
    const dailyTransactionCounts = new Map<string, number>();
    customer.transactions.forEach((t) => {
      const date = t.tanggal.split("T")[0];
      dailyTransactionCounts.set(
        date,
        (dailyTransactionCounts.get(date) || 0) + 1
      );
    });

    const highFrequencyDays = Array.from(
      dailyTransactionCounts.values()
    ).filter((count) => count >= AML_THRESHOLDS.FREQUENCY_THRESHOLD);
    if (highFrequencyDays.length > 0) {
      flags.push(`${highFrequencyDays.length} hari dengan ≥10 transaksi`);
      riskScore += highFrequencyDays.length;
    }

    // 4. Rapid Successive Transactions
    let rapidTransactions = 0;
    for (let i = 1; i < customer.transactions.length; i++) {
      const prevTime = new Date(customer.transactions[i - 1].tanggal).getTime();
      const currTime = new Date(customer.transactions[i].tanggal).getTime();
      const diffMinutes = (currTime - prevTime) / (1000 * 60);

      if (diffMinutes <= AML_THRESHOLDS.RAPID_TRANSACTION_MINUTES) {
        rapidTransactions++;
      }
    }
    if (rapidTransactions >= 3) {
      flags.push(`${rapidTransactions} transaksi berurutan dalam <30 menit`);
      riskScore += 1;
    }

    // 5. Multiple Currency Usage (Potensi Layering)
    if (customer.currencies.length >= 4) {
      flags.push(`Menggunakan ${customer.currencies.length} mata uang berbeda`);
      riskScore += 1;
    }

    // 6. Monthly Transaction Volume
    const monthlyVolumes = new Map<string, number>();
    customer.transactions.forEach((t) => {
      const month = t.tanggal.substring(0, 7); // YYYY-MM
      monthlyVolumes.set(month, (monthlyVolumes.get(month) || 0) + t.total);
    });

    const highVolumeMonths = Array.from(monthlyVolumes.values()).filter(
      (volume) => volume >= AML_THRESHOLDS.MONTHLY_LIMIT
    );
    if (highVolumeMonths.length > 0) {
      flags.push(
        `${highVolumeMonths.length} bulan dengan volume ≥ Rp 2.5 miliar`
      );
      riskScore += highVolumeMonths.length * 2;
    }

    // 7. Cash-Heavy Pattern (Preferensi Tunai)
    const cashRatio = customer.totalCash / customer.totalTransactions;
    if (cashRatio >= 0.8 && customer.totalTransactions >= 5) {
      flags.push(
        `${(cashRatio * 100).toFixed(0)}% transaksi menggunakan tunai`
      );
      riskScore += 1;
    }

    // 8. Round Number Pattern (Pola Angka Bulat)
    const roundNumberTransactions = customer.transactions.filter(
      (t) => t.total % 1000000 === 0 && t.total >= 10000000 // Kelipatan 1 juta, minimal 10 juta
    );
    if (roundNumberTransactions.length >= 3) {
      flags.push(
        `${roundNumberTransactions.length} transaksi dengan angka bulat mencurigakan`
      );
      riskScore += 1;
    }

    // Determine Risk Level
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (riskScore >= 10) riskLevel = "CRITICAL";
    else if (riskScore >= 6) riskLevel = "HIGH";
    else if (riskScore >= 3) riskLevel = "MEDIUM";

    customer.suspiciousFlags = flags;
    customer.riskLevel = riskLevel;

    return customer;
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

  const getRiskLevelColor = (riskLevel: string) => {
    const colors = {
      LOW: "bg-green-100 text-green-800 border-green-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
      HIGH: "bg-orange-100 text-orange-800 border-orange-200",
      CRITICAL: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[riskLevel as keyof typeof colors] || colors.LOW;
  };

  const exportToCSV = () => {
    const csvData = [];
    const headers = [
      "ID Nasabah",
      "Nama",
      "Alamat",
      "Tipe Identitas",
      "Total Transaksi",
      "Total Nilai",
      "Rata-rata Transaksi",
      "Transaksi Terbesar",
      "Mata Uang",
      "Risk Level",
      "Red Flags",
    ];
    csvData.push(headers.join(","));

    customers.forEach((customer) => {
      const row = [
        customer.customerId,
        customer.customerName,
        customer.customerAddress,
        customer.identityType,
        customer.totalTransactions,
        customer.totalAmount,
        customer.avgTransactionAmount.toFixed(0),
        customer.maxSingleTransaction,
        customer.currencies.join(";"),
        customer.riskLevel,
        customer.suspiciousFlags.join(";"),
      ];
      csvData.push(row.join(","));
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aml_customer_analysis_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOverallStatistics = () => {
    const totalCustomers = customers.length;
    const highRiskCustomers = customers.filter(
      (c) => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL"
    ).length;
    const totalTransactions = customers.reduce(
      (sum, c) => sum + c.totalTransactions,
      0
    );
    const totalValue = customers.reduce((sum, c) => sum + c.totalAmount, 0);
    const avgTransactionPerCustomer =
      totalCustomers > 0 ? totalTransactions / totalCustomers : 0;

    return {
      totalCustomers,
      highRiskCustomers,
      totalTransactions,
      totalValue,
      avgTransactionPerCustomer,
    };
  };

  const {
    totalCustomers,
    highRiskCustomers,
    totalTransactions,
    totalValue,
    avgTransactionPerCustomer,
  } = getOverallStatistics();

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
              Data Pelanggan & Analisis AML
            </h1>
            <p className="text-gray-600">
              Analisis pelanggan berdasarkan UU No. 8/2010 tentang Pencegahan &
              Pemberantasan Tindak Pidana Pencucian Uang
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
                    {totalCustomers}
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
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {highRiskCustomers}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
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
                    {totalTransactions}
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
                    Total Nilai
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(totalValue)}
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
                    Avg per Customer
                  </p>
                  <p className="text-xl font-bold text-orange-600">
                    {avgTransactionPerCustomer.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Activity className="w-6 h-6 text-orange-600" />
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
                  placeholder="Cari nama, ID, alamat..."
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
                  <span>Export AML Report</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level
                    </label>
                    <select
                      value={filters.riskLevel}
                      onChange={(e) =>
                        setFilters({ ...filters, riskLevel: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Semua Level</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) =>
                        setFilters({ ...filters, minAmount: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Minimal total transaksi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, dateFrom: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={fetchCustomerData}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Terapkan Filter
                  </button>
                  <button
                    onClick={() => {
                      setFilters({
                        riskLevel: "",
                        dateFrom: "",
                        dateTo: "",
                        minAmount: "",
                        maxAmount: "",
                        currency: "",
                        transactionType: "",
                      });
                      setSearchTerm("");
                      setTimeout(fetchCustomerData, 100);
                    }}
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
                Menganalisis data pelanggan...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {/* Customers Display */}
          {!loading && !error && (
            <>
              {customers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada data pelanggan
                  </h3>
                  <p className="text-gray-500">
                    Belum ada data atau tidak ada yang sesuai dengan filter
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {customers.map((customer) => (
                    <div
                      key={customer.customerId}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Customer Header */}
                      <div
                        className={`px-6 py-4 border-l-4 ${
                          customer.riskLevel === "CRITICAL"
                            ? "border-red-500 bg-red-50"
                            : customer.riskLevel === "HIGH"
                            ? "border-orange-500 bg-orange-50"
                            : customer.riskLevel === "MEDIUM"
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-green-500 bg-green-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {customer.customerName}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(
                                  customer.riskLevel
                                )}`}
                              >
                                {customer.riskLevel === "CRITICAL" && (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                )}
                                {customer.riskLevel}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span>
                                  {customer.identityType}: {customer.customerId}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{customer.customerAddress}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Periode:{" "}
                                  {formatDate(customer.firstTransaction)} -{" "}
                                  {formatDate(customer.lastTransaction)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                  Mata Uang: {customer.currencies.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {customer.totalTransactions} Transaksi
                            </p>
                            <p className="text-green-600 font-medium">
                              {formatCurrency(customer.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Max:{" "}
                              {formatCurrency(customer.maxSingleTransaction)}
                            </p>
                          </div>
                        </div>

                        {/* Suspicious Flags */}
                        {customer.suspiciousFlags.length > 0 && (
                          <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Red Flags (AML)
                            </h4>
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                              {customer.suspiciousFlags.map((flag, index) => (
                                <li key={index}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
                              {customer.totalBeli}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            </div>
                            <p className="text-sm text-gray-600">Jual</p>
                            <p className="font-semibold text-red-600">
                              {customer.totalJual}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <DollarSign className="w-4 h-4 text-yellow-600" />
                            </div>
                            <p className="text-sm text-gray-600">Cash</p>
                            <p className="font-semibold text-yellow-600">
                              {customer.totalCash}
                            </p>
                          </div>

                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">Transfer</p>
                            <p className="font-semibold text-blue-600">
                              {customer.totalTransfer}
                            </p>
                          </div>
                        </div>

                        {/* Detail Transaction Toggle */}
                        <div className="border-t border-gray-200 pt-4">
                          <button
                            onClick={() =>
                              toggleCustomerExpansion(customer.customerId)
                            }
                            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>
                              {expandedCustomers.has(customer.customerId)
                                ? "Sembunyikan Detail Transaksi"
                                : "Lihat Detail Transaksi"}
                            </span>
                            {expandedCustomers.has(customer.customerId) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Detailed Transactions */}
                        {expandedCustomers.has(customer.customerId) && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              Detail Transaksi ({customer.transactions.length})
                            </h4>

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
                                      Money Changer
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
                                  {customer.transactions.map(
                                    (transaction, index) => (
                                      <tr
                                        key={transaction.id}
                                        className={
                                          index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                        }
                                      >
                                        <td className="px-4 py-3">
                                          <span className="font-mono text-sm text-blue-600">
                                            {transaction.no_nota}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="text-sm text-gray-900">
                                            {formatDateTime(
                                              transaction.tanggal
                                            )}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="text-sm text-gray-900">
                                            {transaction.profile?.nama || "N/A"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                              {getCurrencyFlag(
                                                transaction.mata_uang?.kode ||
                                                  transaction.curr ||
                                                  ""
                                              )}
                                            </span>
                                            <span className="font-medium text-sm">
                                              {transaction.mata_uang?.kode ||
                                                transaction.curr ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              transaction.jenis_transaksi ===
                                              "Beli"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {transaction.jenis_transaksi ===
                                            "Beli" ? (
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
                                            {transaction.kurs.toLocaleString(
                                              "id-ID"
                                            )}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <span
                                            className={`font-semibold text-sm ${
                                              transaction.total >=
                                              AML_THRESHOLDS.SINGLE_TRANSACTION_CASH
                                                ? "text-red-600"
                                                : transaction.total >=
                                                  AML_THRESHOLDS.STRUCTURED_AMOUNT
                                                ? "text-orange-600"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {formatCurrency(transaction.total)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              transaction.metode_pembayaran ===
                                              "Cash"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}
                                          >
                                            <CreditCard className="w-3 h-3 mr-1" />
                                            {transaction.metode_pembayaran}
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
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
    </div>
  );
}
