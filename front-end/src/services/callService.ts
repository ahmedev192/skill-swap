export interface CallState {
  isInCall: boolean;
  callType: 'voice' | 'video' | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
}

class CallService {
  private callState: CallState = {
    isInCall: false,
    callType: null,
    isMuted: false,
    isVideoEnabled: true,
    localStream: null,
    remoteStream: null,
    peerConnection: null
  };

  private listeners: ((state: CallState) => void)[] = [];

  // WebRTC configuration
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Subscribe to call state changes
  subscribe(listener: (state: CallState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.callState));
  }

  // Start a call (voice or video)
  async startCall(callType: 'voice' | 'video', targetUserId: string): Promise<void> {
    try {
      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? true : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.rtcConfig);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        this.callState.remoteStream = remoteStream;
        this.notifyListeners();
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, you would send this to the other peer via signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Update call state
      this.callState = {
        ...this.callState,
        isInCall: true,
        callType,
        localStream: stream,
        peerConnection
      };

      this.notifyListeners();

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // In a real implementation, you would send the offer to the other peer
      console.log('Call offer created:', offer);

    } catch (error) {
      console.error('Error starting call:', error);
      throw new Error('Failed to start call. Please check your microphone and camera permissions.');
    }
  }

  // Answer an incoming call
  async answerCall(callType: 'voice' | 'video'): Promise<void> {
    try {
      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? true : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection(this.rtcConfig);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        this.callState.remoteStream = remoteStream;
        this.notifyListeners();
      };

      // Update call state
      this.callState = {
        ...this.callState,
        isInCall: true,
        callType,
        localStream: stream,
        peerConnection
      };

      this.notifyListeners();

    } catch (error) {
      console.error('Error answering call:', error);
      throw new Error('Failed to answer call. Please check your microphone and camera permissions.');
    }
  }

  // End the current call
  endCall(): void {
    // Stop local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (this.callState.peerConnection) {
      this.callState.peerConnection.close();
    }

    // Reset call state
    this.callState = {
      isInCall: false,
      callType: null,
      isMuted: false,
      isVideoEnabled: true,
      localStream: null,
      remoteStream: null,
      peerConnection: null
    };

    this.notifyListeners();
  }

  // Toggle mute
  toggleMute(): void {
    if (this.callState.localStream) {
      const audioTracks = this.callState.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = this.callState.isMuted;
      });
      this.callState.isMuted = !this.callState.isMuted;
      this.notifyListeners();
    }
  }

  // Toggle video
  toggleVideo(): void {
    if (this.callState.localStream) {
      const videoTracks = this.callState.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = this.callState.isVideoEnabled;
      });
      this.callState.isVideoEnabled = !this.callState.isVideoEnabled;
      this.notifyListeners();
    }
  }

  // Get current call state
  getCallState(): CallState {
    return { ...this.callState };
  }

  // Simulate incoming call (for demo purposes)
  simulateIncomingCall(callType: 'voice' | 'video', callerName: string): void {
    // In a real implementation, this would be triggered by a signaling server
    const shouldAnswer = confirm(`Incoming ${callType} call from ${callerName}. Do you want to answer?`);
    if (shouldAnswer) {
      this.answerCall(callType);
    }
  }
}

export const callService = new CallService();
