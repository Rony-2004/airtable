const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AttachmentFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Upload files for Airtable attachments
export const uploadFiles = async (files: File[]): Promise<AttachmentFile[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/upload/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Upload failed');
    }

    const result = await response.json();
    return result.files;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
