import { useState } from 'react';
import { NavbarUser } from "../components/utils/NavbarUser";
import { Footer } from "../components/user-component/Footer";
import { ChevronDown, ChevronUp, Search, Notebook, FileText, Workflow } from 'lucide-react';

type FeatureKey = 'monitor' | 'exchange' | 'track' | 'network';

type FeatureItem = {
  title: string;
  description: string;
  image: string;
  content: string;
};

type FeaturesType = {
  [key in FeatureKey]: FeatureItem;
};

const KupvaFeatures = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureKey>('monitor');

  const features: FeaturesType = {
    monitor: {
      title: "Monitor Kurs Real-time (Pengguna)",
      description: "Pantau kurs mata uang asing secara real-time dari berbagai Money Changer terpercaya. Dapatkan informasi kurs terkini kapan saja, di mana saja dengan akurasi tinggi.",
      image: "/KupvaA.svg",
      content: "Dengan fitur monitoring kami, Anda dapat memantau fluktuasi kurs dan membuat keputusan transaksi yang tepat waktu."
    },
    exchange: {
      title: "Transaksi Mudah (Pengguna)",
      description: "Lakukan transaksi tukar valas dengan mudah dan aman. Temukan Money Changer terdekat dengan kurs terbaik dan proses transaksi yang cepat serta terpercaya.",
      image: "/KupvaA.svg",
      content: "Sistem transaksi yang terintegrasi memungkinkan Anda melakukan penukaran valas dengan proses yang efisien dan transparan."
    },
    track: {
      title: "Lacak Riwayat Transaksi (Penyedia)",
      description: "Kelola dan lacak semua riwayat transaksi valas Anda. Dapatkan laporan detail, analisis trend, dan insights untuk pengambilan keputusan finansial yang lebih baik.",
      image: "/KupvaA.svg",
      content: "Dokumentasi lengkap transaksi dengan fitur analisis yang membantu Anda memahami pola pengeluaran valas."
    },
 network: {
  title: "Semua Transaksi Yang Diawasi (Pengawas)",
  description: "Semua transaksi yang diawasi oleh sistem kami memberikan Anda keamanan dan transparansi serta menjamin bebas dari APU PPT.",
  image: "/KupvaA.svg",
  content: "Setiap transaksi diawasi secara ketat oleh sistem kami untuk memastikan keamanan, transparansi, dan kepatuhan terhadap regulasi yang berlaku."
}

  };

  const FeatureButton = ({ featureKey, feature, isActive }: { featureKey: string, feature: any, isActive: boolean }) => (
    <button
      onClick={() => setActiveFeature(featureKey as FeatureKey)}
      className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-white shadow-lg border-l-4 border-[var(--primary-color)]' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {featureKey === 'monitor' && <Search className="w-5 h-5 text-[var(--primary-color)]" />}
          {featureKey === 'exchange' && <Notebook className="w-5 h-5 text-[var(--primary-color)]" />}
          {featureKey === 'track' && <FileText className="w-5 h-5 text-[var(--primary-color)]" />}
          {featureKey === 'network' && <Workflow className="w-5 h-5 text-[var(--primary-color)]" />}
          <h3 className="text-lg font-semibold text-gray-800">
            {feature.title}
          </h3>
        </div>
        {isActive ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>
      
      {isActive && (
        <div className="mt-4 pl-8">
          <p className="text-gray-600 leading-relaxed">
            {feature.description}
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 italic">
              {feature.content}
            </p>
          </div>
        </div>
      )}
    </button>
  );

  const MockupScreen = () => (
    <div className="bg-gray-100 rounded-lg p-6 shadow-2xl">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-600">Kupva - {features[activeFeature].title}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="text-center mb-6">
            <img 
              src={features[activeFeature].image} 
              alt={features[activeFeature].title}
              className="w-32 h-32 mx-auto mb-4 opacity-80"
            />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {features[activeFeature].title}
            </h4>
            <p className="text-gray-600 text-sm">
              {features[activeFeature].content}
            </p>
          </div>

          {/* Demo Elements based on active feature */}
          <div className="space-y-3">
            {activeFeature === 'monitor' && (
              <>
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <div className="text-sm font-medium text-blue-800">💱 USD/IDR: 15,750</div>
                  <div className="text-xs text-blue-600">Update real-time</div>
                </div>
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                  <div className="text-sm font-medium text-green-800">📈 EUR/IDR: 17,250</div>
                  <div className="text-xs text-green-600">Trending naik 0.5%</div>
                </div>
              </>
            )}
            
            {activeFeature === 'exchange' && (
              <>
                <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                  <div className="text-sm font-medium text-purple-800">🏪 MC Terdekat (2.5km)</div>
                  <div className="text-xs text-purple-600">Kurs terbaik tersedia</div>
                </div>
                <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                  <div className="text-sm font-medium text-orange-800">✅ Transaksi Berhasil</div>
                  <div className="text-xs text-orange-600">USD $500 → IDR 7,875,000</div>
                </div>
              </>
            )}

            {activeFeature === 'track' && (
              <>
                <div className="bg-indigo-50 p-3 rounded border-l-4 border-indigo-400">
                  <div className="text-sm font-medium text-indigo-800">📊 Laporan Bulanan</div>
                  <div className="text-xs text-indigo-600">Total: IDR 25,500,000</div>
                </div>
                <div className="bg-pink-50 p-3 rounded border-l-4 border-pink-400">
                  <div className="text-sm font-medium text-pink-800">📈 Analisis Trend</div>
                  <div className="text-xs text-pink-600">Penghematan 12% bulan ini</div>
                </div>
              </>
            )}

            {activeFeature === 'network' && (
              <>
                <div className="bg-teal-50 p-3 rounded border-l-4 border-teal-400">
                  <div className="text-sm font-medium text-teal-800">🌐 500+ Money Changer</div>
                  <div className="text-xs text-teal-600">Jaringan nasional</div>
                </div>
                <div className="bg-cyan-50 p-3 rounded border-l-4 border-cyan-400">
                  <div className="text-sm font-medium text-cyan-800">🔗 Terintegrasi Real-time</div>
                  <div className="text-xs text-cyan-600">Update kurs otomatis</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 ">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Kupva dalam <span className="text-[var(--primary-color)]">Aksi</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dengan Kupva, Anda memiliki semua yang dibutuhkan untuk mengelola transaksi valas. 
            Gunakan untuk monitoring kurs, perencanaan transaksi, dan menemukan Money Changer terbaik 
            kapan Anda membutuhkannya.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Features Sidebar */}
          <div className="lg:w-1/2">
            <div className="space-y-4">
              {Object.entries(features).map(([key, feature]) => (
                <FeatureButton
                  key={key}
                  featureKey={key}
                  feature={feature}
                  isActive={activeFeature === key}
                />
              ))}
            </div>
          </div>

          {/* Mockup Area */}
          <div className="lg:w-1/2">
            <MockupScreen />
          </div>
        </div>

       
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <>
      <NavbarUser />

      <section className="mt-5 md:mt-20" id="hero-section">
        <div className="container mx-auto px-4 py-16 ">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* TEXT AREA */}
            <div className="md:w-1/2 flex flex-col items-center md:items-start">
              <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left text-gray-800 mb-6">
                Pantau, Tukar,{" "}
                <span className="text-[var(--primary-color)]">Percaya</span>
              </h1>
              <p className="text-xl text-gray-600 text-center md:text-left mb-10">
                Temukan kurs terkini, nikmati kemudahan transaksi, dan rasakan
                kepercayaan dalam genggaman.
              </p>
              <button className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-opacity-90 hover:bg-[var(--secondary-color)] hover:text-[var(--primary-color)] transition-all">
                Mulai Sekarang
              </button>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <a href="/jualbeli">
                <img src="/KupvaA.svg" alt="Kupva Illustration" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <KupvaFeatures />

      <Footer />
    </>
  );
}