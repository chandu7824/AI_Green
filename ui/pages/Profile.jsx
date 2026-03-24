import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);
import axiosAPI from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import InsightsIcon from "@mui/icons-material/Insights";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecommendIcon from "@mui/icons-material/Recommend";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Popup from "../components/Popup.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Profile = () => {
  const todayDate = new Date().toLocaleDateString("en-CA");
  const [emission, setEmission] = useState({});
  const [transportEmission, setTransportEmission] = useState({});
  const [overallEmission, setOverallEmission] = useState(0);
  const { userName, email, setAuthData } = useAuth();
  const [period, setPeriod] = useState(todayDate);
  const [analysisDate, setAnalysisDate] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

  useEffect(() => {
    const fetchEmission = async () => {
      try {
        const res = await axiosAPI.get("/api/emission", {
          params: { period },
        });

        if (!res.data.emission) {
          setAnalysisDate(res.data.datePeriod || null);
          setEmission({});
          setTransportEmission({ bike: 0, car: 0, bus: 0, train: 0 });
          setOverallEmission(0);
          setAiAnalysis("");
          return;
        }
        const { transport, overall, ...rest } = res.data.emission;
        setAnalysisDate(res.data.datePeriod);
        setEmission(rest);
        setTransportEmission(transport);
        setOverallEmission(overall);
      } catch (err) {
        console.error("Failed to load emission data", err);
        setEmission({});
        setTransportEmission({ bike: 0, car: 0, bus: 0, train: 0 });
        setOverallEmission(0);
        setAiAnalysis("");
      }
    };
    fetchEmission();
  }, [period]);

  const generateAnalysis = async () => {
    if (
      overallEmission === 0 ||
      !emission ||
      Object.keys(emission).length === 0
    ) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisData = {
        date: period,
        overallEmission,
        transportEmission,
        otherEmissions: emission,
        totalPlasticItems: emission.plasticWaste || 0,
        electricityConsumption: emission.electricity || 0,
        dietEmission: emission.diet || 0,
      };

      const response = await axiosAPI.post(
        "/api/analyze-emission",
        analysisData,
      );

      if (response.data.analysis) {
        setAiAnalysis(response.data.analysis);
        setIsAnalysisExpanded(true);
      }
    } catch (error) {
      console.error("Failed to generate analysis:", error);
      setAiAnalysis(
        "Unable to generate analysis at this time. Please try again later.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const logout = async () => {
    try {
      await axiosAPI.post("/api/auth/logout");
    } catch (err) {
      <Popup message="Logout Error" success="false" type="logout" />;
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      setAuthData(null);
      window.location.href = "/login";
    }
  };

  const calculateEmissionStatus = (emissionValue) => {
    if (emissionValue === 0) return "text-emerald-600";
    if (emissionValue < 10) return "text-green-500";
    if (emissionValue < 20) return "text-yellow-500";
    if (emissionValue < 30) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressPercentage = () => {
    if (overallEmission === 0) return 0;
    const maxEmission = 30;
    return Math.min((overallEmission / maxEmission) * 100, 100);
  };

  const getEmissionRating = () => {
    if (overallEmission === 0)
      return { text: "No Data", color: "text-gray-500" };
    if (overallEmission < 5)
      return { text: "Excellent", color: "text-emerald-500" };
    if (overallEmission < 10) return { text: "Good", color: "text-green-500" };
    if (overallEmission < 15)
      return { text: "Moderate", color: "text-yellow-500" };
    if (overallEmission < 20)
      return { text: "Needs Improvement", color: "text-orange-500" };
    return { text: "High Impact", color: "text-red-500" };
  };

  const rating = getEmissionRating();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-30 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 text-center mb-4">
          📊 Your Sustainability Dashboard
        </h1>
        <p className="text-gray-600 text-center text-lg">
          Track and analyze your carbon footprint journey
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Profile & Summary */}
        <div className="lg:col-span-1 space-y-8">
          {/* User Profile Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                <AccountCircleIcon
                  sx={{ fontSize: 60 }}
                  className="text-white"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {userName}
              </h2>
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <MailOutlineIcon className="text-emerald-500" />
                <span className="text-lg">{email}</span>
              </div>

              <button
                onClick={logout}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5"
              >
                <LogoutIcon />
                Sign Out
              </button>
            </div>
          </div>

          {/* Emission Rating Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="text-emerald-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Emission Rating
              </h3>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold mb-2 ${rating.color}`}>
                  {rating.text}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Based on {overallEmission.toFixed(1)} kg CO₂e
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              <button
                onClick={generateAnalysis}
                disabled={isAnalyzing || overallEmission === 0}
                className={`w-full py-3 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition-all duration-300 hover:-translate-y-0.5 ${
                  isAnalyzing || overallEmission === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <PsychologyIcon />
                    Get AI Analysis
                  </>
                )}
              </button>

              {overallEmission === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Calculate today's footprint first to get analysis
                </p>
              )}
            </div>
          </div>

          {/* Period Selector Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CalendarTodayIcon className="text-emerald-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Select Date Period
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium">Choose Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    min="2026-01-23"
                    max={todayDate}
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
                  />{" "}
                </div>
              </div>

              {analysisDate && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-emerald-700 text-sm">
                    Showing data for:{" "}
                    <span className="font-semibold">{analysisDate}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Quick Stats</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Total Categories</span>
                <span className="font-bold text-emerald-600">
                  {Object.keys(emission).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Transport Types</span>
                <span className="font-bold text-emerald-600">
                  {Object.keys(transportEmission).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Data Points</span>
                <span className="font-bold text-emerald-600">
                  {Object.keys(emission).length +
                    Object.keys(transportEmission).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Charts & Data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Emission Summary Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-2xl p-8 text-white transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">
                  <LocalFireDepartmentIcon className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    Carbon Footprint Summary
                  </h3>
                  <p className="text-emerald-100">
                    Total emissions for selected period
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-4xl font-bold mb-1 ${calculateEmissionStatus(overallEmission)}`}
                >
                  {overallEmission.toFixed(2)}
                </div>
                <div className="text-emerald-100">kg CO₂e</div>
              </div>
            </div>

            {overallEmission === 0 && analysisDate === todayDate ? (
              <div className="mt-6 text-center">
                <p className="mb-4 text-emerald-100">
                  No data recorded for today yet
                </p>
                <Link
                  to="/tracker"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:bg-emerald-50 hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5"
                >
                  📝 Calculate Today's Footprint
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {Object.entries(transportEmission).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white/10 p-4 rounded-xl backdrop-blur-sm"
                  >
                    <div className="text-sm text-emerald-100 capitalize mb-1">
                      {key}
                    </div>
                    <div className="text-xl font-bold">
                      {value.toFixed(2)} kg
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <InsightsIcon className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      AI-Powered Analysis
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Intelligent insights based on your emissions data
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  {isAnalysisExpanded ? (
                    <ExpandLessIcon className="text-gray-600" />
                  ) : (
                    <ExpandMoreIcon className="text-gray-600" />
                  )}
                </button>
              </div>

              {isAnalysisExpanded && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="prose prose-sm max-w-none bg-white/50 p-4 rounded-xl border border-indigo-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiAnalysis}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RecommendIcon className="text-indigo-500" />
                      <span>Personalized recommendations generated</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Analysis for {analysisDate}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transportation Breakdown Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShowChartIcon className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Transportation Breakdown
                  </h3>
                  <p className="text-gray-600 text-sm">
                    CO₂ emissions by vehicle type
                  </p>
                </div>
              </div>
              <div className="h-64">
                <Bar
                  key="transport-bar-chart"
                  data={{
                    labels: Object.keys(transportEmission).map(
                      (label) => label.charAt(0).toUpperCase() + label.slice(1),
                    ),
                    datasets: [
                      {
                        label: "kg CO₂e",
                        data: Object.values(transportEmission),
                        backgroundColor: [
                          "rgba(54, 162, 235, 0.8)",
                          "rgba(255, 99, 132, 0.8)",
                          "rgba(75, 192, 192, 0.8)",
                          "rgba(153, 102, 255, 0.8)",
                        ],
                        borderColor: [
                          "rgb(54, 162, 235)",
                          "rgb(255, 99, 132)",
                          "rgb(75, 192, 192)",
                          "rgb(153, 102, 255)",
                        ],
                        borderWidth: 2,
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                          },
                          padding: 20,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0,0,0,0.05)",
                        },
                        ticks: {
                          font: {
                            size: 11,
                          },
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          font: {
                            size: 11,
                            weight: "bold",
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Emission Distribution Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <PieChartIcon className="text-purple-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Emission Distribution
                  </h3>
                  <p className="text-gray-600 text-sm">Breakdown by category</p>
                </div>
              </div>
              <div className="h-64">
                <Doughnut
                  key="emission-doughnut-chart"
                  data={{
                    labels: Object.keys(emission).map((label) =>
                      label
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase()),
                    ),
                    datasets: [
                      {
                        data: Object.values(emission),
                        backgroundColor: [
                          "rgba(255, 95, 207, 0.8)",
                          "rgba(153, 41, 234, 0.8)",
                          "rgba(228, 255, 48, 0.8)",
                          "rgba(77, 255, 190, 0.8)",
                          "rgba(56, 229, 77, 0.8)",
                          "rgba(249, 7, 22, 0.8)",
                        ],
                        borderColor: [
                          "rgb(255, 95, 207)",
                          "rgb(153, 41, 234)",
                          "rgb(228, 255, 48)",
                          "rgb(77, 255, 190)",
                          "rgb(56, 229, 77)",
                          "rgb(249, 7, 22)",
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          font: {
                            size: 11,
                            family: "'Inter', sans-serif",
                          },
                          padding: 15,
                          usePointStyle: true,
                          pointStyle: "circle",
                        },
                      },
                    },
                    cutout: "65%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Trend Analysis Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Emission Trends
                </h3>
                <p className="text-gray-600 text-sm">
                  Category-wise progression analysis
                </p>
              </div>
            </div>
            <div className="h-72">
              <Line
                key="emission-line-chart"
                data={{
                  labels: Object.keys(emission).map((label) =>
                    label
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase()),
                  ),
                  datasets: [
                    {
                      label: "kg CO₂e",
                      data: Object.values(emission),
                      borderColor: "rgb(16, 185, 129)",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      borderWidth: 3,
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: "rgb(16, 185, 129)",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      titleColor: "#1f2937",
                      bodyColor: "#4b5563",
                      borderColor: "#d1d5db",
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0,0,0,0.05)",
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                      },
                    },
                    x: {
                      grid: {
                        color: "rgba(0,0,0,0.05)",
                      },
                      ticks: {
                        font: {
                          size: 11,
                          weight: "bold",
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto mt-12 text-center">
        <p className="text-gray-500 text-sm">
          💡 Tip: Regular tracking helps identify patterns and opportunities for
          reducing your carbon footprint
        </p>
      </div>
    </div>
  );
};

export default Profile;
