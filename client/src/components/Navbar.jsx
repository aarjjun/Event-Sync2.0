import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Calendar as CalendarIcon, Sun, Moon, Menu } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 md:px-6 py-4 transition-colors duration-200 sticky top-0 z-40">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">EventSync</h1>
                        <p className="text-xs text-blue-500 font-medium uppercase tracking-wider hidden sm:block">{user?.role} {user?.community && `• ${user.community}`}</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:shadow-md"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-[var(--text-secondary)]"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="mt-4 pb-2 md:hidden space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="px-1">
                        <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-2">{user?.role} {user?.community && `• ${user.community}`}</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    >
                        <span>Appearance</span>
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
