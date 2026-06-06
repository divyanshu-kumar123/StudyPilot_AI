import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Documents from "./pages/documents/Documents";
import StudyWorkspace from "./pages/study/StudyWorkspace";
import Rooms from "./pages/rooms/Rooms";
import ActiveRoom from "./pages/rooms/ActiveRoom";
import Analytics from "./pages/analytics/Analytics";
import Settings from "./pages/settings/Settings";

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
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
