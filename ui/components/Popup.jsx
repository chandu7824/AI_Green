import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Popup({ message, success, type }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(3);

  useEffect(() => {
    setTime(3);
  }, [type]);

  useEffect(() => {
    if (!success || (type !== "account_created" && type !== "UPDATE_PASSWORD"))
      return;

    if (time === 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [type, success, time, navigate]);

  return (
    <>
      <style>{`
            .popup{
                animation: rise 4s ease forwards;
            }

            @keyframes rise{
                0%{
                    transform: translateY(50px) scale(0.95);
                    opacity: 0;
                }
                20%{
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }  
                80% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                99% {
                    transform: translateY(-50px) scale(0.95);
                    opacity: 0;
                }
                100% {
                  transform: translateY(50px) scale(0.95);
                  opacity: 0;
                }
            }
          `}</style>
      <div
        className="popup min-h-[100px] w-[450px] flex items-center justify-start px-6
                    fixed top-8 left-1/2 -translate-x-1/2 
                    rounded-xl border-2 bg-white shadow-2xl z-[9999]
                    backdrop-blur-sm bg-white/95"
        style={{
          color: success ? "green" : "red",
          borderColor: success
            ? "rgba(34, 197, 94, 0.2)"
            : "rgba(239, 68, 68, 0.2)",
          boxShadow: success
            ? "0 20px 60px rgba(34, 197, 94, 0.15), 0 10px 30px rgba(34, 197, 94, 0.1)"
            : "0 20px 60px rgba(239, 68, 68, 0.15), 0 10px 30px rgba(239, 68, 68, 0.1)",
        }}
      >
        <div className="flex items-center justify-center">
          {success ? (
            <CheckCircleIcon
              className="text-5xl mr-4"
              style={{
                filter: "drop-shadow(0 4px 6px rgba(34, 197, 94, 0.3))",
              }}
            />
          ) : (
            <CancelIcon
              className="text-5xl mr-4"
              style={{
                filter: "drop-shadow(0 4px 6px rgba(239, 68, 68, 0.3))",
              }}
            />
          )}
          <div className="flex flex-col">
            <div className="text-xl font-semibold tracking-tight">
              {message}
            </div>
            {type === "account_created" && success && (
              <div className="text-sm font-medium opacity-80 mt-1">
                Redirecting to login in{" "}
                <span className="font-bold">{time}s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Popup;
