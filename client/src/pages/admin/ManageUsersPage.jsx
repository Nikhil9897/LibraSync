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
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to deactivate account');
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading users...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Manage Users</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and manage library member roles.</p>
                </div>
            </div>

            <div
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <table className="w-full text-left">
                    <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>User Info</th>
                            <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Member Since</th>
                            <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                        {users.map((u) => (
                            <tr
                                key={u._id}
                                className="transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td className="px-6 py-4">
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</p>
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(u.membershipDate || u._id.getTimestamp?.() || Date.now()).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        disabled={u._id === currentUser?.id}
                                        title={u._id === currentUser?.id ? "You cannot change your own role" : undefined}
                                        className={`text-sm font-medium px-3 py-1.5 rounded-lg border outline-none bg-transparent ${
                                            u._id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                        }`}
                                        style={{
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        <option value="member" style={{ backgroundColor: 'var(--surface)' }}>Member</option>
                                        <option value="librarian" style={{ backgroundColor: 'var(--surface)' }}>Librarian</option>
                                        <option value="admin" style={{ backgroundColor: 'var(--surface)' }}>Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDeactivate(u._id, u.name)}
                                        disabled={u._id === currentUser?.id}
                                        className="font-medium text-sm transition-colors"
                                        style={{
                                            color: u._id === currentUser?.id ? 'var(--text-muted)' : 'var(--danger)',
                                        }}
                                        onMouseEnter={e => {
                                            if (u._id !== currentUser?.id) e.currentTarget.style.color = 'color-mix(in srgb, var(--danger) 70%, #000)';
                                        }}
                                        onMouseLeave={e => {
                                            if (u._id !== currentUser?.id) e.currentTarget.style.color = 'var(--danger)';
                                        }}
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
