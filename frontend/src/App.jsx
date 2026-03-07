import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VoiceCopilot from './pages/VoiceCopilot';
import OrderHistory from './pages/OrderHistory';
import CallCopilot from './pages/CallCopilot';
import Sidebar from './components/Sidebar';
import CustomCursor from './components/CustomCursor';
import './index.css';

function App() {
    const [theme, setTheme] = React.useState('dark');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <BrowserRouter>
            <CustomCursor />
            <div className="app-layout">
                <Sidebar theme={theme} toggleTheme={toggleTheme} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/orders" element={<OrderHistory />} />
                        <Route path="/voice" element={<VoiceCopilot />} />
                        <Route path="/call" element={<CallCopilot />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
