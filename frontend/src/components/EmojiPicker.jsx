import React, { useState } from 'react';
import { Smile, X } from 'lucide-react';

const EmojiPicker = ({ onEmojiSelect, isOpen, onToggle }) => {
    const [activeCategory, setActiveCategory] = useState('recent');

    // Quick reactions for chat
    const quickReactions = ['❤️', '😂', '😊', '�', '�😢', '😡', '👍', '👎', '🔥', '💯', '🙏', '🎉', '😎', '🤔', '😘', '🥺'];

    const emojiCategories = {
        recent: {
            name: 'Quick Reactions',
            icon: '⚡',
            emojis: quickReactions
        },
        smileys: {
            name: 'Smileys & Emotion',
            icon: '😊',
            emojis: [
                '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
                '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
                '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
                '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒',
                '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷'
            ]
        },
        people: {
            name: 'People & Body',
            icon: '👋',
            emojis: [
                '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
                '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
                '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
                '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂'
            ]
        },
        animals: {
            name: 'Animals & Nature',
            icon: '🐶',
            emojis: [
                '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
                '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊',
                '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
                '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌'
            ]
        },
        food: {
            name: 'Food & Drink',
            icon: '🍎',
            emojis: [
                '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
                '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
                '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
                '🍠', '🥐', '🥖', '🫓', '🥨', '🥯', '🍞', '🧀', '🥚', '🍳'
            ]
        },
        activities: {
            name: 'Activities',
            icon: '⚽',
            emojis: [
                '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
                '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
                '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷',
                '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️'
            ]
        },
        objects: {
            name: 'Objects',
            icon: '📱',
            emojis: [
                '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️',
                '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️',
                '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭',
                '⏱️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦'
            ]
        },
        symbols: {
            name: 'Symbols',
            icon: '❤️',
            emojis: [
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
                '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
                '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️',
                '🗯️', '💭', '💤', '🔥', '⭐', '🌟', '✨', '⚡', '☄️', '💥'
            ]
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute bottom-12 left-0 w-80 h-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
                <h3 className="text-sm font-medium text-slate-200">Emojis</h3>
                <button
                    onClick={onToggle}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex h-52">
                {/* Categories */}
                <div className="w-12 bg-slate-700 border-r border-slate-600">
                    {Object.entries(emojiCategories).map(([key, category]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`w-full h-10 flex items-center justify-center text-lg hover:bg-slate-600 transition-colors ${activeCategory === key ? 'bg-cyan-600 text-white' : 'text-slate-300'
                                }`}
                            title={category.name}
                        >
                            {category.icon}
                        </button>
                    ))}
                </div>

                {/* Emoji Grid */}
                <div className="flex-1 p-2 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                        {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onEmojiSelect(emoji);
                                    onToggle();
                                }}
                                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-600 rounded transition-colors"
                                title={emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;