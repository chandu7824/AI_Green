import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  userName: { type: String, unique: true, required: true },
  password: String,
  date: { type: Date, default: Date.now },
  refreshToken: { type: String },
});

export const User = mongoose.model("User", userSchema);
