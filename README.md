# Grim

Grim is a 4-player partnership card game. This project provides a basic implementation using React 18, TypeScript, Zustand and Vite. The app now includes a minimal lobby, coin toss and playable table with simple bot opponents.


## Development
```bash
npm install
npm run dev
```

## Testing
```bash
npm test
```

## Deployment
Build and push to GitHub Pages (requires repo to be configured with gh-pages):
```bash
npm run build
npm run deploy
```

## Deterministic Seeds
Game shuffles and coin tosses use a deterministic PRNG. Adjust the `seed` value in `src/store.ts` to replay games.

![Coin Toss](docs/coin-toss.png)
