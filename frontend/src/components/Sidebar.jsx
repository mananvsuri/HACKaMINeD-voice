import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Mic, PhoneCall, Settings, Sun, Moon } from 'lucide-react';

export default function Sidebar({ theme, toggleTheme }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="brand">SpicePilot<span>AI</span></h2>
            </div>

            <nav className="nav-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <History size={20} />
                    <span>Order History</span>
                </NavLink>

                <NavLink to="/voice" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Mic size={20} />
                    <span>Walk-In Copilot</span>
                </NavLink>

                <NavLink to="/call" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <PhoneCall size={20} />
                    <span>Simulate Call</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="nav-item" onClick={toggleTheme} style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </div>
            </div>
        </aside>
    );
}
