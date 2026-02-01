import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { signOut, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { AppLogo, LogOutIcon } from './ui';

export const Activation: React.FC<{ user: User; onSuccess: () => void; }> = ({ user, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setError('');
        const activationCode = '081234567';

        if (!activationCode) {
            setError('Kode aktivasi tidak dikonfigurasi. Hubungi administrator.');
            setIsSubmitting(false);
            return;
        }

        if (password === activationCode) {
            try {
                const userDocRef = doc(db, 'artifacts', 'finance-planner-pro', 'users', user.uid);
                await setDoc(userDocRef, { isActivated: true, email: user.email }, { merge: true });
                onSuccess();
            } catch (err) {
                console.error("Gagal mengaktifkan akun:", err);
                setError("Terjadi kesalahan. Silakan coba lagi nanti.");
                setIsSubmitting(false);
            }
        } else {
            setError('Password aktivasi salah. Silakan coba lagi.');
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-center space-y-2">
                    <AppLogo className="h-10 w-10 mx-auto" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Aktivasi Akun</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Selamat datang, {user.displayName}! Untuk melanjutkan, masukkan password aktivasi Anda.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password-aktivasi" className="sr-only">Password Aktivasi</label>
                        <input
                            id="password-aktivasi"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Password Aktivasi"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Mengaktifkan...' : 'Aktifkan Akun'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                        <LogOutIcon className="w-4 h-4"/>
                        Bukan Anda? Keluar
                    </button>
                </div>
            </div>
        </div>
    );
};
