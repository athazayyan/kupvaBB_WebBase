import { useState } from "react";
import supabase from "../../supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [role, setRole] = useState("kupva");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Daftar user ke Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Insert ke tabel profile jika user berhasil dibuat
      if (data.user) {
        const { error: insertError } = await supabase
          .from("profile") // pastikan nama tabel sama persis
          .insert([
            {
              id: data.user.id, // samakan id dengan UUID dari auth.users
              nama,
              email,
              alamat,
              no_telepon: noTelepon,
              role,
            },
          ]);

        if (insertError) throw insertError;

        setSuccess(true);

        // Reset form
        setEmail("");
        setPassword("");
        setNama("");
        setAlamat("");
        setNoTelepon("");
        setRole("kupva");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Registration successful! Please check your email.
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input type="text" placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} required className="border p-2 rounded" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border p-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border p-2 rounded" />
        <input type="text" placeholder="Alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="No Telepon" value={noTelepon} onChange={(e) => setNoTelepon(e.target.value)} className="border p-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value)} required className="border p-2 rounded">
          <option value="kupva">KUPVA</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading} className="bg-emerald-500 text-white p-2 rounded">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
