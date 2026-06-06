import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, Check } from 'lucide-react';
import Loader from '../../components/common/Loader';

const Settings = () => {
    const { user } = useSelector((state) => state.auth);
    
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Form State (Pre-filled with Redux User Data)
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        learningLevel: user?.learningLevel || 'Professional',
        timezone: user?.timezone || 'UTC'
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call for saving settings
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 1200);
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
                <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
            </div>

            <div className="bg-surface rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Left Sidebar Tabs */}
                <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white shadow-sm border border-gray-200 text-primary-600' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                                
                                {/* Avatar Upload Mock */}
                                <div className="flex items-center space-x-6 mb-8">
                                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold border-4 border-white shadow-md">
                                        {formData.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                        Change Avatar
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input 
                                            type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input 
                                            type="email" name="email" value={formData.email} disabled
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Level</label>
                                            <select 
                                                name="learningLevel" value={formData.learningLevel} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            >
                                                <option value="High School">High School</option>
                                                <option value="Undergraduate">Undergraduate</option>
                                                <option value="Graduate">Graduate</option>
                                                <option value="Professional">Professional</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                            <input 
                                                type="text" name="timezone" value={formData.timezone} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-70"
                                    >
                                        {isSaving ? <Loader size="sm" className="text-white mr-2" /> : 
                                         isSaved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab !== 'profile' && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                                <Shield className="h-12 w-12 text-gray-300" />
                                <h3 className="text-lg font-bold text-gray-900">Advanced Settings</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Security and Notification preferences are currently managed via the Global Admin portal in this preview.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;