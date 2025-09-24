'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { compressImage, validateImageFile, uploadImageToSupabase } from '@/lib/image-utils';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string | null;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({ onImageUploaded, currentImage, placeholder = 'Upload image', className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Compress image
      const compressedFile = await compressImage(file);

      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);

      // Upload to Supabase
      const timestamp = Date.now();
      const path = `${timestamp}-${compressedFile.name}`;
      const publicUrl = await uploadImageToSupabase(compressedFile, path);

      onImageUploaded(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-2">
        {preview ? (
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
              <Image
                src={preview}
                alt="Preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : placeholder}
          </button>
        )}

        {/* {!preview && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {isUploading ? 'Uploading...' : 'Choose file'}
          </button>
        )} */}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
