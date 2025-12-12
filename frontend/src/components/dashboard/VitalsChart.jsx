import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const VitalsChart = ({ title, data, color, unit, value }) => {
    return (
        <div className="glass-panel p-4 flex flex-col h-full relative overflow-hidden group">
            <div className="flex justify-between items-end mb-2 z-10">
                <h3 className="text-gray-400 font-tech text-sm uppercase tracking-wider">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white shadow-neon">{value}</span>
                    <span className="text-xs text-gray-500">{unit}</span>
                </div>
            </div>

            <div className="w-full" style={{ height: '100px', flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${title})`}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 right-0" style={{ width: '8px', height: '8px', borderTop: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }} />
            <div className="absolute bottom-0 left-0" style={{ width: '8px', height: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)' }} />
        </div>
    );
};

export default VitalsChart;
