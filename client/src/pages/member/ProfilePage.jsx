import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCamera, FiUpload, FiX, FiCheck, FiUser, FiTrash2 } from 'react-icons/fi';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    // Profile State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        avatar: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        api.get('/auth/me').then((res) => {
            const u = res.data.data.user;
            setFormData({
                name: u.name || '',
                phone: u.phone || '',
                address: u.address || '',
                avatar: u.avatar || ''
            });
        }).catch(() => toast.error('Failed to load profile data'));

        return () => {
            stopCamera();
        };
    }, []);

    const handleProfileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error('Image size should be less than 5MB');
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Camera Functions
    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            toast.error('Could not access camera. Please check permissions.');
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvas.toDataURL('image/jpeg');
            setFormData({ ...formData, avatar: imageData });
            stopCamera();
        }
    };

    const submitProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.put('/users/me', formData);
            setUser(res.data.data.user);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        try {
            setLoading(true);
            await api.put('/users/update-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            try {
                setLoading(true);
                await api.delete('/users/me');
                toast.success('Account deleted successfully');
                setUser(null);
                localStorage.removeItem('token');
                window.location.href = '/';
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete account');
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>My Profile</h1>

            <div
                className="rounded-3xl shadow-sm border p-8 mb-8"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}><FiUser /></span>
                    Personal Information
                </h2>
                <form onSubmit={submitProfile} className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-6 rounded-2xl border"
                        style={{
                            backgroundColor: 'var(--surface-2)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div className="relative group shrink-0">
                            <div
                                className="w-28 h-28 rounded-full flex items-center justify-center font-bold text-4xl shadow-md overflow-hidden border-4"
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    color: '#fff',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    formData.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FiUpload size={24} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Profile Photo</h3>
                            <p className="text-sm mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Upload a new photo or take one instantly with your camera.</p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 text-sm font-semibold border px-4 py-2 rounded-xl transition-colors bg-transparent shadow-sm"
                                    style={{
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                >
                                    <FiUpload /> Choose Image
                                </button>
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="flex items-center gap-2 text-sm font-semibold border px-4 py-2 rounded-xl transition-colors bg-transparent shadow-sm"
                                    style={{
                                        borderColor: 'var(--secondary)',
                                        color: 'var(--secondary)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--secondary)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--secondary)'; }}
                                >
                                    <FiCamera /> Take Photo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleProfileChange}
                                required
                                className="w-full px-4 py-3 bg-transparent border rounded-xl outline-none transition-shadow"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleProfileChange}
                                className="w-full px-4 py-3 bg-transparent border rounded-xl outline-none transition-shadow"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleProfileChange}
                                rows="3"
                                className="w-full px-4 py-3 bg-transparent border rounded-xl outline-none transition-shadow resize-none"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-md flex items-center gap-2"
                            style={{
                                backgroundColor: 'var(--primary)',
                            }}
                            onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                        >
                            <FiCheck /> Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div
                className="rounded-3xl shadow-sm border p-8"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>***</span>
                    Change Password
                </h2>
                <form onSubmit={submitPassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full px-4 py-3 bg-transparent border rounded-xl outline-none transition-shadow tracking-widest text-lg h-[46px]"
                                placeholder="••••••••"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                                className="w-full px-4 py-3 bg-transparent border rounded-xl outline-none transition-shadow tracking-widest text-lg h-[46px]"
                                placeholder="••••••••"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                                className="w-full px-4 py-3 bg-transparent border rounded-xl outline-none transition-shadow tracking-widest text-lg h-[46px]"
                                placeholder="••••••••"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-md"
                            style={{
                                backgroundColor: 'var(--primary)',
                            }}
                            onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div
                className="rounded-3xl shadow-sm border p-8 mt-8"
                style={{
                    backgroundColor: 'var(--danger-muted)',
                    borderColor: 'var(--danger-muted)',
                }}
            >
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></span>
                    Danger Zone
                </h2>
                <p className="mb-6 font-medium ml-11" style={{ color: 'var(--text-secondary)' }}>
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <div className="ml-11">
                    <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md shadow-red-600/20"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Camera Modal */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div
                        className="rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative border"
                        style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-900/50" style={{ borderColor: 'var(--border)' }}>
                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Take a Photo</h3>
                            <button
                                onClick={stopCamera}
                                className="p-2 rounded-full transition-colors shadow-sm"
                                style={{
                                    backgroundColor: 'var(--surface-hover)',
                                    color: 'var(--text-secondary)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover transform -scale-x-100"
                            ></video>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        <div className="p-6 flex justify-center gap-4 border-t" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                            <button
                                onClick={stopCamera}
                                className="px-6 py-2.5 font-semibold border rounded-xl transition-colors shadow-sm bg-transparent"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-secondary)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={capturePhoto}
                                className="flex items-center gap-2 px-8 py-2.5 font-semibold text-white rounded-xl shadow-md transition-colors"
                                style={{
                                    backgroundColor: 'var(--primary)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                <FiCamera /> Capture
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
