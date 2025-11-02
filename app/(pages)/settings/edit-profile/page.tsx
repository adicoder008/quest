"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Camera, X, Loader2 } from 'lucide-react';
import NavBar from '@/components/Nav';
import Footer from '@/components/phoneComponents/Footer';
import Image from 'next/image';

interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  backgroundURL?: string;
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

const EditProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  // Form data
  const [formData, setFormData] = useState<UserData>({
    displayName: '',
    email: '',
    photoURL: '',
    backgroundURL: '',
    title: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  });

  // Preview URLs for images
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setFormData({
          displayName: data.displayName || '',
          email: data.email || '',
          photoURL: data.photoURL || '',
          backgroundURL: data.backgroundURL || '',
          title: data.title || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          twitter: data.twitter || '',
          instagram: data.instagram || '',
          linkedin: data.linkedin || '',
        });
        setProfilePreview(data.photoURL || '');
        setBackgroundPreview(data.backgroundURL || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingProfile(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image. Please try again.');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleBackgroundImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingBackground(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `background-images/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, backgroundURL: downloadURL }));
    } catch (error) {
      console.error('Error uploading background image:', error);
      alert('Failed to upload background image. Please try again.');
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleRemoveProfileImage = () => {
    setFormData(prev => ({ ...prev, photoURL: '' }));
    setProfilePreview('');
  };

  const handleRemoveBackgroundImage = () => {
    setFormData(prev => ({ ...prev, backgroundURL: '' }));
    setBackgroundPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        backgroundURL: formData.backgroundURL,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        updatedAt: new Date(),
      });

      alert('Profile updated successfully!');
      router.push('/account');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#121212] flex items-center justify-center'>
        <div className='w-16 h-16 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#121212]'>
      <div className="hidden lg:block">
        <NavBar user={user} onSignOut={() => {}} />
      </div>

      <div className='lg:ml-[280px]'>
        <div className='max-w-4xl mx-auto'>
          
          {/* Header */}
          <div className='sticky top-0 z-10 bg-[#121212] border-b border-gray-700'>
            <div className='flex items-center justify-between px-5 lg:px-8 py-4'>
              <div className='flex items-center gap-4'>
                <button 
                  onClick={() => router.back()}
                  className='text-white hover:text-[#EA6100] transition-colors'
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className='text-2xl font-bold text-white'>Edit Profile</h1>
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className='bg-[#EA6100] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className='animate-spin' />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='px-5 lg:px-8 py-8 pb-20 lg:pb-8'>
            
            {/* Background Image */}
            <div className='mb-8'>
              <label className='block text-white font-semibold mb-3'>Background Image</label>
              <div className='relative h-48 lg:h-64 bg-[#1a1a1a] rounded-xl overflow-hidden group'>
                {backgroundPreview ? (
                  <>
                    <img
                      src={backgroundPreview}
                      alt='Background'
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
                      <label className='bg-[#EA6100] text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-[#f5c094] transition-colors flex items-center gap-2'>
                        <Camera size={18} />
                        <span>Change</span>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={handleBackgroundImageChange}
                          className='hidden'
                          disabled={uploadingBackground}
                        />
                      </label>
                      <button
                        type='button'
                        onClick={handleRemoveBackgroundImage}
                        className='bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2'
                      >
                        <X size={18} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <label className='w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#292929] transition-colors'>
                    <Camera size={48} className='text-gray-400 mb-2' />
                    <span className='text-gray-400 font-medium'>Upload Background Image</span>
                    <span className='text-gray-500 text-sm mt-1'>Recommended: 1200x400px</span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleBackgroundImageChange}
                      className='hidden'
                      disabled={uploadingBackground}
                    />
                  </label>
                )}
                {uploadingBackground && (
                  <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                    <Loader2 size={48} className='text-[#EA6100] animate-spin' />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Image */}
            <div className='mb-8'>
              <label className='block text-white font-semibold mb-3'>Profile Picture</label>
              <div className='flex items-center gap-6'>
                <div className='relative w-32 h-32 bg-[#1a1a1a] rounded-full overflow-hidden group'>
                  {profilePreview ? (
                    <>
                      <img
                        src={profilePreview}
                        alt='Profile'
                        className='w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <label className='bg-[#EA6100] text-black p-2 rounded-full cursor-pointer hover:bg-[#f5c094] transition-colors'>
                          <Camera size={20} />
                          <input
                            type='file'
                            accept='image/*'
                            onChange={handleProfileImageChange}
                            className='hidden'
                            disabled={uploadingProfile}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className='w-full h-full flex items-center justify-center cursor-pointer hover:bg-[#292929] transition-colors'>
                      <Camera size={32} className='text-gray-400' />
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleProfileImageChange}
                        className='hidden'
                        disabled={uploadingProfile}
                      />
                    </label>
                  )}
                  {uploadingProfile && (
                    <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                      <Loader2 size={32} className='text-[#EA6100] animate-spin' />
                    </div>
                  )}
                </div>
                <div>
                  <p className='text-white font-medium mb-1'>Profile Photo</p>
                  <p className='text-gray-400 text-sm mb-3'>Recommended: Square image, at least 400x400px</p>
                  <div className='flex gap-2'>
                    <label className='bg-[#292929] text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-[#3a3a3a] transition-colors'>
                      Upload Photo
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleProfileImageChange}
                        className='hidden'
                        disabled={uploadingProfile}
                      />
                    </label>
                    {profilePreview && (
                      <button
                        type='button'
                        onClick={handleRemoveProfileImage}
                        className='bg-[#292929] text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-[#3a3a3a] transition-colors'
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className='bg-[#1a1a1a] rounded-xl p-6 mb-6'>
              <h2 className='text-xl font-bold text-white mb-4'>Basic Information</h2>
              
              <div className='space-y-4'>
                <div>
                  <label className='block text-white font-medium mb-2'>Display Name *</label>
                  <input
                    type='text'
                    name='displayName'
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                    className='w-full bg-[#292929] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#EA6100] focus:outline-none transition-colors'
                    placeholder='Your display name'
                  />
                  <p className='text-gray-500 text-sm mt-1'>{formData.displayName.length}/50 characters</p>
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>Email Address</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    disabled
                    className='w-full bg-[#1f1f1f] text-gray-500 px-4 py-3 rounded-lg border border-gray-700 cursor-not-allowed'
                  />
                  <p className='text-gray-500 text-sm mt-1'>Email cannot be changed</p>
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>Title / Tagline</label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={60}
                    className='w-full bg-[#292929] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#EA6100] focus:outline-none transition-colors'
                    placeholder='e.g., Adventure Seeker, Travel Photographer'
                  />
                  <p className='text-gray-500 text-sm mt-1'>{formData.title.length}/60 characters</p>
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>Bio</label>
                  <textarea
                    name='bio'
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={300}
                    rows={4}
                    className='w-full bg-[#292929] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#EA6100] focus:outline-none transition-colors resize-none'
                    placeholder='Tell us about yourself...'
                  />
                  <p className='text-gray-500 text-sm mt-1'>{formData.bio.length}/300 characters</p>
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>Location</label>
                  <input
                    type='text'
                    name='location'
                    value={formData.location}
                    onChange={handleInputChange}
                    maxLength={50}
                    className='w-full bg-[#292929] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#EA6100] focus:outline-none transition-colors'
                    placeholder='e.g., San Francisco, CA'
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className='bg-[#1a1a1a] rounded-xl p-6 mb-6'>
              <h2 className='text-xl font-bold text-white mb-4'>Social Links</h2>
              
              <div className='space-y-4'>
                <div>
                  <label className='block text-white font-medium mb-2'>Website</label>
                  <input
                    type='url'
                    name='website'
                    value={formData.website}
                    onChange={handleInputChange}
                    className='w-full bg-[#292929] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#EA6100] focus:outline-none transition-colors'
                    placeholder='https://yourwebsite.com'
                  />
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>Twitter</label>
                  <div className='flex items-center bg-[#292929] rounded-lg border border-gray-700 focus-within:border-[#EA6100]'>
                    <span className='text-gray-400 px-4'>@</span>
                    <input
                      type='text'
                      name='twitter'
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className='flex-1 bg-transparent text-white py-3 pr-4 focus:outline-none'
                      placeholder='username'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>Instagram</label>
                  <div className='flex items-center bg-[#292929] rounded-lg border border-gray-700 focus-within:border-[#EA6100]'>
                    <span className='text-gray-400 px-4'>@</span>
                    <input
                      type='text'
                      name='instagram'
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className='flex-1 bg-transparent text-white py-3 pr-4 focus:outline-none'
                      placeholder='username'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-white font-medium mb-2'>LinkedIn</label>
                  <input
                    type='url'
                    name='linkedin'
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className='w-full bg-[#292929] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#EA6100] focus:outline-none transition-colors'
                    placeholder='https://linkedin.com/in/username'
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <button
                type='button'
                onClick={() => router.back()}
                className='flex-1 bg-[#292929] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3a3a3a] transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={saving}
                className='flex-1 bg-[#EA6100] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#f5c094] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className='animate-spin' />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>

          <div className='lg:hidden'>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;