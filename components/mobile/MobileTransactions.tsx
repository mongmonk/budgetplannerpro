import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../App';
import { formatCurrency, Transaction } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';
import { Button, TrendingUpIcon, TrendingDownIcon, TargetIcon, ReceiptIcon, CreditCardIcon, EditIcon, TrashIcon, PlusIcon } from '../ui';

export const MobileTransactions: React.FC = () => {
    const { state, setState, setEditingTransaction, setIsTransactionModalOpen } = useAppContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '' });
    const ITEMS_PER_PAGE = 10;

    const uniqueCategories = useMemo(() => Array.from(new Set(state.transactions.map((t: Transaction) => t.category))), [state.transactions]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setCurrentPage(1);
        setFilters({ startDate: '', endDate: '', category: '' });
    };

    const filteredTransactions = useMemo(() => {
        return state.transactions.filter(t => {
            const tDate = new Date(t.date);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (startDate) {
                const tDateOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                if (tDateOnly < startDateOnly) return false;
            }
            if (endDate) {
                const tDateOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                if (tDateOnly > endDateOnly) return false;
            }
            if (filters.category && t.category !== filters.category) return false;
            return true;
        });
    }, [state.transactions, filters]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const handleDelete = (transaction: Transaction) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
        const cacheKeys = ['Bulan Ini', '3 Bulan Terakhir', '6 Bulan Terakhir', '1 Tahun Terakhir'];
        cacheKeys.forEach(key => localStorage.removeItem(`ai_insights_cache_${key}`));
        setState(prev => {
            let newGoals = [...prev.goals];
            let newDebts = [...prev.debts];
            let newWallets = [...(prev.wallets || [])];

            if (transaction.walletId) {
                newWallets = newWallets.map(w => {
                    if (w.id === transaction.walletId) {
                        return { ...w, balance: transaction.type === 'income' ? w.balance - transaction.amount : w.balance + transaction.amount };
                    }
                    return w;
                });
            }

            if (transaction.type === 'expense' && transaction.relatedId) {
                if (transaction.category === 'Investasi/Tabungan') newGoals = newGoals.map(g => g.id === transaction.relatedId ? { ...g, currentAmount: (g.currentAmount || 0) - transaction.amount } : g);
                else if (transaction.category === 'Utang') newDebts = newDebts.map(d => d.id === transaction.relatedId ? { ...d, paidAmount: (d.paidAmount || 0) - transaction.amount } : d);
            }
            return { ...prev, transactions: prev.transactions.filter(t => t.id !== transaction.id), goals: newGoals, debts: newDebts, wallets: newWallets };
        });
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const getIcon = (t: Transaction) => {
        if (t.type === 'income') return <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><TrendingUpIcon className="w-6 h-6 text-green-600" /></div>;
        switch (t.category) {
            case 'Investasi/Tabungan': return <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center"><TargetIcon className="w-6 h-6 text-teal-600" /></div>;
            case 'Tagihan': return <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><ReceiptIcon className="w-6 h-6 text-indigo-600" /></div>;
            case 'Utang': return <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><CreditCardIcon className="w-6 h-6 text-blue-600" /></div>;
            default: return <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center"><TrendingDownIcon className="w-6 h-6 text-rose-600" /></div>;
        }
    };

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <div className="flex justify-between items-start pr-6">
                <MobileHeader title="Transaksi" subtitle="Riwayat transaksi Anda" />
                <button
                    onClick={() => {
                        setEditingTransaction(null);
                        setIsTransactionModalOpen(true);
                    }}
                    className="mt-14 bg-primary-400 p-4 rounded-2xl shadow-lg shadow-primary-400/20"
                >
                    <PlusIcon className="w-6 h-6 text-black" />
                </button>
            </div>
            
            <div className="px-6 mt-4 space-y-6">
                <MobileCard>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rentang Tanggal</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 dark:text-white border-none" />
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 dark:text-white border-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Kategori</label>
                            <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 dark:text-white border-none">
                                <option value="">Semua Kategori</option>
                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Button onClick={resetFilters} variant="secondary" className="w-full py-2 rounded-xl text-xs font-bold">Reset Filter</Button>
                    </div>
                </MobileCard>

                <div className="space-y-3">
                    {paginatedTransactions.length > 0 ? paginatedTransactions.map(t => (
                        <div key={t.id} className="bg-white dark:bg-slate-800 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
                            {getIcon(t)}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold dark:text-white truncate">{t.description || t.category}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {t.category}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-rose-500'}`}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </div>
                                <div className="flex justify-end gap-2 mt-1">
                                    <button onClick={() => handleEdit(t)} className="p-1 text-blue-400"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(t)} className="p-1 text-rose-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-slate-400 text-xs">Tidak ada transaksi yang cocok.</div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                        <Button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} variant="secondary" className="py-2 px-4 rounded-xl text-xs font-bold">Prev</Button>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentPage} / {totalPages}</span>
                        <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} variant="secondary" className="py-2 px-4 rounded-xl text-xs font-bold">Next</Button>
                    </div>
                )}
            </div>
        </div>
    );
};