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
        // Fetch fresh profile data
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
            // Need a slight delay to allow the modal and video element to render
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
            // Flip the image horizontally if it's a front facing camera (optional, but standard)
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
        <div className="max-w-4xl mx-auto py-8 px-4" style={{  }}>
            <h1 className="text-3xl  font-bold text-[#1a1f36] dark:text-white mb-8">My Profile</h1>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8 mb-8">
                <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#d4a853]/20 flex items-center justify-center text-[#d4a853] text-sm"><FiUser /></span>
                    Personal Information
                </h2>
                <form onSubmit={submitProfile} className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 rounded-2xl border dark:border-slate-700 border-slate-100 dark:border-slate-600">
                        <div className="relative group shrink-0">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#0d5959] to-[#d4a853] text-white flex items-center justify-center font-bold text-4xl shadow-md overflow-hidden border-4 border-white dark:border-slate-200/60 dark:border-slate-700">
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
                            <h3 className="font-bold text-[#1a1f36] dark:text-white text-lg">Profile Photo</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">Upload a new photo or take one instantly with your camera.</p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 text-sm font-semibold text-[#0d5959] dark:text-teal-400 hover:text-white hover:bg-[#0d5959] border dark:border-slate-700 border-[#0d5959] px-4 py-2 rounded-xl transition-colors bg-white dark:bg-slate-800 shadow-sm"
                                >
                                    <FiUpload /> Choose Image
                                </button>
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="flex items-center gap-2 text-sm font-semibold text-[#d4a853] hover:text-white hover:bg-[#d4a853] border dark:border-slate-700 border-[#d4a853] px-4 py-2 rounded-xl transition-colors bg-white dark:bg-slate-800 shadow-sm"
                                >
                                    <FiCamera /> Take Photo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleProfileChange}
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none transition-shadow text-slate-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleProfileChange}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none transition-shadow text-slate-800 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleProfileChange}
                                rows="3"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none transition-shadow text-slate-800 dark:text-white resize-none"
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#0d5959] dark:bg-teal-600 text-white font-semibold rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20 flex items-center gap-2"
                        >
                            <FiCheck /> Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 p-8">
                <h2 className="text-2xl  font-bold text-[#1a1f36] dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-500 dark:text-slate-400 text-sm">***</span>
                    Change Password
                </h2>
                <form onSubmit={submitPassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none transition-shadow text-slate-800 dark:text-white tracking-widest text-lg h-[46px]"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none transition-shadow text-slate-800 dark:text-white tracking-widest text-lg h-[46px]"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none transition-shadow text-slate-800 dark:text-white tracking-widest text-lg h-[46px]"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#1a1f36] dark:bg-teal-600 text-white font-semibold rounded-xl hover:bg-black dark:hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-slate-800/20 dark:shadow-teal-900/20"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-500/10 rounded-3xl shadow-sm border dark:border-slate-700 border-red-100 dark:border-red-900/30 p-8 mt-8">
                <h2 className="text-2xl  font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></span>
                    Danger Zone
                </h2>
                <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 mb-6 font-medium ml-11">
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
                    <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative">
                        <div className="p-4 border-b dark:border-slate-700 border-slate-200/60 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50">
                            <h3 className="font-bold text-[#1a1f36] dark:text-white">Take a Photo</h3>
                            <button onClick={stopCamera} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm">
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
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 dark:bg-slate-700/50 flex justify-center gap-4 border-t dark:border-slate-700 border-slate-200/60 dark:border-slate-700">
                            <button
                                onClick={stopCamera}
                                className="px-6 py-2.5 font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-200/60 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={capturePhoto}
                                className="flex items-center gap-2 px-8 py-2.5 font-semibold text-white bg-[#0d5959] dark:bg-teal-600 rounded-xl hover:bg-[#0a4747] dark:hover:bg-teal-700 shadow-md shadow-[#0d5959]/20 dark:shadow-teal-900/20 transition-colors"
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
