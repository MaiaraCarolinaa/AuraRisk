import aplicativo from './app.js';
import { PORTA } from './config.js';

aplicativo.listen(PORTA, () => {
  console.log(`Aura Risk backend rodando em http://localhost:${PORTA}`);
});
