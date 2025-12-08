import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Modal } from 'react-native';
import { Play, Pause, RotateCcw, Trophy, Medal, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Shield, Magnet, Gem, Snail } from 'lucide-react-native';
import PowerUp from './PowerUp';
import { saveScore, unlockAchievement } from '../services/api';
import { sound } from '../utils/sound';
import SkinSelector from './SkinSelector';
import { Skin } from '../types/skin';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

type PowerUpType = 'speed' | 'slow' | 'shield' | 'magnet' | 'double';

export default function Game({ navigation, playerID }: { navigation: any; playerID: string }) {
  const [snake, setSnake] = useState<number[][]>([[10, 10]]);
  const [food, setFood] = useState<number[]>([15, 15]);
  const [powerUp, setPowerUp] = useState<{ x: number; y: number; type: PowerUpType } | null>(null);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [snakeLength, setSnakeLength] = useState(1);
  const [speed, setSpeed] = useState(150);
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showAdBreak, setShowAdBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [currentSkin, setCurrentSkin] = useState<Skin>({
  id: 'default',
  color: '#10b981',
  light: '#34d399',
  name: 'Зелений',
});

  const resetGame = () => {
    setSnake([[10, 10]]);
    setFood([Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]);
    setPowerUp(null);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setSnakeLength(1);
    setSpeed(150);
    setActiveEffects([]);
    setScoreMultiplier(1);
    setIsPlaying(false);
    sound.play('button');
  };

  const applyPowerUp = (type: PowerUpType) => {
    Vibration.vibrate(100);
    sound.play('powerup');
    if (type === 'speed') setSpeed(80), setActiveEffects(prev => [...prev, 'speed']), setTimeout(() => { setSpeed(150); setActiveEffects(prev => prev.filter(e => e !== 'speed')); }, 8000);
    if (type === 'slow') setSpeed(300), setActiveEffects(prev => [...prev, 'slow']), setTimeout(() => { setSpeed(150); setActiveEffects(prev => prev.filter(e => e !== 'slow')); }, 10000);
    if (type === 'shield') setActiveEffects(prev => [...prev, 'shield']), setTimeout(() => setActiveEffects(prev => prev.filter(e => e !== 'shield')), 10000);
    if (type === 'magnet') setActiveEffects(prev => [...prev, 'magnet']), setTimeout(() => setActiveEffects(prev => prev.filter(e => e !== 'magnet')), 8000);
    if (type === 'double') setScoreMultiplier(2), setActiveEffects(prev => [...prev, 'double']), setTimeout(() => { setScoreMultiplier(1); setActiveEffects(prev => prev.filter(e => e !== 'double')); }, 10000);
  };

  const gameLoop = useCallback(() => {
    setSnake(current => {
      const head = current[0];
      const newHead = [head[0] + direction.x, head[1] + direction.y];

      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        setIsPlaying(false);
        sound.play('game-over');
        saveScore(playerID, score, current.length);
        if (score > highScore) { setHighScore(score); unlockAchievement(playerID, 'new_record', `Рекорд: ${score}!`, 'zap'); }
        if (score >= 100) unlockAchievement(playerID, 'century', '100 очок!', 'trophy');
        setGamesPlayed(g => { const n = g + 1; if (n % 3 === 0) setShowAdBreak(true); return n; });
        return current;
      }

      const newSnake = [newHead, ...current];
      let ate = false;

      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        sound.play('eat');
        setScore(s => s + 10 * scoreMultiplier);
        setSnakeLength(l => l + 1);
        setFood([Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]);
        ate = true;
      }

      if (powerUp && newHead[0] === powerUp.x && newHead[1] === powerUp.y) {
        applyPowerUp(powerUp.type);
        setPowerUp(null);
        unlockAchievement(playerID, 'power_master', 'Зібрав power-up!', 'zap');
      }

      if (!ate) newSnake.pop();
      return newSnake;
    });
  }, [direction, food, powerUp, scoreMultiplier, playerID, score, highScore]);

  useEffect(() => {
  if (!isPlaying) {
    setPowerUp(null);
    return;
  }

  const isPositionFree = (x: number, y: number) => {
    const onSnake = snake.some(seg => seg[0] === x && seg[1] === y);
    const onFood = food[0] === x && food[1] === y;
    const onPowerUp = powerUp && powerUp.x === x && powerUp.y === y;
    return !onSnake && !onFood && !onPowerUp;
  };

  const spawnPowerUp = () => {
    if (Math.random() < 0.35) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      } while (!isPositionFree(x, y));

      const types: PowerUpType[] = ['speed', 'slow', 'shield', 'magnet', 'double'];
      const type = types[Math.floor(Math.random() * types.length)];

      setPowerUp({ x, y, type });

      setTimeout(() => {
        setPowerUp(prev => (prev?.x === x && prev?.y === y ? null : prev));
      }, 10000);
    }
  };

  spawnPowerUp();
  const interval = setInterval(spawnPowerUp, 12000);

  return () => clearInterval(interval); 
}, [isPlaying, snake, food, powerUp]);

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(gameLoop, speed);
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => {
  if (intervalRef.current) clearInterval(intervalRef.current);
};
  }, [isPlaying, gameLoop, speed]);

  useEffect(() => setSoundEnabled(sound.enabled), [sound.enabled]);

  useEffect(() => {
  if (showAdBreak) {
    const timer = setTimeout(() => setShowAdBreak(false), 5000);
    return () => clearTimeout(timer);
  }
}, [showAdBreak]);

  return (
    <View style={styles.container}>
      {/* СТАТИСТИКА */}
      <View style={styles.header}>
        <View>
          <Text style={styles.score}>Рахунок: {score}</Text>
          <Text style={styles.highScore}>Рекорд: {highScore}</Text>
          <Text style={styles.length}>Довжина: {snake.length}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => sound.toggle()}>
            {soundEnabled ? <Volume2 color="#4ade80" size={32} /> : <VolumeX color="#ef4444" size={32} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={resetGame}><RotateCcw color="#60a5fa" size={32} /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}><Trophy color="#fbbf24" size={32} /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Achievements')}><Medal color="#8b5cf6" size={32} /></TouchableOpacity>
        </View>
      </View>

      {/* ← ДОДАЄМО SKIN SELECTOR */}
      <View style={{ marginVertical: 20 }}>
        <SkinSelector onSelect={setCurrentSkin} selectedSkin={currentSkin.id} />
      </View>

      {/* АКТИВНІ ЕФЕКТИ */}
      {activeEffects.length > 0 && (
        <View style={styles.effectsBar}>
          {activeEffects.includes('speed') && <Zap color="#fbbf24" size={28} />}
          {activeEffects.includes('slow') && <Snail color="#3b82f6" size={28} />}
          {activeEffects.includes('shield') && <Shield color="#8b5cf6" size={28} />}
          {activeEffects.includes('magnet') && <Magnet color="#ec4899" size={28} />}
          {activeEffects.includes('double') && <Gem color="#06b6d4" size={28} />}
        </View>
      )}

      {/* ПОЛЕ — ЗМІНЮЄМО КОЛІР ЗГІДНО СКІНУ */}
      <View style={styles.board}>
        {snake.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.snake,
              {
                left: seg[0] * CELL_SIZE,
                top: seg[1] * CELL_SIZE,
                backgroundColor: i === 0 ? currentSkin.color : currentSkin.light || currentSkin.color,
              },
            ]}
          />
        ))}
        <View style={[styles.food, { left: food[0] * CELL_SIZE, top: food[1] * CELL_SIZE }]} />
        {powerUp && (
          <View style={{ position: 'absolute', left: powerUp.x * CELL_SIZE, top: powerUp.y * CELL_SIZE }}>
            <PowerUp type={powerUp.type} />
          </View>
        )}
      </View>

      {/* СТРІЛКИ */}
      <View style={styles.arrows}>
        <View />
        <TouchableOpacity onPress={() => direction.y === 0 && setDirection({ x: 0, y: -1 })} style={styles.arrow}><ArrowUp color="#e0e0e0" size={44} /></TouchableOpacity>
        <View />
        <View style={{ flexDirection: 'row', gap: 44 }}>
          <TouchableOpacity onPress={() => direction.x === 0 && setDirection({ x: -1, y: 0 })} style={styles.arrow}><ArrowLeft color="#e0e0e0" size={44} /></TouchableOpacity>
          <TouchableOpacity onPress={() => direction.y === 0 && setDirection({ x: 0, y: 1 })} style={styles.arrow}><ArrowDown color="#e0e0e0" size={44} /></TouchableOpacity>
          <TouchableOpacity onPress={() => direction.x === 0 && setDirection({ x: 1, y: 0 })} style={styles.arrow}><ArrowRight color="#e0e0e0" size={44} /></TouchableOpacity>
        </View>
      </View>

      {/* PLAY/PAUSE */}
      <View style={styles.controls}>
        {!isPlaying ? (
          <TouchableOpacity style={styles.play} onPress={() => setIsPlaying(true)}><Play size={48} color="white" /></TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pause} onPress={() => setIsPlaying(false)}><Pause size={48} color="white" /></TouchableOpacity>
        )}
      </View>

      {/* РЕКЛАМА */}
      <Modal visible={showAdBreak} transparent animationType="fade">
        <View style={styles.adOverlay}>
          <View style={styles.adBox}>
            <Text style={styles.adTitle}>Рекламна пауза</Text>
            <Text style={styles.adText}>Дякуємо за гру!</Text>
            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderText}>[РЕКЛАМА 5 cек]</Text>
              </View>
            <Text style={styles.adTimer}>Закриється автоматично...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  score: { color: '#4ade80', fontSize: 32, fontWeight: 'bold' },
  highScore: { color: '#fbbf24', fontSize: 18 },
  length: { color: '#60a5fa', fontSize: 18 },
  buttons: { flexDirection: 'row', gap: 16 },
  effectsBar: { position: 'absolute', top: 100, left: 20, right: 20, flexDirection: 'row', justifyContent: 'center', gap: 16, backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, borderRadius: 30, borderWidth: 2, borderColor: '#10b981' },
  board: { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, backgroundColor: '#000', position: 'relative', alignSelf: 'center', marginTop: 30, borderRadius: 16, shadowColor: '#10b981', shadowOpacity: 0.8, shadowRadius: 20, elevation: 20 },
  snake: { position: 'absolute', width: CELL_SIZE - 2, height: CELL_SIZE - 2, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 6, elevation: 10 },
  food: { position: 'absolute', width: CELL_SIZE - 2, height: CELL_SIZE - 2, backgroundColor: '#ef4444', borderRadius: 99, shadowColor: '#ef4444', shadowOpacity: 1, shadowRadius: 12, elevation: 15 },
  arrows: { alignItems: 'center', marginTop: 40 },
  arrow: { padding: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  controls: { alignItems: 'center', marginTop: 50 },
  play: { backgroundColor: '#10b981', padding: 28, borderRadius: 80, shadowColor: '#10b981', shadowOpacity: 0.9, shadowRadius: 30, elevation: 25 },
  pause: { backgroundColor: '#f59e0b', padding: 28, borderRadius: 80, shadowColor: '#f59e0b', shadowOpacity: 0.9, shadowRadius: 30, elevation: 25 },
  adOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  adBox: { backgroundColor: '#fff', padding: 30, borderRadius: 24, alignItems: 'center', width: '85%' },
  adTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  adText: { fontSize: 18, color: '#666', marginVertical: 10 },
  adPlaceholder: { width: '100%', height: 200, backgroundColor: '#eee', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  adPlaceholderText: { fontSize: 18, color: '#999' },
  adTimer: { color: '#666', fontSize: 14 },
});





// import { useState, useEffect, useRef, useCallback } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { Play, Pause, RotateCcw, Trophy, Medal, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react-native';
// import PowerUp from './PowerUp';
// import { saveScore, unlockAchievement } from '../services/api';
// import { sound } from '../utils/sound';

// const GRID_SIZE = 20;
// const CELL_SIZE = 20;

// type PowerUpType = 'speed' | 'slow' | 'shield' | 'magnet' | 'double';

// export default function Game({ navigation, playerID }: { navigation: any; playerID: string }) {
//   const [snake, setSnake] = useState<number[][]>([[10, 10]]);
//   const [food, setFood] = useState<number[]>([15, 15]);
//   const [powerUp, setPowerUp] = useState<{ x: number; y: number; type: PowerUpType } | null>(null);
//   const [direction, setDirection] = useState({ x: 1, y: 0 });
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [score, setScore] = useState(0);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const [soundEnabled, setSoundEnabled] = useState(true);

//   const resetGame = () => {
//     setSnake([[10, 10]]);
//     setFood([Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]);
//     setPowerUp(null);
//     setDirection({ x: 1, y: 0 });
//     setScore(0);
//     setIsPlaying(false);
//   };

//   // Спавн power-up
//   useEffect(() => {
//     if (!isPlaying) return;
//     const spawn = () => {
//       if (Math.random() < 0.3) {
//         const types: PowerUpType[] = ['speed', 'slow', 'shield', 'magnet', 'double'];
//         setPowerUp({
//           x: Math.floor(Math.random() * GRID_SIZE),
//           y: Math.floor(Math.random() * GRID_SIZE),
//           type: types[Math.floor(Math.random() * types.length)]
//         });
//         setTimeout(() => setPowerUp(null), 10000);
//       }
//     };
//     const id = setInterval(spawn, 12000);
//     spawn();
//     return () => clearInterval(id);
//   }, [isPlaying]);

//   const gameLoop = useCallback(() => {
//     setSnake(current => {
//       const head = current[0];
//       const newHead = [head[0] + direction.x, head[1] + direction.y];

//       // Стіна = кінець
//       if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
//         setIsPlaying(false);
//         sound.play('game-over');
//         saveScore(playerID, score, current.length);
//         return current;
//       }

//       const newSnake = [newHead, ...current];

//       // Їжа
//       if (newHead[0] === food[0] && newHead[1] === food[1]) {
//         sound.play('eat');
//         setScore(s => s + 10);
//         setFood([Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]);
        
//         if (score + 10 >= 100) {
//           unlockAchievement(playerID, 'century', 'Набрати 100 очок!', 'trophy');
//         }
//       } else {
//         newSnake.pop();
//       }

//       // Power-up
//       if (powerUp && newHead[0] === powerUp.x && newHead[1] === powerUp.y) {
//         sound.play('powerup');
//         setScore(s => s + 50);
//         setPowerUp(null);
//         unlockAchievement(playerID, 'power_master', 'Зібрати power-up!', 'zap');
//       }

//       return newSnake;
//     });
//   }, [direction, food, powerUp, playerID, score]);

//   useEffect(() => {
//     if (isPlaying) {
//       intervalRef.current = setInterval(gameLoop, 150);
//     } else {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     }
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [isPlaying, gameLoop]);

//   useEffect(() => {
//     setSoundEnabled(sound.enabled);
//   }, [sound.enabled]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.score}>Рахунок: {score}</Text>
//         <View style={styles.buttons}>
//           <TouchableOpacity onPress={() => sound.toggle()} style={{ marginRight: 16 }}>
//             {soundEnabled ? <Volume2 color="#4ade80" size={32} /> : <VolumeX color="#ef4444" size={32} />}
//           </TouchableOpacity>

//           <TouchableOpacity onPress={resetGame}>
//             <RotateCcw color="#60a5fa" size={32} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
//             <Trophy color="#fbbf24" size={32} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
//             <Medal color="#8b5cf6" size={32} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.board}>
//         {snake.map((seg, i) => (
//           <View key={i} style={[styles.snake, { left: seg[0] * CELL_SIZE, top: seg[1] * CELL_SIZE }]} />
//         ))}
//         <View style={[styles.food, { left: food[0] * CELL_SIZE, top: food[1] * CELL_SIZE }]} />

//         {powerUp && (
//           <View style={{ position: 'absolute', left: powerUp.x * CELL_SIZE, top: powerUp.y * CELL_SIZE }}>
//             <PowerUp type={powerUp.type} />
//           </View>
//         )}
//       </View>

//       {/* СТРІЛКИ — БЕЗПЕЧНІ */}
//       <View style={styles.arrows}>
//         <View />
//         <TouchableOpacity
//           onPress={() => direction.y === 0 && setDirection({ x: 0, y: -1 })}
//           style={styles.arrowButton}
//         >
//           <ArrowUp color="#e0e0e0" size={40} />
//         </TouchableOpacity>
//         <View />

//         <View style={{ flexDirection: 'row', gap: 40 }}>
//           <TouchableOpacity
//             onPress={() => direction.x === 0 && setDirection({ x: -1, y: 0 })}
//             style={styles.arrowButton}
//           >
//             <ArrowLeft color="#e0e0e0" size={40} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => direction.y === 0 && setDirection({ x: 0, y: 1 })}
//             style={styles.arrowButton}
//           >
//             <ArrowDown color="#e0e0e0" size={40} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => direction.x === 0 && setDirection({ x: 1, y: 0 })}
//             style={styles.arrowButton}
//           >
//             <ArrowRight color="#e0e0e0" size={40} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.controls}>
//         {!isPlaying ? (
//           <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(true)}>
//             <Play size={40} color="white" />
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity style={styles.pauseButton} onPress={() => setIsPlaying(false)}>
//             <Pause size={40} color="white" />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#064e3b' },
//   header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
//   score: { color: 'white', fontSize: 24, fontWeight: 'bold' },
//   buttons: { flexDirection: 'row', gap: 16, alignItems: 'center' },
//   board: { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, backgroundColor: '#000', position: 'relative', alignSelf: 'center', marginTop: 40 },
//   snake: { position: 'absolute', width: CELL_SIZE - 2, height: CELL_SIZE - 2, backgroundColor: '#10b981', borderRadius: 4 },
//   food: { position: 'absolute', width: CELL_SIZE - 2, height: CELL_SIZE - 2, backgroundColor: '#ef4444', borderRadius: CELL_SIZE },
//   arrows: { alignItems: 'center', marginTop: 30 },
//   arrowButton: { padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
//   controls: { alignItems: 'center', marginTop: 40 },
//   playButton: { backgroundColor: '#10b981', padding: 20, borderRadius: 50 },
//   pauseButton: { backgroundColor: '#f59e0b', padding: 20, borderRadius: 50 },
// });