export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is "data:mime/type;base64,..." - we want just the base64 part
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read blob as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
