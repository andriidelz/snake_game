import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, TrendingUp, Award } from 'lucide-react';
import { saveScore, unlockAchievement } from '../services/api';
import PowerUp from './PowerUps';
import { sound } from '../utils/sound';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 150;

function lighten(hex) {
  let r = parseInt(hex.slice(1, 3), 16) + 50;
  let g = parseInt(hex.slice(3, 5), 16) + 50;
  let b = parseInt(hex.slice(5, 7), 16) + 50;
  r = Math.min(255, r).toString(16).padStart(2, '0');
  g = Math.min(255, g).toString(16).padStart(2, '0');
  b = Math.min(255, b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

const Game = ({ onStatsUpdate, skin = { color: '#10b981' } }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [showAdBreak, setShowAdBreak] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [playerID] = useState(() => 'player_' + Math.random().toString(36).substr(2, 9));
  const [powerups, setPowerups] = useState([]);  
  const [activeEffects, setActiveEffects] = useState({}); // shield, magnet, double...
  const [scoreMultiplier, setScoreMultiplier] = useState(1);

  const directionRef = useRef(direction);
  const canChangeDirection = useRef(true);
  const snakeRef = useRef(snake);
  const defaultSpeedRef = useRef(INITIAL_SPEED);  

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  const generatePosition = useCallback(() => {  
    const isPositionOccupied = (pos) => {
      return (
        snakeRef.current.some(seg => seg[0] === pos[0] && seg[1] === pos[1]) ||
        (pos[0] === food[0] && pos[1] === food[1]) ||
        powerups.some(p => p.pos[0] === pos[0] && p.pos[1] === pos[1])
      );
    };

    let newPos;
    do {
      newPos = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (isPositionOccupied(newPos));
    return newPos;
  }, [food, powerups]);

  const generateFood = useCallback(() => generatePosition(), [generatePosition]);

  const spawnPowerUp = useCallback(() => {
    if (Math.random() > 0.015) return;

    const types = ['speed', 'slow', 'shield', 'magnet', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    const pos = generatePosition();

    setPowerups(prev => [...prev, { id: Date.now() + Math.random(), type, pos }]);
  }, [generatePosition]);

  const applyPowerUpEffect = useCallback((type) => {
    sound.play('powerup');
    if (type === 'speed-up') {
      sound.play('speed');
      setSpeed(s => Math.max(60, s * 0.6));
      setTimeout(() => setSpeed(defaultSpeedRef.current), 6000);
    }
    if (type === 'slow') {
      sound.play('powerup');
      setSpeed(s => Math.min(300, s * 2));
      setTimeout(() => setSpeed(defaultSpeedRef.current), 8000);
    }
    if (type === 'shield') {
      sound.play('shield');
      setActiveEffects(prev => ({ ...prev, shield: true }));
      setTimeout(() => setActiveEffects(prev => ({ ...prev, shield: false })), 10000);
    }
    if (type === 'magnet') {
      sound.play('powerup');
      setActiveEffects(prev => ({ ...prev, magnet: true }));
      setTimeout(() => setActiveEffects(prev => ({ ...prev, magnet: false })), 8000);
    }
    if (type === 'double') {
      sound.play('bonus-score');
      setScoreMultiplier(2);
      setActiveEffects(prev => ({ ...prev, double: true }));
      setTimeout(() => {
        setScoreMultiplier(1);
        setActiveEffects(prev => ({ ...prev, double: false }));
      }, 10000);
    }
  }, []);

  const checkForAdBreak = useCallback(() => {
    const newGamesPlayed = gamesPlayed + 1;
    setGamesPlayed(newGamesPlayed);
    if (newGamesPlayed % 3 === 0) {
      setShowAdBreak(true);
      setTimeout(() => setShowAdBreak(false), 5000);
    }
  }, [gamesPlayed]);

  const handleGameOver = useCallback(async () => {
    sound.play('game-over');
    setGameOver(true);
    setIsPlaying(false);

  const achievementsUnlocked = 9;
    if (achievementsUnlocked > 0) {
      sound.play('achievement');
    }

  try {
    await saveScore(playerID, score, snake.length);

    if (gamesPlayed === 0) {await unlockAchievement(playerID, "Перша гра!", "Ти зіграв свою першу партію", "🎮");}
    if (score >= 50 && score < 100) {await unlockAchievement(playerID, "Новачок", "Набрав 50 очок", "⭐");}
    if (score >= 100) {await unlockAchievement(playerID, "Профі", "Набрав 100 очок", "🏆");}
    if (score >= 200) {await unlockAchievement(playerID, "Легенда", "Набрав 200 очок!", "🔥");}
    if (snake.length >= 20) {await unlockAchievement(playerID, "Гігант", "Змія довжиною 20+", "🐍");}
    if (score > highScore) {await unlockAchievement(playerID, "Новий рекорд!", `Твій рекорд: ${score}`, "⚡");}

    const totalGames = gamesPlayed + 1;
    if (totalGames === 10) {
      await unlockAchievement(playerID, "Ветеран", "Зіграв 10 ігор", "🎯");
    }
    if (totalGames === 50) {
      await unlockAchievement(playerID, "Майстер змійки", "Зіграв 50 ігор!", "🏅");
    }

    if (onStatsUpdate) onStatsUpdate();
  } catch (error) {
    console.error('Failed to save score or unlock achievements:', error);
  }

  checkForAdBreak();
}, [playerID, score, snake.length, gamesPlayed, highScore, onStatsUpdate, checkForAdBreak]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying || !canChangeDirection.current) return;
      const keyMap = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
      };
      const newDir = keyMap[e.key];
      if (newDir) {
        e.preventDefault();
        if (newDir.x !== -directionRef.current.x || newDir.y !== -directionRef.current.y) {
          setDirection(newDir);
          directionRef.current = newDir;
          canChangeDirection.current = false;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (isPlaying) {
      sound.playBackground();  
  } else {
      sound.pauseBackground();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = [ 
          head[0] + directionRef.current.x,
          head[1] + directionRef.current.y
        ];

        if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
          if (!activeEffects.shield) handleGameOver();
          return prevSnake;
        }

        if (!activeEffects.shield && prevSnake.slice(1).some(seg => seg[0] === newHead[0] && seg[1] === newHead[1])) {
          handleGameOver();
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];
        let ateSomething = false;

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          sound.play('eat');
          setScore(s => s + 10 * scoreMultiplier);
          setFood(generateFood());
          if (speed > 50) {
            setSpeed(s => s - 2);
            defaultSpeedRef.current = speed - 2;  
          }
          ateSomething = true;
        }

        const powerIndex = powerups.findIndex(p => p.pos[0] === newHead[0] && p.pos[1] === newHead[1]);
        if (powerIndex > -1) {
          applyPowerUpEffect(powerups[powerIndex].type);
          setPowerups(prev => prev.filter((_, i) => i !== powerIndex));
          ateSomething = true;
        }

        if (activeEffects.magnet && food) {
          const dx = newHead[0] - food[0];
          const dy = newHead[1] - food[1];
          if (Math.abs(dx) + Math.abs(dy) <= 6 && Math.abs(dx) + Math.abs(dy) > 0) {
            setFood(prev => {
              if (Math.abs(dx) > Math.abs(dy)) return [prev[0] + Math.sign(dx), prev[1]];
              return [prev[0], prev[1] + Math.sign(dy)];
            });
          }
        }

        if (!ateSomething) newSnake.pop();
        canChangeDirection.current = true;
        
        spawnPowerUp();

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, speed, directionRef, food, powerups,
    activeEffects, scoreMultiplier, handleGameOver, generateFood,
    spawnPowerUp, applyPowerUpEffect]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const startGame = () => {
    sound.play('button-click');

    setIsPlaying(true);
    setGameOver(false);
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    defaultSpeedRef.current = INITIAL_SPEED;
    setPowerups([]);  // Reset powerups
    setActiveEffects({});
    setScoreMultiplier(1);
    canChangeDirection.current = true;    
  };

  const watchAdForReward = () => {
    setShowRewardedAd(true);

    // Імітуємо 30-секундну рекламу (для тесту — 3 секунди)
    setTimeout(() => {
      // НАГОРОДА!
      setScore(s => s + 100);
      sound.play('achievement');
      setIsPlaying(true);
      setGameOver(false);
      setShowRewardedAd(false);
    }, 3000); // 3 секунди для тесту — в проді буде 30 сек
  };

  const pauseGame = () => {
    sound.play('button-click');
    setIsPlaying(false);
  }
  const resetGame = () => { 
    sound.play('button-click');
    startGame(); 
    setIsPlaying(false); 
    setGameOver(false); 
  };
  
  return (
    <div className="bg-white/5 backdrop-blur rounded-lg p-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-lg p-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm font-bold">Рахунок</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{score}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-yellow-400" />
            <span className="text-sm font-bold">Рекорд</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🐍</span>
            <span className="text-sm font-bold">Довжина</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{snake.length}</div>
        </div>
      </div>
      {/* Active effects */}
      {Object.keys(activeEffects).length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-black/80 px-6 py-3 rounded-full border border-white/30">
          {activeEffects.speed && <span className="text-yellow-400">⚡ Acceleration</span>}
          {activeEffects.slow && <span className="text-blue-400">🐌 Slow</span>}
          {activeEffects.shield && <span className="text-purple-400">🛡️Shield</span>}
          {activeEffects.magnet && <span className="text-pink-400">🧲 Magnet</span>}
          {activeEffects.double && <span className="text-cyan-400">💎2× очки</span>}
        </div>
      )}
      {/* Перемикач звуку */}
      <div className="flex justify-center gap-6 mt-6 text-white">
        <button
          onClick={() => sound.setEnabled(!sound.enabled)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
            {sound.enabled ? 'Гучність' : 'Вимкнено'}
          <span className="text-2xl">{sound.enabled ? 'Гучність' : 'Вимкнено'}</span>
        </button>

        <button
          onClick={() => sound.toggleBackground()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
          {sound.background?.paused ? 'Музика' : 'Музика'}
        </button>
      </div>
      {/* Game Board */}
      <div className="flex justify-center mb-4">
        <div
          className="relative bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            border: '4px solid #10b981'
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute transition-all duration-100"
              style={{
                left: segment[0] * CELL_SIZE,
                top: segment[1] * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: index === 0 ? skin.color : lighten(skin.color),
                borderRadius: index === 0 ? '6px' : '4px',
                border: '1px solid #059669'
              }}
            />
          ))}
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
          {/* {powerups.map((p, i) => (  // Render powerups
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: p.pos[0] * CELL_SIZE,
                top: p.pos[1] * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: p.type === 'speed' ? 'yellow' : 'purple',  // Different colors per type
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 10px yellow'
              }}
            />
          ))} */}
          {/* Power-ups */}
          {powerups.map(p => (
            <div
              key={p.id}
              style={{ left: p.pos[0] * CELL_SIZE + 2, top: p.pos[1] * CELL_SIZE + 2 }}
              className="absolute"
            >
              <PowerUp type={p.type} />
            </div>
          ))}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg z-50">
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">💀</div>
                <div className="text-white text-3xl font-bold mb-2">GAME OVER!</div>
                <div className="text-green-400 text-2xl mb-8">Рахунок: {score}</div>
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
      {/* Controls */}
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
              onClick={watchAdForReward}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-2xl shadow-2xl transform hover:scale-110 transition-all mb-6"
            >
              Revive +100 очок за рекламу
            </button>
        <button
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Перезапуск
        </button>
      </div>
      <div className="text-center text-white text-sm opacity-75">
        Керування: ← → ↑ ↓ або W A S D
      </div>
      {/* Ad Break Modal */}
      {showRewardedAd && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 text-white text-center">
          <div className="space-y-4">
            <div className="text-4xl animate-pulse">📺</div>
            <div className="text-2xl font-bold">Перегляд реклами...</div>
            <div className="text-lg opacity-70">Після завершення ти отримаєш +100 очок</div>
          </div>
      </div>
      )}
      {showAdBreak && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold mb-4">Рекламна пауза</h2>
            <p className="text-gray-600 mb-4">Дякуємо за гру! Невелика реклама...</p>
            <div className="bg-gray-200 h-48 rounded flex items-center justify-center text-gray-500">
              [ВІДЕО РЕКЛАМА - 5 сек]
            </div>
            <p className="text-sm text-gray-500 mt-4">Закриється автоматично...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
