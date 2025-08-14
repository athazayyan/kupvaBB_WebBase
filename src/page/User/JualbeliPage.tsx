import { useEffect, useState } from "react";
import { NavbarUser } from "../../components/utils/NavbarUser";
import { supabase } from "../../supabaseClient"; // Assuming you have this set up

interface Currency {
    id: string;
    kode: string;
    nama: string;
}

interface ExchangeRate {
    id: string;
    kupva_id: string;
    mata_uang_id: string;
    harga_beli: number;
    harga_jual: number;
    updated_at: string;
    mata_uang: Currency | null;
}

export default function JualbeliPage() {
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExchangeRates() {
            try {
                const { data, error } = await supabase
                    .from('harga_valas')
                    .select(`
                        id,
                        kupva_id,
                        mata_uang_id,
                        harga_beli,
                        harga_jual,
                        updated_at,
                        mata_uang (
                            id,
                            kode,
                            nama
                        )
                    `)
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                if (data) {
                    const formattedData = data.map(item => ({
                        ...item,
                        mata_uang: item.mata_uang && item.mata_uang.length > 0 ? item.mata_uang[0] : null
                    }));
                    setExchangeRates(formattedData);
                } else {
                    setExchangeRates([]);
                }
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchExchangeRates();
    }, []);

    return (
        <div className="jualbeli-page bg-gray-50 min-h-screen">
            <NavbarUser />
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center mb-6">
                    <a href="/" className="text-blue-600 hover:text-blue-800 mr-4">
                        &larr; Back
                    </a>
                    <h1 className="text-4xl font-bold">Kurs Mata Uang</h1>
                </div>
                
                {loading ? (
                    <div className="text-center py-8">Loading exchange rates...</div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mata Uang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kode
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Harga Beli
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Harga Jual
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Terakhir Diperbarui
                                    </th>
                                    <th>
                                        kupva
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {exchangeRates.length > 0 ? (
                                    exchangeRates.map((rate) => (
                                        <tr key={rate.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rate.mata_uang?.nama || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rate.mata_uang?.kode || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rate.harga_beli.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rate.harga_jual.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(rate.updated_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rate.kupva_id || 'N/A'}
                                            </td>
                                            
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data kurs mata uang yang tersedia.
                                        </td>
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
