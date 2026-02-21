import { useState } from 'react';
import { cmsService } from '../../../lib/cms-service';

interface CmsImageBlockProps {
  value: string;
  onChange: (value: string) => void;
  blockKey: string;
}

export function CmsImageBlock({ value, onChange, blockKey: _blockKey }: CmsImageBlockProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Parse image data
  const parseImageData = () => {
    try {
      const data = JSON.parse(value);
      return {
        url: data.url || '',
        alt: data.alt || '',
        fileName: data.fileName || 'image.jpg',
        width: data.width || 1200,
        height: data.height || 800,
        size: data.size || '1.2 MB',
      };
    } catch {
      return {
        url: value || '',
        alt: '',
        fileName: 'image.jpg',
        width: 1200,
        height: 800,
        size: '1.2 MB',
      };
    }
  };

  const imageData = parseImageData();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const asset = await cmsService.uploadAsset(file, 'images');
      onChange(JSON.stringify({
        url: asset.url,
        alt: '',
        fileName: asset.fileName,
        width: 1200,
        height: 800,
        size: `${(asset.fileSize / 1024 / 1024).toFixed(1)} MB`,
      }));
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    onChange('');
  };

  if (!imageData.url) {
    return (
      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#FF6B00] hover:bg-orange-50/30 transition-all">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-sm text-slate-500">Uploading...</span>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">cloud_upload</span>
            <span className="text-sm font-medium text-slate-500">Click to upload image</span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
          </>
        )}
      </label>
    );
  }

  return (
    <div className="flex items-start gap-6">
      {/* Image preview */}
      <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group/img shrink-0">
        <img
          src={imageData.url}
          alt={imageData.alt || 'Preview'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
          <button className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">zoom_in</span>
            Preview
          </button>
        </div>
      </div>

      {/* Image info */}
      <div className="flex-1 pt-1">
        <p className="text-sm font-bold text-slate-800 mb-1">{imageData.fileName}</p>
        <p className="text-xs text-slate-500 mb-4">
          {imageData.width} x {imageData.height} - {imageData.size}
        </p>
        <div className="flex gap-2">
          <label className="px-4 py-2 text-xs font-bold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {isUploading ? 'Uploading...' : 'Replace Image'}
          </label>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
