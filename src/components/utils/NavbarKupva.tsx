import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

export function NavbarKupva() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("sb-yqhsofyqvejmpgwbqlnk-auth-token");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Input Harga", link: "/kupva/input-harga" },
    { name: "Input Transaksi", link: "/kupva/input-transaksi" },
    { name: "Data Pelanggan", link: "/kupva/pelanggan" },
    { name: "Daftar Transaksi", link: "/kupva/daftar-transaksi" },
    { name: "Profil", link: "/kupva/profil" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div
          style={{ backgroundColor: "hsl(170.9, 37.5%, 34.5%)" }}
          className="backdrop-blur-md rounded-full px-8 py-4 shadow-2xl"
        >
          <div className="flex items-center space-x-8">
            {/* Brand */}
            <a
              href="/kupva/dashboard"
              className="text-xl hover:scale-102 transition-transform font-bold text-white hover:text-blue-200"
            >
              KUPVA
              <span style={{ color: "hsl(206.1, 100%, 87.8%)" }}> Aceh</span>
            </a>

            {/* Divider */}
            <div className="w-px h-8 bg-white/30"></div>

            {/* Menu Items */}
            <div className="flex items-center space-x-6">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  className="group relative text-white hover:text-blue-200 font-medium transition-colors"
                >
                  {item.name}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-200 group-hover:w-full transition-all duration-300"></div>
                </a>
              ))}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group relative text-red-300 hover:text-red-200 font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-200 group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="fixed top-4 right-4 z-50 p-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          style={{ backgroundColor: "hsl(170.9, 37.5%, 34.5%)" }}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Mobile Backdrop */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-80 z-40 transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: "hsl(170.9, 37.5%, 34.5%)" }}
        >
          <div className="p-6 mt-16">
            {/* Mobile Brand */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white">
                <a href="/kupva/dashboard">
                  KUPVA
                  <span style={{ color: "hsl(206.1, 100%, 87.8%)" }}>
                    {" "}
                    Aceh
                  </span>
                </a>
              </h2>
              <p className="text-white/70 text-sm mt-2">
                Dashboard Koordinator
              </p>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-3">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  className="block p-4 rounded-xl text-white font-medium border-2 border-blue-200/30 transition-all transform hover:scale-105 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </a>
              ))}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full p-4 rounded-xl text-red-300 font-medium border-2 border-red-300/30 transition-all transform hover:scale-105 hover:bg-red-500/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </div>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-white/60 text-xs text-center">
                Bank Indonesia - KUPVA System
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
