
import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    RotateCcw,
    Heart,
    Sparkles,
    Info,
    ArrowRight,
    Play,
    Timer,
    MessageSquareHeart,
    Star,
    Award,
    Pause,
    X,
    AlertCircle,
    Flame,
    History,
    Trophy,
    CheckSquare,
    Medal,
    Target,
    ShoppingBag,
    Crown,
    Zap,
    Gift
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


function cn(...inputs) {
    return twMerge(clsx(inputs));
}


const App = () => {
    // ESTADOS DE LA APLICACIÓN
    const [view, setView] = useState('home'); // home, quiz, session, sos, stats, shop
    const [userData, setUserData] = useState({
        level: null,
        stars: 0,
        streak: 0,
        sessions: [],
        lastDate: null,
        dailyChecklist: [
            { id: 1, text: "Calentamiento (LectoJuego)", completed: false, value: 5 },
            { id: 2, text: "Leer Cartas del día", completed: false, value: 10 },
            { id: 3, text: "Pregunta de comprensión", completed: false, value: 5 },
            { id: 4, text: "Cierre Afectivo (Abrazo)", completed: false, value: 5 }
        ],
        unlockedItems: [] // Medallas compradas en la tienda
    });


    const [timer, setTimer] = useState(0);
    const [initialTime, setInitialTime] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [celebration, setCelebration] = useState(null);


    // PERSISTENCIA
    useEffect(() => {
        const stored = localStorage.getItem('horaDeLeer_vFinal_Complete');
        if (stored) {
            const parsed = JSON.parse(stored);
            const today = new Date().toDateString();
            if (parsed.lastDate !== today) {
                parsed.dailyChecklist = parsed.dailyChecklist.map(item => ({ ...item, completed: false }));
            }
            setUserData(parsed);
        }
    }, []);


    const updateData = (newData) => {
        const updated = { ...userData, ...newData };
        setUserData(updated);
        localStorage.setItem('horaDeLeer_vFinal_Complete', JSON.stringify(updated));
    };


    // CATÁLOGO DE LA TIENDA
    const shopItems = [
        { id: 'shield', title: 'Escudo Lector', cost: 30, icon: '🛡️', desc: 'Por tu valentía al leer.' },
        { id: 'rocket', title: 'Cohete de Ideas', cost: 60, icon: '🚀', desc: 'Tu mente vuela alto.' },
        { id: 'wizard', title: 'Mago de Palabras', cost: 100, icon: '🧙‍♂️', desc: 'Dominas los sonidos.' },
        { id: 'king', title: 'Trono del Saber', cost: 200, icon: '👑', desc: 'Eres un experto.' },
        { id: 'dragon', title: 'Dragón Sabio', cost: 350, icon: '🐲', desc: 'Poder lector total.' },
        { id: 'unicorn', title: 'Unicornio Mágico', cost: 500, icon: '🦄', desc: 'Lectura con magia.' }
    ];


    const levels = {
        1: { title: "Nivel 1: El Despertar", cards: "01 a 15", guide: "Guía 5", color: "emerald" },
        2: { title: "Nivel 2: Constructores", cards: "16 a 35", guide: "Guía 6", color: "indigo" },
        3: { title: "Nivel 3: Pequeños Oradores", cards: "36 a 50", guide: "Guía 9", color: "rose" }
    };


    // LÓGICA DE CHECKLIST
    const toggleCheckItem = (id) => {
        const item = userData.dailyChecklist.find(i => i.id === id);
        if (!item) return;
        const isCompleting = !item.completed;
        const starDiff = isCompleting ? item.value : -item.value;
        const newChecklist = userData.dailyChecklist.map(i => i.id === id ? { ...i, completed: isCompleting } : i);
        updateData({ dailyChecklist: newChecklist, stars: Math.max(0, userData.stars + starDiff) });
    };


    // LÓGICA DE TIENDA
    const handleBuy = (item) => {
        if (userData.stars >= item.cost && !userData.unlockedItems.includes(item.id)) {
            updateData({
                stars: userData.stars - item.cost,
                unlockedItems: [...userData.unlockedItems, item.id]
            });
            setCelebration(item);
        }
    };


    // TEMPORIZADOR
    useEffect(() => {
        let interval = null;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && isTimerActive) {
            handleSessionComplete();
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);


    const handleSessionComplete = () => {
        setIsTimerActive(false);
        const today = new Date().toDateString();
        const isNewDay = userData.lastDate !== today;
        updateData({
            stars: userData.stars + 15,
            streak: isNewDay ? userData.streak + 1 : userData.streak,
            lastDate: today,
            sessions: [{ date: today, time: initialTime }, ...userData.sessions].slice(0, 5)
        });
    };


    const startSession = (mins) => {
        setTimer(mins * 60);
        setInitialTime(mins * 60);
        setIsTimerActive(true);
        setView('session');
    };


    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFF] font-sans text-slate-900 pb-28 relative overflow-x-hidden">
           
            {/* HEADER SIEMPRE VISIBLE */}
            <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                        <BookOpen className="text-white w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hora de Leer</h1>
                        <p className="text-sm font-black text-slate-800 tracking-tight">Centro de Control</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-amber-400 text-white px-3 py-2 rounded-2xl shadow-lg shadow-amber-100">
                        <Star className="w-4 h-4 fill-white animate-pulse" />
                        <span className="text-xs font-black">{userData.stars}</span>
                    </div>
                </div>
            </header>


            <main className="p-5">


                {/* VISTA HOME */}
                {view === 'home' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       
                        {/* CARD DE DIAGNÓSTICO / ESTADO */}
                        {!userData.level ? (
                            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                                <Sparkles className="absolute -right-2 -top-2 w-20 h-20 opacity-20 rotate-12" />
                                <h2 className="text-2xl font-black leading-tight">¿Por dónde empezamos?</h2>
                                <p className="text-indigo-100 text-sm mt-2 mb-6 opacity-80">Detecta el nivel ideal para tu hijo hoy.</p>
                                <button onClick={() => setView('quiz')} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Comenzar Diagnóstico</button>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Plan de hoy</span>
                                    <h2 className="text-lg font-black text-slate-800">{levels[userData.level].title}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 italic">Cartas {levels[userData.level].cards} • {levels[userData.level].guide}</p>
                                </div>
                                <button onClick={() => setView('quiz')} className="p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-indigo-600 transition-colors"><RotateCcw className="w-4 h-4" /></button>
                            </div>
                        )}


                        {/* LISTA DE VERIFICACIÓN */}
                        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <CheckSquare className="w-4 h-4 text-indigo-500" /> Metas de hoy
                            </h3>
                            <div className="space-y-2.5">
                                {userData.dailyChecklist.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleCheckItem(item.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]",
                                            item.completed ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                item.completed ? "bg-emerald-500 text-white" : "border-2 border-slate-100"
                                            )}>
                                                {item.completed && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                            <span className={cn("text-xs font-bold", item.completed ? "text-emerald-700 opacity-50 line-through" : "text-slate-600")}>
                                                {item.text}
                                            </span>
                                        </div>
                                        <div className={cn("text-[9px] font-black px-2 py-1 rounded-lg", item.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-500")}>
                                            {item.completed ? "GANADO" : `+${item.value} ⭐`}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* PLANES EXPRESS (ACTUALIZADO CON 3 CONTADORES) */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Plan de Lectura Express</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => startSession(5)} className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg text-center relative overflow-hidden group transition-all active:scale-95">
                                    <Timer className="w-5 h-5 mb-1.5 opacity-40 mx-auto" />
                                    <p className="text-[11px] font-black uppercase leading-tight">5 Min</p>
                                    <p className="text-[8px] font-bold text-indigo-200 mt-1">+15 ⭐</p>
                                </button>
                                <button onClick={() => startSession(10)} className="bg-indigo-700 p-4 rounded-3xl text-white shadow-lg text-center relative overflow-hidden group transition-all active:scale-95">
                                    <Timer className="w-5 h-5 mb-1.5 opacity-40 mx-auto" />
                                    <p className="text-[11px] font-black uppercase leading-tight">10 Min</p>
                                    <p className="text-[8px] font-bold text-indigo-200 mt-1">+15 ⭐</p>
                                </button>
                                <button onClick={() => startSession(15)} className="bg-indigo-800 p-4 rounded-3xl text-white shadow-lg text-center relative overflow-hidden group transition-all active:scale-95">
                                    <Timer className="w-5 h-5 mb-1.5 opacity-40 mx-auto" />
                                    <p className="text-[11px] font-black uppercase leading-tight">15 Min</p>
                                    <p className="text-[8px] font-bold text-indigo-200 mt-1">+15 ⭐</p>
                                </button>
                            </div>
                        </div>


                        {/* SOS BOTÓN */}
                        <button onClick={() => setView('sos')} className="w-full bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center justify-between group transition-all active:scale-95">
                            <div className="flex items-center gap-4 text-left">
                                <AlertCircle className="w-6 h-6 text-rose-500 group-hover:rotate-12 transition-transform" />
                                <div>
                                    <p className="text-sm font-black text-rose-900 leading-none mb-1">SOS Calma</p>
                                    <p className="text-[10px] font-bold text-rose-400 uppercase">Ayuda rápida</p>
                                </div>
                            </div>
                            <ChevronRight className="text-rose-300 w-5 h-5" />
                        </button>
                    </div>
                )}


                {/* VISTA QUIZ */}
                {view === 'quiz' && (
                    <div className="animate-in fade-in duration-500 space-y-8 py-10 text-center">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-slate-800 px-6 leading-tight">
                                {quizStep === 0 && "¿Reconoce el sonido de todas las vocales?"}
                                {quizStep === 1 && "¿Une dos sonidos para formar una sílaba?"}
                                {quizStep === 2 && "¿Puede leer palabras de 2 sílabas solo?"}
                            </h2>
                        </div>
                        <div className="grid gap-4 px-4">
                            {[1, 0].map(val => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        const newAnswers = [...quizAnswers, val];
                                        if (quizStep < 2) { setQuizStep(quizStep+1); setQuizAnswers(newAnswers); }
                                        else {
                                            const score = newAnswers.reduce((a,b)=>a+b, 0);
                                            updateData({ level: score <= 1 ? 1 : score === 2 ? 2 : 3 });
                                            setQuizStep(0); setQuizAnswers([]); setView('home');
                                        }
                                    }}
                                    className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] font-black text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                                >
                                    {val === 1 ? "¡Sí, lo hace!" : "Aún le cuesta"}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => {setView('home'); setQuizStep(0);}} className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cancelar</button>
                    </div>
                )}


                {/* VISTA TIENDA (SHOP) */}
                {view === 'shop' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Tienda de Medallas</h2>
                            <p className="text-xs font-bold text-slate-400">Canjea tus estrellas por premios para tu pequeño</p>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            {shopItems.map(item => {
                                const owned = userData.unlockedItems.includes(item.id);
                                const canAfford = userData.stars >= item.cost;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleBuy(item)}
                                        disabled={owned || !canAfford}
                                        className={cn(
                                            "p-6 rounded-[2.5rem] border-2 text-center transition-all relative group flex flex-col items-center",
                                            owned ? "bg-slate-50 border-slate-100 grayscale cursor-not-allowed" :
                                            canAfford ? "bg-white border-slate-100 hover:border-indigo-500 shadow-sm active:scale-95" :
                                            "bg-white border-slate-50 opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <p className="text-[10px] font-black uppercase text-slate-800 mb-1 leading-none">{item.title}</p>
                                        <div className={cn("text-[10px] font-black py-1 px-3 rounded-full mt-2", owned ? "bg-slate-200 text-slate-500" : "bg-amber-100 text-amber-600")}>
                                            {owned ? "CANJEADO" : `${item.cost} ⭐`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}


                {/* VISTA LOGROS (STATS) */}
                {view === 'stats' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Cofre de Logros</h2>
                            <p className="text-xs font-bold text-slate-400">Tu colección de medallas mágicas</p>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                                <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-2" />
                                <p className="text-3xl font-black text-slate-800">{userData.stars}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Estrellas</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                                <Flame className="w-8 h-8 text-orange-500 fill-orange-500 mx-auto mb-2" />
                                <p className="text-3xl font-black text-slate-800">{userData.streak}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Días Seguidos</p>
                            </div>
                        </div>


                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Trophy className="w-4 h-4 text-amber-500" /> Mi Galería Personal
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {shopItems.filter(i => userData.unlockedItems.includes(i.id)).length === 0 ? (
                                    <div className="col-span-3 py-10 text-center space-y-3">
                                        <Medal className="w-10 h-10 text-slate-100 mx-auto" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Aún no tienes medallas.<br/>¡Ve a la tienda!</p>
                                        <button onClick={() => setView('shop')} className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full uppercase">Ir a comprar</button>
                                    </div>
                                ) : (
                                    shopItems.map(item => {
                                        const isOwned = userData.unlockedItems.includes(item.id);
                                        if (!isOwned) return null;
                                        return (
                                            <div key={item.id} className="aspect-square rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center p-2 text-center animate-in zoom-in-50">
                                                <span className="text-3xl mb-1">{item.icon}</span>
                                                <span className="text-[8px] font-black uppercase text-indigo-700 leading-none">{item.title}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* VISTA SESIÓN ACTIVA */}
                {view === 'session' && (
                    <div className="animate-in zoom-in-95 duration-500 text-center space-y-12 py-10">
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-64 h-64 transform -rotate-90">
                                <circle cx="128" cy="128" r="110" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                                <circle cx="128" cy="128" r="110" stroke="#4F46E5" strokeWidth="10" fill="transparent"
                                    strokeDasharray={691} strokeDashoffset={691 - (691 * timer) / initialTime}
                                    strokeLinecap="round" className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                            <div className="absolute flex flex-col">
                                <span className="text-6xl font-black text-slate-800 tabular-nums">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}</span>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">Lectura con Amor</span>
                            </div>
                        </div>
                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl mx-4">
                            <p className="text-sm font-bold italic leading-relaxed">
                                {timer > 0 ? "Cada palabra es un escalón más en su confianza. Sonríe." : "¡SESIÓN TERMINADA! Recoge tus 15 estrellas."}
                            </p>
                        </div>
                        <div className="px-6 space-y-4">
                            {timer === 0 ? (
                                <button onClick={() => setView('home')} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl animate-bounce uppercase">¡RECIBIR 15 ESTRELLAS! ⭐</button>
                            ) : (
                                <button onClick={() => setIsTimerActive(!isTimerActive)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black">
                                    {isTimerActive ? "Pausar para un abrazo" : "Continuar"}
                                </button>
                            )}
                        </div>
                    </div>
                )}


                {/* VISTA SOS */}
                {view === 'sos' && (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="bg-rose-500 p-2.5 rounded-xl text-white shadow-lg">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Primeros Auxilios</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { t: "No quiere empezar", d: "No pelees. Usa el 'LectoJuego Sinfonía'. Si hoy no es el día, descansen. El vínculo es más importante que la letra." },
                                { t: "Se frustra y llora", d: "Detente. Un abrazo de 10 segundos libera calma. Dile: 'Tú eres capaz, solo estamos practicando'." },
                                { t: "Se distrae mucho", d: "Reduce el tiempo a solo 2 minutos. Menos presión, más éxito." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
                                    <p className="font-black text-rose-600 text-[10px] uppercase tracking-widest">{item.t}</p>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setView('home')} className="w-full py-4 text-slate-400 font-bold text-xs uppercase">Volver al panel</button>
                    </div>
                )}


            </main>


            {/* CELEBRACIÓN DE COMPRA (MODAL) */}
            {celebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in zoom-in-95">
                    <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md" onClick={() => setCelebration(null)} />
                    <div className="text-center relative z-10 space-y-8">
                        <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                            <span className="text-7xl">{celebration.icon}</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">¡LO CONSEGUISTE!</h2>
                            <p className="text-indigo-100 font-bold text-lg">{celebration.title} desbloqueado</p>
                        </div>
                        <button onClick={() => { setCelebration(null); setView('stats'); }} className="bg-white text-indigo-600 px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Ver mi Colección</button>
                    </div>
                </div>
            )}


            {/* NAVEGACIÓN INFERIOR (ESTRICTA Y ACCESIBLE) */}
            <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-4 flex justify-around items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <button onClick={() => setView('home')} className={cn("flex flex-col items-center gap-1.5 transition-all", (view === 'home' || view === 'quiz') ? "text-indigo-600 scale-110" : "text-slate-300")}>
                    <BookOpen className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Plan</span>
                </button>
                <button onClick={() => setView('shop')} className={cn("flex flex-col items-center gap-1.5 transition-all", view === 'shop' ? "text-amber-500 scale-110" : "text-slate-300")}>
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Tienda</span>
                </button>
                <button onClick={() => setView('stats')} className={cn("flex flex-col items-center gap-1.5 transition-all", view === 'stats' ? "text-indigo-600 scale-110" : "text-slate-300")}>
                    <Trophy className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Cofre</span>
                </button>
                <button onClick={() => setView('sos')} className={cn("flex flex-col items-center gap-1.5 transition-all", view === 'sos' ? "text-rose-600 scale-110" : "text-slate-300")}>
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Ayuda</span>
                </button>
            </nav>
        </div>
    );
};


export default App;

