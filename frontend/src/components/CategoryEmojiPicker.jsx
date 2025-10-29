import { useState } from 'react';
import { X } from 'lucide-react';

const CategoryEmojiPicker = ({ isOpen, onEmojiSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState('recent');

    if (!isOpen) return null;

    const emojiCategories = {
        recent: {
            name: 'Recently Used',
            icon: '🕒',
            emojis: [
                '😊', '❤️', '😂', '�', '🥺', '😢', '😡', '👍', '👎', '🔥',
                '💯', '🙏', '🎉', '😎', '🤔', '😘', '😀', '😃', '😄', '😁',
                '😆', '😅', '🤣', '🙂', '😉', '😇', '🥰', '😋', '😜', '🤪',
                '😝', '🤑', '🤗', '🤭', '🤫', '🙄', '😏', '😌', '👌', '✌️'
            ]
        },
        smileys: {
            name: 'Smileys & Emotion',
            icon: '�',
            emojis: [
                '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
                '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
                '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
                '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒',
                '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷',
                '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫',
                '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁',
                '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
                '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫',
                '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩'
            ]
        },
        people: {
            name: 'People & Body',
            icon: '�',
            emojis: [
                '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
                '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
                '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
                '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
                '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅',
                '👄', '💋', '🩸', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨',
                '🧔', '🧔‍♂️', '🧔‍♀️', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '🧑‍🦰',
                '👩‍🦱', '🧑‍🦱', '👩‍🦳', '🧑‍🦳', '👩‍🦲', '🧑‍🦲', '👱‍♀️', '👱‍♂️', '🧓', '👴',
                '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️'
            ]
        },
        animals: {
            name: 'Animals & Nature',
            icon: '🐶',
            emojis: [
                '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
                '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊',
                '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
                '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌',
                '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂',
                '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀',
                '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆',
                '🦓', '🦍', '🦧', '🐘', '🦣', '🦏', '🦛', '🐪', '🐫', '🦒',
                '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙'
            ]
        },
        food: {
            name: 'Food & Drink',
            icon: '🍎',
            emojis: [
                '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
                '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
                '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
                '🍠', '🥐', '🥖', '🫓', '🥨', '🥯', '🍞', '🧀', '🥚', '🍳',
                '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔',
                '🍟', '🍕', '🫔', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳',
                '🥘', '🍲', '🫕', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘',
                '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥'
            ]
        },
        activities: {
            name: 'Activities',
            icon: '⚽',
            emojis: [
                '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
                '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
                '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷',
                '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️',
                '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗',
                '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️',
                '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧',
                '🎼', '🎵', '🎶', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎹'
            ]
        },
        travel: {
            name: 'Travel & Places',
            icon: '🚗',
            emojis: [
                '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
                '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
                '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️',
                '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚨', '🚥', '🚦', '🛑',
                '🚏', '⚓', '♨️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡',
                '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️',
                '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭',
                '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩'
            ]
        },
        objects: {
            name: 'Objects',
            icon: '📱',
            emojis: [
                '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️',
                '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️',
                '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭',
                '⏱️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦',
                '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙',
                '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️',
                '⛏️', '🪓', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫'
            ]
        },
        symbols: {
            name: 'Symbols',
            icon: '❤️',
            emojis: [
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
                '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
                '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️',
                '🗯️', '💭', '💤', '🔥', '⭐', '🌟', '✨', '⚡', '☄️', '💥',
                '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺',
                '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾',
                '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛',
                '⬜', '🟫', '🔈', '🔉', '🔊', '🔇', '📢', '📣', '📯', '🔔'
            ]
        },
        flags: {
            name: 'Flags',
            icon: '🏴',
            emojis: [
                '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇱',
                '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼',
                '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿',
                '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳',
                '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾',
                '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩',
                '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯'
            ]
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 md:absolute md:bottom-12 md:right-0 md:inset-x-auto w-full md:w-96 h-96 md:h-80 bg-slate-800 border-t md:border border-slate-600 md:rounded-xl shadow-2xl z-[9999] overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
            {/* Header - Only on desktop */}
            <div className="hidden md:flex items-center justify-between p-3 border-b border-slate-600 bg-slate-750">
                <h3 className="text-sm font-semibold text-white">Emojis</h3>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-600 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex flex-col h-full">
                {/* Categories Row - At Top for Mobile */}
                <div className="flex bg-slate-700 border-b border-slate-600 p-2 overflow-x-auto scrollbar-hide">
                    {Object.entries(emojiCategories).map(([key, category]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`flex-shrink-0 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-lg transition-all mx-1 rounded-lg ${activeCategory === key
                                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-600 active:scale-95'
                                }`}
                            title={category.name}
                        >
                            {category.icon}
                        </button>
                    ))}
                </div>

                {/* Mobile Header */}
                <div className="flex md:hidden items-center justify-between p-3 bg-slate-750 border-b border-slate-600">
                    <span className="text-base font-medium text-white">{emojiCategories[activeCategory].name}</span>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 hover:bg-slate-600 rounded-full transition-colors active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Emoji Grid */}
                <div className="flex-1 overflow-y-auto p-3 pb-safe">
                    <div className="grid grid-cols-8 md:grid-cols-9 gap-2 md:gap-1">
                        {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onEmojiSelect(emoji);
                                    onClose();
                                }}
                                className="w-12 h-12 md:w-8 md:h-8 flex items-center justify-center text-2xl md:text-lg hover:bg-slate-600 active:bg-slate-500 rounded-lg md:rounded-md transition-all transform hover:scale-110 active:scale-95 touch-manipulation"
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

export default CategoryEmojiPicker;