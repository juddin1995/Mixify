import React, { useRef, useState, useCallback } from 'react';

/**
 * VocalRecorder - Component for recording audio via microphone
 */
function VocalRecorder({ onRecordingComplete, isLoading }) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('0:00');
  const [hasRecording, setHasRecording] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        setHasRecording(true);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setHasRecording(false);
      startTimeRef.current = Date.now();

      // Update timer
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setRecordingTime(formatTime(elapsed));
      }, 100);
    } catch (error) {
      alert(`Microphone access denied: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    setHasRecording(false);
    audioChunksRef.current = [];
    setRecordingTime('0:00');
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
      <div className="text-4xl mb-3 text-center">🎤</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Record Vocals
      </h3>
      <p className="text-sm text-gray-600 mb-6 text-center">
        {hasRecording ? '✓ Recording ready to mix' : 'Record your vocal performance'}
      </p>

      {isRecording && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-900 font-semibold">Recording: {recordingTime}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isLoading}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            🔴 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition font-medium"
          >
            ⏹ Stop Recording
          </button>
        )}

        {hasRecording && !isRecording && (
          <button
            onClick={clearRecording}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {hasRecording && (
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✓ Recording ready ({recordingTime})
          </span>
        </div>
      )}
    </div>
  );
}

export default VocalRecorder;
