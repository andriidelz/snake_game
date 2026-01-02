import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { View, Platform } from 'react-native';

const isDev = __DEV__;

const androidBannerId = isDev
  ? TestIds.BANNER 
  : 'ca-app-pub-5811327077406599/5691847709'; // Замінив на свій реальний Android Banner ID з AdMob

const iosBannerId = isDev 
  ? TestIds.BANNER 
  : 'ca-app-pub-5811327077406599/4730119824'; // Замінив на свій реальний iOS Banner ID з AdMob

const adUnitId = Platform.OS === 'ios' ? iosBannerId : androidBannerId;

export default function AdBanner() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
