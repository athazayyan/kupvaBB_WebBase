import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; 

interface Transaction {
    id: string;
    no_nota: string;
    tanggal: string;
    nama_nasabah: string;
    no_id_nasabah: string;
    alamat_nasabah: string;
    jenis_transaksi: 'Beli' | 'Jual';
    nominal: number;
    kurs: number;
    total: number;
    metode_pembayaran: 'Cash' | 'Transfer';
    curr: string;
    jumlah_transaksi: number;
}

export default function AdminDataPelanggan() {
        const [transactions, setTransactions] = useState<Transaction[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
        
        useEffect(() => {
                async function fetchTransactions() {
                        try {
                                const { data, error } = await supabase
                                        .from('transaksi')
                                        .select(`
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
                                                jumlah_transaksi
                                        `)
                                        .order('tanggal', { ascending: false });

                                if (error) throw error;
                                setTransactions(data || []);
                        } catch (err) {
                                setError(err instanceof Error ? err.message : 'An error occurred');
                        } finally {
                                setLoading(false);
                        }
                }

                if (token) {
                        fetchTransactions();
                }
        }, [token]);

        if (!token) {
                return <p>You need to log in as an admin to access this page.</p>;
        }

        const adminName = (() => {
                try {
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        return decodedToken.name || 'Admin';
                } catch (error) {
                        return 'Admin';
                }
        })();
        
        return (
                <div className="admin-data-transaksi-page">
                        <NavbarAdmin />
                        <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                        <h1 className="text-4xl font-bold">Data Transaksi</h1>
                                        <p className="text-gray-600">Welcome, {adminName}</p>
                                </div>
                                
                                {loading ? (
                                        <p>Loading transaction data...</p>
                                ) : error ? (
                                        <p className="text-red-500">Error: {error}</p>
                                ) : (
                                        <div className="overflow-x-auto">
                                                <table className="min-w-full bg-white border border-gray-300">
                                                        <thead className="bg-gray-100">
                                                                <tr>
                                                                        <th className="px-4 py-2 border">No. Nota</th>
                                                                        <th className="px-4 py-2 border">Tanggal</th>
                                                                        <th className="px-4 py-2 border">Nama Nasabah</th>
                                                                        <th className="px-4 py-2 border">ID Nasabah</th>
                                                                        <th className="px-4 py-2 border">Jenis Transaksi</th>
                                                                        <th className="px-4 py-2 border">Nominal</th>
                                                                        <th className="px-4 py-2 border">Kurs</th>
                                                                        <th className="px-4 py-2 border">Total</th>
                                                                        <th className="px-4 py-2 border">Metode</th>
                                                                        <th className="px-4 py-2 border">Jumlah Transaksi</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {transactions.length > 0 ? (
                                                                        transactions.map((transaction) => (
                                                                                <tr key={transaction.id}>
                                                                                        <td className="px-4 py-2 border">{transaction.no_nota}</td>
                                                                                        <td className="px-4 py-2 border">{new Date(transaction.tanggal).toLocaleString()}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.nama_nasabah}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.no_id_nasabah}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.jenis_transaksi}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.nominal.toLocaleString()} {transaction.curr}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.kurs.toLocaleString()}</td>
                                                                                        <td className="px-4 py-2 border">Rp {transaction.total.toLocaleString()}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.metode_pembayaran}</td>
                                                                                        <td className="px-4 py-2 border">{transaction.jumlah_transaksi}</td>
                                                                                </tr>
                                                                        ))
                                                                ) : (
                                                                        <tr>
                                                                                <td colSpan={10} className="px-4 py-2 text-center">No transaction data found</td>
                                                                        </tr>
                                                                )}
                                                        </tbody>
                                                </table>
                                        </div>
                                )}
                        </div>
                </div>
        );
}
