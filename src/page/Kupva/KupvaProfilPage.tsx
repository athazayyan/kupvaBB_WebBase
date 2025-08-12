
import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";

export default function KupvaProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
            
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    // Get additional profile data if needed
                    const { data, error } = await supabase
                        .from('profile') 
                        .select('*')
                        .eq('id', user.id)
                        .single();
                        
                    if (error) throw error;
                    
                    setProfile({ ...user, ...data });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchProfile();
    }, []);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");
        
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            setMessage("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setError(error.message || "Failed to update password");
        }
    };

    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-600 text-lg">You need to log in as a Kupva user to access this page.</p>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="kupva-profile-page min-h-screen bg-gray-50">
            <NavbarKupva />
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Kupva Profile</h1>
                
                {/* Profile Information Preview - Read Only */}
                {profile && (
                    <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-blue-500 text-white px-6 py-4">
                            <h2 className="text-2xl font-semibold">Profile Information</h2>
                            <p className="text-blue-100 text-sm">This information cannot be edited directly</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        <p className="text-gray-800 font-medium">{profile.email}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">User ID</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        <p className="text-gray-800 font-mono text-sm">{profile.id}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Created</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        <p className="text-gray-800">{new Date(profile.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        <p className="text-gray-800">{new Date(profile.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional profile fields if they exist */}
                            {profile.full_name && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        <p className="text-gray-800 font-medium">{profile.full_name}</p>
                                    </div>
                                </div>
                            )}
                            
                            {profile.phone && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                                    <div className="p-3 bg-gray-50 rounded-md border">
                                        <p className="text-gray-800">{profile.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Password Update Section - Editable */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-500 text-white px-6 py-4">
                        <h2 className="text-2xl font-semibold">Security Settings</h2>
                        <p className="text-green-100 text-sm">Update your account password</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}
                            
                            {message && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-green-600 text-sm">{message}</p>
                                </div>
                            )}
                            
                            <button 
                                type="submit"
                                disabled={!newPassword || !confirmPassword}
                                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Update Password
                            </button>
                        </form>
                        
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-sm">
                                <strong>Password requirements:</strong> Minimum 6 characters. Use a strong password with a mix of letters, numbers, and symbols.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}