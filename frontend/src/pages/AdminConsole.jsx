import React from 'react';
import { MoreHorizontal, ShieldAlert, CheckCircle } from 'lucide-react';

const AdminConsole = () => {
    const nodes = [
        { id: "NODE_01", loc: "St. Mary's Hospital", status: "Active", trust: 98, ping: "12ms" },
        { id: "NODE_02", loc: "City Heart Center", status: "Training", trust: 99, ping: "45ms" },
        { id: "NODE_03", loc: "Uni Research Lab", status: "Verifying", trust: 95, ping: "22ms" },
        { id: "NODE_04", loc: "Regional Clinic", status: "Idle", trust: 92, ping: "110ms" },
        { id: "NODE_05", loc: "Unknown Device", status: "Flagged", trust: 12, ping: "---" },
    ];

    return (
        <div className="flex flex-col gap-6 animate-float" style={{ animationDuration: '10s' }}>
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-tech text-white">System Administration</h1>
                <button className="px-4 py-2 bg-[var(--electric-purple)] text-white rounded hover:bg-purple-600 transition-colors text-sm uppercase font-bold tracking-wider shadow-neon">
                    + Provision Node
                </button>
            </header>

            <div className="glass-panel p-0 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-500 text-xs uppercase tracking-wider bg-black/20">
                            <th className="p-6 font-medium">Node ID</th>
                            <th className="p-6 font-medium">Location</th>
                            <th className="p-6 font-medium">Status</th>
                            <th className="p-6 font-medium">Trust Score</th>
                            <th className="p-6 font-medium">Last Ping</th>
                            <th className="p-6 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-300 divide-y divide-gray-800">
                        {nodes.map(node => (
                            <tr key={node.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6 font-mono text-[var(--neon-cyan)]">{node.id}</td>
                                <td className="p-6 font-medium text-white">{node.loc}</td>
                                <td className="p-6">
                                    <span className={`px-2 py-1 rounded text-xs uppercase border ${node.status === 'Flagged' ? 'border-red-500 text-red-500 bg-red-500/10' :
                                            node.status === 'Active' ? 'border-green-500 text-green-500 bg-green-500/10' :
                                                node.status === 'Training' ? 'border-blue-500 text-blue-500 bg-blue-500/10' :
                                                    'border-gray-500 text-gray-400'
                                        }`}>
                                        {node.status}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${node.trust < 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                style={{ width: `${node.trust}%` }}
                                            />
                                        </div>
                                        <span className="text-xs">{node.trust}%</span>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-xs">{node.ping}</td>
                                <td className="p-6 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminConsole;
