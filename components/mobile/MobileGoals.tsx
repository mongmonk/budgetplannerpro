import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { formatCurrency, FinancialGoal } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';
import { Modal, CurrencyInput, Button, PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, ProgressBar } from '../ui';

export const MobileGoals: React.FC = () => {
    const { state, setState } = useAppContext();
    const { goals } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState(0);

    const openAddModal = () => {
        setEditingGoal(null);
        setName('');
        setTargetAmount(0);
        setIsModalOpen(true);
    };

    const openEditModal = (goal: FinancialGoal) => {
        setEditingGoal(goal);
        setName(goal.name);
        setTargetAmount(goal.targetAmount);
        setIsModalOpen(true);
    };

    const handleSaveGoal = () => {
        if (!name || targetAmount <= 0) return;
        setState(prev => {
            let newGoals;
            if (editingGoal) {
                newGoals = prev.goals.map(g => g.id === editingGoal.id ? { ...g, name, targetAmount } : g);
            } else {
                newGoals = [...prev.goals, { id: `goal-${new Date().getTime()}`, name, targetAmount, currentAmount: 0 }];
            }
            return { ...prev, goals: newGoals };
        });
        setIsModalOpen(false);
    };

    const handleDeleteGoal = (id: string) => {
        if (!window.confirm('Hapus target ini?')) return;
        setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    };

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Goals" subtitle="Mimpi besar, mulai dari recehan" />
            
            <div className="px-6 space-y-6 mt-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">Daftar Target</h2>
                    <button onClick={openAddModal} className="bg-primary-400 p-3 rounded-2xl shadow-lg shadow-primary-400/20">
                        <PlusIcon className="w-5 h-5 text-black" />
                    </button>
                </div>

                <div className="space-y-4">
                    {goals.length > 0 ? goals.map((goal, index) => (
                        <MobileCard key={goal.id}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
                                    {index % 5 === 0 ? '🏡' : index % 5 === 1 ? '💻' : index % 5 === 2 ? '🚨' : index % 5 === 3 ? '🕌' : '👩'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <h3 className="font-bold dark:text-white truncate text-sm">{goal.name}</h3>
                                        {goal.currentAmount >= goal.targetAmount && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(goal)} className="p-1 text-blue-400"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="p-1 text-rose-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                        </MobileCard>
                    )) : (
                        <div className="text-center py-20 text-slate-400 text-xs">Belum ada target. Klik + untuk menambah.</div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? "Edit Target" : "Tambah Target"}>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Target</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Dana Darurat" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none text-sm dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Jumlah Target</label>
                        <CurrencyInput value={targetAmount} onChange={setTargetAmount} />
                    </div>
                    <Button onClick={handleSaveGoal} className="w-full py-3 rounded-2xl">Simpan</Button>
                </div>
            </Modal>
        </div>
    );
};