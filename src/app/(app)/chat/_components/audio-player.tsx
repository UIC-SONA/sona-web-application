"use client";

import {AudioWaveform} from "react-music-waveform";
import {useLayoutEffect, useState, useRef} from "react";

export function AudioPlayer({src}: Readonly<{ src: string }>) {
  const [primaryColor, setPrimaryColor] = useState("");
  const [progressColor, setProgressColor] = useState("");
  const rafRef = useRef<number>(null);
  
  useLayoutEffect(() => {
    const updateColors = () => {
      const primary = getCSSVariableValue("--primary-foreground");
      const accent = getCSSVariableValue("--accent");
      
      setPrimaryColor(primary);
      setProgressColor(accent);
      
      // Programar el siguiente frame
      rafRef.current = requestAnimationFrame(updateColors);
    };
    
    // Iniciar el loop
    updateColors();
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  return (
    <div className="h-10">
      <AudioWaveform
        src={src}
        style="viridara"
        height={40}
        width={150}
        showControls={true}
        showTimestamp={true}
        showSpeedControl={false}
        showBackground={false}
        primaryColor={primaryColor}
        progressColor={progressColor}
      />
    </div>
  )
}

function getCSSVariableValue(variableName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}