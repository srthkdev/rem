"use client";
import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/store/audio-store";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    audioUrl,
  } = useAudioStore();

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play();
    else audio.pause();
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  // Save volume to localStorage
  useEffect(() => {
    localStorage.setItem("audioVolume", String(volume));
  }, [volume]);

  // Restore volume from localStorage
  useEffect(() => {
    const v = localStorage.getItem("audioVolume");
    if (v) setVolume(Number(v));
  }, []);

  // Progress bar update
  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  // Duration
  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  };

  // Seek
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const t = Number(e.target.value);
    if (audio) {
      audio.currentTime = t;
      setCurrentTime(t);
    }
  };

  // Volume
  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs bg-white/80 dark:bg-[#222]/80 rounded-lg p-4 shadow border">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        style={{ display: "none" }}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded bg-[#E3DACC]/60 dark:bg-[#444]/60"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <span className="text-xs font-mono">
          {Math.floor(currentTime / 60)}:
          {String(Math.floor(currentTime % 60)).padStart(2, "0")}
          {" / "}
          {Math.floor(duration / 60)}:
          {String(Math.floor(duration % 60)).padStart(2, "0")}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={onSeek}
        className="w-full accent-[#C96442]"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          className="p-1"
          aria-label={volume === 0 ? "Unmute" : "Mute"}
        >
          {volume === 0 ? <VolumeX /> : <Volume2 />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={onVolume}
          className="w-full accent-[#C96442]"
        />
      </div>
      <div className="text-xs text-center text-[#C96442]">
        Lofi Study Music (loops)
      </div>
    </div>
  );
}
