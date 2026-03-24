import { useState } from "react";
import { Navigate, Link, replace } from "react-router-dom";
import login_image from "../assets/login_image.png";
import * as yup from "yup";
import { Formik, Field, Form } from "formik";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import Popup from "../components/Popup";
import { useAuth } from "../context/AuthContext";
import axiosAPI from "../api/axios.js";

const loginSchema = yup.object().shape({
  identifier: yup.string().required("Username or Password is required"),

  password: yup.string().required("Password is required"),
});

function Login() {
  const [redirect, setRedirect] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginPopup, setLoginPopup] = useState({
    success: "",
    message: "",
    type: "",
  });

  const [close, setClose] = useState(false);

  const { setAuthData } = useAuth();

  if (redirect) {
    return <Navigate to="/home" replace />;
  }

  const sendLoginDetails = async (values) => {
    try {
      setClose(false);
      setSubmitting(true);

      const { identifier, password } = values;
      console.log(values);

      const res = await axiosAPI.post("/api/auth/login", {
        identifier,
        password,
      });

      const data = res.data;

      if (data.success && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setAuthData(data.accessToken);
        setTimeout(() => {
          setRedirect(true);
        }, 2000);
      }

      setLoginPopup({
        success: data.success,
        message: data.message,
        type: "login",
      });
    } catch {
      setLoginPopup({
        success: false,
        message: "Network error. Please try again.",
        type: "login",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
            .circle{
                height: 25px;
                width: 25px;
                border: 4px solid black;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin{
                from{
                    transform: rotate(0deg);
                } to {
                    transform: rotate(360deg);
                }
            }

            .popup{
              animation: rise 1s cubic-bezier(.15,1.15,.3,1);
            }

            @keyframes rise{
              from{
                transform: translateY(-50px)
              } to {
                  transform: translateY(0)
              }
            }
        `}
      </style>
      <div className="flex flex-col items-center justify-center h-screen">
        {loginPopup.success === false && !close && (
          <div className="popup h-[50px] w-[450px] bg-white-200 rounded-xl shadow-2xl flex justify-center items-center gap-4 border-1 border-red-300 z-[999] absolute top-8">
            <div className="pt-[15px]">
              <p>{loginPopup.message}</p>
            </div>
            <div
              className="border-2 border-red-300 cursor-pointer"
              onClick={() => setClose(true)}
            >
              <CloseIcon className="text-red-500" />
            </div>
          </div>
        )}
        <div className="flex h-auto w-[55%] bg-white-500 shadow-2xl rounded-lg p-20">
          <div className="flex flex-col py-12 gap-[10px] w-[60%] items-center">
            <p className="font-bold text-[50px]">Welcome</p>
            <Formik
              initialValues={{ identifier: "", password: "" }}
              validationSchema={loginSchema}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={async (values) => {
                await sendLoginDetails(values);
              }}
            >
              {({ values, errors, touched, isSubmitting }) => {
                return (
                  <Form className="w-full font-bold">
                    <div className="flex flex-col">
                      <div className="flex flex-col relative left-14 mb-[40px]">
                        <div className="flex items-center justify-center absolute left-[-10px] z-[50] w-[50px] h-[50px] rounded-4xl bg-blue-300 shadow-2xl">
                          <PersonIcon sx={{ fontSize: 30 }} />
                        </div>
                        <Field
                          type="input"
                          name="identifier"
                          placeholder="Username Or Email"
                          className="border-2 rounded-4xl w-[70%] h-[50px] relative left-0 px-16 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        ></Field>
                        {errors.identifier && touched.identifier && (
                          <p className="text-red-500 relative left-12">
                            {errors.identifier}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col relative left-14 mb-[20px]">
                        <div className="flex">
                          <Field
                            type={showLoginPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            className="border-2 rounded-4xl w-[70%] h-[50px] relative left-0 px-6 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          ></Field>
                          <div
                            className="flex items-center justify-center relative right-10 z-[50] w-[50px] h-[50px] rounded-4xl bg-blue-300 shadow-2xl cursor-pointer"
                            onClick={() =>
                              setShowLoginPassword(!showLoginPassword)
                            }
                          >
                            {showLoginPassword ? (
                              <VisibilityOffIcon sx={{ fontSize: 25 }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 25 }} />
                            )}
                          </div>
                        </div>
                        {errors.password && touched.password && (
                          <p className="text-red-500 relative left-6">
                            {errors.password}
                          </p>
                        )}
                      </div>
                      <div className="flex relative left-5/9 w-[200px] mb-[30px]">
                        <Link to="/forgotPassword">Forgot Password?</Link>
                      </div>
                      <button
                        type="submit"
                        className="btn w-[70%] h-[50px] !rounded-4xl relative left-14 !font-bold !text-[19px]"
                        disabled={isSubmitting}
                      >
                        {submitting ? (
                          <div className="circle relative left-1/2"></div>
                        ) : (
                          "Login"
                        )}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
          <div className="flex flex-col gap-8 items-center relative top-22 overflow-hidden">
            <img src={login_image} alt="logo" className="h-[260px] w-[280px]" />
            <Link to="/signup">Don't have an account?</Link>
          </div>
        </div>
      </div>
      {loginPopup.success !== "" && loginPopup.success === true && (
        <Popup
          message={loginPopup.message}
          success={loginPopup.success}
          type={loginPopup.type}
          onClose={() => setLoginPopup({ message: "", success: "", type: "" })}
        />
      )}
    </>
  );
}

export default Login;
