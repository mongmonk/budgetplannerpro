import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { MobileHeader, MobileCard } from './MobileUI';
import { Button, LogOutIcon, PaletteIcon, SunIcon, MoonIcon, CheckCircleIcon, PlusIcon, TrashIcon, EditIcon, Modal, CurrencyInput } from '../ui';
import { User } from 'firebase/auth';
import { AppState, TransactionType, Budget, FinancialGoal, Bill, Debt, formatCurrency } from '../../types';

export const MobileSettings: React.FC<{ onLogout: () => void; user: User | null }> = ({ onLogout, user }) => {
    const { state, setState, updateUserSettings, colorScheme, setColorScheme, activeAccent } = useAppContext();
    const [activeTab, setActiveTab] = useState('umum');
    const [apiKeyInput, setApiKeyInput] = useState(state.apiKey || '');
    const [isSaving, setIsSaving] = useState(false);

    const tabs = [
        { id: 'umum', label: 'Umum' },
        { id: 'anggaran', label: 'Anggaran' },
        { id: 'kategori', label: 'Kategori' },
        { id: 'tagihan', label: 'Tagihan' },
        { id: 'utang', label: 'Utang' }
    ];

    const handleSaveApiKey = async () => {
        setIsSaving(true);
        await updateUserSettings({ apiKey: apiKeyInput.trim() || null });
        setIsSaving(false);
        alert('API Key berhasil disimpan!');
    };

    const handleToggleColorScheme = () => {
        const newScheme = colorScheme === 'light' ? 'dark' : 'light';
        setColorScheme(newScheme);
        updateUserSettings({ colorScheme: newScheme });
    };

    const handleSaveItem = (itemType: keyof AppState, item: any) => setState(prev => {
        const items = prev[itemType] as any[];
        const index = items.findIndex((i: any) => i.id === item.id);
        let newItems;
        if (index > -1) newItems = items.map(c => c.id === item.id ? item : c);
        else newItems = [...items, item];
        return { ...prev, [itemType]: newItems };
    });

    const handleDeleteItem = (itemType: keyof AppState, id: string) => {
        if (!window.confirm('Yakin ingin menghapus?')) return;
        setState(prev => {
            const items = prev[itemType] as any[];
            return { ...prev, [itemType]: items.filter((i: any) => i.id !== id) };
        });
    };

    const accents = [
        { id: 'blue', className: 'bg-blue-500' },
        { id: 'emerald', className: 'bg-emerald-500' },
        { id: 'rose', className: 'bg-rose-500' },
        { id: 'violet', className: 'bg-violet-500' },
        { id: 'orange', className: 'bg-orange-500' }
    ];

    // Sub-components for CRUD
    const CategorySettings = () => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [name, setName] = useState('');
        const [type, setType] = useState<TransactionType>('expense');
        
        const handleAdd = () => {
            if (!name) return;
            setState(prev => ({ ...prev, categories: [...prev.categories, { id: `cat-${new Date().getTime()}`, name, type }] }));
            setName(''); setIsModalOpen(false);
        };

        return (
            <div className="space-y-6">
                <MobileCard>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold dark:text-white">Kategori Pengeluaran</h3>
                        <button onClick={() => { setType('expense'); setIsModalOpen(true); }} className="text-primary-500"><PlusIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="space-y-2">
                        {state.categories.filter(c => c.type === 'expense').map(c => (
                            <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <span className="text-sm dark:text-white">{c.name}</span>
                                <button onClick={() => handleDeleteItem('categories', c.id)}><TrashIcon className="w-4 h-4 text-rose-500"/></button>
                            </div>
                        ))}
                    </div>
                </MobileCard>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Kategori">
                    <div className="p-6 space-y-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Kategori" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm"/>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm">
                            <option value="expense">Pengeluaran</option>
                            <option value="income">Pemasukan</option>
                        </select>
                        <Button onClick={handleAdd} className="w-full py-3 rounded-2xl">Simpan</Button>
                    </div>
                </Modal>
            </div>
        );
    };

    const BudgetSettings = () => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [categoryId, setCategoryId] = useState('');
        const [amount, setAmount] = useState(0);
        
        const handleSave = () => {
            if (!categoryId || amount <= 0) return;
            setState(prev => {
                const i = prev.budgets.findIndex(b => b.categoryId === categoryId);
                let newBudgets = [...prev.budgets];
                if (i > -1) newBudgets[i] = { categoryId, amount };
                else newBudgets.push({ categoryId, amount });
                return { ...prev, budgets: newBudgets };
            });
            setIsModalOpen(false);
        };

        return (
            <MobileCard>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-white">Anggaran Bulanan</h3>
                    <button onClick={() => setIsModalOpen(true)} className="text-primary-500"><PlusIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-2">
                    {state.budgets.map(b => {
                        const cat = state.categories.find(c => c.id === b.categoryId);
                        return (
                            <div key={b.categoryId} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <div>
                                    <div className="text-sm font-bold dark:text-white">{cat?.name}</div>
                                    <div className="text-xs text-slate-500">{formatCurrency(b.amount)}</div>
                                </div>
                                <button onClick={() => handleDeleteItem('budgets', b.categoryId)}><TrashIcon className="w-4 h-4 text-rose-500"/></button>
                            </div>
                        );
                    })}
                </div>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Setel Anggaran">
                    <div className="p-6 space-y-4">
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm">
                            <option value="">Pilih Kategori</option>
                            {state.categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <CurrencyInput value={amount} onChange={setAmount} />
                        <Button onClick={handleSave} className="w-full py-3 rounded-2xl">Simpan</Button>
                    </div>
                </Modal>
            </MobileCard>
        );
    };
    
    const BillSettings = ({ state, setState, handleDeleteItem }: { state: AppState, setState: any, handleDeleteItem: any }) => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [name, setName] = useState('');
        const [amount, setAmount] = useState(0);
        const [dueDate, setDueDate] = useState(5);
    
        const handleSave = () => {
            if (!name || amount <= 0) return;
            setState((prev: AppState) => ({
                ...prev,
                bills: [...prev.bills, { id: `bill-${new Date().getTime()}`, name, amount, dueDate }]
            }));
            setIsModalOpen(false);
        };
    
        return (
            <MobileCard>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-white">Tagihan Rutin</h3>
                    <button onClick={() => setIsModalOpen(true)} className="text-primary-500"><PlusIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-2">
                    {state.bills.map(b => (
                        <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                            <div>
                                <div className="text-sm font-bold dark:text-white">{b.name}</div>
                                <div className="text-xs text-slate-500">{formatCurrency(b.amount)} • Tgl {b.dueDate}</div>
                            </div>
                            <button onClick={() => handleDeleteItem('bills', b.id)}><TrashIcon className="w-4 h-4 text-rose-500"/></button>
                        </div>
                    ))}
                </div>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Tagihan">
                    <div className="p-6 space-y-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Tagihan" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm"/>
                        <CurrencyInput value={amount} onChange={setAmount} />
                        <div>
                            <label className="block text-xs mb-1">Tanggal Jatuh Tempo (1-31)</label>
                            <input type="number" value={dueDate} onChange={e => setDueDate(parseInt(e.target.value))} min="1" max="31" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm"/>
                        </div>
                        <Button onClick={handleSave} className="w-full py-3 rounded-2xl">Simpan</Button>
                    </div>
                </Modal>
            </MobileCard>
        );
    };
    
    const DebtSettings = ({ state, setState, handleDeleteItem }: { state: AppState, setState: any, handleDeleteItem: any }) => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [name, setName] = useState('');
        const [totalAmount, setTotalAmount] = useState(0);
    
        const handleSave = () => {
            if (!name || totalAmount <= 0) return;
            setState((prev: AppState) => ({
                ...prev,
                debts: [...prev.debts, { id: `debt-${new Date().getTime()}`, name, totalAmount, paidAmount: 0 }]
            }));
            setIsModalOpen(false);
        };
    
        return (
            <MobileCard>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-white">Utang / Cicilan</h3>
                    <button onClick={() => setIsModalOpen(true)} className="text-primary-500"><PlusIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-2">
                    {state.debts.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                            <div>
                                <div className="text-sm font-bold dark:text-white">{d.name}</div>
                                <div className="text-xs text-slate-500">{formatCurrency(d.paidAmount)} / {formatCurrency(d.totalAmount)}</div>
                            </div>
                            <button onClick={() => handleDeleteItem('debts', d.id)}><TrashIcon className="w-4 h-4 text-rose-500"/></button>
                        </div>
                    ))}
                </div>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Utang">
                    <div className="p-6 space-y-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Utang/Cicilan" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm"/>
                        <CurrencyInput value={totalAmount} onChange={setTotalAmount} />
                        <Button onClick={handleSave} className="w-full py-3 rounded-2xl">Simpan</Button>
                    </div>
                </Modal>
            </MobileCard>
        );
    };

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Pengaturan" subtitle="Kelola akun dan preferensi Anda." />
            
            {/* Tabs */}
            <div className="px-6 mt-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-primary-400 text-black shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 space-y-6 mt-4">
                {activeTab === 'umum' && (
                    <>
                        <MobileCard className="flex items-center gap-4">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-2xl shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-primary-400 flex items-center justify-center text-2xl font-bold">
                                    {user?.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg dark:text-white truncate">{user?.displayName}</h3>
                                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <button onClick={onLogout} className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-500">
                                <LogOutIcon className="w-6 h-6" />
                            </button>
                        </MobileCard>

                        <MobileCard>
                            <div className="flex items-center gap-2 mb-6">
                                <PaletteIcon className="w-5 h-5 text-primary-500" />
                                <h3 className="font-bold dark:text-white">Tampilan</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium dark:text-slate-300">Mode {colorScheme === 'light' ? 'Terang' : 'Gelap'}</span>
                                    <button onClick={handleToggleColorScheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700">
                                        {colorScheme === 'light' ? <SunIcon className="w-5 h-5 text-yellow-500" /> : <MoonIcon className="w-5 h-5 text-indigo-400" />}
                                    </button>
                                </div>
                                <div>
                                    <span className="text-sm font-medium dark:text-slate-300 block mb-3">Warna Aksen</span>
                                    <div className="flex gap-3">
                                        {accents.map(accent => (
                                            <button 
                                                key={accent.id}
                                                onClick={() => updateUserSettings({ accentColor: accent.id as any })}
                                                className={`w-10 h-10 rounded-full ${accent.className} flex items-center justify-center transition-all ${activeAccent === accent.id ? 'ring-4 ring-primary-400/30' : ''}`}
                                            >
                                                {activeAccent === accent.id && <CheckCircleIcon className="w-5 h-5 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </MobileCard>

                        <MobileCard>
                            <h3 className="font-bold dark:text-white mb-2">Gemini API Key</h3>
                            <p className="text-xs text-slate-500 mb-4">Dibutuhkan untuk fitur Insight AI dan Chat Assistant.</p>
                            <div className="space-y-3">
                                <input 
                                    type="password" 
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder="Masukkan API Key"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm"
                                />
                                <Button onClick={handleSaveApiKey} disabled={isSaving} className="w-full rounded-2xl py-3">
                                    {isSaving ? 'Menyimpan...' : 'Simpan API Key'}
                                </Button>
                            </div>
                        </MobileCard>
                    </>
                )}

                {activeTab === 'anggaran' && <BudgetSettings />}
                {activeTab === 'kategori' && <CategorySettings />}
                {activeTab === 'tagihan' && <BillSettings state={state} setState={setState} handleDeleteItem={handleDeleteItem} />}
                {activeTab === 'utang' && <DebtSettings state={state} setState={setState} handleDeleteItem={handleDeleteItem} />}
            </div>
        </div>
    );
};