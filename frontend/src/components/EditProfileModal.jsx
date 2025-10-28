import { useState, useRef } from "react";
import { XIcon, CameraIcon, UserIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose }) => {
    const { authUser, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: authUser?.fullName || "",
        username: authUser?.username || "",
        bio: authUser?.bio || "",
        website: authUser?.website || "",
        location: authUser?.location || "",
        profilePic: authUser?.profilePic || ""
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updateData = {
                fullName: formData.fullName,
                username: formData.username,
                bio: formData.bio,
                website: formData.website,
                location: formData.location
            };

            // Add image as base64 if selected
            if (selectedImage) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    updateData.profilePic = e.target.result;
                    await submitUpdate(updateData);
                };
                reader.readAsDataURL(selectedImage);
            } else {
                await submitUpdate(updateData);
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
            setIsLoading(false);
        }
    };

    const submitUpdate = async (updateData) => {
        try {
            const response = await axiosInstance.put('/auth/update-profile', updateData);

            updateProfile(response.data.user);
            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: authUser?.fullName || "",
            username: authUser?.username || "",
            bio: authUser?.bio || "",
            website: authUser?.website || "",
            location: authUser?.location || "",
            profilePic: authUser?.profilePic || ""
        });
        setSelectedImage(null);
        setPreviewUrl(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">Edit profile</h2>
                    <button
                        onClick={handleCancel}
                        className="text-slate-400 hover:text-white p-2"
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Profile Picture */}
                        <div className="text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600">
                                    {previewUrl || formData.profilePic ? (
                                        <img
                                            src={previewUrl || formData.profilePic}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <UserIcon className="size-8 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                                >
                                    <CameraIcon className="size-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                Change photo
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="Enter username"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    placeholder="Write a bio..."
                                />
                                <p className="text-slate-500 text-xs mt-1">
                                    {formData.bio.length}/150
                                </p>
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="https://www.example.com"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="Add your location"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;