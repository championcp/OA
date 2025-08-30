import React, { useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import ShareDialog from './ShareDialog';

const ShareButton = ({ reportId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50"
        aria-label="分享报表"
      >
        <ShareIcon className="w-6 h-6" />
      </button>
      
      <ShareDialog 
        reportId={reportId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default ShareButton;