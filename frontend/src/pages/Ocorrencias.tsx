import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Ocorrencia } from '../types';

const ROTULO_TIPO: Record<Ocorrencia['tipo'], string> = {
  queimada: 'Queimada',
  hidrologico: 'Hidrológico',
  vegetacao: 'Vegetação',
};

const COR_TIPO: Record<Ocorrencia['tipo'], string> = {
  queimada: 'bg-orange-50 text-orange-700',
  hidrologico: 'bg-blue-50 text-blue-700',
  vegetacao: 'bg-amber-50 text-amber-800',
};

const COR_SEVERIDADE: Record<Ocorrencia['severidade'], string> = {
  alta: 'bg-risk-critical/10 text-risk-critical',
  media: 'bg-risk-moderate/10 text-risk-moderate',
  baixa: 'bg-risk-low/10 text-risk-low',
};

export default function Ocorrencias() {
  const [dados, setDados] = useState<{ atualizadoEm: string; total: number; ocorrencias: Ocorrencia[] } | null>(null);
  const [filtro, setFiltro] = useState<Ocorrencia['tipo'] | 'todos'>('todos');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .ocorrencias()
      .then(setDados)
      .finally(() => setCarregando(false));
  }, []);

  const filtradas = (dados?.ocorrencias ?? []).filter((ocorrencia) => filtro === 'todos' || ocorrencia.tipo === filtro);

  return (
    <div className="pt-2">
      <h1 className="text-xl font-bold text-neutral-900">Ocorrências</h1>
      <p className="text-sm text-neutral-500 mb-5">Eventos detectados pelas fontes oficiais nas últimas horas.</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['todos', 'queimada', 'hidrologico', 'vegetacao'] as const).map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filtro === tipo ? 'bg-aura-900 text-white border-aura-900' : 'bg-white text-neutral-600 border-black/10 hover:border-aura-300'
            }`}
          >
            {tipo === 'todos' ? 'Todos' : ROTULO_TIPO[tipo]}
          </button>
        ))}
      </div>

      {carregando && <p className="text-sm text-neutral-400">Carregando ocorrências...</p>}

      <div className="bg-white border border-black/5 rounded-2xl divide-y divide-black/5 overflow-hidden">
        {filtradas.map((ocorrencia) => (
          <div key={ocorrencia.id} className="flex items-start gap-4 px-5 py-4">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 mt-0.5 ${COR_TIPO[ocorrencia.tipo]}`}>{ROTULO_TIPO[ocorrencia.tipo]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900">{ocorrencia.titulo}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{ocorrencia.detalhe}</p>
              <p className="text-[11px] text-neutral-400 mt-1">
                {ocorrencia.municipio} · {ocorrencia.dataHora ?? 'data indisponível'} · fonte: {ocorrencia.fonte}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${COR_SEVERIDADE[ocorrencia.severidade]}`}>
              {ocorrencia.severidade === 'alta' ? 'Alta' : ocorrencia.severidade === 'media' ? 'Média' : 'Baixa'}
            </span>
          </div>
        ))}
        {!carregando && filtradas.length === 0 && <p className="text-sm text-neutral-400 px-5 py-8 text-center">Nenhuma ocorrência para este filtro.</p>}
      </div>
    </div>
  );
}
