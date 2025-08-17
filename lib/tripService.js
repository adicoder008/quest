import { 
    doc, 
    getDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    increment,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  export const tripService = {
    // Get trip by ID
    async getTrip(tripId) {
      try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        
        if (!tripSnap.exists()) {
          throw new Error('Trip not found');
        }
        
        const tripData = { id: tripSnap.id, ...tripSnap.data() };
        
        // Get creator info
        const creatorRef = doc(db, 'users', tripData.createdBy);
        const creatorSnap = await getDoc(creatorRef);
        tripData.creator = creatorSnap.exists() ? { id: creatorSnap.id, ...creatorSnap.data() } : null;
        
        // Get co-owners info if any
        if (tripData.coOwners && tripData.coOwners.length > 0) {
          const coOwnersData = await Promise.all(
            tripData.coOwners.map(async (ownerId) => {
              const ownerRef = doc(db, 'users', ownerId);
              const ownerSnap = await getDoc(ownerRef);
              return ownerSnap.exists() ? { id: ownerSnap.id, ...ownerSnap.data() } : null;
            })
          );
          tripData.coOwnersData = coOwnersData.filter(owner => owner);
        }
        
        return tripData;
      } catch (error) {
        console.error('Error fetching trip:', error);
        throw error;
      }
    },
  
    // Toggle like
    async toggleLike(tripId, uid) {
      try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        
        if (!tripSnap.exists()) throw new Error('Trip not found');
        
        const tripData = tripSnap.data();
        const likes = tripData.likes || [];
        const isLiked = likes.includes(uid);
        
        await updateDoc(tripRef, {
          likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
          likesCount: increment(isLiked ? -1 : 1)
        });
        
        return { isLiked: !isLiked };
      } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      }
    },
  
    // Toggle save
    async toggleSave(tripId, uid) {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const userData = userSnap.data();
        const savedTrips = userData.savedTrips || [];
        const isSaved = savedTrips.includes(tripId);
        
        await updateDoc(userRef, {
          savedTrips: isSaved ? arrayRemove(tripId) : arrayUnion(tripId)
        });
        
        // Update trip saves count
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
          savesCount: increment(isSaved ? -1 : 1)
        });
        
        return { isSaved: !isSaved };
      } catch (error) {
        console.error('Error toggling save:', error);
        throw error;
      }
    },
  
    // Follow/Unfollow trip
    async toggleFollow(tripId, uid) {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const userData = userSnap.data();
        const followedTrips = userData.followedTrips || [];
        const isFollowing = followedTrips.includes(tripId);
        
        await updateDoc(userRef, {
          followedTrips: isFollowing ? arrayRemove(tripId) : arrayUnion(tripId)
        });
        
        // Update trip followers count
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
          followersCount: increment(isFollowing ? -1 : 1)
        });
        
        return { isFollowing: !isFollowing };
      } catch (error) {
        console.error('Error toggling follow:', error);
        throw error;
      }
    },
  
    // Duplicate trip
    async duplicateTrip(tripId, uid) {
      try {
        const tripRef = doc(db, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        
        if (!tripSnap.exists()) throw new Error('Trip not found');
        
        const originalTrip = tripSnap.data();
        
        const duplicatedTrip = {
          ...originalTrip,
          title: `Copy of ${originalTrip.title}`,
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPrivate: true, // Duplicated trips start as private
          isDraft: true,
          originalTripId: tripId,
          likes: [],
          likesCount: 0,
          savesCount: 0,
          followersCount: 0,
          duplicationsCount: 0,
          viewsCount: 0,
          coOwners: [] // Remove co-owners from duplicate
        };
        
        const newTripRef = await addDoc(collection(db, 'trips'), duplicatedTrip);
        
        // Update original trip duplication count
        await updateDoc(tripRef, {
          duplicationsCount: increment(1)
        });
        
        return { success: true, newTripId: newTripRef.id };
      } catch (error) {
        console.error('Error duplicating trip:', error);
        throw error;
      }
    },
  
    // Increment view count
    async incrementViewCount(tripId) {
      try {
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
          viewsCount: increment(1)
        });
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    }
  };