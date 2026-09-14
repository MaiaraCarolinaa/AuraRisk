import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SumarioQueimadas, VisaoGeralRisco } from '../types';

interface Alerta {
  id: string;
  titulo: string;
  descricao: string;
  nivel: 'critico' | 'alto' | 'moderado';
  fonte: string;
}

const ESTILO_NIVEL: Record<Alerta['nivel'], string> = {
  critico: 'border-l-risk-critical bg-risk-critical/5',
  alto: 'border-l-risk-high bg-risk-high/5',
  moderado: 'border-l-risk-moderate bg-risk-moderate/5',
};

const ROTULO_NIVEL: Record<Alerta['nivel'], string> = { critico: 'Crítico', alto: 'Alto', moderado: 'Moderado' };

function construirAlertas(visaoGeral: VisaoGeralRisco | null, queimadas: SumarioQueimadas | null): Alerta[] {
  const alertas: Alerta[] = [];

  if (visaoGeral?.queimadas && (visaoGeral.queimadas.status === 'critico' || visaoGeral.queimadas.status === 'alto')) {
    alertas.push({
      id: 'queimadas-geral',
      titulo: `Nível ${visaoGeral.queimadas.status === 'critico' ? 'crítico' : 'alto'} de queimadas em Mato Grosso`,
      descricao: `${visaoGeral.queimadas.totalFocos} focos de calor ativos detectados nas últimas 24h pelo INPE.`,
      nivel: visaoGeral.queimadas.status === 'critico' ? 'critico' : 'alto',
      fonte: 'INPE / BDQueimadas',
    });
  }

  for (const municipio of queimadas?.porMunicipio.slice(0, 5) ?? []) {
    if (municipio.focos < 15) continue;
    alertas.push({
      id: `foco-${municipio.municipio}`,
      titulo: `Concentração elevada de focos em ${municipio.municipio}`,
      descricao: `${municipio.focos} focos de calor registrados no período de referência.`,
      nivel: municipio.focos >= 100 ? 'critico' : municipio.focos >= 40 ? 'alto' : 'moderado',
      fonte: 'INPE / BDQueimadas',
    });
  }

  if (visaoGeral && visaoGeral.recursosHidricos.estacoesComLeitura === 0 && visaoGeral.recursosHidricos.estacoesMonitoradas > 0) {
    alertas.push({
      id: 'ana-sem-leitura',
      titulo: 'Rede telemétrica de recursos hídricos sem leituras recentes',
      descricao:
        'O serviço público legado da ANA/SNIRH está sem dados de telemetria em tempo real para as estações monitoradas em MT no momento.',
      nivel: 'moderado',
      fonte: 'ANA / SNIRH',
    });
  }

  if (visaoGeral?.vegetacao.totalAlertas && visaoGeral.vegetacao.totalAlertas > 50) {
    alertas.push({
      id: 'mapbiomas-alertas',
      titulo: 'Volume relevante de alertas de desmatamento',
      descricao: `${visaoGeral.vegetacao.totalAlertas} alertas de supressão de vegetação identificados na região.`,
      nivel: visaoGeral.vegetacao.totalAlertas > 100 ? 'alto' : 'moderado',
      fonte: 'MapBiomas Alerta',
    });
  }

  if (visaoGeral && !visaoGeral.clima.aoVivo) {
    alertas.push({
      id: 'inmet-indisponivel',
      titulo: 'Estações meteorológicas automáticas indisponíveis',
      descricao: visaoGeral.clima.nota ?? 'Sem leitura das estações do INMET no momento.',
      nivel: 'moderado',
      fonte: 'INMET',
    });
  }

  return alertas;
}

export default function Alertas() {
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeralRisco | null>(null);
  const [queimadas, setQueimadas] = useState<SumarioQueimadas | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.visaoGeral(), api.queimadas().catch(() => null)])
      .then(([resVisaoGeral, resQueimadas]) => {
        setVisaoGeral(resVisaoGeral);
        setQueimadas(resQueimadas);
      })
      .finally(() => setCarregando(false));
  }, []);

  const alertas = construirAlertas(visaoGeral, queimadas);

  return (
    <div className="pt-2">
      <h1 className="text-xl font-bold text-neutral-900">Alertas</h1>
      <p className="text-sm text-neutral-500 mb-5">Gerados automaticamente a partir de limiares aplicados aos dados oficiais.</p>

      {carregando && <p className="text-sm text-neutral-400">Calculando alertas...</p>}

      <div className="space-y-3">
        {alertas.map((alerta) => (
          <div key={alerta.id} className={`border-l-4 rounded-r-xl rounded-l-sm px-5 py-4 ${ESTILO_NIVEL[alerta.nivel]}`}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-neutral-900">{alerta.titulo}</p>
              <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 shrink-0">{ROTULO_NIVEL[alerta.nivel]}</span>
            </div>
            <p className="text-sm text-neutral-600 mt-1">{alerta.descricao}</p>
            <p className="text-[11px] text-neutral-400 mt-2">Fonte: {alerta.fonte}</p>
          </div>
        ))}
        {!carregando && alertas.length === 0 && (
          <div className="bg-white border border-black/5 rounded-2xl px-5 py-10 text-center text-sm text-neutral-400">
            Nenhum alerta ativo no momento — indicadores dentro da normalidade.
          </div>
        )}
      </div>
    </div>
  );
}
