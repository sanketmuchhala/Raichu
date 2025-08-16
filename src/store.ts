import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, Seat, TeamId, Suit } from './game/types';
import { createDeck, shuffle } from './game/deck';
import { coinToss, CoinTossResult } from './game/coin';
import { trickWinner } from './game/compare';
import { createPRNG } from './game/prng';

interface Player {
  name: string;
  isBot: boolean;
  team: TeamId;
}

interface AppState {
  seed: number;
  players: Player[];
  phase: 'lobby' | 'coin' | 'play' | 'done';
  coin?: CoinTossResult;
  dealer?: Seat;
  current?: Seat;
  hands: Card[][];
  trick: Card[];
  trickLeader?: Seat;
  lead?: Suit;
  log: string[];
  rng: () => number;
  setSeed: (seed: number) => void;
  setPlayers: (players: Omit<Player, 'team'>[]) => void;
  tossCoin: () => void;
  startGame: () => void;
  playCard: (seat: Seat, card: Card) => void;

}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      seed: 1,
      players: [],
      phase: 'lobby',
      hands: [[], [], [], []],
      trick: [],
      log: [],
      rng: createPRNG(1),
      setSeed: (seed) => set({ seed, rng: createPRNG(seed) }),
      setPlayers: (players) =>
        set({
          players: players.map((p, i) => ({ ...p, team: i % 2 === 0 ? 'A' : 'B' })),
        }),
      tossCoin: () => set((state) => ({ coin: coinToss(state.seed), phase: 'coin' })),
      startGame: () =>
        set((state) => {
          const deck = shuffle(createDeck(), state.rng);
          const hands = [0, 1, 2, 3].map((i) => deck.slice(i * 8, (i + 1) * 8));
          const dealer = state.coin?.dealerSeat ?? 0;
          const current = (((dealer + 1) % 4) as Seat);
          return {
            hands,
            dealer,
            current,
            trick: [],
            trickLeader: current,
            lead: undefined,
            phase: 'play',
            log: [],
          };
        }),
      playCard: (seat, card) =>
        set((state) => {
          const hands = state.hands.map((h, i) =>
            i === seat ? h.filter((c) => c !== card) : h
          );
          let trickLeader = state.trickLeader;
          const trick = [...state.trick, card];
          let lead = state.lead;
          if (trick.length === 1) {
            trickLeader = seat;
            lead = card.suit;
          }
          if (trick.length === 4 && trickLeader !== undefined && lead) {
            const winnerIndex = trickWinner(trick, lead, 'HIGH');
            const winner = (((trickLeader + winnerIndex) % 4) as Seat);
            const log = [...state.log, `Trick won by ${state.players[winner]?.name || winner}`];
            const done = hands[0].length === 0;
            return {
              hands,
              trick: [],
              current: winner,
              trickLeader: winner,
              lead: undefined,
              log,
              phase: done ? 'done' : state.phase,
            };
          }
          const current = (((seat + 1) % 4) as Seat);
          return { hands, trick, current, trickLeader, lead };
        }),

    }),
    { name: 'grim-state' }
  )
);
