import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const compressAndUploadImage = async (
  file: File,
  path: string,
  uid: string
): Promise<string> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };
  
  const compressedFile = await imageCompression(file, options);
  const storageRef = ref(storage, `${path}/${uid}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, compressedFile);
  return await getDownloadURL(storageRef);
};

export const generateThumbnail = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 400,
    useWebWorker: true
  };
  return await imageCompression(file, options);
};