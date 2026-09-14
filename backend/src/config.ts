export const PORTA = Number(process.env.PORT ?? 4000);

export const TOKEN_MAPBIOMAS = process.env.MAPBIOMAS_TOKEN ?? '';

export const MT_LIMITES: [number, number, number, number] = [-61.63, -18.04, -50.22, -7.35];

export const MT_ESTADO_NOME = 'MATO GROSSO';

export interface Municipio {
  nome: string;
  lat: number;
  lon: number;
  regiao: string;
}

export const MT_MUNICIPIOS: Municipio[] = [
  { nome: 'Cuiabá', lat: -15.601, lon: -56.0974, regiao: 'Centro-Sul' },
  { nome: 'Várzea Grande', lat: -15.6467, lon: -56.1326, regiao: 'Centro-Sul' },
  { nome: 'Rondonópolis', lat: -16.4706, lon: -54.6355, regiao: 'Sudeste' },
  { nome: 'Sinop', lat: -11.8639, lon: -55.5025, regiao: 'Norte' },
  { nome: 'Tangará da Serra', lat: -14.6222, lon: -57.4931, regiao: 'Oeste' },
  { nome: 'Cáceres', lat: -16.0728, lon: -57.6814, regiao: 'Oeste' },
  { nome: 'Sorriso', lat: -12.5453, lon: -55.7217, regiao: 'Norte' },
  { nome: 'Barra do Garças', lat: -15.89, lon: -52.2567, regiao: 'Leste' },
  { nome: 'Alta Floresta', lat: -9.8756, lon: -56.0861, regiao: 'Norte' },
  { nome: 'Primavera do Leste', lat: -15.5581, lon: -54.2967, regiao: 'Sudeste' },
  { nome: 'Juína', lat: -11.3778, lon: -58.7414, regiao: 'Noroeste' },
  { nome: 'Confresa', lat: -10.6444, lon: -51.5697, regiao: 'Nordeste' },
];

export const ANA_MT_CODIGOS_ESTACOES = [
  '956000',
  '758002',
  '951000',
  '66223700',
  '66170000',
  '18409200',
  '66258000',
  '66180000',
];
