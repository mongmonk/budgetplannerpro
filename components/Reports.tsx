import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../App';
import { formatCurrency } from '../types';
import { Card, Button, ProgressBar, CurrencyInput, CalculatorIcon } from './ui';

export const Reports: React.FC = () => {
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
            <Card>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CalculatorIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />Kalkulator Keuangan</h2>
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('pajak')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'pajak' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Pajak (PPh 21)</button>
                        <button onClick={() => setActiveTab('zakat')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'zakat' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Zakat Profesi</button>
                    </nav>
                </div>
                <div className="pt-6">
                    {activeTab === 'pajak' && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Penghasilan Bruto per Bulan</label><CurrencyInput value={monthlyIncomeTax} onChange={setMonthlyIncomeTax} placeholder="Rp 0" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status Perkawinan</label><select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-700 dark:border-slate-600"><option value="TK0">Belum Kawin</option><option value="K">Kawin</option></select></div>
                                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah Tanggungan</label><input type="number" min="0" max="3" value={dependents} onChange={e => setDependents(parseInt(e.target.value))} disabled={maritalStatus !== 'K'} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm bg-white dark:bg-slate-700 dark:border-slate-600 disabled:opacity-50" /></div>
                            </div>
                            <Button onClick={handleCalculateTax} className="w-full">Hitung Pajak</Button>
                            {taxResult !== null && <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg"><h4 className="font-semibold text-center mb-2">Estimasi PPh 21 Anda</h4><p className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400">{formatCurrency(taxResult)}</p><p className="text-sm text-center text-slate-500 dark:text-slate-400">per tahun</p></div>}
                        </div>
                    )}
                    {activeTab === 'zakat' && (
                         <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Penghasilan Bruto per Bulan</label><CurrencyInput value={monthlyIncomeZakat} onChange={setMonthlyIncomeZakat} placeholder="Rp 0" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Emas per Gram (untuk Nishab)</label><CurrencyInput value={goldPrice} onChange={setGoldPrice} placeholder="Rp 0" /></div>
                             <Button onClick={handleCalculateZakat} className="w-full">Hitung Zakat</Button>
                             {zakatResult && <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-2"><div className="flex justify-between text-sm"><span>Batas Nishab (85gr emas):</span><span className="font-medium">{formatCurrency(zakatResult.nishab)}/tahun</span></div><div className="flex justify-between text-sm"><span>Estimasi Pendapatan Anda:</span><span className="font-medium">{formatCurrency(zakatResult.annualIncome)}/tahun</span></div><div className={`text-center font-bold py-2 rounded ${zakatResult.isObligated ? 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50' : 'text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50'}`}>{zakatResult.isObligated ? "Anda Wajib Membayar Zakat" : "Anda Belum Wajib Zakat"}</div>{zakatResult.isObligated && <div className="pt-2 text-center"><h4 className="font-semibold">Estimasi Zakat Anda (2.5%)</h4><p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(zakatResult.zakatAmount)}</p><p className="text-sm text-slate-500 dark:text-slate-400">per tahun</p></div>}</div>}
                         </div>
                    )}
                </div>
            </Card>
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

    return (
        <div className="space-y-6 pb-16 md:pb-0">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Laporan & Rekapitulasi</h1>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <label htmlFor="month-picker" className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Bulan:</label>
                    <input type="month" id="month-picker" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>
            <Card className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Ringkasan Bulan Ini</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><span className="text-slate-600 dark:text-slate-400">Total Pemasukan:</span><span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(reportData.totalIncome)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-600 dark:text-slate-400">Pengeluaran Umum:</span><span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(reportData.expenseByType.umum)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-600 dark:text-slate-400">Investasi/Tabungan:</span><span className="font-semibold">{formatCurrency(reportData.expenseByType.investasi)}</span></div>
                             <div className="flex justify-between items-center"><span className="text-slate-600 dark:text-slate-400">Utang Dibayar:</span><span className="font-semibold">{formatCurrency(reportData.expenseByType.utang)}</span></div>
                             <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-600"><span className="font-bold">Sisa Uang:</span><span className={`font-bold text-lg ${reportData.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>{formatCurrency(reportData.balance)}</span></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <h2 className="text-lg font-semibold">Rincian Pengeluaran</h2>
                         <div className="space-y-2">{reportData.expenseByCategory.length > 0 ? reportData.expenseByCategory.map(c => <div key={c.name} className="flex justify-between items-center text-sm"><span className="text-slate-600 dark:text-slate-400">{c.name}:</span><span className="font-medium">{formatCurrency(c.amount)}</span></div>) : <p className="text-sm text-center text-slate-500 dark:text-slate-400 pt-8">Tidak ada pengeluaran umum.</p>}</div>
                    </div>
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Alokasi Keuangan Bulanan</h2>
                    {reportData.allocationData.length > 0 ? <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={reportData.allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">{reportData.allocationData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[e.name as keyof typeof COLORS]} />)}</Pie><Tooltip formatter={(v: number) => formatCurrency(v)} /><Legend iconType="circle" /></PieChart></ResponsiveContainer> : <p className="text-center text-slate-500 dark:text-slate-400 h-[250px] flex items-center justify-center">Tidak ada data untuk ditampilkan.</p>}
                </Card>
                <Card className="lg:col-span-3">
                    <h2 className="text-xl font-semibold mb-4">Progres Anggaran Bulanan</h2>
                    <div className="space-y-4">{reportData.budgetProgress.length > 0 ? reportData.budgetProgress.map(i => <div key={i.name}><div className="flex justify-between items-center mb-1"><span className="font-medium text-sm">{i.name}</span><span className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(i.spent)} / {formatCurrency(i.budgetAmount)}</span></div><ProgressBar value={i.spent} max={i.budgetAmount} colorClass={getProgressBarColor(i.spent, i.budgetAmount)} /></div>) : <p className="text-center text-slate-500 dark:text-slate-400 pt-16">Anda belum mengatur anggaran apapun.</p>}</div>
                </Card>
            </div>
            <FinancialCalculators />
        </div>
    );
};
