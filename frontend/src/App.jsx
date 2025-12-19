import { useState, useEffect } from 'react';
import Game from './components/Game';
import MultiplayerGame from './components/MultiplayerGame';
import Leaderboard from './components/Leaderboard';
import Achievements from './components/Achievements';
import Tournaments from './components/Tournaments';     
import NFTMint from './components/NFTMint';
import AdBanner from './components/AdBanner';
import SkinSelector from './components/SkinSelector';
import { getStats } from './services/api';

import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';

const projectId = '2f15da01dce90cbae47e86d2acbf4369';

const wagmiConfig = createConfig({
  chains: [mainnet],  // or your chain e.g. polygon)
  transports: {
    [mainnet.id]: http(),
  },
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: [mainnet],
});

const queryClient = new QueryClient();

function App() {
  const [stats, setStats] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showNFTMint, setShowNFTMint] = useState(false);
  const [mode, setMode] = useState('single'); // single | multi
  const [playerID] = useState(() => 'player_' + Math.random().toString(36).substr(2, 9));
  const [selectedSkin, setSelectedSkin] = useState({ 
    id: 'default', 
    color: '#10b981', 
    name: 'Зелений' 
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const backToGame = () => {
    setShowLeaderboard(false);
    setShowAchievements(false);
    setShowTournaments(false);
    setShowNFTMint(false);
  };

  const showSkinSelector = mode === 'single' && !showLeaderboard && !showAchievements && !showTournaments && !showNFTMint;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <AdBanner type="horizontal" position="top" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            🐍 SNAKE GAME 🐍
          </h1>
          <p className="text-green-300 text-xl">
            Класична гра з можливістю заробітку!
          </p>

          {stats && (
            <div className="mt-4 flex justify-center gap-6 text-white">
              <div className="bg-white/10 px-4 py-2 rounded">
                <span className="text-green-400 font-bold">{stats.total_games}</span> Ігор зіграно
              </div>
              <div className="bg-white/10 px-4 py-2 rounded">
                <span className="text-yellow-400 font-bold">{Math.round(stats.avg_score)}</span> Середній рахунок
              </div>
              <div className="bg-white/10 px-4 py-2 rounded">
                <span className="text-red-400 font-bold">{stats.max_score}</span> Рекорд
              </div>
            </div>
          )}
        </header>

        {/* Кнопки режиму + лідерборд + досягнення */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <div className="bg-white/10 rounded-lg p-1 flex">
            <button
              onClick={() => { backToGame(); setMode('single'); }}
              className={`px-6 py-3 rounded-md font-bold ${mode === 'single' && !showLeaderboard && !showAchievements && !showTournaments && !showNFTMint 
              ? 'bg-green-600' : 'text-white/70 hover:text-white'} text-white`}
              >            
              🎮 Одиночна гра
            </button>
            <button
              onClick={() => { backToGame(); setMode('multi'); }}
              className={`px-6 py-3 rounded-md font-bold transition-all ${
                mode === 'multi' && !showLeaderboard && !showAchievements && !showTournaments && !showNFTMint
                  ? 'bg-purple-500 text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              👥 Мультиплеєр
            </button>
          </div>

          <button
            onClick={() => { backToGame(); setShowLeaderboard(true); }}
            className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${
              showLeaderboard ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white`}
          >
            {showLeaderboard ? 'Назад' : '🪙 Таблиця лідерів'}
          </button>

          <button
            onClick={() => { backToGame(); setShowAchievements(true); }}
            className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 ${
              showAchievements
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            } text-white`}
          >
            {showAchievements ? 'Назад' : 'Досягнення'} 
            </button>
              <button 
                onClick={() => { backToGame(); setShowTournaments(prev => !prev); }}
                className={`px-6 py-3 rounded-lg font-bold ${showTournaments ? 'bg-red-700' : 'bg-red-600'} text-white flex items-center gap-2`}>
                {showTournaments ? 'Назад' : 'Турніри'}
            </button>

          <button 
              onClick={() => { backToGame(); setShowNFTMint(true); }}
              className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white shadow-2xl transform hover:scale-105 transition-all animate-pulse">
              {showNFTMint ? 'Назад' : 'MINT NFT'}
          </button>
              <>
                🏆 Досягнення
                <span className="text-2xl"></span>
              </>                      
        </div>

        {/* SkinSelector — ТІЛЬКИ в одиночній грі */}
        {showSkinSelector && (
          <div className="mb-8">
            <h3 className="text-white text-center font-bold mb-3 text-xl">
              🎨 Оберіть скін змійки
            </h3>
            <div className="flex justify-center">
              <SkinSelector onSelect={setSelectedSkin} />
            </div>
          </div>
        )}

        {/* Основний контент */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="hidden lg:block">
            <AdBanner type="vertical" position="left" />
          </div>

          <div className="lg:col-span-1">
            {showLeaderboard ? <Leaderboard onBack={backToGame} />
             : showAchievements ? <Achievements playerID={playerID} onBack={backToGame} />
             : showTournaments ? <Tournaments playerID={playerID} onBack={backToGame} />
             : showNFTMint ? (
                <QueryClientProvider client={queryClient}>
                  <WagmiProvider config={wagmiConfig}>
                    <NFTMint onBack={backToGame} />
                  </WagmiProvider>
                </QueryClientProvider>
              )  
             : mode === 'single' ? <Game onStatsUpdate={loadStats} skin={selectedSkin} />
             : <MultiplayerGame playerID={playerID} roomID="global-room-1" />
            }
          </div>

          <div className="hidden lg:block">
            <AdBanner type="vertical" position="right" />
          </div>
        </div>

        <div className="mt-8">
          <AdBanner type="horizontal" position="bottom" />
        </div>

        <footer className="text-center mt-8 text-white/60 text-sm">
          <p>© 2025 Snake Game. Мультиплеєр • Скіни • Досягнення • NFT!</p>
          <p className="mt-2">
            Керування: ← → ↑ ↓ або WASD •{' '}
            {mode === 'multi' ? 'Всі в одній кімнаті!' : 'Одиночна гра'}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;