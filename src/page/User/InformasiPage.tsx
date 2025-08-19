import { NavbarUser } from "../../components/utils/NavbarUser";
import { useEffect, useState } from "react";
import { Footer } from "../../components/user-component/Footer";

interface Article {
    id: string | number;
    tag: string;
    judul: string;
    penulis: string;
    tanggal: string;
    berita: string;
}

interface InformasiData {
    title: string;
    articles: Article[];
}

export default function InformasiPage() {
    const [data, setData] = useState<InformasiData | null>(null);

    useEffect(() => {
        // Mock data since we don't have an actual API endpoint
        const mockData: InformasiData = {
            title: "Informasi KUPVA BB",
            articles: [
                {
                    id: "1",
                    tag: "Bank Sentral",
                    judul: "Bank Indonesia: Pilar Stabilitas Moneter",
                    berita: "Bank Indonesia (BI) adalah bank sentral Republik Indonesia yang bertugas menjaga stabilitas moneter dan sistem keuangan. BI memiliki peran utama dalam menetapkan kebijakan moneter, mengatur sistem pembayaran, dan mengawasi sektor keuangan untuk mendukung pertumbuhan ekonomi nasional. Didirikan pada tahun 1953, BI beroperasi berdasarkan Undang-Undang Nomor 23 Tahun 1999 yang telah beberapa kali diubah, terakhir melalui UU PPKSK 2023.",
                    tanggal: "2025-08-10",
                    penulis: "Ahmad Santoso"
                },
                {
                    id: "2",
                    tag: "Ekonomi Daerah",
                    judul: "Peran Bank Indonesia Aceh dalam Ekonomi Syariah",
                    berita: "Kantor Perwakilan Bank Indonesia (KPw BI) Aceh berfungsi sebagai perpanjangan tangan BI di wilayah Aceh. KPw BI Aceh bertugas mempromosikan stabilitas ekonomi daerah, mengawasi sistem pembayaran, dan mendukung pengembangan ekonomi lokal, termasuk sektor syariah yang kuat di Aceh. Kantor ini juga berperan dalam edukasi masyarakat tentang kebijakan moneter dan pengelolaan keuangan yang sehat.",
                    tanggal: "2025-08-11",
                    penulis: "Siti Aisyah"
                },
                {
                    id: "3",
                    tag: "Keuangan",
                    judul: "Regulasi KUPVA BB: Money Changer di Indonesia",
                    berita: "Kegiatan Usaha Penukaran Valuta Asing Bukan Bank (KUPVA BB) atau money changer adalah usaha jual-beli mata uang asing dan cek pelancong yang diatur oleh Bank Indonesia berdasarkan Peraturan BI No. 18/20/PBI/2016. Penyelenggara KUPVA BB wajib memiliki izin dari BI, menampilkan logo resmi KUPVA Berizin, dan menyampaikan laporan bulanan. Untuk mendirikan KUPVA BB, diperlukan modal minimal Rp100 juta (atau Rp250 juta di kota-kota besar seperti Jakarta dan Bali) dan badan hukum berbentuk PT yang sahamnya dimiliki WNI. BI juga membatasi izin baru di Jakarta mulai 1 Juli 2025 hingga 31 Desember 2026 untuk menjaga efisiensi dan persaingan sehat.",
                    tanggal: "2025-08-12",
                    penulis: "Budi Raharjo"
                },
                {
                    id: "4",
                    tag: "Teknologi Keuangan",
                    judul: "Kemajuan Sistem Pembayaran Digital Indonesia",
                    berita: "Sistem pembayaran digital di Indonesia berkembang pesat, didukung oleh Bank Indonesia melalui inisiatif seperti BI-FAST, QRIS (Quick Response Code Indonesian Standard), dan SNAP (Standar Nasional Open API Pembayaran). BI-FAST memungkinkan transfer antar bank secara real-time dengan biaya rendah, sementara QRIS memfasilitasi pembayaran non-tunai yang terjangkau di berbagai merchant. Hingga 2025, BI terus mendorong inklusi keuangan dengan memperluas akses QRIS ke UMKM dan integrasi lintas negara, seperti dengan Jepang dan Tiongkok. Pengawasan ketat diterapkan untuk mencegah pencucian uang dan pendanaan terorisme.",
                    tanggal: "2025-08-13",
                    penulis: "Dewi Lestari"
                }
            ]
        };

        // Simulate API call with setTimeout
        setTimeout(() => {
            setData(mockData);
        }, 500);

        // If you have an actual API endpoint, use:
        // fetch("your-api-endpoint")
        //   .then((response) => response.json())
        //   .then((jsonData) => setData(jsonData))
        //   .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div className="min-h-screen ">
            <NavbarUser />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="border-b border-gray-200 pb-6 mb-8">
                    <a
                        href="/"
                        className="inline-block text-blue-600 hover:text-blue-800 transition-colors mb-4 font-sans text-sm uppercase tracking-wider"
                    >
                        ← Kembali
                    </a>
                    <h1 className="text-4xl sm:text-5xl font-bold  leading-tight">
                        {data ? data.title : "Informasi"}
                    </h1>
                </div>

                {/* News Articles */}
                {data ? (
                    <div className="grid gap-12">
                        {data.articles.map((article: Article) => (
                            <article key={article.id} className="border-b border-gray-200 pb-8">
                                <p>--</p>
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-sans uppercase tracking-wide px-2 py-1 rounded mb-2">
                                    {article.tag}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-semibold  mb-3">
                                    {article.judul}
                                </h2>
                                <p className="text-sm text-gray-500 font-sans mb-4">
                                    Oleh {article.penulis} | {article.tanggal}
                                </p>
                                <p className="text-lg   font-sans leading-relaxed">
                                    {article.berita}
                                </p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="text-lg text-gray-700 font-sans">Memuat berita...</p>
                )}
            </div>
            <Footer />
        </div>
    );
}