import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, Key, AlertTriangle, Filter, Search } from 'lucide-react';
import { useActivityLog } from '../context/ActivityLogContext';

const NodeRegistry = () => {
  const { logAction, logSuccess, logError } = useActivityLog();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [legitimateHospitals, setLegitimateHospitals] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [formData, setFormData] = useState({
    node_id: '',
    hospital_name: '',
    public_key: '',
    state: '',
    district: ''
  });
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  useEffect(() => {
    fetchNodes();
    fetchStates();
    fetchLegitimateHospitals();
  }, []);

  useEffect(() => {
    // Fetch hospitals when state/district changes
    if (formData.state) {
      fetchLegitimateHospitals(formData.state, formData.district);
    }
  }, [formData.state, formData.district]);

  const fetchStates = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/hospitals/states');
      if (response.ok) {
        const data = await response.json();
        setStates(data.states || []);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchLegitimateHospitals = async (state = null, district = null) => {
    try {
      let url = 'http://127.0.0.1:8000/blockchain/hospitals/legitimate';
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLegitimateHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.error('Error fetching legitimate hospitals:', error);
    }
  };

  const fetchDistricts = async (state) => {
    if (!state) {
      setDistricts([]);
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/blockchain/hospitals/districts/${state}`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts || []);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleStateChange = (state) => {
    setFormData({ ...formData, state, district: '' });
    fetchDistricts(state);
  };

  const fetchNodes = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/nodes');
      if (response.ok) {
        const data = await response.json();
        setNodes(data);
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    logAction('Hospital node registration initiated', `${formData.hospital_name} (${formData.state})`);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/node/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        const statusIcon = data.verification_status === 'verified' ? '✅' : '⚠️';

        if (data.verification_status === 'verified') {
          logSuccess('Hospital node registered and verified', `${formData.hospital_name} (${formData.state}, ${formData.district})`);
        } else {
          logAction('Hospital node flagged for admin review', `${formData.hospital_name} - awaiting approval`);
        }

        alert(`${statusIcon} ${data.message}\n\nTransaction Hash: ${data.transaction_hash}`);
        setFormData({ node_id: '', hospital_name: '', public_key: '', state: '', district: '' });
        setHospitalSearch('');
        fetchNodes();
      } else {
        logError('Hospital registration failed', data.detail);
        alert(`❌ Error: ${data.detail}`);
      }
    } catch (error) {
      logError('Hospital registration error', error.message);
      alert(`❌ Error: ${error.message}\nMake sure Ganache is running!`);
    } finally {
      setLoading(false);
    }
  };

  const generatePublicKey = () => {
    const randomHex = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setFormData({ ...formData, public_key: randomHex });
  };

  // Filter nodes based on selected state/district
  const filteredNodes = nodes.filter(node => {
    if (filterState && node.state !== filterState) return false;
    if (filterDistrict && node.district !== filterDistrict) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Node Registry</h1>
          <p className="page-subtitle">🏥 Verified hospital network with state/district validation</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Registration Form */}
        <div className="card">
          <h3 className="card-title">
            <Server size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Register New Hospital Node
          </h3>

          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Node ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="H001"
                  value={formData.node_id}
                  onChange={(e) => setFormData({ ...formData, node_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital Name</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={18} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6c757d',
                      pointerEvents: 'none'
                    }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search hospital name..."
                      value={hospitalSearch || formData.hospital_name}
                      onChange={(e) => {
                        setHospitalSearch(e.target.value);
                        setFormData({ ...formData, hospital_name: e.target.value });
                        setShowHospitalDropdown(true);
                      }}
                      onFocus={() => setShowHospitalDropdown(true)}
                      required
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>

                  {showHospitalDropdown && legitimateHospitals.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginTop: '4px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      zIndex: 1000
                    }}>
                      {legitimateHospitals
                        .filter(hospital =>
                          hospital.name.toLowerCase().includes((hospitalSearch || formData.hospital_name).toLowerCase())
                        )
                        .map((hospital, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                hospital_name: hospital.name,
                                state: hospital.state,
                                district: hospital.district
                              });
                              setHospitalSearch('');
                              setShowHospitalDropdown(false);
                              fetchDistricts(hospital.state);
                            }}
                            style={{
                              padding: '12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                          >
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{hospital.name}</div>
                            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                              {hospital.city}, {hospital.district}, {hospital.state}
                            </div>
                          </div>
                        ))}
                      {legitimateHospitals.filter(hospital =>
                        hospital.name.toLowerCase().includes((hospitalSearch || formData.hospital_name).toLowerCase())
                      ).length === 0 && (
                          <div style={{ padding: '12px', color: '#6c757d', fontSize: '13px', textAlign: 'center' }}>
                            No hospitals found. Hospital will be flagged for admin review.
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <select
                  className="form-input"
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <select
                  className="form-input"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                  disabled={!formData.state}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Public Key</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0x..."
                  value={formData.public_key}
                  onChange={(e) => setFormData({ ...formData, public_key: e.target.value })}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={generatePublicKey}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Key size={16} style={{ marginRight: '6px' }} />
                  Generate
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Node'}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">
            <Filter size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Filter Hospitals
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Filter by State</label>
              <select
                className="form-input"
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setFilterDistrict('');
                }}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Filter by District</label>
              <select
                className="form-input"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                disabled={!filterState}
              >
                <option value="">All Districts</option>
                {filterState && districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Registered Nodes Table */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">
            Registered Nodes
            <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 'normal', color: '#6c757d' }}>
              ({filteredNodes.length} {filteredNodes.length === 1 ? 'hospital' : 'hospitals'})
            </span>
          </h3>

          {filteredNodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              No nodes found. {filterState || filterDistrict ? 'Try adjusting your filters.' : 'Register your first hospital node above.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Node ID</th>
                    <th>Hospital Name</th>
                    <th>Location</th>
                    <th>Public Key</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.map((node, idx) => {
                    const isVerified = node.verification_status === 'verified';
                    const isFlagged = node.verification_status === 'flagged';

                    return (
                      <tr key={idx} style={{
                        background: isFlagged ? '#fff3cd' : isVerified ? '#e8f5e9' : 'transparent',
                        borderLeft: isFlagged ? '4px solid #ffc107' : isVerified ? '4px solid #28a745' : 'none'
                      }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isVerified ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#28a745' }}>
                                <CheckCircle size={18} />
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>Verified</span>
                              </div>
                            ) : isFlagged ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff9800' }}>
                                <AlertTriangle size={18} />
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>Flagged</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc3545' }}>
                                <XCircle size={18} />
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>Unverified</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: '600' }}>{node.node_id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {node.hospital_name}
                            {isFlagged && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                background: '#ffc107',
                                color: '#000',
                                borderRadius: '12px',
                                fontWeight: '600'
                              }}>
                                ⚠️ PENDING APPROVAL
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#6c757d' }}>
                          {node.state && node.district ? (
                            <div>
                              <div style={{ fontWeight: '600', color: '#333' }}>{node.state}</div>
                              <div style={{ fontSize: '12px' }}>{node.district}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>Not specified</span>
                          )}
                        </td>
                        <td>
                          <code style={{
                            fontSize: '11px',
                            background: '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {node.public_key}
                          </code>
                        </td>
                        <td style={{ fontSize: '13px', color: '#6c757d' }}>
                          {node.registration_time ? new Date(node.registration_time * 1000).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeRegistry;
