export function NavbarKupva(){
    return (
        <>
        <nav className=" text-black p-4 border-2 border-black bg-white m-2 rounded-2xl">
            <ul className="flex space-x-4 justify-between font-bold">
                <li><a href="/kupva/dashboard">Home</a></li>
                <div className="flex space-x-4">
                <li><a href="/kupva/input-harga">Input Harga</a></li>
                <li><a href="/kupva/input-transaksi">Input Transaksi</a></li>
                <li><a href="/kupva/pelanggan">Data Pelanggan</a></li>
                <li><a href="/kupva/daftar-transaksi">Daftar Transaksi</a></li>
                <li><a href="/kupva/profil">Profil</a></li>
                </div>
                <li className="text-red-500 font-light"><button 
                    onClick={() => {
                        // Clear any auth tokens or user data from localStorage
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
                        localStorage.removeItem('userData');
                        
                        // Redirect to the home/login page
                        window.location.href = '/';
                    }}
                    className="cursor-pointer"
                >
                    Logout
                </button></li>

            </ul>
        </nav>
        </>
    )
}