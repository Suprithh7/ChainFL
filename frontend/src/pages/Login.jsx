import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple auth check (in real app, validate with backend)
        if (email && password) {
            onLogin();
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{
                background: 'white',
                padding: '48px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '420px',
                animation: 'scaleIn 0.6s ease-out'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#0066cc',
                        borderRadius: '12px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        margin: '0 auto 16px'
                    }}>⚕</div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '8px'
                    }}>ChainFL Care</h1>
                    <p style={{ fontSize: '14px', color: '#6c757d' }}>Healthcare AI Platform</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="doctor@hospital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
                    >
                        Sign In
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '13px',
                    color: '#6c757d'
                }}>
                    <p>Protected by enterprise-grade security</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
