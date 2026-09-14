import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import CartaoArea from '../components/AreaCard';
import VisualizacaoMapa from '../components/MapView';
import { IconeFolha } from '../components/Sidebar';
import type { FocoCalor, VisaoGeralRisco, AlertaVegetacao, EstacaoAgua } from '../types';

const INTERVALO_ATUALIZACAO_MS = 5 * 60 * 1000;

const FONTES = [
  { nome: 'INPE · Programa Queimadas (BDQueimadas)', url: 'https://data.inpe.br/queimadas/bdqueimadas/' },
  { nome: 'ANA / SNIRH · Recursos Hídricos', url: 'https://www.snirh.gov.br/' },
  { nome: 'MapBiomas · Uso e Cobertura do Solo', url: 'https://brasil.mapbiomas.org/plataforma/' },
  { nome: 'INMET · Estações Meteorológicas', url: 'https://mapas.inmet.gov.br/' },
];

export default function Inicio() {
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeralRisco | null>(null);
  const [focos, setFocos] = useState<FocoCalor[]>([]);
  const [estacoesAgua, setEstacoesAgua] = useState<EstacaoAgua[]>([]);
  const [alertasVegetacao, setAlertasVegetacao] = useState<AlertaVegetacao[]>([]);
  const [mostrarFontes, setMostrarFontes] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const [resVisaoGeral, resQueimadas, resAgua, resVegetacao] = await Promise.all([
        api.visaoGeral(),
        api.queimadas().catch(() => null),
        api.agua().catch(() => null),
        api.vegetacao().catch(() => null),
      ]);
      if (!ativo) return;
      setVisaoGeral(resVisaoGeral);
      if (resQueimadas) setFocos(resQueimadas.focos);
      if (resAgua) setEstacoesAgua(resAgua.estacoes);
      if (resVegetacao) setAlertasVegetacao(resVegetacao.alertas);
    }
    carregar();
    const idIntervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
    return () => {
      ativo = false;
      clearInterval(idIntervalo);
    };
  }, []);

  return (
    <div className="pt-2">
      <h1 className="text-2xl md:text-[28px] font-bold text-neutral-900">
        Olá, bem-vindo ao <span className="text-aura-500">Aura Risk</span>!
      </h1>
      <p className="text-neutral-500 mt-1 mb-6">Monitore em tempo real os riscos ambientais e a situação da sua região.</p>

      <div className="relative rounded-3xl overflow-hidden border border-black/5 shadow-card h-[380px] md:h-[420px]">
        <VisualizacaoMapa focos={focos} estacoesAgua={estacoesAgua} alertasVegetacao={alertasVegetacao} interativo={false} zoom={6} />

        <div className="hidden lg:flex flex-col absolute top-1/2 right-8 -translate-y-1/2 w-72 bg-white rounded-2xl shadow-lg p-6">
          <div className="w-11 h-11 rounded-xl bg-aura-100 flex items-center justify-center mb-4">
            <IconeFolha className="w-5 h-5 text-aura-600" />
          </div>
          <h3 className="font-semibold text-neutral-900 leading-snug mb-2">Acompanhe sua região em tempo real</h3>
          <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
            Veja os principais riscos ambientais, infraestrutura e serviços essenciais no mapa interativo.
          </p>
          <Link
            to="/mapa"
            className="inline-flex items-center justify-center gap-2 bg-aura-900 hover:bg-aura-800 transition-colors text-white text-sm font-medium rounded-xl px-4 py-3"
          >
            Explorar mapa
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="font-semibold text-neutral-900">Principais áreas monitoradas</h2>
        <Link to="/sobre" className="text-sm text-aura-600 hover:text-aura-700 inline-flex items-center gap-1">
          Saiba mais sobre os indicadores <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <CartaoArea
          icone={<IconeChama className="w-5 h-5" />}
          corFundoIcone="bg-orange-50"
          corIcone="#e0692f"
          rotulo="Queimadas"
          valor={visaoGeral ? `${visaoGeral.queimadas.totalFocos} focos ativos (24h)` : 'Carregando...'}
          status={visaoGeral?.queimadas.status}
          aoClicar={() => (window.location.href = '/mapa')}
        />
        <CartaoArea
          icone={<IconeGota className="w-5 h-5" />}
          corFundoIcone="bg-blue-50"
          corIcone="#2b7fc1"
          rotulo="Recursos Hídricos"
          valor={
            visaoGeral
              ? `${visaoGeral.recursosHidricos.estacoesComLeitura}/${visaoGeral.recursosHidricos.estacoesMonitoradas} estações com leitura`
              : 'Carregando...'
          }
          status={visaoGeral?.recursosHidricos.status}
          aoClicar={() => (window.location.href = '/mapa')}
        />
        <CartaoArea
          icone={<IconeRaio className="w-5 h-5" />}
          corFundoIcone="bg-yellow-50"
          corIcone="#c99a1f"
          rotulo="Energia"
          valor="Sem fonte oficial gratuita neste MVP"
          nota="Módulo pronto para integração futura (ONS/ANEEL)."
        />
        <CartaoArea
          icone={<IconeEstrada className="w-5 h-5" />}
          corFundoIcone="bg-neutral-100"
          corIcone="#6b7280"
          rotulo="Infraestrutura"
          valor="Sem fonte oficial gratuita neste MVP"
          nota="Módulo pronto para integração futura (DNIT)."
        />
        <CartaoArea
          icone={<IconeMontanha className="w-5 h-5" />}
          corFundoIcone="bg-amber-50"
          corIcone="#a9713f"
          rotulo="Risco de Deslizamentos"
          valor={visaoGeral ? `${visaoGeral.vegetacao.totalAlertas ?? '—'} alertas de solo exposto (MapBiomas)` : 'Carregando...'}
          status={visaoGeral?.vegetacao.status}
          aoClicar={() => (window.location.href = '/mapa')}
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-black/5 rounded-2xl px-5 py-3.5 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <IconeEscudo className="w-4 h-4 text-aura-500" />
          Dados obtidos de fontes oficiais e atualizados continuamente.
        </div>
        <button type="button" onClick={() => setMostrarFontes((valor) => !valor)} className="relative text-aura-600 hover:text-aura-700 font-medium inline-flex items-center gap-1">
          Fontes de dados <span aria-hidden>↗</span>
          {mostrarFontes && (
            <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-black/5 rounded-xl shadow-lg p-3 text-left z-10">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fontes oficiais</p>
              <ul className="space-y-2">
                {FONTES.map((fonte) => (
                  <li key={fonte.url}>
                    <a href={fonte.url} target="_blank" rel="noreferrer" className="text-sm text-neutral-700 hover:text-aura-600 leading-snug block">
                      {fonte.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

function baseIcone(props: React.SVGProps<SVGSVGElement>) {
  return { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', ...props };
}
function IconeChama(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M12 3s3 3 3 6.5A3 3 0 0 1 9 9.5C9 12 6 13 6 16a6 6 0 0 0 12 0c0-5-3-6-3-9-1 1-1.5 2-1.5 3.5A3 3 0 0 1 12 3Z" />
    </svg>
  );
}
function IconeGota(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M12 3s7 7.5 7 12.5a7 7 0 0 1-14 0C5 10.5 12 3 12 3Z" />
    </svg>
  );
}
function IconeRaio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    </svg>
  );
}
function IconeEstrada(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M8 3 4 21M16 3l4 18M11 8h2M10.3 13h3.4M9.6 18h4.8" />
    </svg>
  );
}
function IconeMontanha(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="m4 19 6-11 4 6 2-3 4 8H4Z" />
    </svg>
  );
}
function IconeEscudo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseIcone(props)}>
      <path d="M12 3 5 6v6c0 5 3 7.5 7 9 4-1.5 7-4 7-9V6l-7-3Z" />
    </svg>
  );
}
