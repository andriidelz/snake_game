import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useWeb3Modal } from '@web3modal/wagmi-react-native';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// ← Заміни після деплою контракту!
const CONTRACT_ADDRESS = '0xYourDeployedAddressHere';
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "_skinType", type: "string" }
    ],
    name: "mintSkin",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

export default function NFTMint() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = async () => {
    if (!address) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'mintSkin',
      args: [address, "legendary-golden-2025"],
      value: parseEther("0.001"), // 0.001 ETH
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#064e3b', padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      {/* Зображення NFT */}
      <Image
        source={{ uri: 'https://ipfs.io/ipfs/QmLegendaryGoldenSnake2025' }}
        style={{ width: 280, height: 280, borderRadius: 24, marginBottom: 30, borderWidth: 4, borderColor: '#fbbf24' }}
        resizeMode="contain"
      />

      <Text style={{ color: '#fbbf24', fontSize: 34, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#000', textShadowRadius: 10 }}>
        Legendary Golden Snake
      </Text>

      <Text style={{ color: '#94a3b8', fontSize: 18, textAlign: 'center', marginVertical: 16, lineHeight: 26 }}>
        Ексклюзивний скін для легенд 2025 року
      </Text>

      <Text style={{ color: '#10b981', fontSize: 28, fontWeight: 'bold', marginTop: 10 }}>
        Ціна: 0.001 ETH
      </Text>

      {/* Гаманець не підключений */}
      {!isConnected ? (
        <TouchableOpacity
          onPress={() => open()}
          style={{ backgroundColor: '#8b5cf6', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 24, marginTop: 40, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
            Підключити гаманець
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* Адреса */}
          <Text style={{ color: '#10b981', marginTop: 20, fontSize: 16, fontFamily: 'monospace' }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </Text>

          {/* Кнопка MINT */}
          <TouchableOpacity
            onPress={mint}
            disabled={isPending || isConfirming}
            style={{
              backgroundColor: isPending || isConfirming ? '#6b7280' : '#10b981',
              paddingVertical: 24,
              paddingHorizontal: 50,
              borderRadius: 30,
              marginTop: 30,
              minWidth: 300,
              alignItems: 'center',
              shadowColor: '#10b981',
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {isPending || isConfirming ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                MINT NFT
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Успішний мінт */}
      {isSuccess && (
        <View style={{ marginTop: 40, backgroundColor: '#166534', padding: 24, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#10b981' }}>
          <Text style={{ color: '#86efac', fontSize: 26, fontWeight: 'bold', textAlign: 'center' }}>
            Успішно заминчено!
          </Text>
          <Text style={{ color: '#86efac', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            Переглянь у своєму гаманці або на OpenSea
          </Text>
        </View>
      )}
    </View>
  );
}