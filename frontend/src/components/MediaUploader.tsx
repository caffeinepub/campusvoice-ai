import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { type MediaItem } from '../lib/localComplaintStore';
import { Image, Video, Mic, X, Play, FileAudio } from 'lucide-react';

interface MediaUploaderProps {
  mediaItems: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxItems?: number;
}

function generateId() {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MediaUploader({ mediaItems, onChange, maxItems = 20 }: MediaUploaderProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null, type: 'image' | 'video' | 'audio') => {
    if (!files) return;
    const remaining = maxItems - mediaItems.length;
    const toProcess = Array.from(files).slice(0, remaining);

    const newItems: MediaItem[] = await Promise.all(
      toProcess.map(async (file) => ({
        id: generateId(),
        type,
        name: file.name,
        dataUrl: await fileToDataUrl(file),
        size: file.size,
      }))
    );

    onChange([...mediaItems, ...newItems]);
  };

  const removeItem = (id: string) => {
    onChange(mediaItems.filter((m) => m.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-3">
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => photoRef.current?.click()}
          disabled={mediaItems.length >= maxItems}
        >
          <Image className="w-4 h-4" />
          Add Photos
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => videoRef.current?.click()}
          disabled={mediaItems.length >= maxItems}
        >
          <Video className="w-4 h-4" />
          Add Videos
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => audioRef.current?.click()}
          disabled={mediaItems.length >= maxItems}
        >
          <Mic className="w-4 h-4" />
          Add Voice Notes
        </Button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'image')}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'video')}
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'audio')}
      />

      {/* Preview grid */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square"
            >
              {item.type === 'image' ? (
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : item.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                  <Play className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center truncate w-full">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatSize(item.size)}</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                  <FileAudio className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center truncate w-full">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatSize(item.size)}</span>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {mediaItems.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {mediaItems.length} file{mediaItems.length !== 1 ? 's' : ''} attached
          {mediaItems.length >= maxItems && ' (maximum reached)'}
        </p>
      )}
    </div>
  );
}
