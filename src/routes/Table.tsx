import { useEffect } from 'react';
import { useAppStore } from '../store';
import { Card } from '../game/types';

export default function Table() {
  const { players, hands, current, playCard, trick, lead, phase, rng } = useAppStore();

  useEffect(() => {
    if (phase !== 'play' || current === undefined) return;
    const player = players[current];
    if (!player || !player.isBot) return;
    const hand = hands[current];
    let legal = hand;
    if (trick.length > 0 && lead) {
      const follow = hand.filter((c) => c.suit === lead);
      if (follow.length > 0) legal = follow;
    }
    const card = legal[Math.floor(rng() * legal.length)];
    setTimeout(() => playCard(current, card), 500);
  }, [current, hands, players, trick, lead, phase, playCard, rng]);

  const humanHand = hands[0] || [];
  let legal = humanHand;
  if (trick.length > 0 && lead) {
    const follow = humanHand.filter((c) => c.suit === lead);
    if (follow.length > 0) legal = follow;
  }

  if (phase === 'done') {
    return (
      <div className="p-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">Deal complete</h2>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl">Current: {current !== undefined ? players[current]?.name : ''}</h2>
      <div className="flex justify-center gap-4 min-h-[60px]">
        {trick.map((c: Card, i: number) => (
          <div key={i} className="p-2 bg-white text-black rounded">
            {c.rank} {c.suit[0].toUpperCase()}
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {humanHand.map((card, idx) => {
          const isLegal = legal.includes(card);
          return (
            <button
              key={idx}
              disabled={current !== 0 || !isLegal}
              onClick={() => playCard(0, card)}
              className={`p-2 rounded ${
                isLegal ? 'bg-white text-black' : 'bg-gray-500'
              }`}
            >
              {card.rank} {card.suit[0].toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
