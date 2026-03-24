import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();
  return (
    <>
      <style>
        {`.active{
              color: green;
              transform: scale(1.2);
          }
          .nav-item{
              text-decoration: none;
              color: black;
          }
          `}
      </style>
      <nav className="fixed z-[99] w-full h-[80px] shadow-2xl flex items-center p-6 bg-white">
        <div className="flex w-[75%] items-center">
          <img src={Logo} alt="logo" className="w-12 h-12" />
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent pl-4">
              AI Green Advisor
            </span>
            <span className="text-xs text-gray-500 -mt-1 pl-4">
              Eco-Friendly AI Assistant
            </span>
          </div>
        </div>
        <div className="w-[25%]">
          <ul className="flex gap-10 items-center justify-center list-none text-lg">
            <li>
              <Link
                to="/home"
                className={
                  location.pathname === "/home" ? "active" : "nav-item"
                }
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/tracker"
                className={
                  location.pathname === "/tracker" ? "active" : "nav-item"
                }
              >
                Tracker
              </Link>
            </li>
            <li className="list-none">
              <Link
                to="/profile"
                className={
                  location.pathname === "/profile" ? "active" : "nav-item"
                }
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
