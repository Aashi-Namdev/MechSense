import { Link } from "react-router-dom";

function SecondaryButton({ to, onClick, className = "", children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-card-elevated hover:text-text-main ${className}`}
    >
      {children}
    </Link>
  );
}

export default SecondaryButton;