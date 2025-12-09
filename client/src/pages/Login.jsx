import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, User, Lock, ArrowRight } from 'lucide-react';

import SilkShader from '../components/ui/SilkShader';
import { RainbowButton } from '../components/ui/RainbowButton';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(username, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <SilkShader />

            {/* Background Gradients - Removed in favor of SilkShader */}
            {/* <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px]" /> */}
            {/* <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" /> */}

            <div className="relative z-10 w-full max-w-md p-8 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">EventSync</h1>
                    <p className="text-gray-400">Departmental Event Manager</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <RainbowButton
                        type="submit"
                        className="w-full py-4 text-white font-bold rounded-lg shadow-lg"
                    >
                        <span className="flex items-center gap-2">
                            Sign In
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </RainbowButton>
                </form>

                {/* Optional Seed Link or Hint */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    Need an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create Student Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
