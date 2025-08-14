import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("role")
          .eq("email", data.user.email)
          .single();

        if (profileError) throw profileError;

        if (profileData.role === "admin") {
          navigate("/admin/dashboard");
        } else if (profileData.role === "kupva") {
          navigate("/kupva/dashboard");
        } else {
          throw new Error("Tidak memiliki izin akses");
        }
      }
    } catch (error: any) {
      setError(error.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page p-6 max-w-md mx-auto">
      <p>
        <a href="/" className="text-blue-500 hover:underline">
          Back
        </a>
      </p>
      <h1 className="text-4xl font-bold my-4">Login Page</h1>
      <p className="mb-6">
        Hanya Koordinator KUPVA BB dan Admin BI yang dapat mengakses halaman ini
      </p>
      <p>contoh akun:"admin" atha.al.khand@gmail.com pw: kitabisa123</p>
      <p>contoh akun:"kupva" kita.karsadata@gmail.com pw: 123456</p>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
