import { Link } from 'react-router-dom';

export default function Lobby() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold">Grim</h1>
      <p>Welcome to Grim. Game setup will appear here.</p>
      <Link to="/rules" className="underline">View Rules</Link>
    </div>
  );
}
