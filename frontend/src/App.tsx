import { Route, Routes } from 'react-router-dom';
import BarraLateral from './components/Sidebar';
import BarraSuperior from './components/TopBar';
import NavegacaoMobile from './components/MobileNav';
import Inicio from './pages/Home';
import Mapa from './pages/Mapa';
import Ocorrencias from './pages/Ocorrencias';
import Alertas from './pages/Alertas';
import Relatorios from './pages/Relatorios';
import Sobre from './pages/Sobre';

export default function Aplicativo() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-aura-bg">
      <BarraLateral />
      <div className="flex-1 flex flex-col min-w-0">
        <BarraSuperior />
        <NavegacaoMobile />
        <main className="flex-1 overflow-y-auto px-6 md:px-8 pb-8">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/ocorrencias" element={<Ocorrencias />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/sobre" element={<Sobre />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
