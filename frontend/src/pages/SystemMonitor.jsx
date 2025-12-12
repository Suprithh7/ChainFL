import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import { useActivityLog } from '../context/ActivityLogContext';

const SystemMonitor = () => {
    const { logs, logSuccess, clearLogs } = useActivityLog();
    const [flaggedHospitals, setFlaggedHospitals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFlaggedHospitals();
        // Poll for flagged hospitals every 30 seconds
        const interval = setInterval(fetchFlaggedHospitals, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchFlaggedHospitals = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/blockchain/hospitals/flagged');
            if (response.ok) {
                const data = await response.json();
                setFlaggedHospitals(data.flagged_hospitals || []);
            }
        } catch (error) {
            console.error('Error fetching flagged hospitals:', error);
        }
    };

    const approveHospital = async (nodeId, hospitalName) => {
        if (!confirm(`Approve hospital "${hospitalName}"?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/blockchain/hospitals/approve/${nodeId}`, {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                alert(`✅ ${data.message}`);
                logSuccess(`Hospital "${hospitalName}" approved by admin`);
                fetchFlaggedHospitals();
            } else {
                alert('❌ Failed to approve hospital');
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const rejectHospital = async (nodeId, hospitalName) => {
        if (!confirm(`Reject and remove hospital "${hospitalName}"?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/blockchain/hospitals/reject/${nodeId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const data = await response.json();
                alert(`✅ ${data.message}`);
                logSuccess(`Hospital "${hospitalName}" rejected and removed by admin`);
                fetchFlaggedHospitals();
            } else {
                alert('❌ Failed to reject hospital');
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportLogs = () => {
        const csvContent = logs.map(log =>
            `"${log.timestamp}","${log.type}","${log.msg}"`
        ).join('\n');
        const blob = new Blob([`"Timestamp","Type","Message"\n${csvContent}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        logSuccess('System logs exported to CSV');
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">System Monitor</h1>
                <p className="page-subtitle">Real-time activity tracking & hospital approval</p>
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
                        <div className="stat-value" style={{ color: flaggedHospitals.length > 0 ? '#ffc107' : '#28a745' }}>
                            {flaggedHospitals.length}
                        </div>
                        <div className="stat-label">Pending Approvals</div>
                    </div>
                </div>
            </div>

            {/* Flagged Hospitals Section */}
            {flaggedHospitals.length > 0 && (
                <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #ffc107' }}>
                    <h3 className="card-title">
                        <AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#ffc107' }} />
                        Flagged Hospitals Awaiting Approval ({flaggedHospitals.length})
                    </h3>

                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
                        These hospitals are not in the legitimate hospitals database and require admin approval to participate in the network.
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {flaggedHospitals.map((hospital, idx) => (
                            <div key={idx} style={{
                                padding: '16px',
                                background: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                            {hospital.hospital_name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>
                                            <strong>Node ID:</strong> {hospital.node_id}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>
                                            <strong>Location:</strong> {hospital.state && hospital.district ? `${hospital.district}, ${hospital.state}` : 'Not specified'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>
                                            <strong>Reason:</strong> {hospital.flagged_reason}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                            <strong>Transaction:</strong> <code style={{ fontSize: '11px' }}>{hospital.transaction_hash}</code>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                        <button
                                            onClick={() => approveHospital(hospital.node_id, hospital.hospital_name)}
                                            disabled={loading}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectHospital(hospital.node_id, hospital.hospital_name)}
                                            disabled={loading}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* System Console */}
            <div className="card">
                <h3 className="card-title">Live System Console - User Activity Log</h3>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={exportLogs}>
                        <Download size={16} style={{ marginRight: '6px' }} />
                        Export Logs (CSV)
                    </button>
                    <button className="btn btn-secondary" onClick={clearLogs}>
                        Clear Logs
                    </button>
                </div>

                <div className="terminal">
                    {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '6px' }}>
                            <span style={{ color: '#74b9ff' }}>[{log.timestamp}]</span>
                            <span style={{
                                fontWeight: 'bold',
                                margin: '0 10px',
                                color: log.type === 'SUCCESS' ? '#00ff41' : log.type === 'ERROR' ? '#ff4757' : '#74b9ff'
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
