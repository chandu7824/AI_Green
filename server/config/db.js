import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.ATLAS_URI;

export const atlasConnection = () => {
  if (!mongoURI) console.log("Missing the atlas uri string.");
  mongoose
    .connect(mongoURI)
    .then(() => console.log("Mongodb connected successfully"))
    .catch((err) => console.log("Connection Error: ", err));
};
