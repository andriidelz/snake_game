import { View, Text, TouchableOpacity } from 'react-native';
import { Trophy } from 'lucide-react-native';

export default function Tournament() {
  return (
    <View style={{ flex: 1, backgroundColor: '#064e3b', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <Trophy size={80} color="#fbbf24" />
      <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 20 }}>
        Турнір "Легенда Змійки"
      </Text>
      <Text style={{ color: '#94a3b8', fontSize: 18, textAlign: 'center', marginVertical: 20 }}>
        Початок: 10 грудня 2025
      </Text>
      <Text style={{ color: '#10b981', fontSize: 24, fontWeight: 'bold' }}>
        Призовий фонд: 5 NFT скінів!
      </Text>

      <TouchableOpacity style={{ backgroundColor: '#10b981', padding: 20, borderRadius: 20, marginTop: 40 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Зареєструватись</Text>
      </TouchableOpacity>
    </View>
  );
}