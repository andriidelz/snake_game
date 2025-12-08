import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { connectWS, sendDirection, disconnectWS } from '../services/websocket';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

export default function MultiplayerGame({ route }: { route: any }) {
  const playerID = route.params?.playerID || 'mobile_' + Date.now();

  const [gameState, setGameState] = useState<{ snakes: Record<string, number[][]>; food: number[] }>({
    snakes: {},
    food: [10, 10],
  });
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const ws = connectWS(playerID, "mobile-room", (data) => {
      setGameState(data);
    });

    return () => disconnectWS();
  }, [playerID]);

  const handleDirection = (dir: { x: number; y: number }) => {
    sendDirection(dir);
  };

  const onlineCount = Object.keys(gameState.snakes || {}).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Мультиплеєр • Онлайн: {onlineCount}
      </Text>

      <View style={styles.board}>
        {/* Усі змійки */}
        {Object.entries(gameState.snakes).map(([id, snake]) =>
          snake.map((seg, i) => (
            <View
              key={`${id}-${i}`}
              style={[
                styles.snakeSegment,
                { left: seg[0] * CELL_SIZE, top: seg[1] * CELL_SIZE },
                id === playerID ? styles.mySnake : styles.otherSnake,
              ]}
            />
          ))
        )}

        {/* Їжа */}
        {gameState.food && (
          <View
            style={[
              styles.food,
              { left: gameState.food[0] * CELL_SIZE, top: gameState.food[1] * CELL_SIZE },
            ]}
          />
        )}
      </View>

      {/* Керування */}
      <View style={styles.controls}>
        {/* Вгору */}
        <TouchableOpacity
          onPress={() => handleDirection({ x: 0, y: -1 })}
          style={styles.dirBtn}
        >
          <Text style={styles.dirText}>Up Arrow</Text>
        </TouchableOpacity>

        {/* Горизонталь */}
        <View style={{ flexDirection: 'row', gap: 30 }}>
          <TouchableOpacity
            onPress={() => handleDirection({ x: -1, y: 0 })}
            style={styles.dirBtn}
          >
            <Text style={styles.dirText}>Left Arrow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPlaying(p => !p)}
            style={styles.dirBtn}
          >
            {isPlaying ? (
              <Pause size={36} color="white" />
            ) : (
              <Play size={36} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDirection({ x: 1, y: 0 })}
            style={styles.dirBtn}
          >
            <Text style={styles.dirText}>Right Arrow</Text>
          </TouchableOpacity>
        </View>

        {/* Вниз */}
        <TouchableOpacity
          onPress={() => handleDirection({ x: 0, y: 1 })}
          style={styles.dirBtn}
        >
          <Text style={styles.dirText}>Down Arrow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b', paddingTop: 40, alignItems: 'center' },
  title: { color: '#fbbf24', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  board: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    backgroundColor: '#000',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  snakeSegment: {
    position: 'absolute',
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    borderRadius: 6,
  },
  mySnake: { backgroundColor: '#10b981', borderWidth: 1, borderColor: '#34d399' },
  otherSnake: { backgroundColor: '#ef4444', opacity: 0.85 },
  food: {
    position: 'absolute',
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    backgroundColor: '#fbbf24',
    borderRadius: 99,
    shadowColor: '#fbbf24',
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 15,
  },
  controls: { marginTop: 40, alignItems: 'center' },
  dirBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: 50,
    minWidth: 80,
    alignItems: 'center',
  },
  dirText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
});