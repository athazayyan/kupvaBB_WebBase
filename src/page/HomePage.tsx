import { NavbarUser } from "../components/utils/NavbarUser";
export default function HomePage() {
    return (
        <div className="home-page">
        <NavbarUser />
        <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
        <p>This is the main content of the home page.</p>
        </div>
    );
}