import { put, del, list } from "@vercel/blob";

export async function uploadFile(file: File) {
  try {
    const blob = await put(file.name, file, {
      access: 'public',
    });
    
    return {
      url: blob.url,
      pathname: blob.pathname,
      success: true
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function deleteFile(url: string) {
  try {
    await del(url);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}


export async function getFiles() {

    // todo
}
