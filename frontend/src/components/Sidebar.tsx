import { NavLink } from 'react-router-dom';

const ITENS_NAV = [
  { caminho: '/', rotulo: 'Início', icone: IconeInicio },
  { caminho: '/mapa', rotulo: 'Mapa', icone: IconeMapa },
  { caminho: '/ocorrencias', rotulo: 'Ocorrências', icone: IconeBusca },
  { caminho: '/alertas', rotulo: 'Alertas', icone: IconeSino },
  { caminho: '/relatorios', rotulo: 'Relatórios', icone: IconeRelatorio },
  { caminho: '/sobre', rotulo: 'Sobre', icone: IconeInfo },
];

export default function BarraLateral() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-aura-900 text-aura-100 px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-aura-400 flex items-center justify-center">
          <IconeFolha className="w-5 h-5 text-aura-950" />
        </div>
        <span className="font-extrabold tracking-wide text-white text-lg">AURA RISK</span>
      </div>

      <nav className="flex flex-col gap-1">
        {ITENS_NAV.map(({ caminho, rotulo, icone: Icone }) => (
          <NavLink
            key={caminho}
            to={caminho}
            end={caminho === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-aura-600 text-white' : 'text-aura-300 hover:bg-aura-800 hover:text-white'
              }`
            }
          >
            <Icone className="w-[18px] h-[18px]" />
            {rotulo}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-aura-800 p-5">
        <div className="w-8 h-8 rounded-full bg-aura-700 flex items-center justify-center mb-4">
          <IconeFolha className="w-4 h-4 text-aura-300" />
        </div>
        <p className="text-sm text-aura-100 leading-snug">
          Juntos por um <span className="font-semibold text-white">Mato Grosso</span> mais seguro e sustentável.
        </p>
      </div>
    </aside>
  );
}

function baseIcone(props: React.SVGProps<SVGSVGElement>) {
  return { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', ...props };
}

function IconeInicio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function IconeMapa(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13M15 6.5v13" />
    </svg>
  );
}
function IconeBusca(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function IconeSino(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
function IconeRelatorio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 12h6M9 16h6M9 8h3" />
    </svg>
  );
}
function IconeInfo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5h.01" />
    </svg>
  );
}
export function IconeFolha(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M5 20c9 0 14-5 14-14-9 0-14 5-14 14Z" />
      <path d="M5 20c0-6 3-9 8-11" />
    </svg>
  );
}
