import { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useWriteContract } from 'wagmi';

export default function NFTMint() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const [mintInfo, setMintInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/mint-info')
      .then(r => {
        if (!r.ok) throw new Error('Не вдалося завантажити дані мінту');
        return r.json();
      })
      .then(data => {
        setMintInfo(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const mint = () => {
    if (!mintInfo || !address) return;

    writeContract({
      address: mintInfo.contract_address,
      abi: mintInfo.abi,
      functionName: 'mintSkin',
      args: [address, 'legendary-golden-2025'],
      value: BigInt(mintInfo.price),
    });
  };

  if (loading) {
    return (
      <div className="text-center p-20">
        <div className="text-6xl animate-spin mb-6">Loading</div>
        <p className="text-white text-2xl">Завантаження даних мінту...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-20">
        <p className="text-red-400 text-2xl mb-4">Помилка</p>
        <p className="text-white">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-2xl text-center border border-white/20 shadow-2xl">
        <h2 className="text-6xl font-bold text-yellow-400 mb-8 drop-shadow-lg">
          Legendary Golden Snake
        </h2>

        <div className="bg-gray-900 rounded-2xl p-8 mb-10 shadow-inner">
          <div className="text-8xl mb-6">Snake</div>
          <p className="text-white/80 text-xl">Ексклюзивний скін 2025 року</p>
        </div>

        <div className="text-5xl font-bold text-green-400 mb-8">
          {(Number(mintInfo.price) / 1e18).toFixed(3)} ETH
        </div>

        {!isConnected ? (
          <button
            onClick={() => open()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-2xl px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
          >
            Підключити гаманець
          </button>
        ) : (
          <>
            <p className="text-white/70 mb-6">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <button
              onClick={mint}
              disabled={isPending}
              className={`
                font-bold text-3xl px-16 py-8 rounded-3xl shadow-2xl transition-all transform
                ${isPending 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-110'
                } text-white
              `}
            >
              {isPending ? 'Minting...' : 'MINT NFT'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}