import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';

export default function Lobby() {
  const navigate = useNavigate();
  const { setPlayers } = useAppStore();
  const [names, setNames] = useState(['You', 'Bot 2', 'Bot 3', 'Bot 4']);
  const [bots, setBots] = useState([false, true, true, true]);

  const start = () => {
    const players = names.map((name, i) => ({ name, isBot: bots[i] }));
    setPlayers(players);
    navigate('/coin');
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Grim</h1>
      <div className="space-y-2">
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="flex-1 p-1 text-black"
              value={n}
              onChange={(e) =>
                setNames((arr) => arr.map((v, idx) => (idx === i ? e.target.value : v)))
              }
            />
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={bots[i]}
                onChange={(e) =>
                  setBots((arr) => arr.map((v, idx) => (idx === i ? e.target.checked : v)))
                }
              />
              Bot
            </label>
          </div>
        ))}
      </div>
      <button onClick={start} className="px-4 py-2 bg-blue-600 rounded">
        Start
      </button>
      <div>
        <Link to="/rules" className="underline">
          View Rules
        </Link>
      </div>
    </div>
  );
}
