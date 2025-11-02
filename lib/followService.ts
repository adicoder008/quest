import { db } from './firebase'; // Adjust path if needed: '../../lib/firebase' 
import { 
    doc, 
    writeBatch, // <-- New import
    arrayUnion, 
    arrayRemove, 
    increment ,
    serverTimestamp
} from 'firebase/firestore';
import { getDoc} from 'firebase/firestore';

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
// export const followUser = async (currentUserId: string, targetUserId: string) => {
//     if (currentUserId === targetUserId) {
//         throw new Error("Cannot follow yourself.");
//     }

//     try {
//         // 1. Update the target user's document (add currentUserId to their followers list and increment count)
//         const targetUserRef = doc(db, 'users', targetUserId);
//         await updateDoc(targetUserRef, {
//             followers: arrayUnion(currentUserId),
//             followersCount: increment(1) // Assuming a counter field exists
//         });

//         // 2. Update the current user's document (add targetUserId to their following list and increment count)
//         const currentUserRef = doc(db, 'users', currentUserId);
//         await updateDoc(currentUserRef, {
//             following: arrayUnion(targetUserId),
//             followingCount: increment(1) // Assuming a counter field exists
//         });

//         console.log(`User ${currentUserId} is now following user ${targetUserId}.`);
//     } catch (error) {
//         console.error("Error following user:", error);
//         throw error;
//     }
// };

// // /**
// //  * Unfollows a user.
// //  * Removes the current user's ID from the target user's 'followers' array.
// //  * Removes the target user's ID from the current user's 'following' array.
// //  * Decrements the target user's 'followersCount'.
// //  *
// //  * @param {string} currentUserId - The ID of the user who is initiating the unfollow.
// //  * @param {string} targetUserId - The ID of the user being unfollowed.
// //  * @returns {Promise<void>}
// //  */
// export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
//     if (currentUserId === targetUserId) {
//         throw new Error("Cannot unfollow yourself.");
//     }

//     try {
//         // 1. Update the target user's document (remove currentUserId from their followers list and decrement count)
//         const targetUserRef = doc(db, 'users', targetUserId);
//         await updateDoc(targetUserRef, {
//             followers: arrayRemove(currentUserId),
//             followersCount: increment(-1) // Assuming a counter field exists
//         });

//         // 2. Update the current user's document (remove targetUserId from their following list and decrement count)
//         const currentUserRef = doc(db, 'users', currentUserId);
//         await updateDoc(currentUserRef, {
//             following: arrayRemove(targetUserId),
//             followingCount: increment(-1) // Assuming a counter field exists
//         });

//         console.log(`User ${currentUserId} has unfollowed user ${targetUserId}.`);
//     } catch (error) {
//         console.error("Error unfollowing user:", error);
//         throw error;
//     }
// };

// export default { followUser, unfollowUser };

export const followUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) {
        throw new Error("Cannot follow yourself.");
    }

    // 1. Create a batch
    const batch = writeBatch(db);

    // Get references
    const targetUserRef = doc(db, 'users', targetUserId);
    const currentUserRef = doc(db, 'users', currentUserId);

    // 2. Add the writes to the batch
    // Update target user (add follower and increment count)
    batch.update(targetUserRef, {
        followers: arrayUnion(currentUserId),
        followersCount: increment(1),
        updatedAt: serverTimestamp()
    });

    // Update current user (add following and increment count)
    batch.update(currentUserRef, {
        following: arrayUnion(targetUserId),
        followingCount: increment(1),
        updatedAt: serverTimestamp()
    });

    try {
        // 3. Commit the batch (All writes succeed or all writes fail)
        await batch.commit(); 
        console.log(`User ${currentUserId} is now following user ${targetUserId} via atomic batch.`);
    } catch (error) {
        console.error("Error following user via batch:", error);
        throw error;
    }
};


export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) {
        throw new Error("Cannot unfollow yourself.");
    }

    // 1. Create a batch
    const batch = writeBatch(db);

    // Get references
    const targetUserRef = doc(db, 'users', targetUserId);
    const currentUserRef = doc(db, 'users', currentUserId);

    // 2. Add the writes to the batch
    // Update target user (remove follower and decrement count)
    batch.update(targetUserRef, {
        followers: arrayRemove(currentUserId),
        followersCount: increment(-1),
        updatedAt: serverTimestamp()
    });

    // Update current user (remove following and decrement count)
    batch.update(currentUserRef, {
        following: arrayRemove(targetUserId),
        followingCount: increment(-1),
        updatedAt: serverTimestamp()
    });
    
    try {
        // 3. Commit the batch (All writes succeed or all writes fail)
        await batch.commit();
        console.log(`User ${currentUserId} has unfollowed user ${targetUserId} via atomic batch.`);
    } catch (error) {
        console.error("Error unfollowing user via batch:", error);
        throw error;
    }
};


// Helper to get the current user's following list
// Helper to get the current user's following list (Reads the 'following' array field)
// This must be defined OUTSIDE the component.
export const getFollowingList = async (currentUserId: string): Promise<string[]> => {
    const userRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        return (userDoc.data().following as string[] | undefined) || []; 
    }
    return [];
};