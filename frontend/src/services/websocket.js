export const connectWS = (room, player, onMessage) => {
  const ws = new WebSocket(`ws://localhost:8080/api/multiplayer/ws?room=${room}&player=${player}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  return ws;
};