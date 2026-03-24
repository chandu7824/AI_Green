import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import Popup from "../components/Popup";
import Loading from "../components/Loading";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "../styles/Signup.css";
import axiosAPI from "../api/axios";

const signupSchema = yup.object().shape({
  firstName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Name cannot contain numbers")
    .required("This field cannot be empty"),
  lastName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Name cannot contain numbers")
    .required("This field cannot be empty"),
  email: yup
    .string()
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?:\.[A-Z]{2,})*$/i,
      "Invalid email format",
    )
    .trim()
    .required("This field is required")
    .test("unique-email", "Email already exists", async function (email) {
      if (!email) return false;
      try {
        const res = await axiosAPI.get(
          `/api/auth/check-email?email=${encodeURIComponent(email)}`,
        );
        const data = res.data;
        if (data.error) {
          return this.createError({
            message: "There was a server issue. Try again.",
          });
        }
        return !data.exists;
      } catch {
        return this.createError({ message: "Unable to connect. Try again." });
      }
    }),
  code: yup
    .number()
    .typeError("Code must be number")
    .required("This field is required"),
  userName: yup
    .string()
    .required("Username required")
    .test(
      "unique-username",
      "Username already exists",
      async function (userName) {
        if (!userName) return false;
        if (userName.trim() === "")
          return this.createError({ message: "Username should be something." });
        try {
          const res = await axiosAPI.get(
            `/api/auth/check-username?userName=${encodeURIComponent(userName)}`,
          );
          const data = res.data;
          if (data.error) {
            return this.createError({
              message: data.error,
            });
          }
          return !data.exists;
        } catch {
          return this.createError({ message: "Unable to connect. Try again." });
        }
      },
    ),
  password: yup
    .string()
    .required("Please create your password")
    .min(8, "Should contain atleast 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[!@#$%^&*()\-_=+{};:,<.>]/, "Must contain a special character"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password doesnot match")
    .required("Please confirm your password"),
});

function Signup() {
  const [popupMessage, setPopupMessage] = useState({
    success: "",
    message: "",
    type: "",
  });
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendAvailability, setResendAvailability] = useState(false);

  useEffect(() => {
    if (!resendAvailability) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setResendAvailability(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    if (resendTimer === 0) {
      setResendAvailability(false);
      setResendTimer(60);
    }

    return () => clearInterval(timer);
  }, [resendTimer, resendAvailability]);

  const sendDetails = async ({
    firstName,
    lastName,
    email,
    userName,
    password,
  }) => {
    setIsCreating(true);
    const res = await axiosAPI.post("/api/auth/signup", {
      firstName,
      lastName,
      email,
      userName,
      password,
    });
    const data = res.data;
    setIsCreating(false);
    setPopupMessage({
      success: data.success,
      message: data.message,
      type: data.type,
    });

    setTimeout(() => {
      setPopupMessage({ success: "", message: "", type: "" });
    }, 5000);
  };

  const sendVerificationCode = async (firstName, lastName, email) => {
    if (!firstName || !lastName) {
      setPopupMessage({
        success: false,
        message: "Please enter first and last name before verification",
      });
      return;
    }
    setSending(true);
    const res = await axiosAPI.post("/api/auth/send-code", {
      firstName,
      lastName,
      email,
      type: "VERIFY_EMAIL",
    });

    const data = res.data;

    if (data.success) setResendAvailability(true);

    setPopupMessage({
      success: data.success,
      message: data.message,
      type: data.type,
    });
    setSending(false);

    if (data.success) {
      setIsEmailVerified(false);
    }

    setTimeout(() => {
      setPopupMessage({ success: "", message: "", type: "" });
    }, 4000);
  };

  const verifyCode = async (email, code) => {
    const res = await axiosAPI.post("/api/auth/verify-code", {
      email,
      code,
      type: "VERIFY_EMAIL",
    });

    const data = res.data;

    setPopupMessage({
      success: data.success,
      message: data.message,
      type: data.type,
    });

    if (data.success) {
      setIsEmailVerified(true);
    }

    setTimeout(() => {
      setPopupMessage({ success: "", message: "", type: "" });
    }, 4000);
  };

  return (
    <>
      {popupMessage.success !== "" && (
        <Popup
          message={popupMessage.message}
          success={popupMessage.success}
          type={popupMessage.type}
          onClose={() =>
            setPopupMessage({ success: "", message: "", type: "" })
          }
        />
      )}{" "}
      <div className="w-full px-0 py-[40px] min-h-screen">
        {" "}
        <div className="mx-auto lg:w-[600px] md:w-[600px] sm:w-[600px] w-[350px] h-[1050px] rounded-2xl shadow-2xl py-[30px] overflow-hidden">
          {" "}
          <div className="flex flex-col gap-[10px] ">
            {" "}
            <div className="flex justify-center">
              {" "}
              <img src={logo} alt="logo" className="w-[40px] h-[40px]" />{" "}
              <p className="pt-[2px] pl-[10px] bg-gradient-to-r from-green-600 to-blue-500 text-2xl bg-clip-text text-transparent font-extrabold">
                AI Green Advisor{" "}
              </p>{" "}
            </div>{" "}
            <div className="flex justify-center">
              {" "}
              <p className="text-xl font-bold">Create Account</p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex flex-row relative lg:left-[60px] md:left-[60px] sm:left-[60px] left-[35px] w-full">
            {" "}
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                code: "",
                userName: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={signupSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={async (values) => {
                if (!isEmailVerified) {
                  setPopupMessage({
                    success: false,
                    message: "Please verify your email first",
                  });
                  return;
                }
                await sendDetails(values);
              }}
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form className="w-full">
                  <div>
                    <div className="flex flex-col">
                      <label>FirstName</label>
                      <Field
                        as="input"
                        name="firstName"
                        className="input"
                      ></Field>
                      {errors.firstName && touched.firstName && (
                        <p className="text-red-500">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label>LastName</label>
                      <Field
                        as="input"
                        name="lastName"
                        className="input"
                      ></Field>
                      {errors.lastName && touched.lastName && (
                        <p className="text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label>Email</label>
                      <div className="flex flex-col gap-4">
                        <Field
                          type="email"
                          name="email"
                          className="input"
                        ></Field>
                      </div>
                      {errors.email && touched.email && (
                        <p className="text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="btn w-[80%] ml-[20px] cursor-pointer"
                        onClick={() =>
                          sendVerificationCode(
                            values.firstName,
                            values.lastName,
                            values.email,
                          )
                        }
                        disabled={
                          !values.email ||
                          errors.email ||
                          isEmailVerified ||
                          sending ||
                          resendAvailability
                        }
                      >
                        {sending ? (
                          <div className="flex justify-center items-center gap-2">
                            <span>Sending</span>
                            <div className="circle"></div>
                          </div>
                        ) : (
                          "Send Code"
                        )}
                      </button>
                      {resendAvailability && !isEmailVerified && (
                        <div className="flex">
                          <p>
                            Request another code in:
                            <span className="ml-2 font-bold">
                              00:{resendTimer}s
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {values.email && !errors.email && (
                      <div>
                        <div className="flex flex-col mt-4">
                          <label>Enter the verification code</label>
                          <div className="flex items-center gap-4">
                            <Field
                              name="code"
                              as="input"
                              className="input"
                            ></Field>
                          </div>
                          {errors.code && touched.code && (
                            <p className="text-red-500">{errors.code}</p>
                          )}
                          {isEmailVerified && (
                            <p className="text-green-500 mt-2">
                              ✓ Email verified successfully!
                            </p>
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn w-[80%] ml-[20px]"
                            onClick={() =>
                              verifyCode(values.email, values.code)
                            }
                            disabled={!values.code || isEmailVerified}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col mt-4">
                      <label>Username</label>
                      <Field
                        name="userName"
                        as="input"
                        className="input"
                      ></Field>
                      {errors.userName && touched.userName && (
                        <p className="text-red-500">{errors.userName}</p>
                      )}
                    </div>

                    <div className="flex flex-col mt-4">
                      <label>Password</label>
                      <div className="relative">
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="input w-full"
                        ></Field>
                        <span
                          className=" absolute top-1/3 right-1/5 -translate-y-1/2 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </span>
                      </div>
                      {errors.password && touched.password && (
                        <p className="text-red-500">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex flex-col mt-4">
                      <label>Confirm Password</label>
                      <div className="relative">
                        <Field
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="input w-full"
                        ></Field>
                        <span
                          className="z-2 absolute top-1/3 right-1/5 -translate-y-1/2 cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </span>
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <p className="text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="relative top-[20px] btn btn-primary w-[80%]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating...." : "Create Account"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>{" "}
          <div className="relative top-[40px] flex justify-center">
            <p>Already have an account? </p>{" "}
            <span className="px-2">
              <Link to="/login">Login</Link>
            </span>
          </div>
        </div>{" "}
      </div>
      {isCreating && <Loading name="Creating Your Account 😄" />}
    </>
  );
}
export default Signup;
