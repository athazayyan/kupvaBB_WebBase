import { useState, useEffect } from "react";
import { NavbarKupva } from "../../components/utils/NavbarKupva";
import { supabase } from "../../supabaseClient";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Globe,
  Map,
  Navigation,
} from "lucide-react";

interface ProfileData {
  id: string;
  nama: string;
  email: string;
  alamat: string;
  no_telepon: string;
  role: string;
  created_at: string;
  latitude: number;
  longitude: number;
}

export default function KupvaProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});

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
            You need to log in as a Kupva user to access this page.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          setProfile(data);
          setEditedProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
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
      setError("Password tidak sama");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Password berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(error.message || "Gagal memperbarui password");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("profile")
        .update({
          nama: editedProfile.nama,
          alamat: editedProfile.alamat,
          no_telepon: editedProfile.no_telepon,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      setProfile({ ...profile!, ...editedProfile });
      setIsEditingProfile(false);
      setMessage("Profil berhasil diperbarui!");
    } catch (error: any) {
      setError(error.message || "Gagal memperbarui profil");
    }
  };

  const handleLocationUpdate = async () => {
    try {
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("profile")
        .update({
          latitude: editedProfile.latitude,
          longitude: editedProfile.longitude,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      setProfile({ ...profile!, ...editedProfile });
      setIsEditingLocation(false);
      setMessage("Lokasi berhasil diperbarui!");
    } catch (error: any) {
      setError(error.message || "Gagal memperbarui lokasi");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditedProfile({
            ...editedProfile,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError("Gagal mendapatkan lokasi: " + error.message);
        }
      );
    } else {
      setError("Geolocation tidak didukung browser ini");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen mt-16"
      style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
    >
      <NavbarKupva />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Profil Kupva
            </h1>
            <p className="text-gray-600">
              Kelola informasi profil dan pengaturan akun Anda
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">
                        Informasi Profil
                      </h2>
                    </div>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleProfileUpdate}
                          className="flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingProfile(false);
                            setEditedProfile(profile!);
                          }}
                          className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Batal</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="w-4 h-4" />
                        Nama Lengkap
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.nama || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              nama: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-800 font-medium">
                            {profile?.nama}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-800">{profile?.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Email tidak dapat diubah
                        </p>
                      </div>
                    </div>

                    {/* No Telepon */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone className="w-4 h-4" />
                        No. Telepon
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={editedProfile.no_telepon || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              no_telepon: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          placeholder="08xxxxxxxxxx"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-800">
                            {profile?.no_telepon || "Belum diisi"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Role (Read Only) */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Shield className="w-4 h-4" />
                        Role
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {profile?.role?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4" />
                      Alamat
                    </label>
                    {isEditingProfile ? (
                      <textarea
                        value={editedProfile.alamat || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            alamat: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        placeholder="Masukkan alamat lengkap..."
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-800">
                          {profile?.alamat || "Belum diisi"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">
                        Koordinat Lokasi
                      </h2>
                    </div>
                    {!isEditingLocation ? (
                      <button
                        onClick={() => setIsEditingLocation(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleLocationUpdate}
                          className="flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingLocation(false);
                            setEditedProfile(profile!);
                          }}
                          className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Batal</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latitude */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Map className="w-4 h-4" />
                        Latitude
                      </label>
                      {isEditingLocation ? (
                        <input
                          type="number"
                          step="0.000001"
                          value={editedProfile.latitude || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              latitude: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors font-mono"
                          placeholder="-6.200000"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-800 font-mono">
                            {profile?.latitude || "0.000000"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Longitude */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Map className="w-4 h-4" />
                        Longitude
                      </label>
                      {isEditingLocation ? (
                        <input
                          type="number"
                          step="0.000001"
                          value={editedProfile.longitude || ""}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              longitude: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors font-mono"
                          placeholder="106.816666"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-gray-800 font-mono">
                            {profile?.longitude || "0.000000"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditingLocation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-800 font-medium">
                            Gunakan Lokasi Saat Ini
                          </p>
                          <p className="text-blue-600 text-sm">
                            Otomatis mengisi koordinat berdasarkan lokasi
                            browser
                          </p>
                        </div>
                        <button
                          onClick={getCurrentLocation}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Dapatkan Lokasi</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Google Maps Link */}
                  {profile?.latitude !== 0 && profile?.longitude !== 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium mb-2">
                        Lihat di Peta
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${profile?.latitude},${profile?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Buka Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Account Info */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6" />
                    <h2 className="text-xl font-semibold">Info Akun</h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      User ID
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-gray-800 font-mono text-sm break-all">
                        {profile?.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Dibuat
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-gray-800 text-sm">
                        {profile?.created_at
                          ? formatDate(profile.created_at)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Update */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6" />
                    <h2 className="text-xl font-semibold">Keamanan</h2>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          placeholder="Masukkan password baru"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                          placeholder="Konfirmasi password baru"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newPassword || !confirmPassword}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
                    >
                      Update Password
                    </button>
                  </form>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Persyaratan password:</strong> Minimal 6 karakter.
                      Gunakan kombinasi huruf, angka, dan simbol untuk keamanan
                      yang lebih baik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
