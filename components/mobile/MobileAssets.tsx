import React from 'react';
import { useAppContext } from '../../App';
import { formatCurrency } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';

export const MobileAssets: React.FC = () => {
    const { state, setIsTransactionModalOpen } = useAppContext();
    const { transactions } = state;

    const totalAssets = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - 
                        transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const DiamondIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 3h12l4 6-10 12L2 9z"/>
        </svg>
    );

    const RocketIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a3e635" stroke="none" className={className}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/>
        </svg>
    );

    const TrophyIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
    );

    const PlusIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <div className="flex justify-between items-start pr-6">
                <MobileHeader title="Aset" subtitle="Pantau terus total kekayaanmu." />
                <button 
                    onClick={() => setIsTransactionModalOpen(true)}
                    className="mt-14 bg-primary-400 p-4 rounded-2xl shadow-lg shadow-primary-400/20"
                >
                    <PlusIcon className="w-6 h-6 text-black" />
                </button>
            </div>

            <div className="px-6 space-y-6 mt-4">
                {/* Black Asset Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    {/* Background gradient/pattern could go here */}
                    <div className="flex items-center gap-2 mb-4">
                        <DiamondIcon className="w-4 h-4 text-primary-400" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Kekayaan</span>
                    </div>

                    <div className="text-4xl font-bold mb-8 tracking-tight">
                        {formatCurrency(totalAssets)}
                    </div>

                    {/* Runway Badge */}
                    <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 pr-6 mb-8">
                        <div className="bg-primary-400 p-2 rounded-xl">
                            <RocketIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">Total Runway</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold">6.2</span>
                                <span className="text-[10px] text-slate-500 font-bold">Bulan</span>
                            </div>
                        </div>
                    </div>

                    {/* Wealth Level */}
                    <div className="flex justify-between items-end mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 p-2 rounded-xl">
                                <TrophyIcon className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">Level Kekayaan</span>
                                <span className="text-lg font-bold">Bertahan</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">Level Berikutnya (12x)</span>
                            <span className="text-sm font-bold text-primary-400">{formatCurrency(39000000)}</span>
                        </div>
                    </div>

                    {/* Progress to next level */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">Progres ke level berikutnya</span>
                            <span className="text-primary-400">3%</span>
                        </div>
                        <div className="bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary-400 h-full w-[3%] rounded-full"></div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800 my-8"></div>

                    {/* Asset Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Dompet & Akun</span>
                            </div>
                            <div className="text-sm font-bold">{formatCurrency(totalAssets)}</div>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Aset Likuid</span>
                            </div>
                            <div className="text-sm font-bold">{formatCurrency(0)}</div>
                        </div>
                        <div className="col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Aset Tetap</span>
                            </div>
                            <div className="text-sm font-bold">{formatCurrency(0)}</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Dompet & Akun */}
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-2xl">👛</div>
                        <h2 className="text-2xl font-bold dark:text-white">Dompet & Akun</h2>
                    </div>
                    
                    {/* List item example from screenshot */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-400 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
                                📱
                            </div>
                            <div>
                                <div className="font-bold dark:text-white">GoPay</div>
                                <div className="text-xs text-slate-500">Dompet Digital</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold dark:text-white">{formatCurrency(0)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};