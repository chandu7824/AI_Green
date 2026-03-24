import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative w-full h-[400px] bg-[#8BAE66] font-mono font-bold text-gray-700">
      <div className="max-w-7xl mx-auto h-full px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Purpose */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-[#000]">AI Green Advisor</h2>
          <p className="text-sm leading-relaxed">
            Empowering individuals to understand, track, and reduce their carbon
            footprint using AI-driven insights.
          </p>
          <p className="text-lg font-medium text-[#000]">
            Track • Analyze • Improve
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Explore</h3>
          <Link to="/home" className="text-decoration-none text-[#0D7C66]">
            Home
          </Link>
          <Link to="/tracker" className="text-decoration-none text-[#0D7C66]">
            Carbon Tracker
          </Link>
          <Link to="/profile" className="text-decoration-none text-[#0D7C66]">
            Emission Analysis
          </Link>
        </div>

        {/* Why This Matters */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Why Track Your Footprint?</h3>
          <p className="text-sm leading-relaxed">
            Awareness is the first step toward change. Understanding where your
            emissions come from helps you make informed and sustainable choices.
          </p>
        </div>

        {/* Technology & Trust */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Powered by Intelligence</h3>
          <p className="text-sm leading-relaxed">
            Our platform uses AI-based models and sustainability data to
            generate meaningful insights and personalized recommendations —
            while respecting user privacy.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 py-4 text-center text-sm text-gray-600">
        © 2026 AI Green Advisor. Built for a greener future.
      </div>
    </footer>
  );
};

export default Footer;
