import { NavbarKupva } from "../../components/utils/NavbarKupva";

export default function KupvaDaftarTransaksi() {
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return <p>You need to log in as a Kupva user to access this page.</p>;
    }   
    return (
        <div className="kupva-main-page">
            <NavbarKupva />
            <p>
                {(() => {
                    try {
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        return decodedToken.name || 'Kupva User';
                    } catch (error) {
                        return 'Kupva User';
                    }
                })()}
            </p>
            <h1 className="text-4xl font-bold">Kupva Main Page</h1>
            <p>Welcome to the Kupva Daftar Transaksi Page. This page is accessible only to Kupva users.</p>
        </div>
    );
}