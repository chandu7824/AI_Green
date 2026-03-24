import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { transporter } from "../config/mailer.js";
import { User } from "../models/User.js";
import { vfyCodeCache } from "../utils/vfyCodeCache.js";

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, userName, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      userName,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Account created sucessfully 😄. Redirecting to login page in ",
      type: "account_created",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was a server issue. Please try again... 😞",
      type: "account_created",
    });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { userName } = req.query;
    const user = await User.findOne({ userName });
    res.json({ exists: !!user });
  } catch {
    res.json({
      error:
        "There was a problem connecting to database...... Please try again",
    });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const eMail = await User.findOne({ email });
    res.json({ exists: !!eMail });
  } catch {
    res.json({ error: "There was a server issue.... Please try again" });
  }
};

export const sendCode = async (req, res) => {
  try {
    const { email, firstName = "", lastName = "", type } = req.body;

    if (!email || !type)
      return res.json({ success: false, message: "Invalid request" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    vfyCodeCache.set(`${type}:${email}`, code, 300);

    let subject = "";
    let html = "";

    if (type === "VERIFY_EMAIL") {
      subject = "Verify your Email - AI_GREEN_ADVISOR";
      html = `
        <div style="font-family:Arial;padding:20px;">
          <h2>Welcome to Carbon Footprint Tracker</h2>
          <p>Hi <b>${firstName} ${lastName}</b>,</p>
          <p>Your email verification code is:</p>
          <h1 style="color:#27ae60">${code}</h1>
          <p>This code is valid for 5 minutes.</p>
        </div>`;
    }

    if (type === "FORGOT_PASSWORD") {
      subject = "Reset Your Password - AI_GREEN_ADVISOR";
      html = `
        <div style="font-family:Arial;padding:20px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Your reset code is:</p>
          <h1 style="color:#e67e22">${code}</h1>
          <p>If you didn’t request this, ignore this email.</p>
        </div>`;
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html,
    });

    res.json({
      success: true,
      message: "Verification code sent successfully",
      type,
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to send email" });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code, type } = req.body;
    const storedVfyCode = await vfyCodeCache.get(`${type}:${email}`);
    if (!storedVfyCode)
      return res.json({
        success: false,
        message: "Verfication has expired or Not found.",
        type: "code_verification",
      });

    if (storedVfyCode === code) {
      vfyCodeCache.del(email);
      return res.json({
        success: true,
        message: "Verification Successful. Your email verified successfully.",
        type: "code_verification",
      });
    }
    res.json({ success: false, message: "Invalid Verification Code" });
  } catch {
    res.json({
      success: false,
      message: "There was a server issue. Please try again...",
      type: "code_verification",
    });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;
  console.log(identifier, password);

  const user = await User.findOne({
    $or: [{ email: identifier }, { userName: identifier }],
  });

  if (!user)
    return res.status(404).json({
      success: false,
      message: "User not found. Please Check the username or email.",
    });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res
      .status(401)
      .json({ success: false, message: "Invalid Password." });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, message: "Login Successful 😄", accessToken });
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res.sendStatus(204);
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(403);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN);

    const user = await User.findById(decoded.id);
    if (!user) return res.sendStatus(403);

    if (user.refreshToken !== refreshToken) res.sendStatus(403);

    const newAccessToken = generateAccessToken({
      id: user._id,
      userName: user.userName,
      email: user.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.sendStatus(403);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.json({
        success: false,
        message: "Invalid Request",
        type: "FORGOT_PASSWORD",
      });

    const user = await User.findOne({ email });

    if (!user)
      return res.json({
        success: false,
        message: "Email not found or Registered",
        type: "FORGOT_PASSWORD",
      });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password Updated Successfully. Redirecting to Login Page",
      type: "UPDATED_PASSWORD",
    });
  } catch {
    return res.json({
      success: false,
      message: "Unable to process the request.",
      type: "UPDATED_PASSWORD",
    });
  }
};
