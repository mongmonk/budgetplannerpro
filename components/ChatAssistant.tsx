import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Chat } from "@google/genai";
import { useAppContext } from '../App';
import { Card, Button, BotMessageSquareIcon, SendIcon } from './ui';

export const ChatAssistant: React.FC = () => {
    const { state } = useAppContext();
    const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const appName = 'Financial Planner Pro';

    const systemInstruction = `
        Anda adalah asisten AI 'Keuanganku', yang ramah, membantu, dan ahli dalam keuangan pribadi serta fitur aplikasi ini. Jawablah pertanyaan pengguna dalam Bahasa Indonesia.

        Berikut adalah deskripsi fitur aplikasi '${appName}':
        1. Dasbor: Halaman utama yang menampilkan ringkasan keuangan (Pemasukan, Pengeluaran) sesuai filter waktu, grafik bulanan, insight AI, dan chat ini.
        2. Transaksi: Tempat untuk melihat semua riwayat transaksi. Pengguna bisa menambah transaksi baru (pemasukan/pengeluaran) dan memfilternya.
        3. Laporan: Menampilkan rincian keuangan per bulan, termasuk alokasi pengeluaran (pie chart) dan perbandingan pengeluaran dengan anggaran yang ditetapkan.
        4. Pengaturan: Pusat kustomisasi. Pengguna dapat menambah/menghapus: Kategori Pemasukan/Pengeluaran, Anggaran bulanan per kategori, Target Finansial (misal: dana darurat), Tagihan rutin, dan Utang/Cicilan.

        Gunakan pengetahuan tentang fitur aplikasi dan data keuangan pengguna untuk menjawab pertanyaan. Jika ditanya tentang cara melakukan sesuatu, berikan instruksi langkah-demi-langkah yang mengacu pada nama fitur dan halaman yang benar. Jika ditanya tentang data keuangan mereka, analisis data yang diberikan untuk memberikan jawaban yang akurat.
        Data Keuangan Pengguna Saat Ini: ${JSON.stringify({ transactions: state.transactions.slice(0, 50), goals: state.goals, budgets: state.budgets, debts: state.debts })}
    `;

    const parseMarkdown = (text: string) => {
        let html = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\n/g, '<br />');
        return html;
    };

    useEffect(() => {
        const initChat = async () => {
            if (!state.apiKey) return;
            try {
                const ai = new GoogleGenAI({ apiKey: state.apiKey as string });
                chatRef.current = ai.chats.create({ 
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemInstruction,
                    },
                });
                setMessages([{ role: 'model', content: "Halo! Saya asisten keuangan Anda. Tanyakan apa saja tentang keuangan atau fitur aplikasi ini." }]);
            } catch (error) {
                console.error("Gagal menginisialisasi chat:", error);
                 setMessages([{ role: 'model', content: "Maaf, saya sedang mengalami masalah. Pastikan API Key Anda valid." }]);
            }
        };
        initChat();
    }, [state.apiKey]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (isLoading || !textToSend.trim()) return;

        setIsLoading(true);
        const newUserMessage = { role: 'user' as const, content: textToSend };
        setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);
        setInput('');

        if (!chatRef.current) {
             setMessages(prev => [...prev.slice(0,-1), { role: 'model', content: "Chat tidak terinisialisasi." }]);
             setIsLoading(false);
             return;
        }

        try {
            const response = await chatRef.current.sendMessageStream({ message: textToSend });
            
            for await (const chunk of response) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        const updatedMessage = { ...lastMessage, content: lastMessage.content + chunkText };
                        return [...prev.slice(0, -1), updatedMessage];
                    }
                    return prev;
                });
            }

        } catch (error) {
            console.error("Gagal mengirim pesan:", error);
            setMessages(prev => [...prev.slice(0,-1), { role: 'model', content: "Maaf, terjadi kesalahan. Silakan coba lagi." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const suggestedQuestions = [
        "Berapa total pengeluaran saya bulan ini?",
        "Bagaimana cara menambahkan target finansial baru?",
        "Beri saya tips untuk menghemat uang.",
    ];

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BotMessageSquareIcon className="w-6 h-6 text-primary-500"/>
                Asisten AI Keuangan
            </h2>
            <Card className="p-0">
                <div ref={chatContainerRef} className="h-80 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <BotMessageSquareIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />}
                            <div className={`max-w-md px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}></p>
                                {isLoading && index === messages.length - 1 && <span className="inline-block w-2 h-2 ml-1 bg-current rounded-full animate-pulse"></span>}
                            </div>
                        </div>
                    ))}
                    {messages.length <= 1 && (
                        <div className="pt-4">
                            <p className="text-sm text-center text-slate-500 mb-4">Atau coba tanyakan:</p>
                             <div className="flex flex-wrap justify-center gap-2">
                                {suggestedQuestions.map(q => (
                                    <button key={q} onClick={() => handleSendMessage(q)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-sm rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50">
                                        "{q}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ketik pertanyaan Anda..."
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-primary-500 focus:border-primary-500"
                            disabled={isLoading}
                        />
                        <Button onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()}>
                            <SendIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
