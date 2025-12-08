import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { getLeaderboard } from '../services/api';

const Leaderboard = ({ onBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(10);
      setScores(data || []);
    } catch (err) {
      setError('Не вдалося завантажити таблицю лідерів');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="text-yellow-400" size={24} />;
      case 1: return <Medal className="text-gray-400" size={24} />;
      case 2: return <Award className="text-orange-600" size={24} />;
      default: return <span className="text-white font-bold">{index + 1}</span>;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          Таблиця лідерів
        </h2>
        <button
          onClick={loadLeaderboard}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-white">Завантаження...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && scores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-white">Поки що немає результатів</p>
          <p className="text-white/60 mt-2">Будьте першим!</p>
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div
              key={score.id || index}
              className={`
                flex items-center justify-between p-4 rounded-lg
                ${index < 3 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent' : 'bg-white/5'}
                hover:bg-white/10 transition-all
              `}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 flex items-center justify-center">
                  {getMedalIcon(index)}
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-bold">
                    {score.player_id || `Player ${index + 1}`}
                  </div>
                  <div className="text-white/60 text-sm">
                    Довжина: {score.length || 'N/A'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {score.score}
                  </div>
                  {score.timestamp && (
                    <div className="text-white/60 text-xs">
                      {formatDate(score.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold"
        >
          ← Повернутись до гри
        </button>
      )}
    </div>
  );
};

export default Leaderboard;