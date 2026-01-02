let socket: WebSocket | null = null;

export const connectWS = (playerID: string, roomID: string = "global-room-1", onUpdate: (data: any) => void) => {
  const baseUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://192.168.0.148:8080/api/multiplayer/ws';
  socket = new WebSocket(`${baseUrl}?player=${playerID}&room=${roomID}`);

  socket.onopen = () => console.log('WS connected (mobile)');
  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      console.log('Received from server:', data);
      onUpdate(data);
    } catch (err) {
      console.log('Invalid message', e.data);
    }
  };

  socket.onerror = (e) => console.log('WS error', e);
  socket.onclose = () => {
    console.log('WebSocket closed');
    socket = null;
  };

  return socket;
};

export const sendMessage = (msg: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
};

export const sendDirection = (dir: { x: number; y: number }) => {
  sendMessage({ dir });
};

export const sendCommand = (type: 'start' | 'pause' | 'reset') => {
  sendMessage({ type });
};

export const disconnectWS = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};