import React, { useState, useEffect } from 'react';

const BackendLogs = () => {
    const [logs, setLogs] = useState([]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/logs');
            const data = await res.json();
            setLogs(data);
        } catch (e) { console.log(e); }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    const triggerAction = async (endpoint) => {
        await fetch(`http://127.0.0.1:8000/api/${endpoint}`, { method: 'POST' });
        fetchLogs();
    }

    return (
        <div>
            <div className="header">
                <h1 className="page-title">System Logs</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => triggerAction('fl/start')}>Trigger Aggregation</button>
                    <button className="btn btn-primary" style={{ backgroundColor: '#6c5ce7' }}>Sync Nodes</button>
                </div>
            </div>

            <div className="card">
                <h3>Console Output</h3>
                <div className="terminal-logs">
                    {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '5px' }}>
                            <span style={{ color: '#74b9ff' }}>[{log.timestamp}]</span>
                            <span style={{ fontWeight: 'bold', margin: '0 10px' }}>{log.type}</span>
                            <span>{log.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BackendLogs;
