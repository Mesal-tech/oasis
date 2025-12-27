import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './ui/components/Sidebar';
import { MainLobby } from './ui/screens/MainLobby';
import { GamesScreen } from './ui/screens/GamesScreen';
import { LeaderboardScreen } from './ui/screens/Leaderboard';
import { MarketplaceScreen } from './ui/screens/Marketplace';
import { RewardsScreen } from './ui/screens/Rewards';
import { ArenaScreen } from './ui/screens/ArenaScreen';
import { GameScreen } from './ui/screens/GameScreen';
import { LoginButton } from './components/LoginButton';
import { PlayerProvider } from './state/PlayerContext';

function App() {
  return (
    <Router>
      <PlayerProvider>
        <div className="flex h-screen w-full bg-black text-white">
          <Sidebar />
          <div className="flex-1 overflow-y-scroll w-full relative">
            <Routes>
              <Route path="/" element={<MainLobby />} />
              <Route path="/games" element={<GamesScreen />} />
              <Route path="/leaderboard" element={<LeaderboardScreen />} />
              <Route path="/marketplace" element={<MarketplaceScreen />} />
              <Route path="/rewards" element={<RewardsScreen />} />
              <Route path="/arena" element={<ArenaScreen />} />
              <Route path="/game/:gameId" element={<GameScreen />} />
            </Routes>
          </div>
        </div>
      </PlayerProvider>
    </Router>
  );
}

export default App;
