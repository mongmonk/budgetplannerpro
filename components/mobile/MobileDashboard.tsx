import React, { useMemo } from 'react';
import { useAppContext } from '../../App';
import { formatCurrency } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';

export const MobileDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { transactions } = state;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayTransactions = transactions.filter(t => new Date(t.date) >= startOfToday);
    const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    // Mock budget for display based on screenshot
    const dailyBudgetRemaining = 99839;

    const EyeIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const FlashIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a3e635" stroke="none" className={className}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
    );

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Dashboard" subtitle="Halo, minbu ✨" />
            
            <div className="px-6 space-y-6 mt-4">
                {/* Dark Summary Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <FlashIcon className="w-5 h-5" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sekilas Hari Ini</span>
                    </div>
                    
                    <div className="text-4xl font-bold mb-2 tracking-tight">
                        {formatCurrency(dailyBudgetRemaining)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
                        <span>👆 budget harian yang tersisa</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Pemasukan</span>
                            <span className="text-xl font-bold text-primary-400">{formatCurrency(todayIncome)}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Pengeluaran</span>
                            <span className="text-xl font-bold text-rose-400">{formatCurrency(todayExpense)}</span>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-400 h-full w-1/3 rounded-full"></div>
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2">
                    <div className="w-6 h-2 bg-primary-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                </div>

                {/* Total Pemasukan Card */}
                <MobileCard>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Total Pemasukan</span>
                    <div className="text-3xl font-bold dark:text-white mb-4">
                        {formatCurrency(5000000)}
                    </div>
                    <div className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold px-3 py-1.5 rounded-full">
                        +100% vs periode lalu
                    </div>
                </MobileCard>

                {/* Total Pengeluaran Card */}
                <MobileCard>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Total Pengeluaran</span>
                    <div className="text-3xl font-bold dark:text-white mb-4">
                        {formatCurrency(todayExpense)}
                    </div>
                </MobileCard>
            </div>
        </div>
    );
};