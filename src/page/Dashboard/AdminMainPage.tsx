import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // Adjust this import based on your project structure
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types for your data
type Transaction = {
    id: string;
    kupva_id: string;
    mata_uang_id: string;
    no_nota: string;
    tanggal: string;
    nominal: number;
    kurs: number;
    jenis_transaksi: 'Beli' | 'Jual';
    metode_pembayaran: 'Cash' | 'Transfer';
    total: number;
    curr: string;
};

type Profile = {
    id: string;
    nama: string;
};

type Currency = {
    id: string;
    kode: string;
    nama: string;
};

type ExchangeRate = {
    id: string;
    kupva_id: string;
    mata_uang_id: string;
    harga_beli: number;
    harga_jual: number;
    updated_at: string;
    nominal: number;
    currency?: Currency;
    kupva?: Profile;
};

export default function AdminMainPage() {
        const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
        const [transactions, setTransactions] = useState<Transaction[]>([]);
        const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
        const [profiles, setProfiles] = useState<Profile[]>([]);
        const [currencies, setCurrencies] = useState<Currency[]>([]);
        const [loading, setLoading] = useState(true);
        
        // Fetch data on component mount
        useEffect(() => {
                async function fetchData() {
                        try {
                                // Fetch transactions
                                const { data: transactionData, error: transactionError } = await supabase
                                        .from('transaksi')
                                        .select('*');
                                
                                if (transactionError) throw transactionError;
                                
                                // Fetch exchange rates with related data
                                const { data: ratesData, error: ratesError } = await supabase
                                        .from('harga_valas')
                                        .select('*, mata_uang:mata_uang_id(*), kupva:kupva_id(*)');
                                
                                if (ratesError) throw ratesError;
                                
                                // Fetch profiles
                                const { data: profileData, error: profileError } = await supabase
                                        .from('profile')
                                        .select('id, nama');
                                
                                if (profileError) throw profileError;
                                
                                // Fetch currencies
                                const { data: currencyData, error: currencyError } = await supabase
                                        .from('mata_uang')
                                        .select('*');
                                
                                if (currencyError) throw currencyError;
                                
                                setTransactions(transactionData || []);
                                setExchangeRates(ratesData || []);
                                setProfiles(profileData || []);
                                setCurrencies(currencyData || []);
                        } catch (error) {
                                console.error('Error fetching data:', error);
                        } finally {
                                setLoading(false);
                        }
                }
                
                fetchData();
        }, []);
        
        // Prepare data for charts
        const prepareTransactionsByKupva = () => {
                const kupvaMap = new Map();
                
                transactions.forEach(transaction => {
                        const kupvaId = transaction.kupva_id;
                        const kupvaName = profiles.find(p => p.id === kupvaId)?.nama || 'Unknown';
                        
                        if (!kupvaMap.has(kupvaId)) {
                                kupvaMap.set(kupvaId, { 
                                        name: kupvaName,
                                        count: 0, 
                                        totalValue: 0,
                                        buys: 0,
                                        sells: 0
                                });
                        }
                        
                        const kupvaData = kupvaMap.get(kupvaId);
                        kupvaData.count += 1;
                        kupvaData.totalValue += transaction.total;
                        
                        if (transaction.jenis_transaksi === 'Beli') {
                                kupvaData.buys += 1;
                        } else {
                                kupvaData.sells += 1;
                        }
                });
                
                return Array.from(kupvaMap.values());
        };
        
        const prepareTransactionsByMonth = () => {
                const monthlyData = new Map();
                
                transactions.forEach(transaction => {
                        const date = new Date(transaction.tanggal);
                        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                        
                        if (!monthlyData.has(monthYear)) {
                                monthlyData.set(monthYear, {
                                        month: monthYear,
                                        count: 0,
                                        totalValue: 0
                                });
                        }
                        
                        const data = monthlyData.get(monthYear);
                        data.count += 1;
                        data.totalValue += transaction.total;
                });
                
                return Array.from(monthlyData.values())
                        .sort((a, b) => {
                                const [aMonth, aYear] = a.month.split('/').map(Number);
                                const [bMonth, bYear] = b.month.split('/').map(Number);
                                
                                if (aYear !== bYear) return aYear - bYear;
                                return aMonth - bMonth;
                        });
        };
        
        const prepareTransactionsByCurrency = () => {
                const currencyMap = new Map();
                
                transactions.forEach(transaction => {
                        const currencyId = transaction.mata_uang_id;
                        const currencyCode = currencies.find(c => c.id === currencyId)?.kode || 'Unknown';
                        
                        if (!currencyMap.has(currencyId)) {
                                currencyMap.set(currencyId, { 
                                        name: currencyCode,
                                        count: 0, 
                                        totalValue: 0
                                });
                        }
                        
                        const data = currencyMap.get(currencyId);
                        data.count += 1;
                        data.totalValue += transaction.total;
                });
                
                return Array.from(currencyMap.values());
        };

        if (!token) {
                return <p>You need to log in as an admin to access this page.</p>;
        }
        
        if (loading) {
                return <div className="flex justify-center items-center h-screen">Loading...</div>;
        }
        
        const kupvaData = prepareTransactionsByKupva();
        const monthlyData = prepareTransactionsByMonth();
        const currencyData = prepareTransactionsByCurrency();
        
        const adminName = (() => {
                try {
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        return decodedToken.name || 'Admin';
                } catch (error) {
                        return 'Admin';
                }
        })();

        return (
                <div className="admin-main-page p-4">
                        <NavbarAdmin />
                        <div className="mb-6">
                                <p className="text-xl font-semibold">Welcome, {adminName}</p>
                                <h1 className="text-4xl font-bold mt-2">Admin Dashboard</h1>
                                <p className="text-gray-600">Transaction analysis and exchange rates overview</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-4 rounded-lg shadow">
                                        <h2 className="text-2xl font-bold mb-4">Monthly Transactions</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={monthlyData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="count" stroke="#8884d8" name="Transaction Count" />
                                                        <Line type="monotone" dataKey="totalValue" stroke="#82ca9d" name="Total Value (IDR)" />
                                                </LineChart>
                                        </ResponsiveContainer>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow">
                                        <h2 className="text-2xl font-bold mb-4">Transactions by KUPVA</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={kupvaData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="buys" fill="#8884d8" name="Buy Transactions" />
                                                        <Bar dataKey="sells" fill="#82ca9d" name="Sell Transactions" />
                                                </BarChart>
                                        </ResponsiveContainer>
                                </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-4 rounded-lg shadow">
                                        <h2 className="text-2xl font-bold mb-4">Transactions by Currency</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                        <Pie 
                                                                data={currencyData} 
                                                                dataKey="count" 
                                                                nameKey="name" 
                                                                cx="50%" 
                                                                cy="50%" 
                                                                outerRadius={100} 
                                                                fill="#8884d8" 
                                                                label
                                                        />
                                                        <Tooltip />
                                                        <Legend />
                                                </PieChart>
                                        </ResponsiveContainer>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow">
                                        <h2 className="text-2xl font-bold mb-4">Latest Exchange Rates</h2>
                                        <div className="overflow-auto max-h-[300px]">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                                <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KUPVA</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Rate</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Rate</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                {exchangeRates.map(rate => (
                                                                        <tr key={rate.id}>
                                                                                <td className="px-6 py-4 whitespace-nowrap">{rate.currency?.kode || 'Unknown'}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">{rate.kupva?.nama || 'Unknown'}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">{rate.harga_beli.toLocaleString()}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">{rate.harga_jual.toLocaleString()}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                        {new Date(rate.updated_at).toLocaleString()}
                                                                                </td>
                                                                        </tr>
                                                                ))}
                                                        </tbody>
                                                </table>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}``