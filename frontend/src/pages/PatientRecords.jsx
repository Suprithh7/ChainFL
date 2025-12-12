import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import EditPDFModal from '../components/EditPDFModal';

const PatientRecords = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPatient, setEditingPatient] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
        // Auto-refresh every 5 seconds for real-time updates
        const interval = setInterval(fetchPatients, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/patients');
            const data = await res.json();
            setPatients(data.patients || []); // API returns {patients: [...]}
        } catch (e) {
            console.error('Failed to fetch patients:', e);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = (patient) => {
        // Navigate to prediction page with patient data
        navigate('/prediction', { state: { selectedPatient: patient } });
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Patient Records</h1>
                    <p className="page-subtitle">Manage and view patient risk assessments</p>
                </div>
                <button
                    onClick={() => navigate('/prediction')}
                    className="btn btn-primary"
                >
                    ➕ New Assessment
                </button>
            </div>

            {/* Stats Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                    <Users size={32} style={{ color: '#0066cc', marginBottom: '12px' }} />
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#0066cc' }}>
                        {patients.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                        Total Patients
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                    <AlertCircle size={32} style={{ color: '#dc3545', marginBottom: '12px' }} />
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc3545' }}>
                        {patients.filter(p => p.risk_score >= 60).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                        High Risk
                    </div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                    <TrendingUp size={32} style={{ color: '#28a745', marginBottom: '12px' }} />
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745' }}>
                        {patients.filter(p => p.risk_score < 30).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                        Low Risk
                    </div>
                </div>
            </div>

            {/* Patient List */}
            <div className="card">
                <h3 className="card-title">Patient List</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        Loading patients...
                    </div>
                ) : patients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        <p>No patients found. Make a prediction to add your first patient!</p>
                        <button
                            onClick={() => navigate('/prediction')}
                            className="btn btn-primary"
                            style={{ marginTop: '16px' }}
                        >
                            Add First Patient
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient Name</th>
                                    <th>Age</th>
                                    <th>Risk Score</th>
                                    <th>Risk Category</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td style={{ fontWeight: '600' }}>{patient.name}</td>
                                        <td>{patient.age}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: getRiskColor(patient.risk_category)
                                            }}>
                                                {patient.risk_score}%
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: `${getRiskColor(patient.risk_category)}20`,
                                                color: getRiskColor(patient.risk_category)
                                            }}>
                                                {patient.risk_category}
                                            </span>
                                        </td>
                                        <td>{new Date(patient.timestamp).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleSelectPatient(patient)}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => setEditingPatient(patient)}
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                                >
                                                    📄 PDF
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit PDF Modal */}
            {editingPatient && (
                <EditPDFModal
                    patient={editingPatient}
                    onClose={() => setEditingPatient(null)}
                />
            )}
        </div>
    );
};

export default PatientRecords;
