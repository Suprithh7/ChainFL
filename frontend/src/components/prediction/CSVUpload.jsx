import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResults(null);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/api/predict/batch', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Error: ${err.message}. Make sure the backend is running on http://127.0.0.1:8000`);
    } finally {
      setUploading(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csv = Papa.unparse(results.predictions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `risk_predictions_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        age: 65, bp: 145, cholesterol: 240, glucose: 1, maxHr: 140,
        stDepression: 2.0, troponin: 0.08, ejectionFraction: 42, creatinine: 1.4, bmi: 28.5
      },
      {
        age: 55, bp: 130, cholesterol: 200, glucose: 0, maxHr: 160,
        stDepression: 1.0, troponin: 0.02, ejectionFraction: 60, creatinine: 1.0, bmi: 24.0
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'sample_patients.csv');
  };

  const getRiskColor = (category) => {
    switch (category) {
      case 'Critical': return '#dc3545';
      case 'High': return '#dc3545';
      case 'Moderate': return '#f59e0b';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {!results ? (
        <div className="card">
          <h3 className="card-title">Batch Risk Prediction - CSV Upload</h3>

          {/* Instructions */}
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} />
              CSV Format Requirements
            </h4>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>
              Your CSV must include these columns: <code>age, bp, cholesterol, glucose, maxHr, stDepression, troponin, ejectionFraction, creatinine, bmi</code>
            </p>
            <button
              onClick={downloadSampleCSV}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <Download size={14} style={{ marginRight: '6px' }} />
              Download Sample CSV
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: dragActive ? '2px dashed #0066cc' : '2px dashed #dee2e6',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
              background: dragActive ? '#f0f9ff' : '#fafbfc',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Upload size={48} style={{ color: '#0066cc', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              {file ? file.name : 'Drop CSV file here or click to browse'}
            </h4>
            <p style={{ fontSize: '14px', color: '#6c757d' }}>
              Maximum file size: 5MB
            </p>
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#fff5f5',
              border: '1px solid #ffcccc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#dc3545'
            }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={!file || uploading}
            >
              {uploading ? 'Processing...' : 'Upload and Predict'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Batch Prediction Results</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={downloadResults} className="btn btn-secondary">
                <Download size={16} style={{ marginRight: '6px' }} />
                Export Results
              </button>
              <button onClick={() => { setResults(null); setFile(null); }} className="btn btn-secondary">
                New Upload
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0066cc' }}>
                {results.summary.total_patients}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                Total Patients
              </div>
            </div>
            <div style={{ background: '#fff5f5', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc3545' }}>
                {results.summary.high_risk_count}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                High Risk
              </div>
            </div>
            <div style={{ background: '#fffbf0', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {results.summary.moderate_risk_count}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                Moderate Risk
              </div>
            </div>
            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>
                {results.summary.low_risk_count}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                Low Risk
              </div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#495057' }}>
                {results.summary.average_risk}%
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                Average Risk
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Age</th>
                  <th>Troponin</th>
                  <th>EF %</th>
                  <th>Risk Score</th>
                  <th>Category</th>
                  <th>Top Factor</th>
                </tr>
              </thead>
              <tbody>
                {results.predictions.map((pred, idx) => (
                  <tr key={idx}>
                    <td>{pred.patient_id}</td>
                    <td>{pred.age || 'N/A'}</td>
                    <td>{pred.troponin !== undefined ? pred.troponin.toFixed(2) : 'N/A'}</td>
                    <td>{pred.ejectionFraction || 'N/A'}</td>
                    <td>
                      <span style={{
                        fontWeight: '600',
                        color: pred.risk_score ? getRiskColor(pred.risk_category) : '#6c757d'
                      }}>
                        {pred.risk_score ? `${pred.risk_score}%` : 'Error'}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: pred.risk_category === 'Critical' || pred.risk_category === 'High' ? '#ffebee' :
                          pred.risk_category === 'Moderate' ? '#fff3e0' :
                            pred.risk_category === 'Low' ? '#e8f5e9' : '#f5f5f5',
                        color: getRiskColor(pred.risk_category)
                      }}>
                        {pred.risk_category || pred.error}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{pred.top_factor || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;
