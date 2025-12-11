import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Users, Shield, Award, UserCheck, Plus, Search, X } from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form States
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'student', community: '' });
    const [promoteCommunity, setPromoteCommunity] = useState('');

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

    // Filter Users
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.community && u.community.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Create User Handler
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/register-custom`, newUser, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setShowCreateModal(false);
            setNewUser({ username: '', password: '', role: 'student', community: '' });
            fetchUsers();
            alert('User created successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to create user');
        }
    };

    // Role Change Handler
    const initiateRoleChange = (user, newRole) => {
        if (newRole === 'rep') {
            setSelectedUser(user);
            setPromoteCommunity('');
            setShowPromoteModal(true);
        } else {
            handleRoleChange(user._id, newRole); // Direct update for non-rep roles
        }
    };

    const handleRoleChange = async (userId, newRole, community = null) => {
        if (!confirm(`Are you sure you want to promote/demote this user to ${newRole}?`)) return;
        try {
            const payload = { role: newRole };
            if (community) payload.community = community;

            await axios.put(`${API_URL}/auth/users/${userId}/role`,
                payload,
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );
            fetchUsers();
        } catch (err) {
            console.error('Update Role Error:', err);
            alert(`Failed to update role: ${err.response?.data?.msg || err.message}`);
        }
    };

    const confirmRepPromotion = async () => {
        if (!promoteCommunity) return alert("Community is required for Reps");
        await handleRoleChange(selectedUser._id, 'rep', promoteCommunity);
        setShowPromoteModal(false);
    };

    if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading users...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                        <Shield className="w-6 h-6 text-purple-600" />
                        Admin Control Panel
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage users, roles, and permissions</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none w-full dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-500/25"
                    >
                        <Plus className="w-4 h-4" /> Create User
                    </button>
                </div>
            </div>

            {/* Table */}
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
                        {filteredUsers.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 dark:text-gray-200 font-medium">
                                    <div className="flex flex-col">
                                        <span>{u.username}</span>
                                        {u.name && u.name !== u.username && <span className="text-xs text-gray-400">{u.name}</span>}
                                    </div>
                                </td>
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
                                <td className="px-6 py-4 flex justify-center gap-2 flex-wrap">
                                    {u.role !== 'admin' && (
                                        <>
                                            {u.role !== 'hod' && (
                                                <button onClick={() => initiateRoleChange(u, 'hod')}
                                                    className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 text-xs font-semibold dark:bg-transparent dark:border-red-500/50 dark:text-red-400">
                                                    Make HOD
                                                </button>
                                            )}
                                            {u.role !== 'rep' && (
                                                <button onClick={() => initiateRoleChange(u, 'rep')}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 text-xs font-semibold dark:bg-transparent dark:border-blue-500/50 dark:text-blue-400">
                                                    Make Rep
                                                </button>
                                            )}
                                            {u.role !== 'teacher' && (
                                                <button onClick={() => initiateRoleChange(u, 'teacher')}
                                                    className="px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded border border-yellow-200 text-xs font-semibold dark:bg-transparent dark:border-yellow-500/50 dark:text-yellow-400">
                                                    Make Teacher
                                                </button>
                                            )}
                                            {u.role !== 'student' && (
                                                <button onClick={() => initiateRoleChange(u, 'student')}
                                                    className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded border border-gray-200 text-xs font-semibold dark:bg-transparent dark:border-gray-500/50 dark:text-gray-400">
                                                    Demote Student
                                                </button>
                                            )}
                                            <button onClick={() => {
                                                const newPass = prompt(`Enter new password for ${u.username}:`);
                                                if (newPass) {
                                                    axios.put(`${API_URL}/auth/users/${u._id}/reset-password`,
                                                        { newPassword: newPass },
                                                        { headers: { 'x-auth-token': localStorage.getItem('token') } }
                                                    )
                                                        .then(() => alert("Password reset successfully"))
                                                        .catch(err => alert(err.response?.data?.msg || "Failed to reset password"));
                                                }
                                            }}
                                                className="px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 text-xs font-semibold dark:bg-transparent dark:border-slate-500/50 dark:text-slate-400">
                                                Reset Password
                                            </button>
                                            <button onClick={async () => {
                                                const newName = prompt(`Enter NEW NAME for ${u.username} (Current: ${u.name || 'N/A'}):`, u.name);
                                                if (newName) {
                                                    try {
                                                        await axios.put(`${API_URL}/auth/users/${u._id}/profile-admin`,
                                                            { name: newName },
                                                            { headers: { 'x-auth-token': localStorage.getItem('token') } }
                                                        );
                                                        fetchUsers();
                                                        alert("Name updated successfully");
                                                    } catch (err) {
                                                        alert(err.response?.data?.msg || "Failed to update name");
                                                    }
                                                }
                                            }}
                                                className="px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded border border-purple-200 text-xs font-semibold dark:bg-transparent dark:border-purple-500/50 dark:text-purple-400">
                                                Rename
                                            </button>
                                        </>
                                    )}
                                    {/* Delete Button - Only Admin sees this, but we are in AdminDashboard so yes */}
                                    {/* Prevent deleting self */}
                                    {u._id !== JSON.parse(atob(localStorage.getItem('token').split('.')[1])).user.id && (
                                        <button onClick={async () => {
                                            if (confirm(`Are you sure you want to PERMANENTLY DELETE user ${u.username}? This cannot be undone.`)) {
                                                try {
                                                    await axios.delete(`${API_URL}/auth/users/${u._id}`, {
                                                        headers: { 'x-auth-token': localStorage.getItem('token') }
                                                    });
                                                    fetchUsers();
                                                } catch (err) {
                                                    alert(err.response?.data?.msg || 'Failed to delete user');
                                                }
                                            }
                                        }}
                                            className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 text-xs font-semibold dark:bg-transparent dark:border-red-500/50 dark:text-red-400 flex items-center gap-1">
                                            <X className="w-3 h-3" /> Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white">Create New User</h3>
                            <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Optional)</label>
                                <input type="text" value={newUser.name || ''} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="e.g. John Doe" className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input type="text" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                                    <option value="student">Student</option>
                                    <option value="rep">Representative</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="hod">HOD</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {newUser.role === 'rep' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Community</label>
                                    <input type="text" required value={newUser.community} onChange={e => setNewUser({ ...newUser, community: e.target.value })} placeholder="e.g. Technical" className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                                </div>
                            )}
                            <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors">Create User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote Rep Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Promote to Representative</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Select community for <strong>{selectedUser?.username}</strong>:</p>
                        <input type="text" placeholder="Community Name" value={promoteCommunity} onChange={(e) => setPromoteCommunity(e.target.value)} className="w-full p-3 border rounded-lg mb-6 dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowPromoteModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={confirmRepPromotion} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
