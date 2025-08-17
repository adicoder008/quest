import React, { useState } from 'react';
import { FiCopy, FiX, FiShare2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, questId }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/quest/${questId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Share Quest</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 outline-none text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 flex items-center gap-2"
            >
              <FiCopy size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {/* Social sharing buttons */}
            <button className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100">
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </div>
              <span className="text-xs mt-1">Twitter</span>
            </button>
            
            {/* Add more social buttons as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;