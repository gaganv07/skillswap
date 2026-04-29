// Frontend WebRTC utilities for voice and video calling

class WebRTCManager {
  constructor(io) {
    this.io = io;
    this.peerConnections = new Map();
    this.localStream = null;
    this.config = {
      iceServers: [
        { urls: ["stun:stun.l.google.com:19302"] },
        { urls: ["stun:stun1.l.google.com:19302"] },
      ],
    };
  }

  /**
   * Get user media (camera and microphone)
   */
  async getMediaStream(options = { audio: true, video: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(options);
      return this.localStream;
    } catch (error) {
      console.error("Failed to get media stream:", error);
      throw new Error("Cannot access camera/microphone. Check permissions.");
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection(peerId, isInitiator = false) {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers,
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.io.emit("call:ice-candidate", {
          toUserId: peerId,
          candidate: event.candidate,
          callId: `${this.io.auth.userId}_${peerId}`,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log("Received remote stream");
      this.onRemoteStream?.(event.streams[0], peerId);
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnection.connectionState);
      if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "disconnected") {
        this.closePeerConnection(peerId);
      }
    };

    this.peerConnections.set(peerId, peerConnection);
    return peerConnection;
  }

  /**
   * Initiate call
   */
  async initiateCall(toUserId) {
    try {
      const pc = this.createPeerConnection(toUserId, true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.io.emit("call:offer", {
        toUserId,
        offer: offer.toJSON(),
        fromUserId: this.io.auth.userId,
        callId: `${this.io.auth.userId}_${toUserId}`,
      });

      return { callId: `${this.io.auth.userId}_${toUserId}`, peerConnection: pc };
    } catch (error) {
      console.error("Failed to initiate call:", error);
      throw error;
    }
  }

  /**
   * Handle incoming call
   */
  async handleCallOffer(data) {
    try {
      const { fromUserId, offer, callId } = data;
      const pc = this.createPeerConnection(fromUserId, false);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.io.emit("call:answer", {
        toUserId: fromUserId,
        answer: answer.toJSON(),
        callId,
      });

      return { callId, peerConnection: pc };
    } catch (error) {
      console.error("Failed to handle call offer:", error);
      throw error;
    }
  }

  /**
   * Handle call answer
   */
  async handleCallAnswer(data) {
    try {
      const { fromUserId, answer, callId } = data;
      const pc = this.peerConnections.get(fromUserId);

      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Failed to handle call answer:", error);
      throw error;
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(data) {
    try {
      const { fromUserId, candidate, callId } = data;
      const pc = this.peerConnections.get(fromUserId);

      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Failed to add ICE candidate:", error);
    }
  }

  /**
   * End call
   */
  endCall(peerId) {
    this.io.emit("call:end", {
      toUserId: peerId,
      callId: `${this.io.auth.userId}_${peerId}`,
    });
    this.closePeerConnection(peerId);
  }

  /**
   * Close peer connection
   */
  closePeerConnection(peerId) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
  }

  /**
   * Stop local stream
   */
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get peer connection
   */
  getPeerConnection(peerId) {
    return this.peerConnections.get(peerId);
  }

  /**
   * Check if call is active
   */
  isCallActive(peerId) {
    const pc = this.peerConnections.get(peerId);
    return pc && (pc.connectionState === "connected" || pc.connectionState === "connecting");
  }
}

export default WebRTCManager;