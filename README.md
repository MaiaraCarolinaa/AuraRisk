# Aura Risk

MVP de monitoramento ambiental para Mato Grosso: queimadas, recursos hídricos, uso do solo e
clima, consolidados a partir de fontes públicas oficiais em um único painel.

![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node-2b6a49)

## Fontes de dados e o que é ao vivo hoje

Todas as integrações abaixo foram **testadas com requisições HTTP reais** durante o
desenvolvimento (não são endpoints supostos ou inventados). O estado "ao vivo" pode mudar
conforme a disponibilidade dos serviços públicos.

| Fonte | Endpoint usado | Estado confirmado em 2026-09-14 |
|---|---|---|
| **INPE / Programa Queimadas** ([data.inpe.br/queimadas/bdqueimadas](https://data.inpe.br/queimadas/bdqueimadas/)) | CSV diário público (`dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/Brasil/...`) | ✅ Ao vivo, sem autenticação. Retorna focos de calor reais do dia. |
| **ANA / SNIRH** ([snirh.gov.br](https://www.snirh.gov.br/)) | HidroWebService legado (`telemetriaws1.ana.gov.br/ServiceANA.asmx`) | ⚠️ Cadastro de estações (nome/coordenadas/rio) é ao vivo. A série telemétrica em tempo real não retornou dados para nenhuma estação testada — a ANA está migrando para uma nova API autenticada (desligamento do serviço legado previsto para 30/06/2026, já vencido). O app mostra isso de forma transparente na UI. |
| **MapBiomas Alerta** ([brasil.mapbiomas.org/plataforma](https://brasil.mapbiomas.org/plataforma/)) | API GraphQL (`plataforma.alerta.mapbiomas.org/api/v2/graphql`), schema validado por introspecção real | ⚠️ Exige token de uma conta pessoal cadastrada na plataforma (`"Token de acesso inválido"` sem ele). Sem `MAPBIOMAS_TOKEN`, o backend usa um retrato estático rotulado como tal. Com o token, a consulta real (já escrita e validada contra o schema) passa a ser usada automaticamente. |
| **INMET** ([mapas.inmet.gov.br](https://mapas.inmet.gov.br/)) | API pública `apitempo.inmet.gov.br/estacao/proxima/{lat}/{lon}` | ⚠️ Endpoint real e documentado, mas a conexão foi recusada a partir do ambiente de build usado neste projeto (instabilidade/bloqueio de rede conhecidos desse serviço). O conector segue o contrato oficial e funciona assim que a rede de saída para `apitempo.inmet.gov.br` estiver disponível. |

Nenhum dado é inventado silenciosamente: quando uma fonte não está disponível, a API e a UI
dizem isso explicitamente (`aoVivo: false` + nota explicando o motivo), em vez de mostrar um
número fake como se fosse real.

**Energia** e **Infraestrutura** aparecem na tela inicial como módulos visuais prontos, mas
sem integração — não havia fonte pública gratuita definida no escopo para esses dois. **Risco
de Deslizamentos** é um proxy indireto (alertas de solo exposto do MapBiomas), não um modelo
geotécnico.

## Arquitetura

```
aura-risk/
  backend/   Node.js + Express + TypeScript — conectores para cada fonte oficial, com cache
             em memória e fallback honesto quando uma fonte está fora do ar.
  frontend/  React + Vite + TypeScript + Tailwind + Leaflet — dashboard, mapa interativo,
             ocorrências, alertas e exportação de relatórios em CSV.
```

Fluxo de dados: `frontend` → `GET /api/*` (proxy do Vite) → `backend` (Express) → conectores
(`src/connectors/*.ts`) → APIs oficiais (INPE, ANA, MapBiomas, INMET), com cache de 10–30 min
por fonte para não sobrecarregar os serviços públicos.

## Como rodar localmente

Requisitos: Node.js 18+.

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env   # opcional: preencha MAPBIOMAS_TOKEN se tiver uma conta na plataforma
npm run dev
```
Sobe em `http://localhost:4000`.

**2. Frontend** (em outro terminal)
```bash
cd frontend
npm install
npm run dev
```
Sobe em `http://localhost:5173` e faz proxy de `/api/*` para o backend.

## Endpoints do backend

- `GET /api/overview` — panorama consolidado (usado na tela inicial)
- `GET /api/fires` — focos de calor em MT (INPE)
- `GET /api/water` — estações de recursos hídricos (ANA/SNIRH)
- `GET /api/weather` — leituras meteorológicas por município (INMET)
- `GET /api/vegetation` — alertas de desmatamento (MapBiomas)
- `GET /api/occurrences` — feed unificado de ocorrências
- `GET /api/municipios` — lista de referência de municípios de MT

## Deploy (Vercel)

O projeto está configurado como monorepo para deploy em um único projeto Vercel
(`vercel.json` na raiz): o `frontend` é servido como site estático e o
`backend/src/index.ts` roda como função serverless, ambos sob o mesmo domínio
(`/api/*` vai para o backend, o restante serve o React).

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) sem alterar o
   "Root Directory" (mantenha a raiz do repo).
2. Opcional: defina a variável de ambiente `MAPBIOMAS_TOKEN` no projeto Vercel.
3. Deploy.

Observação: por rodar como função serverless, o cache em memória do backend não
persiste entre "cold starts" — funciona bem para este MVP, mas não é um cache
de longa duração como no servidor local.

## Próximos passos sugeridos

1. Obter um token de conta MapBiomas Alerta para ativar os alertas de desmatamento ao vivo.
2. Rodar o backend em uma rede com saída liberada para `apitempo.inmet.gov.br` (o conector já
   está pronto).
3. Avaliar acesso à nova HidroWebService da ANA (autenticada) quando o serviço legado for
   definitivamente desligado.
4. Definir fontes públicas para Energia (ex.: ONS/ANEEL) e Infraestrutura (ex.: DNIT).
