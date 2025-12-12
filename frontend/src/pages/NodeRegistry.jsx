import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, Key } from 'lucide-react';

const NodeRegistry = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    node_id: '',
    hospital_name: '',
    public_key: ''
  });

  useEffect(() => {
    fetchNodes();
  }, []);

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
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/blockchain/node/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Node registered successfully!\nTx: ${data.transaction_hash}`);
        setFormData({ node_id: '', hospital_name: '', public_key: '' });
        fetchNodes();
      } else {
        alert(`❌ Error: ${data.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}\nMake sure Ganache is running!`);
    } finally {
      setLoading(false);
    }
  };

  const generatePublicKey = () => {
    // Generate a random hex string as public key (for demo)
    const randomHex = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setFormData({ ...formData, public_key: randomHex });
  };

  // Check if node name looks suspicious
  const isSuspicious = (nodeName) => {
    const suspiciousKeywords = ['hacker', 'fake', 'test', 'malicious', 'spam', 'fraud'];
    return suspiciousKeywords.some(keyword =>
      nodeName.toLowerCase().includes(keyword)
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Node Registry</h1>
          <p className="page-subtitle">Blockchain-based hospital node verification</p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                <input
                  type="text"
                  className="form-input"
                  placeholder="City General Hospital"
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  required
                />
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

        {/* Registered Nodes Table */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">Registered Nodes</h3>

          {nodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              No nodes registered yet. Register your first hospital node above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Node ID</th>
                    <th>Hospital Name</th>
                    <th>Public Key</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node, idx) => {
                    const suspicious = isSuspicious(node.hospital_name);
                    return (
                      <tr key={idx} style={{
                        background: suspicious ? '#fff3cd' : 'transparent',
                        borderLeft: suspicious ? '4px solid #ffc107' : 'none'
                      }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {node.is_verified ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: suspicious ? '#ff9800' : '#28a745' }}>
                                {suspicious ? (
                                  <>
                                    <XCircle size={18} />
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Suspicious</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={18} />
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Verified</span>
                                  </>
                                )}
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
                            {suspicious && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                background: '#dc3545',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: '600'
                              }}>
                                ⚠️ FLAGGED
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <code style={{
                            fontSize: '11px',
                            background: '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {node.public_key}
                          </code>
                        </td>
                        <td style={{ fontSize: '13px', color: '#6c757d' }}>
                          {new Date(node.registration_time * 1000).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title">Node Verification</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#6c757d' }}>
            <p><strong>Purpose:</strong> Only verified hospital nodes can submit predictions and access patient data.</p>
            <p><strong>Registration:</strong> Each hospital receives a unique node ID and cryptographic public key.</p>
            <p><strong>Verification:</strong> All prediction requests are validated against the blockchain registry.</p>
            <p><strong>Security:</strong> Unverified nodes are automatically rejected by the system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeRegistry;
