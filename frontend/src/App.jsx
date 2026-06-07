import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, logout, setAuthLoading } from './features/auth/authSlice';
import { authService } from './services/auth.service';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Documents from './pages/documents/Documents';
import StudyWorkspace from './pages/study/StudyWorkspace';
import Rooms from './pages/rooms/Rooms';
import ActiveRoom from './pages/rooms/ActiveRoom';
import Analytics from './pages/analytics/Analytics';
import Settings from './pages/settings/Settings';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import GlobalFlashcards from './pages/library/GlobalFlashcards';
import GlobalQuizzes from './pages/library/GlobalQuizzes';
import GlobalNotes from './pages/library/GlobalNotes';

function App() {
    const dispatch = useDispatch();

    // Application Boot Sequence
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Silently grab a fresh access token using the HTTP-only cookie
                const accessToken = await authService.verifySession();
                if (accessToken) {
                    dispatch(setCredentials({ accessToken }));
                } else {
                    dispatch(logout());
                }
            } catch (error) {
                // If it fails (cookie expired or missing), log them out cleanly
                dispatch(logout());
            } finally {
                dispatch(setAuthLoading(false));
            }
        };

        initAuth();
    }, [dispatch]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Dashboard />} /> 
                        <Route path="/documents" element={<Documents />} /> 
                        <Route path="/study/:documentId" element={<StudyWorkspace />} /> 
                        <Route path="/rooms" element={<Rooms />} />
                        <Route path="/library/flashcards" element={<GlobalFlashcards />} />
                        <Route path="/library/quizzes" element={<GlobalQuizzes />} />
                        <Route path="/library/notes" element={<GlobalNotes />} />
                        <Route path="/rooms/:roomCode" element={<ActiveRoom />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;