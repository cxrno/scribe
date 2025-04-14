'use server'

import { put, del } from "@vercel/blob";
import { mediaType } from "@/app/db/schema";

export type MediaTypeValue = (typeof mediaType.enumValues)[number];

export async function uploadFile(file: File, type: MediaTypeValue): Promise<string | null> {
  try {
    const filename = `${type}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    return blob.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

export async function deleteFile(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

export async function getFile(url: string): Promise<Response | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
    return response;
  } catch (error) {
    console.error("Error getting file:", error);
    return null;
  }
} 