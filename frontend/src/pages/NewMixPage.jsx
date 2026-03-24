import React, { useState, useRef, useCallback, useEffect } from "react";
import SavePublishDialog from "../components/SavePublishDialog";
import TrackUploader from "../components/TrackUploader";
import VocalRecorder from "../components/VocalRecorder";
import MixerControls from "../components/MixerControls";
import AudioVisualizer from "../components/AudioVisualizer";
import mixService from "../services/mixService";
import { AudioMixer } from "../services/audioMixer";

function NewMixPage() {
  const mixerRef = useRef(null);
  const analyserRef = useRef(null);
  const [step, setStep] = useState(1);
  const [backingTrackBuffer, setBackingTrackBuffer] = useState(null);
  const [vocalBuffer, setVocalBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  useEffect(() => {
    mixerRef.current = new AudioMixer();
    return () => {
      if (mixerRef.current) mixerRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !mixerRef.current) return;
    const interval = setInterval(() => {
      setCurrentTime(mixerRef.current.getCurrentTime());
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (mixerRef.current?.audioContext && !analyserRef.current) {
      analyserRef.current = mixerRef.current.audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      mixerRef.current.masterGain.connect(analyserRef.current);
    }
  }, []);

  const handleBackingTrackUpload = useCallback(async (file) => {
    setIsLoadingTrack(true);
    try {
      await mixerRef.current.init();
      const buffer = await mixerRef.current.loadAudioFile(file);
      setBackingTrackBuffer(buffer);
      await mixerRef.current.addTrack("backing", buffer, 1.0);
      setDuration(buffer.duration);
      setStep(2);
    } catch (error) {
      alert(`Error loading backing track: ${error.message}`);
    } finally {
      setIsLoadingTrack(false);
    }
  }, []);

  const handleVocalRecording = useCallback(async (blob) => {
    try {
      await mixerRef.current.init();
      const buffer = await mixerRef.current.loadAudioFile(blob);
      setVocalBuffer(buffer);
      await mixerRef.current.addTrack("vocal", buffer, 1.0);
      setDuration(Math.max(duration, buffer.duration));
      setStep(3);
    } catch (error) {
      alert(`Error processing vocal recording: ${error.message}`);
    }
  }, [duration]);

  const handlePlay = useCallback(() => {
    if (mixerRef.current && duration > 0) {
      mixerRef.current.play();
      setIsPlaying(true);
    }
  }, [duration]);

  const handlePause = useCallback(() => {
    if (mixerRef.current) {
      mixerRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    if (mixerRef.current) {
      mixerRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const handleVolumeChange = useCallback((trackId, volume) => {
    if (mixerRef.current) mixerRef.current.setTrackVolume(trackId, volume);
  }, []);

  const handleSeek = useCallback((time) => {
    if (mixerRef.current) {
      mixerRef.current.seek(time);
      setCurrentTime(time);
    }
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const filename = `mix-${Date.now()}.wav`;
      await mixerRef.current.exportAudio(filename);
      setStep(4);
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleSaveMix = useCallback(async (formData) => {
    try {
      const mixPayload = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        genre: formData.genre,
        duration: Math.ceil(duration),
        backingTrackVolume: mixerRef.current.getTrackVolume("backing"),
        vocalVolume: mixerRef.current.getTrackVolume("vocal"),
      };

      if (formData.action === "export") {
        alert("Mix exported! Check your downloads folder.");
      } else if (formData.action === "publish") {
        const mix = await mixService.createMix(mixPayload);
        await mixService.publishMix(mix._id);
        alert("✅ Mix published to community!");
        setStep(1);
        if (mixerRef.current) mixerRef.current.clear();
        setBackingTrackBuffer(null);
        setVocalBuffer(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      } else {
        await mixService.createMix(mixPayload);
        alert("✅ Mix saved to library!");
        setStep(1);
        if (mixerRef.current) mixerRef.current.clear();
        setBackingTrackBuffer(null);
        setVocalBuffer(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }
      setShowSaveDialog(false);
    } catch (error) {
      alert("Error: " + error.message);
    }
  }, [duration]);

  const tracks = [
    ...(backingTrackBuffer ? [{ id: "backing", name: "Backing Track", volume: 1.0 }] : []),
    ...(vocalBuffer ? [{ id: "vocal", name: "Vocal Recording", volume: 1.0 }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Audio Mixer</h1>
          <p className="text-gray-600 mb-6">Mix backing tracks with your vocal recordings</p>
          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            {["Upload", "Record", "Mix", "Save"].map((stepName, idx) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${idx < step ? "bg-green-500 text-white" : idx === step - 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"}`}>{idx < step ? "✓" : idx + 1}</div>
                <span className={`ml-2 text-sm font-medium ${idx < step ? "text-green-600" : idx === step - 1 ? "text-blue-600" : "text-gray-500"}`}>{stepName}</span>
                {idx < 3 && <div className={`ml-4 w-12 h-1 ${idx < step - 1 ? "bg-green-500" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
        </div>

        {step >= 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
              <h2 className="text-2xl font-bold text-gray-900">Upload Backing Track</h2>
            </div>
            {!backingTrackBuffer ? (
              <TrackUploader trackName="Backing Track (Instrumental)" onUpload={handleBackingTrackUpload} isLoading={isLoadingTrack} />
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">✓ Backing track loaded ({duration.toFixed(1)}s)</p>
                <button onClick={() => { setBackingTrackBuffer(null); mixerRef.current?.removeTrack("backing"); setStep(1); }} className="mt-2 text-sm text-green-600 hover:text-green-700 underline">Change track</button>
              </div>
            )}
          </div>
        )}

        {step >= 2 && backingTrackBuffer && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">2</div>
              <h2 className="text-2xl font-bold text-gray-900">Record Vocals</h2>
            </div>
            {!vocalBuffer ? (
              <VocalRecorder onRecordingComplete={handleVocalRecording} isLoading={false} />
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">✓ Vocal recording ready ({vocalBuffer.duration.toFixed(1)}s)</p>
                <button onClick={() => { setVocalBuffer(null); mixerRef.current?.removeTrack("vocal"); setStep(2); }} className="mt-2 text-sm text-green-600 hover:text-green-700 underline">Re-record</button>
              </div>
            )}
          </div>
        )}

        {step >= 3 && backingTrackBuffer && vocalBuffer && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">3</div>
              <h2 className="text-2xl font-bold text-gray-900">Mix & Master</h2>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Audio Meter</p>
              <AudioVisualizer audioContext={mixerRef.current?.audioContext} analyser={analyserRef.current} isPlaying={isPlaying} width={500} height={120} />
            </div>
            <MixerControls tracks={tracks} isPlaying={isPlaying} currentTime={currentTime} duration={duration} onPlay={handlePlay} onPause={handlePause} onStop={handleStop} onVolumeChange={handleVolumeChange} onSeek={handleSeek} onExport={handleExport} isExporting={isExporting} />
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">🎧 <strong>Tip:</strong> Use headphones while mixing to prevent feedback and monitor audio levels properly.</p>
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">4</div>
              <h2 className="text-2xl font-bold text-gray-900">Save Mix</h2>
            </div>
            <button onClick={() => setShowSaveDialog(true)} className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition">📁 Save or Publish Mix</button>
            <button onClick={() => { setStep(3); handleStop(); }} className="w-full mt-3 px-6 py-3 text-blue-500 hover:bg-blue-50 border border-blue-300 font-semibold rounded-lg transition">← Back to Mixing</button>
          </div>
        )}

        {step < 3 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900 mb-4">{backingTrackBuffer && !vocalBuffer ? "🎤 Record your vocals to proceed to mixing" : "🎵 Upload a backing track to get started"}</p>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <SavePublishDialog onSave={handleSaveMix} onCancel={() => setShowSaveDialog(false)} />
      )}
    </div>
  );
}

export default NewMixPage;
