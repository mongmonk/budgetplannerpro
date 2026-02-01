import React, { useState, useEffect } from 'react';
import { getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '../firebase';
import { useAppContext } from '../App';
import { AppLogo } from './ui';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20c0-1.341-0.138-2.65-0.389-3.917z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.19,4.218-4.098,5.571l6.19,5.238C42.01,35.846,44,30.338,44,24C44,22.659,43.862,21.34,43.611,20.083z" />
    </svg>
);

export const Login: React.FC = () => {
    const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
    const appName = 'Financial Planner Pro';

    useEffect(() => {
        const processRedirectResult = async () => {
            try {
                await getRedirectResult(auth);
            } catch (error) {
                console.error("Error memproses hasil redirect login:", error);
            } finally {
                setIsProcessingRedirect(false);
            }
        };
        processRedirectResult();
    }, []);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Error saat login dengan Google:", error);
            alert("Gagal memulai proses login dengan Google. Silakan coba lagi.");
        }
    };

    if (isProcessingRedirect) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">Memproses autentikasi...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-center space-y-4">
                    <div className="flex justify-center items-center gap-3">
                         <AppLogo className="h-10 w-10"/>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{appName}</h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Masuk untuk mengambil kendali penuh atas keuangan Anda.</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center px-4 py-2.5 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600 transition-all duration-200"
                    >
                        <GoogleIcon />
                        Lanjutkan dengan Google
                    </button>
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                        Login aman dan mudah dengan akun Google Anda.
                    </p>
                </div>
            </div>
        </div>
    );
};
