import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BarraSuperior() {
  const [busca, setBusca] = useState('');
  const navegar = useNavigate();

  function lidarComEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    if (busca.trim()) navegar(`/mapa?busca=${encodeURIComponent(busca.trim())}`);
  }

  return (
    <header className="flex items-center gap-3 md:gap-4 px-4 md:px-8 py-4 bg-aura-bg">
      <form onSubmit={lidarComEnvio} className="flex-1 min-w-0 max-w-xl">
        <div className="flex items-center gap-2 bg-white border border-black/5 rounded-full px-4 py-2.5 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar município ou região..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2 md:gap-3 shrink-0">
        <button
          type="button"
          aria-label="Notificações"
          className="w-10 h-10 shrink-0 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-neutral-500 hover:text-aura-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 bg-white border border-black/5 rounded-full pl-1.5 pr-3 py-1.5 shadow-sm"
        >
          <div className="w-7 h-7 rounded-full bg-aura-100 text-aura-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" />
            </svg>
          </div>
          <span className="hidden sm:inline text-sm font-medium text-neutral-700">Visitante</span>
          <svg viewBox="0 0 24 24" className="hidden sm:block w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
