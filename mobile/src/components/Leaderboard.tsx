import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Trophy, Medal, Crown } from 'lucide-react-native';

type LeaderboardEntry = {
  player_id: string;
  score: number;
  length: number;
  timestamp: string;
};

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/leaderboard?limit=10');
        // Якщо запускати на реальному телефоні — треба замінити localhost на IP компа:
        // const response = await fetch('http://192.168.1.100:8080/api/leaderboard?limit=10');

        if (!response.ok) throw new Error('Не вдалося завантажити лідерборд');

        const data = await response.json();
        setScores(data); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка мережі');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return <Crown color="#fbbf24" size={32} />;
      case 1: return <Trophy color="#94a3b8" size={32} />;
      case 2: return <Medal color="#f59e0b" size={32} />;
      default: return <Text style={styles.position}>{index + 1}</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Завантаження лідерів...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Помилка: {error}</Text>
        <Text style={styles.hint}>Перевір підключення до сервера</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Таблиця лідерів</Text>

      <FlatList
        data={scores}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.row, index < 3 && styles.top3]}>
            <View style={styles.rank}>
              {getMedal(index)}
            </View>

            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {item.player_id.replace('mobile_', '').slice(0, 12)}
              </Text>
              <Text style={styles.details}>
                Довжина: {item.length} • {new Date(item.timestamp).toLocaleDateString('uk-UA')}
              </Text>
            </View>

            <Text style={styles.score}>{item.score}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Поки що немає результатів. Будь першим!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b', padding: 20 },
  title: { color: '#fbbf24', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 10 },
  top3: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: '#fbbf24' },
  rank: { width: 50, alignItems: 'center' },
  position: { color: '#94a3b8', fontSize: 24, fontWeight: 'bold' },
  playerInfo: { flex: 1, marginLeft: 10 },
  playerName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  details: { color: '#94a3b8', fontSize: 12 },
  score: { color: '#4ade80', fontSize: 28, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#10b981', marginTop: 20, fontSize: 18 },
  errorText: { color: '#ef4444', fontSize: 18, textAlign: 'center' },
  hint: { color: '#94a3b8', marginTop: 10 },
  empty: { color: '#94a3b8', textAlign: 'center', fontSize: 18, marginTop: 50 },
});