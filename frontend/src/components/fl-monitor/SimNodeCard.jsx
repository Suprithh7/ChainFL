import React from 'react';
import { Server, Database, Lock, RefreshCw } from 'lucide-react';

const SimNodeCard = ({ name, role, dataPoints, accuracy, isAggregating }) => {
    return (
        <div className={`glass-panel p-6 flex flex-col relative overflow-hidden transition-all duration-500 ${isAggregating ? 'border-[var(--neon-cyan)] scale-105 shadow-[0_0_20px_rgba(0,243,255,0.3)]' : ''}`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Server className={`${isAggregating ? 'text-[var(--neon-cyan)] animate-pulse' : 'text-gray-400'}`} size={24} />
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400 font-tech">{role}</div>
                    <div className={`text-xs font-bold ${isAggregating ? 'text-[var(--neon-cyan)]' : 'text-gray-500'}`}>
                        {isAggregating ? 'SYNCING...' : 'IDLE'}
                    </div>
                </div>
            </div>

            <h3 className="text-lg text-white font-bold mb-1 z-10">{name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 z-10">
                <Database size={12} /> {dataPoints} samples
                <span className="mx-1">•</span>
                <Lock size={12} /> DP-SGD
            </div>

            <div className="mt-auto z-10">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Local Accuracy</span>
                    <span className="text-white font-mono">{accuracy}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--electric-purple)] transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                </div>
            </div>

            {/* Aggregation Particles (CSS) */}
            {isAggregating && (
                <>
                    <div className="absolute top-1/2 right-0 w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-ping" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--neon-cyan)]/10 to-transparent opacity-50" />
                </>
            )}
        </div>
    );
};

export default SimNodeCard;
