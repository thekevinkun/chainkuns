import { createClient } from "@/lib/supabase/client";

export async function uploadImage(
  bucket: string,
  file: File,
  folder?: string,
): Promise<string | null> {
  try {
    const supabase = createClient(); // ← our way of getting the client

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function deleteImage(
  bucket: string,
  filePath: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

export function extractFilePathFromUrl(
  url: string,
  bucket: string,
): string | null {
  try {
    const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
): { isValid: boolean; error?: string } {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPG, PNG, GIF, or WebP.",
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB. Your file is ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB.`,
    };
  }

  return { isValid: true };
}
