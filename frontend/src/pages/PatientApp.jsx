import React from 'react';
import { Lock, Smartphone, ChevronRight } from 'lucide-react';
import HeartHologram from '../components/dashboard/HeartHologram';

const PatientApp = () => {
    return (
        <div className="max-w-md mx-auto flex flex-col gap-6 animate-float">
            <header className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-tech text-white">My Health</h1>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--neon-cyan)] to-[var(--electric-purple)] flex items-center justify-center font-bold text-white shadow-neon">JD</div>
            </header>

            <div className="glass-panel p-6 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50"><Smartphone size={100} className="text-gray-700" /></div>
                <h2 className="text-gray-400 text-sm uppercase mb-2 tracking-wider z-10">Real-time Heart Score</h2>
                <div className="scale-[0.65] -my-14 z-10">
                    <HeartHologram score={92} />
                </div>
                <p className="text-center text-[var(--medical-teal)] font-bold text-lg mt-[-20px] z-10 shadow-neon">Excellent Condition</p>
                <p className="text-xs text-gray-500 mt-2 z-10">Updated 2m ago via Wearable</p>
            </div>

            <div className="glass-panel p-6 bg-gradient-to-br from-[var(--medical-teal)]/10 to-transparent border border-[var(--medical-teal)]/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--medical-teal)]/20 rounded-full text-[var(--medical-teal)] shadow-[0_0_15px_rgba(10,255,194,0.3)]"><Lock size={24} /></div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold">Data Control Active</h3>
                        <p className="text-xs text-gray-400 mt-1">Your detailed biomarkers never leave this device. Only encrypted updates are shared.</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-300 border-t border-white/10 pt-3">
                    <span>Consent Hash: 0x8a...99b</span>
                    <button className="text-[var(--neon-cyan)] uppercase hover:text-white">Audit</button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {['Daily Vitals Log', 'Nutrition Insights', 'Medication Reminders'].map(item => (
                    <div key={item} className="glass-panel p-4 flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors group">
                        <span className="text-gray-300 group-hover:text-white">{item}</span>
                        <ChevronRight size={16} className="text-gray-500 group-hover:text-[var(--neon-cyan)]" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientApp;
