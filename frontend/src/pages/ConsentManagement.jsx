import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Mail, Key, Clock } from 'lucide-react';

const ConsentManagement = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    hospital_id: '',
    otp: ''
  });
  const [checkResult, setCheckResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpDemo, setOtpDemo] = useState(''); // For demo mode

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (otpTimer === 0 && otpSent) {
      setOtpSent(false);
    }
  }, [otpTimer, otpSent]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.hospital_id) {
      alert('Please enter both Patient ID and Hospital ID');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/consent/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: formData.patient_id,
          hospital_id: formData.hospital_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setOtpEmail(data.email);
        setOtpTimer(300); // 5 minutes
        setOtpDemo(data.otp_for_demo || ''); // Store demo OTP
        alert(`✅ OTP sent to ${data.email}\n\n🔐 [DEMO MODE] Your OTP is: ${data.otp_for_demo}\n\nIn production, this would be sent via email.`);
      } else {
        alert(`❌ Error: ${data.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantWithOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      alert('Please enter the OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/consent/verify-and-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: formData.patient_id,
          hospital_id: formData.hospital_id,
          otp: formData.otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ OTP Verified! Consent granted successfully!\n\nTransaction Hash: ${data.transaction_hash}`);
        setFormData({ patient_id: '', hospital_id: '', otp: '' });
        setOtpSent(false);
        setOtpTimer(0);
        setOtpDemo('');
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
        body: JSON.stringify({
          patient_id: formData.patient_id,
          hospital_id: formData.hospital_id
        })
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
  }, [formData.patient_id, formData.hospital_id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Consent Management</h1>
          <p className="page-subtitle">🔐 Secure OTP-verified blockchain consent tracking</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Consent Form */}
        <div className="card">
          <h3 className="card-title">
            <Shield size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Manage Consent with OTP Verification
          </h3>

          <form onSubmit={otpSent ? handleGrantWithOTP : handleRequestOTP}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Patient ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter patient ID"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                  disabled={otpSent}
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
                  disabled={otpSent}
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

            {/* OTP Section */}
            {otpSent && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                marginBottom: '24px',
                color: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Mail size={24} />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>OTP Sent!</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>Check your email: {otpEmail}</div>
                  </div>
                </div>

                {otpDemo && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px'
                  }}>
                    🔐 <strong>DEMO MODE:</strong> Your OTP is <strong style={{ fontSize: '18px', letterSpacing: '2px' }}>{otpDemo}</strong>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: 'white' }}>
                    <Key size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    maxLength={6}
                    required
                    autoFocus
                    style={{
                      fontSize: '18px',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.95)',
                      color: '#333',
                      fontWeight: '600',
                      padding: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      cursor: 'text'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Clock size={16} />
                  <span>OTP expires in: <strong>{formatTime(otpTimer)}</strong></span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!otpSent ? (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Sending...' : '📧 Request OTP'}
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
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Verifying...' : '✓ Verify OTP & Grant Consent'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpTimer(0);
                      setFormData({ ...formData, otp: '' });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">🔐 How OTP Verification Works</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#6c757d' }}>
            <p><strong>1. Request OTP:</strong> Enter Patient ID and Hospital ID, then click "Request OTP".</p>
            <p><strong>2. Receive OTP:</strong> Patient receives a 6-digit OTP via email (valid for 5 minutes).</p>
            <p><strong>3. Verify Identity:</strong> Patient shares the OTP to verify they authorize the consent.</p>
            <p><strong>4. Grant Consent:</strong> Enter OTP and click "Verify OTP & Grant Consent".</p>
            <p><strong>5. Blockchain Record:</strong> Consent is recorded on the blockchain with an immutable audit trail.</p>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#fff3cd',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#856404',
            border: '1px solid #ffc107'
          }}>
            <strong>🔐 Security:</strong> This OTP system ensures that only the actual patient can grant consent to their medical data, preventing unauthorized access by doctors or staff.
          </div>

          <div style={{
            marginTop: '12px',
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
