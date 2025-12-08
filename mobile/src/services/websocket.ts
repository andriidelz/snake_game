let socket: WebSocket | null = null;

export const connectWS = (playerID: string, roomID: string = "global-mobile", onUpdate: (data: any) => void) => {
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://192.168.1.100:8080/ws';
  socket = new WebSocket(`${wsUrl}?player=${playerID}&room=${roomID}`);

  socket.onopen = () => console.log('WS connected');
  socket.onmessage = (e) => onUpdate(JSON.parse(e.data));
  socket.onerror = (e) => console.log('WS error', e);
  socket.onclose = () => console.log('WS closed');

  return socket;
};

export const sendDirection = (dir: { x: number; y: number }) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(dir));
  }
};

export const disconnectWS = () => {
  socket?.close();
  socket = null;
};