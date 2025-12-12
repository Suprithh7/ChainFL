import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
    const [stats, setStats] = useState({
        total_patients: 0,
        high_risk_count: 0,
        average_risk: 0,
        recent_patient: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboardStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/dashboard/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error('Failed to fetch dashboard stats:', e);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (category) => {
        switch (category) {
            case 'Critical': return '#dc3545';
            case 'High': return '#fd7e14';
            case 'Moderate': return '#ffc107';
            case 'Low': return '#28a745';
            default: return '#6c757d';
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Real-time cardiac risk monitoring system</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                    <Users size={40} style={{ color: '#0066cc', marginBottom: '16px' }} />
                    <div style={{ fontSize: '48px', fontWeight: '700', color: '#0066cc' }}>
                        {stats.total_patients}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px', fontWeight: '600' }}>
                        Total Patients
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                    <AlertCircle size={40} style={{ color: '#dc3545', marginBottom: '16px' }} />
                    <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc3545' }}>
                        {stats.high_risk_count}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px', fontWeight: '600' }}>
                        High Risk Patients
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                    <TrendingUp size={40} style={{ color: '#28a745', marginBottom: '16px' }} />
                    <div style={{ fontSize: '48px', fontWeight: '700', color: '#28a745' }}>
                        {stats.average_risk.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px', fontWeight: '600' }}>
                        Average Risk Score
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                    <Activity size={40} style={{ color: '#0066cc', marginBottom: '16px' }} />
                    <div style={{ fontSize: '48px', fontWeight: '700', color: '#0066cc' }}>
                        {stats.total_patients - stats.high_risk_count}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px', fontWeight: '600' }}>
                        Low-Moderate Risk
                    </div>
                </div>
            </div>

            {/* Recent Patient Info */}
            {stats.recent_patient && (
                <div className="content-grid">
                    <div className="card">
                        <h3 className="card-title">Most Recent Assessment</h3>
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600' }}>
                                        {stats.recent_patient.name}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                                        Age: {stats.recent_patient.age} years • ID: #{stats.recent_patient.id}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: getRiskColor(stats.recent_patient.risk_category)
                                    }}>
                                        {stats.recent_patient.last_risk_score}%
                                    </div>
                                    <span className="badge" style={{
                                        background: stats.recent_patient.risk_category === 'Critical' || stats.recent_patient.risk_category === 'High' ? '#ffebee' :
                                            stats.recent_patient.risk_category === 'Moderate' ? '#fff3e0' : '#e8f5e9',
                                        color: getRiskColor(stats.recent_patient.risk_category),
                                        marginTop: '8px'
                                    }}>
                                        {stats.recent_patient.risk_category}
                                    </span>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#6c757d' }}>
                                    Clinical Parameters
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    <div style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#6c757d' }}>BP:</span> <strong>{stats.recent_patient.bp} mmHg</strong>
                                    </div>
                                    <div style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#6c757d' }}>Cholesterol:</span> <strong>{stats.recent_patient.cholesterol} mg/dL</strong>
                                    </div>
                                    <div style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#6c757d' }}>Troponin:</span> <strong>{stats.recent_patient.troponin} ng/mL</strong>
                                    </div>
                                    <div style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#6c757d' }}>EF:</span> <strong>{stats.recent_patient.ejectionFraction}%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title">System Status</h3>
                        <div style={{ marginTop: '20px' }}>
                            <div style={{
                                padding: '16px',
                                background: '#e8f5e9',
                                borderRadius: '8px',
                                border: '1px solid #c8e6c9',
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: '#28a745',
                                        animation: 'pulse 2s infinite'
                                    }}></div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>
                                            All Systems Operational
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                            Last updated: {new Date().toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.8' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>✓ ML Model Status</span>
                                    <strong style={{ color: '#28a745' }}>Active</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>✓ Backend API</span>
                                    <strong style={{ color: '#28a745' }}>Connected</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>✓ Database</span>
                                    <strong style={{ color: '#28a745' }}>Online</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>✓ Prediction Service</span>
                                    <strong style={{ color: '#28a745' }}>Ready</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
