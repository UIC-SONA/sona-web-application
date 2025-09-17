import {useState, useEffect} from 'react';
import {analyzeAudioFile} from "./../formatTime";

export const useWaveFormData = (
  // src: string,
  audioBuffer: AudioBuffer,
  width: number,
  barSpacing: number
): number[] => {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  useEffect(() => {
    const loadWaveform = async () => {
      if (audioBuffer) {
        try {
          // bar width calculator
          const effectiveBarWidth = 2 + barSpacing;
          const numSamples = Math.floor(width / effectiveBarWidth);
          const data = await analyzeAudioFile(audioBuffer, Math.max(numSamples, 10));
          setWaveformData(data);
        } catch (error) {
          console.error('Failed to load waveform data:', error);
          
          const effectiveBarWidth = 2 + barSpacing;
          const numSamples = Math.floor(width / effectiveBarWidth);
          setWaveformData(Array(Math.max(numSamples, 10)).fill(0.1));
        }
      }
    };
    
    loadWaveform().then();
  }, [audioBuffer, width, barSpacing]);
  
  return waveformData;
};