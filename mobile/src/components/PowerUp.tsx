import { View, StyleSheet } from 'react-native';
import { Zap, Shield, Magnet, Gem, Snail } from 'lucide-react-native';

const POWER_UPS = {
  speed:   { icon: <Zap    color="#fff" size={22} />, color: '#fbbf24' },
  slow:    { icon: <Snail  color="#fff" size={22} />, color: '#3b82f6' },
  shield:  { icon: <Shield color="#fff" size={22} />, color: '#8b5cf6' },
  magnet:  { icon: <Magnet color="#fff" size={22} />, color: '#ec4899' },
  double:  { icon: <Gem    color="#fff" size={22} />, color: '#06b6d4' },
};

type PowerUpType = keyof typeof POWER_UPS;

export default function PowerUp({ type }: { type: PowerUpType }) {
  const config = POWER_UPS[type];

  return (
    <View style={[styles.container, { backgroundColor: config.color }]}>
      <View style={styles.glow} />
      {config.icon}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 20,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 18,
  },
});