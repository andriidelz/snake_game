let ws = null;

export const connectWS = (room, player, onMessage) => {
  // Беремо з .env — працює і локально, і в продакшні
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/multiplayer/ws';
  
  ws = new WebSocket(`${WS_URL}?room=${room}&player=${player}`);

  ws.onopen = () => {
    console.log('WebSocket connected:', room, player);
  };

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch (err) {
      console.error('WS parse error:', err);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    ws = null;
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  return ws;
};

export const sendDirection = (dir) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dir));
  }
};

export const disconnectWS = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};