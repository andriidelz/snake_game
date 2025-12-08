import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Trophy, Medal, Zap, Crown, Flame, Target } from 'lucide-react-native';

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
};

export default function Achievements({ playerID }: { playerID: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/achievements?player_id=${playerID}`);
        // Така ж історія: на телефоні замінити localhost на IP компа:
        // http://192.168.1.100:8080/api/achievements?...

        const data = await res.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.warn('Не вдалося завантажити досягнення');
      } finally {
        setLoading(false);
      }
    };

    if (playerID) fetchAchievements();
  }, [playerID]);

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy color="#fbbf24" size={40} />;
      case 'medal': return <Medal color="#94a3b8" size={40} />;
      case 'zap': return <Zap color="#a78bfa" size={40} />;
      case 'crown': return <Crown color="#f59e0b" size={40} />;
      case 'flame': return <Flame color="#ef4444" size={40} />;
      case 'target': return <Target color="#10b981" size={40} />;
      default: return <Trophy color="#fbbf24" size={40} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loading}>Завантаження досягнень...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Твої досягнення</Text>
      <Text style={styles.count}>
        Розблоковано: {achievements.length} з 8
      </Text>

      <FlatList
        data={achievements}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.achievement}>
            <View style={styles.icon}>
              {getIcon(item.icon)}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.date}>
                {new Date(item.unlocked_at).toLocaleDateString('uk-UA')}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Поки що немає досягнень</Text>
            <Text style={styles.emptyText}>Грай і стань легендою!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b', padding: 20 },
  title: { color: '#fbbf24', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  count: { color: '#94a3b8', textAlign: 'center', marginBottom: 30, fontSize: 18 },
  achievement: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.2)',
  },
  icon: { marginRight: 16, justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  desc: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  date: { color: '#64748b', fontSize: 12, marginTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { color: '#10b981', marginTop: 20, fontSize: 18 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: '#94a3b8', fontSize: 24, fontWeight: 'bold' },
  emptyText: { color: '#64748b', fontSize: 16, marginTop: 10 },
});