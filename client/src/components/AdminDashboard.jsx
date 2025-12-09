import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Users, Shield, Award, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    // const token = localStorage.getItem('token'); // This variable is no longer needed as token is fetched directly

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/users`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to promote/demote this user to ${newRole}?`)) return;
        try {
            await axios.put(`${API_URL}/auth/users/${userId}/role`,
                { role: newRole },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            fetchUsers();
        } catch (err) {
            console.error('Update Role Error:', err);
            console.log('Error Details:', err.response?.data);
            alert(`Failed to update role: ${err.response?.data?.msg || err.message}`);
        }
    };

    if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading users...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Admin Control Panel
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage user roles and permissions</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Community</th>
                            <th className="px-6 py-4">Current Role</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 dark:text-gray-200 font-medium">{u.username}</td>
                                <td className="px-6 py-4 dark:text-gray-300">{u.community || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                            u.role === 'hod' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                u.role === 'rep' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    {u.role !== 'admin' && (
                                        <>
                                            {u.role !== 'hod' && (
                                                <button onClick={() => handleRoleChange(u._id, 'hod')}
                                                    className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 text-xs font-semibold">
                                                    Make HOD
                                                </button>
                                            )}
                                            {u.role !== 'rep' && (
                                                <button onClick={() => handleRoleChange(u._id, 'rep')}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 text-xs font-semibold">
                                                    Make Rep
                                                </button>
                                            )}
                                            {u.role !== 'student' && (
                                                <button onClick={() => handleRoleChange(u._id, 'student')}
                                                    className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded border border-gray-200 text-xs font-semibold">
                                                    Demote Student
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
