import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Flame, Target, Award } from 'lucide-react';
import { getAchievements } from '../services/api';

const iconMap = {
  "🏆": <Trophy className="text-yellow-400" size={32} />,
  "⭐": <Star className="text-yellow-500" size={32} />,
  "⚡": <Zap className="text-blue-400" size={32} />,
  "🔥": <Flame className="text-orange-500" size={32} />,
  "🎯": <Target className="text-red-400" size={32} />,
  "🏅": <Award className="text-purple-400" size={32} />
};

const Achievements = ({ playerID, onBack }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerID) return;
    getAchievements(playerID).then(data => {
      setAchievements(data);
      setLoading(false);
    });
  }, [playerID]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className="text-white">Завантаження досягнень...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-lg p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
        <Trophy className="text-yellow-400" size={36} />
        Досягнення
      </h2>

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-white/70 text-xl">Поки що немає досягнень</p>
          <p className="text-white/50 mt-2">Грай та розблокуй перше!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach, index) => (
            <div
              key={ach.id || index}
              className="bg-white/10 rounded-xl p-5 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {iconMap[ach.icon] || <Trophy className="text-yellow-400" size={32} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{ach.name}</h3>
                  <p className="text-white/70 text-sm">{ach.description}</p>
                  <p className="text-white/50 text-xs mt-2">
                    {new Date(ach.unlocked_at).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8 text-white/70">
        Всього розблоковано: <span className="text-yellow-400 font-bold text-2xl">{achievements.length}</span>
      </div>      
        <div className="text-center mt-10">
        <button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl px-10 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all"
        >
          ← Повернутись до гри
        </button>
        </div>
      </div> 
  );
};

export default Achievements;