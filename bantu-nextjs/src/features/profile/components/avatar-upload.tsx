"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface AvatarUploadProps {
  currentImage: string | null;
  name: string;
  onUploaded: (imageUrl: string | null) => void;
}

export function AvatarUpload({ currentImage, name, onUploaded }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        onUploaded(data.image);
        toast.success("Profile photo updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to upload photo");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove photo");

      onUploaded(null);
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    } finally {
      setRemoving(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || removing,
  });

  return (
    <div className="flex items-center gap-6">
      <div
        {...getRootProps()}
        className="group relative cursor-pointer"
      >
        <input {...getInputProps()} />
        <Avatar className="size-20">
          {currentImage && <AvatarImage src={currentImage} alt={name} />}
          <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </div>
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP. Max 5 MB.
        </p>
        {currentImage && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <Trash2 className="mr-1 size-3" />
            )}
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
