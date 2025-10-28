import { useState, useRef } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import { ImageIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

const CreatePostForm = ({ onClose, onSuccess }) => {
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const { createPost, isCreatingPost } = usePostStore();
    const { authUser } = useAuthStore();

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            setImage(base64Image);
            setImagePreview(base64Image);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim() && !image) {
            toast.error('Please add some text or an image');
            return;
        }

        try {
            await createPost({
                text: text.trim(),
                image: image
            });

            // Reset form
            setText("");
            setImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            onSuccess?.();
        } catch (error) {
            console.error('Create post error:', error);

            // Handle specific Cloudinary config error
            if (error.response?.data?.error === 'cloudinary_config_required') {
                toast.error('Image upload unavailable. Cloudinary not configured.');
                // If user has text, suggest creating text-only post
                if (text.trim()) {
                    toast('💡 Try posting without the image for now', { icon: '💡' });
                }
            }
        }
    };

    return (
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create New Post</h3>
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
                >
                    <XIcon className="size-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={authUser?.profilePic || "/avatar.png"}
                        alt={authUser?.fullName}
                        className="size-10 rounded-full object-cover border-2 border-slate-600"
                    />
                    <div>
                        <p className="text-white font-medium">{authUser?.fullName}</p>
                        <p className="text-slate-400 text-sm">What's on your mind?</p>
                    </div>
                </div>

                {/* Text Input */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your thoughts..."
                    maxLength={5000}
                    rows={4}
                    className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-lg px-4 py-3 border border-slate-600 focus:border-primary focus:outline-none resize-none transition-colors"
                />

                {/* Character count */}
                <div className="flex justify-end">
                    <span className={`text-xs ${text.length > 4500 ? 'text-warning' : 'text-slate-400'}`}>
                        {text.length}/5000
                    </span>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full max-h-64 object-cover rounded-lg border border-slate-600"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-2 transition-colors"
                        >
                            <XIcon className="size-4" />
                        </button>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4">
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
                        >
                            <ImageIcon className="size-4 mr-2" />
                            Add Photo
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreatingPost || (!text.trim() && !image)}
                            className="btn btn-primary btn-sm"
                        >
                            {isCreatingPost ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Posting...
                                </>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;