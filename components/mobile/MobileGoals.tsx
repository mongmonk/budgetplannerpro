import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { formatCurrency } from '../../types';
import { MobileHeader } from './MobileUI';
import { Modal, CurrencyInput, Button } from '../ui';

export const MobileGoals: React.FC = () => {
    const { state, setState } = useAppContext();
    const { goals } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState(0);

    const handleAddGoal = () => {
        if (!name || targetAmount <= 0) return;
        setState(prev => ({
            ...prev,
            goals: [...prev.goals, { id: `goal-${new Date().getTime()}`, name, targetAmount, currentAmount: 0 }]
        }));
        setName('');
        setTargetAmount(0);
        setIsModalOpen(false);
    };

    const PlusIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );

    const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );

    const ShieldCheckIcon: React.FC<{className?: string}> = ({className}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
        </svg>
    );

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <div className="flex justify-between items-start pr-6">
                <MobileHeader title="Goals" subtitle="Mimpi besar, mulai dari recehan." />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-14 bg-primary-400 p-4 rounded-2xl shadow-lg shadow-primary-400/20"
                >
                    <PlusIcon className="w-6 h-6 text-black" />
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Target Baru">
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Target</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Misal: Dana Darurat"
                            className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Jumlah Target</label>
                        <CurrencyInput value={targetAmount} onChange={setTargetAmount} />
                    </div>
                    <Button onClick={handleAddGoal} className="w-full py-3 rounded-2xl">Simpan Target</Button>
                </div>
            </Modal>

            <div className="px-6 space-y-4 mt-4">
                {goals.length > 0 ? goals.map((goal, index) => {
                    const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
                    const isCompleted = percentage >= 100;
                    
                    return (
                        <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm flex items-center gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl">
                                {index === 0 ? '🏡' : index === 1 ? '💻' : index === 2 ? '🚨' : index === 3 ? '🕌' : '👩'}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold dark:text-white">{goal.name}</span>
                                        {isCompleted && <ShieldCheckIcon className="w-4 h-4 text-rose-500" />}
                                    </div>
                                    <span className={`font-bold ${isCompleted ? 'text-primary-400' : 'dark:text-white'}`}>
                                        {formatCurrency(goal.targetAmount)}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3" />
                                        <span>{isCompleted ? 'Goal Tercapai!' : '12 Jan 2035'}</span>
                                    </div>
                                    <span>{percentage}%</span>
                                </div>
                                
                                <div className="bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-primary-400' : 'bg-violet-400'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-20 text-slate-400">
                        Belum ada goals. Klik tombol + untuk menambah.
                    </div>
                )}
            </div>
        </div>
    );
};