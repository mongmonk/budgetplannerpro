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
        { id: 'target', label: 'Target' },
        { id: 'dompet', label: 'Dompet' },
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
        { id: 'blue', className: 'bg-[#00ffff]' },
        { id: 'emerald', className: 'bg-[#adff2f]' },
        { id: 'rose', className: 'bg-[#ff007f]' },
        { id: 'violet', className: 'bg-[#bf00ff]' },
        { id: 'orange', className: 'bg-[#ffa500]' }
    ];

    const CategorySettings = () => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [name, setName] = useState('');
        const [type, setType] = useState<TransactionType>('expense');
        const handleAdd = () => { if (!name) return; setState(prev => ({ ...prev, categories: [...prev.categories, { id: `cat-${new Date().getTime()}`, name, type }] })); setName(''); setIsModalOpen(false); };
        const handleDeleteCategory = (id: string) => { if (state.budgets.some(b => b.categoryId === id)) { alert('Tidak dapat menghapus kategori yang digunakan dalam anggaran. Hapus anggaran terlebih dahulu.'); return; } if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) setState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) })); };
        return (<div className="space-y-6"><MobileCard><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white text-sm">Pemasukan</h3><button onClick={() => { setType('income'); setIsModalOpen(true); }} className="text-primary-500"><PlusIcon className="w-5 h-5"/></button></div><div className="space-y-2">{state.categories.filter(c => c.type === 'income').map(c => (<div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl"><span className="text-xs dark:text-white">{c.name}</span><button onClick={() => handleDeleteCategory(c.id)}><TrashIcon className="w-4 h-4 text-rose-500"/></button></div>))}</div></MobileCard><MobileCard><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white text-sm">Pengeluaran</h3><button onClick={() => { setType('expense'); setIsModalOpen(true); }} className="text-primary-500"><PlusIcon className="w-5 h-5"/></button></div><div className="space-y-2">{state.categories.filter(c => c.type === 'expense').map(c => (<div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl"><span className="text-xs dark:text-white">{c.name}</span><button onClick={() => handleDeleteCategory(c.id)}><TrashIcon className="w-4 h-4 text-rose-500"/></button></div>))}</div></MobileCard><Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Kategori"><div className="p-6 space-y-4"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Kategori" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm dark:text-white"/><select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm dark:text-white"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select><Button onClick={handleAdd} className="w-full py-3 rounded-2xl">Simpan</Button></div></Modal></div>);
    };

    const BudgetSettings = () => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [categoryId, setCategoryId] = useState('');
        const [amount, setAmount] = useState(0);
        const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
        const openEditModal = (b: Budget) => { setEditingBudget(b); setCategoryId(b.categoryId); setAmount(b.amount); setIsModalOpen(true); };
        const openAddModal = () => { setEditingBudget(null); setCategoryId(''); setAmount(0); setIsModalOpen(true); };
        const handleSave = () => {
            if (!categoryId || amount <= 0) return;
            setState(prev => {
                const i = prev.budgets.findIndex(b => b.categoryId === categoryId);
                let newBudgets = [...prev.budgets];
                if (editingBudget && i > -1) newBudgets[i] = { ...editingBudget, amount };
                else if (i === -1) newBudgets.push({ categoryId, amount });
                else newBudgets[i] = { categoryId, amount };
                return { ...prev, budgets: newBudgets };
            });
            setIsModalOpen(false);
        };
        return (<MobileCard><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white text-sm">Anggaran Bulanan</h3><button onClick={openAddModal} className="text-primary-500"><PlusIcon className="w-5 h-5"/></button></div><div className="space-y-2">{state.budgets.map(b => { const cat = state.categories.find(c => c.id === b.categoryId); return (<div key={b.categoryId} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl"><div><div className="text-sm font-bold dark:text-white">{cat?.name}</div><div className="text-xs text-slate-500">{formatCurrency(b.amount)}</div></div><div className="flex items-center gap-3"><button onClick={() => openEditModal(b)}><EditIcon className="w-4 h-4 text-blue-500"/></button><button onClick={() => handleDeleteItem('budgets', b.categoryId)}><TrashIcon className="w-4 h-4 text-rose-500"/></button></div></div>); })}</div><Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? "Edit Anggaran" : "Setel Anggaran"}><div className="p-6 space-y-4"><select value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={!!editingBudget} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm dark:text-white"><option value="">Pilih Kategori</option>{state.categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><CurrencyInput value={amount} onChange={setAmount} /><Button onClick={handleSave} className="w-full py-3 rounded-2xl">Simpan</Button></div></Modal></MobileCard>);
    };

    const CrudSettings: React.FC<{ title: string; items: (FinancialGoal | Bill | Debt)[]; onSave: (item: any) => void; onDelete: (id: string) => void; fields: { name: string; type: 'text' | 'number' | 'currency'; label: string; min?: number; max?: number }[]; itemType: 'goal' | 'bill' | 'debt'; }> = ({ title, items, onSave, onDelete, fields, itemType }) => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentItem, setCurrentItem] = useState<any>(null);
        const openModal = (item: any | null = null) => { if (item) setCurrentItem({ ...item }); else { let newItem: any = {}; if (itemType === 'goal') newItem = { name: '', targetAmount: 0, currentAmount: 0 }; else if (itemType === 'bill') newItem = { name: '', amount: 0, dueDate: 5 }; else if (itemType === 'debt') newItem = { name: '', totalAmount: 0, paidAmount: 0 }; else if (itemType === 'wallet') newItem = { name: '', balance: 0, type: 'Digital', icon: '💰' }; setCurrentItem(newItem); } setIsModalOpen(true); };
        const handleSave = () => { if (!currentItem.name) return; onSave({ ...currentItem, id: currentItem.id || `item-${new Date().getTime()}` }); setIsModalOpen(false); };
        const renderItemDetails = (item: any) => { switch(itemType) { case 'goal': return `${formatCurrency(item.currentAmount || 0)} / ${formatCurrency(item.targetAmount)}`; case 'bill': return `${formatCurrency(item.amount)} / bulan`; case 'debt': return `${formatCurrency(item.paidAmount || 0)} / ${formatCurrency(item.totalAmount)}`; case 'wallet': return `${item.type} • ${formatCurrency(item.balance)}`; default: return ''; } };
        return (<MobileCard><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white text-sm">{title}</h3><button onClick={() => openModal()} className="text-primary-500"><PlusIcon className="w-5 h-5"/></button></div><div className="space-y-2">{items.map((item: any) => (<div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl"><div><div className="text-sm font-bold dark:text-white">{item.name}</div><div className="text-xs text-slate-500">{renderItemDetails(item)}</div></div><div className="flex items-center gap-3"><button onClick={() => openModal(item)}><EditIcon className="w-4 h-4 text-blue-500"/></button><button onClick={() => onDelete(item.id)}><TrashIcon className="w-4 h-4 text-rose-500"/></button></div></div>))}</div><Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${currentItem?.id ? 'Edit' : 'Tambah'} ${title}`}><div className="p-6 space-y-4">{fields.map(field => <div key={field.name}><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{field.label}</label>{field.type === 'currency' ? <CurrencyInput value={currentItem?.[field.name] || 0} onChange={val => setCurrentItem({ ...currentItem, [field.name]: val })} /> : <input type={field.type} value={currentItem?.[field.name] || ''} min={field.min} max={field.max} onChange={e => setCurrentItem({ ...currentItem, [field.name]: field.type === 'number' ? (isNaN(parseInt(e.target.value, 10)) ? '' : parseInt(e.target.value, 10)) : e.target.value })} placeholder={field.label} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm dark:text-white"/>}</div>)}<Button onClick={handleSave} className="w-full py-3 rounded-2xl">Simpan</Button></div></Modal></MobileCard>);
    };

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Pengaturan" subtitle="Kelola akun dan preferensi Anda." />
            
            <div className="px-6 mt-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max pb-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-primary-400 text-black shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>{tab.label}</button>
                    ))}
                </div>
            </div>

            <div className="px-6 space-y-6 mt-4">
                {activeTab === 'umum' && (
                    <>
                        <MobileCard className="flex items-center gap-4">
                            {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-2xl shadow-sm" /> : <div className="w-16 h-16 rounded-2xl bg-primary-400 flex items-center justify-center text-2xl font-bold">{user?.displayName?.charAt(0) || 'U'}</div>}
                            <div className="flex-1 min-w-0"><h3 className="font-bold text-lg dark:text-white truncate">{user?.displayName}</h3><p className="text-sm text-slate-500 truncate">{user?.email}</p></div>
                            <button onClick={onLogout} className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-500"><LogOutIcon className="w-6 h-6" /></button>
                        </MobileCard>
                        <MobileCard><div className="flex items-center gap-2 mb-6"><PaletteIcon className="w-5 h-5 text-primary-500" /><h3 className="font-bold dark:text-white">Tampilan</h3></div><div className="space-y-6"><div className="flex items-center justify-between"><span className="text-sm font-medium dark:text-slate-300">Mode {colorScheme === 'light' ? 'Terang' : 'Gelap'}</span><button onClick={handleToggleColorScheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700">{colorScheme === 'light' ? <SunIcon className="w-5 h-5 text-yellow-500" /> : <MoonIcon className="w-5 h-5 text-indigo-400" />}</button></div><div><span className="text-sm font-medium dark:text-slate-300 block mb-3">Warna Aksen</span><div className="flex gap-3">{accents.map(accent => (<button key={accent.id} onClick={() => updateUserSettings({ accentColor: accent.id as any })} className={`w-10 h-10 rounded-full ${accent.className} flex items-center justify-center transition-all ${activeAccent === accent.id ? 'ring-4 ring-primary-400/30' : ''}`}>{activeAccent === accent.id && <CheckCircleIcon className="w-5 h-5 text-white" />}</button>))}</div></div></div></MobileCard>
                        <MobileCard><h3 className="font-bold dark:text-white mb-2">Gemini API Key</h3><p className="text-xs text-slate-500 mb-4">Dibutuhkan untuk fitur Insight AI dan Chat Assistant.</p><div className="space-y-3"><input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="Masukkan API Key" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm dark:text-white"/><Button onClick={handleSaveApiKey} disabled={isSaving} className="w-full rounded-2xl py-3">{isSaving ? 'Menyimpan...' : 'Simpan API Key'}</Button></div></MobileCard>
                        <CategorySettings />
                    </>
                )}
                {activeTab === 'anggaran' && <BudgetSettings />}
                {activeTab === 'target' && <CrudSettings title="Target Finansial" items={state.goals} onSave={(item) => handleSaveItem('goals', item)} onDelete={(id) => handleDeleteItem('goals', id)} fields={[{name: 'name', type: 'text', label: 'Nama Target'}, {name: 'targetAmount', type: 'currency', label: 'Jumlah Target'}]} itemType="goal"/>}
                {activeTab === 'dompet' && <CrudSettings title="Dompet & Akun" items={state.wallets || []} onSave={(item) => handleSaveItem('wallets', item)} onDelete={(id) => handleDeleteItem('wallets', id)} fields={[{name: 'name', type: 'text', label: 'Nama Dompet'}, {name: 'type', type: 'text', label: 'Tipe (Bank/Digital/Tunai)'}, {name: 'balance', type: 'currency', label: 'Saldo Saat Ini'}, {name: 'icon', type: 'text', label: 'Emoji Icon'}]} itemType="wallet" />}
                {activeTab === 'tagihan' && <CrudSettings title="Tagihan Rutin" items={state.bills} onSave={(item) => handleSaveItem('bills', item)} onDelete={(id) => handleDeleteItem('bills', id)} fields={[{name: 'name', type: 'text', label: 'Nama Tagihan'}, {name: 'amount', type: 'currency', label: 'Jumlah'}, {name: 'dueDate', type: 'number', label: 'Tgl Jatuh Tempo', min: 1, max: 31}]} itemType="bill"/>}
                {activeTab === 'utang' && <CrudSettings title="Utang / Cicilan" items={state.debts} onSave={(item) => handleSaveItem('debts', item)} onDelete={(id) => handleDeleteItem('debts', id)} fields={[{name: 'name', type: 'text', label: 'Nama Utang'}, {name: 'totalAmount', type: 'currency', label: 'Total Pokok Utang'}]} itemType="debt"/>}
            </div>
        </div>
    );
};