import React from 'react';

interface GameOverModalProps {
  isWinner: boolean;
  isDraw: boolean;
  score: number;
  redPieces: number;
  bluePieces: number;
  earnedXP: number;
  earnedTokens: number;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isWinner,
  isDraw,
  score,
  redPieces,
  bluePieces,
  earnedXP,
  earnedTokens,
  onPlayAgain,
  onBackToLobby
}) => {
  const getTitle = () => {
    if (isDraw) return 'Draw!';
    if (isWinner) return 'Victory!';
    return 'Defeat!';
  };

  const getEmoji = () => {
    if (isDraw) return '🤝';
    if (isWinner) return '🏆';
    return '😔';
  };

  const getColor = () => {
    if (isDraw) return '255, 206, 49'; // Yellow
    if (isWinner) return '0, 255, 136'; // Green
    return '255, 68, 68'; // Red
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] animate-[fadeIn_0.3s_ease-in]">
      <div className="bg-[#171717] border-[3px] border-[#353535] rounded-[25px] p-12 max-w-[500px] w-[90%] text-center animate-[slideIn_0.4s_ease-out]">
        <div className="text-7xl mb-4">{getEmoji()}</div>
        <h2
          className="mb-4 text-4xl font-bold"
          style={{
            color: '#ffffff',
            textShadow: `0 0 20px rgba(${getColor()}, 0.5)`
          }}
        >
          {getTitle()}
        </h2>

        <div className="mb-8">
          <div className="text-xl text-[#888] mb-4">Final Score</div>
          <div className="text-6xl font-bold text-[#00d4ff] drop-shadow-[0_0_30px_rgba(0,212,255,0.7)]">
            {score}
          </div>
          <div className="text-base text-[#888] mt-2">points</div>

          {/* Piece Count */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl mb-1">🔴</div>
              <div className="text-2xl font-bold text-red-400">{redPieces}</div>
              <div className="text-xs text-[#888]">Your Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🔵</div>
              <div className="text-2xl font-bold text-blue-400">{bluePieces}</div>
              <div className="text-xs text-[#888]">AI Pieces</div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        {(earnedXP > 0 || earnedTokens > 0) && (
          <div className="mb-8 bg-[#27272A] rounded-xl p-6">
            <div className="text-xs font-bold text-[#71717A] uppercase mb-4 tracking-wider">
              Rewards Earned
            </div>
            <div className="space-y-3">
              {earnedXP > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-2">
                    <span className="text-2xl">⚡</span> Experience
                  </span>
                  <span className="text-[#00ff88] font-black text-xl">+{earnedXP} XP</span>
                </div>
              )}
              {earnedTokens > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-2">
                    <span className="text-2xl">🪙</span> Tokens
                  </span>
                  <span className="text-[#FFCE31] font-black text-xl">+{earnedTokens}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isWinner && (
          <div className="text-xl text-[#00ff88] mb-8">
            🎉 Excellent strategy! You won! 🎉
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/80 transition shadow-lg shadow-white/10"
          >
            🎮 Play Again
          </button>
          <button
            onClick={onBackToLobby}
            className="px-6 py-3 bg-transparent text-white border border-white/20 rounded-lg hover:bg-white/5 transition"
          >
            ← Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
