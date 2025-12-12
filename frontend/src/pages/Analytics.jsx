import React from 'react';

const Analytics = () => {
    const weeklyData = [
        { day: 'Mon', predictions: 45, highRisk: 12 },
        { day: 'Tue', predictions: 52, highRisk: 15 },
        { day: 'Wed', predictions: 38, highRisk: 8 },
        { day: 'Thu', predictions: 67, highRisk: 22 },
        { day: 'Fri', predictions: 71, highRisk: 19 },
        { day: 'Sat', predictions: 23, highRisk: 5 },
        { day: 'Sun', predictions: 18, highRisk: 3 }
    ];

    const maxPredictions = Math.max(...weeklyData.map(d => d.predictions));

    return (
        <div className="fade-in">
            <div className="header">
                <div>
                    <h1 className="page-title">Analytics Dashboard</h1>
                    <p className="subtitle">System-wide Performance Metrics</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary">📅 Last 7 Days</button>
                    <button className="btn btn-primary">📊 Generate Report</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        🎯
                    </div>
                    <div className="stat-value">96.4%</div>
                    <div className="stat-label">Model Accuracy</div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                        <div className="progress-fill" style={{ width: '96%' }}></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        📈
                    </div>
                    <div className="stat-value">314</div>
                    <div className="stat-label">Total Predictions (7d)</div>
                    <div style={{ fontSize: '13px', color: '#2ecc71', marginTop: '8px', fontWeight: '600' }}>
                        ↑ 23% vs last week
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        ⚠️
                    </div>
                    <div className="stat-value">84</div>
                    <div className="stat-label">High Risk Cases</div>
                    <div style={{ fontSize: '13px', color: '#e74c3c', marginTop: '8px', fontWeight: '600' }}>
                        26.8% of total
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                        ⚡
                    </div>
                    <div className="stat-value">142ms</div>
                    <div className="stat-label">Avg Response Time</div>
                    <div style={{ fontSize: '13px', color: '#2ecc71', marginTop: '8px', fontWeight: '600' }}>
                        ↓ 18ms improvement
                    </div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="card" style={{ marginTop: '25px' }}>
                <h3>📊 Weekly Prediction Volume</h3>
                <div style={{ marginTop: '30px', display: 'flex', gap: '20px', alignItems: 'flex-end', height: '300px' }}>
                    {weeklyData.map((day, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            {/* High Risk Bar */}
                            <div style={{
                                width: '100%',
                                height: `${(day.highRisk / maxPredictions) * 250}px`,
                                background: 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: '8px 8px 0 0',
                                position: 'relative',
                                transition: 'height 0.5s ease'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#e74c3c'
                                }}>{day.highRisk}</span>
                            </div>

                            {/* Total Bar */}
                            <div style={{
                                width: '100%',
                                height: `${(day.predictions / maxPredictions) * 250}px`,
                                background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '8px',
                                position: 'relative',
                                marginTop: '-10px',
                                transition: 'height 0.5s ease'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>{day.predictions}</span>
                            </div>

                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#7f8c8d' }}>{day.day}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '15px', height: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '13px' }}>Total Predictions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '15px', height: '15px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '13px' }}>High Risk Cases</span>
                    </div>
                </div>
            </div>

            {/* Risk Distribution */}
            <div className="dashboard-grid" style={{ marginTop: '25px' }}>
                <div className="card">
                    <h3>🎯 Risk Distribution</h3>
                    <div style={{ marginTop: '20px' }}>
                        {[
                            { range: '0-30% (Low)', count: 142, percent: 45, color: '#43e97b' },
                            { range: '31-60% (Medium)', count: 88, percent: 28, color: '#feca57' },
                            { range: '61-100% (High)', count: 84, percent: 27, color: '#f5576c' }
                        ].map((risk, i) => (
                            <div key={i} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{risk.range}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{risk.count} cases ({risk.percent}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${risk.percent}%`, background: risk.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>🏥 Top Performing Nodes</h3>
                    <div style={{ marginTop: '20px' }}>
                        {[
                            { name: 'St. Mary\'s Hospital', accuracy: 97.2, predictions: 156 },
                            { name: 'City Heart Center', accuracy: 96.8, predictions: 142 },
                            { name: 'Uni Research Lab', accuracy: 94.1, predictions: 89 }
                        ].map((node, i) => (
                            <div key={i} style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>#{i + 1} {node.name}</span>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                        color: 'white',
                                        padding: '3px 10px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {node.accuracy}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                                    {node.predictions} predictions • Rank: {i + 1}/5
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
