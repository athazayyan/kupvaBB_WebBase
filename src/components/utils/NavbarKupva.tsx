import { useState } from 'react';

export function NavbarKupva() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="text-black p-4 border-2 border-black bg-white m-2 rounded-2xl fixed top-0 left-0 right-0 z-10">
                <div className="flex items-center justify-between mx-4 md:mx-10">
                    <div className="flex items-center">
                        <p className="text-lg font-extrabold">
                            <a href="/kupva/dashboard">KUPVA Aceh</a>
                        </p>
                    </div>

                    <button 
                        className="md:hidden focus:outline-none" 
                        onClick={toggleMenu}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    <ul className="hidden md:flex items-center space-x-4 font-bold">
                        <li><a href="/kupva/input-harga">Input Harga</a></li>
                        <li><a href="/kupva/input-transaksi">Input Transaksi</a></li>
                        <li><a href="/kupva/pelanggan">Data Pelanggan</a></li>
                        <li><a href="/kupva/daftar-transaksi">Daftar Transaksi</a></li>
                        <li><a href="/kupva/profil">Profil</a></li>
                        <li className="text-red-500 font-light">
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('authToken');
                                    localStorage.removeItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
                                    localStorage.removeItem('userData');
                                    window.location.href = '/';
                                }}
                                className="cursor-pointer"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden mt-4">
                        <ul className="flex flex-col space-y-4 px-4">
                            <li><a href="/kupva/input-harga">Input Harga</a></li>
                            <li><a href="/kupva/input-transaksi">Input Transaksi</a></li>
                            <li><a href="/kupva/pelanggan">Data Pelanggan</a></li>
                            <li><a href="/kupva/daftar-transaksi">Daftar Transaksi</a></li>
                            <li><a href="/kupva/profil">Profil</a></li>
                            <li className="text-red-500 font-light">
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('authToken');
                                        localStorage.removeItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
                                        localStorage.removeItem('userData');
                                        window.location.href = '/';
                                    }}
                                    className="cursor-pointer"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>
        </>
    );
}