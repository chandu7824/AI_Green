import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { atlasConnection } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import emissionRoutes from "./routes/emission.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api", emissionRoutes);

atlasConnection();

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

export default app;
