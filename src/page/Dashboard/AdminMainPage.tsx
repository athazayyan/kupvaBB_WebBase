import { NavbarAdmin } from "../../components/utils/NavbarAdmin";
export default function AdminMainPage() {
    const token = localStorage.getItem('sb-yqhsofyqvejmpgwbqlnk-auth-token');
    if (!token) {
        return <p>You need to log in as an admin to access this page.</p>;
    }   
    return (
        <div className="admin-main-page">
            <NavbarAdmin />
            <p>
                {(() => {
                    try {
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        return decodedToken.name || 'Admin';
                    } catch (error) {
                        return 'Admin';
                    }
                })()}
            </p>
            <h1 className="text-4xl font-bold">Admin Main Page</h1>
            <p>Welcome to the Admin Main Page. This page is accessible only to Admin users.</p>
        </div>
    );
}