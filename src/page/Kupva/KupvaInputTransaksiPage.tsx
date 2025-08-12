import { NavbarKupva } from "../../components/utils/NavbarKupva";

export default function KupvaInputTransaksiPage() {
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return <p>You need to log in as a Kupva user to access this page.</p>;
    }   
    return (
        <div className="input-transaksi-page">
            <NavbarKupva />
            <h1 className="text-4xl font-bold">Input Transaksi</h1>
            <p>Welcome to the Input Transaksi Page</p>
        </div>
    );
}