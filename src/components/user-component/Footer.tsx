import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
} from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-40">
      {/* Main Footer */}
      <div
        style={{ backgroundColor: "#326593" }}
        className="text-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="md:text-2xl font-bold">
                  Kurs
                  <span style={{ color: "hsl(206.1, 100%, 87.8%)" }}>Kita</span>
                </h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Platform terpercaya untuk informasi kurs mata uang real-time
                dari money changer terverifikasi di seluruh Indonesia.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Menu Utama</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/"
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    Beranda
                  </a>
                </li>
                <li>
                  <a
                    href="/jualbeli"
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    Jual Beli
                  </a>
                </li>
                <li>
                  <a
                    href="/informasi"
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    Informasi
                  </a>
                </li>
                <li>
                  <a
                    href="/info-kupva"
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    Kupva Di Sekitar Anda
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Layanan <span className="text-sm font-extralight text-gray-200">(Hanya admin dan operator KUPVA)</span></h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    Login
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Kontak Kami</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white/80 text-sm">
                      Jl. Sudirman No. 123
                      <br />
                      Jakarta Pusat, 10220
                      <br />
                      Indonesia
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a
                    href="tel:+6221234567"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    +62 21 234 567
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a
                    href="mailto:info@kurskita.com"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    info@kurskita.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">
                    24/7 Online Service
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Currencies */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <h4 className="text-lg font-semibold mb-4">Mata Uang Populer</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { code: "USD", flag: "🇺🇸", name: "US Dollar" },
                { code: "EUR", flag: "🇪🇺", name: "Euro" },
                { code: "GBP", flag: "🇬🇧", name: "British Pound" },
                { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
                { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar" },
                { code: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
                { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan" },
                { code: "MYR", flag: "🇲🇾", name: "Malaysian Ringgit" },
              ].map((currency) => (
                <a
                  key={currency.code}
                  href={`/currency/${currency.code.toLowerCase()}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors group"
                >
                  <span className="text-lg">{currency.flag}</span>
                  <span className="text-sm font-medium group-hover:text-white">
                    {currency.code}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div
        style={{ backgroundColor: "#025495" }}
        className="text-white py-6"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-white/80 text-sm">
                © 2025 KursKita. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="/privacy"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="text-white/40">•</span>
                <a
                  href="/terms"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
                <span className="text-white/40">•</span>
               
              </div>
            </div>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors group"
            >
              <span className="text-sm">Kembali ke Atas</span>
              <ArrowUp className="w-4 h-4 group-hover:transform group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Statistics */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div
          style={{ backgroundColor: "hsl(34, 24%, 94%)" }}
          className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white text-sm"
        >
          <div className="grid grid-cols-3 gap-8 text-center ">
            <div>
              <div
                className="md:text-2xl font-bold"
                style={{ color: "#025495" }}
              >
                8
              </div>
              <div className="text-xs md:text-sm text-gray-600">Money Changer</div>
            </div>
            <div>
              <div
                className="md:text-2xl font-bold"
                style={{ color: "#025495" }}
              >
                25
              </div>
              <div className="text-xs md:text-sm text-gray-600">Mata Uang</div>
            </div>
            <div>
              <div
                className="md:text-2xl font-bold"
                style={{ color: "#025495" }}
              >
                1000+
              </div>
              <div className="text-xs md:text-sm text-gray-600">Pengguna</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
