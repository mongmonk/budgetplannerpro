import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../../App';
import { formatCurrency } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';
import { Button, ProgressBar, CurrencyInput, CalculatorIcon } from '../ui';

export const MobileAnalysis: React.FC = () => {
    const { state } = useAppContext();
    const { transactions, budgets, categories } = state;
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const getProgressBarColor = (value: number, max: number) => {
        if (max === 0) return 'bg-slate-400';
        const percentage = (value / max) * 100;
        if (percentage > 100) return 'bg-red-500';
        if (percentage > 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const FinancialCalculators: React.FC = () => {
        const [activeTab, setActiveTab] = useState('pajak');
        const [monthlyIncomeTax, setMonthlyIncomeTax] = useState(0);
        const [maritalStatus, setMaritalStatus] = useState('TK0');
        const [dependents, setDependents] = useState(0);
        const [taxResult, setTaxResult] = useState<number | null>(null);
        const [monthlyIncomeZakat, setMonthlyIncomeZakat] = useState(0);
        const [goldPrice, setGoldPrice] = useState(1050000);
        const [zakatResult, setZakatResult] = useState<{ nishab: number; annualIncome: number; zakatAmount: number; isObligated: boolean } | null>(null);

        const handleCalculateTax = () => {
            const annualIncome = monthlyIncomeTax * 12;
            let ptkp = 54000000;
            if (maritalStatus === 'K') { ptkp += 4500000; ptkp += Math.min(dependents, 3) * 4500000; }
            const pkp = Math.max(0, annualIncome - ptkp);
            let tax = 0;
            if (pkp > 0) {
                if (pkp <= 60000000) tax = pkp * 0.05;
                else if (pkp <= 250000000) tax = (60000000 * 0.05) + ((pkp - 60000000) * 0.15);
                else if (pkp <= 500000000) tax = (60000000 * 0.05) + (190000000 * 0.15) + ((pkp - 250000000) * 0.25);
                else if (pkp <= 5000000000) tax = (60000000 * 0.05) + (190000000 * 0.15) + (250000000 * 0.25) + ((pkp - 500000000) * 0.30);
                else tax = (60000000 * 0.05) + (190000000 * 0.15) + (250000000 * 0.25) + (4500000000 * 0.30) + ((pkp - 5000000000) * 0.35);
            }
            setTaxResult(tax);
        };
        const handleCalculateZakat = () => {
            const annualIncome = monthlyIncomeZakat * 12;
            const nishab = 85 * goldPrice;
            const isObligated = annualIncome >= nishab;
            const zakatAmount = isObligated ? annualIncome * 0.025 : 0;
            setZakatResult({ nishab, annualIncome, zakatAmount, isObligated });
        };
        return (
            <MobileCard>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white"><CalculatorIcon className="w-5 h-5 text-primary-500" />Kalkulator Keuangan</h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                    <button onClick={() => setActiveTab('pajak')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pajak' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-500'}`}>Pajak (PPh 21)</button>
                    <button onClick={() => setActiveTab('zakat')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'zakat' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-500'}`}>Zakat Profesi</button>
                </div>
                <div className="space-y-4">
                    {activeTab === 'pajak' && (
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Penghasilan Bruto / Bulan</label><CurrencyInput value={monthlyIncomeTax} onChange={setMonthlyIncomeTax} placeholder="Rp 0" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Status</label><select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className="w-full px-3 py-2 border-none rounded-xl text-sm bg-slate-50 dark:bg-slate-900 dark:text-white"><option value="TK0">Belum Kawin</option><option value="K">Kawin</option></select></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Tanggungan</label><input type="number" min="0" max="3" value={dependents} onChange={e => setDependents(parseInt(e.target.value))} disabled={maritalStatus !== 'K'} className="w-full px-3 py-2 border-none rounded-xl text-sm bg-slate-50 dark:bg-slate-900 dark:text-white disabled:opacity-50" /></div>
                            </div>
                            <Button onClick={handleCalculateTax} className="w-full py-3 rounded-2xl">Hitung Pajak</Button>
                            {taxResult !== null && <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-center"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimasi PPh 21</h4><p className="text-2xl font-bold text-primary-500">{formatCurrency(taxResult)}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">per tahun</p></div>}
                        </div>
                    )}
                    {activeTab === 'zakat' && (
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Penghasilan Bruto / Bulan</label><CurrencyInput value={monthlyIncomeZakat} onChange={setMonthlyIncomeZakat} placeholder="Rp 0" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Harga Emas / Gram</label><CurrencyInput value={goldPrice} onChange={setGoldPrice} placeholder="Rp 0" /></div>
                            <Button onClick={handleCalculateZakat} className="w-full py-3 rounded-2xl">Hitung Zakat</Button>
                            {zakatResult && <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-3"><div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500"><span>Batas Nishab:</span><span>{formatCurrency(zakatResult.nishab)}/thn</span></div><div className={`text-center font-bold py-2 rounded-xl text-xs ${zakatResult.isObligated ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'}`}>{zakatResult.isObligated ? "Wajib Zakat" : "Belum Wajib Zakat"}</div>{zakatResult.isObligated && <div className="pt-2 text-center"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimasi Zakat</h4><p className="text-2xl font-bold text-primary-500">{formatCurrency(zakatResult.zakatAmount)}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">per tahun</p></div>}</div>}
                        </div>
                    )}
                </div>
            </MobileCard>
        );
    };

    const reportData = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthlyTransactions = transactions.filter(t => { const d = new Date(t.date); return d.getFullYear() === year && d.getMonth() === month - 1; });
        const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenseByType = { umum: 0, investasi: 0, utang: 0 };
        const expenseByCategory: { [key: string]: number } = {};
        monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
            if (t.category === 'Investasi/Tabungan') expenseByType.investasi += t.amount;
            else if (t.category === 'Utang') expenseByType.utang += t.amount;
            else { expenseByType.umum += t.amount; expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount; }
        });
        const totalExpense = expenseByType.umum + expenseByType.investasi + expenseByType.utang;
        return {
            totalIncome, expenseByType, totalExpense, balance: totalIncome - totalExpense,
            expenseByCategory: Object.entries(expenseByCategory).map(([name, amount]) => ({ name, amount })),
            allocationData: [{ name: 'Pengeluaran', value: expenseByType.umum }, { name: 'Tabungan', value: expenseByType.investasi }, { name: 'Utang', value: expenseByType.utang }].filter(i => i.value > 0),
            budgetProgress: budgets.map(b => ({ name: categories.find(c => c.id === b.categoryId)?.name || 'N/A', spent: monthlyTransactions.filter(t => t.type === 'expense' && t.category === categories.find(c => c.id === b.categoryId)?.name).reduce((s, t) => s + t.amount, 0), budgetAmount: b.amount }))
        };
    }, [transactions, budgets, categories, selectedMonth]);

    const COLORS = { 'Pengeluaran': '#ef4444', 'Tabungan': '#22c55e', 'Utang': '#3b82f6' };

    // Custom Icons matching MobileDashboard
    const DiamondIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 12L2 9z" /></svg>);
    const RocketIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a3e635" stroke="none" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg>);

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Analisis" subtitle="Laporan & Kalkulator" />

            <div className="px-6 space-y-6 mt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold dark:text-white">Pilih Bulan</h2>
                    <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-white dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-sm font-bold shadow-sm focus:ring-primary-500 dark:text-white" />
                </div>

                {/* Hero Card - Summary Style (Simplified Structure) */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <DiamondIcon className="w-5 h-5 text-primary-400" />
                        Ringkasan
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pemasukan</span>
                            <span className="font-bold text-green-400">{formatCurrency(reportData.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pengeluaran</span>
                            <span className="font-bold text-rose-400">{formatCurrency(reportData.totalExpense)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sisa Uang</span>
                            <span className={`font-bold text-lg ${reportData.balance >= 0 ? 'text-primary-400' : 'text-orange-400'}`}>{formatCurrency(reportData.balance)}</span>
                        </div>
                    </div>
                </div>

                <MobileCard>
                    <h2 className="text-lg font-bold mb-4 dark:text-white">Alokasi</h2>
                    {reportData.allocationData.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={reportData.allocationData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">
                                        {reportData.allocationData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[e.name as keyof typeof COLORS]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-center text-xs text-slate-400 py-10">Tidak ada data.</p>
                    )}
                </MobileCard>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold dark:text-white">Anggaran</h2>
                    {reportData.budgetProgress.length > 0 ? reportData.budgetProgress.map(i => (
                        <MobileCard key={i.name}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold dark:text-white">{i.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatCurrency(i.spent)} / {formatCurrency(i.budgetAmount)}</span>
                            </div>
                            <ProgressBar value={i.spent} max={i.budgetAmount} colorClass={getProgressBarColor(i.spent, i.budgetAmount)} />
                        </MobileCard>
                    )) : (
                        <MobileCard><p className="text-center text-xs text-slate-400 py-4">Belum ada anggaran.</p></MobileCard>
                    )}
                </div>

                <FinancialCalculators />
            </div>
        </div>
    );
};