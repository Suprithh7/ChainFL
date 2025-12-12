import React from 'react';
import { Activity, Star, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const PredictionResult = ({ riskScore }) => {
    const isHighRisk = riskScore > 70;
    const isMediumRisk = riskScore > 30 && riskScore <= 70;

    const color = isHighRisk ? 'var(--alert-red)' : isMediumRisk ? '#f59e0b' : 'var(--medical-teal)';

    // Simulated forecast data
    const forecastData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        risk: Math.min(100, Math.max(0, riskScore + (Math.random() * 10 - 5) + (isHighRisk ? i * 0.5 : -i * 0.2)))
    }));

    const shapData = [
        { feature: 'ST Depression', value: 0.35, positive: true },
        { feature: 'Age', value: 0.15, positive: true },
        { feature: 'Max HR', value: -0.2, positive: false },
        { feature: 'Cholesterol', value: 0.1, positive: true },
    ];

    return (
        <div className="animate-float">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Score Gauge */}
                <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--background-dark)] opacity-90 z-0"></div>

                    <h3 className="text-gray-400 font-tech uppercase tracking-widest mb-8 z-10">AI Risk Prediction</h3>

                    <div className="relative w-64 h-32 overflow-hidden mb-4 z-10">
                        <div className="absolute w-64 h-64 rounded-full border-[15px] border-gray-800 box-border"></div>
                        <div
                            className="absolute w-64 h-64 rounded-full border-[15px] border-transparent box-border transition-all duration-1000 ease-out"
                            style={{
                                borderTopColor: color,
                                borderRightColor: color,
                                transform: `rotate(${-45 + (riskScore * 1.8)}deg)`
                            }}
                        ></div>
                    </div>

                    <div className="text-5xl font-bold font-tech text-white mb-2 z-10 shadow-neon">
                        {riskScore}<span className="text-2xl">%</span>
                    </div>

                    <div className="px-4 py-1 rounded-full border uppercase text-sm font-bold tracking-wider z-10"
                        style={{ borderColor: color, color: color, backgroundColor: `${color}10` }}>
                        {isHighRisk ? 'High Risk' : isMediumRisk ? 'Moderate Risk' : 'Low Risk'}
                    </div>

                    <div className="mt-8 w-full z-10">
                        <h4 className="text-sm text-gray-400 mb-2">30-Day Forecast</h4>
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="risk" stroke={color} fill="url(#riskGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: Explainability */}
                <div className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-gray-400 font-tech uppercase tracking-widest">Model Explanation</h3>
                        <span className="text-[10px] text-[var(--neon-cyan)] border border-[var(--neon-cyan)] px-2 py-1 rounded">SHAP</span>
                    </div>

                    <div className="space-y-6">
                        {shapData.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-white">{item.feature}</span>
                                    <span className={item.positive ? 'text-[var(--alert-red)]' : 'text-[var(--medical-teal)]'}>
                                        {item.positive ? '+ Risk' : '- Risk'}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full flex items-center relative">
                                    {/* Center Line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600"></div>

                                    {/* Bar */}
                                    <div
                                        className={`h-full rounded-full ${item.positive ? 'bg-[var(--alert-red)]' : 'bg-[var(--medical-teal)]'}`}
                                        style={{
                                            width: `${Math.abs(item.value) * 100}%`,
                                            marginLeft: item.positive ? '50%' : `calc(50% - ${Math.abs(item.value) * 100}%)`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={20} className="text-[var(--neon-cyan)] mt-0.5" />
                            <p className="text-sm text-gray-300 leading-relaxed">
                                <span className="text-white font-bold">Clinical Note:</span> Elevated {shapData[0].feature} is the dominant factor driving the risk score up. Consider detailed ST-segment analysis.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictionResult;
