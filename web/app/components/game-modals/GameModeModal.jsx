'use client';
import React, { useState } from 'react';

const GameModeModal = ({ onConfirm, onCancel, gameId }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9999]">
      <div className="bg-[#171717] border-2 border-[#333333] rounded-[25px] p-10 max-w-[600px] w-[90%]">
        <h2 className="text-white mb-8 text-3xl text-center">Select Game Mode</h2>
        <div className="flex flex-col gap-6 mb-8">
          <div onClick={() => setSelectedMode('ai')} className={`p-6 bg-[#282828] border-2 rounded-lg cursor-pointer transition-all ${selectedMode === 'ai' ? 'bg-[#00d4ff]/30 border-[#00d4ff] scale-[1.02]' : 'border-[#333333] hover:bg-[#00d4ff]/10 hover:scale-[1.02]'}`}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">🤖</span>
              <div className="flex-1">
                <div className="text-xl font-bold text-white">AI Mode</div>
                <div className="text-[#888] text-sm">Play against AI bots</div>
              </div>
              <span className="px-3 py-1 bg-[#00ff88] text-black rounded font-bold text-xs">ACTIVE</span>
            </div>
          </div>
          <div onClick={() => setSelectedMode('multiplayer')} className={`p-6 bg-[#282828] border-2 rounded-lg cursor-pointer transition-all ${selectedMode === 'multiplayer' ? 'bg-[#00d4ff]/30 border-[#00d4ff] scale-[1.02]' : 'border-[#333333] hover:bg-[#00d4ff]/10 hover:scale-[1.02]'}`}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">⚔️</span>
              <div className="flex-1">
                <div className="text-xl font-bold text-white">PvP Mode</div>
                <div className="text-[#888] text-sm">Play against other players</div>
              </div>
              <span className="px-3 py-1 bg-[#00ff88] text-black rounded font-bold text-xs">ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="px-6 py-2 bg-transparent text-white border border-white/20 hover:bg-white/10 rounded-lg">Cancel</button>
          <button onClick={() => selectedMode && onConfirm(selectedMode)} disabled={!selectedMode} className={`px-6 py-2 bg-white text-black font-bold rounded-lg transition-opacity ${!selectedMode ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:bg-white/80'}`}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeModal;
