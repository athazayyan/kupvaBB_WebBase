import { useState, useEffect } from "react";
import { Search, Plus, Edit, X } from "lucide-react";
import supabase from "../../supabaseClient";
import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
// Define interfaces for type safety
interface KupvaProfile {
    id: string;
    nama: string;
    email: string;
    alamat: string;
    no_telepon: string;
    role: string;
    created_at: string;
}

interface KupvaProfileFormData {
    nama: string;
    email: string;
    alamat: string;
    no_telepon: string;
    password: string;
}

// API functions
const profileAPI = {
    // GET - Fetch all KUPVA profiles
    async getKupvaProfiles() {
        try {
            const { data, error } = await supabase
                .from('profile')
                .select('*')
                .eq('role', 'kupva');

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Error fetching KUPVA profiles:', error);
            return { data: null, error };
        }
    },

    // POST - Create new KUPVA profile
    async createKupvaProfile(profileData: KupvaProfileFormData) {
        try {
            // First create auth user
            const { data: authUser, error: authError } = await supabase.auth.signUp({
                email: profileData.email,
                password: profileData.password,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });

            if (authError || !authUser?.user) {
                throw new Error(authError ? String(authError) : "Failed to create auth user");
            }

            // Then create profile
            const { data, error } = await supabase.from('profile')
                .insert([{
                    id: authUser.user.id,
                    nama: profileData.nama,
                    email: profileData.email,
                    alamat: profileData.alamat,
                    no_telepon: profileData.no_telepon,
                    role: 'kupva'
                }]);

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Error creating KUPVA profile:', error);
            return { data: null, error };
        }
    },

    // PUT - Update KUPVA profile
    async updateKupvaProfile(id: string, profileData: KupvaProfileFormData) {
        try {
            const { data, error } = await supabase.from('profile')
                .update({
                    nama: profileData.nama,
                    email: profileData.email,
                    alamat: profileData.alamat,
                    no_telepon: profileData.no_telepon
                })
                .eq('id', id);

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Error updating KUPVA profile:', error);
            return { data: null, error };
        }
    }
};

// Component props interfaces remain the same
interface KupvaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    editData: KupvaProfile | null;
}

interface SearchAndFilterProps {
    onSearch: (term: string) => void;
}



interface KupvaTableProps {
    data: KupvaProfile[];
    onEdit: (item: KupvaProfile) => void;
}

interface AddKupvaButtonProps {
    onClick: () => void;
}

// Component definitions remain the same
const KupvaFormModal = ({ isOpen, onClose, onSave, editData }: KupvaFormModalProps) => {
    const [formData, setFormData] = useState<KupvaProfileFormData>({
        nama: editData?.nama || '',
        email: editData?.email || '',
        alamat: editData?.alamat || '',
        no_telepon: editData?.no_telepon || '',
        password: '',
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                nama: editData.nama,
                email: editData.email,
                alamat: editData.alamat,
                no_telepon: editData.no_telepon,
                password: '', // Password is not included when editing
            });
        } else {
            // Reset form for new KUPVA
            setFormData({
                nama: '',
                email: '',
                alamat: '',
                no_telepon: '',
                password: '',
            });
        }
    }, [editData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editData) {
                await profileAPI.updateKupvaProfile(editData.id, formData);
            } else {
                await profileAPI.createKupvaProfile(formData);
            }
            onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving KUPVA:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {editData ? 'Edit KUPVA Account' : 'Add New KUPVA Account'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            {!editData && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required={!editData}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="no_telepon"
                                    value={formData.no_telepon}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                            >
                                {editData ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const SearchAndFilter = ({ onSearch }: SearchAndFilterProps) => {
    return (
        

        <div className="mb-6 flex items-center gap-2 bg-white rounded-lg shadow-sm p-4">
            
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
};




const KupvaTable = ({ data, onEdit }: KupvaTableProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <NavbarAdmin></NavbarAdmin>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nama}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.alamat}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.no_telepon}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button 
                                    onClick={() => onEdit(item)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <Edit size={18} className="inline" />
                                    <span className="ml-1">Edit</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AddKupvaButton = ({ onClick }: AddKupvaButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
        >
            <Plus size={18} />
            <span>Add New KUPVA</span>
        </button>
    );
};

// Main Dashboard Component
export default function KupvaAdminDashboard() {
    const [kupvaData, setKupvaData] = useState<KupvaProfile[]>([]);
    const [filteredData, setFilteredData] = useState<KupvaProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KupvaProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load data on component mount
    useEffect(() => {
        loadKupvaData();
    }, []);

    const loadKupvaData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await profileAPI.getKupvaProfiles();
            if (result.error) {
                console.error('Error loading data:', result.error);
                setError('Failed to load data from the server');
                setKupvaData([]);
                setFilteredData([]);
            } else {
                setKupvaData(result.data || []);
                setFilteredData(result.data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setError('An unexpected error occurred');
            setKupvaData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm: string) => {
        if (!searchTerm) {
            setFilteredData(kupvaData);
            return;
        }

        const filtered = kupvaData.filter(
            (item) =>
                item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleAddKupva = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: KupvaProfile) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        // Reload data after save
        loadKupvaData();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                    <div className="text-red-500 mb-4">
                        <X className="w-12 h-12 mx-auto" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={loadKupvaData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Data KUPVA
                    </h1>
                    <p className="text-gray-600">
                        Kelola data dan akun KUPVA (Kantor Unit Pelayanan Valuta Asing)
                    </p>
                </div>

                {/* Add Button */}
                <AddKupvaButton onClick={handleAddKupva} />

                {/* Search and Filter */}
                <SearchAndFilter onSearch={handleSearch} />

                {/* Table */}
                {filteredData.length > 0 ? (
                    <KupvaTable data={filteredData} onEdit={handleEdit} />
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                        <p className="text-gray-500">No KUPVA accounts found</p>
                    </div>
                )}

                {/* Results Info */}
                <div className="mt-4 text-sm text-gray-500">
                    Menampilkan {filteredData.length} dari {kupvaData.length} data KUPVA
                </div>

                {/* Modal */}
                <KupvaFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    editData={editingItem}
                />
            </div>
        </div>
    );
}
