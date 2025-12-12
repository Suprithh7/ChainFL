import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex bg-[var(--bg-primary)]">
            <Sidebar />
            <main className="main-content flex-1 ml-64 p-8 transition-colors duration-300">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">ChainFL Care</h2>
                        <p className="text-sm text-[var(--text-secondary)]">Enterprise Health AI</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-xs font-medium px-3 py-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-color)] text-[var(--text-secondary)]">
                            v2.0 Pro
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </header>

                <div className="page-container p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
