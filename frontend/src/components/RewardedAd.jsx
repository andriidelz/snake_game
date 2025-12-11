import { useState } from 'react';

/**
 * @param {{ onReward: () => void, onClose?: () => void }} props
 */

export default function RewardedAd({ onReward, onClose }) {
  const [watching, setWatching] = useState(false);

  const watchAd = () => {
    setWatching(true);
    
    // Імітація реклами (3 сек для тесту)
    setTimeout(() => {
      onReward(); // ← НАГОРОДА!
      setWatching(false);
      onClose?.();
    }, 3000); // 3 сек для тесту — в проді можна 30 сек
  };

  const close = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl p-10 max-w-lg text-center shadow-2xl border-4 border-yellow-400 transform scale-100 hover:scale-105 transition-all">
        <div className="text-8xl mb-6 animate-bounce">TV</div>
        <h2 className="text-4xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
          Безкоштовне продовження!
        </h2>
        <p className="text-white text-xl mb-8">
          +100 очок + REVIVE за перегляд реклами
        </p>

        <div className="bg-black/50 rounded-2xl h-48 mb-8 flex items-center justify-center">
          <div className="text-6xl text-white/70 animate-pulse">
            {watching ? 'VIDEO' : 'VIDEO'}
          </div>
        </div>

        <button
          onClick={watchAd}
          disabled={watching}
          className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all transform ${
            watching 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-2xl'
          } text-white`}
        >
          {watching ? 'Дивлюсь... (3 сек)' : 'ДИВИТИСЬ РЕКЛАМУ'}
        </button>

        <button
          onClick={close}
          className="mt-4 text-white/70 hover:text-white text-sm underline"
        >
          Ні, дякую
        </button>
      </div>
    </div>
  );
}