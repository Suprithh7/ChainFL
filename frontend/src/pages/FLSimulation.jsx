import React, { useState, useEffect } from 'react';

const FLSimulation = () => {
    const [round, setRound] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => setRound(r => r + 1), 2000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <div>
            <div className="header">
                <h1 className="page-title">Federated Learning Simulation</h1>
                <button className="btn btn-primary" onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? 'Pause Simulation' : 'Start Simulation'}
                </button>
            </div>

            <div className="dashboard-grid">
                {['St. Mary Hospital', 'City Heart Center', 'Uni Lab'].map((name, i) => (
                    <div key={i} className="card">
                        <h3>Node: {name}</h3>
                        <div className="metric-value">9{i}.{round % 10}%</div>
                        <div className="metric-label">Local Model Accuracy</div>
                        <div className="bar-container" style={{ marginTop: '10px' }}>
                            <div className="bar-fill" style={{ width: `9${i}%`, backgroundColor: isRunning ? '#0984e3' : '#b2bec3' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <h3>Global Model Convergence</h3>
                <div style={{ textAlign: 'center', padding: '40px', background: '#f5f6fa', borderRadius: '8px' }}>
                    <div className="metric-value">Global Round #{round}</div>
                    <div className="metric-label">Current Aggregated Accuracy: 96.4%</div>
                </div>
            </div>
        </div>
    );
};

export default FLSimulation;
