import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, Users, Database, RefreshCw, RotateCcw, Play, Pause } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useActivityLog } from '../context/ActivityLogContext';

const FLSimulation = () => {
    const { logAction, logSuccess, logError } = useActivityLog();
    const [verifiedHospitals, setVerifiedHospitals] = useState([]);
    const [selectedHospitals, setSelectedHospitals] = useState([]);
    const [currentMetrics, setCurrentMetrics] = useState(null);
    const [trainingHistory, setTrainingHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [training, setTraining] = useState(false);
    const [autoTraining, setAutoTraining] = useState(false);
    const [maxRounds, setMaxRounds] = useState(3);
    const autoTrainingRef = useRef(null);

    useEffect(() => {
        fetchVerifiedHospitals();
        fetchCurrentMetrics();
        fetchTrainingHistory();

        // Cleanup auto-training on unmount
        return () => {
            if (autoTrainingRef.current) {
                clearTimeout(autoTrainingRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Stop auto-training if max rounds reached or accuracy > 96%
        if (autoTraining && currentMetrics) {
            if (currentMetrics.round >= maxRounds || currentMetrics.accuracy >= 0.96) {
                stopAutoTraining();
                logSuccess('Auto-training completed', `Final accuracy: ${(currentMetrics.accuracy * 100).toFixed(2)}%`);
            }
        }
    }, [currentMetrics, autoTraining, maxRounds]);

    const fetchVerifiedHospitals = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/blockchain/fl/verified-hospitals');
            if (response.ok) {
                const data = await response.json();
                setVerifiedHospitals(data.verified_hospitals || []);
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error);
        }
    };

    const fetchCurrentMetrics = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/blockchain/fl/metrics');
            if (response.ok) {
                const data = await response.json();
                setCurrentMetrics(data);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    const fetchTrainingHistory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/blockchain/fl/history');
            if (response.ok) {
                const data = await response.json();
                setTrainingHistory(data.history || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const toggleHospital = (nodeId) => {
        setSelectedHospitals(prev =>
            prev.includes(nodeId)
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    };

    const selectAll = () => {
        setSelectedHospitals(verifiedHospitals.map(h => h.node_id));
    };

    const deselectAll = () => {
        setSelectedHospitals([]);
    };

    const runSingleRound = async () => {
        if (selectedHospitals.length === 0) {
            return false;
        }

        setTraining(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/blockchain/fl/start-round', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospital_ids: selectedHospitals })
            });

            if (response.ok) {
                const data = await response.json();
                const result = data.result;

                logSuccess(
                    `FL Round #${result.round} completed`,
                    `Accuracy: ${(result.metrics.accuracy * 100).toFixed(2)}% (+${(result.improvements.accuracy * 100).toFixed(2)}%)`
                );

                // Update metrics and history
                await fetchCurrentMetrics();
                await fetchTrainingHistory();

                setTraining(false);
                return true;
            } else {
                setTraining(false);
                return false;
            }
        } catch (error) {
            setTraining(false);
            return false;
        }
    };

    const startAutoTraining = async () => {
        if (selectedHospitals.length === 0) {
            alert('Please select at least one hospital to participate in training');
            return;
        }

        setAutoTraining(true);
        logAction('Auto-training started', `Target: ${maxRounds} rounds`);

        const runNextRound = async () => {
            const success = await runSingleRound();

            if (success && autoTrainingRef.current !== null) {
                // Schedule next round after 100ms (instant for demo)
                autoTrainingRef.current = setTimeout(runNextRound, 100);
            }
        };

        runNextRound();
    };

    const stopAutoTraining = () => {
        setAutoTraining(false);
        if (autoTrainingRef.current) {
            clearTimeout(autoTrainingRef.current);
            autoTrainingRef.current = null;
        }
        logAction('Auto-training stopped');
    };

    const resetSimulation = async () => {
        if (!confirm('Reset FL simulation to initial state? This will clear all training history.')) return;

        stopAutoTraining(); // Stop auto-training if running
        logAction('FL simulation reset initiated');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/blockchain/fl/reset', {
                method: 'POST'
            });

            if (response.ok) {
                logSuccess('FL simulation reset to initial state');
                await fetchCurrentMetrics();
                await fetchTrainingHistory();
                alert('✅ Simulation reset successfully!');
            }
        } catch (error) {
            logError('FL reset error', error.message);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const chartData = trainingHistory.map(record => ({
        round: record.round,
        accuracy: (record.metrics.accuracy * 100).toFixed(2),
        loss: (record.metrics.loss * 100).toFixed(2),
        f1_score: (record.metrics.f1_score * 100).toFixed(2)
    }));

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Federated Learning Training</h1>
                    <p className="page-subtitle">🤖 Collaborative model training with verified hospitals</p>
                </div>
            </div>

            {/* Current Metrics Dashboard */}
            {currentMetrics && (
                <div className="stats-bar" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="stat-item">
                            <div className="stat-value" style={{ color: '#00ff41' }}>
                                {(currentMetrics.accuracy * 100).toFixed(2)}%
                            </div>
                            <div className="stat-label">Model Accuracy</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value" style={{ color: '#74b9ff' }}>
                                {(currentMetrics.f1_score * 100).toFixed(2)}%
                            </div>
                            <div className="stat-label">F1 Score</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value" style={{ color: '#ffa502' }}>
                                {currentMetrics.round}
                            </div>
                            <div className="stat-label">Training Rounds</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value" style={{ color: '#ff6348' }}>
                                {currentMetrics.total_samples_trained.toLocaleString()}
                            </div>
                            <div className="stat-label">Total Samples</div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Hospital Selection */}
                <div className="card">
                    <h3 className="card-title">
                        <Users size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Select Hospitals ({selectedHospitals.length}/{verifiedHospitals.length})
                    </h3>

                    <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                        <button onClick={selectAll} className="btn btn-secondary" style={{ flex: 1, fontSize: '13px' }} disabled={autoTraining}>
                            Select All
                        </button>
                        <button onClick={deselectAll} className="btn btn-secondary" style={{ flex: 1, fontSize: '13px' }} disabled={autoTraining}>
                            Deselect All
                        </button>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                        {verifiedHospitals.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                No verified hospitals available. Register hospitals in Node Registry first.
                            </div>
                        ) : (
                            verifiedHospitals.map(hospital => (
                                <div
                                    key={hospital.node_id}
                                    onClick={() => !autoTraining && toggleHospital(hospital.node_id)}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '8px',
                                        background: selectedHospitals.includes(hospital.node_id) ? '#e8f5e9' : '#f8f9fa',
                                        border: selectedHospitals.includes(hospital.node_id) ? '2px solid #28a745' : '1px solid #ddd',
                                        borderRadius: '8px',
                                        cursor: autoTraining ? 'not-allowed' : 'pointer',
                                        opacity: autoTraining ? 0.6 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedHospitals.includes(hospital.node_id)}
                                            onChange={() => { }}
                                            disabled={autoTraining}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{hospital.hospital_name}</div>
                                            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                                {hospital.district}, {hospital.state}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Max Rounds Input */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', color: '#6c757d', display: 'block', marginBottom: '6px' }}>
                            Max Training Rounds:
                        </label>
                        <input
                            type="number"
                            value={maxRounds}
                            onChange={(e) => setMaxRounds(parseInt(e.target.value) || 15)}
                            min="5"
                            max="50"
                            disabled={autoTraining}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Training Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {!autoTraining ? (
                            <button
                                onClick={startAutoTraining}
                                disabled={loading || selectedHospitals.length === 0}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                <Play size={16} style={{ marginRight: '6px' }} />
                                Start Auto-Training
                            </button>
                        ) : (
                            <button
                                onClick={stopAutoTraining}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: '#ff6348',
                                    color: 'white'
                                }}
                            >
                                <Pause size={16} style={{ marginRight: '6px' }} />
                                Stop Training
                            </button>
                        )}

                        <button
                            onClick={resetSimulation}
                            disabled={loading || autoTraining}
                            className="btn btn-secondary"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    {/* Training Status */}
                    {autoTraining && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: '#fff3cd',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#856404',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>Auto-training in progress... Round {currentMetrics?.round || 0}/{maxRounds}</span>
                        </div>
                    )}
                </div>

                {/* Real-Time Graph */}
                <div className="card">
                    <h3 className="card-title">
                        <TrendingUp size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Model Performance Over Time
                    </h3>

                    {chartData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#6c757d' }}>
                            <Database size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <div>No training data yet. Start auto-training to see the graph!</div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="round"
                                    label={{ value: 'Training Round', position: 'insideBottom', offset: -5 }}
                                    stroke="#999"
                                />
                                <YAxis
                                    domain={[70, 100]}
                                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                                    stroke="#999"
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#00ff41"
                                    strokeWidth={3}
                                    dot={{ fill: '#00ff41', r: 5 }}
                                    name="Accuracy (%)"
                                    animationDuration={1000}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="f1_score"
                                    stroke="#74b9ff"
                                    strokeWidth={2}
                                    dot={{ fill: '#74b9ff', r: 4 }}
                                    name="F1 Score (%)"
                                    animationDuration={1000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Training History Table */}
            {trainingHistory.length > 0 && (
                <div className="card" style={{ marginTop: '24px', maxWidth: '1400px', margin: '24px auto 0' }}>
                    <h3 className="card-title">Training History</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Accuracy</th>
                                    <th>F1 Score</th>
                                    <th>Loss</th>
                                    <th>Improvement</th>
                                    <th>Hospitals</th>
                                    <th>Samples</th>
                                    <th>Time (s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...trainingHistory].reverse().map((record, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '600' }}>#{record.round}</td>
                                        <td style={{ color: '#00ff41', fontWeight: '600' }}>
                                            {(record.metrics.accuracy * 100).toFixed(2)}%
                                        </td>
                                        <td>{(record.metrics.f1_score * 100).toFixed(2)}%</td>
                                        <td>{(record.metrics.loss).toFixed(4)}</td>
                                        <td style={{ color: '#ffa502' }}>
                                            +{(record.improvements.accuracy * 100).toFixed(2)}%
                                        </td>
                                        <td>{record.participating_hospitals}</td>
                                        <td>{record.samples_trained.toLocaleString()}</td>
                                        <td>{record.training_time_seconds}s</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default FLSimulation;
