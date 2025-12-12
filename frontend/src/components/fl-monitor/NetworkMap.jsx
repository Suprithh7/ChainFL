import React from 'react';
import { Server, Building2 } from 'lucide-react';
import './NetworkMap.css';

const NetworkMap = () => {
    // Nodes data
    const nodes = [
        { id: 1, x: 20, y: 20, label: "St. Mary's Hospital", status: "Uploading..." },
        { id: 2, x: 80, y: 30, label: "City Heart Center", status: "Training (Ep 4)" },
        { id: 3, x: 25, y: 80, label: "Uni Research Lab", status: "Verifying" },
        { id: 4, x: 75, y: 75, label: "Regional Clinic", status: "Idle" }
    ];

    return (
        <div className="network-container glass-panel">
            <svg className="network-svg">
                <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--electric-purple)" stopOpacity="0" />
                        <stop offset="50%" stopColor="var(--electric-purple)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--electric-purple)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {nodes.map(node => (
                    <line
                        key={node.id}
                        x1={`${node.x}%`} y1={`${node.y}%`}
                        x2="50%" y2="50%"
                        stroke="url(#gradient-line)"
                        className="network-line"
                    />
                ))}
            </svg>

            <div className="center-node">
                <div className="node-glow"></div>
                <Server size={32} className="text-white relative z-10" />
                <span className="node-label">Global Model</span>
            </div>

            {nodes.map(node => (
                <div key={node.id} className="satellite-node" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                    <div className="hospital-icon">
                        <Building2 size={24} />
                    </div>
                    <div className="node-info">
                        <span className="node-name">{node.label}</span>
                        <span className="node-status text-[var(--neon-cyan)]">{node.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NetworkMap;
