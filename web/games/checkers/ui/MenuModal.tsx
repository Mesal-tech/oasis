import React from 'react';
import { FaHome, FaRedo, FaVolumeUp, FaVolumeMute, FaCog } from 'react-icons/fa';

interface MenuModalProps {
  onResume: () => void;
  onRestart: () => void;
  onBackToLobby: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  onResume,
  onRestart,
  onBackToLobby,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] animate-[fadeIn_0.2s_ease-in]">
      <div className="bg-[#171717] border-[3px] border-[#353535] rounded-[25px] p-8 max-w-[400px] w-[90%] animate-[slideIn_0.3s_ease-out]">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚙️</div>
          <h2 className="text-3xl font-bold text-white mb-2">Game Menu</h2>
          <p className="text-[#888] text-sm">Choose an option</p>
        </div>

        <div className="space-y-3">
          {/* Resume Button */}
          <button
            onClick={onResume}
            className="w-full px-6 py-4 bg-[#00d4ff] text-black font-bold rounded-xl hover:bg-[#00b8e6] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#00d4ff]/20"
          >
            <span className="text-xl">▶️</span>
            <span>Resume Game</span>
          </button>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            className="w-full px-6 py-4 bg-[#27272A] text-white font-bold rounded-xl hover:bg-[#3F3F46] transition-all flex items-center justify-center gap-3 border border-[#3F3F46]"
          >
            <FaRedo className="text-lg" />
            <span>Restart Game</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-full px-6 py-4 bg-[#27272A] text-white font-bold rounded-xl hover:bg-[#3F3F46] transition-all flex items-center justify-center gap-3 border border-[#3F3F46]"
          >
            {soundEnabled ? <FaVolumeUp className="text-lg" /> : <FaVolumeMute className="text-lg" />}
            <span>{soundEnabled ? 'Sound: ON' : 'Sound: OFF'}</span>
          </button>

          {/* Back to Lobby */}
          <button
            onClick={onBackToLobby}
            className="w-full px-6 py-4 bg-transparent text-white font-bold rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 border border-white/20"
          >
            <FaHome className="text-lg" />
            <span>Back to Lobby</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[#666] text-xs">Press ESC to resume</p>
        </div>
      </div>
    </div>
  );
};
