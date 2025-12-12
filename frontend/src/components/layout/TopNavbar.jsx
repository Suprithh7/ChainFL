import React from 'react';
import { NavLink } from 'react-router-dom';

const TopNavbar = () => {
    return (
        <div className="top-navbar">
            <div className="nav-container">
                <div className="nav-brand">
                    <div className="nav-brand-icon">⚕</div>
                    <span>ChainFL Care</span>
                </div>

                <nav className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/prediction" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Risk Prediction
                    </NavLink>
                    <NavLink to="/records" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Patient Records
                    </NavLink>
                    <NavLink to="/consent" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Consent
                    </NavLink>
                    <NavLink to="/nodes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Node Registry
                    </NavLink>
                    <NavLink to="/fl-simulation" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        FL Training
                    </NavLink>
                    <NavLink to="/monitor" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        System Monitor
                    </NavLink>
                </nav>
            </div>
        </div>
    );
};

export default TopNavbar;
