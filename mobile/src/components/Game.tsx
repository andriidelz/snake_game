import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Modal } from 'react-native';
import { Play, Pause, RotateCcw, Trophy, Medal, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Shield, Magnet, Gem, Snail } from 'lucide-react-native';
import PowerUp from './PowerUp';
import { saveScore, unlockAchievement } from '../services/api';
import { sound } from '../utils/sound';
import SkinSelector from './SkinSelector';
import { Skin } from '../types/skin';
// import * as AdMobRewarded from 'react-native-google-mobile-ads';
import RewardedAd from './RewardedAd';
import { trackEvent } from '../utils/metrics';

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
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const [currentSkin, setCurrentSkin] = useState<Skin>({
  id: 'default',
  color: '#10b981',
  light: '#34d399',
  name: 'Зелений',
});

  const openRewardedAd = () => setShowRewardedAd(true);
  const closeRewardedAd = () => setShowRewardedAd(false);
  const handleReward = () => {
    setScore(s => s + 100);
    Vibration.vibrate(200);
    sound.play('achievement');
    setIsPlaying(true);
    setGameOver(false);
  };

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
        setGameOver(true);
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
    else if (intervalRef.current !== null) clearInterval(intervalRef.current); intervalRef.current = null;
    return () => {
  if (intervalRef.current !== null) clearInterval(intervalRef.current); intervalRef.current = null;
};
  }, [isPlaying, gameLoop, speed]);

  useEffect(() => setSoundEnabled(sound.enabled), [sound.enabled]);

  useEffect(() => {
  if (showAdBreak) {
    const timer = setTimeout(() => setShowAdBreak(false), 5000);
    return () => clearTimeout(timer);
  }
}, [showAdBreak]);

useEffect(() => {
  trackEvent('game_start');
}, []);

useEffect(() => {
  if (gameOver) trackEvent('game_over', { score, length: snake.length });
}, [gameOver]);

useEffect(() => {
  if (score > highScore) trackEvent('new_record', { score });
}, [score]);

  return (
    <View style={styles.container}>
      {/* СТАТИСТИКА */}
      <View style={styles.header}>
        <View>
          <Text style={styles.score}>Рахунок: {score}</Text>
          <Text style={styles.highScore}>Рекорд: {highScore}</Text>
          <Text style={styles.length}>Довжина: {snakeLength}</Text>
          <Text style={styles.gamesPlayed}>Ігор зіграно: {gamesPlayed}</Text>
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

      {/* GAME OVER — З REWARDED ADS */}
      {gameOver && (
      <Modal transparent animationType="fade">
        <View style={styles.adOverlay}>
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>💀 GAME OVER!</Text>
            <Text style={styles.gameOverScore}>Рахунок: {score}</Text>
            <TouchableOpacity onPress={() => setShowRewardedAd(true)} style={styles.rewardBtn}>
              <Text style={styles.rewardBtnText}>📺 Revive +100 очок</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetGame} style={styles.restartBtn}>
              <Text style={styles.restartBtnText}>Грати знову</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      )}
      {/* RewardedAd модалка — завжди в рендері */}
      <RewardedAd
        visible={showRewardedAd}
        onReward={handleReward}
        onClose={closeRewardedAd}
      /> */

      {/* REWARDED AD MODAL — НОВА
      <Modal visible={showRewardedAd} transparent animationType="fade">
        <View style={styles.adOverlay}>
          <View style={styles.rewardAdBox}>
            <Text style={styles.adTitle}>📺 Дивитись рекламу?</Text>
            <Text style={styles.adText}>+100 очок + REVIVE!</Text>
            <TouchableOpacity onPress={watchRewardedAd} style={styles.rewardBtn}>
              <Text style={styles.rewardBtnText}>ДИВИТИСЬ (30 сек)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

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
  gamesPlayed: { color: '#e5e5e5', fontSize: 18, marginTop: 4 },
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
  rewardAdBox: { backgroundColor: '#fff', padding: 40, borderRadius: 24, alignItems: 'center', width: '85%', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 30 },
  rewardBtn: { backgroundColor: '#10b981', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 20, marginTop: 20 },
  rewardBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  restartBtn: { backgroundColor: '#6b7280', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 20 },
  restartBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  gameOverBox: { backgroundColor: '#fff', padding: 40, borderRadius: 24, alignItems: 'center' },
  gameOverTitle: { fontSize: 36, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  gameOverScore: { fontSize: 24, color: '#10b981', marginBottom: 30 },
});
