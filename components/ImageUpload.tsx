
import React, { useRef, useState, useEffect } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File | string) => void;
  title: string;
  id: string;
  selectedImageUrl?: string | null;
  children?: React.ReactNode;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, title, id, selectedImageUrl, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-cyan-300 mb-2">{title}</h3>
      <div 
        className="relative aspect-square w-full bg-gray-900/50 border-2 border-dashed border-cyan-500/50 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-cyan-400 hover:bg-gray-900/70 transition-all duration-300 overflow-hidden group"
        onClick={handleBoxClick}
      >
        {selectedImageUrl ? (
          <img src={selectedImageUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p>Click to upload</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-bold text-lg">Change Image</p>
        </div>
        <input
          id={id}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {children}
    </div>
  );
};

export default ImageUpload;
