import React from 'react';
import BlockChain from '../components/blockchain/BlockChain';

const BlockchainExplorer = () => {
    return (
        <div className="flex flex-col gap-8 animate-float" style={{ animationDuration: '14s' }}>
            <header>
                <h1 className="text-3xl font-tech text-white mb-2">Immutable Audit Trail</h1>
                <p className="text-gray-400">Ledger Status: <span className="text-green-400 font-bold shadow-neon">Synced & Verified</span></p>
            </header>

            <div className="glass-panel p-2 min-h-[600px] flex items-center justify-center bg-gradient-to-b from-[var(--glass-bg)] to-transparent">
                <div className="w-full">
                    <BlockChain />
                </div>
            </div>
        </div>
    );
};

export default BlockchainExplorer;
