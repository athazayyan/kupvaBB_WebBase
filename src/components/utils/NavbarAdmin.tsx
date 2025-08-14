export function NavbarAdmin(){
    return (
        <>
        <nav className=" text-black p-4 border-2 border-black bg-white m-2 rounded-2xl">
            <ul className="flex space-x-4 justify-between font-light">

                <li><a href="/admin/dashboard">Home</a></li>
                <div className="flex space-x-4">
                <li><a href="/admin/data-kupva">Data KUPVA</a></li>
                <li><a href="/admin/data-pelanggan">Data Pelanggan</a></li>
                <li><a href="/admin/data-transaksi">Data Transaksi</a></li>
                <li><a href="/admin/profil">Profil</a></li>
                <li><a href="/admin/infomasi">Informasi</a></li>
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