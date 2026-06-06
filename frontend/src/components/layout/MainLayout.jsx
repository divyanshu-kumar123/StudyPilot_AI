import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { 
    LayoutDashboard, 
    Files, 
    Users, 
    LineChart, 
    Settings, 
    LogOut, 
    Search, 
    Bell,
    BrainCircuit
} from 'lucide-react';

const MainLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Documents', path: '/documents', icon: Files },
        { name: 'Study Rooms', path: '/rooms', icon: Users },
        { name: 'Analytics', path: '/analytics', icon: LineChart },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Fixed Sidebar */}
            <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col justify-between hidden md:flex">
                <div>
                    {/* Brand Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200">
                        <BrainCircuit className="h-8 w-8 text-primary-600 mr-3" />
                        <span className="text-xl font-bold text-gray-900 tracking-tight">StudyPilot<span className="text-primary-600">AI</span></span>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-xl transition-colors ${
                                        isActive 
                                        ? 'bg-primary-50 text-primary-700 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <motion.div 
                                        className="flex items-center w-full"
                                        whileHover={{ x: 4 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </motion.div>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* User Profile Mini & Logout */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="ml-3 flex flex-col">
                                <span className="text-sm font-medium text-gray-900 truncate w-24">{user?.fullName || 'User'}</span>
                                <span className="text-xs text-gray-500">Pro Plan</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-surface border-b border-gray-200 flex items-center justify-between px-8 z-10">
                    <div className="flex-1 flex items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search documents, quizzes, or rooms..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-surface"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content Outlet */}
                <main className="flex-1 overflow-y-auto p-8 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;