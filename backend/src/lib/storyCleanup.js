import Story from '../models/Story.js';
import { scheduleJob } from 'node-schedule';

// Cleanup expired stories (backup to MongoDB TTL)
export const cleanupExpiredStories = async () => {
    try {
        console.log('Running story cleanup job...');

        // Delete stories where expiresAt is less than current time
        const result = await Story.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} expired stories`);
        }
    } catch (error) {
        console.error('Error during story cleanup:', error);
    }
};

// Mark stories as inactive before they expire (grace period)
export const markStoriesAsInactive = async () => {
    try {
        console.log('Checking for stories to mark as inactive...');

        // Mark stories as inactive 1 hour before they expire
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

        const result = await Story.updateMany(
            {
                expiresAt: { $lt: oneHourFromNow },
                isActive: true
            },
            {
                $set: { isActive: false }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Marked ${result.modifiedCount} stories as inactive (expiring soon)`);
        }
    } catch (error) {
        console.error('Error marking stories as inactive:', error);
    }
};

// Initialize cleanup jobs
export const initializeStoryCleanup = () => {
    console.log('Initializing story cleanup jobs...');

    // Run cleanup every hour
    scheduleJob('0 * * * *', cleanupExpiredStories);

    // Run inactive marking every 30 minutes
    scheduleJob('*/30 * * * *', markStoriesAsInactive);

    // Run initial cleanup on startup
    setTimeout(() => {
        cleanupExpiredStories();
        markStoriesAsInactive();
    }, 5000); // Wait 5 seconds after startup

    console.log('Story cleanup jobs scheduled');
};

// Manual cleanup function for testing
export const runManualCleanup = async () => {
    console.log('Running manual story cleanup...');
    await cleanupExpiredStories();
    await markStoriesAsInactive();
    console.log('Manual cleanup completed');
};