import { useEffect } from "react";
import landingImage from "../assets/landing_image_1.png";
import { Link, Navigate } from "react-router-dom";
import step1 from "../assets/Step-1.png";
import step2 from "../assets/Step-2.png";
import step3 from "../assets/Step-3.png";
import "../styles/Landing.css";
import { useAuth } from "../context/AuthContext";

function Landing() {
  const { accessToken, loading } = useAuth();

  if (accessToken) {
    return <Navigate to="/home" replace />;
  }
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
          else {
            entry.target.classList.remove("show");
          }
        });
      },
      {
        threshold: 0.5,
      },
    );
    const steps = document.querySelectorAll(".step");
    steps.forEach((step) => {
      observer.observe(step);
    });
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handleBack);

    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-hidden lg:pt-[40px] md:pt-[40px] sm:pt-[40px] pt-[80px]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-1/2 -right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-green-200 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse-slow"></div>
                <span className="text-green-800 font-semibold text-lg">
                  AI-Powered Environmental Intelligence
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Your Planet
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600">
                  Needs You
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Track, understand, and reduce your carbon footprint with
                intelligent AI analysis. Make sustainable choices that matter
                for our planet's future.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/tracker"
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-green-300"
                style={{ textDecoration: "none", color: "white" }}
              >
                <span className="relative z-10 flex items-center">
                  Start Your Eco-Journey
                  <svg
                    className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-700 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-8">
              {[
                "Real-time Tracking",
                "AI Analysis",
                "Personalized Tips",
                "Progress Dashboard",
              ].map((feature, index) => (
                <div
                  key={feature}
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-green-200 text-green-800 font-medium text-sm shadow-sm animate-slide-up"
                  style={{ animationDelay: `${index * 100 + 600}ms` }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Image Content */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40 transform hover:scale-105 transition-transform duration-500">
                <img
                  src={landingImage}
                  alt="Carbon Footprint Analytics Dashboard"
                  className="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-2xl"
                />
              </div>

              <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-100 rounded-2xl rotate-12 animate-float shadow-lg"></div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-100 rounded-2xl -rotate-12 animate-float-delayed shadow-lg"></div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-green-600">
            <span className="text-sm font-medium mb-2">Explore More</span>
            <div className="w-6 h-10 border-2 border-green-300 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-green-400 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      <section className=" relative py-20 lg:py-32 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              How It
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your environmental impact and
              become more sustainable
            </p>
          </div>

          {/* Steps Container */}
          <div className="space-y-20 lg:space-y-32">
            {/* Step 1 */}
            <div className="step grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl transform rotate-3 opacity-60"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 transform hover:scale-105 transition-transform duration-500">
                    <img
                      src={step1}
                      alt="Enter your daily activity data"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl px-6 py-3 shadow-lg">
                  <span className="font-bold text-lg">Step 1</span>
                </div>
              </div>

              <div className=" space-y-6 order-1 lg:order-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Track Your Daily
                  <span className="block text-green-600">Activities</span>
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Input your daily routines including transportation, diet,
                  energy usage, and consumption habits. Our AI captures every
                  aspect of your carbon footprint.
                </p>
                <ul className="space-y-3">
                  {[
                    "Transportation methods & distance",
                    "Dietary preferences & food choices",
                    "Energy consumption at home",
                    "Shopping & consumption patterns",
                    "Waste generation & recycling",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-6 order-2 lg:order-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Get AI-Powered
                  <span className="block text-green-600">Insights</span>
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Receive instant CO₂ emission estimates and personalized
                  sustainability recommendations powered by advanced artificial
                  intelligence.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: "📊",
                      title: "Real-time CO₂ Estimates",
                      desc: "Accurate carbon calculations",
                    },
                    {
                      icon: "💡",
                      title: "AI Tips",
                      desc: "Personalized recommendations",
                    },
                    {
                      icon: "🌱",
                      title: "Sustainable Alternatives",
                      desc: "Eco-friendly options",
                    },
                    {
                      icon: "🎯",
                      title: "Impact Analysis",
                      desc: "See your potential savings",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-green-50 rounded-xl p-4 border border-green-200"
                    >
                      <div className="text-2xl mb-2">{feature.icon}</div>
                      <div className="font-semibold text-green-800">
                        {feature.title}
                      </div>
                      <div className="text-sm text-green-600">
                        {feature.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative order-1 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl transform -rotate-3 opacity-60"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 transform hover:scale-105 transition-transform duration-500">
                    <img
                      src={step2}
                      alt="Get CO2 emission estimates and AI tips"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                <div className="absolute -top-6 -left-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl px-6 py-3 shadow-lg">
                  <span className="font-bold text-lg">Step 2</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-emerald-100 to-green-100 rounded-3xl transform rotate-3 opacity-60"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 transform hover:scale-105 transition-transform duration-500">
                    <img
                      src={step3}
                      alt="Track progress with interactive dashboard"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl px-6 py-3 shadow-lg">
                  <span className="font-bold text-lg">Step 3</span>
                </div>
              </div>

              <div className="space-y-6 order-1 lg:order-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Monitor Your
                  <span className="block text-green-600">Progress</span>
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Track your environmental journey with our interactive
                  dashboard. Visualize your progress, set goals, and celebrate
                  your sustainability achievements.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      feature: "Daily & Weekly Progress Tracking",
                      benefit: "See your improvement over time",
                    },
                    {
                      feature: "Interactive Charts & Graphs",
                      benefit: "Visualize your carbon reduction",
                    },
                    {
                      feature: "Goal Setting & Achievement",
                      benefit: "Set and accomplish eco-targets",
                    },
                    {
                      feature: "Comparative Analysis",
                      benefit: "Compare with averages and goals",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.feature}
                        </div>
                        <div className="text-green-600 text-sm">
                          {item.benefit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-blue-600 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full animate-float-delayed"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            Ready to Make a
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-100">
              Real Impact?
            </span>
          </h2>

          <p className="text-xl sm:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of eco-conscious individuals transforming their
            environmental footprint. Start your sustainability journey today.
          </p>

          <div className="pt-8">
            <Link
              to="/tracker"
              className="group inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-green-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
            >
              <span>Begin Your Eco-Journey</span>
              <svg
                className="w-6 h-6 ml-3 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 max-w-2xl mx-auto">
            {[
              "🌍 Carbon Neutral",
              "🤖 AI Powered",
              "📊 Real-time Data",
              "🎯 Personalized",
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-white/80 text-sm font-medium">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
