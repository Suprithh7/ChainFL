import React, { useState, useEffect } from 'react';

const SystemMonitor = () => {
    const [logs, setLogs] = useState([
        { timestamp: '14:20:15', type: 'SUCCESS', msg: 'Patient prediction completed. Score: 87%' },
        { timestamp: '14:18:42', type: 'INFO', msg: 'FL Round #428 initiated' },
        { timestamp: '14:15:33', type: 'SUCCESS', msg: 'Node synchronization completed' },
        { timestamp: '14:12:08', type: 'INFO', msg: 'ECG analysis started for Patient #8392' },
        { timestamp: '14:10:55', type: 'SUCCESS', msg: 'Model update deployed successfully' }
    ]);

    const triggerAction = (action) => {
        const newLog = {
            timestamp: new Date().toLocaleTimeString(),
            type: 'SUCCESS',
            msg: action === 'fl' ? 'FL Round #429 completed. Accuracy: 96.4%' : 'System health check passed'
        };
        setLogs([newLog, ...logs]);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">System Monitor</h1>
                <p className="page-subtitle">Real-time backend activity & audit trail</p>
            </div>

            <div className="stats-bar" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '32px', justifyContent: 'space-around' }}>
                    <div className="stat-item">
                        <div className="stat-value">{logs.length}</div>
                        <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{logs.filter(l => l.type === 'SUCCESS').length}</div>
                        <div className="stat-label">Successful Operations</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Errors</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Live System Console</h3>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={() => triggerAction('fl')}>
                        Trigger FL Round
                    </button>
                    <button className="btn btn-secondary">Export Logs (CSV)</button>
                </div>

                <div className="terminal">
                    {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '6px' }}>
                            <span style={{ color: '#74b9ff' }}>[{log.timestamp}]</span>
                            <span style={{
                                fontWeight: 'bold',
                                margin: '0 10px',
                                color: log.type === 'SUCCESS' ? '#00ff41' : '#74b9ff'
                            }}>
                                {log.type}
                            </span>
                            <span>{log.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
