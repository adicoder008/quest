import { db } from './firebase'; // Adjust path if needed: '../../lib/firebase'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, increment } from 'firebase/firestore';

// /**
//  * Follows a user.
//  * Adds the current user's ID to the target user's 'followers' array.
//  * Adds the target user's ID to the current user's 'following' array.
//  * Increments the target user's 'followersCount'.
//  *
//  * @param {string} currentUserId - The ID of the user who is initiating the follow (the follower).
//  * @param {string} targetUserId - The ID of the user being followed.
//  * @returns {Promise<void>}
//  */
export const followUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) {
        throw new Error("Cannot follow yourself.");
    }

    try {
        // 1. Update the target user's document (add currentUserId to their followers list and increment count)
        const targetUserRef = doc(db, 'users', targetUserId);
        await updateDoc(targetUserRef, {
            followers: arrayUnion(currentUserId),
            followersCount: increment(1) // Assuming a counter field exists
        });

        // 2. Update the current user's document (add targetUserId to their following list and increment count)
        const currentUserRef = doc(db, 'users', currentUserId);
        await updateDoc(currentUserRef, {
            following: arrayUnion(targetUserId),
            followingCount: increment(1) // Assuming a counter field exists
        });

        console.log(`User ${currentUserId} is now following user ${targetUserId}.`);
    } catch (error) {
        console.error("Error following user:", error);
        throw error;
    }
};

// /**
//  * Unfollows a user.
//  * Removes the current user's ID from the target user's 'followers' array.
//  * Removes the target user's ID from the current user's 'following' array.
//  * Decrements the target user's 'followersCount'.
//  *
//  * @param {string} currentUserId - The ID of the user who is initiating the unfollow.
//  * @param {string} targetUserId - The ID of the user being unfollowed.
//  * @returns {Promise<void>}
//  */
export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) {
        throw new Error("Cannot unfollow yourself.");
    }

    try {
        // 1. Update the target user's document (remove currentUserId from their followers list and decrement count)
        const targetUserRef = doc(db, 'users', targetUserId);
        await updateDoc(targetUserRef, {
            followers: arrayRemove(currentUserId),
            followersCount: increment(-1) // Assuming a counter field exists
        });

        // 2. Update the current user's document (remove targetUserId from their following list and decrement count)
        const currentUserRef = doc(db, 'users', currentUserId);
        await updateDoc(currentUserRef, {
            following: arrayRemove(targetUserId),
            followingCount: increment(-1) // Assuming a counter field exists
        });

        console.log(`User ${currentUserId} has unfollowed user ${targetUserId}.`);
    } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
    }
};

export default { followUser, unfollowUser };