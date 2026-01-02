// import { EXPO_PUBLIC_API_URL } from '@env';

interface MetricData {
  [key: string]: any;
}

export const trackEvent = async (event: string, data: MetricData = {}) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  try {
    if (!apiUrl) {
      console.debug('Metrics: API URL not found in environment');
      return;
    }

    await fetch(`${apiUrl}/metrics/mobile`, {
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
    console.debug('Metrics failed:', error);
  }
};