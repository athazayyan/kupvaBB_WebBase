import { NavbarUser } from "../../components/utils/NavbarUser";
export default function InformasiPage() {
    return (
        <div className="informasi-page">
            <NavbarUser />
            <p><a href="/">Back</a></p>
            <h1 className="text-4xl font-bold">Informasi</h1>
            <p>Welcome to the Kupva Di Sekitar Anda Page</p>
        </div>
    );
}