import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function NavbarUser() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { name: "Jual Beli", link: "/jualbeli" },
        { name: "Informasi", link: "/informasi" },
        { name: "Kupva Di Sekitar Anda", link: "/info-kupva" },
        { name: "Login", link: "/login" },
    ];

    return (
        <>
            <nav className="hidden min-[570px]:flex pointer-events-auto mt-8 px-3 rounded-lg bg-neutral-800/60 w-fit mx-auto text-sm md:text-base z-40">
            <ul className="flex items-center gap-4">
                <a 
                className="py-3 px-2 font-rethink transition-colors text-accent-300 hover:text-accent-300" 
                href="/"
                >
                Home
                </a>
                
                {menuItems.map((item) => (
                <a 
                    key={item.name}
                    className="py-3 px-2 font-rethink text-neutral-200 hover:text-neutral-50 transition-colors" 
                    href={item.link}
                >
                    {item.name}
                </a>
                ))}
                
                <div className="w-px bg-neutral-500 h-[18px]"></div>
            </ul>
            </nav>

            {/* Mobile Menu Section */}
            <div className="min-[570px]:hidden w-full relative">
                {/* Mobile Menu Button - Fixed to the right */}
                <div className="fixed top-4 right-4 z-50">
                    <button
                    className="flex items-center space-x-1 bg-amber-500 p-2 rounded-lg shadow-lg"
                    onClick={toggleMenu}
                    >
                    <span>Menu</span>
                    <ChevronDownIcon className={`w-6 h-6 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Mobile Dropdown with fixed positioning */}
                <div 
                    className={`fixed top-16 w-full  transition-all duration-300 opacity-0 z-40 bg-amber-200 rounded-lg mx-2 -left-2 ${
                        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'
                    }`}
                    style={{ 
                        transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                        visibility: isMenuOpen ? 'visible' : 'hidden'
                    }}
                >
                    <div className="px-4 pb-4 space-y-2 mt-2">
                    {menuItems.map((item) => (
                        <a
                        key={item.name}
                        href={item.link}
                        className="block rounded-lg p-4 transition bg-black/30 hover:bg-black/50"
                        >
                        <div className="font-medium">{item.name}</div>
                        </a>
                    ))}
                    </div>
                </div>
            </div>
        </>
    );
}
