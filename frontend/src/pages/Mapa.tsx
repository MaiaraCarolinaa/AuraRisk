import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import VisualizacaoMapa from '../components/MapView';
import { PontoAoVivo } from '../components/RiskBadge';
import type { FocoCalor, SumarioQueimadas, Municipio, AlertaVegetacao, SumarioVegetacao, EstacaoAgua, SumarioAgua } from '../types';

type ChaveCamada = 'queimadas' | 'agua' | 'vegetacao';

export default function Mapa() {
  const [parametros] = useSearchParams();
  const busca = parametros.get('busca')?.toLowerCase() ?? '';

  const [queimadas, setQueimadas] = useState<SumarioQueimadas | null>(null);
  const [agua, setAgua] = useState<SumarioAgua | null>(null);
  const [vegetacao, setVegetacao] = useState<SumarioVegetacao | null>(null);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [camadas, setCamadas] = useState<Record<ChaveCamada, boolean>>({ queimadas: true, agua: true, vegetacao: true });

  useEffect(() => {
    api.queimadas().then(setQueimadas).catch(() => null);
    api.agua().then(setAgua).catch(() => null);
    api.vegetacao().then(setVegetacao).catch(() => null);
    api.municipios().then(setMunicipios).catch(() => null);
  }, []);

  const municipioEncontrado = useMemo(
    () => (busca ? municipios.find((municipio) => municipio.nome.toLowerCase().includes(busca)) : undefined),
    [municipios, busca],
  );
  const centro: [number, number] | undefined = municipioEncontrado ? [municipioEncontrado.lat, municipioEncontrado.lon] : undefined;

  const focosVisiveis: FocoCalor[] = camadas.queimadas ? queimadas?.focos ?? [] : [];
  const estacoesVisiveis: EstacaoAgua[] = camadas.agua ? agua?.estacoes ?? [] : [];
  const alertasVisiveis: AlertaVegetacao[] = camadas.vegetacao ? vegetacao?.alertas ?? [] : [];

  return (
    <div className="pt-2 h-[calc(100vh-96px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Mapa de Riscos — Mato Grosso</h1>
          <p className="text-sm text-neutral-500">
            {municipioEncontrado ? `Exibindo região de ${municipioEncontrado.nome}` : 'Focos de calor, estações hídricas e alertas de vegetação em tempo real.'}
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-0">
        <aside className="bg-white border border-black/5 rounded-2xl p-5 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Camadas</p>
            <div className="space-y-3">
              <AlternadorCamada
                cor="#e0692f"
                rotulo="Queimadas (INPE)"
                marcado={camadas.queimadas}
                aoAlterar={(valor) => setCamadas((atual) => ({ ...atual, queimadas: valor }))}
                legenda={queimadas ? `${queimadas.totalFocos} focos · ` : ''}
                aoVivo={queimadas?.aoVivo}
              />
              <AlternadorCamada
                cor="#2b7fc1"
                rotulo="Recursos Hídricos (ANA)"
                marcado={camadas.agua}
                aoAlterar={(valor) => setCamadas((atual) => ({ ...atual, agua: valor }))}
                legenda={agua ? `${agua.estacoesMonitoradas} estações · ` : ''}
                aoVivo={agua?.aoVivo}
              />
              <AlternadorCamada
                cor="#a9713f"
                rotulo="Vegetação (MapBiomas)"
                marcado={camadas.vegetacao}
                aoAlterar={(valor) => setCamadas((atual) => ({ ...atual, vegetacao: valor }))}
                legenda={vegetacao ? `${vegetacao.totalAlertas ?? 0} alertas · ` : ''}
                aoVivo={vegetacao?.aoVivo}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Municípios com mais focos</p>
            <ul className="space-y-2">
              {(queimadas?.porMunicipio ?? []).slice(0, 8).map((municipio) => (
                <li key={municipio.municipio} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{municipio.municipio}</span>
                  <span className="font-semibold text-neutral-900">{municipio.focos}</span>
                </li>
              ))}
              {queimadas && queimadas.porMunicipio.length === 0 && <p className="text-sm text-neutral-400">Nenhum foco registrado hoje.</p>}
            </ul>
          </div>

          {agua && agua.estacoesComLeitura === 0 && (
            <div className="rounded-xl bg-amber-50 text-amber-800 text-xs p-3 leading-relaxed">
              O serviço público legado da ANA (telemetria) está sem leituras em tempo real no momento — a ANA está migrando para uma
              nova API autenticada. As estações abaixo mostram localização/cadastro reais.
            </div>
          )}
        </aside>

        <div className="rounded-2xl overflow-hidden border border-black/5 shadow-card min-h-[320px]">
          <VisualizacaoMapa focos={focosVisiveis} estacoesAgua={estacoesVisiveis} alertasVegetacao={alertasVisiveis} centro={centro} zoom={municipioEncontrado ? 10 : 6} />
        </div>
      </div>
    </div>
  );
}

function AlternadorCamada({
  cor,
  rotulo,
  legenda,
  marcado,
  aoAlterar,
  aoVivo,
}: {
  cor: string;
  rotulo: string;
  legenda: string;
  marcado: boolean;
  aoAlterar: (valor: boolean) => void;
  aoVivo?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={marcado} onChange={(evento) => aoAlterar(evento.target.checked)} className="sr-only peer" />
      <span
        className="w-4 h-4 rounded-md border flex items-center justify-center transition-colors"
        style={{ borderColor: cor, backgroundColor: marcado ? cor : 'transparent' }}
      >
        {marcado && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m5 12 5 5 9-10" />
          </svg>
        )}
      </span>
      <span className="flex-1">
        <span className="block text-sm text-neutral-800">{rotulo}</span>
        {aoVivo !== undefined && (
          <span className="text-[11px] text-neutral-400">
            {legenda}
            <PontoAoVivo aoVivo={aoVivo} />
          </span>
        )}
      </span>
    </label>
  );
}
