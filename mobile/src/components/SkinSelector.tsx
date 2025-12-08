import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Skin } from '../types/skin';

const skins = [
  { id: 'default', color: '#10b981', light: '#34d399', name: 'Зелений' },
  { id: 'red', color: '#ef4444', light: '#f87171', name: 'Червоний' },
  { id: 'blue', color: '#3b82f6', light: '#60a5fa', name: 'Синій' },
  { id: 'purple', color: '#8b5cf6', light: '#a78bfa', name: 'Фіолетовий' },
  { id: 'yellow', color: '#f59e0b', light: '#fbbf24', name: 'Жовтий' },
  { id: 'pink', color: '#ec4899', light: '#f472b6', name: 'Рожевий' },
  { id: 'cyan', color: '#06b6d4', light: '#22d3ee', name: 'Блакитний' },
  { id: 'orange', color: '#f97316', light: '#fb923c', name: 'Оранжевий' },
  { id: 'rainbow', color: '#8b5cf6', name: 'Веселка', rainbow: true },
] as const;

interface SkinSelectorProps {
  onSelect: (skin: Skin) => void;
  selectedSkin?: string;
}

export default function SkinSelector({ onSelect, selectedSkin = 'default' }: SkinSelectorProps) {
  const [selected, setSelected] = useState(selectedSkin);

  const handleSelect = (skin: Skin) => {
    setSelected(skin.id);
    onSelect(skin);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Обери скін змійки</Text>
      <View style={styles.grid}>
        {skins.map(skin => (
          <TouchableOpacity
            key={skin.id}
            onPress={() => handleSelect(skin as Skin)}
            style={[
              styles.card,
              selected === skin.id && styles.selected,
            ]}
          >
            <View style={styles.preview}>
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    {
                        backgroundColor: 'rainbow' in skin && (skin as any).rainbow
                            ? `hsl(${(i * 90) % 360}, 100%, 60%)`
                            : i === 0
                            ? skin.color
                            : 'light' in skin
                            ? (skin as any).light
                            : skin.color,
                        transform: [{ translateX: (i - 1.5) * 18 }],
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.name}>{skin.name}</Text>

            {selected === skin.id && (
              <View style={styles.check}>
                <Text style={styles.checkText}>Check</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  card: {
    width: 100,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.2)',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  preview: { flexDirection: 'row', marginBottom: 8, height: 30, alignItems: 'center' },
  segment: {
    width: 20,
    height: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  name: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  check: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fbbf24',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { color: 'black', fontWeight: 'bold', fontSize: 20 },
});