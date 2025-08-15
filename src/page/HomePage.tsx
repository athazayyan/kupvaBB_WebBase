import { NavbarUser } from "../components/utils/NavbarUser";
import { FaArrowRight } from "react-icons/fa";

export default function HomePage() {
  return (
    <>
      <NavbarUser />
    <div className="home-page min-h-screen mt-20">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center ">
        <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-800 mb-6">
          Welcome to <span className="text-indigo-600">Kupvabb</span>
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-10">
          Your platform for connecting, creating, and collaborating with amazing
          people from around the world.
        </p>
        <button className="bg-[var(--secondary-color)] hover:bg-sky-700 hover:text-amber-100  px-8 py-3 rounded-full font-medium flex items-center transition-all">
          Get Started <FaArrowRight className="ml-2" />
        </button>
      </div>


        </div>
        </>
  );
}
