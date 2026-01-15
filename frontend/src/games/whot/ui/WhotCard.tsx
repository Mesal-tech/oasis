import React from 'react';
import { WhotCard, type WhotShape } from '../logic/Card';

interface WhotCardProps {
  card: WhotCard;
  isFaceUp?: boolean;
  onClick?: () => void;
  className?: string;
  isPlayable?: boolean;
  style?: React.CSSProperties;
}

const WhotCardComponent: React.FC<WhotCardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  className = '',
  isPlayable = true,
  style
}) => {
  const renderShape = (shape: WhotShape, size: string = '100%') => {
    switch (shape) {
      case 'Circle':
        return <circle cx="50" cy="50" r="40" fill="currentColor" />;
      case 'Triangle':
        return <polygon points="50,10 90,85 10,85" fill="currentColor" />;
      case 'Cross':
        return (
          <path 
            d="M35,10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z" 
            fill="currentColor" 
          />
        );
      case 'Square':
        return <rect x="15" y="15" width="70" height="70" fill="currentColor" />;
      case 'Star':
        return (
          <polygon 
            points="50,5 63,35 95,35 70,55 80,85 50,70 20,85 30,55 5,35 37,35" 
            fill="currentColor" 
          />
        );
      case 'Whot':
        return (
          <text 
            x="50" 
            y="65" 
            fontSize="30" 
            fontWeight="bold" 
            textAnchor="middle" 
            fill="currentColor"
            style={{ fontFamily: 'serif' }}
          >
            Whot!
          </text>
        );
      default:
        return null;
    }
  };

  if (!isFaceUp) {
    return (
      <div 
        className={`${!className.includes('absolute') ? 'relative' : ''} w-24 h-36 rounded-xl bg-[#5d3a3a] border-2 border-[#3d2a2a] shadow-lg flex items-center justify-center overflow-hidden ${className}`}
        onClick={onClick}
        style={style}
      >
        <div className="absolute inset-2 border border-[#7d5a5a] rounded-lg opacity-30"></div>
        <div className="text-[#a67c7c] font-bold text-xl rotate-45 select-none opacity-40">Whot!</div>
        <div className="text-[#a67c7c] font-bold text-xl -rotate-45 select-none opacity-40">Whot!</div>
      </div>
    );
  }

  return (
    <div 
      className={`${!className.includes('absolute') ? 'relative' : ''} w-24 h-36 rounded-xl bg-white shadow-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 
        ${isPlayable ? 'hover:-translate-y-4 hover:shadow-2xl' : 'opacity-80 grayscale-[20%]'} 
        ${className}`}
      onClick={isPlayable ? onClick : undefined}
      style={style}
    >
      {/* Top Number and Mini Shape */}
      <div className="absolute top-1 left-2 flex flex-col items-center text-[#3d2a2a]">
        <span className="font-bold text-sm leading-tight">{card.number}</span>
        <svg viewBox="0 0 100 100" className="w-3 h-3">
          {renderShape(card.shape)}
        </svg>
      </div>

      {/* Main Center Shape */}
      <div className="w-14 h-14 text-[#3d2a2a]">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {renderShape(card.shape)}
        </svg>
      </div>

      {/* Bottom Number and Mini Shape (Upside Down) */}
      <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180 text-[#3d2a2a]">
        <span className="font-bold text-sm leading-tight">{card.number}</span>
        <svg viewBox="0 0 100 100" className="w-3 h-3">
          {renderShape(card.shape)}
        </svg>
      </div>
    </div>
  );
};

export default WhotCardComponent;
