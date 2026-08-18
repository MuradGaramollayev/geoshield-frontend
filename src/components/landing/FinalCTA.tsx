import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto text-center card-glow p-12 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: "#34d399" }}
        />
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4 relative">
          See the next attack before it happens
        </h2>
        <p className="text-slate-400 mb-8 relative">
          Join security teams already using GeoShield's real-time intelligence.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-emerald text-navy font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-all hover:scale-105 relative"
        >
          Get Started Free
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}