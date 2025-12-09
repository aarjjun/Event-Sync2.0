import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Calendar as CalendarIcon, Sun, Moon, Menu, X, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
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
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.username || 'User'}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role} {user?.community && `• ${user.community}`}</span>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={logout}
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
                                onClick={logout}
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
    );
}
