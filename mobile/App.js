import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Web3Modal } from '@web3modal/wagmi-react-native';
import { WagmiProvider } from 'wagmi';
import { polygon, sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

import { sound } from './src/utils/sound';
import { register } from 'prom-client';

const projectId = 'твій_project_id_тут'; // ← Замінить хзвичайно ж на свій

const wagmiConfig = {
  projectId,
  chains: [sepolia, polygon],
  wagmiConfig: {
    chains: [sepolia, polygon],
    transports: {},
    connectors: [
      walletConnect({
        projectId,
        metadata: {
          name: 'Snake Game',
          description: 'Web3 Snake with NFT Skins',
          url: 'https://snakegame.app',
          icons: ['https://snakegame.app/icon.png']
        }
      })
    ]
  }
};

import Game from './src/components/Game';
import Leaderboard from './src/components/Leaderboard';
import Achievements from './src/components/Achievements';
import NFTMint from './src/components/NFTMint';
import MultiplayerGame from './src/components/MultiplayerGame';
import Tournament from './src/components/Tournament';

const Stack = createStackNavigator();

export default function App() {
  const [playerID] = React.useState('mobile_' + Math.random().toString(36).substr(2, 9));

useEffect(() => {
    const loadSounds = async () => {
      try {
        await sound.load();
        console.log('Всі звуки завантажено!');
        // Опціонально: граємо легкий "стартовий" звук
        // await sound.play('achievement');
      } catch (error) {
        console.warn('Не вдалося завантажити звуки:', error);
      }
    };

    loadSounds();
  }, []);

  if (__DEV__) {
  const metricsServer = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    }
  });
  metricsServer.listen(8081);
}

  return (
    <WagmiProvider config={wagmiConfig.wagmiConfig}>
      <Web3Modal />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Game">
          <Stack.Screen name="Game" options={{ headerShown: false }}>
            {props => <Game {...props} playerID={playerID} />}
          </Stack.Screen>
          <Stack.Screen name="Multiplayer" component={MultiplayerGame} options={{ title: 'Мультиплеєр' }} />
          <Stack.Screen name="Tournament" component={Tournament} options={{ title: 'Турніри' }} />
            {() => <Tournaments playerID={playerID} />}
          <Stack.Screen name="Leaderboard" component={Leaderboard} options={{ title: 'Лідери' }} />
          <Stack.Screen name="Achievements">
            {() => <Achievements playerID={playerID} />}
          </Stack.Screen>
          <Stack.Screen name="NFTMint" component={NFTMint} options={{ title: 'Mint NFT Skin' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </WagmiProvider>
  );
}