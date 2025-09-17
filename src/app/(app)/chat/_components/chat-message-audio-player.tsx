"use client";

import {useLayoutEffect, useState, useRef} from "react";
import AudioWaveform from "@/components/wave/audio-waveform";
import {useTheme} from "next-themes";
import {Theme} from "@/components/wave/types";

export function ChatMessageAudioPlayer({src}: Readonly<{ src: string }>) {
  
  const [primaryColor, setPrimaryColor] = useState("");
  const [progressColor, setProgressColor] = useState("");
  const {resolvedTheme} = useTheme();
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
        theme={resolvedTheme as Theme}
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