import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from '../App';
import { Transaction } from '../types';
import { formatCurrency } from '../types';
import { Card, ProgressBar, InfoIcon, XIcon, LightbulbIcon, CheckCircleIcon, TrendingUpIcon, TrendingDownIcon, PercentIcon, ReceiptIcon, TargetIcon } from './ui';
import { ChatAssistant } from './ChatAssistant';

const StaticInsights: React.FC<{ allTransactions: Transaction[], filteredTransactions: Transaction[], periodLabel: string }> = ({ allTransactions, filteredTransactions, periodLabel }) => {
    const { totalIncome, totalExpense, largestIncome, largestExpense, dailyAvgExpense } = useMemo(() => { const i = filteredTransactions.filter(t => t.type === 'income'); const e = filteredTransactions.filter(t => t.type === 'expense'); return { totalIncome: i.reduce((s, t) => s + t.amount, 0), totalExpense: e.reduce((s, t) => s + t.amount, 0), largestIncome: i.sort((a,b) => b.amount - a.amount)[0], largestExpense: e.sort((a,b) => b.amount - a.amount)[0], dailyAvgExpense: new Set(e.map(t=>new Date(t.date).toDateString())).size > 0 ? e.reduce((s, t) => s + t.amount, 0) / new Set(e.map(t=>new Date(t.date).toDateString())).size : 0 }; }, [filteredTransactions]);
    const savingsRatio = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const isHealthy = savingsRatio >= 10;
    const taxAndZakatInsights = useMemo(() => {
        const insights:any[] = []; const now = new Date(); if (now.getMonth() >= 0 && now.getMonth() <= 2) insights.push({ icon: ReceiptIcon, color: 'text-cyan-500', text: `Ini periode pelaporan <strong>SPT Tahunan</strong>. Lapor sebelum 31 Maret!` });
        const recentIncome = allTransactions.filter(t => t.type === 'income' && new Date(t.date) >= new Date(now.getFullYear(), now.getMonth() - 2, 1));
        if (recentIncome.length > 0) { const totalRecent = recentIncome.reduce((s, t) => s + t.amount, 0); const months = new Set(recentIncome.map(t => `${new Date(t.date).getFullYear()}-${new Date(t.date).getMonth()}`)).size; const avgMonthly = totalRecent / (months > 0 ? months : 1); const estAnnual = avgMonthly * 12; if (estAnnual >= 85 * 1050000) insights.push({ icon: CheckCircleIcon, color: 'text-teal-500', text: `Berdasarkan estimasi pendapatan, Anda mungkin wajib <strong>Zakat Profesi</strong>. Cek di Laporan.` }); }
        return insights;
    }, [allTransactions]);
    const allInsights = [{ icon: CheckCircleIcon, color: isHealthy ? 'text-green-500' : 'text-yellow-500', text: `Status keuangan ${periodLabel}: <strong class="${isHealthy ? 'text-green-500' : 'text-yellow-500'}">${isHealthy ? 'Sehat' : 'Perlu Perhatian'}</strong>` }, { icon: TrendingUpIcon, color: 'text-green-500', text: largestIncome ? `Pemasukan terbesar ${periodLabel} pada ${new Date(largestIncome.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})} (${formatCurrency(largestIncome.amount)}).` : `Tidak ada pemasukan ${periodLabel} ini.` }, { icon: TrendingDownIcon, color: 'text-red-500', text: largestExpense ? `Pengeluaran terbesar ${periodLabel} pada ${new Date(largestExpense.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})} (${formatCurrency(largestExpense.amount)} - ${largestExpense.category}).` : `Tidak ada pengeluaran ${periodLabel} ini.` }, { icon: PercentIcon, color: 'text-blue-500', text: `Rasio tabungan ${periodLabel} adalah <strong>${savingsRatio.toFixed(1)}%</strong>. ${savingsRatio > 20 ? 'Luar biasa!' : 'Yuk, tingkatkan lagi!'}` }, { icon: ReceiptIcon, color: 'text-indigo-500', text: `Rata-rata pengeluaran harian ${periodLabel} sekitar <strong>${formatCurrency(dailyAvgExpense)}</strong>.` }, ...taxAndZakatInsights, { icon: LightbulbIcon, color: 'text-primary-500', text: `Masukkan <strong>API KEY Gemini</strong> di Pengaturan untuk insight AI.` }];
    return (<Card><ul className="space-y-4">{allInsights.map((item, index) => <li key={index} className="flex items-start gap-4"><item.icon className={`w-6 h-6 flex-shrink-0 ${item.color}`} /><p className="text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: item.text }}></p></li>)}</ul></Card>);
};

export const Dashboard: React.FC = () => {
    const { state, setState, colorScheme } = useAppContext();
    const { transactions, goals, budgets, apiKey, notifications } = state;
    const [filter, setFilter] = useState('Bulan Ini');
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const yAxisFormatter = (v: number) => { if (v === 0) return 'Rp 0'; if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace('.', ',')} Jt`; if (v >= 1e3) return `${(v / 1e3).toFixed(0)} Rb`; return `${v}`; };
    
    const dismissNotification = (id: string) => setState(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));

    const { filteredTransactions, dateRangeLabel } = useMemo(() => {
        const now = new Date(); let startDate; let label;
        switch (filter) {
            case '3 Bulan Terakhir': startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); label = '3 Bulan Terakhir'; break;
            case '6 Bulan Terakhir': startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); label = '6 Bulan Terakhir'; break;
            case '1 Tahun Terakhir': startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); label = '1 Tahun Terakhir'; break;
            default: startDate = new Date(now.getFullYear(), now.getMonth(), 1); label = 'Bulan Ini'; break;
        }
        return { filteredTransactions: transactions.filter(t => new Date(t.date) >= startDate), dateRangeLabel: label };
    }, [transactions, filter]);
     
    useEffect(() => {
        const fetchAIInsights = async () => {
            if (!apiKey) { setAiInsights([]); setAiError(null); return; }
            const cacheKey = `ai_insights_cache_${dateRangeLabel}`;
            try { const cached = localStorage.getItem(cacheKey); if (cached) { const data = JSON.parse(cached); if (new Date().getTime() - data.timestamp < 86400000) { setAiInsights(data.insights); return; } } } catch (e) { console.warn("Cache read failed", e); }
            if (filteredTransactions.length === 0) { setAiInsights([]); return; }
            setIsLoadingInsights(true); setAiError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: apiKey as string });
                const dataSummary = { totalIncome: filteredTransactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0), totalExpense: filteredTransactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0), transactions: filteredTransactions.slice(0, 20).map(t => ({ type: t.type, amount: t.amount, category: t.category, date: t.date })), goals, budgets };
                const prompt = `PERAN: Anda adalah seorang analis keuangan ahli. KONTEKS: Anda sedang menganalisis data keuangan pengguna untuk periode "${dateRangeLabel}". DATA PENGGUNA (JSON): ${JSON.stringify(dataSummary, null, 2)} TUGAS: Hasilkan 5-7 poin insight yang paling relevan. Fokus pada tren, anomali, perbandingan dengan anggaran, dan progres target. FORMAT OUTPUT WAJIB: Array JSON yang valid dengan struktur { "text": "Insight dalam Bahasa Indonesia. Gunakan <strong> untuk menyorot.", "icon": "Nama ikon", "color": "Kelas warna Tailwind" }. DAFTAR YANG DIIZINKAN: icon: "CheckCircleIcon", "TrendingUpIcon", "TrendingDownIcon", "PercentIcon", "ReceiptIcon", "LightbulbIcon", "TargetIcon". color: "text-green-500", "text-red-500", "text-yellow-500", "text-blue-500", "text-indigo-500", "text-teal-500", "text-primary-500".`;
                const responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, icon: { type: Type.STRING }, color: { type: Type.STRING } }, required: ['text', 'icon', 'color'] } };
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema } });
                const insightsResult = JSON.parse(response.text.trim());
                setAiInsights(insightsResult);
                localStorage.setItem(cacheKey, JSON.stringify({ timestamp: new Date().getTime(), insights: insightsResult }));
            } catch (error) { console.error("Error fetching AI insights:", error); setAiError("Gagal memuat insight. Pastikan API Key Anda valid."); } finally { setIsLoadingInsights(false); }
        };
        fetchAIInsights();
    }, [filteredTransactions, dateRangeLabel, goals, budgets, apiKey]);

    const periodSummary = useMemo(() => { const i = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0); const e = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0); return { totalIncome: i, totalExpense: e, balance: i - e }; }, [filteredTransactions]);
    const totalAssets = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
    const chartData = useMemo(() => { const data: { [key: string]: any } = {}; filteredTransactions.forEach(t => { const key = new Date(t.date).toLocaleDateString('id-ID',{month:'short',year:'numeric'}); if (!data[key]) data[key] = { name: key, Pemasukan: 0, Pengeluaran: 0, Tabungan: 0, Utang: 0 }; if (t.type === 'income') data[key].Pemasukan += t.amount; else { if (t.category === 'Investasi/Tabungan') data[key].Tabungan += t.amount; else if (t.category === 'Utang') data[key].Utang += t.amount; else data[key].Pengeluaran += t.amount; } }); return Object.values(data).sort((a,b) => new Date(a.name.replace(/(\w+)\s(\d+)/, '$1 1, $2')).getTime() - new Date(b.name.replace(/(\w+)\s(\d+)/, '$1 1, $2')).getTime()); }, [filteredTransactions]);
    const tickColor = colorScheme === 'dark' ? '#94a3b8' : '#64748b';
    const iconMap = { CheckCircleIcon, TrendingUpIcon, TrendingDownIcon, PercentIcon, ReceiptIcon, LightbulbIcon, TargetIcon };
    
    return (
        <div className="space-y-6 pb-16 md:pb-0">
            {notifications && notifications.length > 0 && <div className="space-y-2">{notifications.map(n => <div key={n.id} role="alert" className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md flex justify-between items-center dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-600"><div className="flex items-center"><InfoIcon className="h-5 w-5 mr-3 flex-shrink-0"/><p className="text-sm font-medium">{n.message}</p></div><button onClick={() => dismissNotification(n.id)} aria-label="Tutup notifikasi" className="p-1 -mr-2 -my-2 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50"><XIcon className="h-5 w-5" /></button></div>)}</div>}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dasbor Keuangan</h1><div className="flex items-center gap-2 self-start sm:self-center"><label htmlFor="chart-filter" className="text-sm text-slate-600 dark:text-slate-400">Tampilkan:</label><select id="chart-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm focus:ring-primary-500 focus:border-primary-500"><option>Bulan Ini</option><option>3 Bulan Terakhir</option><option>6 Bulan Terakhir</option><option>1 Tahun Terakhir</option></select></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><Card><h3 className="text-slate-500 dark:text-slate-400">Pemasukan ({dateRangeLabel})</h3><p className="text-2xl font-semibold text-green-500">{formatCurrency(periodSummary.totalIncome)}</p></Card><Card><h3 className="text-slate-500 dark:text-slate-400">Pengeluaran ({dateRangeLabel})</h3><p className="text-2xl font-semibold text-red-500">{formatCurrency(periodSummary.totalExpense)}</p></Card><Card><h3 className="text-slate-500 dark:text-slate-400">Uang Tersisa ({dateRangeLabel})</h3><p className={`text-2xl font-semibold ${periodSummary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>{formatCurrency(periodSummary.balance)}</p></Card><Card><h3 className="text-slate-500 dark:text-slate-400">Total Aset Tunai</h3><p className="text-2xl font-semibold text-indigo-500">{formatCurrency(totalAssets)}</p></Card></div>
            <Card><h2 className="text-xl font-semibold mb-4">Ringkasan Bulanan</h2><div className="w-full h-[350px]">{chartData.length > 0 ? <ResponsiveContainer><BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" /><XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={yAxisFormatter} tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--slate-800))', borderColor: 'hsl(var(--slate-700))', borderRadius: '0.5rem' }} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} formatter={(value: number) => formatCurrency(value)} /><Legend iconType="circle" wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/><Bar dataKey="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} /><Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} /><Bar dataKey="Tabungan" fill="#14b8a6" radius={[4, 4, 0, 0]} /><Bar dataKey="Utang" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex items-center justify-center h-full"><p className="text-slate-500 dark:text-slate-400">Tidak ada data transaksi.</p></div>}</div></Card>
            {apiKey ? <><h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2"><LightbulbIcon className="w-6 h-6 text-primary-500"/>Insight AI ({dateRangeLabel})</h2><Card>{isLoadingInsights ? <div className="space-y-4 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="flex items-start gap-4"><div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"></div></div>)}</div> : aiError ? <p className="text-center text-red-500">{aiError}</p> : aiInsights.length > 0 ? <ul className="space-y-4">{aiInsights.map((insight, index) => { const Icon = iconMap[insight.icon as keyof typeof iconMap] || LightbulbIcon; return (<li key={index} className="flex items-start gap-4"><Icon className={`w-6 h-6 flex-shrink-0 ${insight.color}`} /><p className="text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: insight.text }}></p></li>); })}</ul> : <p className="text-center text-slate-500 dark:text-slate-400">Tidak ada insight.</p>}</Card></> : <StaticInsights allTransactions={transactions} filteredTransactions={filteredTransactions} periodLabel={dateRangeLabel} />}
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2"><TargetIcon className="w-6 h-6 text-primary-500"/>Progres Target Finansial</h2>{goals.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{goals.map(g => <Card key={g.id}><h3 className="font-semibold">{g.name}</h3><div className="flex justify-between items-baseline mt-2 mb-1"><span className="text-sm font-medium text-primary-600 dark:text-primary-400">{formatCurrency(g.currentAmount)}</span><span className="text-xs text-slate-500 dark:text-slate-400">Target: {formatCurrency(g.targetAmount)}</span></div><ProgressBar value={g.currentAmount} max={g.targetAmount} /></Card>)}</div> : <Card><p className="text-center text-slate-500 dark:text-slate-400">Anda belum punya target.</p></Card>}
            {apiKey && <ChatAssistant />}
        </div>
    );
};
