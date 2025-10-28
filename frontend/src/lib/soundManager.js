// =====================================
// SOUND MANAGER UTILITY
// =====================================

class SoundManager {
    constructor() {
        // Preload all sounds for better performance
        this.sounds = {
            // Message sounds
            messageSent: new Audio("/sounds/mouse-click.mp3"),
            messageReceived: new Audio("/sounds/notification.mp3"),

            // Notification sounds
            notification: new Audio("/sounds/notification.mp3"),
            follow: new Audio("/sounds/notification.mp3"),

            // Keyboard sounds
            keystrokes: [
                new Audio("/sounds/keystroke1.mp3"),
                new Audio("/sounds/keystroke2.mp3"),
                new Audio("/sounds/keystroke3.mp3"),
                new Audio("/sounds/keystroke4.mp3"),
            ]
        };

        // Set volume levels
        Object.values(this.sounds).forEach(sound => {
            if (Array.isArray(sound)) {
                sound.forEach(s => s.volume = 0.6);
            } else {
                sound.volume = 0.6;
            }
        });

        this.sounds.keystrokes.forEach(sound => sound.volume = 0.4);
    }

    // Play a specific sound with error handling
    playSound(soundName) {
        try {
            const sound = this.sounds[soundName];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(error => {
                    console.log(`Failed to play ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.log(`Error playing sound ${soundName}:`, error);
        }
    }

    // Play random keystroke sound
    playKeystroke() {
        try {
            const randomSound = this.sounds.keystrokes[
                Math.floor(Math.random() * this.sounds.keystrokes.length)
            ];
            randomSound.currentTime = 0;
            randomSound.play().catch(error => {
                console.log("Keystroke sound failed:", error);
            });
        } catch (error) {
            console.log("Error playing keystroke:", error);
        }
    }

    // Play message sent sound
    playMessageSent() {
        this.playSound('messageSent');
    }

    // Play message received sound
    playMessageReceived() {
        this.playSound('messageReceived');
    }

    // Play notification sound
    playNotification() {
        this.playSound('notification');
    }

    // Play follow notification sound
    playFollowNotification() {
        this.playSound('follow');
    }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;

// Export individual functions for convenience
export const {
    playSound,
    playKeystroke,
    playMessageSent,
    playMessageReceived,
    playNotification,
    playFollowNotification
} = soundManager;