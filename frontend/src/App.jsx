import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Temporary Placeholder Component for testing routes
const PlaceholderPage = ({ title }) => (
    <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-gray-500 mt-2">This module is currently under construction.</p>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes - We will build these next */}
                <Route path="/login" element={<PlaceholderPage title="Login / Register" />} />

                {/* Protected Application Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PlaceholderPage title="Dashboard overview" />} />
                        <Route path="/documents" element={<PlaceholderPage title="My Documents" />} />
                        <Route path="/rooms" element={<PlaceholderPage title="Study Rooms" />} />
                        <Route path="/analytics" element={<PlaceholderPage title="Performance Analytics" />} />
                        <Route path="/settings" element={<PlaceholderPage title="Account Settings" />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;