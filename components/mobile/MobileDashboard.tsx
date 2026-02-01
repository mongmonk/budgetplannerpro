import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from '../../App';
import { Transaction, formatCurrency } from '../../types';
import { MobileHeader, MobileCard } from './MobileUI';
import { InfoIcon, XIcon, LightbulbIcon, CheckCircleIcon, TrendingUpIcon, TrendingDownIcon, PercentIcon, ReceiptIcon, TargetIcon, Card, ProgressBar } from '../ui';
import { ChatAssistant } from '../ChatAssistant';

const StaticInsights: React.FC<{ allTransactions: Transaction[], filteredTransactions: Transaction[], periodLabel: string }> = ({ allTransactions, filteredTransactions, periodLabel }) => {
    const { totalIncome, totalExpense, largestIncome, largestExpense, dailyAvgExpense } = useMemo(() => {
        const i = filteredTransactions.filter(t => t.type === 'income');
        const e = filteredTransactions.filter(t => t.type === 'expense');
        return {
            totalIncome: i.reduce((s, t) => s + t.amount, 0),
            totalExpense: e.reduce((s, t) => s + t.amount, 0),
            largestIncome: i.sort((a,b) => b.amount - a.amount)[0],
            largestExpense: e.sort((a,b) => b.amount - a.amount)[0],
            dailyAvgExpense: new Set(e.map(t=>new Date(t.date).toDateString())).size > 0 ? e.reduce((s, t) => s + t.amount, 0) / new Set(e.map(t=>new Date(t.date).toDateString())).size : 0
        };
    }, [filteredTransactions]);
    
    const savingsRatio = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const isHealthy = savingsRatio >= 10;
    
    const taxAndZakatInsights = useMemo(() => {
        const insights:any[] = []; const now = new Date();
        if (now.getMonth() >= 0 && now.getMonth() <= 2) insights.push({ icon: ReceiptIcon, color: 'text-cyan-500', text: `Ini periode pelaporan <strong>SPT Tahunan</strong>. Lapor sebelum 31 Maret!` });
        const recentIncome = allTransactions.filter(t => t.type === 'income' && new Date(t.date) >= new Date(now.getFullYear(), now.getMonth() - 2, 1));
        if (recentIncome.length > 0) {
            const totalRecent = recentIncome.reduce((s, t) => s + t.amount, 0);
            const months = new Set(recentIncome.map(t => `${new Date(t.date).getFullYear()}-${new Date(t.date).getMonth()}`)).size;
            const avgMonthly = totalRecent / (months > 0 ? months : 1);
            const estAnnual = avgMonthly * 12;
            if (estAnnual >= 85 * 1050000) insights.push({ icon: CheckCircleIcon, color: 'text-teal-500', text: `Berdasarkan estimasi pendapatan, Anda mungkin wajib <strong>Zakat Profesi</strong>. Cek di Laporan.` });
        }
        return insights;
    }, [allTransactions]);

    const allInsights = [
        { icon: CheckCircleIcon, color: isHealthy ? 'text-green-500' : 'text-yellow-500', text: `Status keuangan ${periodLabel}: <strong class="${isHealthy ? 'text-green-500' : 'text-yellow-500'}">${isHealthy ? 'Sehat' : 'Perlu Perhatian'}</strong>` },
        { icon: TrendingUpIcon, color: 'text-green-500', text: largestIncome ? `Pemasukan terbesar ${periodLabel} pada ${new Date(largestIncome.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})} (${formatCurrency(largestIncome.amount)}).` : `Tidak ada pemasukan ${periodLabel} ini.` },
        { icon: TrendingDownIcon, color: 'text-red-500', text: largestExpense ? `Pengeluaran terbesar ${periodLabel} pada ${new Date(largestExpense.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})} (${formatCurrency(largestExpense.amount)} - ${largestExpense.category}).` : `Tidak ada pengeluaran ${periodLabel} ini.` },
        { icon: PercentIcon, color: 'text-blue-500', text: `Rasio tabungan ${periodLabel} adalah <strong>${savingsRatio.toFixed(1)}%</strong>. ${savingsRatio > 20 ? 'Luar biasa!' : 'Yuk, tingkatkan lagi!'}` },
        { icon: ReceiptIcon, color: 'text-indigo-500', text: `Rata-rata pengeluaran harian ${periodLabel} sekitar <strong>${formatCurrency(dailyAvgExpense)}</strong>.` },
        ...taxAndZakatInsights,
        { icon: LightbulbIcon, color: 'text-primary-500', text: `Masukkan <strong>API KEY Gemini</strong> di Pengaturan untuk insight AI.` }
    ];

    return (
        <MobileCard>
            <ul className="space-y-4">
                {allInsights.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <item.icon className={`w-6 h-6 flex-shrink-0 ${item.color}`} />
                        <p className="text-sm text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: item.text }}></p>
                    </li>
                ))}
            </ul>
        </MobileCard>
    );
};

export const MobileDashboard: React.FC = () => {
    const { state, setState, colorScheme } = useAppContext();
    const { transactions, goals, budgets, apiKey, notifications } = state;
    const [filter, setFilter] = useState('Bulan Ini');
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const yAxisFormatter = (v: number) => {
        if (v === 0) return '0';
        if (v >= 1e6) return `${(v / 1e6).toFixed(1)}Jt`;
        if (v >= 1e3) return `${(v / 1e3).toFixed(0)}Rb`;
        return `${v}`;
    };
    
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

    const periodSummary = useMemo(() => {
        const i = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const e = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { totalIncome: i, totalExpense: e, balance: i - e };
    }, [filteredTransactions]);

    const totalAssets = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);
    
    const chartData = useMemo(() => {
        const data: { [key: string]: any } = {};
        filteredTransactions.forEach(t => {
            const key = new Date(t.date).toLocaleDateString('id-ID',{month:'short',year:'numeric'});
            if (!data[key]) data[key] = { name: key, Pemasukan: 0, Pengeluaran: 0, Tabungan: 0, Utang: 0 };
            if (t.type === 'income') data[key].Pemasukan += t.amount;
            else {
                if (t.category === 'Investasi/Tabungan') data[key].Tabungan += t.amount;
                else if (t.category === 'Utang') data[key].Utang += t.amount;
                else data[key].Pengeluaran += t.amount;
            }
        });
        return Object.values(data).sort((a,b) => new Date(a.name.replace(/(\w+)\s(\d+)/, '$1 1, $2')).getTime() - new Date(b.name.replace(/(\w+)\s(\d+)/, '$1 1, $2')).getTime());
    }, [filteredTransactions]);

    const tickColor = colorScheme === 'dark' ? '#94a3b8' : '#64748b';
    const iconMap = { CheckCircleIcon, TrendingUpIcon, TrendingDownIcon, PercentIcon, ReceiptIcon, LightbulbIcon, TargetIcon };
    
    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
            <MobileHeader title="Dashboard" subtitle="Ringkasan keuangan Anda" />
            
            <div className="px-6 space-y-6 mt-4">
                {notifications && notifications.length > 0 && (
                    <div className="space-y-2">
                        {notifications.map(n => (
                            <div key={n.id} role="alert" className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-xl flex justify-between items-center dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-600 shadow-sm">
                                <div className="flex items-center">
                                    <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0"/>
                                    <p className="text-xs font-medium">{n.message}</p>
                                </div>
                                <button onClick={() => dismissNotification(n.id)} aria-label="Tutup notifikasi" className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50">
                                    <XIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold dark:text-white">Filter Periode</h2>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-sm font-bold shadow-sm focus:ring-primary-500">
                        <option>Bulan Ini</option>
                        <option>3 Bulan Terakhir</option>
                        <option>6 Bulan Terakhir</option>
                        <option>1 Tahun Terakhir</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <MobileCard className="p-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Pemasukan</h3>
                        <p className="text-sm font-bold text-green-500 truncate">{formatCurrency(periodSummary.totalIncome)}</p>
                    </MobileCard>
                    <MobileCard className="p-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Pengeluaran</h3>
                        <p className="text-sm font-bold text-rose-500 truncate">{formatCurrency(periodSummary.totalExpense)}</p>
                    </MobileCard>
                    <MobileCard className="p-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Sisa</h3>
                        <p className={`text-sm font-bold truncate ${periodSummary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>{formatCurrency(periodSummary.balance)}</p>
                    </MobileCard>
                    <MobileCard className="p-4">
                        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Aset</h3>
                        <p className="text-sm font-bold text-indigo-500 truncate">{formatCurrency(totalAssets)}</p>
                    </MobileCard>
                </div>

                <MobileCard>
                    <h2 className="text-lg font-bold mb-4 dark:text-white">Tren Bulanan</h2>
                    <div className="w-full h-[250px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={yAxisFormatter} tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--slate-800))', borderColor: 'hsl(var(--slate-700))', borderRadius: '0.5rem', fontSize: '12px' }} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} formatter={(value: number) => formatCurrency(value)} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
                                    <Bar dataKey="Pemasukan" fill="#22c55e" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Tidak ada data.</p>
                            </div>
                        )}
                    </div>
                </MobileCard>

                {apiKey ? (
                    <>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <LightbulbIcon className="w-6 h-6 text-primary-500"/>Insight AI
                        </h2>
                        <MobileCard>
                            {isLoadingInsights ? (
                                <div className="space-y-4 animate-pulse">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : aiError ? (
                                <p className="text-center text-xs text-red-500">{aiError}</p>
                            ) : aiInsights.length > 0 ? (
                                <ul className="space-y-4">
                                    {aiInsights.map((insight, index) => {
                                        const Icon = iconMap[insight.icon as keyof typeof iconMap] || LightbulbIcon;
                                        return (
                                            <li key={index} className="flex items-start gap-4">
                                                <Icon className={`w-5 h-5 flex-shrink-0 ${insight.color}`} />
                                                <p className="text-sm text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: insight.text }}></p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400">Tidak ada insight.</p>
                            )}
                        </MobileCard>
                    </>
                ) : (
                    <StaticInsights allTransactions={transactions} filteredTransactions={filteredTransactions} periodLabel={dateRangeLabel} />
                )}

                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TargetIcon className="w-6 h-6 text-primary-500"/>Target Finansial
                </h2>
                {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.map(g => (
                            <MobileCard key={g.id}>
                                <h3 className="font-bold text-sm dark:text-white">{g.name}</h3>
                                <div className="flex justify-between items-baseline mt-2 mb-1">
                                    <span className="text-xs font-bold text-primary-500">{formatCurrency(g.currentAmount)}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target: {formatCurrency(g.targetAmount)}</span>
                                </div>
                                <ProgressBar value={g.currentAmount} max={g.targetAmount} />
                            </MobileCard>
                        ))}
                    </div>
                ) : (
                    <MobileCard>
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">Belum ada target.</p>
                    </MobileCard>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold dark:text-white">Transaksi Terbaru</h2>
                        <button className="text-xs font-bold text-primary-500 uppercase tracking-widest">Lihat Semua</button>
                    </div>
                    <div className="space-y-3">
                        {filteredTransactions.slice(0, 5).length > 0 ? filteredTransactions.slice(0, 5).map(t => {
                            const Icon = t.type === 'income' ? TrendingUpIcon : TrendingDownIcon;
                            const colorClass = t.type === 'income' ? 'text-green-500' : 'text-rose-500';
                            const bgColorClass = t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-rose-100 dark:bg-rose-900/30';
                            
                            return (
                                <MobileCard key={t.id} className="p-4 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${bgColorClass} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${colorClass}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold dark:text-white truncate text-sm">{t.description || t.category}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {t.category}
                                        </p>
                                    </div>
                                    <div className={`font-bold text-sm ${colorClass}`}>
                                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </div>
                                </MobileCard>
                            );
                        }) : (
                            <MobileCard>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">Belum ada transaksi.</p>
                            </MobileCard>
                        )}
                    </div>
                </div>
                
                {apiKey && <ChatAssistant />}
            </div>
        </div>
    );
};