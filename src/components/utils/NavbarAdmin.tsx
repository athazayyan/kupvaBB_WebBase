import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  UserCheck,
  FileText,
  User,
  Info,
  LogOut,
} from "lucide-react";

export function NavbarAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Clear any auth tokens or user data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
    localStorage.removeItem("userData");

    // Redirect to the home/login page
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", link: "/admin/dashboard", icon: Home },
    { name: "Data KUPVA", link: "/admin/data-kupva", icon: Users },
    { name: "Data Pelanggan", link: "/admin/data-pelanggan", icon: UserCheck },
    { name: "Data Transaksi", link: "/admin/data-transaksi", icon: FileText },
    { name: "Profil", link: "/admin/profil", icon: User },
    { name: "Informasi", link: "/admin/informasi", icon: Info },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-4 shadow-2xl border border-gray-200">
          <div className="flex items-center space-x-8">
            <a
              href="/admin/dashboard"
              className="text-xl hover:scale-102 transition-transform font-bold text-gray-800 hover:text-teal-600"
            >
              Admin
              <span className="text-teal-600 hover:text-gray-800">Panel</span>
            </a>

            <div className="w-px h-8 bg-gray-300"></div>

            <div className="flex items-center space-x-6">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.link}
                    className="group relative flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.name}
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></div>
                  </a>
                );
              })}
            </div>

            <div className="w-px h-8 bg-gray-300"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors group"
            >
              <LogOut className="w-4 h-4" />
              Logout
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <div className="lg:hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transform hover:scale-105 transition-all duration-200"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-800" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md z-40 transform transition-transform duration-300 border-l border-gray-200 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 mt-16">
            {/* Admin Panel Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-800">
                <a href="/admin/dashboard">
                  Admin<span className="text-teal-600">Panel</span>
                </a>
              </h2>
              <p className="text-gray-500 mt-1">Kelola sistem KursKita</p>
            </div>

            {/* Menu Items */}
            <div className="space-y-3 mb-6">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.link}
                    className="block p-4 rounded-xl text-gray-700 font-medium border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all transform hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-teal-600" />
                      <span>{item.name}</span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full p-4 rounded-xl text-red-500 font-medium border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 justify-center">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </div>
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Admin Dashboard v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
