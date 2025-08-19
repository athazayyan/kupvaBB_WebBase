import { useState } from "react";
import { Menu, X } from "lucide-react";

export function NavbarUser() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { name: "Jual Beli", link: "/jualbeli" },
    { name: "Kupva Di Sekitar Anda", link: "/info-kupva"},
  ];

  return (
    <>
      <nav className="hidden md:block fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-[var(--primary-color)] backdrop-blur-md rounded-full px-8 py-4 shadow-2xl ">
          <div className="flex items-center space-x-8">
           <a href="/" className="text-xl hover:scale-102 transition-transform font-bold text-white hover:text-[var(--secondary-color)]">
  Kurs<span className="text-[var(--secondary-color)] hover:text-white">Kita</span>
</a>
            
            <div className="w-px h-8 bg-slate-600"></div>
            
            <div className="flex items-center space-x-6">
              {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              className="group relative text-white hover:text-slate-300 font-medium transition-colors"
            >
              {item.name}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--secondary-color)] group-hover:w-full transition-all duration-300"></div>
            </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="fixed top-4 right-4 z-50 bg-[var(--primary-color)] p-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-white " />
          ) : (
            <Menu className="w-6 h-6 text-white " />
          )}
        </button>

        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-sky-200 bg-opacity-50 backdrop-blur-sm z-30"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div className={`fixed top-0 right-0 h-full w-80 bg-[var(--primary-color)] z-40 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 mt-16">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white">
                <a href="/">KursKita</a>
              </h2>
            </div>

            <div className="space-y-3">
         
              
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  className="block p-4 rounded-xl text-white font-medium border-2 border-[var(--secondary-color)] transition-all transform hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                  </div>
                </a>
              ))}
            </div>

           
          </div>
        </div>
      </div>
    </>
  );
}

export default NavbarUser;