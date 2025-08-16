import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';

export default function CoinToss() {
  const navigate = useNavigate();
  const { seed, coin, tossCoin, startGame, setSeed } = useAppStore();

  useEffect(() => {
    if (!coin) tossCoin();
  }, []);

  const retoss = () => {
    setSeed(seed + 1);
    tossCoin();
  };

  const begin = () => {
    startGame();
    navigate('/table');
  };

  return (
    <div className="p-4 space-y-4 text-center">
      <h2 className="text-2xl font-bold">Coin Toss</h2>
      {coin && (
        <div>
          Dealer Team: {coin.dealerTeam} — Seat {coin.dealerSeat}
        </div>
      )}
      <div className="space-x-2">
        <button onClick={retoss} className="px-4 py-2 bg-gray-600 rounded">
          Re-toss
        </button>
        <button onClick={begin} className="px-4 py-2 bg-blue-600 rounded">
          Start Deal
        </button>
      </div>
    </div>
  );
}
