import React from 'react';

interface GameButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    className?: string; // For additional positioning or styles
    color?: string; // main color, default teal
}

export const GameButton: React.FC<GameButtonProps> = ({ onClick, icon, className = '', color = '#00d2d3' }) => {
    return (
        <button
            onClick={onClick}
            className={`game-button ${className}`}
            style={{
                '--btn-color': color,
            } as React.CSSProperties}
        >
            <div className="icon-container">{icon}</div>
        </button>
    );
};
