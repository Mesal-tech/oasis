import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WhotGameLogic } from '../logic/GameLogic';
import WhotCardComponent from './WhotCard';
import { WhotCard, type WhotShape } from '../logic/Card';
import { Pause, Play, Home, RotateCcw, X } from 'lucide-react';
import gsap from 'gsap';

interface WhotBoardProps {
  playerName?: string;
  difficulty?: string;
  onGameOver?: (winner: string) => void;
}

const WhotBoard: React.FC<WhotBoardProps> = ({ playerName = 'Bruh', difficulty = 'medium', onGameOver }) => {
  const [game, setGame] = useState<WhotGameLogic>(() => new WhotGameLogic([playerName, 'Adamu', 'Seyi', 'Festus', 'Hawa'], false));
  const [updateToggle, setUpdateToggle] = useState(0);
  const [lastAction, setLastAction] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<WhotCard | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const hasDealtRef = useRef(false);
  const drawingLockRef = useRef(false);

  const navigate = useNavigate();
  const deckRef = useRef<HTMLDivElement>(null);
  const discardRef = useRef<HTMLDivElement>(null);
  const playerHandRef = useRef<HTMLDivElement>(null);
  const aiRefs = useRef<(HTMLDivElement | null)[]>([]);

  const forceUpdate = () => setUpdateToggle(prev => prev + 1);

  const resetGame = () => {
    hasDealtRef.current = false;
    setGame(new WhotGameLogic([playerName, 'Adamu', 'Seyi', 'Festus', 'Hawa'], false));
    setLastAction('New game started');
  };

  const animateInitialDeal = async () => {
    if (isDealing || hasDealtRef.current) return;
    setIsDealing(true);
    hasDealtRef.current = true;
    setLastAction('Dealing cards...');

    const playersCount = game.players.length;
    const cardsPerPlayer = 5;

    // Deal 5 cards to each player sequentially
    for (let c = 0; c < cardsPerPlayer; c++) {
        for (let pIdx = 0; pIdx < playersCount; pIdx++) {
            if (deckRef.current) {
                const fromRect = deckRef.current.getBoundingClientRect();
                let toRect: DOMRect | null = null;
                let targetScale = 1;

                if (pIdx === 0 && playerHandRef.current) {
                    toRect = playerHandRef.current.getBoundingClientRect();
                    targetScale = window.innerWidth < 640 ? 0.85 : 1.1;
                } else if (aiRefs.current[pIdx - 1]) {
                    toRect = aiRefs.current[pIdx - 1]!.getBoundingClientRect();
                    targetScale = window.innerWidth < 640 ? 0.55 : 0.65;
                }

                if (toRect) {
                    await animateCardMove(fromRect, toRect, false, undefined, { endScale: targetScale });
                    const card = game.deck.draw();
                    if (card) game.players[pIdx].addCard(card);
                    forceUpdate();
                }
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    // Flip the first card to discard pile
    if (deckRef.current && discardRef.current) {
        const fromRect = deckRef.current.getBoundingClientRect();
        const toRect = discardRef.current.getBoundingClientRect();
        
        // Find what the first card will be
        let firstCard = game.deck.draw();
        while (firstCard && firstCard.isSpecial()) {
            game.deck.discard(firstCard);
            firstCard = game.deck.draw();
        }
        
        if (firstCard) {
            await animateCardMove(fromRect, toRect, true, firstCard, { endScale: window.innerWidth < 640 ? 0.85 : 1.05 });
            game.deck.discard(firstCard);
            setLastAction('Game Start!');
            forceUpdate();
        }
    }

    setIsDealing(false);
  };

  useEffect(() => {
    // Initial deal only if players have no cards and we haven't dealt yet
    if (game.players.every(p => p.hand.length === 0) && !isDealing && !hasDealtRef.current && !game.gameOver) {
        animateInitialDeal();
    }
  }, [game]);

  const getShapeSVG = (shape: WhotShape) => {
    switch (shape) {
      case 'Circle': return '<circle cx="50" cy="50" r="40" fill="currentColor" />';
      case 'Triangle': return '<polygon points="50,10 90,85 10,85" fill="currentColor" />';
      case 'Cross': return '<path d="M35,10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z" fill="currentColor" />';
      case 'Square': return '<rect x="15" y="15" width="70" height="70" fill="currentColor" />';
      case 'Star': return '<polygon points="50,5 63,35 95,35 70,55 80,85 50,70 20,85 30,55 5,35 37,35" fill="currentColor" />';
      case 'Whot': return '<text x="50" y="65" fontSize="30" fontWeight="bold" textAnchor="middle" fill="currentColor" style="font-family: serif">Whot!</text>';
      default: return '';
    }
  };

  const animateCardMove = (
    fromRect: DOMRect, 
    toRect: DOMRect, 
    isFaceUp: boolean, 
    cardData?: WhotCard, 
    params: { startScale?: number; endScale?: number } = {}
  ) => {
    return new Promise<void>((resolve) => {
      const ghost = document.createElement('div');
      ghost.className = 'fixed z-[1000] pointer-events-none flex flex-col items-center justify-center';
      document.body.appendChild(ghost);

      // Base dimensions are 96x144. We calculate centers to avoid scaling issues with wide containers.
      const startScale = params.startScale || (fromRect.width > 0 ? fromRect.width / 96 : 1);
      const endScale = params.endScale || 1;
      
      const fromCenterX = fromRect.left + fromRect.width / 2;
      const fromCenterY = fromRect.top + fromRect.height / 2;
      const toCenterX = toRect.left + toRect.width / 2;
      const toCenterY = toRect.top + toRect.height / 2;

      ghost.style.width = '96px';
      ghost.style.height = '144px';
      ghost.style.top = '0';
      ghost.style.left = '0';
      ghost.style.borderRadius = '0.75rem';
      ghost.style.backgroundColor = isFaceUp ? 'white' : '#5d3a3a';
      ghost.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
      ghost.style.border = '1px solid rgba(0,0,0,0.1)';
      ghost.style.transformOrigin = 'center';
      ghost.style.opacity = '1';
      
      if (!isFaceUp) {
          ghost.innerHTML = `
            <div style="position:absolute;inset:8px;border:1px solid rgba(125,90,90,0.3);border-radius:8px"></div>
            <div style="color:#a67c7c;font-weight:bold;font-size:18px;transform:rotate(45deg);opacity:0.4">Whot!</div>
            <div style="color:#a67c7c;font-weight:bold;font-size:18px;transform:rotate(-45deg);opacity:0.4;position:absolute">Whot!</div>
          `;
      } else if (cardData) {
          const shapeSVG = getShapeSVG(cardData.shape);
          ghost.innerHTML = `
            <div style="position:absolute;top:4px;left:8px;display:flex;flex-direction:column;align-items:center;color:#3d2a2a">
                <div style="font-weight:bold;font-size:12px;line-height:1">${cardData.number}</div>
                <svg viewBox="0 0 100 100" style="width:12px;height:12px">${shapeSVG}</svg>
            </div>
            <div style="width:56px;height:56px;color:#3d2a2a">
                <svg viewBox="0 0 100 100" style="width:100%;height:100%">${shapeSVG}</svg>
            </div>
            <div style="position:absolute;bottom:4px;right:8px;display:flex;flex-direction:column;align-items:center;color:#3d2a2a;transform:rotate(180deg)">
                <div style="font-weight:bold;font-size:12px;line-height:1">${cardData.number}</div>
                <svg viewBox="0 0 100 100" style="width:12px;height:12px">${shapeSVG}</svg>
            </div>
          `;
      }

      gsap.fromTo(ghost, 
        { 
            x: fromCenterX - 48, 
            y: fromCenterY - 72, 
            scale: startScale,
            rotation: 0
        },
        { 
            x: toCenterX - 48, 
            y: toCenterY - 72, 
            scale: endScale,
            rotation: isFaceUp ? 8 : 0,
            duration: 0.6, 
            ease: "power2.inOut",
            onComplete: () => {
                document.body.removeChild(ghost);
                resolve();
            }
        }
      );
    });
  };

  const processSequentialDraws = async () => {
    if (drawingLockRef.current || isDrawing) return;
    drawingLockRef.current = true;
    setIsDrawing(true);

    const player = game.getCurrentPlayer();
    const playerIdx = game.currentPlayerIndex;
    
    while (player.cardsToDraw > 0) {
        setLastAction(`${player.name} is picking cards...`);
        
        if (deckRef.current) {
            const fromRect = deckRef.current.getBoundingClientRect();
            let toRect: DOMRect | null = null;
            let targetScale = 1;
            
            if (playerIdx === 0 && playerHandRef.current) {
                toRect = playerHandRef.current.getBoundingClientRect();
                targetScale = window.innerWidth < 640 ? 0.85 : 1.1; // Match WhotBoard player hand scale
            } else if (aiRefs.current[playerIdx - 1]) {
                toRect = aiRefs.current[playerIdx - 1]!.getBoundingClientRect();
                targetScale = window.innerWidth < 640 ? 0.55 : 0.65; // Match AI hand scale
            }
            
            if (toRect) {
                await animateCardMove(fromRect, toRect, false, undefined, { endScale: targetScale });
            }
        }

        const skipAdvance = player.cardsToDraw > 1;
        game.drawCard(skipAdvance);
        player.cardsToDraw -= 1;
        forceUpdate();
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsDrawing(false);
    drawingLockRef.current = false;
    forceUpdate();
  };

  useEffect(() => {
    if (game.gameOver && onGameOver) {
      onGameOver(game.winner?.name || 'Someone');
    }

    if (game.currentPlayerIndex !== 0 && !game.gameOver && !isDrawing && !isPaused && !isDealing && !drawingLockRef.current) {
      const aiPlayer = game.getCurrentPlayer();
      
      if (aiPlayer.cardsToDraw > 0) {
        processSequentialDraws();
        return;
      }

      const topCard = game.deck.getTopCard();
      const delay = 1500 + Math.random() * 1000;

      const timer = setTimeout(async () => {
        const playableCards = aiPlayer.getPlayableCards(topCard!, game.requestedShape);
        
        if (playableCards.length > 0) {
          const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
          let chosenShape: WhotShape | null = null;
          
          if (cardToPlay.isWhot()) {
            const shapes: WhotShape[] = ['Circle', 'Triangle', 'Cross', 'Square', 'Star'];
            chosenShape = shapes[Math.floor(Math.random() * shapes.length)];
          }
          
          // Animate AI play
          const playerIdx = game.currentPlayerIndex;
          const aiHandEl = aiRefs.current[playerIdx - 1];
          if (aiHandEl && discardRef.current) {
              const cardEl = aiHandEl.querySelector(`.card-id-${cardToPlay.id}`) as HTMLElement;
              if (cardEl) cardEl.style.opacity = '0';
              const fromRect = aiHandEl.getBoundingClientRect();
              const toRect = discardRef.current.getBoundingClientRect();
              const targetScale = window.innerWidth < 640 ? 0.85 : 1.05;
              await animateCardMove(fromRect, toRect, true, cardToPlay, { endScale: targetScale });
              if (cardEl) cardEl.style.opacity = '1';
          }
          
          game.playCard(cardToPlay, chosenShape);
          setLastAction(`${aiPlayer.name} played ${cardToPlay.shape} ${cardToPlay.number}`);
        } else {
          // Animate AI draw
          if (deckRef.current && aiRefs.current[game.currentPlayerIndex - 1]) {
              const fromRect = deckRef.current.getBoundingClientRect();
              const toRect = aiRefs.current[game.currentPlayerIndex - 1]!.getBoundingClientRect();
              const targetScale = window.innerWidth < 640 ? 0.55 : 0.65;
              await animateCardMove(fromRect, toRect, false, undefined, { endScale: targetScale });
          }
          game.drawCard();
          setLastAction(`${aiPlayer.name} drew a card`);
        }
        forceUpdate();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [game.currentPlayerIndex, updateToggle, game.gameOver, isDrawing, isPaused]);

  useEffect(() => {
    if (game.players[0].cardsToDraw > 0 && !isDrawing && game.currentPlayerIndex === 0 && !isDealing && !drawingLockRef.current) {
        processSequentialDraws();
    }
  }, [game.players[0].cardsToDraw, isDrawing, game.currentPlayerIndex]);

  const handlePlayCard = async (card: WhotCard) => {
    if (game.currentPlayerIndex !== 0 || game.gameOver || isDrawing || isDealing) return; 

    if (card.isWhot()) {
      setPendingCard(card);
      setShowShapePicker(true);
      return;
    }

    await executePlayCard(card);
  };

  const executePlayCard = async (card: WhotCard, chosenShape: WhotShape | null = null) => {
    // Capture starting position of the card in hand
    const cardEl = document.querySelector(`.player-hand .card-id-${card.id}`) as HTMLElement;
    if (cardEl && discardRef.current) {
        cardEl.style.opacity = '0';
        const fromRect = cardEl.getBoundingClientRect();
        const toRect = discardRef.current.getBoundingClientRect();
        const targetScale = window.innerWidth < 640 ? 0.85 : 1.05;
        await animateCardMove(fromRect, toRect, true, card, { endScale: targetScale });
        cardEl.style.opacity = '1';
    }

    const success = game.playCard(card, chosenShape);
    if (success) {
      setLastAction(`You played ${card.shape} ${card.number}`);
      forceUpdate();
    }
  };

  const handleShapeSelect = async (shape: WhotShape) => {
    if (!pendingCard) return;
    const card = pendingCard;
    setPendingCard(null);
    setShowShapePicker(false);
    await executePlayCard(card, shape);
  };

  const handleDrawCard = async () => {
    if (game.currentPlayerIndex !== 0 || game.gameOver || isDrawing || isDealing || drawingLockRef.current) return;
    
    drawingLockRef.current = true;
    setIsDrawing(true);

    if (deckRef.current && playerHandRef.current) {
        const fromRect = deckRef.current.getBoundingClientRect();
        const toRect = playerHandRef.current.getBoundingClientRect();
        const targetScale = window.innerWidth < 640 ? 0.85 : 1.1;
        await animateCardMove(fromRect, toRect, false, undefined, { endScale: targetScale });
    }
    
    game.drawCard();
    setLastAction(`You drew a card`);
    setIsDrawing(false);
    drawingLockRef.current = false;
    forceUpdate();
  };

  const currentPlayer = game.getCurrentPlayer();
  const topCard = game.deck.getTopCard();

  return (
    <div className="relative w-full h-full min-h-screen bg-[#24150e] overflow-hidden flex flex-col select-none antialiased font-sans">
      {/* WOOD TEXTURE */}
      <div className="absolute inset-0 bg-[url('/assets/whot_dark_oak_bg.png')] bg-cover bg-center pointer-events-none opacity-60"></div>
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      
      {/* 1. TOP AI PLAYERS (Adamu, Seyi) */}
      <div className="absolute top-[8%] inset-x-0 flex justify-around px-2 sm:px-4 pointer-events-none z-10">
        {[game.players[1], game.players[2]].map((p, pIdx) => (
          <div key={p.name} ref={(el) => { aiRefs.current[pIdx] = el; }} className="flex flex-col items-center w-36 sm:w-44">
            <div className="relative w-full h-20 mb-4 sm:mb-8 text-center flex justify-center">
              {p.hand.map((card, i) => {
                const rotation = (i - 2) * 8;
                const xOffset = (i - 2) * 12;
                return (
                  <WhotCardComponent 
                    key={card.id} 
                    card={card} 
                    isFaceUp={false} 
                    className={`absolute left-1/2 -ml-8 bottom-0 scale-[0.55] sm:scale-[0.65] origin-bottom shadow-xl transition-all duration-300 card-id-${card.id}`} 
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
          <div key={p.name} ref={(el) => { aiRefs.current[pIdx + 2] = el; }} className="flex flex-col items-center w-32 sm:w-40">
            <div className="relative w-full h-20 mb-6 sm:mb-10 text-center flex justify-center">
              {p.hand.map((card, i) => {
                const rotation = (i - 2) * 8 + (pIdx === 0 ? -15 : 15);
                const xOffset = (i - 2) * 10;
                return (
                  <WhotCardComponent 
                    key={card.id} 
                    card={card} 
                    isFaceUp={false} 
                    className={`absolute left-1/2 -ml-8 bottom-0 scale-[0.55] sm:scale-[0.65] origin-bottom shadow-xl transition-all duration-300 card-id-${card.id}`} 
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
        <div ref={discardRef} className="relative w-24 h-36 -translate-y-6 sm:-translate-y-10 flex items-center justify-center scale-[0.85] sm:scale-105">
            {game.deck.getDiscardPile().slice(-1).map((card) => (
              <WhotCardComponent 
                key={`top-${card.id}`} 
                card={card} 
                isPlayable={false} 
                className={`absolute inset-0 shadow-2xl border border-black/5 pointer-events-none rotate-[8deg] card-id-${card.id}`}
              />
            ))}
            {game.requestedShape && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white shadow-2xl rounded-full border-2 border-[#00ff88] text-black text-[11px] sm:text-[13px] font-black whitespace-nowrap z-[100] animate-bounce pointer-events-auto">
                    {game.requestedShape.toUpperCase()}
                </div>
            )}
        </div>

        <div ref={deckRef} className="relative w-24 h-36 mt-10 sm:mt-16 pointer-events-auto cursor-pointer group scale-[0.85] sm:scale-110" onClick={handleDrawCard}>
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
        <div className="flex items-center space-x-3 mb-6 sm:mb-10">
            <div className={`w-3.5 h-3.5 rounded-full ${currentPlayer.name === playerName ? 'bg-[#00ff22] shadow-[0_0_15px_#00ff22]' : 'bg-gray-800'}`}></div>
            <span className="text-[#a1887f] font-black text-[16px] sm:text-[22px] uppercase tracking-[0.15em]">{playerName}</span>
        </div>
        
        <div ref={playerHandRef} className="relative w-full max-w-full h-40 flex justify-center items-end px-2 overflow-visible player-hand">
            {game.players[0].hand.map((card, i, arr) => {
                const isPlayable = !!(game.currentPlayerIndex === 0 && topCard && card.canPlayOn(topCard, game.requestedShape));
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
                        className={`absolute bottom-0 scale-[0.85] sm:scale-110 hover:z-50 transition-all duration-300 active:-translate-y-4 card-id-${card.id}`}
                    />
                );
            })}
        </div>
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[200]">
        <button 
          onClick={() => setIsPaused(true)}
          className="text-white/30 hover:text-white transition-all hover:scale-110 active:scale-95 duration-300"
        >
            <Pause size={32} fill="currentColor" />
        </button>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-[700] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#2c1a12] border-2 border-white/10 rounded-[3rem] p-12 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* DECORATIVE ELEMENTS */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-40 bg-[#00ff88]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <h3 className="text-[#00ff88] text-4xl font-black text-center mb-12 tracking-tighter uppercase italic">PAUSED</h3>
            
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => setIsPaused(false)}
                className="group flex items-center space-x-4 w-full p-4 bg-white/5 hover:bg-[#00ff88] rounded-2xl transition-all duration-300 transform hover:translate-x-2"
              >
                <div className="w-12 h-12 bg-white/10 group-hover:bg-black/20 rounded-xl flex items-center justify-center text-white transition-colors">
                  <Play size={24} fill="currentColor" />
                </div>
                <span className="text-white font-black text-xl tracking-wider group-hover:text-black uppercase">Resume Game</span>
              </button>

              <button 
                onClick={() => { resetGame(); setIsPaused(false); }}
                className="group flex items-center space-x-4 w-full p-4 bg-white/5 hover:bg-white rounded-2xl transition-all duration-300 transform hover:translate-x-2"
              >
                <div className="w-12 h-12 bg-white/10 group-hover:bg-black/20 rounded-xl flex items-center justify-center text-white group-hover:text-black transition-colors">
                  <RotateCcw size={24} />
                </div>
                <span className="text-white font-black text-xl tracking-wider group-hover:text-black uppercase">Restart</span>
              </button>

              <button 
                onClick={() => navigate('/')}
                className="group flex items-center space-x-4 w-full p-4 bg-white/5 hover:bg-red-500 rounded-2xl transition-all duration-300 transform hover:translate-x-2"
              >
                <div className="w-12 h-12 bg-white/10 group-hover:bg-black/20 rounded-xl flex items-center justify-center text-white transition-colors">
                  <Home size={24} fill="currentColor" />
                </div>
                <span className="text-white font-black text-xl tracking-wider group-hover:text-black uppercase">Back Home</span>
              </button>
            </div>

            <button 
              onClick={() => setIsPaused(false)}
              className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

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

      {/* SHAPE PICKER MODAL */}
      {showShapePicker && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#2c1a12] border-2 border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-[#00ff88] text-2xl font-black text-center mb-8 tracking-widest uppercase">CHOOSE A SHAPE</h3>
            <div className="grid grid-cols-5 gap-4">
              {(['Circle', 'Triangle', 'Cross', 'Square', 'Star'] as WhotShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleShapeSelect(shape)}
                  className="group flex flex-col items-center space-y-3"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-[#3d2a2a] transition-all group-hover:scale-110 group-hover:bg-[#00ff88] group-active:scale-90 shadow-lg">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10">
                      <g dangerouslySetInnerHTML={{ __html: getShapeSVG(shape) }} />
                    </svg>
                  </div>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">{shape}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setShowShapePicker(false); setPendingCard(null); }}
              className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhotBoard;
