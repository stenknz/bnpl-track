"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SafeImage } from "./SafeImage";

interface LogoUploaderProps {
  currentLogo?: string | null;
  onUpload: (path: string) => void;
  type?: string;
}

export function LogoUploader({ currentLogo, onUpload, type }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogo || null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (type) formData.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setPreview(data.path);
      onUpload(data.path);
    } catch (e) {
      console.error("LogoUploader error:", e);
      alert("Upload failed. Check console for details.");
    }
    setUploading(false);
  }, [onUpload, type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".svg"] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
        isDragActive
          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
          : "border-neutral-300 dark:border-neutral-700 hover:border-brand-400"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="text-sm text-neutral-500">Uploading...</div>
      ) : preview ? (
        <SafeImage src={preview} alt="Logo" className="h-12 object-contain" fallback={<div className="text-sm text-neutral-500">Failed to load</div>} />
      ) : (
        <>
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-neutral-500">
            {isDragActive ? "Drop logo here" : "Drag or click to upload logo"}
          </p>
        </>
      )}
    </div>
  );
}
