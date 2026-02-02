import React from 'react';
import WhotBoard from './WhotBoard';

interface WhotAppProps {
  gameOptions?: {
    playerName?: string;
    difficulty?: string;
  };
}

export const WhotApp: React.FC<WhotAppProps> = ({ gameOptions }) => {
  return (
    <div className="w-full h-full overflow-hidden bg-black">
      <WhotBoard 
        playerName={gameOptions?.playerName || 'You'} 
        difficulty={gameOptions?.difficulty || 'medium'} 
      />
    </div>
  );
};

export default WhotApp;
