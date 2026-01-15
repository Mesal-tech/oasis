import React, { useState, useEffect } from 'react';
import { WhotGameLogic } from '../logic/GameLogic';
import WhotCardComponent from './WhotCard';
import { WhotCard, type WhotShape } from '../logic/Card';
import { Settings } from 'lucide-react';

interface WhotBoardProps {
  playerName?: string;
  difficulty?: string;
  onGameOver?: (winner: string) => void;
}

const WhotBoard: React.FC<WhotBoardProps> = ({ playerName = 'Bruh', difficulty = 'medium', onGameOver }) => {
  const [game, setGame] = useState<WhotGameLogic>(() => new WhotGameLogic([playerName, 'Adamu', 'Seyi', 'Festus', 'Hawa']));
  const [updateToggle, setUpdateToggle] = useState(0);
  const [lastAction, setLastAction] = useState<string>('');

  const forceUpdate = () => setUpdateToggle(prev => prev + 1);

  const resetGame = () => {
    setGame(new WhotGameLogic([playerName, 'Adamu', 'Seyi', 'Festus', 'Hawa']));
    setLastAction('New game started');
    forceUpdate();
  };

  useEffect(() => {
    if (game.gameOver && onGameOver) {
      onGameOver(game.winner?.name || 'Someone');
    }

    if (game.currentPlayerIndex !== 0 && !game.gameOver) {
      const aiPlayer = game.getCurrentPlayer();
      const topCard = game.deck.getTopCard();
      const delay = 1200 + Math.random() * 800;

      const timer = setTimeout(() => {
        const playableCards = aiPlayer.getPlayableCards(topCard!, game.requestedShape);
        
        if (playableCards.length > 0) {
          const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
          let chosenShape: WhotShape | null = null;
          
          if (cardToPlay.isWhot()) {
            const shapes: WhotShape[] = ['Circle', 'Triangle', 'Cross', 'Square', 'Star'];
            chosenShape = shapes[Math.floor(Math.random() * shapes.length)];
          }
          
          game.playCard(cardToPlay, chosenShape);
          setLastAction(`${aiPlayer.name} played ${cardToPlay.shape} ${cardToPlay.number}`);
        } else {
          game.drawCard();
          setLastAction(`${aiPlayer.name} drew a card`);
        }
        forceUpdate();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [game.currentPlayerIndex, updateToggle, game.gameOver, onGameOver]);

  const handlePlayCard = (card: WhotCard) => {
    if (game.currentPlayerIndex !== 0 || game.gameOver) return; 

    let chosenShape: WhotShape | null = null;
    if (card.isWhot()) {
      const shapes: WhotShape[] = ['Circle', 'Triangle', 'Cross', 'Square', 'Star'];
      chosenShape = prompt(`Choose a shape: ${shapes.join(', ')}`) as WhotShape;
      if (!shapes.includes(chosenShape as any)) chosenShape = 'Circle';
    }

    const success = game.playCard(card, chosenShape);
    if (success) {
      setLastAction(`You played ${card.shape} ${card.number}`);
      forceUpdate();
    }
  };

  const handleDrawCard = () => {
    if (game.currentPlayerIndex !== 0 || game.gameOver) return;
    game.drawCard();
    setLastAction(`You drew a card`);
    forceUpdate();
  };

  const currentPlayer = game.getCurrentPlayer();
  const topCard = game.deck.getTopCard();

  return (
    <div className="relative w-full h-full min-h-screen bg-[url('/assets/whot_dark_oak_bg.png')] bg-cover bg-center overflow-hidden flex flex-col select-none antialiased font-sans">
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      
      {/* 1. TOP AI PLAYERS (Adamu, Seyi) */}
      <div className="absolute top-[8%] inset-x-0 flex justify-around px-2 sm:px-4 pointer-events-none z-10">
        {[game.players[1], game.players[2]].map((p, pIdx) => (
          <div key={p.name} className="flex flex-col items-center w-36 sm:w-44">
            {/* Stationary Hand Area */}
            <div className="relative w-full h-20 mb-4 sm:mb-8">
              {p.hand.map((_, i) => {
                // Stationary: Position depends ONLY on index 'i', not hand size
                // We anchor around index 2 to keep it roughly centered for normal hands 
                const rotation = (i - 2) * 8;
                const xOffset = (i - 2) * 12;
                return (
                  <WhotCardComponent 
                    key={`${p.name}-${i}`} 
                    card={null as any} 
                    isFaceUp={false} 
                    className="absolute left-1/2 -ml-8 bottom-0 scale-[0.55] sm:scale-[0.65] origin-bottom shadow-xl transition-all duration-300" 
                    style={{ transform: `translateX(${xOffset}px) rotate(${rotation}deg)` }}
                  />
                );
              })}
            </div>
            <div className={`flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border ${currentPlayer.name === p.name ? 'border-[#00ff88]/30' : 'border-white/5'}`}>
              <span className={`text-[#a1887f] font-bold text-[10px] sm:text-[13px] uppercase tracking-wider ${currentPlayer.name === p.name ? 'text-[#00ff88]' : ''}`}>{p.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. SIDE AI PLAYERS (Festus, Hawa) */}
      <div className="absolute top-[38%] inset-x-0 flex items-center justify-between px-2 sm:px-12 pointer-events-none z-10">
        {[game.players[3], game.players[4]].map((p, pIdx) => (
          <div key={p.name} className="flex flex-col items-center w-32 sm:w-40">
            <div className="relative w-full h-20 mb-6 sm:mb-10">
              {p.hand.map((_, i) => {
                // Stationary indexing
                const rotation = (i - 2) * 8 + (pIdx === 0 ? -15 : 15);
                const xOffset = (i - 2) * 10;
                return (
                  <WhotCardComponent 
                    key={`${p.name}-${i}`} 
                    card={null as any} 
                    isFaceUp={false} 
                    className="absolute left-1/2 -ml-8 bottom-0 scale-[0.55] sm:scale-[0.65] origin-bottom shadow-xl transition-all duration-300" 
                    style={{ transform: `translateX(${xOffset}px) rotate(${rotation}deg)` }}
                  />
                );
              })}
            </div>
            <div className={`flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border ${currentPlayer.name === p.name ? 'border-[#00ff88]/30' : 'border-white/5'}`}>
              <span className={`text-[#a1887f] font-bold text-[10px] sm:text-[13px] uppercase tracking-wider ${currentPlayer.name === p.name ? 'text-[#00ff88]' : ''}`}>{p.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. CENTER TABLE AREA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* DISCARD PILE */}
        <div className="relative w-24 h-36 -translate-y-6 sm:-translate-y-10 flex items-center justify-center scale-[0.85] sm:scale-105">
            {game.deck.getDiscardPile().length > 0 && (
              <WhotCardComponent 
                card={game.deck.getTopCard()!} 
                isPlayable={false} 
                className="absolute inset-0 shadow-2xl border border-black/5 pointer-events-none rotate-[8deg]"
              />
            )}
            {game.requestedShape && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white shadow-2xl rounded-full border-2 border-[#00ff88] text-black text-[11px] sm:text-[13px] font-black whitespace-nowrap z-[100] animate-bounce pointer-events-auto">
                    {game.requestedShape.toUpperCase()}
                </div>
            )}
        </div>

        {/* DRAW DECK - Below Discard as per Mobile Inspo */}
        <div className="relative w-24 h-36 mt-10 sm:mt-16 pointer-events-auto cursor-pointer group scale-[0.85] sm:scale-110" onClick={handleDrawCard}>
            <div className="absolute inset-x-0 bottom-0 h-4 bg-black/40 blur-lg rounded-full mx-auto w-4/5 translate-y-4"></div>
            {[...Array(12)].map((_, i) => (
                <div 
                    key={`deck-layer-${i}`}
                    className="absolute inset-0 bg-[#4e2c2c] rounded-xl border-b-[1px] border-black/40 shadow-inner"
                    style={{ transform: `translateY(${i * 1.2}px)`, zIndex: -i }}
                />
            ))}
            <WhotCardComponent card={null as any} isFaceUp={false} className="absolute inset-0 shadow-2xl transition-transform group-hover:-translate-y-2 active:translate-y-0" />
            {game.deck.getRemainingCount() > 0 && (
                <div className="absolute -top-3 -right-3 min-w-[1.85rem] h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-[10px] border-2 border-white/20 z-50 shadow-xl px-1">
                    {game.deck.getRemainingCount()}
                </div>
            )}
        </div>
      </div>

      {/* 4. PLAYER AREA (Bottom) */}
      <div className="absolute bottom-6 sm:bottom-12 inset-x-0 flex flex-col items-center">
        {/* Turn Indicator - Match Mobile Inspo Arrangement */}
        <div className="flex items-center space-x-3 mb-6 sm:mb-10">
            <div className={`w-3.5 h-3.5 rounded-full ${currentPlayer.name === playerName ? 'bg-[#00ff22] shadow-[0_0_15px_#00ff22]' : 'bg-gray-800'}`}></div>
            <span className="text-[#a1887f] font-black text-[16px] sm:text-[22px] uppercase tracking-[0.15em]">{playerName}</span>
        </div>
        
        {/* Spread/Fanned Hand */}
        <div className="relative w-full max-w-full h-40 flex justify-center items-end px-2 overflow-visible">
            {game.players[0].hand.map((card, i, arr) => {
                const isPlayable = game.currentPlayerIndex === 0 && card.canPlayOn(topCard!, game.requestedShape);
                const mid = (arr.length - 1) / 2;
                const rotation = (i - mid) * (arr.length > 8 ? 5 : 8);
                const xOffset = (i - mid) * (arr.length > 8 ? 25 : 35);
                const yOffset = Math.pow(Math.abs(i - mid), 1.4) * (arr.length > 8 ? 2 : 4);

                return (
                    <WhotCardComponent 
                        key={card.id} 
                        card={card} 
                        isPlayable={isPlayable}
                        onClick={() => handlePlayCard(card)}
                        style={{
                            transform: `translateX(${xOffset}px) rotate(${rotation}deg) translateY(${yOffset}px)`,
                            zIndex: i
                        }}
                        className="absolute bottom-0 scale-[0.85] sm:scale-110 hover:z-50 transition-all duration-300 active:-translate-y-4"
                    />
                );
            })}
        </div>
      </div>

      {/* Settings Top Right */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[200]">
        <button className="text-white/30 hover:text-white transition-all hover:scale-110 active:rotate-90 duration-300">
            <Settings size={32} />
        </button>
      </div>

      {/* GAME OVER OVERLAY */}
      {game.gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[500] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="relative mb-8 text-center px-4">
                <h2 className={`text-7xl sm:text-9xl font-black italic tracking-tighter ${game.winner?.name === playerName ? 'text-[#00ff88]' : 'text-red-500'} drop-shadow-2xl`}>
                    {game.winner?.name === playerName ? 'VICTORY' : 'DEFEAT'}
                </h2>
                <p className="text-white/70 text-lg sm:text-2xl font-bold mt-6 tracking-[0.25em] uppercase">
                    {game.winner?.name === playerName ? 'Mastermind at play!' : `${game.winner?.name} claimed the table.`}
                </p>
            </div>
            
            <button 
                onClick={resetGame}
                className="group relative px-16 py-5 bg-white text-black font-extrabold text-xl sm:text-2xl uppercase tracking-widest rounded-full transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
                Play Again
            </button>
        </div>
      )}
    </div>
  );
};

export default WhotBoard;
