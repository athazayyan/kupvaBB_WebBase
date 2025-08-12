import { NavbarKupva } from "../../components/utils/NavbarKupva";
export default function KupvaDataPelanggan() {
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return <p>You need to log in as a Kupva user to access this page.</p>;
    }   
    return (
        <div className="data-pelanggan-page">
            <NavbarKupva />
            <h1 className="text-4xl font-bold">Data Pelanggan</h1>
            <p>Welcome to the Data Pelanggan Page</p>
        </div>
    );
}
