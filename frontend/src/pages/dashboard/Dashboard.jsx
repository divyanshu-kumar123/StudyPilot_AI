import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileText, Target, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const dashboardData = await analyticsService.getDashboard();
                setData(dashboardData);
            } catch (err) {
                setError('Failed to load dashboard data. Please refresh.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) return <Loader fullScreen text="Loading your study space..." />;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    const { analytics, recentProgress } = data;

    // Framer Motion animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
        <motion.div variants={itemVariants} className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-4 rounded-xl ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div 
            className="max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Welcome back, {user?.fullName?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Ready to master something new today?</p>
                </div>
                <Link to="/documents" className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                    Upload New Document
                </Link>
            </motion.div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Documents Analyzed" 
                    value={analytics?.totalDocumentsProcessed || 0} 
                    icon={FileText} 
                    colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard 
                    title="Quizzes Completed" 
                    value={analytics?.totalQuizzesCompleted || 0} 
                    icon={Target} 
                    colorClass="bg-green-50 text-green-600"
                />
                <StatCard 
                    title="Average Score" 
                    value={`${Math.round(analytics?.averageQuizScore || 0)}%`} 
                    icon={Award} 
                    colorClass="bg-purple-50 text-purple-600"
                />
                <StatCard 
                    title="Current Streak" 
                    value={`${analytics?.streakCount || 0} Days`} 
                    subtitle="Keep it up!"
                    icon={Clock} 
                    colorClass="bg-orange-50 text-orange-600"
                />
            </div>

            {/* Recent Progress Section */}
            <motion.div variants={itemVariants} className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Study Sessions</h2>
                    <Link to="/documents" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                        View all <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>
                
                {recentProgress?.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">No documents yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Upload your first PDF to start generating AI study materials.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentProgress.map((progress) => (
                            <div key={progress._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {progress.documentId?.title || 'Untitled Document'}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Last accessed {new Date(progress.lastAccessedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-gray-900">{progress.completionPercentage}% Mastered</p>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                            <div 
                                                className="h-full bg-primary-500 rounded-full" 
                                                style={{ width: `${progress.completionPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Link 
                                        to={`/study/${progress.documentId?._id}`}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;