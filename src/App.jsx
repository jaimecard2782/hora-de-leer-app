import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Timer,
  Star,
  AlertCircle,
  Flame,
  Trophy,
  CheckSquare,
  Medal,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import hero from './assets/hero.png';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const defaultChecklist = [
  { id: 1, text: 'Calentamiento (LectoJuego)', completed: false, value: 5 },
  { id: 2, text: 'Leer Cartas del día', completed: false, value: 10 },
  { id: 3, text: 'Pregunta de comprensión', completed: false, value: 5 },
  { id: 4, text: 'Cierre Afectivo (Abrazo)', completed: false, value: 5 },
];

const App = () => {
  const [view, setView] = useState('home');
  const [userData, setUserData] = useState({
    level: null,
    stars: 0,
    streak: 0,
    sessions: [],
    lastDate: null,
    dailyChecklist: defaultChecklist,
    unlockedItems: [],
    totalMinutesRead: 0,
    totalCompletedTasks: 0,
    badges: [],
    lastSessionStars: 0,
    historyLog: [],
  });

  const [timer, setTimer] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('horaDeLeer_vFinal_Complete');

    if (stored) {
      const parsed = JSON.parse(stored);
      const today = new Date().toDateString();

      const safeChecklist = parsed.dailyChecklist?.length
        ? parsed.dailyChecklist
        : defaultChecklist;

      const normalizedData = {
        level: parsed.level ?? null,
        stars: parsed.stars ?? 0,
        streak: parsed.streak ?? 0,
        sessions: parsed.sessions ?? [],
        lastDate: parsed.lastDate ?? null,
        dailyChecklist:
          parsed.lastDate !== today
            ? safeChecklist.map((item) => ({ ...item, completed: false }))
            : safeChecklist,
        unlockedItems: parsed.unlockedItems ?? [],
        totalMinutesRead: parsed.totalMinutesRead ?? 0,
        totalCompletedTasks: parsed.totalCompletedTasks ?? 0,
        badges: parsed.badges ?? [],
        lastSessionStars: parsed.lastSessionStars ?? 0,
        historyLog: parsed.historyLog ?? [],
      };

      setUserData(normalizedData);
    }
  }, []);

  const updateData = (newData) => {
    const updated = { ...userData, ...newData };
    setUserData(updated);
    localStorage.setItem('horaDeLeer_vFinal_Complete', JSON.stringify(updated));
  };

  const shopItems = [
    { id: 'shield', title: 'Escudo Lector', cost: 30, icon: '🛡️', desc: 'Por tu valentía al leer.' },
    { id: 'rocket', title: 'Cohete de Ideas', cost: 60, icon: '🚀', desc: 'Tu mente vuela alto.' },
    { id: 'wizard', title: 'Mago de Palabras', cost: 100, icon: '🧙‍♂️', desc: 'Dominas los sonidos.' },
    { id: 'king', title: 'Trono del Saber', cost: 200, icon: '👑', desc: 'Eres un experto.' },
    { id: 'dragon', title: 'Dragón Sabio', cost: 350, icon: '🐲', desc: 'Poder lector total.' },
    { id: 'unicorn', title: 'Unicornio Mágico', cost: 500, icon: '🦄', desc: 'Lectura con magia.' },
  ];

  const levels = {
    1: { title: 'Nivel 1: El Despertar', cards: '01 a 15', guide: 'Guía 5' },
    2: { title: 'Nivel 2: Constructores', cards: '16 a 35', guide: 'Guía 6' },
    3: { title: 'Nivel 3: Pequeños Oradores', cards: '36 a 50', guide: 'Guía 9' },
  };

  const toggleCheckItem = (id) => {
    const item = userData.dailyChecklist.find((i) => i.id === id);
    if (!item) return;

    const isCompleting = !item.completed;
    const starDiff = isCompleting ? item.value : -item.value;
    const taskDiff = isCompleting ? 1 : -1;

    const newChecklist = userData.dailyChecklist.map((i) =>
      i.id === id ? { ...i, completed: isCompleting } : i
    );

    updateData({
      dailyChecklist: newChecklist,
      stars: Math.max(0, userData.stars + starDiff),
      totalCompletedTasks: Math.max(0, userData.totalCompletedTasks + taskDiff),
    });
  };

  const handleBuy = (item) => {
    if (userData.stars >= item.cost && !userData.unlockedItems.includes(item.id)) {
      updateData({
        stars: userData.stars - item.cost,
        unlockedItems: [...userData.unlockedItems, item.id],
      });
      setCelebration(item);
    }
  };

  useEffect(() => {
    let interval = null;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && isTimerActive) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleSessionComplete = () => {
    setIsTimerActive(false);

    const today = new Date().toDateString();
    const isNewDay = userData.lastDate !== today;
    const minutesRead = Math.floor(initialTime / 60);
    const starsEarned = 15;

    const newSession = {
      date: today,
      time: initialTime,
      minutes: minutesRead,
      starsEarned,
    };

    const newHistoryItem = {
      date: today,
      type: 'session',
      minutes: minutesRead,
      starsEarned,
      timestamp: Date.now(),
    };

    updateData({
      stars: userData.stars + starsEarned,
      streak: isNewDay ? userData.streak + 1 : userData.streak,
      lastDate: today,
      lastSessionStars: starsEarned,
      totalMinutesRead: userData.totalMinutesRead + minutesRead,
      sessions: [newSession, ...userData.sessions].slice(0, 10),
      historyLog: [newHistoryItem, ...userData.historyLog].slice(0, 30),
    });
  };

  const startSession = (mins) => {
    setTimer(mins * 60);
    setInitialTime(mins * 60);
    setIsTimerActive(true);
    setView('session');
  };

  const completedToday = userData.dailyChecklist.filter((item) => item.completed).length;
  const totalTasksToday = userData.dailyChecklist.length;
  const progressPercent =
    totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-[#F7F8FF] via-[#FFFDF7] to-[#F7FBFF] font-sans text-slate-900 pb-32 relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-12 left-[-30px] w-40 h-40 rounded-full bg-[#A7D8FF] blur-3xl" />
        <div className="absolute top-48 right-[-20px] w-36 h-36 rounded-full bg-[#FFD65C] blur-3xl" />
        <div className="absolute bottom-24 left-[-10px] w-40 h-40 rounded-full bg-[#B9F0C6] blur-3xl" />
      </div>

      <header className="px-5 pt-5 pb-3 sticky top-0 bg-white/70 backdrop-blur-xl z-40 border-b border-white/60 shadow-[0_8px_30px_rgba(92,84,180,0.08)]">
        <div className="bg-white/90 rounded-[2rem] px-4 py-4 shadow-[0_16px_40px_rgba(93,78,190,0.10)] border border-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#4C9BFF] flex items-center justify-center shadow-[0_12px_24px_rgba(108,99,255,0.35)]">
                <BookOpen className="text-white w-6 h-6" />
              </div>

              <div>
                <h1 className="text-[26px] leading-none font-black tracking-tight text-[#4537C8]">
                  Hora de Leer
                </h1>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  Aprender leyendo también puede ser un juego bonito
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD65C] to-[#FFB84D] text-white px-4 py-3 rounded-[1.3rem] shadow-[0_14px_28px_rgba(255,190,70,0.35)] border border-white/50">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-white" />
                <span className="text-sm font-black">{userData.stars}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 p-5">
        {view === 'home' && (
          <div>
            <div className="mb-6">
              <img
                src={hero}
                alt="Hora de Leer"
                className="w-full rounded-3xl shadow-xl"
              />
            </div>

            <div className="space-y-6">
              {!userData.level ? (
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#6C63FF] via-[#5A76FF] to-[#42A5FF] p-7 shadow-[0_24px_50px_rgba(93,90,255,0.28)] border border-white/30">
                  <div className="absolute -top-5 -right-2 opacity-20">
                    <Sparkles className="w-24 h-24 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-[1.4rem] bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                      <Heart className="w-7 h-7 text-white fill-white/20" />
                    </div>

                    <h2 className="text-3xl font-black leading-tight text-white">
                      ¿Por dónde empezamos?
                    </h2>
                    <p className="text-white/85 text-sm mt-2 mb-6 max-w-[250px]">
                      Descubre el nivel ideal para acompañar a tu hijo con calma, juego y amor.
                    </p>

                    <button
                      onClick={() => setView('quiz')}
                      className="w-full bg-white text-[#5A56E9] py-4 rounded-[1.6rem] font-black text-xs uppercase tracking-[0.2em] shadow-[0_14px_28px_rgba(255,255,255,0.25)] border border-white transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(255,255,255,0.28)]"
                    >
                      Comenzar diagnóstico
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/95 p-6 rounded-[2.4rem] shadow-[0_18px_40px_rgba(108,99,255,0.10)] border border-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#6C63FF] uppercase tracking-[0.25em]">
                        Plan de hoy
                      </span>
                      <h2 className="text-xl font-black text-slate-800">
                        {levels[userData.level].title}
                      </h2>
                      <p className="text-[11px] font-bold text-slate-400">
                        Cartas {levels[userData.level].cards} • {levels[userData.level].guide}
                      </p>
                    </div>

                    <button
                      onClick={() => setView('quiz')}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0EEFF] to-[#E7F3FF] text-[#6C63FF] flex items-center justify-center shadow-md transition-all active:scale-95 hover:-translate-y-0.5"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white/95 p-6 rounded-[2.4rem] shadow-[0_18px_40px_rgba(89,93,167,0.08)] border border-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C7C2FF] to-[#A7D8FF] flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-[#4E48D9]" />
                  </div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.22em]">
                    Progreso del niño
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-slate-600">Progreso de hoy</span>
                      <span className="text-sm font-black text-[#5A56E9]">{progressPercent}%</span>
                    </div>

                    <div className="w-full h-4 bg-[#EEF2FF] rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-[#6C63FF] via-[#4E8DFF] to-[#42D1C8] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-[1.7rem] p-4 bg-gradient-to-br from-[#F0EEFF] to-[#E7E8FF] shadow-sm border border-white">
                      <p className="text-2xl font-black text-[#5246EA]">{userData.totalMinutesRead}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Minutos
                      </p>
                    </div>

                    <div className="rounded-[1.7rem] p-4 bg-gradient-to-br from-[#FFF6D9] to-[#FFF0BD] shadow-sm border border-white">
                      <p className="text-2xl font-black text-[#D88700]">{userData.totalCompletedTasks}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Tareas
                      </p>
                    </div>

                    <div className="rounded-[1.7rem] p-4 bg-gradient-to-br from-[#E6F8EA] to-[#D6F3DE] shadow-sm border border-white">
                      <p className="text-2xl font-black text-[#2DA16C]">{userData.streak}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Racha
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 p-7 rounded-[2.4rem] shadow-[0_18px_40px_rgba(89,93,167,0.08)] border border-white space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFD88C] to-[#FFB86B] flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.22em]">
                    Metas de hoy
                  </h3>
                </div>

                <div className="space-y-3">
                  {userData.dailyChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleCheckItem(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-[1.5rem] border transition-all active:scale-[0.985] hover:-translate-y-0.5',
                        item.completed
                          ? 'bg-gradient-to-r from-[#EAFBF0] to-[#F5FFF8] border-[#CFF0DA] shadow-sm'
                          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                      )}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-xl flex items-center justify-center transition-all',
                            item.completed
                              ? 'bg-gradient-to-br from-[#39B86D] to-[#61D38E] text-white shadow-md'
                              : 'border-2 border-[#E6E9F3] bg-[#FAFBFF]'
                          )}
                        >
                          {item.completed && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <span
                          className={cn(
                            'text-sm font-black',
                            item.completed
                              ? 'text-[#2E8C5A] opacity-70 line-through'
                              : 'text-slate-700'
                          )}
                        >
                          {item.text}
                        </span>
                      </div>

                      <div
                        className={cn(
                          'text-[10px] font-black px-3 py-2 rounded-full shadow-sm',
                          item.completed
                            ? 'bg-[#DDF6E5] text-[#2E8C5A]'
                            : 'bg-gradient-to-r from-[#FFF4C8] to-[#FFE79A] text-[#C48800]'
                        )}
                      >
                        {item.completed ? 'Ganado' : `+${item.value} ⭐`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.22em] px-2">
                  Plan de lectura express
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => startSession(5)}
                    className="rounded-[2rem] p-4 text-white shadow-[0_18px_32px_rgba(108,99,255,0.24)] bg-gradient-to-br from-[#6C63FF] to-[#4C9BFF] transition-all active:scale-95 hover:-translate-y-1"
                  >
                    <Timer className="w-5 h-5 mb-2 opacity-80 mx-auto" />
                    <p className="text-xs font-black uppercase">5 min</p>
                    <p className="text-[10px] font-bold text-white/85 mt-1">+15 ⭐</p>
                  </button>

                  <button
                    onClick={() => startSession(10)}
                    className="rounded-[2rem] p-4 text-white shadow-[0_18px_32px_rgba(255,170,70,0.24)] bg-gradient-to-br from-[#FFB74D] to-[#FF8B5E] transition-all active:scale-95 hover:-translate-y-1"
                  >
                    <Timer className="w-5 h-5 mb-2 opacity-80 mx-auto" />
                    <p className="text-xs font-black uppercase">10 min</p>
                    <p className="text-[10px] font-bold text-white/85 mt-1">+15 ⭐</p>
                  </button>

                  <button
                    onClick={() => startSession(15)}
                    className="rounded-[2rem] p-4 text-white shadow-[0_18px_32px_rgba(60,190,150,0.24)] bg-gradient-to-br from-[#2FCF98] to-[#17A7B8] transition-all active:scale-95 hover:-translate-y-1"
                  >
                    <Timer className="w-5 h-5 mb-2 opacity-80 mx-auto" />
                    <p className="text-xs font-black uppercase">15 min</p>
                    <p className="text-[10px] font-bold text-white/85 mt-1">+15 ⭐</p>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setView('sos')}
                className="w-full rounded-[2rem] bg-gradient-to-r from-[#FFF0F1] to-[#FFE5EA] border border-[#FFD6DE] p-5 flex items-center justify-between transition-all active:scale-[0.985] hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF7D95] to-[#FF5E7D] text-white flex items-center justify-center shadow-[0_12px_24px_rgba(255,105,135,0.24)]">
                    <AlertCircle className="w-6 h-6" />
                  </div>

                  <div>
                    <p className="text-base font-black text-[#A73458] leading-none mb-1">SOS Calma</p>
                    <p className="text-[11px] font-bold text-[#E17693] uppercase tracking-wider">
                      Ayuda rápida cuando se frustra
                    </p>
                  </div>
                </div>

                <ChevronRight className="text-[#E17693] w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {view === 'quiz' && (
          <div className="space-y-8 py-10 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-slate-800 px-4 leading-tight">
                {quizStep === 0 && '¿Reconoce el sonido de todas las vocales?'}
                {quizStep === 1 && '¿Une dos sonidos para formar una sílaba?'}
                {quizStep === 2 && '¿Puede leer palabras de 2 sílabas solo?'}
              </h2>
              <p className="text-sm font-bold text-slate-400">
                Responde con calma y elige la opción que mejor describa a tu hijo.
              </p>
            </div>

            <div className="grid gap-4 px-2">
              {[1, 0].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    const newAnswers = [...quizAnswers, val];

                    if (quizStep < 2) {
                      setQuizStep(quizStep + 1);
                      setQuizAnswers(newAnswers);
                    } else {
                      const score = newAnswers.reduce((a, b) => a + b, 0);
                      updateData({ level: score <= 1 ? 1 : score === 2 ? 2 : 3 });
                      setQuizStep(0);
                      setQuizAnswers([]);
                      setView('home');
                    }
                  }}
                  className="p-6 bg-white rounded-[2rem] font-black text-slate-700 border border-white shadow-[0_16px_36px_rgba(100,106,160,0.10)] hover:-translate-y-1 transition-all active:scale-[0.98]"
                >
                  {val === 1 ? '¡Sí, lo hace!' : 'Aún le cuesta'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setView('home');
                setQuizStep(0);
              }}
              className="text-slate-400 font-black text-xs uppercase tracking-[0.25em]"
            >
              Cancelar
            </button>
          </div>
        )}

        {view === 'shop' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[#4D42D7]">
                Tienda de medallas
              </h2>
              <p className="text-sm font-bold text-slate-400">
                Cambia tus estrellas por premios que hacen más divertido leer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {shopItems.map((item) => {
                const owned = userData.unlockedItems.includes(item.id);
                const canAfford = userData.stars >= item.cost;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleBuy(item)}
                    disabled={owned || !canAfford}
                    className={cn(
                      'rounded-[2rem] p-5 border text-center transition-all relative flex flex-col items-center',
                      owned
                        ? 'bg-slate-50 border-slate-100 grayscale cursor-not-allowed'
                        : canAfford
                        ? 'bg-white border-white shadow-[0_16px_36px_rgba(94,101,160,0.10)] hover:-translate-y-1 active:scale-95'
                        : 'bg-white border-slate-100 opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="text-5xl block mb-3">{item.icon}</span>
                    <p className="text-[11px] font-black uppercase text-slate-800 mb-1 leading-none">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mb-3">{item.desc}</p>
                    <div
                      className={cn(
                        'text-[10px] font-black py-2 px-4 rounded-full',
                        owned ? 'bg-slate-200 text-slate-500' : 'bg-gradient-to-r from-[#FFF2BE] to-[#FFD96F] text-[#A87400]'
                      )}
                    >
                      {owned ? 'Canjeado' : `${item.cost} ⭐`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-[#4D42D7]">
                Cofre de logros
              </h2>
              <p className="text-sm font-bold text-slate-400">
                Cada sesión cuenta. Cada estrella también.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-white text-center shadow-[0_16px_36px_rgba(94,101,160,0.10)]">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-2" />
                <p className="text-3xl font-black text-slate-800">{userData.stars}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Estrellas
                </p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-white text-center shadow-[0_16px_36px_rgba(94,101,160,0.10)]">
                <Flame className="w-8 h-8 text-orange-500 fill-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-slate-800">{userData.streak}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Días seguidos
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-white shadow-[0_16px_36px_rgba(94,101,160,0.10)]">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.22em] mb-4">
                Historial reciente
              </h3>

              {userData.sessions.length === 0 ? (
                <p className="text-sm text-slate-400">Aún no hay sesiones registradas</p>
              ) : (
                <div className="space-y-3">
                  {userData.sessions.slice(0, 5).map((session, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#F7F8FD] px-4 py-3 rounded-[1.2rem]"
                    >
                      <span className="text-sm font-black text-slate-600">
                        {session.minutes || Math.floor(session.time / 60)} min
                      </span>

                      <span className="text-sm font-black text-amber-500">
                        ⭐ {session.starsEarned || 15}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-[0_16px_36px_rgba(94,101,160,0.10)] space-y-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.22em] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Mi galería personal
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {shopItems.filter((i) => userData.unlockedItems.includes(i.id)).length === 0 ? (
                  <div className="col-span-3 py-10 text-center space-y-3">
                    <Medal className="w-10 h-10 text-slate-200 mx-auto" />
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Aún no tienes medallas.
                    </p>
                    <button
                      onClick={() => setView('shop')}
                      className="text-[10px] font-black text-[#5A56E9] bg-[#EEF0FF] px-4 py-2 rounded-full uppercase"
                    >
                      Ir a la tienda
                    </button>
                  </div>
                ) : (
                  shopItems.map((item) => {
                    const isOwned = userData.unlockedItems.includes(item.id);
                    if (!isOwned) return null;

                    return (
                      <div
                        key={item.id}
                        className="aspect-square rounded-[1.8rem] bg-gradient-to-br from-[#EEF0FF] to-[#F8FBFF] border border-white flex flex-col items-center justify-center p-2 text-center"
                      >
                        <span className="text-3xl mb-1">{item.icon}</span>
                        <span className="text-[8px] font-black uppercase text-[#4D42D7] leading-none">
                          {item.title}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'session' && (
          <div className="text-center space-y-10 py-8">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_22px_44px_rgba(94,101,160,0.10)] border border-white">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#EDF2FF"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="url(#progressGradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={691}
                    strokeDashoffset={691 - (691 * timer) / initialTime}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6C63FF" />
                      <stop offset="50%" stopColor="#4C9BFF" />
                      <stop offset="100%" stopColor="#2FCF98" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col">
                  <span className="text-6xl font-black text-slate-800 tabular-nums">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-black text-[#5A56E9] uppercase tracking-[0.22em] mt-2">
                    Lectura con amor
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] bg-gradient-to-r from-[#6C63FF] to-[#4C9BFF] text-white p-6 shadow-[0_18px_34px_rgba(108,99,255,0.22)]">
                <p className="text-sm font-bold italic leading-relaxed">
                  {timer > 0
                    ? 'Cada palabra es un pequeño logro. Sigue así.'
                    : '¡Sesión terminada! Ya ganaste tus 15 estrellas.'}
                </p>
              </div>
            </div>

            <div className="px-2">
              {timer === 0 ? (
                <button
                  onClick={() => setView('home')}
                  className="w-full bg-gradient-to-r from-[#2FCF98] to-[#17A7B8] text-white py-5 rounded-[1.8rem] font-black text-lg shadow-[0_20px_36px_rgba(47,207,152,0.24)] active:scale-95"
                >
                  ¡Recibir 15 estrellas! ⭐
                </button>
              ) : (
                <button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="w-full bg-gradient-to-r from-[#5B52E8] to-[#4C9BFF] text-white py-5 rounded-[1.8rem] font-black shadow-[0_20px_36px_rgba(91,82,232,0.24)] active:scale-95"
                >
                  {isTimerActive ? 'Pausar para un abrazo' : 'Continuar'}
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'sos' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[#E14E73]">
                Primeros auxilios emocionales
              </h2>
              <p className="text-sm font-bold text-slate-400">
                Respira. Aquí tienes ayuda rápida para seguir sin presión.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  t: 'No quiere empezar',
                  d: "No pelees. Usa el LectoJuego Sinfonía. Si hoy no es el día, descansen. El vínculo vale más que una página.",
                },
                {
                  t: 'Se frustra y llora',
                  d: "Detente. Un abrazo de 10 segundos puede cambiar el momento. Dile: 'Tú puedes, estamos practicando juntos'.",
                },
                {
                  t: 'Se distrae mucho',
                  d: 'Reduce la lectura a solo 2 minutos. Menos presión, más logros pequeños.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-[2rem] border border-white shadow-[0_16px_36px_rgba(94,101,160,0.10)] space-y-2"
                >
                  <p className="font-black text-[#E14E73] text-[11px] uppercase tracking-[0.22em]">
                    {item.t}
                  </p>
                  <p className="text-sm text-slate-600 font-bold leading-relaxed">
                    {item.d}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setView('home')}
              className="w-full bg-white py-4 rounded-[1.6rem] text-slate-500 font-black shadow-sm border border-white active:scale-[0.98]"
            >
              Volver al plan
            </button>
          </div>
        )}
      </main>

      {celebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-[#4A3FCB]/80 backdrop-blur-md"
            onClick={() => setCelebration(null)}
          />
          <div className="text-center relative z-10 space-y-7">
            <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
              <span className="text-7xl">{celebration.icon}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tight leading-none">
                ¡Lo conseguiste!
              </h2>
              <p className="text-white/90 font-bold text-lg">
                {celebration.title} desbloqueado
              </p>
            </div>

            <button
              onClick={() => {
                setCelebration(null);
                setView('stats');
              }}
              className="bg-white text-[#5A56E9] px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.18em] shadow-[0_24px_50px_rgba(255,255,255,0.14)] active:scale-95"
            >
              Ver mi colección
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-white px-4 py-4 z-50 shadow-[0_-16px_40px_rgba(94,101,160,0.08)]">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          <button
            onClick={() => setView('home')}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-3 rounded-[1.4rem] transition-all active:scale-95',
              view === 'home' || view === 'quiz'
                ? 'bg-gradient-to-br from-[#6C63FF] to-[#4C9BFF] text-white shadow-[0_14px_28px_rgba(108,99,255,0.28)]'
                : 'text-slate-400'
            )}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Plan</span>
          </button>

          <button
            onClick={() => setView('shop')}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-3 rounded-[1.4rem] transition-all active:scale-95',
              view === 'shop'
                ? 'bg-gradient-to-br from-[#FFB84D] to-[#FF8B5E] text-white shadow-[0_14px_28px_rgba(255,168,77,0.28)]'
                : 'text-slate-400'
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Tienda</span>
          </button>

          <button
            onClick={() => setView('stats')}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-3 rounded-[1.4rem] transition-all active:scale-95',
              view === 'stats'
                ? 'bg-gradient-to-br from-[#2FCF98] to-[#17A7B8] text-white shadow-[0_14px_28px_rgba(47,207,152,0.28)]'
                : 'text-slate-400'
            )}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Cofre</span>
          </button>

          <button
            onClick={() => setView('sos')}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-3 rounded-[1.4rem] transition-all active:scale-95',
              view === 'sos'
                ? 'bg-gradient-to-br from-[#FF7D95] to-[#FF5E7D] text-white shadow-[0_14px_28px_rgba(255,125,149,0.28)]'
                : 'text-slate-400'
            )}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Ayuda</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;