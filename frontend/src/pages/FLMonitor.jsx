import React from 'react';
import NetworkMap from '../components/fl-monitor/NetworkMap';
import { Shield, Users, Database } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';

const FLMonitor = () => {
    const data = [
        { ep: 1, loss: 0.8 }, { ep: 2, loss: 0.6 },
        { ep: 3, loss: 0.45 }, { ep: 4, loss: 0.3 },
        { ep: 5, loss: 0.25 }, { ep: 6, loss: 0.22 },
        { ep: 7, loss: 0.18 }, { ep: 8, loss: 0.15 },
        { ep: 9, loss: 0.12 }, { ep: 10, loss: 0.11 }
    ];

    return (
        <div className="flex flex-col gap-6 animate-float" style={{ animationDuration: '12s' }}>
            <header className="mb-4">
                <h1 className="text-3xl font-tech text-white">Federated Learning Network</h1>
                <p className="text-gray-400">Global Model Version: v4.2.8 | Status: <span className="text-[var(--neon-cyan)] animate-pulse">Aggregating Updates</span></p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map */}
                <div className="col-span-2">
                    <NetworkMap />
                </div>

                {/* Stats Panel */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-gray-400 font-tech text-sm uppercase mb-4">Global Loss (Convergence)</h3>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="ep" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(10,20,30,0.9)', border: '1px solid #333', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff', fontSize: '12px' }}
                                        itemStyle={{ fontSize: '12px', color: 'var(--neon-cyan)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="loss"
                                        stroke="var(--neon-cyan)"
                                        strokeWidth={2}
                                        dot={{ fill: 'var(--background-dark)', stroke: 'var(--neon-cyan)', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel p-6 flex-1">
                        <h3 className="text-gray-400 font-tech text-sm uppercase mb-4">Network Health</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20"><Users size={24} /></div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Active Nodes</div>
                                    <div className="text-xl font-bold font-tech">12/15</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20"><Shield size={24} /></div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Privacy Budget</div>
                                    <div className="text-xl font-bold font-tech text-[var(--medical-teal)]">&epsilon; = 0.5</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20"><Database size={24} /></div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Parameters</div>
                                    <div className="text-xl font-bold font-tech">4.2M</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FLMonitor;
