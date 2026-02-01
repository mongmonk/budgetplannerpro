<div align="center">
<img width="1200" height="475" alt="Financial Planner Pro Banner" src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop" />

# 💰 Financial Planner Pro

**Financial Planner Pro** adalah aplikasi manajemen keuangan pribadi modern yang dirancang untuk membantu Anda melacak transaksi, mengelola anggaran, dan merencanakan masa depan finansial Anda dengan bantuan AI.

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-1.27-4285F4?logo=google-gemini)](https://ai.google.dev/)

</div>

---

## ✨ Fitur Utama

-   **Dashboard Komprehensif:** Ringkasan keuangan Anda dalam satu tampilan.
-   **Pelacakan Transaksi:** Catat pemasukan dan pengeluaran dengan kategori yang dapat disesuaikan.
-   **Analisis & Laporan:** Visualisasi data pengeluaran Anda menggunakan grafik interaktif (Recharts).
-   **Chat Assistant AI:** Konsultasi keuangan pribadi yang ditenagai oleh Google Gemini AI.
-   **Multi-Layout & Tema:** Pilih antara tampilan *Classic*, *Modern*, atau *Glass* dengan dukungan Mode Gelap.
-   **Sinkronisasi Cloud:** Data Anda aman dan tersinkronisasi di semua perangkat menggunakan Firebase.
-   **Ramah Mobile:** Pengalaman pengguna yang dioptimalkan untuk perangkat seluler.

## 🚀 Cara Menjalankan Lokal

### Prasyarat

-   [Node.js](https://nodejs.org/) (Versi terbaru direkomendasikan)
-   Akun Firebase (untuk database dan autentikasi)
-   Gemini API Key (dari [Google AI Studio](https://aistudio.google.com/))

### Langkah-langkah

1.  **Clone repositori ini:**
    ```bash
    git clone <repository-url>
    cd financial-planner-pro
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Lingkungan:**
    Buat file `.env.local` di direktori akar dan tambahkan kunci API Anda:
    ```env
    VITE_FIREBASE_API_KEY=your_firebase_key
    VITE_GEMINI_API_KEY=your_gemini_key
    # Tambahkan konfigurasi firebase lainnya sesuai kebutuhan
    ```

4.  **Jalankan aplikasi:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

## 🛠️ Teknologi yang Digunakan

-   **Frontend:** React 19, TypeScript, Vite
-   **Styling:** Tailwind CSS
-   **Backend:** Firebase Auth & Firestore
-   **AI:** @google/genai (Gemini Pro)
-   **Charts:** Recharts

---

<div align="center">
Dibuat dengan ❤️ untuk membantu Anda mencapai kebebasan finansial.
</div>
