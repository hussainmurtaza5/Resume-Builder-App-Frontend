import { Link } from 'react-router-dom';

export default function Logo({ className = '', to = '/homepage', onClick }) {
  const content = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-2xl leading-none">
        🐝
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        Resum<span className="text-amber-500">bee</span>
      </span>
    </>
  );

  if (!to) {
    return (
      <span className={`flex items-center gap-2 ${className}`}>{content}</span>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 ${className}`}
      aria-label="Resumbee home"
    >
      {content}
    </Link>
  );
}
