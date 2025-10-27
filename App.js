import React, { useState, useCallback, useRef } from 'react';
import { UploadMode, TagStyle } from './types.js';
import { generateTags } from './services/geminiService.js';
import { UploadIcon, CopyIcon, DownloadIcon, CheckIcon, LoaderIcon } from './components/icons.js';

// The main application component.  This version is a direct port of
// the original App.tsx but with all TypeScript-specific syntax removed.
// It manages state for the upload mode, tag style, selected file,
// generated output and download URL, and orchestrates calls to
// `generateTags` for both single-image and batch ZIP uploads.

export default function App() {
  const [uploadMode, setUploadMode] = useState(UploadMode.Single);
  const [tagStyle, setTagStyle] = useState(TagStyle.Flux);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [output, setOutput] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setOutput('');
    setDownloadUrl(null);
    setIsProcessing(false);
    setError(null);
    setIsCopied(false);
    setProcessingMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = (event) => {
    resetState();
    const file = event.target.files?.[0];
    if (file) {
      if (uploadMode === UploadMode.Single) {
        if (file.type.startsWith('image/')) {
          setSelectedFile(file);
          const previewUrl = URL.createObjectURL(file);
          setImagePreview(previewUrl);
        } else {
          setError('Please upload a valid image file (PNG, JPG, etc.).');
        }
      } else {
        // Batch mode expects a ZIP file
        if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
          setSelectedFile(file);
        } else {
          setError('Please upload a valid ZIP file.');
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setOutput('');
    setDownloadUrl(null);
    if (uploadMode === UploadMode.Single) {
      await handleSingleUpload();
    } else {
      await handleBatchUpload();
    }
    setIsProcessing(false);
    setProcessingMessage('');
  };

  const handleSingleUpload = async () => {
    if (!selectedFile) return;
    setProcessingMessage('Generating tags for your image...');
    try {
      const result = await generateTags(selectedFile, tagStyle);
      if (result && result.startsWith('Error:')) {
        setError(result);
        setOutput('');
      } else {
        setOutput(result);
      }
    } catch (e) {
      setError(`An error occurred: ${e.message || e}`);
    }
  };

  const handleBatchUpload = async () => {
    if (!selectedFile) return;
    try {
      const zip = new JSZip();
      setProcessingMessage('Unpacking your ZIP file...');
      const loadedZip = await zip.loadAsync(selectedFile);
      const imageFiles = Object.values(loadedZip.files).filter(
        (file) => !file.dir && /\.(jpe?g|png|webp)$/i.test(file.name)
      );
      if (imageFiles.length === 0) {
        setError('No valid images found in the ZIP file.');
        return;
      }
      const outputZip = new JSZip();
      let processedCount = 0;
      const tagGenerationPromises = imageFiles.map(async (imageFile) => {
        try {
          const imageBlob = await imageFile.async('blob');
          const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || '';
          const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
          const typedBlob = new Blob([imageBlob], { type: mimeType });
          const tags = await generateTags(typedBlob, tagStyle);
          const filenameWithoutExt = imageFile.name.substring(0, imageFile.name.lastIndexOf('.'));
          if (!tags.startsWith('Error:')) {
            outputZip.file(`${filenameWithoutExt}.txt`, tags);
          }
        } catch (e) {
          console.error(`Failed to process ${imageFile.name}:`, e);
        } finally {
          processedCount++;
          setProcessingMessage(`Processing image ${processedCount} of ${imageFiles.length}...`);
        }
      });
      await Promise.all(tagGenerationPromises);
      setProcessingMessage('Compressing your new ZIP file...');
      const content = await outputZip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      setDownloadUrl(url);
    } catch (e) {
      setError(`Failed to process ZIP file: ${e.message || e}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          DualForge-Tagger
        </h1>
        <p className="text-gray-400 mt-2">Generate AI-powered captions and tags for your images.</p>
      </header>
      <main className="w-full max-w-4xl bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="flex flex-col space-y-6">
            {/* Upload Mode */}
            <div>
              <h3 className="font-semibold mb-3 text-lg text-cyan-300">1. Select Upload Mode</h3>
              <div className="flex space-x-2 bg-gray-900 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setUploadMode(UploadMode.Single);
                    resetState();
                  }}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === UploadMode.Single
                      ? 'bg-cyan-500 text-white shadow'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  Single Image
                </button>
                <button
                  onClick={() => {
                    setUploadMode(UploadMode.Batch);
                    resetState();
                  }}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === UploadMode.Batch
                      ? 'bg-cyan-500 text-white shadow'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  Batch (ZIP)
                </button>
              </div>
            </div>
            {/* Tag Style */}
            <div>
              <h3 className="font-semibold mb-3 text-lg text-cyan-300">2. Choose Tag Style</h3>
              <div className="space-y-3">
                <div
                  onClick={() => setTagStyle(TagStyle.Flux)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    tagStyle === TagStyle.Flux
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-purple-400 bg-gray-900'
                  }`}
                >
                  <h4 className="font-bold">✨ Flux Style</h4>
                  <p className="text-sm text-gray-400 mt-1">Creative, human-like captions.</p>
                </div>
                <div
                  onClick={() => setTagStyle(TagStyle.Illustrious)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    tagStyle === TagStyle.Illustrious
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-purple-400 bg-gray-900'
                  }`}
                >
                  <h4 className="font-bold">🎯 Illustrious Style</h4>
                  <p className="text-sm text-gray-400 mt-1">Comma-separated LoRA training tags.</p>
                </div>
              </div>
            </div>
            {/* File Input */}
            <div>
              <h3 className="font-semibold mb-3 text-lg text-cyan-300">3. Upload Your File</h3>
              <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">
                  <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadMode === UploadMode.Single ? 'PNG, JPG, WEBP' : 'ZIP file with images'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={uploadMode === UploadMode.Single ? 'image/*' : '.zip,application/zip'}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-2 truncate">Selected: {selectedFile.name}</p>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isProcessing}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <LoaderIcon className="animate-spin h-5 w-5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Generate Tags</span>
              )}
            </button>
          </div>
          {/* Preview & Output */}
          <div className="bg-gray-900 p-6 rounded-lg flex flex-col">
            <h3 className="font-semibold mb-4 text-lg text-purple-300">Result</h3>
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            {isProcessing && (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <LoaderIcon className="animate-spin h-10 w-10 text-cyan-400 mb-4" />
                <p className="text-lg font-semibold text-gray-300">Working on it...</p>
                <p className="text-sm text-gray-500 mt-1">{processingMessage}</p>
              </div>
            )}
            {!isProcessing && (
              <div className="flex-grow flex flex-col">
                {uploadMode === UploadMode.Single && imagePreview && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-60 object-contain" />
                  </div>
                )}
                {uploadMode === UploadMode.Batch && !downloadUrl && (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-gray-400">Batch Output</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Generated tags will be available as a downloadable ZIP file here.
                    </p>
                  </div>
                )}
                {output && (
                  <div className="relative bg-gray-800 p-4 rounded-md flex-grow">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{output}</pre>
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      {isCopied ? (
                        <CheckIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <CopyIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
                {downloadUrl && (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-green-900/50 border border-green-700 rounded-lg">
                    <h4 className="text-lg font-bold text-green-300">Success!</h4>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Your ZIP file with tags is ready.</p>
                    <a
                      href={downloadUrl}
                      download={`${selectedFile?.name.replace('.zip', '')}-tags.zip`}
                      className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <DownloadIcon className="h-5 w-5" />
                      <span>Download ZIP</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}