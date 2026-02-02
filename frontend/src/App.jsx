import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './ui/components/Sidebar';
import { MainLobby } from './ui/screens/MainLobby';
import { GamesScreen } from './ui/screens/GamesScreen';
import { LeaderboardScreen } from './ui/screens/Leaderboard';
import { MarketplaceScreen } from './ui/screens/Marketplace';
import { RewardsScreen } from './ui/screens/Rewards';
import { ArenaScreen } from './ui/screens/ArenaScreen';
import { GameScreen } from './ui/screens/GameScreen';
import { SupportScreen } from './ui/screens/Support';
import { ProfileInformationScreen } from './ui/screens/profile/Information';
import { DepositWithdrawScreen } from './ui/screens/profile/DepositWithdraw';
import { WalletScreen } from './ui/screens/profile/Wallet';
import { LoginButton } from './components/LoginButton';
import { PlayerProvider } from './state/PlayerContext';
import { ScrollToTop } from './ui/components/ScrollToTop';

function App() {
  const scrollRef = useRef(null);

  return (
    <Router>
      <PlayerProvider>
        <div className="flex h-screen w-full bg-black text-white">
          <Sidebar />
          <div ref={scrollRef} className="flex-1 overflow-y-scroll w-full relative pb-24 md:pb-0">
            <ScrollToTop containerRef={scrollRef} />
            <Routes>
              <Route path="/" element={<MainLobby />} />
              <Route path="/games" element={<GamesScreen />} />
              <Route path="/leaderboard" element={<LeaderboardScreen />} />
              <Route path="/marketplace" element={<MarketplaceScreen />} />
              <Route path="/rewards" element={<RewardsScreen />} />
              <Route path="/arena" element={<ArenaScreen />} />
              <Route path="/game/:gameId" element={<GameScreen />} />
              <Route path="/support" element={<SupportScreen />} />
              <Route path="/profile/information" element={<ProfileInformationScreen />} />
              <Route path="/profile/deposit" element={<DepositWithdrawScreen />} />
              <Route path="/profile/wallet" element={<WalletScreen />} />
            </Routes>
          </div>
        </div>
      </PlayerProvider>
    </Router>
  );
}

export default App;
