// mobile/src/utils/metrics.ts
import { EXPO_PUBLIC_API_URL } from '@env';

interface MetricData {
  [key: string]: any;
}

export const trackEvent = async (event: string, data: MetricData = {}) => {
  try {
    await fetch(`${EXPO_PUBLIC_API_URL}/metrics/mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        player_id: data.player_id || 'mobile_player_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    // Не падаємо — це аналітика, не критична логіка
    console.debug('Metrics failed:', error);
  }
};