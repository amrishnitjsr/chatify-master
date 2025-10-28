import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { VolumeXIcon, Volume2Icon } from 'lucide-react';
import soundManager from '../lib/soundManager.js';

const SoundSettings = ({ compact = false }) => {
    const { isSoundEnabled, toggleSound } = useChatStore();
    const { notificationSoundEnabled, toggleNotificationSound } = useAuthStore();

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleSound}
                    className={`p-2 rounded-lg transition-colors ${isSoundEnabled
                            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                            : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600'
                        }`}
                    title={`${isSoundEnabled ? 'Disable' : 'Enable'} message sounds`}
                >
                    {isSoundEnabled ? (
                        <Volume2Icon className="size-5" />
                    ) : (
                        <VolumeXIcon className="size-5" />
                    )}
                </button>

                <button
                    onClick={toggleNotificationSound}
                    className={`p-2 rounded-lg transition-colors ${notificationSoundEnabled
                            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                            : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600'
                        }`}
                    title={`${notificationSoundEnabled ? 'Disable' : 'Enable'} notification sounds`}
                >
                    🔔
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Sound Settings</h3>

            {/* Message Sounds */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isSoundEnabled ? (
                        <Volume2Icon className="size-5 text-cyan-400" />
                    ) : (
                        <VolumeXIcon className="size-5 text-slate-400" />
                    )}
                    <div>
                        <p className="text-white font-medium">Message Sounds</p>
                        <p className="text-slate-400 text-sm">Typing and message send/receive sounds</p>
                    </div>
                </div>
                <button
                    onClick={toggleSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSoundEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Notification Sounds */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`text-xl ${notificationSoundEnabled ? 'text-purple-400' : 'text-slate-400'}`}>
                        🔔
                    </span>
                    <div>
                        <p className="text-white font-medium">Notification Sounds</p>
                        <p className="text-slate-400 text-sm">Sounds for follows, likes, and other notifications</p>
                    </div>
                </div>
                <button
                    onClick={toggleNotificationSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSoundEnabled ? 'bg-purple-500' : 'bg-slate-600'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Sound Preview Buttons */}
            <div className="pt-4 border-t border-slate-600">
                <p className="text-slate-400 text-sm mb-3">Test Sounds:</p>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            if (isSoundEnabled) {
                                soundManager.playMessageSent();
                            }
                        }}
                        disabled={!isSoundEnabled}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-200 text-sm rounded transition-colors"
                    >
                        Message Sent
                    </button>
                    <button
                        onClick={() => {
                            if (isSoundEnabled) {
                                soundManager.playMessageReceived();
                            }
                        }}
                        disabled={!isSoundEnabled}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-200 text-sm rounded transition-colors"
                    >
                        Message Received
                    </button>
                    <button
                        onClick={() => {
                            if (notificationSoundEnabled) {
                                soundManager.playNotification();
                            }
                        }}
                        disabled={!notificationSoundEnabled}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-200 text-sm rounded transition-colors"
                    >
                        Notification
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SoundSettings;