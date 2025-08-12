import { NavbarKupva } from "../../components/utils/NavbarKupva";

export default function KupvaInputHarga() {
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return <p>You need to log in as a Kupva user to access this page.</p>;
    }   
    return (
        <div className="input-harga-page">
            <NavbarKupva />
            <h1 className="text-4xl font-bold">Input Harga</h1>
            <p>Welcome to the Input Harga Page</p>
        </div>
    );
}