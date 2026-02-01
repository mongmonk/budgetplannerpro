import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../App';
import { Transaction, TransactionType, ExpenseCategoryType } from '../types';
import { formatCurrency } from '../types';
import { 
    Button, Card, CurrencyInput, PlusIcon, TrashIcon, EditIcon, 
    TrendingUpIcon, TrendingDownIcon, TargetIcon, ReceiptIcon, CreditCardIcon 
} from './ui';

export const AddTransactionForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, setState, editingTransaction } = useAppContext();
    const isEditing = !!editingTransaction;
    const [type, setType] = useState<TransactionType>('expense');
    const [expenseType, setExpenseType] = useState<ExpenseCategoryType>('Umum');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [relatedId, setRelatedId] = useState('');
    const [walletId, setWalletId] = useState(state.wallets?.[0]?.id || '');
    
    useEffect(() => {
        if (isEditing && editingTransaction) {
            const t = editingTransaction;
            setType(t.type);
            setAmount(t.amount);
            setDate(t.date.split('T')[0]);
            setDescription(t.description || '');
            setRelatedId(t.relatedId || '');
            setWalletId(t.walletId || state.wallets?.[0]?.id || '');

            if (t.type === 'expense') {
                switch (t.category) {
                    case 'Tagihan': setExpenseType('Tagihan'); break;
                    case 'Investasi/Tabungan': setExpenseType('Investasi/Tabungan'); break;
                    case 'Utang': setExpenseType('Utang'); break;
                    default:
                        setExpenseType('Umum');
                        setCategory(t.category);
                }
            } else {
                setExpenseType('Umum');
                setCategory(t.category);
            }
        } else {
            setType('expense');
            setExpenseType('Umum');
            setAmount(0);
            setCategory('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setRelatedId('');
        }
    }, [isEditing, editingTransaction]);


    const incomeCategories = useMemo(() => state.categories.filter(c => c.type === 'income'), [state.categories]);
    const expenseCategories = useMemo(() => state.categories.filter(c => c.type === 'expense'), [state.categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || !date || !walletId || (type === 'income' && !category) || (type === 'expense' && expenseType === 'Umum' && !category) || (type === 'expense' && expenseType !== 'Umum' && !relatedId)) {
            alert("Harap isi semua kolom yang wajib diisi.");
            return;
        }
        
        const cacheKeys = ['Bulan Ini', '3 Bulan Terakhir', '6 Bulan Terakhir', '1 Tahun Terakhir'];
        cacheKeys.forEach(key => {
            localStorage.removeItem(`ai_insights_cache_${key}`);
        });

        let finalDescription = description;
        let finalCategory = category;

        if (type === 'expense') {
            switch (expenseType) {
                case 'Tagihan':
                    const bill = state.bills.find(b => b.id === relatedId);
                    if (bill) {
                        finalDescription = `Bayar Tagihan: ${bill.name}`;
                        finalCategory = 'Tagihan';
                    }
                    break;
                case 'Investasi/Tabungan':
                    const goal = state.goals.find(g => g.id === relatedId);
                    if (goal) {
                        finalDescription = `Investasi/Tabungan untuk ${goal.name}`;
                        finalCategory = 'Investasi/Tabungan';
                    }
                    break;
                case 'Utang':
                    const debt = state.debts.find(d => d.id === relatedId);
                    if (debt) {
                        finalDescription = `Bayar Utang: ${debt.name}`;
                        finalCategory = 'Utang';
                    }
                    break;
                default:
                    finalCategory = category;
            }
        } else {
            finalCategory = category;
        }

        if (isEditing && editingTransaction) {
            const updatedTransaction: Transaction = {
                ...editingTransaction,
                type,
                amount,
                category: finalCategory,
                date,
                description: finalDescription,
                relatedId: relatedId || undefined,
                walletId,
            };

            setState(prev => {
                const originalTransaction = prev.transactions.find(t => t.id === editingTransaction.id);
                if (!originalTransaction) return prev;

                let newGoals = [...prev.goals];
                let newDebts = [...prev.debts];
                let newWallets = [...(prev.wallets || [])];

                // Reverse original effect on wallet
                if (originalTransaction.walletId) {
                    newWallets = newWallets.map(w => {
                        if (w.id === originalTransaction.walletId) {
                            return { ...w, balance: originalTransaction.type === 'income' ? w.balance - originalTransaction.amount : w.balance + originalTransaction.amount };
                        }
                        return w;
                    });
                }

                if (originalTransaction.type === 'expense' && originalTransaction.relatedId) {
                    if (originalTransaction.category === 'Investasi/Tabungan') {
                        newGoals = newGoals.map(g => g.id === originalTransaction.relatedId ? { ...g, currentAmount: (g.currentAmount || 0) - originalTransaction.amount } : g);
                    } else if (originalTransaction.category === 'Utang') {
                        newDebts = newDebts.map(d => d.id === originalTransaction.relatedId ? { ...d, paidAmount: (d.paidAmount || 0) - originalTransaction.amount } : d);
                    }
                }

                if (updatedTransaction.type === 'expense' && updatedTransaction.relatedId) {
                    if (updatedTransaction.category === 'Investasi/Tabungan') {
                        newGoals = newGoals.map(g => g.id === updatedTransaction.relatedId ? { ...g, currentAmount: (g.currentAmount || 0) + updatedTransaction.amount } : g);
                    } else if (updatedTransaction.category === 'Utang') {
                        newDebts = newDebts.map(d => d.id === updatedTransaction.relatedId ? { ...d, paidAmount: (d.paidAmount || 0) + updatedTransaction.amount } : d);
                    }
                }
                
                // Apply new effect on wallet
                if (updatedTransaction.walletId) {
                    newWallets = newWallets.map(w => {
                        if (w.id === updatedTransaction.walletId) {
                            return { ...w, balance: updatedTransaction.type === 'income' ? w.balance + updatedTransaction.amount : w.balance - updatedTransaction.amount };
                        }
                        return w;
                    });
                }
                
                const newTransactions = prev.transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);

                return {
                    ...prev,
                    transactions: newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                    goals: newGoals,
                    debts: newDebts,
                    wallets: newWallets
                };
            });
        } else {
             const newTransaction: Transaction = {
                id: new Date().getTime().toString(),
                type,
                amount,
                category: finalCategory,
                date,
                description: finalDescription,
                ...(relatedId && { relatedId }),
                walletId,
            };

            setState(prev => {
                let newGoals = [...prev.goals];
                let newDebts = [...prev.debts];
                let newWallets = [...(prev.wallets || [])];

                if (newTransaction.walletId) {
                    newWallets = newWallets.map(w => {
                        if (w.id === newTransaction.walletId) {
                            return { ...w, balance: newTransaction.type === 'income' ? w.balance + newTransaction.amount : w.balance - newTransaction.amount };
                        }
                        return w;
                    });
                }

                if (newTransaction.type === 'expense' && newTransaction.relatedId) {
                    if (expenseType === 'Investasi/Tabungan') {
                        newGoals = newGoals.map(g => g.id === newTransaction.relatedId ? { ...g, currentAmount: (g.currentAmount || 0) + newTransaction.amount } : g);
                    } else if (expenseType === 'Utang') {
                        newDebts = newDebts.map(d => d.id === newTransaction.relatedId ? { ...d, paidAmount: (d.paidAmount || 0) + newTransaction.amount } : d);
                    }
                }

                return {
                    ...prev,
                    transactions: [newTransaction, ...prev.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                    goals: newGoals,
                    debts: newDebts,
                    wallets: newWallets
                };
            });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe Transaksi</label>
                    <div className="flex rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
                        <button type="button" onClick={() => { setType('income'); setExpenseType('Umum'); }} className={`w-1/2 rounded-md py-2 text-sm font-semibold transition-colors ${type === 'income' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>
                            Pemasukan
                        </button>
                        <button type="button" onClick={() => setType('expense')} className={`w-1/2 rounded-md py-2 text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>
                            Pengeluaran
                        </button>
                    </div>
                </div>

                {type === 'expense' && (
                    <div>
                        <label htmlFor="expenseType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Pengeluaran</label>
                        <select id="expenseType" value={expenseType} onChange={e => setExpenseType(e.target.value as ExpenseCategoryType)} className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option>Umum</option>
                            <option>Tagihan</option>
                            <option>Investasi/Tabungan</option>
                            <option>Utang</option>
                        </select>
                    </div>
                )}
                
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>

                <div>
                    <label htmlFor="walletId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Dompet / Akun</label>
                    <select id="walletId" value={walletId} onChange={e => setWalletId(e.target.value)} required className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        <option value="">Pilih Dompet</option>
                        {state.wallets?.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name} ({formatCurrency(w.balance)})</option>)}
                    </select>
                </div>
                
                {type === 'income' && (
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="block w-full pl-3 pr-10 py-2 border border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Pilih Kategori</option>
                            {incomeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                {type === 'expense' && expenseType === 'Umum' && (
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Pilih Kategori</option>
                            {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                )}
                
                {type === 'expense' && expenseType === 'Tagihan' && (
                    <div>
                        <label htmlFor="relatedId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Tagihan</label>
                        <select id="relatedId" value={relatedId} onChange={e => setRelatedId(e.target.value)} required className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Pilih Tagihan</option>
                            {state.bills.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                )}
                {type === 'expense' && expenseType === 'Investasi/Tabungan' && (
                    <div>
                        <label htmlFor="relatedId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Target</label>
                        <select id="relatedId" value={relatedId} onChange={e => setRelatedId(e.target.value)} required className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Pilih Target</option>
                            {state.goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                )}
                {type === 'expense' && expenseType === 'Utang' && (
                    <div>
                        <label htmlFor="relatedId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Utang</label>
                        <select id="relatedId" value={relatedId} onChange={e => setRelatedId(e.target.value)} required className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Pilih Utang</option>
                            {state.debts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                )}
                
                { (type === 'income' || (type === 'expense' && expenseType === 'Umum')) &&
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi (Opsional)</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                }
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Jumlah
                    </label>
                    <CurrencyInput 
                        value={amount} 
                        onChange={setAmount} 
                        placeholder="Rp 0"
                    />
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 mt-auto border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                    <Button type="submit" className="w-full">{isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}</Button>
                    <Button type="button" variant="secondary" onClick={onClose} className="w-full">Batal</Button>
                </div>
            </div>
        </form>
    );
};

export const Transactions: React.FC = () => {
    const { state, setState, setIsTransactionModalOpen, setEditingTransaction } = useAppContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '' });
    const ITEMS_PER_PAGE = 10;
    
    const TransactionCard: React.FC<{ transaction: Transaction; onDelete: (transaction: Transaction) => void; onEdit: (transaction: Transaction) => void; }> = ({ transaction: t, onDelete, onEdit }) => {
        const getTransactionIcon = () => {
            if (t.type === 'income') {
                return <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"><TrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" /></div>;
            }
            switch (t.category) {
                case 'Investasi/Tabungan': return <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center"><TargetIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" /></div>;
                case 'Tagihan': return <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center"><ReceiptIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>;
                case 'Utang': return <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>;
                default: return <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center"><TrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" /></div>;
            }
        };

        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center justify-between space-x-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">{getTransactionIcon()}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-md font-semibold text-slate-900 dark:text-white truncate">{t.description || t.category}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(t.date).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className={`text-lg font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(t)} aria-label="Edit transaksi" className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 p-1"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => onDelete(t)} aria-label="Hapus transaksi" className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>
        );
    };

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

    return (
        <div className="space-y-6 pb-24 md:pb-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h1>
                <Button onClick={() => setIsTransactionModalOpen(true)} className="hidden md:inline-flex"><PlusIcon className="h-5 w-5 mr-2" />Tambah Transaksi</Button>
            </div>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6 items-end">
                    <div className="md:col-span-2 lg:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rentang Tanggal</label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <input type="date" name="startDate" aria-label="Dari Tanggal" value={filters.startDate} onChange={handleFilterChange} className="block w-full px-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            <span className="text-slate-500 dark:text-slate-400 shrink-0 text-center sm:text-left">sampai</span>
                            <input type="date" name="endDate" aria-label="Sampai Tanggal" value={filters.endDate} onChange={handleFilterChange} className="block w-full px-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                     <div className="md:col-span-2 lg:col-span-2">
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                        <select name="category" id="category" value={filters.category} onChange={handleFilterChange} className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Semua Kategori</option>
                            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-start md:col-span-1 lg:col-span-1 md:justify-end">
                        <Button onClick={resetFilters} variant="secondary">Reset Filter</Button>
                    </div>
                </div>
            </Card>
            <div className="space-y-4">
                 {paginatedTransactions.length > 0 ? paginatedTransactions.map(t => <TransactionCard key={t.id} transaction={t} onDelete={handleDelete} onEdit={handleEdit} />) : <Card><p className="text-center py-10 text-slate-500 dark:text-slate-400">Tidak ada transaksi yang cocok dengan filter Anda.</p></Card>}
            </div>
            {totalPages > 1 && <div className="flex justify-center items-center space-x-4"><Button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} variant="secondary">Sebelumnya</Button><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Halaman {currentPage} dari {totalPages}</span><Button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} variant="secondary">Berikutnya</Button></div>}
        </div>
    );
};
