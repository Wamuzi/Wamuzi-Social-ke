import React, { useState } from 'react';
import { userService } from '../services/userService';
import { User, AtSymbolIcon, LockClosedIcon } from './icons/Icons';

const ForgotPasswordView: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        // Simulate a backend request
        await new Promise(res => setTimeout(res, 700));
        
        // This is a more secure and realistic user experience.
        // We don't confirm if the email exists to prevent email enumeration.
        setMessage('If an account exists for this email, a password reset link has been sent.');
       
        setIsLoading(false);
    };

    return (
         <div className="bg-white p-8 rounded-xl shadow-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
            <p className="text-gray-500 mb-6">Enter your email and we'll help you recover your password.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                    <AtSymbolIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                </div>
                 {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                 <button type="submit" disabled={isLoading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-400 flex justify-center">
                     {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Recovery Link'}
                </button>
            </form>
            <p className="text-sm text-center text-gray-500 mt-6">
                Remember your password?
                <button onClick={onBackToLogin} className="font-semibold text-brand-blue hover:underline ml-1">
                    Sign In
                </button>
            </p>
        </div>
    )
};

const AuthForm: React.FC<{ isLoginView: boolean; onToggleView: () => void; onForgotPassword: () => void; }> = ({ isLoginView, onToggleView, onForgotPassword }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Simulate network delay
        await new Promise(res => setTimeout(res, 500));

        if (isLoginView) {
            const success = userService.login(email, password);
            if (!success) {
                setError('Invalid credentials. Please try again.');
            }
        } else {
            const result = userService.signUp({ name, email, password });
            if (result.error) {
                setError(result.error);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
            <p className="text-gray-500 mb-6">{isLoginView ? 'Sign in to continue to Wamuzi Social.' : 'Get started with your new social media experience.'}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                 {!isLoginView && (
                    <div className="relative">
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            required
                        />
                    </div>
                )}
                <div className="relative">
                    <AtSymbolIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        required
                    />
                </div>
                <div className="relative">
                    <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        required
                        minLength={isLoginView ? 1 : 6}
                    />
                </div>
                
                {isLoginView && (
                    <div className="text-right">
                        <button type="button" onClick={onForgotPassword} className="text-sm font-semibold text-brand-blue hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                )}


                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLoginView ? 'Sign In' : 'Sign Up')}
                </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-6">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={onToggleView} className="font-semibold text-brand-blue hover:underline ml-1">
                    {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
    );
};


const Login: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex items-center justify-center gap-2 cursor-pointer mb-4">
                    <span className="text-3xl md:text-4xl font-serif-logo font-bold text-brand-dark-blue">WAMUZI</span>
                    <span className="bg-brand-blue text-white px-3 py-1 rounded-lg text-2xl md:text-3xl font-sans font-bold">SOCIAL</span>
                </div>
                
                <div className="mt-8">
                    {view === 'forgot' ? (
                        <ForgotPasswordView onBackToLogin={() => setView('login')} />
                    ) : (
                         <AuthForm 
                            isLoginView={view === 'login'} 
                            onToggleView={() => setView(view === 'login' ? 'signup' : 'login')} 
                            onForgotPassword={() => setView('forgot')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;