import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { View } from 'react-native';

const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-3940256099942544/6300978111'; // Заміни на свій реальний ID з AdMob

export default function AdBanner() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

// import { View, Text } from 'react-native';

// export default function AdBanner() {
//   return (
//     <View style={{ backgroundColor: '#1f2937', padding: 20, alignItems: 'center' }}>
//       <Text style={{ color: '#94a3b8' }}>РЕКЛАМНЕ МІСЦЕ</Text>
//       <Text style={{ color: '#64748b', fontSize: 12 }}>Google AdSense</Text>
//     </View>
//   );
// }