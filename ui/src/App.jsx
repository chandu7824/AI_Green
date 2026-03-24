import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Landing from "../pages/Landing";
import Tracker from "../pages/Tracker";
import Home from "../pages/Home";
import ForgotPassword from "../pages/ForgotPassword";
import { Route, Routes, Link, useLocation, Outlet } from "react-router-dom";
import "../styles/App.css";
import greenLogo from "../assets/logo.png";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import Navbar from "../components/Navbar";
import Profile from "../pages/Profile";
import Footer from "../components/Footer";

export function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  const location = useLocation();

  const styles = {
    textDecoration: "none",
    color: "white",
  };

  return (
    <>
      {location.pathname === "/" && (
        <div>
          <nav className="fixed lg:block md:block sm:block hidden top-0 left-0 w-full h-[80px] bg-white/80 backdrop-blur-md border-b border-green-200/50 shadow-sm z-50">
            <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
              <div className="flex flex-row items-center justify-between h-full">
                {/* Logo Section */}
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <img
                      src={greenLogo}
                      alt="AI Green Advisor Logo"
                      className="h-8 w-8 object-contain filter brightness-0 invert"
                    />
                  </div>

                  <div className="flex-col flex">
                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      AI Green Advisor
                    </span>
                    <span className="text-xs text-gray-500 -mt-1">
                      Eco-Friendly AI Assistant
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
                    style={styles}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
                    style={styles}
                  >
                    Signup
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-60"></div>
          </nav>
          <nav className="fixed lg:hidden md:hidden sm:hidden block top-0 left-0 w-full lg:h-[80px] md:h-[80px] sm:h-[80px] h-[120px] bg-white/80 backdrop-blur-md border-b border-green-200/50 shadow-sm z-50">
            <div className="max-w-7xl mx-auto h-full px-8 py-2">
              <div className="flex flex-col items-center justify-between h-full">
                {/* Logo Section */}
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <img
                      src={greenLogo}
                      alt="AI Green Advisor Logo"
                      className="h-8 w-8 object-contain filter brightness-0 invert"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      AI Green Advisor
                    </span>
                    <span className="text-xs text-gray-500 -mt-1">
                      Eco-Friendly AI Assistant
                    </span>
                  </div>
                </div>

                {/* Buttons Section */}
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
                    style={styles}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
                    style={styles}
                  >
                    Signup
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-60"></div>
          </nav>
        </div>
      )}
      <div className={location.pathname === "/" ? "pt-[80px]" : ""}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Layout />}>
            <Route
              path="/tracker"
              element={
                <ProtectedRoute>
                  <Tracker />
                </ProtectedRoute>
              }
            />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />{" "}
                </ProtectedRoute>
              }
            />
            <Route />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
