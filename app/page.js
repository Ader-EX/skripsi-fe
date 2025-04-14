import Navbar from "@/components/global/Navbar";
import Image from "next/image";
import Link from "next/link";
import image from "@/public/hero.png";
import logo from "@/public/LOGO_UPNVJ.png";
import { Book, Brain, School } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-red-50">
        <main className="max-w-screen-xl mx-auto px-10 pt-8 pb-8 flex flex-col gap-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="Logo UPN Veteran Jakarta"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Universitas Pembangunan Nasional
                </h3>
                <h4 className="text-sm font-bold text-green-700">
                  Veteran Jakarta
                </h4>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute right-20 top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                <h1 className="relative text-4xl md:text-5xl xl:text-6xl font-extrabold text-text-primary font-sans">
                  GenPlan: Solusi Penjadwalan Kampus Tanpa Konflik
                </h1>
              </div>
              <p className="text-text-secondary mt-6 text-lg font-sans">
                Optimalisasi jadwal perkuliahan menggunakan algoritma Genetic
                Algorithm dan Simulated Annealing untuk menciptakan jadwal yang
                efisien dan bebas dari tumpang tindih di UPN Veteran Jakarta.
              </p>

              <div className="mt-8 flex space-x-4">
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-500 transition-all duration-300 font-sans"
                >
                  Login
                </Link>
                <Link
                  href="#teknologi"
                  className="border border-border bg-white/50 backdrop-blur-sm text-text-primary px-6 py-3 rounded-lg hover:bg-white/80 transition-colors font-sans"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative">
                <Image
                  src={image}
                  alt="Ilustrasi GenPlan"
                  width={500}
                  height={500}
                  className="rounded-lg"
                />
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md flex items-center gap-2">
                  <Image
                    src={logo}
                    alt="Logo UPN Veteran Jakarta"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <span className="text-xs font-bold text-green-800">
                    UPN Veteran Jakarta
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-sans">
              Keunggulan GenPlan:
            </h2>
            <div className="space-y-8">
              {[
                {
                  icon: (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  ),
                  title: "Optimalisasi Otomatis",
                  description:
                    "Menggunakan algoritma canggih untuk menghasilkan jadwal optimal secara otomatis",
                  bgClass: "bg-gradient-to-br from-green-500 to-green-700",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Hemat Waktu",
                  description:
                    "Mempercepat proses penyusunan jadwal yang biasanya memakan waktu berhari-hari",
                  bgClass: "bg-gradient-to-br from-blue-500 to-blue-600",
                },
                {
                  icon: <Brain className="h-6 w-6" />,
                  title: "Memudahkan Proses Penjadwalan",
                  description:
                    "Jadwal yang dihasilkan meminimalisir modifikasi secara manual oleh satu pihak",
                  bgClass: "bg-gradient-to-br from-green-500 to-green-700",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex items-center justify-center h-12 w-12 rounded-md ${feature.bgClass} text-white shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-text-primary font-sans">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-text-secondary font-sans">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h2
              className="text-2xl font-bold text-text-primary mb-6 font-sans"
              id="teknologi"
            >
              Teknologi yang Kami Gunakan
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-surface via-white to-surface p-6 rounded-lg shadow-lg backdrop-blur-sm border-t-4 border-green-500">
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Genetic Algorithm (GA)
                </h3>
                <p className="text-text-secondary mb-4">
                  Algoritma Genetika meniru proses evolusi alami untuk menemukan
                  solusi optimal. Dalam konteks penjadwalan, kami menggunakan:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full mr-2"></span>
                    Representasi kromosom untuk setiap slot jadwal
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full mr-2"></span>
                    Crossover untuk menggabungkan jadwal-jadwal terbaik
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full mr-2"></span>
                    Mutasi untuk mengeksplorasi kemungkinan jadwal baru
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-surface via-white to-surface p-6 rounded-lg shadow-lg backdrop-blur-sm border-t-4 border-blue-500">
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Simulated Annealing (SA)
                </h3>
                <p className="text-text-secondary mb-4">
                  Simulated Annealing terinspirasi dari proses pendinginan logam
                  untuk mencapai struktur optimal. Dalam GenPlan, SA berperan
                  untuk:
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-2"></span>
                    Menyempurnakan hasil dari Genetic Algorithm
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-2"></span>
                    Menghindari solusi lokal optimal
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-2"></span>
                    Mengoptimalkan penggunaan ruang dan waktu
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-surface via-white to-surface p-6 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <span>Proses Penjadwalan GenPlan</span>
                <Image
                  src={logo}
                  alt="Logo UPN Veteran Jakarta"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </h3>
              <div className="space-y-4 text-text-secondary">
                <p>
                  GenPlan mengkombinasikan kekuatan GA dan SA dalam proses tiga
                  tahap untuk penjadwalan di UPN Veteran Jakarta:
                </p>
                <ol className="space-y-2">
                  {[
                    "GA menghasilkan populasi jadwal awal dan melakukan evolusi untuk menemukan kandidat jadwal terbaik",
                    "SA mengoptimalkan hasil GA dengan mencoba berbagai variasi kecil dan menerima perubahan yang menghasilkan peningkatan",
                    "Sistem melakukan validasi final untuk memastikan tidak ada konflik jadwal dan semua konstrain terpenuhi",
                  ].map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full flex items-center justify-center mr-2 mt-1">
                        {index + 1}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Footer with UPNVJ Banner */}
          <div className="mt-12 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src={logo}
                  alt="Logo UPN Veteran Jakarta"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-xs font-medium">
                    Developed By Muhammad Fadhil Musyaffa
                  </p>
                  <p className="text-sm font-bold text-green-700">
                    UPN Veteran Jakarta
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-secondary">Powered by</span>
                <span className="text-xs font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  GenPlan
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
