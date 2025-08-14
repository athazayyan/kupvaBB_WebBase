import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";

interface MataUang {
    id: string;
    kode: string;
    nama: string;
}

interface HargaValas {
    id: string;
    mata_uang_id: string;
    harga_beli: number;
    harga_jual: number;
    mata_uang?: MataUang;
}

export default function KupvaInputHarga() {
    const [mataUangList, setMataUangList] = useState<MataUang[]>([]);
    const [hargaList, setHargaList] = useState<HargaValas[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentKupvaId, setCurrentKupvaId] = useState<string | null>(null);

    // Check authentication
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return <p>You need to log in as a Kupva user to access this page.</p>;
    }

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                
                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                
                if (!user) {
                    throw new Error("Not authenticated");
                }
                
                // Get user's profile ID
                const { data: profileData, error: profileError } = await supabase
                    .from('profile')
                    .select('id')
                    .eq('id', user.id)
                    .single();
                    
                if (profileError) throw profileError;
                setCurrentKupvaId(profileData.id);
                
                // Fetch mata uang (currencies)
                const { data: mataUangData, error: mataUangError } = await supabase
                    .from('mata_uang')
                    .select('*');
                    
                if (mataUangError) throw mataUangError;
                setMataUangList(mataUangData);
                
                // Fetch existing harga valas for this Kupva
                const { data: hargaData, error: hargaError } = await supabase
                    .from('harga_valas')
                    .select(`
                        id, 
                        mata_uang_id, 
                        harga_beli, 
                        harga_jual,
                        mata_uang (id, kode, nama)
                    `)
                    .eq('kupva_id', profileData.id);
                    
                if (hargaError) throw hargaError;
                // Transform the data to match the HargaValas interface
                const formattedData = hargaData.map((item: any) => ({
                    id: item.id,
                    mata_uang_id: item.mata_uang_id,
                    harga_beli: item.harga_beli,
                    harga_jual: item.harga_jual,
                    mata_uang: item.mata_uang
                }));
                setHargaList(formattedData);
                
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, []);

    const handleUpdateHarga = async (mata_uang_id: string, harga_beli: number, harga_jual: number) => {
        if (!currentKupvaId) return;
        
        try {
            // Check if record exists
            const existingIndex = hargaList.findIndex(h => h.mata_uang_id === mata_uang_id);
            
            if (existingIndex >= 0) {
                // Update existing record
                const { error } = await supabase
                    .from('harga_valas')
                    .update({ 
                        harga_beli, 
                        harga_jual,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', hargaList[existingIndex].id);
                    
                if (error) throw error;
                
                // Update local state
                const updatedList = [...hargaList];
                updatedList[existingIndex] = {
                    ...updatedList[existingIndex],
                    harga_beli,
                    harga_jual
                };
                setHargaList(updatedList);
            } else {
                // Insert new record
                const { data, error } = await supabase
                    .from('harga_valas')
                    .insert({
                        kupva_id: currentKupvaId,
                        mata_uang_id,
                        harga_beli,
                        harga_jual
                    })
                    .select()
                    .single();
                    
                if (error) throw error;
                
                // Find mata uang details
                const mataUang = mataUangList.find(m => m.id === mata_uang_id);
                
                // Add to local state
                setHargaList([...hargaList, {
                    ...data,
                    mata_uang: mataUang
                }]);
            }
            
            alert("Harga berhasil diperbarui!");
        } catch (err: any) {
            setError(err.message);
            alert("Error: " + err.message);
        }
    };

    const HargaForm = ({ mataUang }: { mataUang: MataUang }) => {
        const existingHarga = hargaList.find(h => h.mata_uang_id === mataUang.id);
        const [hargaBeli, setHargaBeli] = useState(existingHarga?.harga_beli || 0);
        const [hargaJual, setHargaJual] = useState(existingHarga?.harga_jual || 0);

        return (
            <div className="border p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold">{mataUang.kode} - {mataUang.nama}</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium">Harga Beli</label>
                        <input 
                            type="number" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            value={hargaBeli}
                            onChange={(e) => setHargaBeli(parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Harga Jual</label>
                        <input 
                            type="number" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            value={hargaJual}
                            onChange={(e) => setHargaJual(parseFloat(e.target.value))}
                        />
                    </div>
                </div>
                <button 
                    className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleUpdateHarga(mataUang.id, hargaBeli, hargaJual)}
                >
                    Simpan
                </button>
            </div>
        );
    };

    return (
        <div className="input-harga-page p-6">
            <NavbarKupva />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Input Harga Valas</h1>
                
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                
                {!loading && !error && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold mb-4">Update Harga Mata Uang</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mataUangList.map(mataUang => (
                                <HargaForm key={mataUang.id} mataUang={mataUang} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}