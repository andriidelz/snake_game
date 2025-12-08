import { useState, useEffect } from 'react';
import { Trophy, Users, Timer, Zap, Crown, Flame } from 'lucide-react'; 
import { getTournaments, joinTournament } from '../services/api';

const Tournaments = ({ playerID }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    getTournaments().then(data => {
      setTournaments(data);
      setLoading(false);
    });
  }, []);

  const handleJoin = async (tournamentId) => {
    setJoining(tournamentId);
    try {
      await joinTournament(playerID, tournamentId);
      setTournaments(prev => prev.map(t => 
        t.id === tournamentId ? { ...t, joined: true, participants: t.participants + 1 } : t
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-yellow-400 mb-4 flex items-center justify-center gap-4">
          <Crown size={50} />
          Турніри
          <Crown size={50} />
        </h1>

        <div className="space-y-8">
          {tournaments.length === 0 ? (
            <div className="text-center py-20">
              <Trophy size={100} className="mx-auto text-yellow-600 mb-6" />
              <p className="text-white/70 text-2xl">Турніри скоро з'являться!</p>
              <p className="text-white/50 mt-4">Готуйся до битви за славу</p>
            </div>
          ) : (
            tournaments.map(tourn => (
              <div
                key={tourn.id}
                className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl hover:shadow-yellow-500/30 transition-all duration-500 overflow-hidden"
              >
                {/* Блискавка для "швидкісних" турнірів */}
                {tourn.type === 'speed' && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <Zap size={48} color="#fbbf24" className="drop-shadow-lg" />
                  </div>
                )}

                {/* Вогонь для "гарячих" турнірів */}
                {tourn.type === 'hot' && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <Flame size={48} color="#ef4444" className="drop-shadow-lg" />
                  </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-4xl font-bold text-yellow-400 mb-3 flex items-center gap-3">
                      {tourn.name}
                      {tourn.type === 'speed' && <Zap size={36} color="#fbbf24" />}
                      {tourn.type === 'hot' && <Flame size={36} color="#ef4444" />}
                    </h3>
                    <div className="flex flex-wrap gap-6 text-white/80">
                      <div className="flex items-center gap-2">
                        <Timer size={22} />
                        <span>{new Date(tourn.startDate).toLocaleDateString('uk-UA')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={22} />
                        <span>{tourn.participants}/{tourn.maxPlayers} гравців</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-5xl font-bold text-green-400 mb-2">
                      {tourn.prize}
                    </div>
                    <p className="text-white/70 text-lg">Призовий фонд</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => handleJoin(tourn.id)}
                    disabled={tourn.joined || joining === tourn.id}
                    className={`
                      px-16 py-6 rounded-3xl font-bold text-2xl transition-all duration-300 transform
                      ${tourn.joined 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : joining === tourn.id
                        ? 'bg-yellow-600 text-white animate-pulse'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-green-500/50 hover:scale-105'
                      }
                    `}
                  >
                    {tourn.joined ? 'Приєднано' : joining === tourn.id ? 'Приєднуюсь...' : 'ЗАРЕЄСТРУВАТИСЬ'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;