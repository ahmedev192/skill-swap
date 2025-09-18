import React, { useEffect, useRef, useState } from 'react';
import { 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  X,
  PhoneOff
} from 'lucide-react';
import { callService, CallState } from '../../services/callService';

interface CallModalProps {
  isOpen: boolean;
  callType: 'voice' | 'video';
  callerName: string;
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, callType, callerName, onClose }) => {
  const [callState, setCallState] = useState<CallState>(callService.getCallState());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const unsubscribe = callService.subscribe(setCallState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (callState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (callState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  const handleStartCall = async () => {
    try {
      await callService.startCall(callType, 'target-user-id');
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to start call. Please check your microphone and camera permissions.');
    }
  };

  const handleEndCall = () => {
    callService.endCall();
    onClose();
  };

  const handleToggleMute = () => {
    callService.toggleMute();
  };

  const handleToggleVideo = () => {
    callService.toggleVideo();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {callType === 'video' ? 'Video Call' : 'Voice Call'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {callState.isInCall ? `Connected with ${callerName}` : `Calling ${callerName}...`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Video Area */}
        {callType === 'video' && (
          <div className="relative bg-gray-900 rounded-lg mb-6 aspect-video overflow-hidden">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video */}
            {callState.localStream && (
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Connection Status */}
            {!callState.isInCall && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-pulse">
                    {callType === 'video' ? (
                      <Video className="h-16 w-16 mx-auto mb-4" />
                    ) : (
                      <Phone className="h-16 w-16 mx-auto mb-4" />
                    )}
                  </div>
                  <p className="text-lg">Connecting...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Call UI */}
        {callType === 'voice' && (
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {callerName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {callState.isInCall ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!callState.isInCall ? (
            <button
              onClick={handleStartCall}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              {callType === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              <span>Start Call</span>
            </button>
          ) : (
            <>
              {/* Mute/Unmute */}
              <button
                onClick={handleToggleMute}
                className={`p-4 rounded-full transition-colors ${
                  callState.isMuted
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              {/* Video Toggle (only for video calls) */}
              {callType === 'video' && (
                <button
                  onClick={handleToggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    callState.isVideoEnabled
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {callState.isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </button>
              )}

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Call Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {callType === 'video' 
              ? 'This is a demo video call. In a real implementation, this would use WebRTC for peer-to-peer communication.'
              : 'This is a demo voice call. In a real implementation, this would use WebRTC for peer-to-peer communication.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
