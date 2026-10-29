import { Link } from "react-router-dom";

function PrimaryButton({ to, onClick, className = "", children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-bg-base transition-colors hover:opacity-90 ${className}`}
    >
      {children}
    </Link>
  );
}

export default PrimaryButton;