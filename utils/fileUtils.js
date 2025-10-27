// Convert a Blob into a base64-encoded string.  This helper is used
// by the Gemini service when sending images to remote models.  It
// returns only the data portion after the comma.

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is "data:mime/type;base64,..." – remove the prefix
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read blob as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}