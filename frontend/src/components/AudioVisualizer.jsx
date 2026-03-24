import React, { useRef, useEffect } from 'react';

/**
 * AudioVisualizer - Real-time audio waveform visualization
 */
function AudioVisualizer({
  audioContext,
  analyser,
  isPlaying,
  width = 400,
  height = 100,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      ctx.fillStyle = "rgb(15, 23, 42)"; // slate-900
      ctx.fillRect(0, 0, width, height);

      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // Gradient color
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, ${isPlaying ? 45 : 30}%)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying || !analyser) {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, width, height]);

  return (
    <div className="bg-slate-900 rounded-lg border border-gray-700 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full"
      />
    </div>
  );
}

export default AudioVisualizer;
