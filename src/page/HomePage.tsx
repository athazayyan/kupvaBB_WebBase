import { NavbarUser } from "../components/utils/NavbarUser";

export default function HomePage() {
  return (
    <>
      <NavbarUser />

<section className="mt-5 md:mt-20" id="hero-section">
  <div className="container mx-auto px-4 py-16">
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="md:w-1/2 flex flex-col items-center md:items-start">
        <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left text-gray-800 mb-6">
          Pantau, Tukar, <span className="text-[var(--primary-color)]">Percaya</span>
        </h1>
        <p className="text-xl text-gray-600 text-center md:text-left mb-10">
          Temukan kurs terkini, nikmati kemudahan transaksi, dan rasakan kepercayaan dalam genggaman.
        </p>
        <button className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all">
          Mulai Sekarang 
        </button>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img 
          src="/KupvaA.png" 
          alt="Kupva illustration" 
          className="max-w-full md:max-w-xl"
        />
      </div>
    </div>
  </div>
</section>

        </>
  );
}
