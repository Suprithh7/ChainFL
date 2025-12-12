import React from 'react';

const ModelMetrics = () => {
    return (
        <div className="fade-in">
            <div className="header">
                <div>
                    <h1 className="page-title">Model Performance Metrics</h1>
                    <p className="subtitle">AI Model Evaluation & Quality Assurance</p>
                </div>
                <button className="btn btn-primary">📄 Export Report</button>
            </div>

            {/* Main Metrics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">96.4%</div>
                    <div className="stat-label">Overall Accuracy</div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                        <div className="progress-fill" style={{ width: '96%' }}></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">94.2%</div>
                    <div className="stat-label">Precision (PPV)</div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                        <div className="progress-fill" style={{ width: '94%', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' }}></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">91.8%</div>
                    <div className="stat-label">Recall (Sensitivity)</div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                        <div className="progress-fill" style={{ width: '92%', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' }}></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">93.0%</div>
                    <div className="stat-label">F1-Score</div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                        <div className="progress-fill" style={{ width: '93%', background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)' }}></div>
                    </div>
                </div>
            </div>

            {/* Confusion Matrix */}
            <div className="dashboard-grid" style={{ marginTop: '25px' }}>
                <div className="card">
                    <h3>🔲 Confusion Matrix</h3>
                    <div style={{ marginTop: '20px' }}>
                        <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '10px' }}></th>
                                    <th style={{ padding: '10px', background: '#f8f9fa', fontWeight: '600' }}>Predicted: Low Risk</th>
                                    <th style={{ padding: '10px', background: '#f8f9fa', fontWeight: '600' }}>Predicted: High Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '15px', background: '#f8f9fa', fontWeight: '600' }}>Actual: Low Risk</td>
                                    <td style={{
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '24px'
                                    }}>142</td>
                                    <td style={{ padding: '20px', background: '#ffe5e5', fontWeight: '600' }}>8</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '15px', background: '#f8f9fa', fontWeight: '600' }}>Actual: High Risk</td>
                                    <td style={{ padding: '20px', background: '#ffe5e5', fontWeight: '600' }}>7</td>
                                    <td style={{
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '24px'
                                    }}>77</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{ marginTop: '15px', fontSize: '13px', color: '#7f8c8d' }}>
                            <strong>True Positives:</strong> 77 • <strong>True Negatives:</strong> 142 •
                            <strong> False Positives:</strong> 8 • <strong>False Negatives:</strong> 7
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>📊 ROC-AUC Analysis</h3>
                    <div style={{
                        marginTop: '20px',
                        height: '250px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {/* Simple ROC curve representation */}
                        <svg width="100%" height="100%" viewBox="0 0 300 300">
                            {/* Axes */}
                            <line x1="30" y1="270" x2="270" y2="270" stroke="#95a5a6" strokeWidth="2" />
                            <line x1="30" y1="30" x2="30" y2="270" stroke="#95a5a6" strokeWidth="2" />

                            {/* Diagonal reference */}
                            <line x1="30" y1="270" x2="270" y2="30" stroke="#dfe6e9" strokeWidth="2" strokeDasharray="5,5" />

                            {/* ROC Curve */}
                            <path d="M 30,270 Q 60,200 90,120 T 150,50 T 270,30"
                                fill="none"
                                stroke="url(#gradient1)"
                                strokeWidth="3" />

                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>

                            {/* Labels */}
                            <text x="150" y="295" textAnchor="middle" fontSize="12" fill="#7f8c8d">False Positive Rate</text>
                            <text x="15" y="150" textAnchor="middle" fontSize="12" fill="#7f8c8d" transform="rotate(-90 15 150)">True Positive Rate</text>
                        </svg>
                    </div>
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            AUC = 0.94
                        </span>
                    </div>
                </div>
            </div>

            {/* Feature Importance */}
            <div className="card" style={{ marginTop: '25px' }}>
                <h3>🎯 Feature Importance (SHAP Values)</h3>
                <div style={{ marginTop: '20px' }}>
                    {[
                        { feature: 'ST-Segment Depression', importance: 0.28, color: '#e74c3c' },
                        { feature: 'Age', importance: 0.22, color: '#f39c12' },
                        { feature: 'Cholesterol Level', importance: 0.18, color: '#3498db' },
                        { feature: 'Max Heart Rate', importance: 0.15, color: '#9b59b6' },
                        { feature: 'Blood Pressure', importance: 0.10, color: '#1abc9c' },
                        { feature: 'Exercise Angina', importance: 0.07, color: '#95a5a6' }
                    ].map((item, i) => (
                        <div key={i} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.feature}</span>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: item.color }}>
                                    {(item.importance * 100).toFixed(0)}% Impact
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${item.importance * 100}%`,
                                    background: item.color
                                }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Training History */}
            <div className="card" style={{ marginTop: '25px' }}>
                <h3>📈 Federated Learning Training History</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '5px' }}>Total Rounds</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>428</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '5px' }}>Participating Nodes</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>5</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '5px' }}>Training Samples</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>24,580</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '5px' }}>Convergence Time</div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>2.4h</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelMetrics;
