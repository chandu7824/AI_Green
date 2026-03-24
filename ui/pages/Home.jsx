import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Home.css";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";

const step1Image =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
const step2Image =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
const step3Image =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

const Home = () => {
  const { userName } = useAuth();
  const [visibleBubbles, setVisibleBubbles] = useState(Array(5).fill(false));

  const symbols = ["🚗", "✈️", "🌳", "💡", "🥗"];
  const words = [
    "Driving 1 km emits ~120 g CO₂",
    "A short flight = weeks of car travel",
    "One tree absorbs ~21 kg CO₂ / year",
    "LEDs cut emissions by ~80%",
    "Plant-based meals = lower footprint",
  ];

  useEffect(() => {
    const timers = words.map((_, index) =>
      setTimeout(() => {
        setVisibleBubbles((prev) => {
          const newArr = [...prev];
          newArr[index] = true;
          return newArr;
        });
      }, index * 300),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <>
      {/* Welcome Section - fixed */}
      <div className="flex fixed justify-center items-center h-[500px] w-full top-20 bg-gradient-to-r from-emerald-900/80 to-teal-800/80 bg-blend-overlay bg-[url('./assets/welcome.jpg')] bg-cover bg-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('./assets/welcome.jpg')] bg-cover bg-center scale-110 transition-transform duration-10000"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/70 to-teal-800/70"></div>
        <div className="flex flex-col gap-6 justify-center items-center relative z-10 text-white text-center px-4">
          <p className="font-bold text-5xl animate-fadeIn">
            Welcome {userName || "Guest"} 👋
          </p>
          <h1 className="text-5xl font-bold max-w-3xl animate-slideUp">
            Track Your Daily CO₂ Impact & Make a Difference
          </h1>

          <Link
            to="/tracker"
            className="text-decoration-none text-white animate-bounceIn delay-500"
            style={{ color: "white" }}
          >
            <div className="h-[60px] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 w-[280px] rounded-xl flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              Calculate My Footprint →
            </div>
          </Link>
          <div className="pt-10 animate-bounce">
            <p className="font-bold text-lg mb-2">Learn How It Works</p>
            <ArrowDownwardIcon sx={{ fontSize: 48 }} className="arrow-bounce" />
          </div>
        </div>
      </div>

      {/* Spacer for fixed welcome section */}
      <div className="h-[500px]"></div>

      {/* Main section */}
      <div className="w-full flex flex-col relative mt-[20px] z-20 bg-gradient-to-b from-white to-emerald-50">
        {/* Did you know section */}
        <section className="flex relative w-full min-h-[600px] p-8 mt-10">
          <div className="w-[90%] h-[600px] bg-gradient-to-br from-emerald-200 to-teal-200 left-20 border-4 border-emerald-300/30 shadow-2xl absolute rounded-2xl z-[10] rotate-2 hover:rotate-3 transition-transform duration-500"></div>
          <div className="flex flex-col w-[85%] min-h-[550px] left-30 top-12 border-4 border-white shadow-2xl rounded-2xl bg-gradient-to-b from-white to-emerald-50 relative z-[20] p-8">
            <div className="flex justify-center p-6">
              <p className="type-writer font-bold text-5xl text-emerald-900">
                Did You Know?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 px-4">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`info-bubble h-[200px] w-[200px] rounded-full border-4 border-emerald-300/50 bg-gradient-to-br from-emerald-100 to-teal-100 shadow-lg flex flex-col items-center justify-center text-center p-4 transform transition-all duration-500 ${visibleBubbles[index] ? "opacity-100 scale-100" : "opacity-0 scale-90"} ${words.indexOf(word) % 2 === 0 ? "mt-0" : "mt-12"} hover:scale-105 hover:shadow-xl hover:border-emerald-400/70 cursor-pointer`}
                >
                  <span>
                    <p className="text-5xl mb-4">{symbols[index]}</p>
                    <p className="font-bold text-emerald-900 text-lg leading-tight">
                      {word}
                    </p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="relative flex flex-col items-center justify-center mt-[150px] mb-20 border-4 border-emerald-200 bg-gradient-to-b from-white to-emerald-50 w-[90%] min-h-[700px] mx-auto shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
          <p className="font-bold text-4xl pt-10 pb-4 text-emerald-900 text-center px-4">
            Track Your Impact in 3 Simple Steps
          </p>
          <p className="text-gray-600 text-lg text-center max-w-2xl px-4 mb-10">
            Start making a difference today with our easy-to-use carbon tracker
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full px-8 pb-10">
            {/* Step 1 */}
            <div className="group flex flex-col items-center rounded-2xl bg-gradient-to-b from-emerald-50 to-white border-4 border-emerald-100 p-6 shadow-xl w-full lg:w-[30%] min-h-[450px] hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                <LooksOneIcon sx={{ fontSize: 32, color: "white" }} />
              </div>
              <div className="w-full h-48 mb-6 rounded-xl overflow-hidden shadow-md">
                <img
                  src={step1Image}
                  alt="Log activities"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="font-bold text-2xl mb-4 text-emerald-900">
                Log Your Daily Activities
              </p>
              <p className="text-gray-700 text-center leading-relaxed">
                Enter details about travel, energy use, food choices, and daily
                habits in our intuitive tracker.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-teal-50 to-white border-4 border-teal-100 shadow-xl w-full lg:w-[30%] min-h-[450px] hover:border-teal-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                <LooksTwoIcon sx={{ fontSize: 32, color: "white" }} />
              </div>
              <div className="w-full h-48 mb-6 rounded-xl overflow-hidden shadow-md">
                <img
                  src={step2Image}
                  alt="AI Analysis"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="font-bold text-2xl mb-4 text-teal-900">
                AI-Powered Carbon Analysis
              </p>
              <p className="text-gray-700 text-center leading-relaxed">
                Our AI calculates your carbon footprint and provides
                personalized suggestions to reduce emissions effectively.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group flex flex-col items-center rounded-2xl border-4 border-lime-100 bg-gradient-to-b from-lime-50 to-white p-6 shadow-xl w-full lg:w-[30%] min-h-[450px] hover:border-lime-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-lime-500 to-emerald-400 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                <Looks3Icon sx={{ fontSize: 32, color: "white" }} />
              </div>
              <div className="w-full h-48 mb-6 rounded-xl overflow-hidden shadow-md">
                <img
                  src={step3Image}
                  alt="Track progress"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="font-bold text-2xl mb-4 text-lime-900">
                Track Progress & Compare
              </p>
              <p className="text-gray-700 text-center leading-relaxed">
                Monitor your CO₂ emissions over time, see trends, and watch how
                small changes create meaningful impact.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="flex flex-col w-[90%] border-4 border-emerald-200 mx-auto mb-16 items-center justify-center h-[300px] rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 shadow-xl">
          <p className="font-bold text-4xl text-center text-emerald-900 mb-6 px-4">
            Ready to Make a Difference?
          </p>
          <p className="text-gray-600 text-xl text-center max-w-2xl mb-8 px-4">
            Turn your daily routine into environmental insights and join the
            movement towards sustainability
          </p>
          <Link
            to="/tracker"
            className="text-decoration-none"
            style={{ color: "white" }}
          >
            <div className="h-[60px] w-[300px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <span>Start Calculating Now</span>
              <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
