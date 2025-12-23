import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './ui/components/Sidebar';
import { MainLobby } from './ui/screens/MainLobby';
import { LeaderboardScreen } from './ui/screens/Leaderboard';
import { MarketplaceScreen } from './ui/screens/Marketplace';
import { RewardsScreen } from './ui/screens/Rewards';
import { GameScreen } from './ui/screens/GameScreen';

function App() {
  return (
    <Router>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full relative">
          <Routes>
            <Route path="/" element={<MainLobby />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/marketplace" element={<MarketplaceScreen />} />
            <Route path="/rewards" element={<RewardsScreen />} />
            <Route path="/game/:gameName" element={<GameScreen />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
