import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Trophy, Users, Timer } from 'lucide-react-native';

type Tournament = {
  id: string;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  max_players: number;
  prize: string;
  status: string;
  participants: number;
};

export default function Tournaments({ playerID }: { playerID: string }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://192.168.1.100:8080/api/tournaments`) // ← твій IP
      .then(r => r.json())
      .then(data => {
        setTournaments(data.tournaments);
        setLoading(false);
      });
  }, []);

  const join = async (id: string) => {
    try {
      await fetch('http://192.168.1.100:8080/api/tournament/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_id: id, player_id: playerID }),
      });
      Alert.alert('Успіх!', 'Ти приєднався до турніру!');
      setTournaments(prev => prev.map(t => 
        t.id === id ? { ...t, participants: t.participants + 1 } : t
      ));
    } catch {
      Alert.alert('Помилка', 'Не вдалося приєднатись');
    }
  };

  if (loading) return <Text style={styles.center}>Завантаження...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Турніри</Text>
      <FlatList
        data={tournaments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.prize}>Приз: {item.prize}</Text>
            <View style={styles.info}>
              <Timer size={20} color="#94a3b8" />
              <Text style={styles.infoText}>
                {new Date(item.start_time).toLocaleString('uk-UA')}
              </Text>
            </View>
            <View style={styles.info}>
              <Users size={20} color="#94a3b8" />
              <Text style={styles.infoText}>
                {item.participants}/{item.max_players}
              </Text>
            </View>
            <TouchableOpacity onPress={() => join(item.id)} style={styles.btn}>
              <Text style={styles.btnText}>ПРИЄДНАТИСЬ</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#064e3b', padding: 20 },
  title: { color: '#fbbf24', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 20, marginBottom: 16 },
  name: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  prize: { color: '#10b981', fontSize: 20, marginVertical: 8 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  infoText: { color: '#94a3b8', fontSize: 16 },
  btn: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, marginTop: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  center: { flex: 1, textAlign: 'center', color: 'white', fontSize: 20, marginTop: 50 },
});