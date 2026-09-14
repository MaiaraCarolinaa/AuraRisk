export interface FocoCalor {
  id: string;
  lat: number;
  lon: number;
  municipio: string;
  dataHoraGmt: string;
  satelite: string;
  bioma: string;
  diasSemChuva: number | null;
  precipitacao: number | null;
  riscoFogo: number | null;
  frp: number | null;
}

export interface SumarioQueimadas {
  fonte: 'INPE / Programa Queimadas (BDQueimadas)';
  aoVivo: boolean;
  atualizadoEm: string;
  dataReferencia: string;
  totalFocos: number;
  riscoMedio: number | null;
  status: NivelRisco;
  porMunicipio: { municipio: string; focos: number }[];
  focos: FocoCalor[];
}

export interface LeituraAgua {
  dataHora: string;
  cota: number | null;
  vazao: number | null;
  chuva: number | null;
}

export interface EstacaoAgua {
  codigo: string;
  nome: string;
  lat: number;
  lon: number;
  rioCodigo: string | null;
  ultimaLeitura: LeituraAgua | null;
  status: 'com_leitura' | 'sem_leitura';
}

export interface SumarioAgua {
  fonte: 'ANA / SNIRH (HidroWebService - Telemetria)';
  aoVivo: boolean;
  atualizadoEm: string;
  estacoesMonitoradas: number;
  estacoesComLeitura: number;
  status: NivelRisco;
  estacoes: EstacaoAgua[];
}

export interface LeituraClima {
  municipio: string;
  lat: number;
  lon: number;
  codigoEstacao: string | null;
  dataHora: string | null;
  temperatura: number | null;
  umidade: number | null;
  precipitacao: number | null;
  ventoVelocidade: number | null;
  disponivel: boolean;
}

export interface SumarioClima {
  fonte: 'INMET (apitempo.inmet.gov.br)';
  aoVivo: boolean;
  atualizadoEm: string;
  status: NivelRisco;
  nota: string | null;
  estacoes: LeituraClima[];
}

export interface AlertaVegetacao {
  codigo: number;
  areaHa: number | null;
  detectadoEm: string | null;
  publicadoEm: string | null;
  status: string | null;
  municipios: string[];
  lat: number | null;
  lon: number | null;
}

export interface SumarioVegetacao {
  fonte: 'MapBiomas Alerta';
  aoVivo: boolean;
  atualizadoEm: string;
  nota: string;
  totalAlertas: number | null;
  areaTotalHa: number | null;
  porMunicipio: { municipio: string; alertas: number; areaHa: number }[];
  alertas: AlertaVegetacao[];
}

export type NivelRisco = 'baixo' | 'moderado' | 'alto' | 'critico' | 'indisponivel';

export interface VisaoGeralRisco {
  atualizadoEm: string;
  queimadas: {
    aoVivo: boolean;
    totalFocos: number;
    riscoMedio: number | null;
    status: NivelRisco;
    topMunicipios: { municipio: string; focos: number }[];
  };
  recursosHidricos: {
    aoVivo: boolean;
    estacoesMonitoradas: number;
    estacoesComLeitura: number;
    status: NivelRisco;
  };
  vegetacao: {
    aoVivo: boolean;
    totalAlertas: number | null;
    status: NivelRisco;
    nota: string;
  };
  clima: {
    aoVivo: boolean;
    status: NivelRisco;
    nota: string | null;
  };
  energia: { integrado: false; nota: string };
  infraestrutura: { integrado: false; nota: string };
  deslizamentos: { integrado: false; nota: string };
}
