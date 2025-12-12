import React from 'react';
import { Heart, Activity } from 'lucide-react';
import './Hologram.css';

const HeartHologram = ({ score }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="hologram-container">
                {/* Rotating Rings */}
                <div className="ring ring-outer"></div>
                <div className="ring ring-middle"></div>
                <div className="ring ring-inner"></div>

                {/* Central Heart */}
                <div className="heart-core">
                    <Heart size={80} className="heart-icon-main" fill="currentColor" />
                    <Heart size={80} className="heart-icon-blur" />
                    <Heart size={80} className="heart-icon-glitch" />
                </div>

                {/* Floating Particles/Data points */}
                <Activity size={24} className="absolute top-10 right-10 text-[var(--neon-cyan)] opacity-50 animate-pulse" />

                {/* Score */}
                <div className="score-display">
                    <span className="score-label">CV-RISK SCORE</span>
                    <span className="score-value">{score}</span>
                </div>
            </div>
        </div>
    );
};

export default HeartHologram;
