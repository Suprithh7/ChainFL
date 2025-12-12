import React, { useState } from 'react';
import { Box, CheckCircle, Hash, Clock, ShieldCheck } from 'lucide-react';
import './BlockChain.css';

const BlockChain = () => {
    const [selectedBlock, setSelectedBlock] = useState(428); // Select latest by default
    const blocks = [
        { id: 428, hash: "0x3f...8a91", time: "10:05:22", nodes: 12, valid: true, consent: "Verified" },
        { id: 427, hash: "0x1a...4b2c", time: "10:04:15", nodes: 12, valid: true, consent: "Verified" },
        { id: 426, hash: "0x9c...3d1e", time: "10:03:08", nodes: 11, valid: true, consent: "Verified" },
        { id: 425, hash: "0x7b...2e4f", time: "10:02:01", nodes: 12, valid: true, consent: "Verified" },
    ];

    const selectedData = blocks.find(b => b.id === selectedBlock);

    return (
        <div className="blockchain-container">
            <div className="chain-scroll no-scrollbar">
                {blocks.map((block, index) => (
                    <div
                        key={block.id}
                        className={`block-card ${selectedBlock === block.id ? 'selected' : ''}`}
                        onClick={() => setSelectedBlock(block.id)}
                        style={{ '--delay': `${index * 0.1}s` }}
                    >
                        <div className="block-header">
                            <Box size={24} className="text-[var(--neon-cyan)] block-icon" />
                            <span className="block-id">#{block.id}</span>
                        </div>
                        <div className="block-hash">{block.hash}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={12} /> {block.time}
                        </div>
                        {block.valid && <CheckCircle size={16} className="text-green-400 absolute bottom-4 right-4 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />}

                        <div className="connector-line"></div>
                    </div>
                ))}
            </div>

            {/* Expanded Details Panel */}
            {selectedData && (
                <div className="details-panel glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border border-[var(--electric-purple)]/30">
                    <div>
                        <h3 className="text-white font-tech text-xl mb-6 flex items-center gap-3">
                            <ShieldCheck className="text-[var(--electric-purple)]" />
                            Block #{selectedData.id} Verification
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Block Hash</span>
                                <span className="font-mono text-[var(--neon-cyan)]">{selectedData.hash}88273...</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Timestamp</span>
                                <span className="font-mono text-white">{selectedData.time} UTC</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Contributing Nodes</span>
                                <span className="font-mono text-white">{selectedData.nodes}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-gray-400">Proof of Training</span>
                                <span className="font-mono text-green-400">VALIDATED</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-gray-300 overflow-hidden relative">
                        <div className="absolute top-0 right-0 bg-[var(--electric-purple)] text-white px-2 py-1 text-[10px] uppercase font-bold">Immutable Ledger</div>
                        <pre className="mt-4">
                            {`{
  "blockId": ${selectedData.id},
  "prevHash": "0x8f2...1b3",
  "root": "0x99a...77c",
  "transactions": [
    { "type": "MODEL_UPDATE", "node": "Hospital_A", "param_hash": "0x..." },
    { "type": "CONSENT_LOG", "patient": "ANON_832", "action": "GRANT" }
  ],
  "signature": "3045022100..."
}`}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockChain;
