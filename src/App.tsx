
import './App.css'
import HomePage from './page/HomePage'
import LoginPage from './page/Auth/LoginPage'
import JualbeliPage from './page/User/JualbeliPage'
import KupvaSekitarPage from './page/User/KupvaSekitarPage'
import InformasiPage from './page/User/InformasiPage'

import RegisterPage from './page/Auth/RegisterPage'
{ /* Kupva Pages */}
import KupvaMainPage from './page/Kupva/KupvaMainPage'
import KupvaInputTransaksiPage from './page/Kupva/KupvaInputTransaksiPage'
import KupvaDataPelanggan from './page/Kupva/KupvaDataPelanggan'
import KupvaDaftarTransaksi from './page/Kupva/KupvaDaftarTransaksi'
import KupvaProfilePage from './page/Kupva/KupvaProfilPage'
import KupvaInputHarga from './page/Kupva/KupvaInputHarga'


{ /* Admin Pages */}
import AdminMainPage from './page/Dashboard/AdminMainPage'
import AdminDataKupva from './page/Dashboard/AdminDataKupva'
import AdminDataTransaksi from './page/Dashboard/AdminDataTransaksi'
import AdminDataPelanggan from './page/Dashboard/AdminDataPelanggan'
import AdminProfil from './page/Dashboard/AdminProfil'
import AdminInformasi from './page/Dashboard/AdminInformasi'


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

        <Route path="/jualbeli" element={<JualbeliPage />} />
        <Route path="/info-kupva" element={<KupvaSekitarPage />} />
        <Route path="/informasi" element={<InformasiPage />} />
       
       { /* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminMainPage />} />
        <Route path="/admin/data-kupva" element={<AdminDataKupva />} />
        <Route path="/admin/data-pelanggan" element={<AdminDataPelanggan />} />
        <Route path="/admin/data-transaksi" element={<AdminDataTransaksi />} />
        <Route path="/admin/profil" element={<AdminProfil />} />
        <Route path="/admin/infomasi" element={<AdminInformasi />} />
        
        { /* Kupva Routes */}
        <Route path="/kupva/dashboard" element={<KupvaMainPage />} />
        <Route path="/kupva/input-transaksi" element={<KupvaInputTransaksiPage />} />
        <Route path="/kupva/pelanggan" element={<KupvaDataPelanggan />} />
        <Route path="/kupva/daftar-transaksi" element={<KupvaDaftarTransaksi />} />
        <Route path="/kupva/profil" element={<KupvaProfilePage />} />
        <Route path="/kupva/input-harga" element={<KupvaInputHarga />} />


        { /* Register Route */}
      <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
     
    </>
  )
}

export default App
