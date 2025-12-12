import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Clock } from 'lucide-react';

const ConsentManagement = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    hospital_id: ''
  });
  const [checkResult, setCheckResult] = useState(null);

  const handleGrant = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Consent granted successfully!\nTx: ${data.transaction_hash}`);
        setFormData({ patient_id: '', hospital_id: '' });
        checkConsent();
      } else {
        alert(`❌ Error: ${data.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}\nMake sure Ganache is running!`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!formData.patient_id || !formData.hospital_id) {
      alert('Please enter both Patient ID and Hospital ID');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Consent revoked successfully!\nTx: ${data.transaction_hash}`);
        checkConsent();
      } else {
        alert(`❌ Error: ${data.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConsent = async () => {
    if (!formData.patient_id || !formData.hospital_id) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/blockchain/consent/check/${formData.patient_id}/${formData.hospital_id}`
      );
      const data = await response.json();
      setCheckResult(data);
    } catch (error) {
      console.error('Error checking consent:', error);
    }
  };

  useEffect(() => {
    if (formData.patient_id && formData.hospital_id) {
      const timer = setTimeout(checkConsent, 500);
      return () => clearTimeout(timer);
    }
  }, [formData]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Consent Management</h1>
          <p className="page-subtitle">Blockchain-based consent tracking for data usage</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Consent Form */}
        <div className="card">
          <h3 className="card-title">
            <Shield size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Manage Consent
          </h3>

          <form onSubmit={handleGrant}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Patient ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="P001"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="H001"
                  value={formData.hospital_id}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Current Status */}
            {checkResult && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                background: checkResult.has_consent ? '#e8f5e9' : '#ffebee',
                border: `1px solid ${checkResult.has_consent ? '#c8e6c9' : '#ffcdd2'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {checkResult.has_consent ? (
                    <Check size={24} style={{ color: '#28a745' }} />
                  ) : (
                    <X size={24} style={{ color: '#dc3545' }} />
                  )}
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: checkResult.has_consent ? '#28a745' : '#dc3545'
                    }}>
                      {checkResult.has_consent ? 'Consent Granted' : 'No Consent'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '4px' }}>
                      {checkResult.transaction_hash}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Processing...' : '✓ Grant Consent'}
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                className="btn btn-secondary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                ✗ Revoke Consent
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">How It Works</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#6c757d' }}>
            <p><strong>1. Grant Consent:</strong> Patient authorizes a hospital to use their data for predictions and analysis.</p>
            <p><strong>2. Blockchain Record:</strong> Consent is recorded on the blockchain, creating an immutable audit trail.</p>
            <p><strong>3. Verification:</strong> Before any prediction, the system checks if consent exists.</p>
            <p><strong>4. Revoke Anytime:</strong> Patients can revoke consent at any time, immediately preventing data usage.</p>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#495057'
          }}>
            <strong>⚠️ Note:</strong> Make sure Ganache is running on http://127.0.0.1:8545 and contracts are deployed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentManagement;
