import { useState } from "react";
import { useLocation } from "react-router-dom";

export function NavbarUser() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className=" backdrop-blur-3xl rounded-xl sm:mx-6 lg:mx-8 mt-4 sticky top-4 z-50">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            Home /
          </a>

          {/* Hamburger Button for Mobile */}
          <button
            className="sm:hidden  hover:text-emerald-950 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          {/* Navigation Links */}
          <ul
            className={`${
              isMenuOpen ? "block" : "hidden"
            } sm:flex sm:space-x-8 absolute sm:static top-full left-0 right-0 bg-white/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-b-xl sm:rounded-none shadow-md sm:shadow-none p-4 sm:p-0 font-sans text-sm font-medium transition-all duration-300 ease-in-out`}
          >
            <li>
              <a
                href="/jualbeli"
                className={`relative block py-2 sm:py-0  hover:text-emerald-950 transition-colors ${
                  location.pathname === "/jualbeli" ? "text-blue-600" : ""
                }`}
              >
                Jual Beli
                {location.pathname === "/jualbeli" && (
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
                )}
              </a>
            </li>
            <li>
              <a
                href="/informasi"
                className={`relative block py-2 sm:py-0  hover:text-emerald-950 transition-colors ${
                  location.pathname === "/informasi" ? "text-blue-600" : ""
                }`}
              >
                Informasi
                {location.pathname === "/informasi" && (
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
                )}
              </a>
            </li>
            <li>
              <a
                href="/info-kupva"
                className={`relative block py-2 sm:py-0  hover:text-emerald-950 transition-colors ${
                  location.pathname === "/info-kupva" ? "text-blue-600" : ""
                }`}
              >
                Kupva Di Sekitar Anda
                {location.pathname === "/info-kupva" && (
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
                )}
              </a>
            </li>
            <li className="sm:ml-4">
              <a
                href="/login"
                className="block py-2 sm:py-1 px-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
