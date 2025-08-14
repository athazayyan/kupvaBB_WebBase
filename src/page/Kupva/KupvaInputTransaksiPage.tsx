import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; // Ensure you have this import set up

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
    jenis_transaksi: 'Beli' | 'Jual';
    metode_pembayaran: 'Cash' | 'Transfer';
    nama_nasabah: string;
    alamat_nasabah: string;
    keterangan_kurir: string;
    id_nama: string;
    curr: string;
    kode_mc_bank: string;
    jumlah_transaksi: number;
    perubahan_valas: string;
    tanggal_cek_stok: string;
}

export default function KupvaInputTransaksiPage() {
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    const [mataUangList, setMataUangList] = useState<MataUang[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<TransaksiData[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState<TransaksiData>({
        mata_uang_id: '',
        no_nota: '',
        tanggal: new Date().toISOString().split('T')[0],
        no_id_nasabah: '',
        nominal: 0,
        kurs: 0,
        jenis_transaksi: 'Beli',
        metode_pembayaran: 'Cash',
        nama_nasabah: '',
        alamat_nasabah: '',
        keterangan_kurir: '',
        id_nama: '',
        curr: '',
        kode_mc_bank: '',
        jumlah_transaksi: 0,
        perubahan_valas: '',
        tanggal_cek_stok: new Date().toISOString().split('T')[0],
    });
    const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
    const fetchMataUang = async () => {
        const { data, error } = await supabase.from('mata_uang').select('*');
        if (error) {
            console.error('Error fetching mata uang:', error);
        } else {
            setMataUangList(data);
        }
    };

    const fetchRecentTransactions = async () => {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .order('tanggal', { ascending: false })
            .limit(5);
        
        if (error) {
            console.error('Error fetching recent transactions:', error);
        } else {
            setRecentTransactions(data || []);
        }
    };

    useEffect(() => {
        fetchMataUang();
        fetchRecentTransactions();
        const searchParams = new URLSearchParams(window.location.search);
        const transaksiId = searchParams.get('id');
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
        const { data, error } = await supabase.from('transaksi').select('*').eq('id', id).single();
        if (error) {
            console.error('Error fetching transaksi:', error);
        } else if (data) {
            setFormData({
                ...data,
                tanggal: data.tanggal ? new Date(data.tanggal).toISOString().split('T')[0] : '',
                tanggal_cek_stok: data.tanggal_cek_stok ? new Date(data.tanggal_cek_stok).toISOString().split('T')[0] : '',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        // Handle numeric inputs
        if (type === 'number') {
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
        
        const user = supabase.auth.getUser();
        const kupvaId = (await user).data.user?.id;
        
        const dataToSend = {
            ...formData,
            kupva_id: kupvaId,
        };

        let response;
        if (isEdit && formData.id) {
            response = await supabase
                .from('transaksi')
                .update(dataToSend)
                .eq('id', formData.id);
        } else {
            response = await supabase
                .from('transaksi')
                .insert([dataToSend]);
        }

        if (response.error) {
            alert(`Error: ${response.error.message}`);
        } else {
            alert(`Transaksi ${isEdit ? 'updated' : 'added'} successfully!`);
            if (!isEdit) {
                // Reset form after successful submission
                setFormData({
                    mata_uang_id: '',
                    no_nota: '',
                    tanggal: new Date().toISOString().split('T')[0],
                    no_id_nasabah: '',
                    nominal: 0,
                    kurs: 0,
                    jenis_transaksi: 'Beli',
                    metode_pembayaran: 'Cash',
                    nama_nasabah: '',
                    alamat_nasabah: '',
                    keterangan_kurir: '',
                    id_nama: '',
                    curr: '',
                    kode_mc_bank: '',
                    jumlah_transaksi: 0,
                    perubahan_valas: '',
                    tanggal_cek_stok: new Date().toISOString().split('T')[0],
                });
            }
        }
    };

    if (!token) {
        return <p>You need to log in as a Kupva user to access this page.</p>;
    }   

    return (
        <div className="input-transaksi-page p-4">
            <NavbarKupva />
            <div className="mb-6 max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi Terbaru</h2>
                <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Nota</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Uang</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Recent transactions table data */}
                            {recentTransactions?.map((transaksi) => (
                                <tr key={transaksi.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaksi.no_nota}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(transaksi.tanggal).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaksi.jenis_transaksi}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {mataUangList.find(m => m.id === transaksi.mata_uang_id)?.kode || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {transaksi.nominal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(transaksi.nominal * transaksi.kurs).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit' : 'Input'} Transaksi</h1>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">No. Nota</label>
                        <input
                            type="text"
                            name="no_nota"
                            value={formData.no_nota}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                        <input
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Mata Uang</label>
                        <select
                            name="mata_uang_id"
                            value={formData.mata_uang_id}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Pilih Mata Uang</option>
                            {mataUangList.map((mata_uang) => (
                                <option key={mata_uang.id} value={mata_uang.id}>
                                    {mata_uang.nama} ({mata_uang.kode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Jenis Transaksi</label>
                        <select
                            name="jenis_transaksi"
                            value={formData.jenis_transaksi}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="Beli">Beli</option>
                            <option value="Jual">Jual</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                        <select
                            name="metode_pembayaran"
                            value={formData.metode_pembayaran}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nominal</label>
                        <input
                            type="number"
                            name="nominal"
                            value={formData.nominal}
                            onChange={handleChange}
                            required
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Kurs</label>
                        <input
                            type="number"
                            name="kurs"
                            value={formData.kurs}
                            onChange={handleChange}
                            required
                            step="0.0001"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Total (Auto-calculated)</label>
                        <input
                            type="number"
                            value={calculatedTotal}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">No. ID Nasabah</label>
                        <input
                            type="text"
                            name="no_id_nasabah"
                            value={formData.no_id_nasabah}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nama Nasabah</label>
                        <input
                            type="text"
                            name="nama_nasabah"
                            value={formData.nama_nasabah}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Alamat Nasabah</label>
                        <textarea
                            name="alamat_nasabah"
                            value={formData.alamat_nasabah}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Keterangan Kurir</label>
                        <input
                            type="text"
                            name="keterangan_kurir"
                            value={formData.keterangan_kurir}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">ID Nama</label>
                        <input
                            type="text"
                            name="id_nama"
                            value={formData.id_nama}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <input
                            type="text"
                            name="curr"
                            value={formData.curr}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Kode MC Bank</label>
                        <input
                            type="text"
                            name="kode_mc_bank"
                            value={formData.kode_mc_bank}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Jumlah Transaksi</label>
                        <input
                            type="number"
                            name="jumlah_transaksi"
                            value={formData.jumlah_transaksi}
                            onChange={handleChange}
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Perubahan Valas</label>
                        <input
                            type="text"
                            name="perubahan_valas"
                            value={formData.perubahan_valas}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Tanggal Cek Stok</label>
                        <input
                            type="date"
                            name="tanggal_cek_stok"
                            value={formData.tanggal_cek_stok}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {isEdit ? 'Update' : 'Submit'} Transaksi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}