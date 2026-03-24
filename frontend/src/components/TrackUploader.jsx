import React, { useRef, useState } from "react";

/**
 * TrackUploader - Component for uploading audio files
 */
function TrackUploader({ trackName, onUpload, isLoading }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file) => {
    if (file && file.type.startsWith("audio/")) {
      setFileName(file.name);
      await onUpload(file);
    } else {
      alert("Please select an audio file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400"
      }`}
    >
      <div className="text-4xl mb-3">🎵</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{trackName}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {fileName || "Drag and drop an audio file or click to browse"}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Browse Files"}
      </button>

      {fileName && (
        <div className="mt-3">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✓ {fileName}
          </span>
        </div>
      )}
    </div>
  );
}

export default TrackUploader;
