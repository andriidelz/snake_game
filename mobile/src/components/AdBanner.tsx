import { View, Text } from 'react-native';

export default function AdBanner() {
  return (
    <View style={{ backgroundColor: '#1f2937', padding: 20, alignItems: 'center' }}>
      <Text style={{ color: '#94a3b8' }}>РЕКЛАМНЕ МІСЦЕ</Text>
      <Text style={{ color: '#64748b', fontSize: 12 }}>Google AdSense</Text>
    </View>
  );
}