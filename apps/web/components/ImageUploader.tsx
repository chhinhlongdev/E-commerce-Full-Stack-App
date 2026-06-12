'use client';
import { useState, useRef, useCallback } from 'react';

interface Props {
  value: string[];                          // current image URLs
  onChange: (urls: string[]) => void;       // called with updated URL list
  maxImages?: number;
}

export default function ImageUploader({ value = [], onChange, maxImages = 5 }: Props) {
  const [urlInput,   setUrlInput]   = useState('');
  const [dragOver,   setDragOver]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── File handling ──────────────────────────────────────
  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || value.length >= maxImages) return;
    setUploading(true);

    const previews: string[] = [];
    const toUpload: File[] = Array.from(files).slice(0, maxImages - value.length);

    // Show local preview immediately
    await Promise.all(toUpload.map(file => new Promise<void>(res => {
      const reader = new FileReader();
      reader.onload = e => { previews.push(e.target?.result as string); res(); };
      reader.readAsDataURL(file);
    })));
    onChange([...value, ...previews]);

    // Upload to backend → get Cloudinary URLs
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append('image', file);
        const token = localStorage.getItem('token') || '';
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/upload-image`,
          { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }
        );
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      }
      // replace base64 previews with real URLs
      const kept = value.filter(u => !u.startsWith('data:'));
      onChange([...kept, ...uploaded]);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  }, [value, maxImages, onChange]);

  // ── URL paste ──────────────────────────────────────────
  const addUrl = () => {
    const url = urlInput.trim();
    if (!url || value.includes(url) || value.length >= maxImages) return;
    onChange([...value, url]);
    setUrlInput('');
  };

  const removeImage = (idx: number) =>
    onChange(value.filter((_, i) => i !== idx));

  // ── Drag & drop ────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const canAdd = value.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
        {(['file', 'url'] as const).map(m => (
          <button key={m} type="button" onClick={() => setUploadMode(m)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition
              ${uploadMode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {m === 'file' ? '📁 Upload File' : '🔗 Paste URL'}
          </button>
        ))}
      </div>

      {/* File upload zone */}
      {uploadMode === 'file' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => canAdd && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
            ${dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'}
            ${!canAdd ? 'opacity-40 cursor-not-allowed' : ''}`}>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => processFiles(e.target.files)} />
          {uploading ? (
            <p className="text-blue-400 text-sm">⏳ Uploading to Cloudinary...</p>
          ) : (
            <>
              <p className="text-3xl mb-2">🖼</p>
              <p className="text-gray-400 text-sm">
                {canAdd ? 'Drag & drop images or click to browse' : `Max ${maxImages} images reached`}
              </p>
              <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP — max 5MB each</p>
            </>
          )}
        </div>
      )}

      {/* URL input */}
      {uploadMode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            disabled={!canAdd}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button type="button" onClick={addUrl} disabled={!urlInput.trim() || !canAdd}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            Add
          </button>
        </div>
      )}

      {/* Image previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20">
              <img src={url} alt={`img-${idx}`}
                className="w-20 h-20 object-cover rounded-xl border border-gray-700" />
              {/* Primary badge */}
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
              {/* Remove button */}
              <button type="button" onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex shadow">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-600 text-xs">{value.length}/{maxImages} images — first image is the main product image</p>
    </div>
  );
}
