import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, TrendingUp, TrendingDown, BookOpen, Clock, Target, Award } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';
import Loader from '../../components/common/Loader';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const dashboardData = await analyticsService.getDashboard();
                setData(dashboardData.analytics);
            } catch (err) {
                console.error('Failed to fetch detailed analytics', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return <Loader fullScreen text="Compiling your performance metrics..." />;

    // Fallback data if user hasn't generated enough stats yet
    const analytics = data || {};
    const strongestTopics = analytics.strongestTopics?.length > 0 ? analytics.strongestTopics : ['React Fundamentals', 'Database Normalization'];
    const weakestTopics = analytics.weakestTopics?.length > 0 ? analytics.weakestTopics : ['Advanced CSS', 'System Design'];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Analytics</h1>
                <p className="text-gray-500 mt-1">Deep dive into your learning patterns and mastery levels.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Strengths & Weaknesses */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Strengths */}
                    <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp className="h-6 w-6" /></div>
                            <h2 className="text-lg font-bold text-gray-900">Strongest Topics</h2>
                        </div>
                        <div className="space-y-4">
                            {strongestTopics.map((topic, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{topic}</span>
                                        <span className="text-green-600 font-bold">{90 - (i * 5)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${90 - (i * 5)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><TrendingDown className="h-6 w-6" /></div>
                            <h2 className="text-lg font-bold text-gray-900">Needs Focus</h2>
                        </div>
                        <div className="space-y-4">
                            {weakestTopics.map((topic, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{topic}</span>
                                        <span className="text-red-500 font-bold">{45 + (i * 8)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-red-400 h-2 rounded-full" style={{ width: `${45 + (i * 8)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Detailed Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{Math.round(analytics.averageQuizScore || 0)}%</h3>
                            </div>
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl"><Target className="h-6 w-6" /></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 flex items-center">
                            <span className="text-green-500 font-medium flex items-center mr-2"><TrendingUp className="h-4 w-4 mr-1" /> +2.4%</span> vs last week
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Study Time</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 mt-2">{analytics.totalStudyHours || 0}<span className="text-xl text-gray-400 font-medium ml-1">hrs</span></h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock className="h-6 w-6" /></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Across {analytics.totalDocumentsProcessed || 0} documents</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="sm:col-span-2 bg-surface p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
                        <Award className="h-16 w-16 text-yellow-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Consistency Scholar</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            You are on a <span className="font-bold text-primary-600">{analytics.streakCount || 0} day streak!</span> Keep reviewing flashcards and taking quizzes to maintain your momentum.
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;