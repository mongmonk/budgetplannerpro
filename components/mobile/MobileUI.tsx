import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { Page } from '../../types';
import { 
    HomeIcon, 
    WalletIcon, 
    BarChartIcon, 
    SettingsIcon, 
    PlusIcon, 
    MoonIcon, 
    SunIcon,
    TargetIcon
} from '../ui';

export const MobileHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
    const { colorScheme, setColorScheme } = useAppContext();
    
    return (
        <div className="px-6 pt-6 pb-2 flex justify-between items-start bg-white dark:bg-slate-900 transition-colors">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-primary-400 w-8 h-8 rounded flex items-center justify-center text-black font-bold text-lg">FPP</div>
                    <span className="font-bold text-xl dark:text-white">Finance Planner Pro</span>
                </div>
                <h1 className="text-3xl font-bold dark:text-white mt-4">{title}</h1>
                {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
            </div>
            <button 
                onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 dark:text-white"
            >
                {colorScheme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
        </div>
    );
};

export const MobileNav: React.FC<{ currentPage: Page; setPage: (page: Page) => void }> = ({ currentPage, setPage }) => {
    const { setIsTransactionModalOpen, setIsHelpModalOpen } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const GridIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    );

    const ExchangeIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m7 10 5-5 5 5"/><path d="m7 14 5 5 5-5"/>
        </svg>
    );

    const MenuIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
    );

    const handleMenuClick = (page: Page) => {
        setPage(page);
        setIsMenuOpen(false);
    };

    return (
        <div className="fixed bottom-8 left-6 right-6 z-50">
            {/* Pop-up Menu for extra features */}
            {isMenuOpen && (
                <div className="absolute bottom-24 right-0 left-0 bg-slate-900/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleMenuClick('settings')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${currentPage === 'settings' ? 'bg-primary-400 text-black' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                            <TargetIcon className="w-6 h-6" />
                            <span className="text-xs font-bold">Goals</span>
                        </button>
                        <button
                            onClick={() => handleMenuClick('reports')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${currentPage === 'reports' ? 'bg-primary-400 text-black' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                            <ExchangeIcon className="w-6 h-6" />
                            <span className="text-xs font-bold">Analisis</span>
                        </button>
                        <button
                            onClick={() => handleMenuClick('settings')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${currentPage === 'settings' ? 'bg-primary-400 text-black' : 'bg-slate-800 text-white hover:bg-slate-700'} col-span-2`}
                        >
                            <SettingsIcon className="w-6 h-6" />
                            <span className="text-xs font-bold">Pengaturan & Profil</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-4 flex justify-between items-center shadow-2xl relative">
                <button onClick={() => setPage('dashboard')} className={`p-3 ${currentPage === 'dashboard' ? 'text-primary-400' : 'text-slate-400'}`}>
                    <GridIcon className="w-7 h-7" />
                </button>
                <button onClick={() => setPage('transactions')} className={`p-3 ${currentPage === 'transactions' ? 'text-primary-400' : 'text-slate-400'}`}>
                    <WalletIcon className="w-7 h-7" />
                </button>
                
                <div className="relative -mt-16">
                    <button
                        onClick={() => {
                            if (currentPage === 'settings') {
                                // Jika di halaman pengaturan, buka bantuan atau modal pengaturan spesifik jika perlu
                                // Namun sesuai feedback, tombol ini harus relevan dengan halaman
                                setIsTransactionModalOpen(true);
                            } else {
                                setIsTransactionModalOpen(true);
                            }
                        }}
                        className="bg-primary-400 text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900"
                    >
                        <PlusIcon className="w-10 h-10" />
                    </button>
                </div>

                {/* This icon in screenshot 1 is actually for Analysis/Exchange */}
                <button onClick={() => setPage('reports')} className={`p-3 ${currentPage === 'reports' ? 'text-primary-400' : 'text-slate-400'}`}>
                    <ExchangeIcon className="w-7 h-7" />
                </button>
                
                {/* Menu button to access other pages */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-3 ${isMenuOpen ? 'text-primary-400' : 'text-slate-400'}`}>
                    <MenuIcon className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
};

export const MobileCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm ${className}`}>
        {children}
    </div>
);