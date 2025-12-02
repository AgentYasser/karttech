import { supabase } from "@/integrations/supabase/client";

interface PeerConnection {
  connection: RTCPeerConnection;
  audioElement: HTMLAudioElement;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private roomId: string;
  private userId: string;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private onParticipantSpeaking?: (userId: string, speaking: boolean) => void;

  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      // STUN servers for NAT traversal discovery
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      // TURN server for production (relay when direct connection fails)
      // Using Metered.ca free tier - replace with your own credentials
      {
        urls: "turn:a.relay.metered.ca:80",
        username: "e1b9f5e9d4c6d4f9c9b9f5e9",
        credential: "karttech2024",
      },
      {
        urls: "turn:a.relay.metered.ca:80?transport=tcp",
        username: "e1b9f5e9d4c6d4f9c9b9f5e9",
        credential: "karttech2024",
      },
      {
        urls: "turn:a.relay.metered.ca:443",
        username: "e1b9f5e9d4c6d4f9c9b9f5e9",
        credential: "karttech2024",
      },
      {
        urls: "turns:a.relay.metered.ca:443?transport=tcp",
        username: "e1b9f5e9d4c6d4f9c9b9f5e9",
        credential: "karttech2024",
      },
    ],
  };

  constructor(
    roomId: string,
    userId: string,
    onParticipantSpeaking?: (userId: string, speaking: boolean) => void
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.onParticipantSpeaking = onParticipantSpeaking;
  }

  async initialize(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Start muted
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      this.setupSignaling();
      return this.localStream;
    } catch (error) {
      console.error("Failed to get audio stream:", error);
      throw error;
    }
  }

  private setupSignaling() {
    this.channel = supabase.channel(`room-webrtc-${this.roomId}`, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on("broadcast", { event: "user-joined" }, async ({ payload }) => {
        if (payload.userId !== this.userId) {
          console.log("User joined, creating offer:", payload.userId);
          await this.createOffer(payload.userId);
        }
      })
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.targetUserId === this.userId) {
          console.log("Received offer from:", payload.fromUserId);
          await this.handleOffer(payload.fromUserId, payload.offer);
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.targetUserId === this.userId) {
          console.log("Received answer from:", payload.fromUserId);
          await this.handleAnswer(payload.fromUserId, payload.answer);
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.targetUserId === this.userId) {
          await this.handleIceCandidate(payload.fromUserId, payload.candidate);
        }
      })
      .on("broadcast", { event: "user-left" }, ({ payload }) => {
        if (payload.userId !== this.userId) {
          console.log("User left:", payload.userId);
          this.removePeer(payload.userId);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Announce we joined
          await this.channel?.send({
            type: "broadcast",
            event: "user-joined",
            payload: { userId: this.userId },
          });
        }
      });
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.rtcConfig);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.channel?.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: {
            fromUserId: this.userId,
            targetUserId: peerId,
            candidate: event.candidate.toJSON(),
          },
        });
      }
    };

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Received remote track from:", peerId);
      const existingPeer = this.peers.get(peerId);
      if (existingPeer) {
        existingPeer.audioElement.srcObject = event.streams[0];
      } else {
        const audioElement = document.createElement("audio");
        audioElement.autoplay = true;
        audioElement.srcObject = event.streams[0];
        this.peers.set(peerId, { connection: pc, audioElement });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}:`, pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        this.removePeer(peerId);
      }
    };

    return pc;
  }

  private async createOffer(peerId: string) {
    const pc = this.createPeerConnection(peerId);
    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    this.peers.set(peerId, { connection: pc, audioElement });

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await this.channel?.send({
        type: "broadcast",
        event: "offer",
        payload: {
          fromUserId: this.userId,
          targetUserId: peerId,
          offer: pc.localDescription?.toJSON(),
        },
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  private async handleOffer(peerId: string, offer: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(peerId);
    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    this.peers.set(peerId, { connection: pc, audioElement });

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await this.channel?.send({
        type: "broadcast",
        event: "answer",
        payload: {
          fromUserId: this.userId,
          targetUserId: peerId,
          answer: pc.localDescription?.toJSON(),
        },
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  private async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    const peer = this.peers.get(peerId);
    if (peer) {
      try {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  }

  private async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    const peer = this.peers.get(peerId);
    if (peer) {
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  }

  private removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.connection.close();
      peer.audioElement.srcObject = null;
      this.peers.delete(peerId);
    }
  }

  setMuted(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  async disconnect() {
    // Announce we're leaving
    await this.channel?.send({
      type: "broadcast",
      event: "user-left",
      payload: { userId: this.userId },
    });

    // Clean up peers
    this.peers.forEach((peer) => {
      peer.connection.close();
      peer.audioElement.srcObject = null;
    });
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Unsubscribe from channel
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  getConnectedPeersCount(): number {
    return this.peers.size;
  }
}
