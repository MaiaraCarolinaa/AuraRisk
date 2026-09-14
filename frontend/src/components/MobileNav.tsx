import { NavLink } from 'react-router-dom';

const ITENS = [
  { caminho: '/', rotulo: 'Início' },
  { caminho: '/mapa', rotulo: 'Mapa' },
  { caminho: '/ocorrencias', rotulo: 'Ocorrências' },
  { caminho: '/alertas', rotulo: 'Alertas' },
  { caminho: '/relatorios', rotulo: 'Relatórios' },
  { caminho: '/sobre', rotulo: 'Sobre' },
];

export default function NavegacaoMobile() {
  return (
    <nav className="md:hidden flex overflow-x-auto gap-2 px-4 py-2.5 bg-aura-900 border-t border-aura-800">
      {ITENS.map((item) => (
        <NavLink
          key={item.caminho}
          to={item.caminho}
          end={item.caminho === '/'}
          className={({ isActive }) =>
            `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive ? 'bg-aura-600 text-white' : 'text-aura-300'
            }`
          }
        >
          {item.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
