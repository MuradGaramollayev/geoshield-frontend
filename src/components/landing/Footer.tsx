import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <span
          className="font-mono font-bold text-white tracking-wider text-base"
          style={{ textShadow: "0 0 12px rgba(16, 185, 129, 0.35)" }}
        >
          GEOSHIELD
        </span>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#features" className="hover:text-slate-300 transition-colors">Product</a>
          <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
          <Link to="/login" className="hover:text-slate-300 transition-colors">Log In</Link>
          <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign Up</Link>
        </div>

        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} GeoShield. All rights reserved.
        </p>
      </div>
    </footer>
  );
}