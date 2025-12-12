import { useEffect, useState } from 'react';

const UNITY_GAME_ID = 'fc38887a-cf19-44f7-ba89-553a577d5984'; // ← мій Game ID з Unity Ads (безкоштовно)
const UNITY_PLACEMENT_ID = 'Rewarded_Web';

export default function RewardedAd({ onReward, onClose }) {
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.unityads.unity3d.com/v1/unityads.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
    if (window.UnityAds) {
      window.UnityAds.init(UNITY_GAME_ID);
      
      const checkReady = setInterval(() => {
        if (window.UnityAds.isReady(UNITY_PLACEMENT_ID)) {
          setReady(true);
          setIsLoading(false);
          clearInterval(checkReady);
        }
      }, 500);
        setTimeout(() => {
          clearInterval(checkReady);
          setIsLoading(false); // на випадок таймауту
        }, 10000);
      }
    };

  return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const showAd = () => {
  if (ready && window.UnityAds) {
    window.UnityAds.show(UNITY_PLACEMENT_ID, {
      onComplete: () => {
        onReward();
        onClose?.();
      },
      onError: (error) => {
        console.error('Unity Ads error:', error);
        alert('Реклама не завантажилась. Спробуй ще раз!');
        onClose?.();
      }
    });
  } else {
    alert('Реклама ще не готова. Зачекай 5-10 секунд і спробуй ще раз.');
    onClose?.();
  }
};

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl p-10 max-w-lg text-center shadow-2xl border-4 border-yellow-400">
        <div className="text-8xl mb-6 animate-bounce">TV</div>
        <h2 className="text-4xl font-bold text-yellow-400 mb-4">Безкоштовне продовження!</h2>
        <p className="text-white text-xl mb-8">Дивитись рекламу → +100 очок + REVIVE</p>

        <button
          onClick={showAd}
          disabled={isLoading}
          className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all transform ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-2xl'
          } text-white`}
        >
          {isLoading ? 'Завантаження...' : 'ДИВИТИСЬ РЕКЛАМУ'}
        </button>

        <button onClick={onClose} className="mt-6 text-white/70 hover:text-white text-lg underline">
          Ні, дякую
        </button>
      </div>
    </div>
  );
}