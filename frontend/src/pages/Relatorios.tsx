import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SumarioQueimadas, VisaoGeralRisco, SumarioAgua } from '../types';

function baixarCsv(nomeArquivo: string, linhas: (string | number)[][]) {
  const conteudoCsv = linhas.map((linha) => linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([`﻿${conteudoCsv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const ancora = document.createElement('a');
  ancora.href = url;
  ancora.download = nomeArquivo;
  ancora.click();
  URL.revokeObjectURL(url);
}

export default function Relatorios() {
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeralRisco | null>(null);
  const [queimadas, setQueimadas] = useState<SumarioQueimadas | null>(null);
  const [agua, setAgua] = useState<SumarioAgua | null>(null);

  useEffect(() => {
    api.visaoGeral().then(setVisaoGeral);
    api.queimadas().then(setQueimadas).catch(() => null);
    api.agua().then(setAgua).catch(() => null);
  }, []);

  return (
    <div className="pt-2">
      <h1 className="text-xl font-bold text-neutral-900">Relatórios</h1>
      <p className="text-sm text-neutral-500 mb-6">Exporte os dados consolidados das fontes oficiais para análise offline.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <CartaoRelatorio
          titulo="Focos de queimada por município"
          descricao="Lista de municípios de Mato Grosso com contagem de focos de calor detectados no dia, conforme INPE/BDQueimadas."
          desabilitado={!queimadas || queimadas.porMunicipio.length === 0}
          aoExportar={() =>
            queimadas &&
            baixarCsv('aura-risk-queimadas-municipios.csv', [
              ['Município', 'Focos de calor', 'Data de referência', 'Fonte'],
              ...queimadas.porMunicipio.map((municipio) => [municipio.municipio, municipio.focos, queimadas.dataReferencia, 'INPE/BDQueimadas']),
            ])
          }
        />
        <CartaoRelatorio
          titulo="Focos de calor detalhados"
          descricao="Coordenadas, satélite, bioma e risco de fogo de cada foco detectado em Mato Grosso."
          desabilitado={!queimadas || queimadas.focos.length === 0}
          aoExportar={() =>
            queimadas &&
            baixarCsv('aura-risk-focos-detalhado.csv', [
              ['ID', 'Latitude', 'Longitude', 'Município', 'Data/Hora (GMT)', 'Satélite', 'Bioma', 'Risco de fogo', 'FRP (MW)'],
              ...queimadas.focos.map((foco) => [foco.id, foco.lat, foco.lon, foco.municipio, foco.dataHoraGmt, foco.satelite, foco.bioma, foco.riscoFogo ?? '', foco.frp ?? '']),
            ])
          }
        />
        <CartaoRelatorio
          titulo="Estações de monitoramento hídrico"
          descricao="Cadastro das estações ANA/SNIRH monitoradas, com última leitura disponível quando houver."
          desabilitado={!agua || agua.estacoes.length === 0}
          aoExportar={() =>
            agua &&
            baixarCsv('aura-risk-estacoes-hidricas.csv', [
              ['Código ANA', 'Nome', 'Latitude', 'Longitude', 'Cota (cm)', 'Vazão (m³/s)', 'Data da leitura'],
              ...agua.estacoes.map((estacao) => [
                estacao.codigo,
                estacao.nome,
                estacao.lat,
                estacao.lon,
                estacao.ultimaLeitura?.cota ?? '',
                estacao.ultimaLeitura?.vazao ?? '',
                estacao.ultimaLeitura?.dataHora ?? 'sem leitura',
              ]),
            ])
          }
        />
        <CartaoRelatorio
          titulo="Resumo executivo dos indicadores"
          descricao="Panorama consolidado de queimadas, recursos hídricos, vegetação e clima em um único arquivo."
          desabilitado={!visaoGeral}
          aoExportar={() =>
            visaoGeral &&
            baixarCsv('aura-risk-resumo.csv', [
              ['Indicador', 'Status', 'Valor', 'Ao vivo'],
              ['Queimadas', visaoGeral.queimadas.status, visaoGeral.queimadas.totalFocos, visaoGeral.queimadas.aoVivo ? 'sim' : 'não'],
              [
                'Recursos Hídricos',
                visaoGeral.recursosHidricos.status,
                `${visaoGeral.recursosHidricos.estacoesComLeitura}/${visaoGeral.recursosHidricos.estacoesMonitoradas}`,
                visaoGeral.recursosHidricos.aoVivo ? 'sim' : 'não',
              ],
              ['Vegetação (MapBiomas)', visaoGeral.vegetacao.status, visaoGeral.vegetacao.totalAlertas ?? '', visaoGeral.vegetacao.aoVivo ? 'sim' : 'não'],
              ['Clima (INMET)', visaoGeral.clima.status, '', visaoGeral.clima.aoVivo ? 'sim' : 'não'],
            ])
          }
        />
      </div>
    </div>
  );
}

function CartaoRelatorio({
  titulo,
  descricao,
  aoExportar,
  desabilitado,
}: {
  titulo: string;
  descricao: string;
  aoExportar: () => void;
  desabilitado: boolean;
}) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl p-5 flex flex-col">
      <p className="font-semibold text-neutral-900 mb-1.5">{titulo}</p>
      <p className="text-sm text-neutral-500 leading-relaxed flex-1">{descricao}</p>
      <button
        type="button"
        disabled={desabilitado}
        onClick={aoExportar}
        className="mt-4 self-start inline-flex items-center gap-2 text-sm font-medium bg-aura-900 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-xl px-4 py-2.5 hover:bg-aura-800 transition-colors"
      >
        Exportar CSV
      </button>
    </div>
  );
}
