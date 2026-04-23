import React, { useState, useEffect, useRef } from 'react';
import { enumerateDevices } from '../lib/webrtc';

export function SettingsModal({ isOpen, onClose, onCameraChange, onAudioChange, localStream }) {
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const previewVideoRef = useRef(null);

  useEffect(() => {
    const loadDevices = async () => {
      const devices = await enumerateDevices();
      setCameras(devices.videoinput);
      setMicrophones(devices.audioinput);
      setSpeakers(devices.audiooutput);
    };

    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (previewVideoRef.current && localStream) {
      previewVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleCameraChange = (deviceId) => {
    setSelectedCamera(deviceId);
    onCameraChange(deviceId);
  };

  const handleMicChange = (deviceId) => {
    setSelectedMicrophone(deviceId);
    onAudioChange(deviceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Camera */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Camera
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => handleCameraChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              <option value="">Select camera...</option>
              {cameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Microphone */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Microphone
            </label>
            <select
              value={selectedMicrophone}
              onChange={(e) => handleMicChange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              <option value="">Select microphone...</option>
              {microphones.map(mic => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Speaker */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Speaker
            </label>
            <select
              disabled
              className="w-full bg-white/10 border border-white/20 text-white/60 rounded-lg px-3 py-2 text-sm opacity-50 cursor-not-allowed"
            >
              <option>Speaker selection not available</option>
            </select>
          </div>

          {/* Preview */}
          {localStream && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Preview
              </label>
              <div className="w-full aspect-video bg-[#111118] rounded-lg overflow-hidden ring-1 ring-white/10">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
