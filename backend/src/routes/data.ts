import { Router } from 'express';
import { obterSumarioQueimadas } from '../connectors/inpeQueimadas.js';
import { obterSumarioAgua } from '../connectors/ana.js';
import { obterSumarioClima } from '../connectors/inmet.js';
import { obterSumarioVegetacao } from '../connectors/mapbiomas.js';
import { MT_MUNICIPIOS } from '../config.js';

export const rotaDados = Router();

rotaDados.get('/fires', async (_requisicao, resposta) => {
  resposta.json(await obterSumarioQueimadas());
});

rotaDados.get('/water', async (_requisicao, resposta) => {
  resposta.json(await obterSumarioAgua());
});

rotaDados.get('/weather', async (_requisicao, resposta) => {
  resposta.json(await obterSumarioClima());
});

rotaDados.get('/vegetation', async (_requisicao, resposta) => {
  resposta.json(await obterSumarioVegetacao());
});

rotaDados.get('/municipios', async (_requisicao, resposta) => {
  resposta.json(MT_MUNICIPIOS);
});

rotaDados.get('/occurrences', async (_requisicao, resposta) => {
  const [queimadas, agua, vegetacao] = await Promise.all([obterSumarioQueimadas(), obterSumarioAgua(), obterSumarioVegetacao()]);

  const ocorrencias = [
    ...queimadas.focos.slice(0, 40).map((foco) => ({
      id: `foco-${foco.id}`,
      tipo: 'queimada' as const,
      titulo: `Foco de calor em ${foco.municipio}`,
      municipio: foco.municipio,
      lat: foco.lat,
      lon: foco.lon,
      dataHora: foco.dataHoraGmt,
      severidade: (foco.riscoFogo ?? 0) >= 0.7 ? 'alta' : (foco.riscoFogo ?? 0) >= 0.4 ? 'media' : 'baixa',
      detalhe: `Satélite ${foco.satelite} · Bioma ${foco.bioma} · FRP ${foco.frp ?? '—'} MW · Risco ${foco.riscoFogo ?? '—'}`,
      fonte: 'INPE',
    })),
    ...agua.estacoes
      .filter((estacao) => estacao.status === 'sem_leitura')
      .map((estacao) => ({
        id: `ana-${estacao.codigo}`,
        tipo: 'hidrologico' as const,
        titulo: `Estação sem leitura recente: ${estacao.nome}`,
        municipio: estacao.nome,
        lat: estacao.lat,
        lon: estacao.lon,
        dataHora: null,
        severidade: 'baixa' as const,
        detalhe: 'Estação telemétrica ANA/SNIRH sem dado no período consultado.',
        fonte: 'ANA/SNIRH',
      })),
    ...vegetacao.alertas.map((alerta) => ({
      id: `mb-${alerta.codigo}`,
      tipo: 'vegetacao' as const,
      titulo: `Alerta de desmatamento (${alerta.areaHa ?? '—'} ha)`,
      municipio: alerta.municipios[0] ?? '—',
      lat: alerta.lat,
      lon: alerta.lon,
      dataHora: alerta.detectadoEm,
      severidade: (alerta.areaHa ?? 0) >= 20 ? 'alta' : 'media',
      detalhe: `Status: ${alerta.status ?? '—'}`,
      fonte: 'MapBiomas Alerta',
    })),
  ];

  resposta.json({ atualizadoEm: new Date().toISOString(), total: ocorrencias.length, ocorrencias });
});
