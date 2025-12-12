import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="logo">ChainFL Care</div>

            <nav>
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    Dashboard
                </NavLink>
                <NavLink to="/prediction" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    Prediction
                </NavLink>
                <NavLink to="/records" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    Records
                </NavLink>
                <NavLink to="/fl-simulation" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    FL Training
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    Analytics
                </NavLink>
                <NavLink to="/metrics" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    Metrics
                </NavLink>
                <NavLink to="/monitor" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    Monitor
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
