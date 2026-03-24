import React, { useEffect, useState, useCallback } from 'react';

/**
 * MixerControls - Volume faders and playback controls
 */
function MixerControls({
  tracks,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onSeek,
  onExport,
  isExporting,
}) {
  const [volumes, setVolumes] = useState({});

  useEffect(() => {
    // Initialize volumes
    const initialVolumes = {};
    tracks.forEach((track) => {
      initialVolumes[track.id] = track.volume || 1.0;
    });
    setVolumes(initialVolumes);
  }, [tracks]);

  const handleVolumeChange = useCallback(
    (trackId, newVolume) => {
      setVolumes({ ...volumes, [trackId]: newVolume });
      onVolumeChange(trackId, newVolume);
    },
    [volumes, onVolumeChange]
  );

  const formatTime = useCallback((seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 space-y-6">
      {/* Playback Controls */}
      <div className="space-y-4">
        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime || 0}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Transport Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onPlay}
            disabled={!duration || isPlaying}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            ▶ Play
          </button>
          <button
            onClick={onPause}
            disabled={!isPlaying}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            ⏸ Pause
          </button>
          <button
            onClick={onStop}
            disabled={!duration}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            ⏹ Stop
          </button>
          <button
            onClick={onExport}
            disabled={!duration || isExporting}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {isExporting ? '⏳ Exporting...' : '⬇ Export'}
          </button>
        </div>
      </div>

      {/* Volume Faders */}
      {tracks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300">Track Volumes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <div key={track.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">
                    {track.name}
                  </label>
                  <span className="text-sm text-gray-400">
                    {(volumes[track.id] || 1.0).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={volumes[track.id] || 1.0}
                  onChange={(e) =>
                    handleVolumeChange(track.id, parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mute</span>
                  <span>Normal</span>
                  <span>Boost</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900 rounded text-blue-100 text-sm">
        💡 <strong>Tip:</strong> Adjust volumes to balance your backing track with
        vocal recording. Use headphones to prevent feedback.
      </div>
    </div>
  );
}

export default MixerControls;
