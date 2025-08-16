import ReactMarkdown from 'react-markdown';
import rules from '../../rules.md?raw';
import { Link } from 'react-router-dom';

export default function Rules() {
  return (
    <div className="p-4 prose max-w-none">
      <Link to="/" className="underline">← Back</Link>
      <ReactMarkdown>{rules}</ReactMarkdown>
    </div>
  );
}
