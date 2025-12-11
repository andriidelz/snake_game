import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AdEventType } from 'react-native-google-mobile-ads';
import { sound } from '../utils/sound';

const AD_UNIT_ID = __DEV__ ? TestIds.REWARDED : 'міЙ-реальний-id';

interface Props {
  visible: boolean;
  onReward: () => void;
  onClose: () => void;
}

export default function RewardedAdComponent({ visible, onReward, onClose }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const rewardedAd = useMemo(() => {
    return RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });
  }, []);

  useEffect(() => {
    if (!visible) {
      setIsLoaded(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsLoaded(true);
        setLoading(false);
        console.log('Rewarded ad loaded!');
        sound.play('ad-ready');
      }
    );

    const unsubscribeEarnedReward = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward!', reward);
        sound.play('achievement');
        Alert.alert('Вітаємо!', 'Ти отримав 100 очок + REVIVE!');
        onReward();
      }
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Rewarded ad closed');
        onClose();
        setIsLoaded(false);
        setLoading(false);
        rewardedAd.load(); // Завантажуємо наступну
      }
    );

    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarnedReward();
      unsubscribeClosed();
    };
  }, [visible, onReward, onClose, rewardedAd]);

  const watchAd = () => {
    if (isLoaded) {
      rewardedAd.show();
      sound.play('ad-start');
    } else if (loading) {
      Alert.alert('Завантаження', 'Реклама завантажується...');
    } else {
      // Якщо не завантажилось — даємо бонус відразу
      Alert.alert('Нагорода!', 'Ти отримав 100 очок!');
      onReward();
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.emoji}>📺</Text>
          <Text style={styles.title}>Безкоштовне продовження!</Text>
          <Text style={styles.desc}>+100 очок + REVIVE</Text>

          <TouchableOpacity style={[styles.watchBtn, loading || !isLoaded ? styles.disabledBtn : {}]} 
            onPress={watchAd} 
            disabled={loading}
          >
            <Text style={styles.watchText}>
              {loading ? 'Завантаження...' : isLoaded ? 'ДИВИТИСЬ РЕКЛАМУ (30 сек)' : 'Спробуй ще раз'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.skip}>Ні, дякую</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  box: {
    backgroundColor: '#1a0033',
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    width: '90%',
    borderWidth: 4,
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 30,
  },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { color: '#fbbf24', fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  desc: { color: '#4ade80', fontSize: 22, marginBottom: 40, textAlign: 'center' },
  watchBtn: { backgroundColor: '#10b981', paddingHorizontal: 40, paddingVertical: 20, borderRadius: 20, marginBottom: 20, opacity: 0.7 },
  disabledBtn: { backgroundColor: '#6b7280', opacity: 0.7 },
  watchText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  skip: { color: '#94a3b8', fontSize: 16 },
});


//  const showRealAd = () => {
//     => {
//     setLoading(true);

//     // ПОТІМ ВСТАВИТИ СЮДИ МІЙ КОД ВІД ADSENSE!!!
//     (window.adsbygoogle = window.adsbygoogle || []).push({
//       google_ad_client: "ca-pub-XXXXXXXXXXXXXXXX", // ← твій ID
//       overlay: true,
//       onReward: () => {
//         onReward(); // +100 очок
//         setLoading(false);
//         onClose?.();
//       }
//     });
//   };