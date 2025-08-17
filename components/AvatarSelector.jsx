// components/AvatarSelector.jsx
'use client'
import { useState } from 'react';

const GOOGLE_AVATAR_OPTIONS = [
  'https://www.gstatic.com/webp/gallery/1.jpg',
  'https://www.gstatic.com/webp/gallery/2.jpg',
  'https://www.gstatic.com/webp/gallery/3.jpg',
  'https://www.gstatic.com/webp/gallery/4.jpg',
  'https://www.gstatic.com/webp/gallery/5.jpg'
];

export const AvatarSelector = ({ onSelect }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  return (
    <div className="my-4">
      <h3 className="text-me font-medium mb-2">Choose your avatar:</h3>
      <div className="flex gap-3 flex-wrap">
        {GOOGLE_AVATAR_OPTIONS.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            className={`w-14 h-14 rounded-full cursor-pointer border-2 ${
              selectedAvatar === avatar ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => {
              setSelectedAvatar(avatar);
              onSelect(avatar);
            }}
            alt={`Avatar ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};