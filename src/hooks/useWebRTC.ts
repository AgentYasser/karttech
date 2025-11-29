import { useState, useRef, useCallback, useEffect } from "react";
import { WebRTCManager } from "@/utils/WebRTCManager";

interface UseWebRTCOptions {
  roomId: string;
  userId: string;
  enabled: boolean;
}

export function useWebRTC({ roomId, userId, enabled }: UseWebRTCOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<WebRTCManager | null>(null);

  const connect = useCallback(async () => {
    if (!enabled || !roomId || !userId) return;

    try {
      setError(null);
      const manager = new WebRTCManager(roomId, userId);
      managerRef.current = manager;
      
      await manager.initialize();
      setIsConnected(true);
      setIsMuted(true);
    } catch (err) {
      console.error("WebRTC connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnected(false);
    }
  }, [roomId, userId, enabled]);

  const disconnect = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.disconnect();
      managerRef.current = null;
      setIsConnected(false);
      setIsMuted(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (managerRef.current) {
      const newMuted = !isMuted;
      managerRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
      return newMuted;
    }
    return isMuted;
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isMuted,
    error,
    connect,
    disconnect,
    toggleMute,
  };
}
