import React, { useState, useEffect } from 'react';
import { Upload, FileText, Activity } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import CSVUpload from '../components/prediction/CSVUpload';
import { useActivityLog } from '../context/ActivityLogContext';

const PatientPrediction = () => {
    const location = useLocation();
    const { logAction, logSuccess, logError } = useActivityLog();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'csv'
    const [formData, setFormData] = useState({
        // Patient Information
        name: '',
        gender: '',
        contact: '',

        // Cardiac parameters (required)
        age: '',
        bp: '',
        cholesterol: '',
        glucose: '',
        maxHr: '',
        stDepression: '',
        troponin: '',
        ejectionFraction: '',
        creatinine: '',
        bmi: '',

        // Multi-disease parameters (optional)
        hba1c: '',
        gfr: '',
        protein_urine: '',
        alt: '',
        ast: '',
        bilirubin: '',
        albumin: '',
        platelet_count: '',
        systolic_bp: '',
        diastolic_bp: ''
    });

    // Auto-fill form if patient selected from records
    useEffect(() => {
        if (location.state?.selectedPatient) {
            const patient = location.state.selectedPatient;
            setFormData({
                age: patient.age || '',
                bp: patient.bp || '',
                cholesterol: patient.cholesterol || '',
                glucose: patient.glucose !== undefined ? patient.glucose : '',
                maxHr: patient.maxHr || '',
                stDepression: patient.stDepression || '',
                troponin: patient.troponin || '',
                ejectionFraction: patient.ejectionFraction || '',
                creatinine: patient.creatinine || '',
                bmi: patient.bmi || ''
            });
        }
    }, [location.state]);

    const handlePredict = async (e) => {
        e.preventDefault();
        logAction('Risk prediction initiated', formData.name || 'Unnamed patient');
        setLoading(true);

        try {
            // Call backend API
            const response = await fetch('http://127.0.0.1:8000/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    age: parseFloat(formData.age),
                    bp: parseFloat(formData.bp),
                    cholesterol: parseFloat(formData.cholesterol),
                    glucose: parseInt(formData.glucose),
                    maxHr: parseFloat(formData.maxHr),
                    stDepression: parseFloat(formData.stDepression),
                    troponin: parseFloat(formData.troponin),
                    ejectionFraction: parseFloat(formData.ejectionFraction),
                    creatinine: parseFloat(formData.creatinine),
                    bmi: parseFloat(formData.bmi),
                    // Optional fields
                    hba1c: formData.hba1c ? parseFloat(formData.hba1c) : null,
                    gfr: formData.gfr ? parseFloat(formData.gfr) : null,
                    protein_urine: formData.protein_urine ? parseFloat(formData.protein_urine) : null,
                    alt: formData.alt ? parseFloat(formData.alt) : null,
                    ast: formData.ast ? parseFloat(formData.ast) : null,
                    bilirubin: formData.bilirubin ? parseFloat(formData.bilirubin) : null,
                    albumin: formData.albumin ? parseFloat(formData.albumin) : null,
                    platelet_count: formData.platelet_count ? parseFloat(formData.platelet_count) : null,
                    systolic_bp: formData.systolic_bp ? parseInt(formData.systolic_bp) : null,
                    diastolic_bp: formData.diastolic_bp ? parseInt(formData.diastolic_bp) : null
                })
            });


            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Prediction failed');
            }

            const data = await response.json();
            console.log('🔍 Prediction Response:', data);
            console.log('🏥 Multi-Disease Risks:', data.multi_disease_risks);
            setResult(data);

            // Save patient record
            if (formData.name) {
                try {
                    await fetch('http://127.0.0.1:8000/api/patients', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: formData.name,
                            age: parseInt(formData.age),
                            gender: formData.gender || null,
                            contact: formData.contact || null,
                            bp: parseFloat(formData.bp),
                            cholesterol: parseFloat(formData.cholesterol),
                            glucose: parseInt(formData.glucose),
                            maxHr: parseFloat(formData.maxHr),
                            stDepression: parseFloat(formData.stDepression),
                            troponin: parseFloat(formData.troponin),
                            ejectionFraction: parseFloat(formData.ejectionFraction),
                            creatinine: parseFloat(formData.creatinine),
                            bmi: parseFloat(formData.bmi),
                            hba1c: formData.hba1c ? parseFloat(formData.hba1c) : null,
                            gfr: formData.gfr ? parseFloat(formData.gfr) : null,
                            protein_urine: formData.protein_urine ? parseFloat(formData.protein_urine) : null,
                            alt: formData.alt ? parseFloat(formData.alt) : null,
                            ast: formData.ast ? parseFloat(formData.ast) : null,
                            bilirubin: formData.bilirubin ? parseFloat(formData.bilirubin) : null,
                            albumin: formData.albumin ? parseFloat(formData.albumin) : null,
                            platelet_count: formData.platelet_count ? parseFloat(formData.platelet_count) : null,
                            systolic_bp: formData.systolic_bp ? parseInt(formData.systolic_bp) : null,
                            diastolic_bp: formData.diastolic_bp ? parseInt(formData.diastolic_bp) : null,
                            risk_score: data.risk_score,
                            risk_category: data.risk_category,
                            recommendation: data.recommendation,
                            top_factors: data.top_factors,
                            multi_disease_risks: data.multi_disease_risks,
                            timestamp: data.timestamp
                        })
                    });
                    logSuccess('Patient record saved to database', formData.name);
                    console.log('✅ Patient record saved');
                } catch (saveError) {
                    console.error('Failed to save patient:', saveError);
                }
            }
        } catch (error) {
            console.error('Prediction error:', error);
            logError('Risk prediction failed', error.message);
            alert(`Error: ${error.message}. Make sure the backend is running on http://127.0.0.1:8000`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            age: '',
            bp: '',
            cholesterol: '',
            glucose: '',
            maxHr: '',
            stDepression: '',
            troponin: '',
            ejectionFraction: '',
            creatinine: '',
            bmi: ''
        });
        setResult(null);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Risk Prediction</h1>
                <p className="page-subtitle">AI-powered cardiac risk assessment with industry-grade metrics</p>
            </div>

            {!result ? (
                <>
                    {/* Tab Navigation */}
                    <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', maxWidth: '800px', margin: '0 auto 24px' }}>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <FileText size={18} />
                            Manual Entry
                        </button>
                        <button
                            onClick={() => setActiveTab('csv')}
                            className={`btn ${activeTab === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Upload size={18} />
                            CSV Upload
                        </button>
                    </div>

                    {/* Manual Entry Tab */}
                    {activeTab === 'manual' && (
                        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <form onSubmit={handlePredict}>
                                {/* Patient Information Section */}
                                <div style={{ marginBottom: '32px', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px' }}>
                                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '24px' }}>👤</span>
                                        Patient Information
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ color: 'white' }}>Patient Name *</label>
                                            <input
                                                name="name"
                                                type="text"
                                                className="form-input"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                style={{ background: 'rgba(255,255,255,0.9)' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ color: 'white' }}>Gender</label>
                                            <select
                                                name="gender"
                                                className="form-input"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                style={{ background: 'rgba(255,255,255,0.9)' }}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label" style={{ color: 'white' }}>
                                                Email Address / Contact Number
                                                <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.8 }}>
                                                    (Email required for OTP consent verification)
                                                </span>
                                            </label>
                                            <input
                                                name="contact"
                                                type="text"
                                                className="form-input"
                                                placeholder="patient@example.com or +1 (555) 123-4567"
                                                value={formData.contact}
                                                onChange={handleChange}
                                                style={{ background: 'rgba(255,255,255,0.9)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Parameters */}
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                                    Clinical Parameters
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {/* Existing Fields */}
                                    <div className="form-group">
                                        <label className="form-label">Age (years)</label>
                                        <input
                                            name="age"
                                            type="number"
                                            step="1"
                                            className="form-input"
                                            placeholder="65"
                                            value={formData.age}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Resting BP (mmHg)</label>
                                        <input
                                            name="bp"
                                            type="number"
                                            className="form-input"
                                            placeholder="130"
                                            value={formData.bp}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Cholesterol (mg/dL)</label>
                                        <input
                                            name="cholesterol"
                                            type="number"
                                            className="form-input"
                                            placeholder="240"
                                            value={formData.cholesterol}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Fasting Blood Sugar &gt; 120 (0/1)</label>
                                        <input
                                            name="glucose"
                                            type="number"
                                            min="0"
                                            max="1"
                                            className="form-input"
                                            placeholder="1"
                                            value={formData.glucose}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Max Heart Rate (bpm)</label>
                                        <input
                                            name="maxHr"
                                            type="number"
                                            className="form-input"
                                            placeholder="150"
                                            value={formData.maxHr}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">ST Depression</label>
                                        <input
                                            name="stDepression"
                                            type="number"
                                            step="0.1"
                                            className="form-input"
                                            placeholder="2.0"
                                            value={formData.stDepression}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* NEW FIELDS */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            Troponin (ng/mL)
                                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                Normal: &lt; 0.04
                                            </span>
                                        </label>
                                        <input
                                            name="troponin"
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            placeholder="0.08"
                                            value={formData.troponin}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Ejection Fraction (%)
                                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                Normal: 55-70%
                                            </span>
                                        </label>
                                        <input
                                            name="ejectionFraction"
                                            type="number"
                                            step="1"
                                            className="form-input"
                                            placeholder="42"
                                            value={formData.ejectionFraction}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Serum Creatinine (mg/dL)
                                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                Normal: 0.7-1.3
                                            </span>
                                        </label>
                                        <input
                                            name="creatinine"
                                            type="number"
                                            step="0.1"
                                            className="form-input"
                                            placeholder="1.4"
                                            value={formData.creatinine}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            BMI (Body Mass Index)
                                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                Normal: 18.5-24.9
                                            </span>
                                        </label>
                                        <input
                                            name="bmi"
                                            type="number"
                                            step="0.1"
                                            className="form-input"
                                            placeholder="28.5"
                                            value={formData.bmi}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* OPTIONAL: Multi-Disease Parameters */}
                                <div style={{ marginTop: '32px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #dee2e6' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#495057' }}>
                                        📋 Optional: Additional Disease Screening
                                        <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#6c757d', marginLeft: '12px' }}>
                                            (Fill to get diabetes, kidney, liver, hypertension risks)
                                        </span>
                                    </h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {/* Diabetes Parameters */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                HbA1c (%)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Diabetes: ≥6.5%
                                                </span>
                                            </label>
                                            <input
                                                name="hba1c"
                                                type="number"
                                                step="0.1"
                                                className="form-input"
                                                placeholder="5.7"
                                                value={formData.hba1c}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Kidney Parameters */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                GFR (mL/min)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: &gt;90
                                                </span>
                                            </label>
                                            <input
                                                name="gfr"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="90"
                                                value={formData.gfr}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Protein in Urine (mg/dL)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: &lt;30
                                                </span>
                                            </label>
                                            <input
                                                name="protein_urine"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="20"
                                                value={formData.protein_urine}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Liver Parameters */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                ALT (U/L)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: 7-56
                                                </span>
                                            </label>
                                            <input
                                                name="alt"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="30"
                                                value={formData.alt}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                AST (U/L)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: 10-40
                                                </span>
                                            </label>
                                            <input
                                                name="ast"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="25"
                                                value={formData.ast}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Bilirubin (mg/dL)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: 0.1-1.2
                                                </span>
                                            </label>
                                            <input
                                                name="bilirubin"
                                                type="number"
                                                step="0.1"
                                                className="form-input"
                                                placeholder="0.8"
                                                value={formData.bilirubin}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Albumin (g/dL)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: 3.5-5.5
                                                </span>
                                            </label>
                                            <input
                                                name="albumin"
                                                type="number"
                                                step="0.1"
                                                className="form-input"
                                                placeholder="4.0"
                                                value={formData.albumin}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Platelet Count (×10³/μL)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: 150-400
                                                </span>
                                            </label>
                                            <input
                                                name="platelet_count"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="250"
                                                value={formData.platelet_count}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Hypertension Parameters */}
                                        <div className="form-group">
                                            <label className="form-label">
                                                Systolic BP (mmHg)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: &lt;120
                                                </span>
                                            </label>
                                            <input
                                                name="systolic_bp"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="120"
                                                value={formData.systolic_bp}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Diastolic BP (mmHg)
                                                <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                                                    Normal: &lt;80
                                                </span>
                                            </label>
                                            <input
                                                name="diastolic_bp"
                                                type="number"
                                                step="1"
                                                className="form-input"
                                                placeholder="80"
                                                value={formData.diastolic_bp}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Analyzing...' : 'Generate Prediction'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* CSV Upload Tab */}
                    {activeTab === 'csv' && (
                        <CSVUpload />
                    )}
                </>
            ) : (
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 className="card-title">Analysis Complete</h3>

                    {/* Risk Score Display */}
                    <div className="risk-container" style={{
                        background: result.risk_category === 'Critical' ? 'linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%)' :
                            result.risk_category === 'High' ? 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)' :
                                result.risk_category === 'Moderate' ? 'linear-gradient(135deg, #fffbf0 0%, #fff3e0 100%)' :
                                    'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                    }}>
                        <div className="risk-value" style={{
                            color: result.risk_category === 'Critical' || result.risk_category === 'High' ? '#dc3545' :
                                result.risk_category === 'Moderate' ? '#f59e0b' : '#28a745'
                        }}>
                            {result.risk_score}%
                        </div>
                        <div className="risk-status">{result.risk_category} Risk</div>
                    </div>

                    {/* Multi-Disease Risks - MOVED HERE FOR PROMINENCE */}
                    {result.multi_disease_risks && Object.keys(result.multi_disease_risks).length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#212529', textAlign: 'center' }}>
                                📊 Complete Health Risk Assessment
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {Object.entries(result.multi_disease_risks).map(([disease, data]) => (
                                    <div key={disease} style={{
                                        padding: '16px',
                                        background: data.risk_category === 'Critical' ? '#fff0f0' :
                                            data.risk_category === 'High' ? '#fff5f5' :
                                                data.risk_category === 'Moderate' ? '#fffbf0' : '#f0f9ff',
                                        borderRadius: '8px',
                                        border: `2px solid ${data.risk_category === 'Critical' ? '#dc3545' :
                                            data.risk_category === 'High' ? '#ff6b6b' :
                                                data.risk_category === 'Moderate' ? '#f59e0b' : '#28a745'
                                            }`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
                                                {disease === 'diabetes' ? '🩺 Diabetes' :
                                                    disease === 'kidney' ? '🫘 Kidney Disease' :
                                                        disease === 'liver' ? '🫀 Liver Disease' :
                                                            disease === 'hypertension' ? '💊 Hypertension' : disease}
                                            </h4>
                                            <span style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: data.risk_category === 'Critical' || data.risk_category === 'High' ? '#dc3545' :
                                                    data.risk_category === 'Moderate' ? '#f59e0b' : '#28a745'
                                            }}>
                                                {data.risk_score}%
                                            </span>
                                        </div>

                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '4px 8px',
                                            background: data.risk_category === 'Critical' || data.risk_category === 'High' ? '#dc3545' :
                                                data.risk_category === 'Moderate' ? '#f59e0b' : '#28a745',
                                            color: 'white',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            marginBottom: '12px'
                                        }}>
                                            {data.risk_category} Risk
                                        </div>

                                        {data.top_factors && data.top_factors.length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6c757d' }}>
                                                    Key Factors:
                                                </div>
                                                {data.top_factors.slice(0, 2).map((factor, idx) => (
                                                    <div key={idx} style={{ fontSize: '11px', marginBottom: '4px', color: '#495057' }}>
                                                        • {factor.name} ({factor.points} pts)
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{
                                            marginTop: '12px',
                                            paddingTop: '12px',
                                            borderTop: '1px solid #dee2e6',
                                            fontSize: '11px',
                                            lineHeight: '1.5',
                                            color: '#495057'
                                        }}>
                                            {data.recommendation && data.recommendation.substring(0, 80)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SHAP-Style Feature Importance Waterfall */}
                    {result.top_factors && result.top_factors.length > 0 && (
                        <div style={{ marginTop: '32px', padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '28px' }}>🎯</span>
                                AI Explainability: What's Driving Your Risk?
                            </h3>
                            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '24px' }}>
                                SHAP analysis shows how each factor pushes your risk score higher or lower
                            </p>

                            {/* Waterfall Chart */}
                            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '8px', padding: '20px', color: '#333' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e0e0e0' }}>
                                    <div style={{ flex: 1, fontWeight: '600', fontSize: '14px' }}>Feature</div>
                                    <div style={{ width: '120px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>Impact</div>
                                    <div style={{ width: '80px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>Points</div>
                                </div>

                                {/* Base Risk */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                                    <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>
                                        <span style={{ color: '#6c757d' }}>⚪</span> Baseline Risk
                                    </div>
                                    <div style={{ width: '120px' }}>
                                        <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '20%', background: '#6c757d', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>
                                        +10
                                    </div>
                                </div>

                                {/* Top Factors */}
                                {result.top_factors.map((factor, idx) => {
                                    const color = factor.severity === 'Critical' ? '#dc3545' :
                                        factor.severity === 'High' ? '#fd7e14' :
                                            factor.severity === 'Moderate' ? '#ffc107' : '#28a745';
                                    const percentage = (factor.points / 100) * 100;

                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '12px',
                                            padding: '12px',
                                            background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                            borderRadius: '6px',
                                            border: `2px solid ${color}20`,
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                                e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateX(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}>
                                            <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '18px' }}>
                                                    {factor.severity === 'Critical' ? '🔴' :
                                                        factor.severity === 'High' ? '🟠' :
                                                            factor.severity === 'Moderate' ? '🟡' : '🟢'}
                                                </span>
                                                {factor.name}
                                            </div>
                                            <div style={{ width: '120px', padding: '0 8px' }}>
                                                <div style={{ height: '12px', background: '#e0e0e0', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        height: '100%',
                                                        width: `${percentage}%`,
                                                        background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                                                        borderRadius: '6px',
                                                        transition: 'width 0.5s ease'
                                                    }}></div>
                                                </div>
                                            </div>
                                            <div style={{ width: '80px', textAlign: 'right', fontSize: '15px', fontWeight: '700', color }}>
                                                +{factor.points}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Final Score */}
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
                                    <div style={{ flex: 1, fontSize: '15px', fontWeight: '700' }}>
                                        <span style={{ fontSize: '20px' }}>🎯</span> Final Risk Score
                                    </div>
                                    <div style={{ width: '120px' }}>
                                        <div style={{ height: '16px', background: 'rgba(255,255,255,0.3)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                height: '100%',
                                                width: `${result.risk_score}%`,
                                                background: 'linear-gradient(90deg, #fff 0%, #f0f0f0 100%)',
                                                borderRadius: '8px'
                                            }}></div>
                                        </div>
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', fontSize: '24px', fontWeight: '900' }}>
                                        {result.risk_score}%
                                    </div>
                                </div>
                            </div>

                            {/* Interpretation Guide */}
                            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}>
                                <div style={{ fontWeight: '600', marginBottom: '8px' }}>💡 How to Read This:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', opacity: 0.9 }}>
                                    <div>• Longer bars = Stronger impact on risk</div>
                                    <div>• Red factors = Most critical to address</div>
                                    <div>• Each factor adds points to your total</div>
                                    <div>• Focus on top 3 for maximum benefit</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Contributing Factors */}
                    {result.top_factors && result.top_factors.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                                Top Contributing Factors
                            </h4>
                            {result.top_factors.map((factor, idx) => (
                                <div key={idx} style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                                        <span>{factor.name}</span>
                                        <span style={{ color: '#dc3545', fontWeight: '600' }}>
                                            +{factor.points.toFixed(1)} points
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(factor.points / 30) * 100}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #dc3545, #ff6b6b)',
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recommendation */}
                    <div className="alert mt-6" style={{
                        background: result.risk_category === 'Critical' || result.risk_category === 'High' ? '#fff5f5' :
                            result.risk_category === 'Moderate' ? '#fffbf0' : '#f0f9ff',
                        borderColor: result.risk_category === 'Critical' || result.risk_category === 'High' ? '#ffcccc' :
                            result.risk_category === 'Moderate' ? '#ffc107' : '#3399ff'
                    }}>
                        <div className="alert-header">Clinical Recommendation</div>
                        <div className="alert-body">
                            {result.recommendation}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button onClick={resetForm} className="btn btn-secondary">
                            New Assessment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientPrediction;

