import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Users, Shield, Award, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function HODDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [promoteCommunity, setPromoteCommunity] = useState('');

    const fetchUsers = async () => {
        try {
            // Reusing admin endpoint for now as HOD needs similar view
            // In a real app we might want a specific /hod/users endpoint
            const res = await axios.get(`${API_URL}/auth/users`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            // Filter to only show Students, Reps, and Teachers (HOD manages these)
            const managedUsers = res.data.filter(u => u.role === 'student' || u.role === 'rep' || u.role === 'teacher');
            setUsers(managedUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePromoteClick = (user) => {
        setSelectedUser(user);
        setPromoteCommunity(''); // Reset
        setShowPromoteModal(true);
    };

    const handlePromoteConfirm = async () => {
        if (!promoteCommunity) {
            alert("Please specify a community for the Rep.");
            return;
        }
        try {
            await axios.put(`${API_URL}/auth/users/${selectedUser._id}/role`,
                { role: 'rep', community: promoteCommunity },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            setShowPromoteModal(false);
            fetchUsers();
        } catch (err) {
            console.error('Promote Error:', err);
            alert('Failed to promote user');
        }
    };

    const handleDemoteClick = async (user) => {
        if (!confirm(`Are you sure you want to demote ${user.username} to Student?`)) return;
        try {
            await axios.put(`${API_URL}/auth/users/${user._id}/role`,
                { role: 'student', community: null },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            fetchUsers();
        } catch (err) {
            console.error('Demote Error:', err);
            alert('Failed to demote user');
        }
    };

    if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading users...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                    <Shield className="w-6 h-6 text-red-600" />
                    HOD Management Panel
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Community Representatives and Teachers</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Current Role</th>
                            <th className="px-6 py-4">Community</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 dark:text-gray-200 font-medium">{u.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${u.role === 'rep' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 dark:text-gray-300">{u.community || '-'}</td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    {u.role === 'student' && (
                                        <>
                                            <button onClick={() => handlePromoteClick(u)}
                                                className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 text-xs font-semibold transition-colors">
                                                <ArrowUpCircle className="w-3 h-3" /> Make Rep
                                            </button>
                                            <button onClick={() => {
                                                if (confirm(`Promote ${u.username} to Teacher?`)) {
                                                    axios.put(`${API_URL}/auth/users/${u._id}/role`,
                                                        { role: 'teacher' },
                                                        { headers: { 'x-auth-token': localStorage.getItem('token') } }
                                                    ).then(() => fetchUsers());
                                                }
                                            }}
                                                className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded border border-yellow-200 text-xs font-semibold transition-colors">
                                                <ArrowUpCircle className="w-3 h-3" /> Make Teacher
                                            </button>
                                        </>
                                    )}
                                    {u.role === 'rep' && (
                                        <button onClick={() => handleDemoteClick(u)}
                                            className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded border border-gray-200 text-xs font-semibold transition-colors">
                                            <ArrowDownCircle className="w-3 h-3" /> Demote
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Promote Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Promote to Representative</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                            Select the community for <strong>{selectedUser?.username}</strong>:
                        </p>
                        <input
                            type="text"
                            placeholder="e.g. Technical, Cultural, Sports"
                            value={promoteCommunity}
                            onChange={(e) => setPromoteCommunity(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg mb-6 bg-gray-50/50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPromoteModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors dark:text-gray-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePromoteConfirm}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all"
                            >
                                Confirm Promotion
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
