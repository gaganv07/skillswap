import React, { useState, useRef, useEffect } from 'react';
import WebRTCManager from '../utils/webrtc';

/**
 * Video Call Modal Component
 * Handles peer-to-peer video calling with WebRTC
 */
const VideoCallModal = ({ isOpen, onClose, callData, socket, currentUserId }) => {
  const [callState, setCallState] = useState('incoming'); // incoming, ringing, connected, ended
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const webRTCManagerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize WebRTC manager
    webRTCManagerRef.current = new WebRTCManager(socket);
    webRTCManagerRef.current.onRemoteStream = (stream, peerId) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Get local media stream
    getMediaStream();

    return () => {
      webRTCManagerRef.current?.stopLocalStream();
      webRTCManagerRef.current?.closePeerConnection(callData?.userId);
    };
  }, [isOpen]);

  const getMediaStream = async () => {
    try {
      const stream = await webRTCManagerRef.current.getMediaStream();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcceptCall = async () => {
    try {
      setCallState('connected');
      // Accept call is handled by handleCallOffer in WebRTC manager
      // This is called after user clicks accept
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectCall = () => {
    socket.emit('call:end', {
      toUserId: callData?.userId,
      callId: callData?.callId,
    });
    onClose();
  };

  const handleEndCall = () => {
    webRTCManagerRef.current?.endCall(callData?.userId);
    setCallState('ended');
    setTimeout(onClose, 1000);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    webRTCManagerRef.current?.toggleAudio(newState);
  };

  const toggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    webRTCManagerRef.current?.toggleVideo(newState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {callState === 'incoming' && 'Incoming Call'}
            {callState === 'ringing' && 'Calling...'}
            {callState === 'connected' && 'Call Connected'}
            {callState === 'ended' && 'Call Ended'}
          </h2>
          <button
            onClick={handleRejectCall}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Video Display */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-black rounded-lg overflow-hidden">
          {/* Local Video */}
          <div className="relative bg-gray-900">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative bg-gray-900">
            {callState === 'connected' ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">{callData?.userName}</p>
                  {callState === 'incoming' && <p>Waiting for you to accept...</p>}
                  {callState === 'ringing' && (
                    <p className="animate-pulse">Ringing...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {/* Microphone Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
            title="Toggle Microphone"
          >
            🎤
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
            title="Toggle Camera"
          >
            📹
          </button>

          {/* Settings */}
          <button
            className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {callState === 'incoming' && (
            <>
              <button
                onClick={handleRejectCall}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptCall}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            </>
          )}

          {(callState === 'ringing' || callState === 'connected') && (
            <button
              onClick={handleEndCall}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              End Call
            </button>
          )}

          {callState === 'ended' && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Connection Status */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {callState === 'connected' && <p>✅ Connected</p>}
          {callState === 'ringing' && <p>⏳ Establishing connection...</p>}
          {callState === 'incoming' && <p>📞 Incoming call from {callData?.userName}</p>}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;