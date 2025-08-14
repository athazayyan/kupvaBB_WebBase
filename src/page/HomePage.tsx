import { NavbarUser } from "../components/utils/NavbarUser";
import { FaArrowRight, FaLightbulb, FaRocket, FaUsers } from "react-icons/fa";

export default function HomePage() {
  return (
    <div className="home-page min-h-screen ">
      <NavbarUser />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-800 mb-6">
          Welcome to <span className="text-indigo-600">Kupvabb</span>
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-10">
          Your platform for connecting, creating, and collaborating with amazing
          people from around the world.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium flex items-center transition-all">
          Get Started <FaArrowRight className="ml-2" />
        </button>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="text-indigo-600 text-3xl mb-4 flex justify-center">
                <FaRocket />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Fast Performance
              </h3>
              <p className="text-gray-600 text-center">
                Experience lightning-fast interactions on our optimized
                platform.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="text-indigo-600 text-3xl mb-4 flex justify-center">
                <FaUsers />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Community Driven
              </h3>
              <p className="text-gray-600 text-center">
                Join thousands of users already enjoying our growing community.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="text-indigo-600 text-3xl mb-4 flex justify-center">
                <FaLightbulb />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Innovative Solutions
              </h3>
              <p className="text-gray-600 text-center">
                Explore cutting-edge features designed to enhance your
                experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
