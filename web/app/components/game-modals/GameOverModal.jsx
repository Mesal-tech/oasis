'use client';
import React from 'react';

const GameOverModal = ({ isWinner, length, score, earnedXP, earnedTokens, onPlayAgain, onBackToLobby }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] animate-[fadeIn_0.3s_ease-in]">
      <div className="bg-[#171717] border-[3px] border-[#353535] rounded-[25px] p-12 max-w-[500px] w-[90%] text-center animate-[slideIn_0.4s_ease-out]">
        <div className="text-7xl mb-4">{isWinner ? '🏆' : '💀'}</div>
        <h2 className="mb-4 text-4xl font-bold" style={{ color: '#ffffff', textShadow: `0 0 20px rgba(${isWinner ? '0, 255, 136' : '255, 68, 68'}, 0.5)` }}>
          {isWinner ? 'Victory!' : 'Game Over!'}
        </h2>
        <div className="mb-8">
          <div className="text-xl text-[#888] mb-4">Your Final Score</div>
          <div className="text-6xl font-bold text-[#00d4ff] drop-shadow-[0_0_30px_rgba(0,212,255,0.7)]">
            {score || length || 0}
          </div>
          <div className="text-base text-[#888] mt-2">{score ? 'points' : 'segments'}</div>
        </div>

        {/* Rewards Section */}
        {(earnedXP > 0 || earnedTokens > 0) && (
          <div className="mb-8 bg-[#27272A] rounded-xl p-6">
            <div className="text-xs font-bold text-[#71717A] uppercase mb-4 tracking-wider">Rewards Earned</div>
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

        {isWinner && <div className="text-xl text-[#00ff88] mb-8">🎉 You are the last one standing! 🎉</div>}
        <div className="flex gap-4 justify-center">
          <button onClick={onPlayAgain} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/80 transition shadow-lg shadow-white/10">
            🎮 Play Again
          </button>
          <button onClick={onBackToLobby} className="px-6 py-3 bg-transparent text-white border border-white/20 rounded-lg hover:bg-white/5 transition">
            ← Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
