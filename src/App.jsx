import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Welcome from './pages/Welcome';
import AdventureMap from './pages/AdventureMap';
import StarryGarden from './pages/StarryGarden';
import MemoryIsland from './pages/MemoryIsland';
import CakeTown from './pages/CakeTown';
import BirthdayCastle from './pages/BirthdayCastle';
import FinalSurprise from './pages/FinalSurprise';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/map" element={<AdventureMap />} />
      <Route path="/garden" element={<StarryGarden />} />
      <Route path="/memories" element={<MemoryIsland />} />
      <Route path="/cake" element={<CakeTown />} />
      <Route path="/castle" element={<BirthdayCastle />} />
      <Route path="/letter" element={<FinalSurprise />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="app-shell"><AppRoutes /></div>
      </GameProvider>
    </BrowserRouter>
  );
}
