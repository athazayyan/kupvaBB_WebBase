import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { format } from "date-fns";

export default function AdminDataTransaksi() {
  const token = localStorage.getItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [kupvaOptions, setKupvaOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    kupvaId: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchKupvaOptions();
    fetchTransactions();
  }, []);

  const fetchKupvaOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("id, nama")
        .eq("role", "kupva");

      if (error) throw error;
      console.log("Kupva options:", data);
      setKupvaOptions(data || []);
    } catch (error) {
      console.error("Error fetching Kupva options:", error);
    }
  };

  // Test basic fetch first
  const testBasicFetch = async () => {
    try {
      console.log("Testing basic transaksi fetch...");

      // Test 1: Basic select without joins
      const { data: basicData, error: basicError } = await supabase
        .from("transaksi")
        .select("*");

      console.log("Basic transaksi data:", basicData);
      console.log("Basic transaksi error:", basicError);

      // Test 2: Try different join syntax
      if (basicData && basicData.length > 0) {
        const { data: joinData, error: joinError } = await supabase.from(
          "transaksi"
        ).select(`
            *,
            profile!kupva_id(nama)
          `);

        console.log("Join data (method 1):", joinData);
        console.log("Join error (method 1):", joinError);

        // Test 3: Try manual join approach
        const { data: manualData } = await supabase
          .from("transaksi")
          .select("*, kupva_id");

        console.log("Manual join data:", manualData);

        if (manualData && manualData.length > 0) {
          // Get profile data separately
          const kupvaIds = [...new Set(manualData.map((t) => t.kupva_id))];
          const { data: profileData, error: profileError } = await supabase
            .from("profile")
            .select("id, nama")
            .in("id", kupvaIds);

          console.log("Profile data for join:", profileData);
          console.log("Profile error:", profileError);

          // Manual join
          const enrichedData = manualData.map((transaction) => ({
            ...transaction,
            profile: profileData?.find((p) => p.id === transaction.kupva_id),
          }));

          console.log("Manually enriched data:", enrichedData);

          return enrichedData;
        }
      }

      return basicData;
    } catch (error) {
      console.error("Test fetch error:", error);
      return null;
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      console.log("Current filters:", filters);

      // First, let's try the test fetch
      const testData = await testBasicFetch();

      if (testData && testData.length > 0) {
        // If test data works, process it
        let filteredData = testData;

        // Apply filters manually
        if (filters.kupvaId) {
          filteredData = filteredData.filter(
            (t) => t.kupva_id === filters.kupvaId
          );
        }

        if (filters.dateFrom) {
          filteredData = filteredData.filter(
            (t) => new Date(t.tanggal) >= new Date(filters.dateFrom)
          );
        }

        if (filters.dateTo) {
          const nextDay = new Date(filters.dateTo);
          nextDay.setDate(nextDay.getDate() + 1);
          filteredData = filteredData.filter(
            (t) => new Date(t.tanggal) < nextDay
          );
        }

        console.log("Filtered data:", filteredData);

        // Group transactions by Kupva
        const groupedData = filteredData.reduce(
          (acc: Record<string, any>, transaction) => {
            const kupvaId = transaction.kupva_id;
            const kupvaName = transaction.profile?.nama || "Unknown";

            console.log("Processing transaction:", {
              id: transaction.id,
              kupvaId,
              kupvaName,
              hasProfile: !!transaction.profile,
            });

            if (!acc[kupvaId]) {
              acc[kupvaId] = {
                kupvaId,
                kupvaName,
                transactions: [],
              };
            }

            acc[kupvaId].transactions.push(transaction);
            return acc;
          },
          {}
        );

        console.log("Grouped data:", groupedData);
        const groupedArray = Object.values(groupedData);
        setTransactions(groupedArray);
      } else {
        console.log("No data returned from test fetch");
        setTransactions([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setLoading(false);
    }
  };

  const fetchTransactionsWithoutFilters = async () => {
    setLoading(true);
    try {
      // Use the test fetch method
      const data = await testBasicFetch();

      if (!data || data.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const groupedData = data.reduce(
        (acc: Record<string, any>, transaction) => {
          const kupvaId = transaction.kupva_id;
          const kupvaName = transaction.profile?.nama || "Unknown";

          if (!acc[kupvaId]) {
            acc[kupvaId] = {
              kupvaId,
              kupvaName,
              transactions: [],
            };
          }

          acc[kupvaId].transactions.push(transaction);
          return acc;
        },
        {}
      );

      setTransactions(Object.values(groupedData));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching unfiltered transactions:", error);
      setTransactions([]);
      setLoading(false);
    }
  };

  // Check RLS policies
  const checkRLSPolicies = async () => {
    try {
      console.log("Checking RLS policies...");

      // Check current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("Current user:", user);
      console.log("User error:", userError);

      // Try with different approaches
      const tests = [
        // Test 1: Basic select
        supabase.from("transaksi").select("id, nama_nasabah, kupva_id"),

        // Test 2: Count
        supabase.from("transaksi").select("*", { count: "exact", head: true }),

        // Test 3: With specific user context if needed
        supabase.from("transaksi").select("*").limit(1),
      ];

      for (let i = 0; i < tests.length; i++) {
        const { data, error, count } = await tests[i];
        console.log(`Test ${i + 1} result:`, { data, error, count });
      }
    } catch (error) {
      console.error("RLS check error:", error);
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
      dateFrom: "",
      dateTo: "",
    });
    setTimeout(() => {
      fetchTransactionsWithoutFilters();
    }, 100);
  };

  const calculateTotals = (transactions: any[]) => {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = parseFloat(transaction.nominal) || 0;
        acc.totalTransactions += 1;
        acc.totalAmount += amount;
        return acc;
      },
      { totalTransactions: 0, totalAmount: 0 }
    );
  };

  const exportToCSV = () => {
    const csvData = [];
    const headers = [
      "Tanggal",
      "Kupva",
      "Nasabah",
      "Mata Uang",
      "Nominal",
      "Status",
    ];
    csvData.push(headers.join(","));

    transactions.forEach((group) => {
      group.transactions.forEach((transaction: any) => {
        const row = [
          format(new Date(transaction.tanggal), "dd/MM/yyyy"),
          group.kupvaName,
          transaction.nama_nasabah,
          transaction.mata_uang?.nama_mata_uang || "N/A",
          transaction.nominal,
          transaction.status || "Unknown",
        ];
        csvData.push(row.join(","));
      });
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-lg">
            You need to log in as an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-data-transaksi-page min-h-screen bg-gray-50">
      <NavbarAdmin />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Data Transaksi</h1>
          {transactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Export CSV
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Filter Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Nama Kupva
              </label>
              <select
                name="kupvaId"
                value={filters.kupvaId}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Kupva</option>
                {kupvaOptions.map((kupva) => (
                  <option key={kupva.id} value={kupva.id}>
                    {kupva.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tanggal Akhir
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Terapkan Filter
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Enhanced Debug Info */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Debug Information:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Groups found:</span>{" "}
              {transactions.length}
            </div>
            <div>
              <span className="font-medium">Kupva options:</span>{" "}
              {kupvaOptions.length}
            </div>
            <div>
              <span className="font-medium">Loading:</span> {loading.toString()}
            </div>
            <div>
              <span className="font-medium">Has filters:</span>{" "}
              {Object.values(filters)
                .some((f) => f !== "")
                .toString()}
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">Current filters:</span>{" "}
            {JSON.stringify(filters)}
          </div>

          {/* Enhanced test buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={fetchTransactionsWithoutFilters}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
            >
              Test Fetch Without Filters
            </button>
            <button
              onClick={testBasicFetch}
              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
            >
              Test Basic Fetch
            </button>
            <button
              onClick={checkRLSPolicies}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Check RLS Policies
            </button>
            <button
              onClick={() => {
                console.log("Current state:", {
                  transactions,
                  kupvaOptions,
                  loading,
                  filters,
                });
              }}
              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
            >
              Log Current State
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Memuat data transaksi...</span>
          </div>
        )}

        {/* Summary Statistics */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">
                Total Kupva
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                {transactions.length}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">
                Total Transaksi
              </h3>
              <p className="text-2xl font-bold text-green-900">
                {transactions.reduce(
                  (sum, group) => sum + group.transactions.length,
                  0
                )}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">
                Total Nominal
              </h3>
              <p className="text-2xl font-bold text-purple-900">
                Rp{" "}
                {transactions
                  .reduce((sum, group) => {
                    const groupTotal = calculateTotals(
                      group.transactions
                    ).totalAmount;
                    return sum + groupTotal;
                  }, 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}

        {/* Transactions Display */}
        {!loading && (
          <div className="space-y-6">
            {transactions.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg mb-2">
                  Tidak ada data transaksi ditemukan
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Klik tombol debug di atas untuk mendiagnosis masalah
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={fetchTransactionsWithoutFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={testBasicFetch}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                  >
                    Test Basic Fetch
                  </button>
                </div>
              </div>
            ) : (
              transactions.map((group) => {
                const totals = calculateTotals(group.transactions);
                return (
                  <div
                    key={group.kupvaId}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {/* Kupva Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {group.kupvaName}
                          </h3>
                          <p className="text-blue-100 text-sm">
                            ID: {group.kupvaId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {totals.totalTransactions} Transaksi
                          </p>
                          <p className="text-blue-100 text-sm">
                            Total: Rp{" "}
                            {totals.totalAmount.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nasabah
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mata Uang
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nominal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.transactions.map(
                            (transaction: any, index: number) => (
                              <tr
                                key={transaction.id}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {format(
                                    new Date(transaction.tanggal),
                                    "dd/MM/yyyy"
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {transaction.nama_nasabah}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {transaction.mata_uang?.nama_mata_uang ||
                                    "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                  Rp{" "}
                                  {parseFloat(
                                    transaction.nominal
                                  ).toLocaleString("id-ID")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      transaction.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : transaction.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {transaction.status || "Unknown"}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
