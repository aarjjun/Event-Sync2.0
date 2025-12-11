import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Calendar, PlusCircle, Settings, X, Lock, Sun, Moon, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';


export default function Navbar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '' });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/auth/change-password`, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            alert('Password changed successfully');
            setShowPasswordModal(false);
            setPasswords({ current: '', new: '' });
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to change password');
        }
    };

    // If on login/register page, don't show navbar
    if (['/login', '/register'].includes(location.pathname)) return null;

    return (
        <>
            <div className="sticky top-4 z-50 px-4 flex justify-center w-full">
                <nav className={cn(
                    "w-full max-w-5xl rounded-2xl transition-all duration-300 ease-in-out border",
                    scrolled
                        ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-gray-200 dark:border-white/10 py-3"
                        : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-transparent py-4"
                )}>
                    <div className="px-6 flex justify-between items-center">
                        {/* Logo Section */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                <img src="/logo.png" alt="EventSync Logo" className="w-6 h-6 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">EventSync</h1>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hidden sm:block">Departmental Manager</span>
                            </div>
                        </Link>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Welcome back, {user?.name || user?.username}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                    {user?.community ? `${user.community} (${user.role})` : user?.role}
                                </span>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />

                            <button onClick={() => setShowPasswordModal(true)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                                title="Profile Settings">
                                <Settings className="w-4 h-4" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all font-medium text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden pt-4 pb-2 px-6 border-t border-slate-200 dark:border-slate-800 mt-4 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4">
                                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                                    <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{user?.username}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium"
                                >
                                    <span>Appearance</span>
                                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                </button>

                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium"
                                >
                                    <span>Profile Settings</span>
                                    <Settings className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            {/* Profile Settings Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white">Profile Settings</h3>
                            <button onClick={() => setShowPasswordModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Update Name */}
                            <div className="space-y-2 border-b border-gray-100 dark:border-slate-700 pb-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Info</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        defaultValue={user?.name || user?.username}
                                        id="profileNameInput"
                                        className="flex-1 p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm"
                                        placeholder="Your Full Name"
                                    />
                                    <button
                                        onClick={async () => {
                                            const newName = document.getElementById('profileNameInput').value;
                                            try {
                                                const res = await axios.put(`${API_URL}/auth/profile`, { name: newName }, {
                                                    headers: { 'x-auth-token': localStorage.getItem('token') }
                                                });
                                                alert('Name updated! Please re-login to see changes everywhere.');
                                                // Ideally update context here, but re-login is safer/easier for now
                                            } catch (err) {
                                                alert(err.response?.data?.msg || 'Failed to update name');
                                            }
                                        }}
                                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Change Password */}
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Security</h4>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                                    <input type="password" required value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Password (Min 6 chars)</label>
                                    <input type="password" required value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                                </div>
                                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
