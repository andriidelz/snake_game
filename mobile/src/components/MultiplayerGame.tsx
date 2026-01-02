import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { connectWS, sendCommand, disconnectWS, sendMessage, sendDirection } from '../services/websocket';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

export default function MultiplayerGame({ route }: { route: any }) {
  const playerID = route.params?.playerID || 'mobile_' + Date.now();
  const roomID = 'global-room-1';

  const [gameState, setGameState] = useState<{
    snakes: Record<string, number[][]>;
    food: number[];
    powerups: any[]; // { Position: number[] }
    gameOver?: boolean;
  }>({
    snakes: {},
    food: [10, 10],
    powerups: [],
  });
  // const [isPlaying, setIsPlaying] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('Connecting WS for player:', playerID);
    const ws = connectWS(roomID, playerID, (data) => {
      console.log('Received game state:', data);
      setGameState(data);
      setConnected(true);
    });

    return () => disconnectWS();
  }, [playerID]);

const sendDirection = (dir: { x: number; y: number }) => {
    console.log('Sending direction:', dir);
    sendMessage({ dir });
  };

const resetGame = () => {
  sendCommand('reset');
};

  const onlineCount = Object.keys(gameState.snakes || {}).length;

  if (!connected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Підключення до сервера...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Мультиплеєр • Онлайн: {onlineCount}
      </Text>

      <View style={styles.board}>
        {/* Змійки */}
        {Object.entries(gameState.snakes).map(([id, snake]) =>
          snake.map((seg, i) => (
            <View
              key={`${id}-${i}`}
              style={[
                styles.snakeSegment,
                {
                  left: seg[0] * CELL_SIZE + 1,
                  top: seg[1] * CELL_SIZE + 1,
                },
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
              {
                left: gameState.food[0] * CELL_SIZE + 1,
                top: gameState.food[1] * CELL_SIZE + 1,
              },
            ]}
          />
        )}

        {/* Power-ups */}
        {gameState.powerups?.map((pu: any, i: number) => (
          <View
            key={`power-${i}`}
            style={[
              styles.powerup,
              {
                left: pu.Position[0] * CELL_SIZE + 1,
                top: pu.Position[1] * CELL_SIZE + 1,
              },
            ]}
          />
        ))}

        {/* Game Over */}
        {gameState.gameOver && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <TouchableOpacity onPress={resetGame} style={styles.restartBtn}>
              <RotateCcw size={40} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>    

      {/* Керування */}
      <View style={styles.controls}>
        {/* Вгору */}
        <TouchableOpacity onPress={() => sendDirection({ x: 0, y: -1 })} style={styles.dirBtn}>        
          <Text style={styles.dirText}>↑</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 20 }}>
          <TouchableOpacity onPress={() => sendDirection({ x: -1, y: 0 })} style={styles.dirBtn}>          
            <Text style={styles.dirText}>←</Text>
          </TouchableOpacity>          

          <TouchableOpacity onPress={() => sendDirection({ x: 1, y: 0 })} style={styles.dirBtn}>
            <Text style={styles.dirText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Вниз */}
        <TouchableOpacity onPress={() => sendDirection({ x: 0, y: 1 })} style={styles.dirBtn}>        
          <Text style={styles.dirText}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b', paddingTop: 40, alignItems: 'center' },
  buttonRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  controlBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 16, marginTop: 8 },
  title: { color: '#fbbf24', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  board: {
    width: GRID_SIZE * CELL_SIZE + 20,
    height: GRID_SIZE * CELL_SIZE + 20,
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
  powerup: {
    position: 'absolute',
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    backgroundColor: '#ffd700',
    borderRadius: 99,
    shadowColor: '#ffd700',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: { color: '#ef4444', fontSize: 48, fontWeight: 'bold' },
  restartBtn: { marginTop: 30, backgroundColor: '#10b981', padding: 20, borderRadius: 50 },
  controls: { marginTop: 40, alignItems: 'center' },
  dirBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: 50,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
});