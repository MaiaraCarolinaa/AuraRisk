import { Router } from 'express';
import { obterSumarioQueimadas } from '../connectors/inpeQueimadas.js';
import { obterSumarioAgua } from '../connectors/ana.js';
import { obterSumarioClima } from '../connectors/inmet.js';
import { obterSumarioVegetacao } from '../connectors/mapbiomas.js';
import type { VisaoGeralRisco } from '../types.js';

export const rotaVisaoGeral = Router();

rotaVisaoGeral.get('/overview', async (_requisicao, resposta) => {
  const [queimadas, agua, clima, vegetacao] = await Promise.all([
    obterSumarioQueimadas(),
    obterSumarioAgua(),
    obterSumarioClima(),
    obterSumarioVegetacao(),
  ]);

  const visaoGeral: VisaoGeralRisco = {
    atualizadoEm: new Date().toISOString(),
    queimadas: {
      aoVivo: queimadas.aoVivo,
      totalFocos: queimadas.totalFocos,
      riscoMedio: queimadas.riscoMedio,
      status: queimadas.status,
      topMunicipios: queimadas.porMunicipio.slice(0, 5),
    },
    recursosHidricos: {
      aoVivo: agua.aoVivo,
      estacoesMonitoradas: agua.estacoesMonitoradas,
      estacoesComLeitura: agua.estacoesComLeitura,
      status: agua.status,
    },
    vegetacao: {
      aoVivo: vegetacao.aoVivo,
      totalAlertas: vegetacao.totalAlertas,
      status: vegetacao.aoVivo ? (vegetacao.totalAlertas && vegetacao.totalAlertas > 100 ? 'alto' : 'moderado') : 'indisponivel',
      nota: vegetacao.nota,
    },
    clima: {
      aoVivo: clima.aoVivo,
      status: clima.status,
      nota: clima.nota,
    },
    energia: { integrado: false, nota: 'Sem fonte oficial gratuita definida neste MVP — módulo pronto para receber integração futura (ex.: ONS/ANEEL).' },
    infraestrutura: { integrado: false, nota: 'Sem fonte oficial gratuita definida neste MVP — módulo pronto para receber integração futura (ex.: DNIT).' },
    deslizamentos: { integrado: false, nota: 'Estimado indiretamente por chuva acumulada (INMET) e uso do solo (MapBiomas) em versões futuras.' },
  };

  resposta.json(visaoGeral);
});
