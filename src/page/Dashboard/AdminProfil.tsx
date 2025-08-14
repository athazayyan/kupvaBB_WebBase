import { useState, useEffect } from "react";
import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
import { supabase } from "../../supabaseClient"; // Make sure to import your supabase client

interface MataUang {
    id: string;
    kode: string;
    nama: string;
}

interface AdminProfile {
    email: string;
    name: string;
    alamat?: string;
}

export default function AdminProfil() {
        const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
        const [mataUangList, setMataUangList] = useState<MataUang[]>([]);
        const [newMataUang, setNewMataUang] = useState<Omit<MataUang, 'id'>>({ kode: '', nama: '' });
        const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
        const [newPassword, setNewPassword] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [message, setMessage] = useState('');

        useEffect(() => {
                if (token) {
                        try {
                                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                                setAdminProfile({
                                        email: decodedToken.email || '',
                                        name: decodedToken.name || 'Admin',
                                        alamat: decodedToken.alamat || ''
                                });
                        } catch (error) {
                                console.error("Error decoding token:", error);
                        }
                }
        }, [token]);

        // Fetch mata uang data
        useEffect(() => {
                const fetchMataUang = async () => {
                        try {
                                const { data, error } = await supabase
                                        .from('mata_uang')
                                        .select('*');
                                
                                if (error) throw error;
                                setMataUangList(data || []);
                        } catch (error) {
                                console.error("Error fetching mata uang:", error);
                        }
                };

                fetchMataUang();
        }, []);

        // Handle form input changes
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target;
                setNewMataUang({ ...newMataUang, [name]: value });
        };

        // Handle profile input changes
        const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target;
                setAdminProfile(prev => prev ? { ...prev, [name]: value } : null);
        };

        // Add new mata uang
        const handleAddMataUang = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsLoading(true);
                
                try {
                        const { data, error } = await supabase
                                .from('mata_uang')
                                .insert([newMataUang])
                                .select();
                                
                        if (error) throw error;
                        
                        setMataUangList([...mataUangList, data[0]]);
                        setNewMataUang({ kode: '', nama: '' });
                        setMessage('Mata uang berhasil ditambahkan!');
                        
                        setTimeout(() => setMessage(''), 3000);
                } catch (error: any) {
                        setMessage(`Error: ${error.message}`);
                } finally {
                        setIsLoading(false);
                }
        };

        // Update admin profile
        const handleUpdateProfile = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsLoading(true);
                
                try {
                        if (!adminProfile) return;
                        
                        // Update user profile
                        const { error } = await supabase.auth.updateUser({
                                email: adminProfile.email,
                                data: { 
                                        name: adminProfile.name,
                                        alamat: adminProfile.alamat
                                }
                        });
                        
                        if (error) throw error;
                        setMessage('Profil berhasil diperbarui!');
                        
                        setTimeout(() => setMessage(''), 3000);
                } catch (error: any) {
                        setMessage(`Error: ${error.message}`);
                } finally {
                        setIsLoading(false);
                }
        };

        // Update password
        const handleUpdatePassword = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsLoading(true);
                
                try {
                        const { error } = await supabase.auth.updateUser({
                                password: newPassword
                        });
                        
                        if (error) throw error;
                        setNewPassword('');
                        setMessage('Password berhasil diperbarui!');
                        
                        setTimeout(() => setMessage(''), 3000);
                } catch (error: any) {
                        setMessage(`Error: ${error.message}`);
                } finally {
                        setIsLoading(false);
                }
        };

        if (!token) {
                return <p>You need to log in as an admin to access this page.</p>;
        }

        return (
                <div className="admin-data-kupva-page">
                        <NavbarAdmin />
                        
                        <div className="container mx-auto p-4">
                                <h1 className="text-4xl font-bold mb-6">Admin Profil</h1>
                                
                                {message && (
                                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                                                {message}
                                        </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Admin Profile Section */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                                <h2 className="text-2xl font-semibold mb-4">Profil Admin</h2>
                                                {adminProfile && (
                                                        <form onSubmit={handleUpdateProfile}>
                                                                <div className="mb-4">
                                                                        <label className="block text-gray-700 mb-2">Email</label>
                                                                        <input
                                                                                type="email"
                                                                                name="email"
                                                                                value={adminProfile.email}
                                                                                onChange={handleProfileChange}
                                                                                className="w-full p-2 border rounded"
                                                                        />
                                                                </div>
                                                                <div className="mb-4">
                                                                        <label className="block text-gray-700 mb-2">Nama</label>
                                                                        <input
                                                                                type="text"
                                                                                name="name"
                                                                                value={adminProfile.name}
                                                                                onChange={handleProfileChange}
                                                                                className="w-full p-2 border rounded"
                                                                        />
                                                                </div>
                                                                <div className="mb-4">
                                                                        <label className="block text-gray-700 mb-2">Alamat</label>
                                                                        <input
                                                                                type="text"
                                                                                name="alamat"
                                                                                value={adminProfile.alamat || ''}
                                                                                onChange={handleProfileChange}
                                                                                className="w-full p-2 border rounded"
                                                                        />
                                                                </div>
                                                                <button
                                                                        type="submit"
                                                                        disabled={isLoading}
                                                                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                                                >
                                                                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                                </button>
                                                        </form>
                                                )}
                                                
                                                <h3 className="text-xl font-semibold mt-6 mb-4">Ubah Password</h3>
                                                <form onSubmit={handleUpdatePassword}>
                                                        <div className="mb-4">
                                                                <label className="block text-gray-700 mb-2">Password Baru</label>
                                                                <input
                                                                        type="password"
                                                                        value={newPassword}
                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                        className="w-full p-2 border rounded"
                                                                        required
                                                                        minLength={6}
                                                                />
                                                        </div>
                                                        <button
                                                                type="submit"
                                                                disabled={isLoading}
                                                                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                                                        >
                                                                {isLoading ? 'Memperbarui...' : 'Perbarui Password'}
                                                        </button>
                                                </form>
                                        </div>
                                        
                                        {/* Mata Uang Management Section */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                                <h2 className="text-2xl font-semibold mb-4">Kelola Mata Uang</h2>
                                                
                                                <form onSubmit={handleAddMataUang} className="mb-6">
                                                        <div className="mb-4">
                                                                <label className="block text-gray-700 mb-2">Kode Mata Uang</label>
                                                                <input
                                                                        type="text"
                                                                        name="kode"
                                                                        value={newMataUang.kode}
                                                                        onChange={handleInputChange}
                                                                        className="w-full p-2 border rounded"
                                                                        required
                                                                />
                                                        </div>
                                                        <div className="mb-4">
                                                                <label className="block text-gray-700 mb-2">Nama Mata Uang</label>
                                                                <input
                                                                        type="text"
                                                                        name="nama"
                                                                        value={newMataUang.nama}
                                                                        onChange={handleInputChange}
                                                                        className="w-full p-2 border rounded"
                                                                        required
                                                                />
                                                        </div>
                                                        <button
                                                                type="submit"
                                                                disabled={isLoading}
                                                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                                        >
                                                                {isLoading ? 'Menambahkan...' : 'Tambah Mata Uang'}
                                                        </button>
                                                </form>
                                                
                                                <h3 className="text-xl font-semibold mb-4">Daftar Mata Uang</h3>
                                                <div className="overflow-x-auto">
                                                        <table className="min-w-full bg-white">
                                                                <thead>
                                                                        <tr>
                                                                                <th className="py-2 px-4 border-b">Kode</th>
                                                                                <th className="py-2 px-4 border-b">Nama</th>
                                                                        </tr>
                                                                </thead>
                                                                <tbody>
                                                                        {mataUangList.map((mataUang) => (
                                                                                <tr key={mataUang.id}>
                                                                                        <td className="py-2 px-4 border-b text-center">{mataUang.kode}</td>
                                                                                        <td className="py-2 px-4 border-b text-center">{mataUang.nama}</td>
                                                                                </tr>
                                                                        ))}
                                                                        {mataUangList.length === 0 && (
                                                                                <tr>
                                                                                        <td colSpan={2} className="py-4 text-center text-gray-500">
                                                                                                Belum ada data mata uang
                                                                                        </td>
                                                                                </tr>
                                                                        )}
                                                                </tbody>
                                                        </table>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}