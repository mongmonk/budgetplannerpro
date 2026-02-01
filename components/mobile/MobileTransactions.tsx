import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../App';
import { formatCurrency, Transaction } from '../../types';
import { MobileHeader } from './MobileUI';
import { TrendingUpIcon, TrendingDownIcon, TargetIcon, ReceiptIcon, CreditCardIcon, EditIcon, TrashIcon } from '../ui';

export const MobileTransactions: React.FC = () => {
    const { state, setState, setEditingTransaction, setIsTransactionModalOpen } = useAppContext();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = useMemo(() => {
        if (filter === 'all') return state.transactions;
        return state.transactions.filter(t => t.type === filter);
    }, [state.transactions, filter]);

    const handleDelete = (transaction: Transaction) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
        setState(prev => {
            let newGoals = [...prev.goals];
            let newDebts = [...prev.debts];
            if (transaction.type === 'expense' && transaction.relatedId) {
                if (transaction.category === 'Investasi/Tabungan') newGoals = newGoals.map(g => g.id === transaction.relatedId ? { ...g, currentAmount: (g.currentAmount || 0) - transaction.amount } : g);
                else if (transaction.category === 'Utang') newDebts = newDebts.map(d => d.id === transaction.relatedId ? { ...d, paidAmount: (d.paidAmount || 0) - transaction.amount } : d);
            }
            return { ...prev, transactions: prev.transactions.filter(t => t.id !== transaction.id), goals: newGoals, debts: newDebts };
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
            <MobileHeader title="Transaksi" subtitle="Riwayat transaksi keuangan Anda." />
            
            <div className="px-6 mt-4 space-y-6">
                {/* Filter Tabs */}
                <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm">
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-primary-400 text-black shadow-md' : 'text-slate-500'}`}
                        >
                            {f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </button>
                    ))}
                </div>

                {/* Transaction List */}
                <div className="space-y-3">
                    {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
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
                        <div className="text-center py-20 text-slate-400">Tidak ada transaksi.</div>
                    )}
                </div>
            </div>
        </div>
    );
};