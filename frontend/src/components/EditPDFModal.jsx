import React, { useState } from 'react';
import { generatePatientPDF } from '../utils/pdfGenerator';

const EditPDFModal = ({ patient, onClose }) => {
  const [editedData, setEditedData] = useState({
    name: patient.name,
    age: patient.age,
    gender: patient.gender || '',
    contact: patient.contact || '',
    doctor_notes: patient.doctor_notes || ''
  });

  const handleDownload = () => {
    try {
      console.log('📄 Generating PDF for patient:', patient.name);
      console.log('📝 Edited data:', editedData);
      generatePatientPDF(patient, editedData);
      console.log('✅ PDF generated successfully');
      onClose();
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
          📄 Edit PDF Report
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Patient Name
          </label>
          <input
            type="text"
            value={editedData.name}
            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Age
            </label>
            <input
              type="number"
              value={editedData.age}
              onChange={(e) => setEditedData({ ...editedData, age: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Gender
            </label>
            <select
              value={editedData.gender}
              onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Contact Number
          </label>
          <input
            type="tel"
            value={editedData.contact}
            onChange={(e) => setEditedData({ ...editedData, contact: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Doctor's Notes (Optional)
          </label>
          <textarea
            value={editedData.doctor_notes}
            onChange={(e) => setEditedData({ ...editedData, doctor_notes: e.target.value })}
            rows={4}
            placeholder="Add any additional notes for the report..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📄 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPDFModal;
