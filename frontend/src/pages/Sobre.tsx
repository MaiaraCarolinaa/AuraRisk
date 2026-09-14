const FONTES = [
  {
    nome: 'INPE — Programa Queimadas (BDQueimadas)',
    url: 'https://data.inpe.br/queimadas/bdqueimadas/',
    uso: 'Focos de calor em tempo quase real, por CSV público (colunas: coordenadas, satélite, município, bioma, risco de fogo, FRP).',
    status: 'Integração ao vivo, sem autenticação.',
  },
  {
    nome: 'ANA / SNIRH — Sistema Nacional de Informações sobre Recursos Hídricos',
    url: 'https://www.snirh.gov.br/',
    uso: 'Cadastro e telemetria de estações fluviométricas/pluviométricas (HidroWebService).',
    status: 'Cadastro das estações é ao vivo. A telemetria em tempo real do serviço legado está indisponível para as estações testadas — a ANA está migrando para uma nova API autenticada (previsão de desligamento do serviço legado em 30/06/2026).',
  },
  {
    nome: 'MapBiomas — Plataforma de Uso e Cobertura do Solo',
    url: 'https://brasil.mapbiomas.org/plataforma/',
    uso: 'Alertas de desmatamento e supressão de vegetação (MapBiomas Alerta, API GraphQL).',
    status: 'A consulta de dados exige uma conta pessoal registrada na plataforma (token). Sem token configurado, exibimos um retrato estático de referência.',
  },
  {
    nome: 'INMET — Instituto Nacional de Meteorologia',
    url: 'https://mapas.inmet.gov.br/',
    uso: 'Estações meteorológicas automáticas mais próximas de cada município (temperatura, umidade, chuva, vento).',
    status: 'API pública documentada (apitempo.inmet.gov.br). Pode ficar temporariamente indisponível dependendo da rede de saída do servidor.',
  },
];

export default function Sobre() {
  return (
    <div className="pt-2 max-w-3xl">
      <h1 className="text-xl font-bold text-neutral-900">Sobre o Aura Risk</h1>
      <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
        O Aura Risk é um painel de monitoramento ambiental para Mato Grosso, construído para consolidar, em um só lugar, dados públicos
        de queimadas, recursos hídricos, uso do solo e clima — permitindo acompanhar riscos ambientais da região em tempo real.
      </p>

      <h2 className="font-semibold text-neutral-900 mb-3">Fontes de dados oficiais</h2>
      <div className="space-y-3 mb-8">
        {FONTES.map((fonte) => (
          <div key={fonte.url} className="bg-white border border-black/5 rounded-2xl p-5">
            <a href={fonte.url} target="_blank" rel="noreferrer" className="font-semibold text-aura-700 hover:underline">
              {fonte.nome} ↗
            </a>
            <p className="text-sm text-neutral-600 mt-1.5">{fonte.uso}</p>
            <p className="text-xs text-neutral-400 mt-2">{fonte.status}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-neutral-900 mb-3">Indicadores ainda não integrados</h2>
      <p className="text-sm text-neutral-600 leading-relaxed mb-2">
        <strong>Energia</strong> e <strong>Infraestrutura</strong> aparecem na tela inicial como módulos preparados para receber dados,
        mas não foram integrados nesta versão por não terem uma fonte pública gratuita definida no escopo do projeto. Sugestões para
        versões futuras: ONS/ANEEL para energia e DNIT para infraestrutura rodoviária.
      </p>
      <p className="text-sm text-neutral-600 leading-relaxed">
        <strong>Risco de deslizamentos</strong> é estimado neste MVP como um proxy indireto, combinando alertas de solo exposto do
        MapBiomas com volume de chuva acumulada — não é um modelo geotécnico validado.
      </p>
    </div>
  );
}
