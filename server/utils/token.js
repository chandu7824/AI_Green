import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, userName: user.userName, email: user.email },
    process.env.ACCESS_SECRET_TOKEN,
    { expiresIn: "15m" },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id },
    process.env.REFRESH_SECRET_TOKEN,
    {
      expiresIn: "7d",
    },
  );
};
