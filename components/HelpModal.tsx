import React, { useState } from 'react';
import { Modal } from './ui';

export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );

    const AccordionItem: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <div className="border-b border-slate-200 dark:border-slate-700">
                <button
                    className="flex justify-between items-center w-full py-4 text-left font-semibold text-slate-800 dark:text-slate-200"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{title}</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="pb-4 text-slate-600 dark:text-slate-400 space-y-2 text-sm">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const guideContent = [
        {
            title: "Dasbor",
            content: `
                <p>Dasbor adalah pusat kendali keuangan Anda. Di sini Anda akan menemukan:</p>
                <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Kartu Ringkasan:</strong> Menampilkan total Pemasukan, Pengeluaran, dan Sisa Uang untuk periode waktu yang dipilih.</li>
                    <li><strong>Filter Waktu:</strong> Anda dapat mengubah periode data yang ditampilkan (Bulan Ini, 3 Bulan Terakhir, dll.). Filter ini memengaruhi seluruh data di Dasbor.</li>
                    <li><strong>Grafik Ringkasan:</strong> Visualisasi pemasukan dan pengeluaran Anda dari bulan ke bulan.</li>
                    <li><strong>Insight Keuangan:</strong> Analisis otomatis dari data Anda. Jika API Key diaktifkan, Anda akan mendapatkan insight dari AI. Jika tidak, akan ditampilkan analisis dasar.</li>
                    <li><strong>Asisten AI:</strong> (Memerlukan API Key) Tempat Anda bisa bertanya apa saja seputar keuangan atau fitur aplikasi.</li>
                </ul>
            `
        },
        {
            title: "Transaksi",
            content: `
                <p>Halaman ini adalah catatan lengkap dari semua aktivitas keuangan Anda.</p>
                <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Tambah Transaksi:</strong> Gunakan tombol "Tambah Transaksi" untuk mencatat pemasukan atau pengeluaran baru.</li>
                    <li><strong>Jenis Pengeluaran:</strong> Saat menambah pengeluaran, Anda bisa memilih jenis 'Umum', atau menautkannya ke 'Tagihan', 'Investasi/Tabungan', atau 'Utang' yang sudah Anda atur di Pengaturan.</li>
                    <li><strong>Edit & Hapus:</strong> Setiap transaksi memiliki tombol untuk mengubah detail atau menghapusnya.</li>
                    <li><strong>Filter:</strong> Gunakan filter di bagian atas untuk mencari transaksi berdasarkan rentang tanggal atau kategori tertentu.</li>
                </ul>
            `
        },
        {
            title: "Laporan",
            content: `
                <p>Dapatkan gambaran mendalam tentang kesehatan keuangan Anda setiap bulan.</p>
                <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Pilih Bulan:</strong> Gunakan pemilih bulan di atas untuk melihat laporan bulan yang Anda inginkan.</li>
                    <li><strong>Ringkasan Bulan:</strong> Lihat total pemasukan, rincian pengeluaran, dan sisa uang untuk bulan tersebut.</li>
                    <li><strong>Alokasi Dana:</strong> Grafik lingkaran (pie chart) menunjukkan bagaimana uang Anda dialokasikan antara Pengeluaran, Tabungan, dan pembayaran Utang.</li>
                    <li><strong>Progres Anggaran:</strong> Bandingkan pengeluaran Anda dengan anggaran yang telah Anda tetapkan di Pengaturan untuk setiap kategori.</li>
                </ul>
            `
        },
        {
            title: "Pengaturan",
            content: `
                <p>Sesuaikan aplikasi agar sesuai dengan kebutuhan keuangan pribadi Anda.</p>
                <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Umum:</strong> Atur API Key Gemini Anda di sini untuk mengaktifkan fitur AI. Anda juga bisa mengelola kategori pemasukan dan pengeluaran.</li>
                    <li><strong>Anggaran:</strong> Tetapkan batas pengeluaran bulanan untuk setiap kategori untuk membantu Anda tetap hemat.</li>
                    <li><strong>Target:</strong> Buat tujuan keuangan, seperti "Dana Darurat" atau "Uang Muka Rumah", dan lacak progresnya.</li>
                    <li><strong>Tagihan:</strong> Daftarkan tagihan rutin bulanan Anda agar mudah dicatat saat pembayaran.</li>
                    <li><strong>Utang:</strong> Catat utang atau cicilan Anda dan pantau progres pelunasannya.</li>
                </ul>
            `
        },
        {
            title: "Tanya Jawab (Q&A)",
            content: `
                <div class="space-y-3">
                    <div>
                        <p class="font-semibold">Apakah data saya aman?</p>
                        <p>Tentu. Data Anda disimpan dengan aman di database cloud kami (Firebase Firestore by Google) dan ditautkan ke akun Google Anda. Ini memastikan data Anda aman dan hanya dapat diakses oleh Anda. API Key Anda juga disimpan dengan aman di akun Anda.</p>
                    </div>
                    <div>
                        <p class="font-semibold">Bagaimana cara mendapatkan API Key Gemini?</p>
                        <p>Anda bisa mendapatkan API Key dari Google AI Studio. Cukup kunjungi situsnya, masuk dengan akun Google Anda, dan buat API Key baru. Salin key tersebut dan tempelkan di halaman Pengaturan > Umum.</p>
                    </div>
                     <div>
                        <p class="font-semibold">Mengapa fitur AI tidak muncul?</p>
                        <p>Fitur Insight AI dan Asisten AI hanya akan aktif jika Anda telah memasukkan API Key Gemini yang valid di halaman Pengaturan. Jika sudah dimasukkan tetapi masih tidak muncul, pastikan key tersebut benar dan aktif.</p>
                    </div>
                    <div>
                        <p class="font-semibold">Bisakah saya menggunakan aplikasi ini di beberapa perangkat?</p>
                        <p>Tentu bisa! Karena data Anda disimpan di cloud dan ditautkan ke akun Google Anda, semua transaksi, anggaran, dan pengaturan Anda akan tersinkronisasi secara otomatis di semua perangkat tempat Anda masuk.</p>
                    </div>
                </div>
            `
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Petunjuk Penggunaan & Tanya Jawab" size="xl">
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {guideContent.map(item => (
                    <AccordionItem key={item.title} title={item.title}>
                         <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    </AccordionItem>
                ))}
            </div>
        </Modal>
    );
};
