import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Documents from "./pages/documents/Documents";
import StudyWorkspace from "./pages/study/StudyWorkspace";
import Rooms from "./pages/rooms/Rooms";
import ActiveRoom from "./pages/rooms/ActiveRoom";

// Temporary Placeholder Component for testing routes
const PlaceholderPage = ({ title }) => (
  <div className="animate-fade-in">
    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
    <p className="text-gray-500 mt-2">
      This module is currently under construction.
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/study/:documentId" element={<StudyWorkspace />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:roomCode" element={<ActiveRoom />} />
            <Route
              path="/analytics"
              element={<PlaceholderPage title="Performance Analytics" />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Account Settings" />}
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
