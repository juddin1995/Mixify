/**
 * AudioMixer - Web Audio API mixing engine
 * Handles loading, mixing, and exporting audio tracks
 */

export class AudioMixer {
  constructor() {
    this.audioContext = null;
    this.tracks = {}; // { trackId: { source, gainNode, buffer, data } }
    this.masterGain = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.startTime = 0;
    this.pausedTime = 0;
  }

  /**
   * Initialize the Web Audio Context
   */
  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.8; // Prevent clipping
    }
    return this.audioContext;
  }

  /**
   * Load an audio file and return buffer
   */
  async loadAudioFile(file) {
    if (!this.audioContext) await this.init();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (error) {
          reject(new Error(`Failed to decode audio: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Add a track to the mixer
   */
  async addTrack(trackId, audioBuffer, volume = 1.0) {
    if (!this.audioContext) await this.init();

    // Create gain node for this track
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.masterGain);

    // Store track info
    this.tracks[trackId] = {
      buffer: audioBuffer,
      gainNode,
      source: null,
      isPlaying: false,
      volume,
    };

    // Update duration to the longest track
    this.duration = Math.max(this.duration, audioBuffer.duration);

    return {
      id: trackId,
      duration: audioBuffer.duration,
    };
  }

  /**
   * Set volume for a specific track
   */
  setTrackVolume(trackId, volume) {
    if (this.tracks[trackId]) {
      this.tracks[trackId].volume = volume;
      this.tracks[trackId].gainNode.gain.value = Math.max(0, Math.min(2, volume)); // Clamp 0-2
    }
  }

  /**
   * Get current volume of a track
   */
  getTrackVolume(trackId) {
    return this.tracks[trackId]?.volume || 0;
  }

  /**
   * Play all tracks
   */
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime - this.pausedTime;

    Object.entries(this.tracks).forEach(([trackId, track]) => {
      if (track.buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = track.buffer;
        source.connect(track.gainNode);

        // Start from pausedTime
        source.start(0, this.pausedTime);
        track.source = source;
        track.isPlaying = true;
      }
    });
  }

  /**
   * Pause playback (can resume from same position)
   */
  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.pausedTime = this.audioContext.currentTime - this.startTime;

    Object.values(this.tracks).forEach((track) => {
      if (track.source) {
        track.source.stop();
        track.isPlaying = false;
      }
    });
  }

  /**
   * Stop playback and reset to beginning
   */
  stop() {
    this.pause();
    this.pausedTime = 0;
  }

  /**
   * Get current playback position in seconds
   */
  getCurrentTime() {
    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime;
    }
    return this.pausedTime;
  }

  /**
   * Seek to a specific time
   */
  seek(time) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();

    this.pausedTime = Math.max(0, Math.min(time, this.duration));

    if (wasPlaying) this.play();
  }

  /**
   * Export the mixed audio as a WAV file
   */
  async exportAudio(filename = 'mix.wav') {
    // Stop playback
    this.stop();

    // Create offline context for rendering
    const renderContext = new OfflineAudioContext(
      2,
      this.audioContext.sampleRate * this.duration,
      this.audioContext.sampleRate
    );

    // Create master gain for offline rendering
    const offlineMasterGain = renderContext.createGain();
    offlineMasterGain.gain.value = 0.8;
    offlineMasterGain.connect(renderContext.destination);

    // Re-create all tracks in offline context
    Object.entries(this.tracks).forEach(([, track]) => {
      if (track.buffer) {
        const gainNode = renderContext.createGain();
        gainNode.gain.value = track.volume;
        gainNode.connect(offlineMasterGain);

        const source = renderContext.createBufferSource();
        source.buffer = track.buffer;
        source.connect(gainNode);
        source.start(0);
      }
    });

    // Render offline
    const renderedBuffer = await renderContext.startRendering();

    // Convert to WAV
    const wavData = this.encodeWAV(renderedBuffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });

    // Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return blob;
  }

  /**
   * Encode AudioBuffer to WAV format
   */
  encodeWAV(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const channelData = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }

    const interleaved = this.interleaveChannels(channelData);
    const dataLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Audio data
    let offset = 44;
    const volume = 0.8;
    for (let i = 0; i < interleaved.length; i++) {
      view.setInt16(offset, interleaved[i] * volume * 0x7fff, true);
      offset += 2;
    }

    return new Uint8Array(buffer);
  }

  /**
   * Interleave channel data for WAV encoding
   */
  interleaveChannels(channelData) {
    const length = channelData[0].length * channelData.length;
    const result = new Float32Array(length);
    let index = 0;
    const channelLength = channelData[0].length;

    for (let sample = 0; sample < channelLength; sample++) {
      for (let channel = 0; channel < channelData.length; channel++) {
        result[index++] = channelData[channel][sample];
      }
    }

    return result;
  }

  /**
   * Remove a track
   */
  removeTrack(trackId) {
    const track = this.tracks[trackId];
    if (track) {
      if (track.isPlaying && track.source) {
        track.source.stop();
      }
      delete this.tracks[trackId];
    }
  }

  /**
   * Get all tracks
   */
  getTracks() {
    return Object.keys(this.tracks);
  }

  /**
   * Clear all tracks
   */
  clear() {
    this.stop();
    Object.keys(this.tracks).forEach((trackId) => {
      this.removeTrack(trackId);
    });
    this.duration = 0;
  }
}

const audioMixer = new AudioMixer();
export default audioMixer;
