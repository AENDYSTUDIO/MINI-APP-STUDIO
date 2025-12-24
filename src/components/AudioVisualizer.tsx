import { useRef, useEffect, useState } from "react";

export type VisualizerStyle = "bars" | "wave" | "circle";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  color?: string;
  style?: VisualizerStyle;
  size?: "small" | "large";
}

const AudioVisualizer = ({ 
  audioElement, 
  isPlaying, 
  color = "hsl(var(--primary))",
  style = "bars",
  size = "small"
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const canvasWidth = size === "large" ? 400 : 160;
  const canvasHeight = size === "large" ? 200 : 32;

  useEffect(() => {
    if (!audioElement || isInitialized) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = style === "wave" ? 256 : 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;

      setIsInitialized(true);
    } catch (error) {
      console.log("Audio visualizer initialization error:", error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, isInitialized, style]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawBars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteFrequencyData(dataArray);

      const barCount = size === "large" ? 32 : 16;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = isPlaying ? dataArray[dataIndex] : 10;
        const barHeight = Math.max(4, (value / 255) * canvas.height);
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        ctx.globalAlpha = isPlaying ? 0.5 + (barHeight / canvas.height) * 0.5 : 0.3;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      ctx.globalAlpha = 1;
    };

    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = size === "large" ? 3 : 2;
      ctx.strokeStyle = color;
      ctx.globalAlpha = isPlaying ? 1 : 0.3;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawCircle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteFrequencyData(dataArray);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = size === "large" ? 60 : 10;
      const barCount = size === "large" ? 64 : 32;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = isPlaying ? dataArray[dataIndex] : 20;
        const barHeight = (value / 255) * (size === "large" ? 40 : 12);
        
        const angle = (i / barCount) * Math.PI * 2;
        const innerRadius = baseRadius;
        const outerRadius = baseRadius + barHeight;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = size === "large" ? 3 : 2;
        ctx.globalAlpha = isPlaying ? 0.5 + (barHeight / (size === "large" ? 40 : 12)) * 0.5 : 0.3;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      if (style === "bars") {
        drawBars();
      } else if (style === "wave") {
        drawWave();
      } else if (style === "circle") {
        drawCircle();
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isPlaying && audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, color, style, size]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="rounded-md"
    />
  );
};

export default AudioVisualizer;
