import { Routes, Route, Link } from 'react-router-dom';
import Lobby from './routes/Lobby';
import Rules from './routes/Rules';

export default function App() {
  return (
    <div className="min-h-screen bg-green-700 text-white">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="*" element={<div className='p-4'><p>Not found</p><Link to='/' className='underline'>Home</Link></div>} />
      </Routes>
    </div>
  );
}
