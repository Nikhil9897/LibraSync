import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageUsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data.data.users);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            toast.success('User role updated');
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDeactivate = async (userId, name) => {
        if (!window.confirm(`Are you sure you want to deactivate ${name}'s account?`)) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success('Account deactivated');
            fetchUsers(); // Refresh list to remove deactivated users
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to deactivate account');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading users...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">Manage Users</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage library member roles.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">User Info</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Member Since</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{u.email}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                    {new Date(u.membershipDate || u._id.getTimestamp?.() || Date.now()).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        disabled={u._id === currentUser?.id}
                                        title={u._id === currentUser?.id ? "You cannot change your own role" : undefined}
                                        className={`text-sm font-medium px-3 py-1.5 rounded-lg border dark:border-slate-700 outline-none ${
                                            u._id === currentUser?.id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                                        } ${
                                            u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            u.role === 'librarian' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200'
                                        }`}
                                    >
                                        <option value="member">Member</option>
                                        <option value="librarian">Librarian</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDeactivate(u._id, u.name)}
                                        disabled={u._id === currentUser?.id}
                                        className={`font-medium text-sm transition-colors ${
                                            u._id === currentUser?.id 
                                                ? 'text-gray-400 cursor-not-allowed' 
                                                : 'text-red-600 hover:text-red-800'
                                        }`}
                                    >
                                        Deactivate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsersPage;
