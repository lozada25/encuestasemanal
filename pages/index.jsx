import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Sparkles, X, Trophy, Settings, Link as LinkIcon, ExternalLink, Lock, User, Key } from 'lucide-react';

export default function App() {
  const canvasRef = useRef(null);

  const [surveyUrl, setSurveyUrl] = useState('https://docs.google.com/forms/d/e/1FAIpQLSetAldHVam5HEdDYMMFi_f-88e8E2fUoOdRQIOLQFMMCUytPQ/viewform?usp=header');
  const [rewardImageUrl] = useState('/imagenes/recompensa.png');

  // Cargar el enlace global desde la API de Vercel Global Config al iniciar
  useEffect(() => {
    fetch('/api/survey')
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setSurveyUrl(data.url);
      })
      .catch(() => {});
  }, []);

  const [showConfigButton, setShowConfigButton] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [explosionCount, setExplosionCount] = useState(0);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);

  const entitiesRef = useRef([]);
  const particlesRef = useRef([]);
  const floatTextsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 180 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        setShowConfigButton((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;

    const darkraiImg = new window.Image();
    darkraiImg.src = '/imagenes/darkrai.png';

    const darkraiSound = new Audio('/sonidos/darkrai.mp3');
    const manzanaSound = new Audio('/sonidos/manzana.mp3');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initEntities();
    };

    const initEntities = () => {
      const types = ['darkrai', 'apple', 'backpack'];
      entitiesRef.current = Array.from({ length: 9 }, (_, i) => ({
        id: i,
        type: types[i % types.length],
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: Math.random() * (window.innerHeight - 200) + 100,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 60,
        floatOffset: Math.random() * Math.PI * 2,
      }));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const cols = Math.floor(window.innerWidth / 20) + 1;
    const rows = Math.floor(window.innerHeight / 20) + 1;
    let grid = [];

    for (let i = 0; i < cols; i++) {
      grid[i] = [];
      for (let j = 0; j < rows; j++) {
        grid[i][j] = {
          x: i * 20,
          y: j * 20,
          baseX: i * 20,
          baseY: j * 20,
          vx: 0,
          vy: 0,
        };
      }
    }

    let wavePhase = 0;

    const animate = () => {
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      wavePhase += 0.03;

      ctx.lineWidth = 1.5;
      for (let j = 0; j < rows; j += 2) {
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          const pt = grid[i][j];
          const wave = Math.sin(wavePhase + i * 0.2 + j * 0.1) * 12;
          const currentY = pt.baseY + wave;

          const dx = pt.x - mouseRef.current.x;
          const dy = currentY - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let pushX = 0;
          let pushY = 0;
          if (dist < mouseRef.current.radius) {
            const force = (1 - dist / mouseRef.current.radius) * 20;
            pushX = (dx / dist) * force;
            pushY = (dy / dist) * force;
          }

          const drawX = pt.baseX + pushX;
          const drawY = currentY + pushY;

          if (i === 0) {
            ctx.moveTo(drawX, drawY);
          } else {
            ctx.lineTo(drawX, drawY);
          }
        }

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      entitiesRef.current.forEach((entity) => {
        entity.x += entity.vx;
        entity.y += entity.vy + Math.sin(wavePhase + entity.floatOffset) * 0.5;

        if (entity.x < 30 || entity.x > canvas.width - 70) entity.vx *= -1;
        if (entity.y < 30 || entity.y > canvas.height - 120) entity.vy *= -1;

        ctx.save();
        ctx.translate(entity.x, entity.y);

        if (entity.type === 'darkrai') {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.beginPath();
          ctx.arc(30, 30, 32, 0, Math.PI * 2);
          ctx.fill();

          if (darkraiImg.complete && darkraiImg.naturalWidth !== 0) {
            ctx.drawImage(darkraiImg, 0, 0, 60, 60);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(30, 30, 25, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (entity.type === 'apple') {
          ctx.font = '42px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍏', 30, 30);
        } else if (entity.type === 'backpack') {
          ctx.font = '42px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎒', 30, 30);
        }

        ctx.restore();
      });

      particlesRef.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        p.size *= 0.95;

        if (p.life <= 0) {
          particlesRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.size, 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      floatTextsRef.current.forEach((ft, index) => {
        ft.y -= 1.2;
        ft.life -= 0.02;

        if (ft.life <= 0) {
          floatTextsRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.font = '900 24px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 15;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleCanvasClick = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      entitiesRef.current.forEach((entity, index) => {
        const dx = clickX - (entity.x + 30);
        const dy = clickY - (entity.y + 30);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 45) {
          if (entity.type === 'darkrai') {
            darkraiSound.currentTime = 0;
            darkraiSound.play().catch(() => {});
          } else {
            manzanaSound.currentTime = 0;
            manzanaSound.play().catch(() => {});
          }

          const colors = entity.type === 'darkrai' 
            ? ['#06b6d4', '#a855f7', '#ef4444', '#ffffff'] 
            : ['#4ade80', '#facc15', '#fb923c', '#ffffff'];

          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particlesRef.current.push({
              x: entity.x + 30,
              y: entity.y + 30,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              size: Math.random() * 6 + 4,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }

          const textToDisplay = entity.type === 'darkrai' ? 'MOLA' : 'uoghhhh';
          const textColor = entity.type === 'darkrai' ? '#38bdf8' : '#4ade80';

          floatTextsRef.current.push({
            x: entity.x + 10,
            y: entity.y + 10,
            text: textToDisplay,
            color: textColor,
            life: 1.0,
          });

          entitiesRef.current[index] = {
            ...entity,
            x: Math.random() * (window.innerWidth - 100) + 50,
            y: Math.random() * (window.innerHeight - 200) + 100,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
          };

          setExplosionCount((prev) => {
            const newCount = prev + 1;
            if (newCount === 30) {
              setShowSurpriseModal(true);
            }
            return newCount;
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleOpenExternalSurvey = () => {
    if (surveyUrl) {
      window.open(surveyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username === 'chozo' && password === 'shonen semanal') {
      setIsLoginOpen(false);
      setLoginError(false);
      setUsername('');
      setPassword('');
      setIsConfigOpen(true);
    } else {
      setLoginError(true);
    }
  };

  // Guardar el link en la nube de Vercel para que se actualice globalmente
  const handleSaveSurveyUrl = async () => {
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: surveyUrl }),
      });
      if (res.ok) {
        setIsConfigOpen(false);
        alert('¡Enlace actualizado en la nube para todos los dispositivos!');
      } else {
        alert('Error al guardar en el servidor');
      }
    } catch {
      alert('Error de conexión con la nube');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030508] text-white overflow-hidden flex flex-col items-center justify-between select-none font-sans p-6">
      <Head>
        <title>Encuesta Semanal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-auto cursor-pointer" />

      {showConfigButton && (
        <div className="absolute top-4 right-4 z-20 animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="p-3 rounded-full bg-slate-900/90 border border-yellow-500/40 text-yellow-300 hover:text-yellow-200 hover:bg-slate-800 transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] backdrop-blur-md cursor-pointer"
            title="Ajustes Protegidos"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="absolute w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>

      <div className="relative z-10 text-center mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 backdrop-blur-md mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span>Toca los Darkrai, 🍏 y 🎒 flotantes</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center my-auto">
        <button
          type="button"
          onClick={handleOpenExternalSurvey}
          className="group relative px-10 py-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xl sm:text-2xl tracking-wide shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:shadow-[0_0_60px_rgba(250,204,21,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 border border-yellow-200 cursor-pointer flex items-center gap-3"
        >
          Encuesta Aquí
          <ExternalLink className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </button>

        <p className="mt-4 text-xs font-semibold text-slate-400 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
          Llega a los <span className="text-yellow-400 font-bold">30 puntos</span> para una sorpresa
        </p>
      </div>

      <div className="relative z-10 mb-4 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-slate-900/90 border border-yellow-500/30 px-6 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.15)] backdrop-blur-md">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Puntos:</span>
          <span className="text-2xl font-black text-yellow-300 font-mono tracking-wider">{explosionCount}</span>
        </div>
      </div>

      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => { setIsLoginOpen(false); setLoginError(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-yellow-300">Acceso Restringido</h2>
                <p className="text-xs text-slate-400">Ingresa credenciales de administrador</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-yellow-400" /> Usuario:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-yellow-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-yellow-400" /> Contraseña:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-yellow-500/50"
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-400 font-semibold text-center">Usuario o contraseña incorrectos</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-slate-950 bg-yellow-400 hover:bg-yellow-300 transition-all cursor-pointer mt-2"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      )}

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-400">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-yellow-300">Actualizar Enlace Global</h2>
                <p className="text-xs text-slate-400">Modifica el enlace para todos los usuarios y dispositivos</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-yellow-400" />
                  Link de la Encuesta:
                </label>
                <input
                  type="url"
                  value={surveyUrl}
                  onChange={(e) => setSurveyUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSurveyUrl}
                  className="w-full py-3 rounded-xl font-bold text-slate-950 bg-yellow-400 hover:bg-yellow-300 transition-all cursor-pointer"
                >
                  Guardar en la Nube
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSurpriseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-pink-500/60 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(236,72,153,0.4)] backdrop-blur-2xl text-white">
            <button
              type="button"
              onClick={() => setShowSurpriseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full h-80 rounded-2xl border border-pink-500/40 mb-4 bg-slate-950 overflow-hidden flex items-center justify-center shadow-inner">
              <img 
                src={rewardImageUrl} 
                alt="Imagen de Recompensa" 
                className="w-full h-full object-contain" 
              />
            </div>

            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 mb-2">
              ¡Sorpresa Desbloqueada! 🎉
            </h2>

            <p className="text-lg font-bold text-pink-300 italic mb-4">
              "¿Quisieras ser mi hermanita/no-via?"
            </p>

            <button
              type="button"
              onClick={() => setShowSurpriseModal(false)}
              className="w-full py-3 rounded-xl font-black text-slate-950 bg-pink-400 hover:bg-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.6)] transition-all cursor-pointer"
            >
              ¡Siii! 💕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}