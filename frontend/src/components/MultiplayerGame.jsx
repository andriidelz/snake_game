import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react'; 
import { connectWS } from '../services/websocket';
import { sound } from '../utils/sound';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
// const INITIAL_DIRECTION = { x: 1, y: 0 };
// const GAME_SPEED = 150;

const MultiplayerGame = ({ playerID, roomID, onBack }) => {
  const [snakes, setSnakes] = useState({});
  const [food, setFood] = useState([15, 15]);
  const [powerUps, setPowerUps] = useState([]);
  const [ws, setWs] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [gameOver, setGameOver] = useState(false); 
  const [connected, setConnected] = useState(false);
  const directionRef = useRef({ x: 1, y: 0 }); 
  // const canChangeDirection = useRef(true); 
  const prevFoodRef = useRef(food);
  const prevPowerUpsRef = useRef(0);

  useEffect(() => {
    const socket = connectWS(roomID, playerID, (data) => {
      if (data.snakes) setSnakes(data.snakes);
      if (data.food) setFood(data.food);
      if (data.powerUps !== undefined) setPowerUps(data.powerUps);
      if (data.gameOver !== undefined) setGameOver(data.gameOver);
    });

    socket.onopen = () => setConnected(true);
    socket.onerror = () => setConnected(false);
    socket.onclose = () => setConnected(false);
    setWs(socket);

    return () => socket.close();
  }, [roomID, playerID]);

  const sendDirection = (dir) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ dir }));
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!connected || gameOver) return;

      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };

      const newDir = keyMap[e.key];
      if (newDir) {
        e.preventDefault();
        if (newDir.x !== -directionRef.current.x || newDir.y !== -directionRef.current.y) {          
          directionRef.current = newDir;
          sendDirection(newDir);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [connected, gameOver]);

  // useEffect(() => {
  //   if (!isPlaying || !connected) return;
  //   const interval = setInterval(() => {
  //     canChangeDirection.current = true; // дозволяємо зміну після тику
  //   }, GAME_SPEED);
  //   return () => clearInterval(interval);
  // }, [isPlaying, connected]);

  useEffect(() => {
    if (prevFoodRef.current && (prevFoodRef.current[0] !== food[0] || prevFoodRef.current[1] !== food[1])) {
      sound.play('eat');
    }
    prevFoodRef.current = food;
  }, [food]);

  useEffect(() => {
    if (prevPowerUpsLengthRef.current > powerUps.length) {
      sound.play('powerup');
    }
    prevPowerUpsLengthRef.current = powerUps.length;
  }, [powerUps]);

  useEffect(() => {
    if (isPlaying) {
      sound.playBackground();
    } else {
      sound.pauseBackground();
    }
  }, [isPlaying]);

  const startGame = () => {
    if (!connected) return;
    setIsPlaying(true);
    setGameOver(false);
    // canChangeDirection.current = true;
    if (ws) ws.send(JSON.stringify({ type: 'start' }));
  };

  const pauseGame = () => {
    setIsPlaying(false);
    if (ws) ws.send(JSON.stringify({ type: 'pause' }));
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    // canChangeDirection.current = true;
    if (ws) ws.send(JSON.stringify({ type: 'reset' }));
  };

  if (!connected) {
    return (
      <div className="p-8 text-center text-white">
        <h2 className="text-4xl mb-8">Підключення до сервера...</h2>
        <p className="text-xl mb-8">Перевір підключення або спробуй пізніше</p>
        <button onClick={onBack} className="btn-neon text-xl">
          ← Повернутися до гри
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-white">
      {/* КНОПКА НАЗАД — ДОДАНО! */}
      <button
        onClick={onBack}
        className="btn-neon text-xl mb-8 block mx-auto"
      >
        ← Повернутися до гри
      </button>

    <h2 className="text-4xl text-yellow-400 mb-4 font-bold text-center">
      Мультиплеєр • <span className="text-pink-400 animate-pulse">{Object.keys(snakes).length}</span> онлайн
    </h2>
      {/* КНОПКИ (схоже до Game.jsx) */}
      <div className="flex justify-center gap-4 mb-4">
        {!isPlaying && !gameOver && (
          <button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Play size={20} />
            Старт
          </button>
        )}
        {isPlaying && (
          <button
            onClick={pauseGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Pause size={20} />
            Пауза
          </button>
        )}
        <button
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Перезапуск
        </button>
      </div>

      {/* Game Board (fixed incomplete JSX) */}
      <div className="flex justify-center">
        <div
          className="relative bg-gray-900 rounded-lg shadow-2xl"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            border: '4px solid #10b981'
          }}
        >
          {Object.entries(snakes).map(([id, snake]) =>
            snake.map((seg, idx) => (
              <div
                key={`${id}-${idx}`}
                className="absolute transition-all duration-100"
                style={{
                  left: seg[0] * CELL_SIZE,
                  top: seg[1] * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  backgroundColor: id === playerID ? (idx === 0 ? '#10b981' : '#34d399') : (idx === 0 ? '#ef4444' : '#f87171'),
                  borderRadius: idx === 0 ? '6px' : '4px',
                  border: '1px solid #059669'
                }}
              />
            ))
          )}
          <div
            className="absolute animate-pulse"
            style={{
              left: food[0] * CELL_SIZE,
              top: food[1] * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #dc2626',
              boxShadow: '0 0 10px #ef4444'
            }}
          />
          {/* Power-ups */}
          {powerUps.map((p, i) => (
            <div
              key={`power-${i}`}
              className="absolute animate-bounce"
              style={{
                left: p[0] * CELL_SIZE + 1,
                top: p[1] * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: '#ffd700',
                borderRadius: '50%',
                boxShadow: '0 0 20px #ffd700'
              }}
            />
          ))}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">💀</div>
                <div className="text-white text-3xl font-bold mb-2">GAME OVER!</div>
                <button
                  onClick={resetGame}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={20} />
                  Грати знову
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-white text-sm opacity-75">
        Керування: ← → ↑ ↓ або W A S D
      </div>
    </div>
  );
};

export default MultiplayerGame;