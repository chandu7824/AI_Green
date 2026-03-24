import { useContext, createContext, useState, useEffect } from "react";
import Loading from "../components/Loading";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [emissionData, setEmissionData] = useState(null);

  const setAuthData = (token) => {
    setAccessToken(token);

    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);
      setUserName(decoded.userName);
      setEmail(decoded.email);
    } else {
      setUserName(null);
    }
  };

  const setEmissionDataFn = (machineData) => {
    if (!machineData) {
      console.log("Failed to get the emission data");
    }

    setEmissionData(machineData);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.post("/refresh-token");

        setAuthData(res.data.accessToken);
      } catch (err) {
        if (err.response?.status === 403) {
          setAuthData(null);
        } else {
          console.error("Session restore error:", err);
          setAuthData(null);
        }
      } finally {
        setLoading(false);
      }
    };
    if (localStorage.getItem("token")) {
      restoreSession();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <AuthContext.Provider
        value={{
          accessToken,
          userName,
          email,
          loading,
          setAuthData,
          emissionData,
          setEmissionDataFn,
        }}
      >
        {loading ? <Loading name="Loading..." /> : children}
      </AuthContext.Provider>
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
