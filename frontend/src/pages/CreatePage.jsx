import { useState, useRef } from "react";
import { ImageIcon, XIcon, SmileIcon, MapPinIcon, TagIcon, ArrowLeftIcon } from "lucide-react";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";

const CreatePage = () => {
    const { authUser } = useAuthStore();
    const { createPost, isCreatingPost } = usePostStore();
    const [step, setStep] = useState(1); // 1: select media, 2: add details
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [postText, setPostText] = useState("");
    const [location, setLocation] = useState("");
    const [accessibility, setAccessibility] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
            setStep(2);
        }
    };

    const handleTextOnlyPost = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!postText.trim() && !selectedImage) {
            alert("Please add some content to your post");
            return;
        }

        try {
            const postData = {
                text: postText,
                location: location
            };

            if (selectedImage) {
                // Convert image to base64
                const reader = new FileReader();
                reader.onload = async (e) => {
                    postData.image = e.target.result;
                    await createPost(postData);
                    handleResetForm();
                };
                reader.readAsDataURL(selectedImage);
            } else {
                await createPost(postData);
                handleResetForm();
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        }
    };

    const handleResetForm = () => {
        setStep(1);
        setSelectedImage(null);
        setPreviewUrl(null);
        setPostText("");
        setLocation("");
        setAccessibility("");
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedImage(null);
            setPreviewUrl(null);
        }
    };

    const resetForm = () => {
        setStep(1);
        setSelectedImage(null);
        setPreviewUrl(null);
        setPostText("");
        setLocation("");
        setAccessibility("");
        setShowAdvanced(false);
    };

    return (
        <div className="h-full overflow-y-auto">
            {step === 1 ? (
                // Step 1: Select Media or Create Text Post
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700/50 text-center">
                        <h1 className="text-xl font-semibold text-white">Create new post</h1>
                    </div>

                    {/* Content Selection */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-md">
                            {/* Media Upload */}
                            <div className="mb-8">
                                <div className="text-6xl mb-4">📷</div>
                                <h2 className="text-2xl font-light text-white mb-4">
                                    Drag photos and videos here
                                </h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Select from computer
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 border-t border-slate-600"></div>
                                <span className="text-slate-400 text-sm">OR</span>
                                <div className="flex-1 border-t border-slate-600"></div>
                            </div>

                            {/* Text Only Post */}
                            <div>
                                <button
                                    onClick={handleTextOnlyPost}
                                    className="w-full p-6 border-2 border-dashed border-slate-600 rounded-xl hover:border-slate-500 transition-colors group"
                                >
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✍️</div>
                                    <h3 className="text-white font-medium mb-2">Create a text post</h3>
                                    <p className="text-slate-400 text-sm">Share your thoughts with your followers</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Step 2: Add Details
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-slate-400 hover:text-white"
                            >
                                <ArrowLeftIcon className="size-6" />
                            </button>
                            <h1 className="text-xl font-semibold text-white">Create new post</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-slate-400 hover:text-white px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreatingPost || (!postText.trim() && !selectedImage)}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                {isCreatingPost ? "Sharing..." : "Share"}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Media Preview (if exists) */}
                        {previewUrl && (
                            <div className="w-2/3 bg-black flex items-center justify-center">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        )}

                        {/* Post Details */}
                        <div className={`${previewUrl ? 'w-1/3' : 'w-full'} p-6 overflow-y-auto`}>
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={authUser?.profilePic || "/avatar.png"}
                                    alt={authUser?.fullName}
                                    className="size-10 rounded-full object-cover border border-slate-600"
                                />
                                <span className="text-white font-semibold">
                                    {authUser?.fullName}
                                </span>
                            </div>

                            {/* Caption */}
                            <div className="mb-6">
                                <textarea
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    placeholder="Write a caption..."
                                    className="w-full h-32 bg-transparent text-white placeholder:text-slate-400 resize-none border-0 outline-none text-sm"
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <SmileIcon className="size-5" />
                                    </button>
                                    <span className="text-slate-500 text-xs">
                                        {postText.length}/2200
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 p-3 hover:bg-slate-700/30 rounded-lg cursor-pointer">
                                    <MapPinIcon className="size-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Add location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="flex-1 bg-transparent text-white placeholder:text-slate-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Advanced Options Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 rounded-lg text-white"
                            >
                                <span>Advanced settings</span>
                                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                                    ↓
                                </span>
                            </button>

                            {/* Advanced Options */}
                            {showAdvanced && (
                                <div className="mt-4 space-y-4">
                                    {/* Alt Text */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <TagIcon className="size-4 text-slate-400" />
                                            <span className="text-white text-sm">Alt text</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Write alt text..."
                                            value={accessibility}
                                            onChange={(e) => setAccessibility(e.target.value)}
                                            className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <p className="text-slate-500 text-xs mt-1">
                                            Alt text describes your photos for people with visual impairments.
                                        </p>
                                    </div>

                                    {/* Privacy Settings */}
                                    <div>
                                        <label className="flex items-center gap-3 p-3 hover:bg-slate-700/30 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-white text-sm">Hide like and view counts</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-3 p-3 hover:bg-slate-700/30 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-white text-sm">Turn off commenting</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreatePage;