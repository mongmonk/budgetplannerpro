import React, { useState, useEffect, createContext, useContext, useMemo, useRef } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import type { Page, AppState, Transaction, AppNotification, AppLayout, AppFont, AccentColor } from './types';
import { Login } from './components/Login';
import { Activation } from './components/Activation';
import { Header, Modal } from './components/ui';
import { AddTransactionForm, Transactions } from './components/Transactions';
import { HelpModal } from './components/HelpModal';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { AppLogo } from './components/ui';
import { MobileNav } from './components/mobile/MobileUI';
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { MobileAssets } from './components/mobile/MobileAssets';
import { MobileAnalysis } from './components/mobile/MobileAnalysis';
import { MobileGoals } from './components/mobile/MobileGoals';
import { MobileSettings } from './components/mobile/MobileSettings';
import { MobileTransactions } from './components/mobile/MobileTransactions';
import { ChatAssistant } from './components/ChatAssistant';

const defaultCategories: { income: any[]; expense: any[] } = {
    income: [{ id: 'inc-1', name: 'Gaji', type: 'income' }, { id: 'inc-2', name: 'Bonus', type: 'income' }, { id: 'inc-3', name: 'Lainnya', type: 'income' }],
    expense: [{ id: 'exp-1', name: 'Makanan & Minuman', type: 'expense' },{ id: 'exp-2', name: 'Transportasi', type: 'expense' },{ id: 'exp-3', name: 'Hiburan', type: 'expense' },{ id: 'exp-4', name: 'Belanja', type: 'expense' },{ id: 'exp-5', name: 'Kesehatan', type: 'expense' }]
};
const initialAppState: AppState = {
    isAuthenticated: false, transactions: [], categories: [...defaultCategories.income, ...defaultCategories.expense], budgets: [], goals: [], bills: [], debts: [], apiKey: null, notifications: [],
};

type ColorScheme = 'light' | 'dark';

const AppContext = createContext<{
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    isTransactionModalOpen: boolean;
    setIsTransactionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingTransaction: Transaction | null;
    setEditingTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
    isHelpModalOpen: boolean;
    setIsHelpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    activeLayout: AppLayout;
    activeFont: AppFont;
    activeAccent: AccentColor;
    colorScheme: ColorScheme;
    setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
    updateUserSettings: (settings: { apiKey?: string | null, layout?: AppLayout, font?: AppFont, accentColor?: AccentColor, colorScheme?: ColorScheme }) => Promise<void>;
}>({ 
    state: initialAppState, 
    setState: () => {}, 
    isTransactionModalOpen: false, 
    setIsTransactionModalOpen: () => {}, 
    editingTransaction: null, 
    setEditingTransaction: () => {}, 
    isHelpModalOpen: false, 
    setIsHelpModalOpen: () => {}, 
    activeLayout: 'classic', 
    activeFont: 'inter', 
    activeAccent: 'blue', 
    colorScheme: 'light', 
    setColorScheme: () => {}, 
    updateUserSettings: async () => {},
});

export const useAppContext = () => useContext(AppContext);

export const App: React.FC = () => {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [page, setPage] = useState<Page>('dashboard');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isAccountActive, setIsAccountActive] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeLayout, setActiveLayout] = useState<AppLayout>('classic');
    const [activeFont, setActiveFont] = useState<AppFont>('inter');
    const [activeAccent, setActiveAccent] = useState<AccentColor>('blue');
    const [appState, setAppState] = useState<AppState>(() => { const stored = localStorage.getItem('appNotifications'); return { ...initialAppState, notifications: stored ? JSON.parse(stored) : [] }; });
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            setLoadingAuth(true); setIsCheckingStatus(true);
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'artifacts', 'finance-planner-pro', 'users', currentUser.uid);
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data() as any;
                        if (userData.isActivated) {
                            setIsAccountActive(true);
                            setActiveLayout(userData.layout || 'classic'); setActiveFont(userData.font || 'inter'); setActiveAccent(userData.accentColor || 'blue'); setColorScheme(userData.colorScheme || 'light');
                            setIsLoadingData(true);
                            const appDataRef = doc(db, 'artifacts', 'finance-planner-pro', 'users', currentUser.uid, 'data', 'appState');
                            const appDataSnap = await getDoc(appDataRef);
                            if (appDataSnap.exists()) {
                                const appData = appDataSnap.data() as any;
                                if (appData.goals && Array.isArray(appData.goals)) appData.goals = appData.goals.map((g: any) => ({ ...g, currentAmount: g.currentAmount || 0 }));
                                if (appData.debts && Array.isArray(appData.debts)) appData.debts = appData.debts.map((d: any) => ({ ...d, paidAmount: d.paidAmount || 0 }));
                                setAppState(prev => ({ ...prev, ...appData, apiKey: userData.apiKey || null }));
                            } else {
                                const initialState = { ...initialAppState, apiKey: userData.apiKey || null };
                                delete (initialState as any).notifications; await setDoc(appDataRef, initialState);
                                setAppState(prev => ({...prev, ...initialState}));
                            }
                             setIsLoadingData(false);
                        } else { setIsAccountActive(false); setIsLoadingData(false); }
                    } else {
                        setIsAccountActive(false);
                        await setDoc(userDocRef, { isActivated: false, email: currentUser.email, apiKey: null, layout: 'classic', font: 'inter', accentColor: 'blue', colorScheme: 'light' });
                        setIsLoadingData(false);
                    }
                } catch (error) { console.error("Activation check failed:", error); setIsAccountActive(false); setIsLoadingData(false); }
            } else { setUser(null); setIsAccountActive(false); setAppState(initialAppState); setIsLoadingData(false); }
            setLoadingAuth(false); setIsCheckingStatus(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.className = ''; // Clear all classes
        root.classList.add(`theme-${activeLayout}`, `font-${activeFont}`, `accent-${activeAccent}`);
        if (colorScheme === 'dark') root.classList.add('dark');
    }, [activeLayout, activeFont, activeAccent, colorScheme]);
    
    useEffect(() => {
        if (isInitialMount.current || !user || isLoadingData || loadingAuth) { isInitialMount.current = false; return; }
        const { notifications, apiKey, ...stateToSave } = appState;
        setDoc(doc(db, 'artifacts', 'finance-planner-pro', 'users', user.uid, 'data', 'appState'), stateToSave).catch(err => console.error("Firestore save failed:", err));
    }, [appState, user, isLoadingData, loadingAuth]);

    useEffect(() => localStorage.setItem('appNotifications', JSON.stringify(appState.notifications)), [appState.notifications]);

    useEffect(() => {
        const checkBills = () => {
            const lastCheck = localStorage.getItem('lastBillCheck'); const today = new Date().toISOString().split('T')[0]; if (lastCheck === today) return;
            const now = new Date(); const day = now.getDate(); const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const upcoming = appState.bills.filter(b => { let diff = b.dueDate - day; if (diff < 0) diff += daysInMonth; return diff >= 0 && diff <= 3; });
            if (upcoming.length === 0) { localStorage.setItem('lastBillCheck', today); return; }
            const newNotifs: AppNotification[] = upcoming.map(b => ({ id: `bill-${b.id}-${today}`, message: b.dueDate - day === 0 ? `Tagihan '${b.name}' jatuh tempo HARI INI.` : `Tagihan '${b.name}' akan jatuh tempo dalam ${b.dueDate - day} hari.`, type: 'warning' }));
            setAppState(prev => { const existing = new Set(prev.notifications.map(n => n.id)); const filtered = newNotifs.filter(n => !existing.has(n.id)); if (filtered.length === 0) return prev; return { ...prev, notifications: [...prev.notifications, ...filtered] }; });
            localStorage.setItem('lastBillCheck', today);
        };
        if (user && isAccountActive && appState.bills.length > 0) checkBills();
    }, [user, isAccountActive, appState.bills]);

    const handleLogout = async () => { try { await signOut(auth); } catch (e) { console.error("Logout failed:", e); } };
    const updateUserSettings = async (settings: any) => { if (!user) return; try { await setDoc(doc(db, 'artifacts', 'finance-planner-pro', 'users', user.uid), settings, { merge: true }); if (settings.apiKey !== undefined) setAppState(prev => ({...prev, apiKey: settings.apiKey })); if (settings.layout) setActiveLayout(settings.layout); if (settings.font) setActiveFont(settings.font); if (settings.accentColor) setActiveAccent(settings.accentColor); if (settings.colorScheme) setColorScheme(settings.colorScheme); } catch (e) { console.error("Settings update failed:", e); alert("Gagal menyimpan pengaturan."); } };
    const contextValue = useMemo(() => ({ state: appState, setState: setAppState, isTransactionModalOpen, setIsTransactionModalOpen, editingTransaction, setEditingTransaction, isHelpModalOpen, setIsHelpModalOpen, activeLayout, activeFont, activeAccent, colorScheme, setColorScheme, updateUserSettings }), [appState, isTransactionModalOpen, editingTransaction, isHelpModalOpen, activeLayout, activeFont, activeAccent, colorScheme]);

    if (loadingAuth || isCheckingStatus || isLoadingData) {
        return <div className="flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900"><div className="flex flex-col items-center gap-4 text-center"><AppLogo className="h-24 w-24 animate-pulse-zoom" /><p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Budget Planner</p><p className="text-slate-500 dark:text-slate-400">Memuat data Anda...</p></div></div>;
    }
    if (!user) return <Login />;
    if (!isAccountActive) return <Activation user={user} onSuccess={() => setIsAccountActive(true)} />;

    const closeTransactionModal = () => { setIsTransactionModalOpen(false); setEditingTransaction(null); };
    const renderPage = () => {
        if (isMobile) {
            switch (page) {
                case 'dashboard': return (
                    <div className="space-y-6">
                        <MobileDashboard />
                        {appState.apiKey && <div className="px-6 pb-32"><ChatAssistant /></div>}
                    </div>
                );
                case 'transactions': return <MobileAssets />;
                case 'reports': return <MobileAnalysis />;
                case 'settings': return <MobileSettings onLogout={handleLogout} user={user} />;
                default: return <MobileDashboard />;
            }
        }
        switch (page) {
            case 'dashboard': return <Dashboard />;
            case 'transactions': return <Transactions />;
            case 'reports': return <Reports />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
                {!isMobile && <Header currentPage={page} setPage={setPage} onLogout={handleLogout} user={user} />}
                <main className={isMobile ? "" : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"}>{renderPage()}</main>
                {isMobile && <MobileNav currentPage={page} setPage={setPage} />}
                <Modal isOpen={isTransactionModalOpen} onClose={closeTransactionModal} title={editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}><AddTransactionForm onClose={closeTransactionModal} /></Modal>
                <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
            </div>
        </AppContext.Provider>
    );
};
