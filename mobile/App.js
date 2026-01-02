import '@walletconnect/react-native-compat';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Play, Users, Trophy, Gem, Medal, Settings } from 'lucide-react-native';

import { createWeb3Modal, defaultWagmiConfig, Web3Modal } from '@web3modal/wagmi-react-native';
import { WagmiProvider, useConnect, useAccount } from 'wagmi';
import { polygon, sepolia } from 'wagmi/chains';
// import { walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { sound } from './src/utils/sound';

import Game from './src/components/Game';
import Leaderboard from './src/components/Leaderboard';
import Achievements from './src/components/Achievements';
import NFTMint from './src/components/NFTMint';
import MultiplayerGame from './src/components/MultiplayerGame';
import Tournament from './src/components/Tournament';

const projectId = 'fc38887a-cf19-44f7-ba89-553a577d5984'; // ← change for your own one of course  
const queryClient = new QueryClient();
const { address, isConnected } = useAccount() || {};

const metadata = {
  name: 'Snake Game',
  description: 'Web3 Snake with NFT Skins',
  url: 'https://snakegame.app',
  icons: ['https://snakegame.app/icon.png'],
  redirect: {
    native: 'snakegame://', // Переконайся, що схема налаштована в app.json
    universal: 'https://snakegame.app'
  }
};

const chains = [sepolia, polygon];

let wagmiConfig;
try {
  wagmiConfig = defaultWagmiConfig({ 
    chains, 
    projectId, 
    metadata,
    enableAnalytics: false, // Optional - disable analytics
  });
} catch (error) {
  console.warn('Failed to initialize wagmi config:', error);
}
const Stack = createStackNavigator();

function MenuScreen({ navigation }) {
  const playerID = 'mobile_' + Math.random().toString(36).substr(2, 9);

  return (
    <View style={styles.menuContainer}>
      {/* Якщо є лого — додай, якщо ні — видали */}
      {/* <Image source={require('./assets/snake-logo.png')} style={styles.logo} resizeMode="contain" /> */}

      <Text style={styles.title}>🐍 Snake Game</Text>
      <Text style={styles.subtitle}>Зароби та грай!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Game', { playerID })}
      >
        <Play size={40} color="#fff" />
        <Text style={styles.buttonText}>Одиночна гра</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Multiplayer', { playerID })}
      >
        <Users size={40} color="#fff" />
        <Text style={styles.buttonText}>Мультиплеєр</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Tournament', { playerID })}
      >
        <Trophy size={40} color="#fff" />
        <Text style={styles.buttonText}>Турніри</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('NFTMint')}
      >
        <Gem size={40} color="#fff" />
        <Text style={styles.buttonText}>MINT NFT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Medal size={40} color="#fff" />
        <Text style={styles.buttonText}>Лідери</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Achievements', { playerID })}
      >
        <Settings size={40} color="#fff" />
        <Text style={styles.buttonText}>Досягнення</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
useEffect(() => {
    const loadSounds = async () => {
      try {
        await sound.load();
        console.log('Всі звуки завантажено!');
      } catch (error) {
        console.warn('Не вдалося завантажити звуки:', error);
      }
    };
    loadSounds();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <Web3Modal />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Menu" component={MenuScreen} />

            <Stack.Screen name="Game">
              {props => <Game {...props} playerID={props.route.params.playerID} />}
            </Stack.Screen>

            <Stack.Screen name="Multiplayer">
              {props => <MultiplayerGame route={{ params: { playerID: props.route.params.playerID } }} />}
            </Stack.Screen>

            <Stack.Screen name="Tournament">
              {props => <Tournament {...props} playerID={props.route.params.playerID} />}
            </Stack.Screen>

            <Stack.Screen name="Leaderboard" component={Leaderboard} />
            <Stack.Screen name="Achievements">
              {props => <Achievements playerID={props.route.params.playerID} />}
            </Stack.Screen>
            <Stack.Screen name="NFTMint" component={NFTMint} />
          </Stack.Navigator>
        </NavigationContainer>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#fbbf24',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    borderRadius: 30,
    width: '90%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
});