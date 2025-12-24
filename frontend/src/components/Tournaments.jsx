import { useState, useEffect } from 'react';
import { Trophy, Users, Timer, Zap, Crown, Flame } from 'lucide-react';
import { getTournaments, joinTournament } from '../services/api';

const Tournaments = ({ playerID }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    getTournaments().then(data => {
      setTournaments(data.tournaments || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleJoin = async (tournamentId) => {
    setJoining(tournamentId);
    try {
      await joinTournament(playerID, tournamentId);
      setTournaments(prev => prev.map(t =>
        t.id === tournamentId 
          ? { ...t, joined: true, current_players: (t.current_players || t.participants || 0) + 1 } 
          : t
      ));
    } catch (err) {
      alert('Не вдалося приєднатись. Спробуй ще раз!');
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin text-6xl mb-4 text-yellow-400">Trophy</div>
        <p className="text-white text-xl">Завантаження турнірів...</p>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy size={120} className="mx-auto text-yellow-600 mb-8" />
          <p className="text-white/80 text-3xl font-bold">Турніри скоро з'являться!</p>
          <p className="text-white/60 text-xl mt-4">Готуйся до битви за славу</p>
          <button
            onClick={onBack}
            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            ← Повернутися до гри
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-bold text-center text-yellow-400 mb-10 flex items-center justify-center gap-6">
          <Crown size={60} />
          ТУРНІРИ
          <Crown size={60} />
        </h1>

        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-2xl rounded-xl shadow-lg transition-all"
          >
            ← Повернутися до гри
          </button>
        </div>

        <div className="space-y-8">
          {tournaments.map(tourn => (
            <div
              key={tourn.id}
              className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border-4 border-white/20 shadow-2xl hover:shadow-yellow-500/40 transition-all duration-500 overflow-hidden"
            >
              {/* Icon of type */}
              {tourn.type === 'speed' && (
                <div className="absolute top-6 right-6 animate-pulse">
                  <Zap size={60} color="#fbbf24" />
                </div>
              )}
              {tourn.type === 'hot' && (
                <div className="absolute top-6 right-6 animate-pulse">
                  <Flame size={60} color="#ef4444" />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-5xl font-bold text-yellow-400 mb-4">
                    {tourn.name}
                  </h3>
                  <div className="space-y-4 text-white/90 text-xl">
                    <div className="flex items-center gap-4">
                      <Timer size={32} />
                      <span>
                        Початок: {new Date(tourn.start_time || tourn.startDate).toLocaleString('uk-UA')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Users size={32} />
                      <span>
                        {(tourn.current_players || tourn.participants || 0)} / {tourn.max_players || tourn.maxPlayers} гравців
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-6xl font-bold text-green-400 mb-4">
                    {tourn.prize || 'Секретний приз'}
                  </div>
                  <p className="text-white/70 text-2xl">Призовий фонд</p>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => handleJoin(tourn.id)}
                  disabled={tourn.joined || joining === tourn.id}
                  className={`
                    px-20 py-8 rounded-3xl font-bold text-3xl transition-all duration-300 transform
                    ${tourn.joined 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : joining === tourn.id
                      ? 'bg-yellow-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-green-500/60 hover:scale-110'
                    }
                  `}
                >                
                  {tourn.joined ? 'ПРИЄДНАНО' : joining === tourn.id ? 'ПРИЄДНУЮСЬ...' : 'ЗАРЕЄСТРУВАТИСЬ'}
                </button>                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;