import express from 'express';
import cors from 'cors';
import { PORTA } from './config.js';
import { rotaVisaoGeral } from './routes/overview.js';
import { rotaDados } from './routes/data.js';

const aplicativo = express();
aplicativo.use(cors());
aplicativo.use(express.json());

aplicativo.get('/api/health', (_requisicao, resposta) => {
  resposta.json({ status: 'ok', service: 'aura-risk-backend', time: new Date().toISOString() });
});

aplicativo.use('/api', rotaVisaoGeral);
aplicativo.use('/api', rotaDados);

aplicativo.use((erro: unknown, _requisicao: express.Request, resposta: express.Response, _proximo: express.NextFunction) => {
  console.error(erro);
  resposta.status(500).json({ error: 'Erro interno ao consultar fontes de dados.' });
});

aplicativo.listen(PORTA, () => {
  console.log(`Aura Risk backend rodando em http://localhost:${PORTA}`);
});

export default aplicativo;
