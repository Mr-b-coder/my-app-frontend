import axios from 'axios';
import { CoverCalculations } from '@shared/types';

const API_BASE_URL = 'http://localhost:3001';

// CHANGED: The function will now return an object with the blob and the filename
export const downloadFilePackage = async (
  packageType: 'all' | 'cover' | 'interior',
  calculations: CoverCalculations
): Promise<{ blob: Blob; filename: string }> => {
  const payload = { packageType, calculations };
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-package`, payload, {
      responseType: 'blob',
    });

    // NEW: Extract filename from the 'content-disposition' header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'package.zip'; // A sensible default
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    const blob = new Blob([response.data], { type: 'application/zip' });
    return { blob, filename }; // Return both
    
  } catch (error) {
    console.error(`Error fetching package "${packageType}":`, error);
    if (axios.isAxiosError(error) && error.response) {
      const errorBlob = error.response.data as Blob;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || "An unknown server error occurred.");
      } catch (e) {
        throw new Error(`The server had an issue (${error.response.status}), but the error response was unclear.`);
      }
    }
    throw new Error("Could not connect to the backend. Is it running?");
  }
};