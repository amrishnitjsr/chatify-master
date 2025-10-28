import { useState, useRef } from "react";
import { X, Camera, Type, Palette } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";

const CreateStoryModal = ({ isOpen, onClose }) => {
    const { createStory, isCreatingStory } = useStoryStore();
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [storyText, setStoryText] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#000000");
    const [storyType, setStoryType] = useState("media"); // "media" or "text"

    const backgroundColors = [
        "#000000", "#1a1a1a", "#ff4444", "#ff8844", "#ffcc44",
        "#44ff44", "#44ccff", "#4444ff", "#8844ff", "#ff44cc"
    ];

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
                setStoryType("media");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateTextStory = () => {
        setStoryType("text");
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async () => {
        try {
            let content = "";
            let contentType = "text";

            if (storyType === "media" && selectedFile) {
                content = previewUrl;
                contentType = selectedFile.type.startsWith("video/") ? "video" : "image";
            } else if (storyType === "text") {
                contentType = "text";
            }

            await createStory({
                content,
                contentType,
                text: storyText,
                backgroundColor: storyType === "text" ? backgroundColor : "#000000",
            });

            // Reset form
            setSelectedFile(null);
            setPreviewUrl(null);
            setStoryText("");
            setBackgroundColor("#000000");
            setStoryType("media");
            onClose();
        } catch (error) {
            console.error("Failed to create story:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-slate-800 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">Create Story</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="size-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Story Type Selector */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                        >
                            <Camera className="size-4" />
                            Photo/Video
                        </button>
                        <button
                            onClick={handleCreateTextStory}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                        >
                            <Type className="size-4" />
                            Text
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Preview */}
                    <div className="mb-4">
                        {storyType === "media" && previewUrl ? (
                            <div className="relative aspect-[9/16] max-h-96 rounded-lg overflow-hidden bg-black">
                                {selectedFile?.type.startsWith("video/") ? (
                                    <video
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Story preview"
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Text Overlay */}
                                {storyText && (
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <p
                                            className="text-white text-center font-semibold text-lg shadow-lg"
                                            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                                        >
                                            {storyText}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : storyType === "text" ? (
                            <div
                                className="aspect-[9/16] max-h-96 rounded-lg flex items-center justify-center p-4"
                                style={{ backgroundColor }}
                            >
                                <p className="text-white text-center font-semibold text-xl">
                                    {storyText || "Add text to your story..."}
                                </p>
                            </div>
                        ) : (
                            <div className="aspect-[9/16] max-h-96 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center">
                                <div className="text-center text-slate-400">
                                    <Camera className="size-12 mx-auto mb-2" />
                                    <p>Select a photo or video</p>
                                    <p className="text-sm">or create a text story</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Add text (optional)
                        </label>
                        <textarea
                            value={storyText}
                            onChange={(e) => setStoryText(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            maxLength={200}
                        />
                        <p className="text-xs text-slate-400 mt-1">{storyText.length}/200</p>
                    </div>

                    {/* Background Colors (for text stories) */}
                    {storyType === "text" && (
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Palette className="size-4" />
                                Background Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {backgroundColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setBackgroundColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${backgroundColor === color
                                                ? "border-white"
                                                : "border-slate-600"
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isCreatingStory || (!previewUrl && !storyText.trim())}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {isCreatingStory ? "Creating..." : "Share Story"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStoryModal;