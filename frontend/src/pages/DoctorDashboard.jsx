import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, AlertCircle, Heart, Brain, Stethoscope, Shield, Clock, Award } from 'lucide-react';

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
    <div style={{ background: '#f0f4f8', minHeight: '100vh', padding: '40px 20px' }}>
      {/* Hero Header */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto 40px',
        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
        padding: '60px 40px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(30, 136, 229, 0.3)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '12px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Silent Heart Disease Early Risk Detection
          </h1>
          <p style={{
            fontSize: '20px',
            opacity: 0.95,
            fontWeight: '400'
          }}>
            AI + Federated Learning + Blockchain for Secure Healthcare Intelligence
          </p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Total Patients Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e3f2fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Users size={24} color="#1e88e5" />
            </div>
            <span style={{ fontSize: '16px', color: '#546e7a', fontWeight: '500' }}>Total Patients</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px', color: '#1e88e5' }}>
            {stats.total_patients}
          </div>
          <div style={{ fontSize: '14px', color: '#78909c' }}>
            Monitored in system
          </div>
        </div>

        {/* High Risk Patients Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e3f2fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ffebee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <AlertCircle size={24} color="#e53935" />
            </div>
            <span style={{ fontSize: '16px', color: '#546e7a', fontWeight: '500' }}>High Risk</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px', color: '#e53935' }}>
            {stats.high_risk_count}
          </div>
          <div style={{ fontSize: '14px', color: '#78909c' }}>
            Patients require attention
          </div>
        </div>

        {/* Average Risk Score Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e3f2fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <TrendingUp size={24} color="#43a047" />
            </div>
            <span style={{ fontSize: '16px', color: '#546e7a', fontWeight: '500' }}>Average Risk</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px', color: '#43a047' }}>
            {stats.average_risk.toFixed(1)}%
          </div>
          <div style={{ fontSize: '14px', color: '#78909c' }}>
            Population risk score
          </div>
        </div>

        {/* AI Model Status Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e3f2fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f3e5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Brain size={24} color="#8e24aa" />
            </div>
            <span style={{ fontSize: '16px', color: '#546e7a', fontWeight: '500' }}>AI Model</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px', color: '#8e24aa' }}>
            Active
          </div>
          <div style={{ fontSize: '14px', color: '#78909c' }}>
            Federated learning enabled
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Recent Patient Card */}
        {stats.recent_patient && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <Activity size={24} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
                  Recent Patient
                </h3>
                <p style={{ fontSize: '14px', color: '#6c757d', margin: '4px 0 0' }}>
                  Latest assessment
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                {stats.recent_patient.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Age: {stats.recent_patient.age} | Gender: {stats.recent_patient.gender}
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: `linear-gradient(135deg, ${getRiskColor(stats.recent_patient.risk_category)}22 0%, ${getRiskColor(stats.recent_patient.risk_category)}11 100%)`,
              borderRadius: '12px',
              border: `2px solid ${getRiskColor(stats.recent_patient.risk_category)}`,
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
                Risk Score
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: getRiskColor(stats.recent_patient.risk_category)
              }}>
                {stats.recent_patient.risk_score}%
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: getRiskColor(stats.recent_patient.risk_category),
                marginTop: '4px'
              }}>
                {stats.recent_patient.risk_category} Risk
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#6c757d' }}>
              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              {new Date(stats.recent_patient.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* System Features Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <Shield size={24} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
                Platform Features
              </h3>
              <p style={{ fontSize: '14px', color: '#6c757d', margin: '4px 0 0' }}>
                Powered by blockchain & AI
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <Heart size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                  Cardiac Risk Prediction
                </div>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>
                  Multi-disease AI analysis
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <Shield size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                  Blockchain Consent
                </div>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>
                  Immutable patient authorization
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                  Federated Learning
                </div>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>
                  Privacy-preserving AI training
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <Award size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                  Hospital Verification
                </div>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>
                  Verified network participants
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <Stethoscope size={24} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>
                Quick Actions
              </h3>
              <p style={{ fontSize: '14px', color: '#6c757d', margin: '4px 0 0' }}>
                Common tasks
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="/prediction" style={{
                display: 'block',
                padding: '16px',
                background: '#1e88e5',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)'
              }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(30, 136, 229, 0.3)';
                }}
              >
                🔬 New Risk Prediction
              </a>

              <a href="/records" style={{
                display: 'block',
                padding: '16px',
                background: '#1e88e5',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)'
              }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(30, 136, 229, 0.3)';
                }}
              >
                📋 View Patient Records
              </a>

              <a href="/consent" style={{
                display: 'block',
                padding: '16px',
                background: '#1e88e5',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)'
              }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(30, 136, 229, 0.3)';
                }}
              >
                🔐 Manage Consent
              </a>

              <a href="/fl-simulation" style={{
                display: 'block',
                padding: '16px',
                background: '#1e88e5',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)'
              }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(30, 136, 229, 0.3)';
                }}
              >
                🤖 FL Training
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'white',
        opacity: 0.8,
        fontSize: '14px'
      }}>
        <p>🏥 ChainFL-Care - Blockchain-Powered Healthcare AI Platform</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>
          Secure • Private • Intelligent
        </p>
      </div>
    </div>
  );
};

export default DoctorDashboard;
