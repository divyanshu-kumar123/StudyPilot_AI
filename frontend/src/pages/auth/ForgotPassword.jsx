import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Mocking an API call to a password reset endpoint
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            <div className="max-w-md w-full bg-surface p-10 rounded-2xl shadow-xl z-10 border border-gray-100">
                {!isSubmitted ? (
                    <>
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                                <BrainCircuit className="h-8 w-8 text-primary-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-colors bg-gray-50"
                                    placeholder="Email address"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70"
                            >
                                {isLoading ? <Loader size="sm" className="text-white" /> : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-6 py-4">
                        <div className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
                        <p className="text-sm text-gray-500">
                            We've sent password reset instructions to <br/><span className="font-medium text-gray-900">{email}</span>
                        </p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center">
                    <Link to="/login" className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;