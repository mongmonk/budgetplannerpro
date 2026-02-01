import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../App';
import { formatCurrency } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';
import { CalendarIcon } from '../ui';

export const MobileAnalysis: React.FC = () => {
    const { state } = useAppContext();
    const { transactions } = state;

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0);

    const categoryData = useMemo(() => {
        const data: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            data[t.category] = (data[t.category] || 0) + t.amount;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenseTransactions]);

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Analisis" subtitle="Analisa kebiasaan keuanganmu." />
            
            <div className="px-6 space-y-6 mt-4">
                {/* Month Selector Mockup */}
                <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold dark:text-white">Jan 2026</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>

                <MobileCard>
                    <h2 className="text-xl font-bold dark:text-white mb-8">Pecahan Pengeluaran</h2>
                    
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    {categoryData.length === 0 && <Cell fill="#e2e8f0" />}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Custom labels based on screenshot style */}
                        {categoryData.slice(0, 5).map((entry, index) => {
                            const percent = ((entry.value / totalExpense) * 100).toFixed(1);
                            // This is a simplified positioning for the demo
                            return null; // Labels are tricky in ResponsiveContainer, usually done with custom label prop
                        })}
                    </div>
                </MobileCard>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold dark:text-white">Kategori Teratas</h2>
                    
                    <div className="space-y-3">
                        {categoryData.slice(0, 5).map((category, index) => (
                            <div key={category.name} className="bg-white dark:bg-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}>
                                        {index === 0 ? '🏠' : index === 1 ? '🌐' : '📦'}
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white">{category.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold dark:text-white">{formatCurrency(category.value)}</div>
                                    <div className="text-xs text-slate-400 font-bold">{((category.value / totalExpense) * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};