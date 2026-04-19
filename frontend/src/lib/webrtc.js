const STUN_URL = import.meta.env.VITE_STUN_URL;
const TURN_URL = import.meta.env.VITE_TURN_URL;
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME;
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL;

export function getICEServers() {
  return [
    { urls: STUN_URL || 'stun:stun.l.google.com:19302' },
    {
      urls: TURN_URL || 'turn:localhost:3478',
      username: TURN_USERNAME || 'driftuser',
      credential: TURN_CREDENTIAL || 'driftpass123'
    }
  ];
}

export async function getUserMedia(constraints = {}) {
  const defaultConstraints = {
    video: true,
    audio: true,
    ...constraints
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
    return stream;
  } catch (err) {
    console.error('getUserMedia error:', err);
    throw err;
  }
}

export async function getDisplayMedia() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    return stream;
  } catch (err) {
    console.error('getDisplayMedia error:', err);
    throw err;
  }
}

export async function enumerateDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      videoinput: devices.filter(d => d.kind === 'videoinput'),
      audioinput: devices.filter(d => d.kind === 'audioinput'),
      audiooutput: devices.filter(d => d.kind === 'audiooutput')
    };
  } catch (err) {
    console.error('enumerateDevices error:', err);
    return { videoinput: [], audioinput: [], audiooutput: [] };
  }
}
